import os
import itertools
from typing import List, Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F
from timm.models.layers import SqueezeExcite
from timm.models.registry import register_model

try:
    from .ska import SKA
except Exception:
    from ska import SKA


class Conv2d_BN(nn.Sequential):
    def __init__(self, a, b, ks=1, stride=1, pad=0, dilation=1, groups=1, bn_weight_init=1.0):
        super().__init__()
        self.add_module("c", nn.Conv2d(a, b, ks, stride, pad, dilation, groups=groups, bias=False))
        self.add_module("bn", nn.BatchNorm2d(b))
        nn.init.constant_(self.bn.weight, bn_weight_init)
        nn.init.constant_(self.bn.bias, 0.0)


class Residual(nn.Module):
    def __init__(self, m, drop=0.0):
        super().__init__()
        self.m = m
        self.drop = drop

    def forward(self, x):
        if self.training and self.drop > 0:
            keep = torch.rand(x.size(0), 1, 1, 1, device=x.device).ge_(self.drop).div(1 - self.drop).detach()
            return x + self.m(x) * keep
        return x + self.m(x)


class FFN(nn.Module):
    def __init__(self, ed, h):
        super().__init__()
        self.pw1 = Conv2d_BN(ed, h)
        self.act = nn.ReLU(inplace=True)
        self.pw2 = Conv2d_BN(h, ed, bn_weight_init=0)

    def forward(self, x):
        return self.pw2(self.act(self.pw1(x)))


class Attention(nn.Module):
    def __init__(self, dim, key_dim, num_heads=8, attn_ratio=4, resolution=14):
        super().__init__()
        self.num_heads = num_heads
        self.scale = key_dim ** -0.5
        self.nh_kd = key_dim * num_heads
        self.dh = int(attn_ratio * key_dim) * num_heads
        self.qkv = Conv2d_BN(dim, self.dh + self.nh_kd * 2, ks=1)
        self.proj = nn.Sequential(nn.ReLU(inplace=True), Conv2d_BN(self.dh, dim, bn_weight_init=0))
        self.dw = Conv2d_BN(self.nh_kd, self.nh_kd, 3, 1, 1, groups=self.nh_kd)
        points = list(itertools.product(range(resolution), range(resolution)))
        offsets, idxs = {}, []
        for p1 in points:
            for p2 in points:
                off = (abs(p1[0] - p2[0]), abs(p1[1] - p2[1]))
                if off not in offsets:
                    offsets[off] = len(offsets)
                idxs.append(offsets[off])
        n = len(points)
        self.attention_biases = nn.Parameter(torch.zeros(num_heads, len(offsets)))
        self.register_buffer("attention_bias_idxs", torch.LongTensor(idxs).view(n, n), persistent=False)

    @torch.no_grad()
    def train(self, mode=True):
        super().train(mode)
        if mode and hasattr(self, "ab"):
            del self.ab
        elif not mode:
            self.ab = self.attention_biases[:, self.attention_bias_idxs]
        return self

    def forward(self, x):
        b, _, h, w = x.shape
        n = h * w
        qkv = self.qkv(x)
        q, k, v = qkv.split([self.nh_kd, self.nh_kd, self.dh], dim=1)
        q = self.dw(q)
        q = q.view(b, self.num_heads, -1, n)
        k = k.view(b, self.num_heads, -1, n)
        v = v.view(b, self.num_heads, -1, n)
        bias = self.attention_biases[:, self.attention_bias_idxs] if self.training else self.ab
        attn = ((q.transpose(-2, -1) @ k) * self.scale + bias).softmax(dim=-1)
        out = (v @ attn.transpose(-2, -1)).reshape(b, -1, h, w)
        return self.proj(out)


class RepVGGDW(nn.Module):
    def __init__(self, ed):
        super().__init__()
        self.conv = Conv2d_BN(ed, ed, 3, 1, 1, groups=ed)
        self.conv1 = Conv2d_BN(ed, ed, 1, 1, 0, groups=ed)

    def forward(self, x):
        return self.conv(x) + self.conv1(x) + x


class LKP(nn.Module):
    def __init__(self, dim, lks, sks, groups):
        super().__init__()
        self.cv1 = Conv2d_BN(dim, dim // 2)
        self.act = nn.ReLU(inplace=True)
        self.cv2 = Conv2d_BN(dim // 2, dim // 2, ks=lks, pad=(lks - 1) // 2, groups=dim // 2)
        self.cv3 = Conv2d_BN(dim // 2, dim // 2)
        self.cv4 = nn.Conv2d(dim // 2, sks ** 2 * dim // groups, 1)
        self.norm = nn.GroupNorm(num_groups=dim // groups, num_channels=sks ** 2 * dim // groups)
        self.sks = sks
        self.groups = groups
        self.dim = dim

    def forward(self, x):
        x = self.act(self.cv3(self.cv2(self.act(self.cv1(x)))))
        w = self.norm(self.cv4(x))
        b, _, h, ww = w.shape
        return w.view(b, self.dim // self.groups, self.sks ** 2, h, ww)


class LSConv(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.lkp = LKP(dim, lks=7, sks=3, groups=8)
        self.ska = SKA()
        self.bn = nn.BatchNorm2d(dim)

    def forward(self, x):
        return self.bn(self.ska(x, self.lkp(x))) + x


class Block(nn.Module):
    def __init__(self, ed, kd, nh=8, ar=4, resolution=14, stage=-1, depth=-1):
        super().__init__()
        if depth % 2 == 0:
            self.mixer = RepVGGDW(ed)
            self.se = SqueezeExcite(ed, 0.25)
        else:
            self.se = nn.Identity()
            self.mixer = Residual(Attention(ed, kd, nh, ar, resolution=resolution)) if stage == 3 else LSConv(ed)
        self.ffn = Residual(FFN(ed, int(ed * 2)))

    def forward(self, x):
        return self.ffn(self.se(self.mixer(x)))


def _c1(x):
    return x if x.size(1) == 1 else x.mean(dim=1, keepdim=True)


def _c3(x):
    c = x.size(1)
    if c == 3:
        return x
    if c == 1:
        return x.repeat(1, 3, 1, 1)
    if c > 3:
        return x[:, :3]
    return torch.cat([x, x[:, :1].repeat(1, 3 - c, 1, 1)], dim=1)


class HaarDWT(nn.Module):
    def __init__(self):
        super().__init__()
        f = torch.tensor([
            [[0.5, 0.5], [0.5, 0.5]],
            [[-0.5, -0.5], [0.5, 0.5]],
            [[-0.5, 0.5], [-0.5, 0.5]],
            [[0.5, -0.5], [-0.5, 0.5]],
        ], dtype=torch.float32).unsqueeze(1)
        self.register_buffer("f", f, persistent=False)

    def forward(self, x):
        oh, ow = x.shape[-2:]
        ph, pw = oh % 2, ow % 2
        if ph or pw:
            x = F.pad(x, (0, pw, 0, ph), mode="reflect")
        b, c, _, _ = x.shape
        w = self.f.to(x.device, x.dtype).repeat(c, 1, 1, 1)
        y = F.conv2d(x, w, stride=2, groups=c)
        h2, w2 = y.shape[-2:]
        y = y.view(b, c, 4, h2, w2)
        ll, lh, hl, hh = y[:, :, 0], y[:, :, 1], y[:, :, 2], y[:, :, 3]
        sz = (oh, ow)
        ll = F.interpolate(ll, size=sz, mode="bilinear", align_corners=False)
        lh = F.interpolate(lh, size=sz, mode="bilinear", align_corners=False)
        hl = F.interpolate(hl, size=sz, mode="bilinear", align_corners=False)
        hh = F.interpolate(hh, size=sz, mode="bilinear", align_corners=False)
        return ll, torch.cat([lh, hl, hh], dim=1)


class thermalH(nn.Module):
    def __init__(self, median_ks=3, init_sigma1=1.0, init_sigma2=2.0, init_ratio=0.5, init_thresh=0.3):
        super().__init__()
        self.median_ks = median_ks
        self.log_sigma1 = nn.Parameter(torch.log(torch.tensor(init_sigma1)))
        self.log_sigma2 = nn.Parameter(torch.log(torch.tensor(init_sigma2)))
        self.ratio = nn.Parameter(torch.tensor(init_ratio))
        self.thresh = nn.Parameter(torch.tensor(init_thresh))
        self.channel_weights = nn.Parameter(torch.ones(3, 1, 1) / 3.0)
        self.register_buffer("kx", torch.tensor([[[[-1.0, 0.0, 1.0]]]], dtype=torch.float32), persistent=False)
        self.register_buffer("ky", torch.tensor([[[[-1.0], [0.0], [1.0]]]], dtype=torch.float32), persistent=False)
        self.feature_fusion = nn.Sequential(nn.Conv2d(3, 8, 3, padding=1), nn.ReLU(inplace=True), nn.Conv2d(8, 3, 1))

    def _median(self, x):
        if self.median_ks != 3:
            k = self.median_ks | 1
            w = torch.ones(1, 1, k, k, device=x.device, dtype=x.dtype)
            w = w / w.sum()
            return F.conv2d(x, w.repeat(x.size(1), 1, 1, 1), padding=k // 2, groups=x.size(1))
        xpad = F.pad(x, (1, 1, 1, 1), mode="reflect")
        nei = [xpad[:, :, i:i + x.shape[2], j:j + x.shape[3]] for i in range(3) for j in range(3) if (i, j) != (1, 1)]
        nei = torch.stack(nei, dim=-1)
        s, _ = torch.sort(nei, dim=-1)
        return s[..., 3:6].mean(dim=-1)

    def _gauss(self, x, logs):
        sigma = torch.exp(logs).clamp(0.3, 5.0)
        k = int((2 * torch.ceil(3 * sigma) + 1).item())
        k = max(3, min(k + (k % 2 == 0), 15))
        c = k // 2
        g = torch.arange(k, dtype=x.dtype, device=x.device) - c
        yy, xx = torch.meshgrid(g, g, indexing="ij")
        ker = torch.exp(-(xx.pow(2) + yy.pow(2)) / (2 * sigma.pow(2) + 1e-6))
        ker = (ker / (ker.sum() + 1e-6)).unsqueeze(0).unsqueeze(0)
        return F.conv2d(x, ker.repeat(x.size(1), 1, 1, 1), padding=c, groups=x.size(1))

    def forward(self, x, target_size: Tuple[int, int]):
        x = _c3(x)
        w = F.softmax(self.channel_weights, dim=0).view(1, 3, 1, 1)
        gray = (x * w).sum(dim=1, keepdim=True)
        x = self._median(gray)
        x = x - x.mean(dim=[2, 3], keepdim=True)
        g1, g2 = self._gauss(x, self.log_sigma1), self._gauss(x, self.log_sigma2)
        dog = self.ratio.sigmoid() * g1 - (1 - self.ratio.sigmoid()) * g2
        dog = dog * torch.sigmoid(10.0 * (dog - self.thresh.sigmoid())) + 0.1 * dog
        kx, ky = self.kx.to(x.device, x.dtype), self.ky.to(x.device, x.dtype)
        gx = F.conv2d(x, kx.repeat(x.size(1), 1, 1, 1), padding=(0, 1), groups=x.size(1))
        gy = F.conv2d(x, ky.repeat(x.size(1), 1, 1, 1), padding=(1, 0), groups=x.size(1))
        gm = torch.sqrt(gx.pow(2) + gy.pow(2) + 1e-6)
        k = min(11, x.shape[2] // 4, x.shape[3] // 4) | 1
        contrast = torch.abs(x - F.avg_pool2d(x, k, stride=1, padding=k // 2))
        feat = self.feature_fusion(torch.cat([dog, gm, contrast], dim=1))
        if feat.shape[-2:] != target_size:
            feat = F.interpolate(feat, size=target_size, mode="bilinear", align_corners=False)
        return feat


class StageFusion(nn.Module):
    def __init__(self, c):
        super().__init__()
        h = max(c // 2, 16)
        self.dwt = HaarDWT()
        self.high_proj = nn.Sequential(nn.Conv2d(c * 3, c, 1, bias=False), nn.BatchNorm2d(c), nn.ReLU(inplace=True))
        self.depth_proj = nn.Sequential(nn.Conv2d(1, h, 3, padding=1, bias=False), nn.BatchNorm2d(h), nn.ReLU(inplace=True), nn.Conv2d(h, c, 1, bias=False), nn.BatchNorm2d(c))
        self.th = thermalH()
        self.thermal_proj = nn.Sequential(nn.Conv2d(3, h, 3, padding=1, bias=False), nn.BatchNorm2d(h), nn.ReLU(inplace=True), nn.Conv2d(h, c, 1, bias=False), nn.BatchNorm2d(c))
        self.low_gate = nn.Sequential(nn.Conv2d(c * 2, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU(inplace=True), nn.Conv2d(c, c, 1))
        self.high_gate = nn.Sequential(nn.Conv2d(c * 2, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU(inplace=True), nn.Conv2d(c, 2, 1))
        self.recon = nn.Sequential(nn.Conv2d(c * 2, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU(inplace=True), nn.Conv2d(c, c, 1, bias=False), nn.BatchNorm2d(c))
        self.alpha = nn.Parameter(torch.tensor(0.5))
        self.act = nn.ReLU(inplace=True)

    def forward(self, rgb_feat, depth_map, thermal_img):
        sz = rgb_feat.shape[-2:]
        low, high = self.dwt(rgb_feat)
        high = self.high_proj(high)
        depth = _c1(depth_map)
        if depth.shape[-2:] != sz:
            depth = F.interpolate(depth, size=sz, mode="bilinear", align_corners=False)
        depth_feat = self.depth_proj(depth)
        thermal = _c3(thermal_img)
        thermal_feat = self.thermal_proj(self.th(thermal, sz))
        g = torch.sigmoid(self.low_gate(torch.cat([low, depth_feat], dim=1)))
        low_f = g * low + (1 - g) * depth_feat
        hw = F.softmax(self.high_gate(torch.cat([high, thermal_feat], dim=1)), dim=1)
        high_f = hw[:, 0:1] * high + hw[:, 1:2] * thermal_feat
        fused = self.recon(torch.cat([low_f, high_f], dim=1))
        out = self.act(fused + self.alpha * rgb_feat)
        return out, low_f, high_f


class DecoderGuide(nn.Module):
    def __init__(self, c):
        super().__init__()
        h = max(c // 2, 16)
        self.dp = nn.Sequential(nn.Conv2d(1, h, 3, padding=1, bias=False), nn.BatchNorm2d(h), nn.ReLU(inplace=True), nn.Conv2d(h, c, 1, bias=False), nn.BatchNorm2d(c))
        self.tp = nn.Sequential(nn.Conv2d(3, h, 3, padding=1, bias=False), nn.BatchNorm2d(h), nn.ReLU(inplace=True), nn.Conv2d(h, c, 1, bias=False), nn.BatchNorm2d(c))
        self.gate = nn.Sequential(nn.Conv2d(c * 3, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU(inplace=True), nn.Conv2d(c, c, 1), nn.Sigmoid())
        self.beta = nn.Parameter(torch.tensor(0.1))

    def forward(self, x, depth, thermal):
        sz = x.shape[-2:]
        d = F.interpolate(_c1(depth), size=sz, mode="bilinear", align_corners=False)
        t = F.interpolate(_c3(thermal), size=sz, mode="bilinear", align_corners=False)
        d, t = self.dp(d), self.tp(t)
        g = self.gate(torch.cat([x, d, t], dim=1))
        return x + self.beta * g * (0.5 * (d + t))


class DFAM(nn.Module):
    def __init__(self, in_c, skip_c, out_c):
        super().__init__()
        self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=False)
        if skip_c > 0:
            a = in_c + skip_c
            self.t = nn.Sequential(nn.Conv2d(a, a, 3, padding=1, groups=a, bias=False), nn.Conv2d(a, out_c, 1, bias=False), nn.BatchNorm2d(out_c), nn.ReLU(inplace=True), nn.Conv2d(out_c, out_c, 3, padding=1, bias=False), nn.BatchNorm2d(out_c))
            self.s = nn.Sequential(nn.Conv2d(a, out_c, 1, bias=False), nn.BatchNorm2d(out_c), nn.ReLU(inplace=True), nn.Conv2d(out_c, out_c, 1, bias=False), nn.BatchNorm2d(out_c))
        else:
            self.t = nn.Sequential(nn.Conv2d(in_c, out_c, 3, padding=1, bias=False), nn.BatchNorm2d(out_c), nn.ReLU(inplace=True), nn.Conv2d(out_c, out_c, 3, padding=1, bias=False), nn.BatchNorm2d(out_c))
            self.s = nn.Sequential(nn.Conv2d(in_c, out_c, 1, bias=False), nn.BatchNorm2d(out_c), nn.ReLU(inplace=True), nn.Conv2d(out_c, out_c, 1, bias=False), nn.BatchNorm2d(out_c))
        self.g = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Conv2d(out_c * 2, 2, 1), nn.Softmax(dim=1))
        self.rw = nn.Parameter(torch.tensor(0.1))
        self.proj = nn.Conv2d(in_c, out_c, 1, bias=False) if in_c != out_c else nn.Identity()
        self.act = nn.ReLU(inplace=True)

    def forward(self, x, skip=None):
        x = self.up(x)
        if skip is not None and x.shape[-2:] != skip.shape[-2:]:
            skip = F.interpolate(skip, size=x.shape[-2:], mode="bilinear", align_corners=False)
        xc = torch.cat([x, skip], dim=1) if skip is not None else x
        t, s = self.t(xc), self.s(xc)
        w = self.g(torch.cat([t, s], dim=1))
        f = w[:, 0:1] * t + w[:, 1:2] * s
        return self.act(f + self.rw * self.proj(x))


class SATNetDecoder(nn.Module):
    def __init__(self, embed_dims=None, img_size=352, use_modal_decoder_fusion=False):
        super().__init__()
        if embed_dims is None:
            embed_dims = [64, 128, 256, 352]
        self.use_modal_decoder_fusion = use_modal_decoder_fusion
        self.dfam4 = DFAM(embed_dims[3], embed_dims[2], embed_dims[2])
        self.dfam3 = DFAM(embed_dims[2], embed_dims[1], embed_dims[1])
        self.dfam2 = DFAM(embed_dims[1], embed_dims[0], embed_dims[0])
        self.dfam1 = DFAM(embed_dims[0], 0, 32)
        self.final_up = nn.Sequential(nn.Upsample(scale_factor=4, mode="bilinear", align_corners=False), nn.Conv2d(32, 16, 3, padding=1, bias=False), nn.BatchNorm2d(16), nn.ReLU(inplace=True))
        self.final_conv = nn.Conv2d(16, 1, 3, padding=1)
        self.side = nn.ModuleList([nn.Conv2d(embed_dims[2], 1, 1), nn.Conv2d(embed_dims[1], 1, 1), nn.Conv2d(embed_dims[0], 1, 1)])
        if use_modal_decoder_fusion:
            self.guides = nn.ModuleList([DecoderGuide(embed_dims[2]), DecoderGuide(embed_dims[1]), DecoderGuide(embed_dims[0]), DecoderGuide(32)])
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1.0)
                nn.init.constant_(m.bias, 0.0)

    def forward(self, feats, input_size, depth_map=None, thermal_img=None):
        x1, x2, x3, x4 = feats
        d4 = self.dfam4(x4, x3)
        if self.use_modal_decoder_fusion and depth_map is not None and thermal_img is not None:
            d4 = self.guides[0](d4, depth_map, thermal_img)
        s4 = F.interpolate(self.side[0](d4), size=input_size, mode="bilinear", align_corners=False)
        d3 = self.dfam3(d4, x2)
        if self.use_modal_decoder_fusion and depth_map is not None and thermal_img is not None:
            d3 = self.guides[1](d3, depth_map, thermal_img)
        s3 = F.interpolate(self.side[1](d3), size=input_size, mode="bilinear", align_corners=False)
        d2 = self.dfam2(d3, x1)
        if self.use_modal_decoder_fusion and depth_map is not None and thermal_img is not None:
            d2 = self.guides[2](d2, depth_map, thermal_img)
        s2 = F.interpolate(self.side[2](d2), size=input_size, mode="bilinear", align_corners=False)
        d1 = self.dfam1(d2, None)
        if self.use_modal_decoder_fusion and depth_map is not None and thermal_img is not None:
            d1 = self.guides[3](d1, depth_map, thermal_img)
        main = self.final_conv(self.final_up(d1))
        return main, [s4, s3, s2]


class LSNet_SOD(nn.Module):
    def __init__(self, img_size=352, in_chans=3, embed_dim=None, key_dim=None, depth=None, num_heads=None, pretrained_path=None, use_modal_decoder_fusion=False):
        super().__init__()
        if embed_dim is None:
            embed_dim = [64, 128, 256, 352]
        if key_dim is None:
            key_dim = [16, 16, 16, 16]
        if depth is None:
            depth = [0, 2, 8, 10]
        if num_heads is None:
            num_heads = [3, 3, 3, 4]
        self.use_modal_decoder_fusion = use_modal_decoder_fusion
        self.patch_embed_rgb = nn.Sequential(
            Conv2d_BN(in_chans, embed_dim[0] // 4, 3, 2, 1), nn.ReLU(inplace=True),
            Conv2d_BN(embed_dim[0] // 4, embed_dim[0] // 2, 3, 2, 1), nn.ReLU(inplace=True),
            Conv2d_BN(embed_dim[0] // 2, embed_dim[0], 3, 2, 1)
        )
        self.fusions = nn.ModuleList([StageFusion(c) for c in embed_dim])
        resolution = img_size // 8
        ar = [embed_dim[i] / (key_dim[i] * num_heads[i]) for i in range(len(embed_dim))]
        self.blocks1, self.blocks2, self.blocks3, self.blocks4 = nn.Sequential(), nn.Sequential(), nn.Sequential(), nn.Sequential()
        blocks = [self.blocks1, self.blocks2, self.blocks3, self.blocks4]
        for i, (ed, kd, dpth, nh, a) in enumerate(zip(embed_dim, key_dim, depth, num_heads, ar)):
            for d in range(dpth):
                blocks[i].append(Block(ed, kd, nh, a, resolution, stage=i, depth=d))
            if i != len(depth) - 1:
                nxt = blocks[i + 1]
                resolution = (resolution - 1) // 2 + 1
                nxt.append(Conv2d_BN(embed_dim[i], embed_dim[i], ks=3, stride=2, pad=1, groups=embed_dim[i]))
                nxt.append(Conv2d_BN(embed_dim[i], embed_dim[i + 1], ks=1, stride=1, pad=0))
        self.decoder = SATNetDecoder(embed_dims=embed_dim, img_size=img_size, use_modal_decoder_fusion=use_modal_decoder_fusion)
        if pretrained_path is not None:
            self.load_pretrained(pretrained_path)

    def load_pretrained(self, checkpoint_path):
        if not os.path.exists(checkpoint_path):
            print(f"Warning: Pretrained path {checkpoint_path} not found. Training from scratch.")
            return
        ckpt = torch.load(checkpoint_path, map_location="cpu")
        sd = ckpt.get("state_dict", ckpt.get("model", ckpt))
        filtered = {}
        for k, v in sd.items():
            if any(s in k for s in ["decode_head", "final_upsample", "final_conv"]):
                continue
            filtered[k.replace("patch_embed", "patch_embed_rgb") if "patch_embed" in k and "patch_embed_rgb" not in k else k] = v
        md = self.state_dict()
        matched = {k: v for k, v in filtered.items() if k in md and md[k].shape == v.shape}
        md.update(matched)
        self.load_state_dict(md, strict=False)
        print(f"Loaded pretrained weights: {len(matched)}/{len(md)} layers")
        print("Skipped incompatible decoder/head/fusion parameters.")

    @torch.jit.ignore
    def no_weight_decay(self):
        return {k for k in self.state_dict().keys() if "attention_biases" in k}

    def forward(self, rgb, depth, thermal):
        input_size = rgb.shape[2:]
        x = self.patch_embed_rgb(rgb)
        x = self.blocks1(x)
        x1, _, _ = self.fusions[0](x, depth, thermal)
        x = self.blocks2(x1)
        x2, _, _ = self.fusions[1](x, depth, thermal)
        x = self.blocks3(x2)
        x3, _, _ = self.fusions[2](x, depth, thermal)
        x = self.blocks4(x3)
        x4, _, _ = self.fusions[3](x, depth, thermal)
        main, sides = self.decoder(
            [x1, x2, x3, x4],
            input_size,
            depth_map=depth if self.use_modal_decoder_fusion else None,
            thermal_img=thermal if self.use_modal_decoder_fusion else None,
        )
        return (main, sides) if self.training else main


@register_model
def lsnet_t_sod(pretrained=False, **kwargs):
    pretrained_path = kwargs.pop("pretrained_path", None)
    use_modal_decoder_fusion = kwargs.pop("use_modal_decoder_fusion", False)
    return LSNet_SOD(
        img_size=352,
        in_chans=3,
        embed_dim=[64, 128, 256, 352],
        key_dim=[16, 16, 16, 16],
        depth=[0, 2, 8, 10],
        num_heads=[2, 2, 4, 4],
        pretrained_path=pretrained_path,
        use_modal_decoder_fusion=use_modal_decoder_fusion,
        **kwargs,
    )


@register_model
def lsnet_b_sod(pretrained=False, **kwargs):
    pretrained_path = kwargs.pop("pretrained_path", None)
    use_modal_decoder_fusion = kwargs.pop("use_modal_decoder_fusion", False)
    return LSNet_SOD(
        img_size=224,
        in_chans=3,
        embed_dim=[128, 256, 384, 512],
        key_dim=[16, 16, 16, 16],
        depth=[4, 6, 8, 10],
        num_heads=[2, 2, 4, 4],
        pretrained_path=pretrained_path,
        use_modal_decoder_fusion=use_modal_decoder_fusion,
        **kwargs,
    )

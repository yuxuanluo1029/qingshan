from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

try:
    import torch
    from torchvision import transforms
    from torchvision.models import MobileNet_V3_Small_Weights, mobilenet_v3_small

    HAS_TORCH = True
except Exception:
    HAS_TORCH = False

_MODEL_CACHE: dict[str, Any] = {}


def load_image(path: Path) -> Image.Image:
    return Image.open(path).convert('RGB')


def rgb_hist_feature(image: Image.Image) -> np.ndarray:
    arr = np.asarray(image.resize((224, 224), Image.BILINEAR), dtype=np.float32)
    channels = [arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]]
    feats: list[np.ndarray] = []
    for channel in channels:
        hist, _ = np.histogram(channel, bins=24, range=(0, 255), density=True)
        feats.append(hist.astype(np.float32))

    gray = arr.mean(axis=2)
    gray_hist, _ = np.histogram(gray, bins=24, range=(0, 255), density=True)
    feats.append(gray_hist.astype(np.float32))

    gx = np.diff(gray, axis=1, prepend=gray[:, :1])
    gy = np.diff(gray, axis=0, prepend=gray[:1, :])
    grad = np.sqrt(gx * gx + gy * gy)
    grad_hist, _ = np.histogram(grad, bins=24, range=(0, 180), density=True)
    feats.append(grad_hist.astype(np.float32))

    vec = np.concatenate(feats).astype(np.float32)
    norm = float(np.linalg.norm(vec))
    if norm < 1e-6:
        return vec
    return vec / norm


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape:
        return 0.0
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom < 1e-6:
        return 0.0
    return float(np.dot(a, b) / denom)


def try_load_deep_model() -> tuple[Any, Any] | tuple[None, None]:
    if not HAS_TORCH:
        return None, None

    cache_key = 'mobilenet_v3_small_features'
    if cache_key in _MODEL_CACHE:
        return _MODEL_CACHE[cache_key]

    try:
        weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
        model = mobilenet_v3_small(weights=weights)
        feature_model = model.features.eval()
        preprocess = transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=weights.meta['mean'], std=weights.meta['std']),
            ]
        )
        _MODEL_CACHE[cache_key] = (feature_model, preprocess)
        return feature_model, preprocess
    except Exception:
        return None, None


def deep_feature(image: Image.Image) -> np.ndarray | None:
    feature_model, preprocess = try_load_deep_model()
    if feature_model is None or preprocess is None:
        return None

    try:
        tensor = preprocess(image).unsqueeze(0)
        with torch.no_grad():
            feat = feature_model(tensor)
            pooled = feat.mean(dim=(2, 3)).squeeze(0).cpu().numpy().astype(np.float32)
        norm = float(np.linalg.norm(pooled))
        if norm < 1e-6:
            return None
        return pooled / norm
    except Exception:
        return None


def try_mamba_saliency_crop(image: Image.Image, code_dir: str, weights_path: str, threshold: float = 0.38) -> tuple[Image.Image, bool]:
    if not code_dir:
        return image, False

    code_path = Path(code_dir)
    if not code_path.exists():
        return image, False

    if code_dir not in sys.path:
        sys.path.insert(0, code_dir)

    try:
        from demo_inference import load_model, predict_saliency
    except Exception:
        return image, False

    cache_key = f"{code_dir}|{weights_path}"
    if cache_key in _MODEL_CACHE:
        model, device = _MODEL_CACHE[cache_key]
    else:
        if not weights_path:
            candidate = code_path / 'model_best.pth'
            weights_path = str(candidate)
        model, device = load_model(weights_path, 'cpu')
        _MODEL_CACHE[cache_key] = (model, device)

    try:
        result = predict_saliency(
            model=model,
            device=device,
            rgb_image=image,
            thermal_image=None,
            depth_image=None,
            mode='single_compat',
            alpha=0.55,
            use_amp=False,
        )
    except Exception:
        return image, False

    mask_arr = np.asarray(result['mask_image'], dtype=np.uint8)
    ys, xs = np.where(mask_arr >= int(threshold * 255))
    if len(xs) < 20 or len(ys) < 20:
        return image, True

    x1 = int(xs.min())
    x2 = int(xs.max())
    y1 = int(ys.min())
    y2 = int(ys.max())

    w, h = image.size
    pad_x = int((x2 - x1 + 1) * 0.12)
    pad_y = int((y2 - y1 + 1) * 0.12)
    x1 = max(0, x1 - pad_x)
    x2 = min(w - 1, x2 + pad_x)
    y1 = max(0, y1 - pad_y)
    y2 = min(h - 1, y2 + pad_y)

    if x2 <= x1 or y2 <= y1:
        return image, True

    cropped = image.crop((x1, y1, x2 + 1, y2 + 1))
    return cropped, True


def blended_similarity(
    input_hist: np.ndarray,
    input_deep: np.ndarray | None,
    ref_hist: np.ndarray,
    ref_deep: np.ndarray | None,
) -> float:
    hist_score = cosine_similarity(input_hist, ref_hist)
    if input_deep is None or ref_deep is None:
        return hist_score

    deep_score = cosine_similarity(input_deep, ref_deep)
    # Visual semantics first, low-level texture/color second.
    return max(0.0, min(1.0, deep_score * 0.78 + hist_score * 0.22))


def main() -> None:
    parser = argparse.ArgumentParser(description='Image identify helper for Chengji encyclopedia.')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--candidates', required=True, help='Candidates json path')
    parser.add_argument('--output', required=True, help='Output json path')
    parser.add_argument('--mamba-code-dir', default=os.environ.get('MAMBA_CODE_DIR', ''), help='Optional Mamba code folder')
    parser.add_argument('--mamba-weights', default=os.environ.get('MAMBA_WEIGHTS_PATH', ''), help='Optional Mamba weights path')
    parser.add_argument('--topk', type=int, default=6)
    args = parser.parse_args()

    input_path = Path(args.input)
    candidates_path = Path(args.candidates)
    output_path = Path(args.output)

    candidates_raw = json.loads(candidates_path.read_text(encoding='utf-8'))
    if not isinstance(candidates_raw, list):
        raise RuntimeError('Invalid candidates file')

    source_image = load_image(input_path)
    processed_image, used_saliency = try_mamba_saliency_crop(source_image, args.mamba_code_dir, args.mamba_weights)
    input_hist = rgb_hist_feature(processed_image)
    input_deep = deep_feature(processed_image)

    scored = []
    for item in candidates_raw:
        if not isinstance(item, dict):
            continue
        image_path = Path(str(item.get('imagePath', '')))
        if not image_path.exists():
            continue
        try:
            ref_image = load_image(image_path)
            ref_hist = rgb_hist_feature(ref_image)
            ref_deep = deep_feature(ref_image)
        except Exception:
            continue

        score = blended_similarity(input_hist, input_deep, ref_hist, ref_deep)
        scored.append(
            {
                'id': item.get('id', ''),
                'title': item.get('title', ''),
                'city': item.get('city', ''),
                'category': item.get('category', ''),
                'summary': item.get('summary', ''),
                'sourceUrl': item.get('sourceUrl', ''),
                'image': item.get('image', ''),
                'score': round(max(0.0, min(1.0, score)), 4),
            }
        )

    scored.sort(key=lambda x: x['score'], reverse=True)

    result = {
        'usedSaliency': used_saliency,
        'usedDeepFeature': input_deep is not None,
        'matches': scored[: max(1, args.topk)],
    }
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, BookOpen, Camera, Heart, MapPin, Save, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { getErrorMessage } from '@/lib/api-client';
import { videoCategoryLabels, videoMap, type VideoCategory } from '@/data/videoCatalog';
import { toast } from 'sonner';

interface UserDashboardResponse {
  user: { id: string; username: string; role: string; createdAt?: string; avatarUrl?: string; region?: string };
  stats: {
    blogPosts: number;
    blogLikesReceived: number;
    favoriteVideos: number;
    likedVideos: number;
    reportedTasks: number;
    onChainRecords: number;
  };
  videoProfile: {
    likedVideoIds: string[];
    favoritedVideoIds: string[];
    preferredCategories: string[];
    viewedVideoIds: string[];
  };
}

interface ChainRecord {
  index: number;
  timestamp: string;
  hash: string;
  payload: Record<string, string>;
}

function toCategoryLabel(tag: string) {
  if (tag in videoCategoryLabels) {
    return videoCategoryLabels[tag as VideoCategory];
  }
  return tag;
}

function formatTime(value?: string) {
  if (!value) return '未知时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN');
}

async function compressImageToDataUrl(file: File): Promise<string> {
  const toDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });

  const originDataUrl = await toDataUrl();

  return await new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxEdge = 960;
      const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(originDataUrl);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    image.onerror = () => reject(new Error('图片解析失败'));
    image.src = originDataUrl;
  });
}

export default function UserCenter() {
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState<UserDashboardResponse | null>(null);
  const [records, setRecords] = useState<ChainRecord[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [region, setRegion] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    void load();
  }, [user?.id]);

  const load = async () => {
    if (!user?.id) return;
    try {
      const [profileRes, chainRes] = await Promise.all([
        apiClient.get(`/user/profile/${user.id}`),
        apiClient.get('/blockchain/records', { params: { userId: user.id, limit: 20 } }),
      ]);
      const data = profileRes.data?.data || null;
      setDashboard(data);
      setAvatarUrl(String(data?.user?.avatarUrl || ''));
      setRegion(String(data?.user?.region || ''));
      setRecords((chainRes.data?.data?.records || []) as ChainRecord[]);
    } catch (error) {
      toast.error(getErrorMessage(error) || '用户中心加载失败');
    }
  };

  const likedVideos = useMemo(
    () => (dashboard?.videoProfile?.likedVideoIds || []).map((id) => videoMap[id]).filter(Boolean),
    [dashboard?.videoProfile?.likedVideoIds],
  );

  const favoriteVideos = useMemo(
    () => (dashboard?.videoProfile?.favoritedVideoIds || []).map((id) => videoMap[id]).filter(Boolean),
    [dashboard?.videoProfile?.favoritedVideoIds],
  );

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    try {
      const next = await compressImageToDataUrl(file);
      setAvatarUrl(next);
      toast.success('头像已更新预览，记得保存');
    } catch (error) {
      toast.error(getErrorMessage(error) || '头像处理失败');
    }
  };

  const saveBaseProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);

    try {
      const res = await apiClient.put(`/user/profile/${user.id}/base`, {
        requesterId: user.id,
        avatarUrl,
        region,
      });
      const nextUser = res.data?.data?.user;
      if (nextUser) {
        updateUser({ avatarUrl: nextUser.avatarUrl, region: nextUser.region, username: nextUser.username });
        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                user: {
                  ...prev.user,
                  avatarUrl: nextUser.avatarUrl,
                  region: nextUser.region,
                  username: nextUser.username,
                },
              }
            : prev,
        );
      }
      toast.success('资料已保存，博客将同步展示你的头像和地区');
    } catch (error) {
      toast.error(getErrorMessage(error) || '资料保存失败');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!dashboard) {
    return (
      <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', color: '#7a5b46' }}>
        用户中心加载中...
      </div>
    );
  }

  const displayAvatar = avatarUrl || dashboard.user.avatarUrl || '';

  return (
    <div className="space-y-6 heritage-fade-in">
      <section
        className="heritage-hero rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 82% 14%, rgba(198,156,109,0.26), transparent 35%), linear-gradient(140deg, #241913 0%, #3b2a21 52%, #5e4434 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(245,227,205,0.86)' }}>
          用户管理中心
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#f4e7d8', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          用户管理
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 md:text-base" style={{ color: 'rgba(244,231,214,0.84)' }}>
          设置你的个人头像与地区标签，后续在博客发言中会自动展示，形成真实的文化交流身份信息。
        </p>
      </section>

      <section className="heritage-surface rounded-2xl p-5">
        <div className="grid gap-4 lg:grid-cols-[200px_1fr_auto] lg:items-end">
          <div className="flex flex-col items-center gap-2 rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.22)' }}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="用户头像" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-black"
                style={{ background: 'rgba(143,90,53,0.15)', color: '#7a4a2d' }}
              >
                {dashboard.user.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold"
              style={{ background: '#fff2df', color: '#8f5a35', border: '1px solid rgba(127,83,49,0.22)' }}
            >
              <Camera className="h-3.5 w-3.5" />
              上传头像
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void onPickAvatar(event.target.files?.[0])} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold" style={{ color: '#6f3f1f' }}>
                用户名
              </span>
              <input
                value={dashboard.user.username}
                disabled
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#f7efe3', border: '1px solid rgba(127,83,49,0.2)', color: '#8f5a35' }}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 flex items-center gap-1 font-semibold" style={{ color: '#6f3f1f' }}>
                <MapPin className="h-4 w-4" />
                地区
              </span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="例如：浙江·杭州"
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              />
            </label>
          </div>

          <button
            onClick={() => void saveBaseProfile()}
            disabled={savingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
          >
            <Save className="h-4 w-4" />
            {savingProfile ? '保存中...' : '保存资料'}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="heritage-surface rounded-2xl p-4">
          <p className="text-xs" style={{ color: '#8e613f' }}>
            账号
          </p>
          <h3 className="mt-1 text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            {dashboard.user.username}
          </h3>
          <p className="mt-1 text-sm" style={{ color: '#7a5b46' }}>
            地区：{dashboard.user.region || '未设置'}
          </p>
          <p className="text-xs" style={{ color: '#8e613f' }}>
            注册时间：{formatTime(dashboard.user.createdAt)}
          </p>
        </article>
        <article className="heritage-surface rounded-2xl p-4">
          <p className="text-xs" style={{ color: '#8e613f' }}>
            社区贡献
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {dashboard.stats.blogPosts} 篇博客
          </p>
          <p className="text-sm" style={{ color: '#7a5b46' }}>
            获赞 {dashboard.stats.blogLikesReceived}
          </p>
        </article>
        <article className="heritage-surface rounded-2xl p-4">
          <p className="text-xs" style={{ color: '#8e613f' }}>
            链上行为
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5f3920' }}>
            {dashboard.stats.onChainRecords} 条
          </p>
          <p className="text-sm" style={{ color: '#7a5b46' }}>
            工单提交 {dashboard.stats.reportedTasks}
          </p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="heritage-surface rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              点赞视频
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            {likedVideos.length === 0 && (
              <p className="text-sm" style={{ color: '#7a5b46' }}>
                你还没有点赞视频。
              </p>
            )}
            {likedVideos.map((video) => (
              <a
                key={video.id}
                href={video.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl p-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}
              >
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {toCategoryLabel(video.category)} · {video.city}
                </p>
                <p className="text-sm font-semibold" style={{ color: '#5f3920' }}>
                  {video.title}
                </p>
              </a>
            ))}
          </div>
        </article>

        <article className="heritage-surface rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              收藏视频
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            {favoriteVideos.length === 0 && (
              <p className="text-sm" style={{ color: '#7a5b46' }}>
                你还没有收藏视频。
              </p>
            )}
            {favoriteVideos.map((video) => (
              <a
                key={video.id}
                href={video.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl p-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}
              >
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {toCategoryLabel(video.category)} · {video.city}
                </p>
                <p className="text-sm font-semibold" style={{ color: '#5f3920' }}>
                  {video.title}
                </p>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className="heritage-surface rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4" style={{ color: '#8f5a35' }} />
          <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            文旅区块链记录
          </h3>
        </div>
        <div className="mt-3 space-y-2">
          {records.length === 0 && (
            <p className="text-sm" style={{ color: '#7a5b46' }}>
              暂无链上记录。
            </p>
          )}
          {records.map((item) => (
            <div key={item.hash} className="rounded-xl p-3" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}>
              <p className="text-xs" style={{ color: '#8e613f' }}>
                区块 #{item.index} · {new Date(item.timestamp).toLocaleString('zh-CN')}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: '#5f3920' }}>
                {(item.payload?.type || 'custom_action').toString()}
              </p>
              <p className="text-xs" style={{ color: '#7a5b46' }}>
                hash: {item.hash.slice(0, 20)}...
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="heritage-surface rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" style={{ color: '#8f5a35' }} />
          <h3 className="text-lg font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            推荐偏好标签
          </h3>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(dashboard.videoProfile.preferredCategories || []).map((tag) => (
            <span key={tag} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(143,90,53,0.12)', color: '#8f5a35' }}>
              {toCategoryLabel(tag)}
            </span>
          ))}
          {(dashboard.videoProfile.preferredCategories || []).length === 0 && (
            <p className="text-sm" style={{ color: '#7a5b46' }}>
              暂未设置偏好标签，可在“个性推荐”中选择。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

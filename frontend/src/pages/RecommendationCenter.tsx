import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Filter, Flame, Heart, PlayCircle, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { getErrorMessage } from '@/lib/api-client';
import {
  heritageVideos,
  videoCategories,
  videoCategoryLabels,
  videoMap,
  type HeritageVideo,
  type VideoCategory,
} from '@/data/videoCatalog';
import { toast } from 'sonner';

interface VideoProfile {
  userId: string;
  preferredCategories: string[];
  likedVideoIds: string[];
  favoritedVideoIds: string[];
  viewedVideoIds: string[];
  viewHistory: Array<{ videoId: string; city?: string; duration?: number; viewedAt: string }>;
}

function computeCategoryWeights(videoIds: string[], base: number) {
  const weights: Record<string, number> = {};
  videoIds.forEach((id) => {
    const video = videoMap[id];
    if (!video) return;
    weights[video.category] = (weights[video.category] || 0) + base;
  });
  return weights;
}

function mergeWeights(...list: Array<Record<string, number>>) {
  const merged: Record<string, number> = {};
  list.forEach((weights) => {
    Object.entries(weights).forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
  });
  return merged;
}

function getTopCity(history: VideoProfile['viewHistory']) {
  const count: Record<string, number> = {};
  history.forEach((item) => {
    const city = (item.city || '').trim();
    if (!city || city === '跨城') return;
    count[city] = (count[city] || 0) + 1;
  });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  return top?.[0] || '';
}

export default function RecommendationCenter() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VideoProfile | null>(null);
  const [savingPref, setSavingPref] = useState(false);
  const [runningActionIds, setRunningActionIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>(['treasure_voice', 'archaeology']);
  const [activeBrowseCategory, setActiveBrowseCategory] = useState<'all' | VideoCategory>('all');

  useEffect(() => {
    void loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(`/user/profile/${user.id}/video`);
      const next = res.data?.data?.profile as VideoProfile | undefined;
      if (!next) return;
      setProfile(next);
      if (Array.isArray(next.preferredCategories) && next.preferredCategories.length > 0) {
        setSelectedCategories(next.preferredCategories.filter((item): item is VideoCategory => videoCategories.includes(item as VideoCategory)));
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || '推荐信息加载失败');
    }
  };

  const recommendationList = useMemo(() => {
    const defaultProfile: VideoProfile = profile || {
      userId: user?.id || '',
      preferredCategories: [],
      likedVideoIds: [],
      favoritedVideoIds: [],
      viewedVideoIds: [],
      viewHistory: [],
    };

    const likedWeights = computeCategoryWeights(defaultProfile.likedVideoIds, 8);
    const favoredWeights = computeCategoryWeights(defaultProfile.favoritedVideoIds, 10);
    const viewedWeights = computeCategoryWeights(defaultProfile.viewedVideoIds, 3);
    const totalWeights = mergeWeights(likedWeights, favoredWeights, viewedWeights);
    const topCity = getTopCity(defaultProfile.viewHistory);

    return heritageVideos
      .map((video) => {
        let score = 45 + video.reliability * 8;
        if (selectedCategories.includes(video.category)) score += 22;
        if (defaultProfile.preferredCategories.includes(video.category)) score += 18;
        score += totalWeights[video.category] || 0;
        if (topCity && video.city === topCity) score += 6;
        if (defaultProfile.viewedVideoIds.includes(video.id)) score -= 5;
        return { ...video, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [profile, selectedCategories, user?.id]);

  const topPicks = useMemo(() => recommendationList.slice(0, 3), [recommendationList]);

  const browseList = useMemo(
    () => (activeBrowseCategory === 'all' ? recommendationList : recommendationList.filter((video) => video.category === activeBrowseCategory)),
    [activeBrowseCategory, recommendationList],
  );

  const toggleSelected = (category: VideoCategory) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]));
  };

  const savePreferences = async () => {
    if (!user?.id) return;
    setSavingPref(true);
    try {
      const res = await apiClient.put(`/user/profile/${user.id}/preferences`, {
        preferredCategories: selectedCategories,
      });
      const next = res.data?.data?.profile as VideoProfile | undefined;
      if (next) setProfile(next);
      toast.success('个性偏好已保存');
    } catch (error) {
      toast.error(getErrorMessage(error) || '偏好保存失败');
    } finally {
      setSavingPref(false);
    }
  };

  const runAction = async (videoId: string, action: 'like' | 'favorite') => {
    if (!user?.id) return;
    if (runningActionIds.includes(`${action}:${videoId}`)) return;

    setRunningActionIds((prev) => [...prev, `${action}:${videoId}`]);
    try {
      const res = await apiClient.post(`/videos/${videoId}/${action}`, {
        userId: user.id,
      });
      const next = res.data?.data?.profile as VideoProfile | undefined;
      if (next) setProfile(next);
    } catch (error) {
      toast.error(getErrorMessage(error) || '操作失败');
    } finally {
      setRunningActionIds((prev) => prev.filter((id) => id !== `${action}:${videoId}`));
    }
  };

  const openVideo = async (video: HeritageVideo) => {
    if (user?.id) {
      try {
        const res = await apiClient.post(`/videos/${video.id}/view`, {
          userId: user.id,
          city: video.city,
        });
        const next = res.data?.data?.profile as VideoProfile | undefined;
        if (next) setProfile(next);
      } catch {
        // ignore analytics failure
      }
    }
    window.open(video.link, '_blank', 'noopener,noreferrer');
  };

  const likedSet = new Set(profile?.likedVideoIds || []);
  const favoredSet = new Set(profile?.favoritedVideoIds || []);

  return (
    <div className="space-y-8 heritage-fade-in">
      <section className="relative overflow-hidden rounded-[30px] border border-[#7d6a56]/45 bg-[linear-gradient(130deg,#101823_0%,#162335_45%,#2a2435_100%)] p-6 shadow-[0_18px_40px_rgba(8,10,20,0.44)] md:p-8">
        {topPicks[0] && <img src={topPicks[0].cover} alt={topPicks[0].title} className="pointer-events-none absolute -right-8 top-6 h-44 w-44 rounded-full object-cover opacity-25 blur-[1px] home-float-slow" />}
        {topPicks[1] && <img src={topPicks[1].cover} alt={topPicks[1].title} className="pointer-events-none absolute bottom-6 right-24 h-24 w-24 rounded-full object-cover opacity-35 ring-2 ring-[#f2d5b080] home-float-fast" />}

        <p className="text-xs tracking-[0.36em] text-[#f0dcc1bc]">文化视频智能推荐</p>
        <h2 className="mt-3 text-3xl font-black text-[#fff2df] md:text-5xl" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          个性推荐
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#f2dec4d0] md:text-base">
          基于用户点赞、收藏、观看与偏好标签构建推荐分数，自动聚合与你关注方向最匹配的文物与历史文化视频。
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(238,208,173,0.3)', background: 'rgba(255,244,224,0.1)' }}>
            <p className="text-xs text-[#f2ddc2b3]">推荐池</p>
            <p className="mt-1 text-2xl font-black text-[#fff1dd]">{recommendationList.length}</p>
          </div>
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(238,208,173,0.3)', background: 'rgba(255,244,224,0.1)' }}>
            <p className="text-xs text-[#f2ddc2b3]">已点赞</p>
            <p className="mt-1 text-2xl font-black text-[#fff1dd]">{likedSet.size}</p>
          </div>
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(238,208,173,0.3)', background: 'rgba(255,244,224,0.1)' }}>
            <p className="text-xs text-[#f2ddc2b3]">已收藏</p>
            <p className="mt-1 text-2xl font-black text-[#fff1dd]">{favoredSet.size}</p>
          </div>
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: 'rgba(238,208,173,0.3)', background: 'rgba(255,244,224,0.1)' }}>
            <p className="text-xs text-[#f2ddc2b3]">偏好标签</p>
            <p className="mt-1 text-2xl font-black text-[#fff1dd]">{selectedCategories.length}</p>
          </div>
        </div>
      </section>

      <section className="heritage-surface rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            偏好标签管理
          </h3>
          <button
            onClick={() => void savePreferences()}
            disabled={savingPref}
            className="rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
          >
            {savingPref ? '保存中…' : '保存偏好'}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {videoCategories.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleSelected(category)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  background: active ? 'rgba(143,90,53,0.2)' : 'rgba(143,90,53,0.08)',
                  color: active ? '#6f3f1f' : '#8f5a35',
                  border: active ? '1px solid rgba(127,83,49,0.42)' : '1px solid rgba(127,83,49,0.2)',
                }}
              >
                {videoCategoryLabels[category]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4" style={{ color: '#8f5a35' }} />
          <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            推荐焦点
          </h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
          {topPicks[0] && (
            <article className="relative overflow-hidden rounded-2xl border border-[#7d634b3a] bg-[#101720] shadow-[0_14px_30px_rgba(8,11,19,0.34)]">
              <img src={topPicks[0].cover} alt={topPicks[0].title} className="h-[320px] w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_28%,rgba(9,12,20,0.82)_100%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs text-[#f1dbc0c8]">{topPicks[0].city} · {videoCategoryLabels[topPicks[0].category]}</p>
                <h4 className="mt-1 text-xl font-black text-[#fff1de]" style={{ fontFamily: "'Noto Serif SC', serif" }}>{topPicks[0].title}</h4>
                <p className="mt-1 text-xs text-[#e9d4b7c9]">推荐分 {Math.round(topPicks[0].score)} · 来源 {topPicks[0].source}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => void runAction(topPicks[0].id, 'like')}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: likedSet.has(topPicks[0].id) ? 'rgba(190,83,52,0.24)' : 'rgba(250,236,214,0.2)', color: '#ffe6c8' }}
                  >
                    <Heart className={`h-3.5 w-3.5 ${likedSet.has(topPicks[0].id) ? 'fill-current' : ''}`} />点赞
                  </button>
                  <button
                    onClick={() => void runAction(topPicks[0].id, 'favorite')}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: favoredSet.has(topPicks[0].id) ? 'rgba(210,158,66,0.26)' : 'rgba(250,236,214,0.2)', color: '#ffe6c8' }}
                  >
                    <Star className={`h-3.5 w-3.5 ${favoredSet.has(topPicks[0].id) ? 'fill-current' : ''}`} />收藏
                  </button>
                  <button
                    onClick={() => void openVideo(topPicks[0])}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: 'rgba(250,236,214,0.2)', color: '#ffe6c8' }}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />播放
                  </button>
                </div>
              </div>
            </article>
          )}

          {topPicks.slice(1).map((video) => (
            <article key={video.id} className="overflow-hidden rounded-2xl border border-[#8b70593a] bg-[#131b27] shadow-[0_14px_30px_rgba(8,11,19,0.28)]">
              <img src={video.cover} alt={video.title} className="h-[190px] w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-xs text-[#ecd9c1ba]">{video.city} · {videoCategoryLabels[video.category]}</p>
                <h4 className="mt-1 text-base font-bold text-[#fff0dc]" style={{ fontFamily: "'Noto Serif SC', serif" }}>{video.title}</h4>
                <p className="mt-1 text-xs text-[#dfcab0bd]">推荐分 {Math.round(video.score)}</p>
                <button
                  onClick={() => void openVideo(video)}
                  className="mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(244,215,184,0.2)', color: '#ffe6c8' }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />打开
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="heritage-surface rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: '#8f5a35' }} />
            <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
              分类浏览
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveBrowseCategory('all')}
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: activeBrowseCategory === 'all' ? 'rgba(143,90,53,0.2)' : 'rgba(143,90,53,0.08)',
                color: activeBrowseCategory === 'all' ? '#6f3f1f' : '#8f5a35',
              }}
            >
              全部
            </button>
            {videoCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveBrowseCategory(category)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: activeBrowseCategory === category ? 'rgba(143,90,53,0.2)' : 'rgba(143,90,53,0.08)',
                  color: activeBrowseCategory === category ? '#6f3f1f' : '#8f5a35',
                }}
              >
                {videoCategoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {browseList.map((video) => (
            <article
              key={video.id}
              className="heritage-card overflow-hidden rounded-2xl"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 10px 20px rgba(56,35,21,0.08)' }}
            >
              <img src={video.cover} alt={video.title} className="h-44 w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {video.city} · {videoCategoryLabels[video.category]} · {video.duration}
                </p>
                <h4 className="mt-1 text-base font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                  {video.title}
                </h4>
                <p className="mt-1 text-xs" style={{ color: '#8a6042' }}>
                  来源：{video.source}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => void runAction(video.id, 'like')}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: likedSet.has(video.id) ? 'rgba(190,83,52,0.14)' : 'rgba(143,90,53,0.1)',
                      color: likedSet.has(video.id) ? '#b94b2d' : '#8f5a35',
                    }}
                  >
                    <Heart className={`h-3.5 w-3.5 ${likedSet.has(video.id) ? 'fill-current' : ''}`} />点赞
                  </button>
                  <button
                    onClick={() => void runAction(video.id, 'favorite')}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: favoredSet.has(video.id) ? 'rgba(193,150,58,0.2)' : 'rgba(143,90,53,0.1)',
                      color: favoredSet.has(video.id) ? '#a27118' : '#8f5a35',
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 ${favoredSet.has(video.id) ? 'fill-current' : ''}`} />收藏
                  </button>
                  <button
                    onClick={() => void openVideo(video)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />打开
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#8a705641] bg-[linear-gradient(130deg,#111722,#1a2432_55%,#241f2e)] p-4 md:p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: '#f2d2ad' }} />
          <p className="text-sm text-[#f1deca]">当前推荐由用户行为数据实时更新，点赞和收藏会影响下一轮结果。</p>
        </div>
      </section>
    </div>
  );
}

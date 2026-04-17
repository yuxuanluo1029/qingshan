import { useEffect, useMemo, useState } from 'react';
import { Heart, ImagePlus, MapPin, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cities } from '@/data/mockData';
import apiClient, { getErrorMessage } from '@/lib/api-client';
import { toast } from 'sonner';

interface BlogComment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  userRegion?: string;
  content: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cityTag: string;
  column: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRegion?: string;
  imageUrl?: string;
  likedUserIds: string[];
  comments: BlogComment[];
  createdAt: string;
  updatedAt?: string;
}

const blogColumns = ['遗址考古', '建筑巡礼', '文物档案', '人物记忆', '城市更新', '城市随笔'] as const;
const BLOG_CACHE_KEY = 'chengji_blog_posts_cache_v1';
const BLOG_CACHE_LIMIT = 120;
const DATA_URL_CACHE_LIMIT = 120000;

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toCacheSafePost(post: BlogPost): BlogPost {
  const shouldDropDataUrl =
    typeof post.imageUrl === 'string' &&
    post.imageUrl.startsWith('data:image/') &&
    post.imageUrl.length > DATA_URL_CACHE_LIMIT;

  return {
    ...post,
    imageUrl: shouldDropDataUrl ? '' : post.imageUrl,
    comments: (post.comments || []).slice(-50),
  };
}

function readBlogCache(): BlogPost[] {
  try {
    const raw = localStorage.getItem(BLOG_CACHE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const posts: BlogPost[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const record = item as Record<string, unknown>;
      const id = normalizeString(record.id);
      const title = normalizeString(record.title);
      const content = normalizeString(record.content);
      const createdAt = normalizeString(record.createdAt);
      if (!id || !title || !createdAt) continue;

      const commentsRaw = Array.isArray(record.comments) ? record.comments : [];
      const comments: BlogComment[] = commentsRaw
        .filter((comment): comment is Record<string, unknown> => Boolean(comment) && typeof comment === 'object')
        .map((comment) => ({
          id: normalizeString(comment.id),
          userId: normalizeString(comment.userId),
          username: normalizeString(comment.username, '匿名用户'),
          userAvatar: normalizeString(comment.userAvatar),
          userRegion: normalizeString(comment.userRegion),
          content: normalizeString(comment.content),
          createdAt: normalizeString(comment.createdAt, createdAt),
        }))
        .filter((comment) => comment.id && comment.content);

      posts.push({
        id,
        title,
        content,
        cityTag: normalizeString(record.cityTag, '杭州'),
        column: normalizeString(record.column, '城市随笔'),
        authorId: normalizeString(record.authorId),
        authorName: normalizeString(record.authorName, '匿名用户'),
        authorAvatar: normalizeString(record.authorAvatar),
        authorRegion: normalizeString(record.authorRegion, '未设置'),
        imageUrl: normalizeString(record.imageUrl),
        likedUserIds: normalizeStringArray(record.likedUserIds),
        comments,
        createdAt,
        updatedAt: normalizeString(record.updatedAt, createdAt),
      });
    }

    return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function writeBlogCache(posts: BlogPost[]) {
  try {
    const payload = posts.slice(0, BLOG_CACHE_LIMIT).map(toCacheSafePost);
    localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures (quota exceeded, private mode, etc.)
  }
}

async function compressImageToDataUrl(file: File): Promise<string> {
  const loadAsDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });

  const originDataUrl = await loadAsDataUrl();

  return await new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxEdge = 1280;
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
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      resolve(compressed);
    };
    image.onerror = () => reject(new Error('图片解析失败'));
    image.src = originDataUrl;
  });
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />;
  }
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
      style={{ background: 'rgba(143,90,53,0.16)', color: '#7a4a2d' }}
    >
      {(name || 'U').slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheHydrated, setCacheHydrated] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cityTag, setCityTag] = useState(cities[0]?.name ?? '杭州');
  const [column, setColumn] = useState<(typeof blogColumns)[number]>('遗址考古');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [columnFilter, setColumnFilter] = useState<'全部' | (typeof blogColumns)[number]>('全部');
  const [keyword, setKeyword] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pendingLikeIds, setPendingLikeIds] = useState<string[]>([]);
  const [pendingCommentIds, setPendingCommentIds] = useState<string[]>([]);

  useEffect(() => {
    const cached = readBlogCache();
    if (cached.length > 0) {
      setPosts(cached);
    }
    setCacheHydrated(true);
    void loadPosts();
  }, []);

  useEffect(() => {
    if (!cacheHydrated) return;
    writeBlogCache(posts);
  }, [cacheHydrated, posts]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/blog/posts');
      const data = res.data?.data?.posts;
      const nextPosts = Array.isArray(data) ? data : [];
      setPosts(nextPosts);
      writeBlogCache(nextPosts);
    } catch (error) {
      const cached = readBlogCache();
      if (cached.length > 0) {
        setPosts((prev) => (prev.length > 0 ? prev : cached));
        toast.error('后端暂时不可用，已展示本地缓存内容');
      } else {
        toast.error(getErrorMessage(error) || '博客加载失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    const ordered = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const base = tab === 'mine' ? ordered.filter((post) => post.authorId === user?.id) : ordered;
    const scoped = columnFilter === '全部' ? base : base.filter((post) => post.column === columnFilter);
    if (!key) return scoped;
    return scoped.filter((post) => {
      return (
        post.title.toLowerCase().includes(key) ||
        post.content.toLowerCase().includes(key) ||
        post.authorName.toLowerCase().includes(key) ||
        post.cityTag.toLowerCase().includes(key)
      );
    });
  }, [columnFilter, keyword, posts, tab, user?.id]);

  const blogStats = useMemo(() => {
    const likes = posts.reduce((sum, post) => sum + (post.likedUserIds?.length || 0), 0);
    const comments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    return {
      posts: posts.length,
      likes,
      comments,
    };
  }, [posts]);

  const replacePost = (updated: BlogPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
  };

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    setUploadingImage(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImageUrl(dataUrl);
      toast.success('图片已就绪');
    } catch (error) {
      toast.error(getErrorMessage(error) || '图片处理失败');
    } finally {
      setUploadingImage(false);
    }
  };

  const publish = async () => {
    const safeTitle = title.trim();
    const safeContent = content.trim();

    if (!safeTitle) {
      toast.error('请填写标题');
      return;
    }

    if (safeContent.length < 10) {
      toast.error('内容至少 10 个字');
      return;
    }

    if (!user?.id) {
      toast.error('请先登录后发布');
      return;
    }

    setPublishing(true);
    try {
      const res = await apiClient.post('/blog/posts', {
        title: safeTitle,
        content: safeContent,
        cityTag,
        column,
        imageUrl,
        authorId: user.id,
        authorName: user.username,
      });

      const nextPost = res.data?.data?.post as BlogPost | undefined;
      if (!nextPost?.id) {
        toast.error('发布失败，请重试');
        return;
      }

      setPosts((prev) => [nextPost, ...prev]);
      setTitle('');
      setContent('');
      setImageUrl('');
      toast.success('发布成功');
    } catch (error) {
      toast.error(getErrorMessage(error) || '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!user?.id) return;

    try {
      await apiClient.delete(`/blog/posts/${id}`, {
        data: { requesterId: user.id },
      });
      setPosts((prev) => prev.filter((post) => post.id !== id));
      toast.success('已删除该条博客');
    } catch (error) {
      toast.error(getErrorMessage(error) || '删除失败');
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user?.id) {
      toast.error('请先登录后点赞');
      return;
    }

    if (pendingLikeIds.includes(postId)) return;

    setPendingLikeIds((prev) => [...prev, postId]);
    try {
      const res = await apiClient.post(`/blog/posts/${postId}/like`, { userId: user.id });
      const updated = res.data?.data?.post as BlogPost | undefined;
      if (updated?.id) {
        replacePost(updated);
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || '点赞失败');
    } finally {
      setPendingLikeIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  const submitComment = async (postId: string) => {
    const draft = commentDrafts[postId]?.trim() || '';
    if (!draft) {
      toast.error('评论不能为空');
      return;
    }

    if (!user?.id) {
      toast.error('请先登录后评论');
      return;
    }

    if (pendingCommentIds.includes(postId)) return;

    setPendingCommentIds((prev) => [...prev, postId]);
    try {
      const res = await apiClient.post(`/blog/posts/${postId}/comments`, {
        userId: user.id,
        username: user.username,
        content: draft,
      });

      const updated = res.data?.data?.post as BlogPost | undefined;
      if (updated?.id) {
        replacePost(updated);
        setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || '评论失败');
    } finally {
      setPendingCommentIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 86% 20%, rgba(215,162,108,0.24), transparent 34%), linear-gradient(130deg, #261913 0%, #402b20 50%, #69432f 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,229,200,0.8)' }}>
          CITY COLUMN BLOG
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff0dd', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          城迹博客
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,234,210,0.82)' }}>
          跨账号共享的文化交流广场，支持图文发布、点赞、评论与专栏筛选，形成可追溯的城市文化讨论场域。
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,245,232,0.12)', border: '1px solid rgba(255,245,232,0.22)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,236,214,0.82)' }}>
              总帖子数
            </p>
            <p className="text-xl font-black" style={{ color: '#fff5e8' }}>
              {blogStats.posts}
            </p>
          </article>
          <article className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,245,232,0.12)', border: '1px solid rgba(255,245,232,0.22)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,236,214,0.82)' }}>
              点赞互动
            </p>
            <p className="text-xl font-black" style={{ color: '#fff5e8' }}>
              {blogStats.likes}
            </p>
          </article>
          <article className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,245,232,0.12)', border: '1px solid rgba(255,245,232,0.22)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,236,214,0.82)' }}>
              评论互动
            </p>
            <p className="text-xl font-black" style={{ color: '#fff5e8' }}>
              {blogStats.comments}
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <h3 className="text-lg font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
          发表内容
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_160px_180px]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="标题：例如“西安城墙的空间秩序与当代城市生活”"
            className="rounded-xl px-4 py-3"
            style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
          />
          <select
            value={cityTag}
            onChange={(event) => setCityTag(event.target.value)}
            className="rounded-xl px-3 py-3"
            style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          <select
            value={column}
            onChange={(event) => setColumn(event.target.value as (typeof blogColumns)[number])}
            className="rounded-xl px-3 py-3"
            style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
          >
            {blogColumns.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写下你的研究观点、现场观察或城市故事..."
          className="mt-3 min-h-[120px] w-full rounded-xl px-4 py-3"
          style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
            style={{ background: '#fff2e1', border: '1px solid rgba(127,83,49,0.25)', color: '#6f3f1f' }}
          >
            <ImagePlus className="h-4 w-4" />
            {uploadingImage ? '处理中...' : '上传图片'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onPickImage(event.target.files?.[0])}
              disabled={uploadingImage}
            />
          </label>

          {imageUrl && (
            <button
              onClick={() => setImageUrl('')}
              className="rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ background: 'rgba(190,83,52,0.12)', color: '#b94b2d' }}
            >
              移除图片
            </button>
          )}

          <button
            onClick={() => void publish()}
            disabled={publishing || uploadingImage}
            className="rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
          >
            {publishing ? '发布中...' : '发布文章'}
          </button>
        </div>

        {imageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(127,83,49,0.22)' }}>
            <img src={imageUrl} alt="待发布配图" className="max-h-[360px] w-full object-cover" />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: '全部动态' },
              { id: 'mine', label: '我的发布' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as 'all' | 'mine')}
                className="rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{
                  background: tab === item.id ? 'rgba(143,90,53,0.18)' : 'rgba(143,90,53,0.08)',
                  color: tab === item.id ? '#6f3f1f' : '#8f5a35',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标题、作者、城市..."
            className="w-full rounded-full px-4 py-2 text-sm md:w-[320px]"
            style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.25)', color: '#5f3920' }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['全部', ...blogColumns] as const).map((item) => (
            <button
              key={item}
              onClick={() => setColumnFilter(item)}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: columnFilter === item ? 'rgba(143,90,53,0.18)' : 'rgba(143,90,53,0.08)',
                color: columnFilter === item ? '#6f3f1f' : '#8f5a35',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', color: '#7a5b46' }}>
            博客加载中...
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', color: '#7a5b46' }}>
            当前筛选条件下暂无内容。
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredPosts.map((post) => {
            const own = post.authorId === user?.id;
            const liked = Boolean(user?.id && post.likedUserIds?.includes(user.id));

            return (
              <article key={post.id} className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 10px 20px rgba(63,37,20,0.07)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar name={post.authorName} avatar={post.authorAvatar} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#5f3920' }}>
                        @{post.authorName}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: '#8e613f' }}>
                        <MapPin className="mr-1 inline h-3.5 w-3.5" />
                        {post.authorRegion || '未设置'}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: '#8e613f' }}>
                        {post.cityTag} · {post.column} · {new Date(post.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  {own && (
                    <button
                      onClick={() => void deletePost(post.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: 'rgba(190,83,52,0.12)', color: '#b94b2d' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </button>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-7" style={{ color: '#5f4a3d' }}>
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(127,83,49,0.22)' }}>
                    <img src={post.imageUrl} alt={post.title} className="max-h-[520px] w-full object-cover" loading="lazy" />
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => void toggleLike(post.id)}
                  disabled={pendingLikeIds.includes(post.id)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                  style={{
                    background: liked ? 'rgba(190,83,52,0.15)' : 'rgba(143,90,53,0.1)',
                    color: liked ? '#b94b2d' : '#8f5a35',
                  }}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  点赞 {post.likedUserIds?.length || 0}
                </button>

                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}>
                  <MessageCircle className="h-4 w-4" />
                  评论 {post.comments?.length || 0}
                </span>
                </div>

                <div className="mt-3 space-y-2">
                {(post.comments || []).map((comment) => (
                  <div key={comment.id} className="rounded-xl px-3 py-2" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <UserAvatar name={comment.username} avatar={comment.userAvatar} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#8e613f' }}>
                          @{comment.username}
                        </p>
                        <p className="text-[11px]" style={{ color: '#8e613f' }}>
                          <MapPin className="mr-1 inline h-3 w-3" />
                          {comment.userRegion || '未设置'} · {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6" style={{ color: '#5f4a3d' }}>
                      {comment.content}
                    </p>
                  </div>
                ))}
                </div>

                <div className="mt-3 flex gap-2">
                <input
                  value={commentDrafts[post.id] || ''}
                  onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                  placeholder="写下你的评论..."
                  className="w-full rounded-xl px-3 py-2"
                  style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.26)' }}
                />
                <button
                  onClick={() => void submitComment(post.id)}
                  disabled={pendingCommentIds.includes(post.id)}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
                >
                  <Send className="h-4 w-4" />
                  评论
                </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

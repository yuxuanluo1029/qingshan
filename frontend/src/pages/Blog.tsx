import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cities } from '@/data/mockData';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cityTag: string;
  column: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

const BLOG_KEY = 'chengji_blog_posts_v2';

const blogColumns = ['遗址考古', '建筑巡礼', '文物档案', '人物记忆', '城市更新', '城市随笔'] as const;

function loadPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      column: item.column || '城市随笔',
    }));
  } catch {
    return [];
  }
}

function savePosts(posts: BlogPost[]) {
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>(() => loadPosts());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cityTag, setCityTag] = useState(cities[0]?.name ?? '杭州');
  const [column, setColumn] = useState<(typeof blogColumns)[number]>('遗址考古');
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [columnFilter, setColumnFilter] = useState<'全部' | (typeof blogColumns)[number]>('全部');

  const filteredPosts = useMemo(() => {
    const ordered = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const base = tab === 'mine' ? ordered.filter((post) => post.authorId === user?.id) : ordered;

    if (columnFilter === '全部') return base;
    return base.filter((post) => post.column === columnFilter);
  }, [columnFilter, posts, tab, user?.id]);

  const publish = () => {
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

    const nextPost: BlogPost = {
      id: `blog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: safeTitle,
      content: safeContent,
      cityTag,
      column,
      authorId: user?.id || 'unknown',
      authorName: user?.username || '匿名用户',
      createdAt: new Date().toISOString(),
    };

    const nextPosts = [nextPost, ...posts];
    setPosts(nextPosts);
    savePosts(nextPosts);
    setTitle('');
    setContent('');
    toast.success('发布成功');
  };

  const deletePost = (id: string) => {
    const nextPosts = posts.filter((post) => post.id !== id);
    setPosts(nextPosts);
    savePosts(nextPosts);
    toast.success('已删除该条博客');
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
          博客采用“专栏制”组织观点，围绕遗址、建筑、文物、人物与更新议题沉淀五城长期讨论档案。
        </p>
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

        <button
          onClick={publish}
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
        >
          发布文章
        </button>
      </section>

      <section className="space-y-4">
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

        {filteredPosts.length === 0 && (
          <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', color: '#7a5b46' }}>
            当前筛选条件下暂无内容。
          </div>
        )}

        {filteredPosts.map((post) => {
          const own = post.authorId === user?.id;
          return (
            <article key={post.id} className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
              <div className="flex items-start gap-3">
                <div className="grow">
                  <p className="text-xs" style={{ color: '#8e613f' }}>
                    {post.cityTag} · {post.column} · {new Date(post.createdAt).toLocaleString('zh-CN')}
                  </p>
                  <h3 className="mt-1 text-lg font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7" style={{ color: '#5f4a3d' }}>
                    {post.content}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold" style={{ color: '#7f5f49' }}>
                    @{post.authorName}
                  </p>
                  {own && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="mt-2 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: 'rgba(190,83,52,0.12)', color: '#b94b2d' }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

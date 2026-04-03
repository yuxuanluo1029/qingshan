import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: '首页', to: '/home' },
  { label: '智能体导游', to: '/guide' },
  { label: '3D博物馆', to: '/museum' },
  { label: '城迹图谱', to: '/atlas' },
  { label: '知识问答', to: '/qa' },
  { label: '个性推荐', to: '/recommend' },
  { label: '3D实景', to: '/scene3d' },
  { label: '博客', to: '/blog' },
  { label: '治理中台', to: '/governance' },
];

export function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen heritage-fade-in"
      style={{
        background:
          'radial-gradient(circle at 8% 12%, rgba(191,145,97,0.18), transparent 34%), radial-gradient(circle at 92% 4%, rgba(152,113,79,0.12), transparent 38%), linear-gradient(180deg, #f8f3ea 0%, #f0e6d8 52%, #ece2d3 100%)',
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor: 'rgba(105, 64, 35, 0.25)',
          background: 'linear-gradient(90deg, rgba(105,61,33,0.96), rgba(136,83,49,0.95))',
          boxShadow: '0 8px 20px rgba(91,50,24,0.18)',
        }}
      >
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-4 py-3 md:px-6">
          <button onClick={() => navigate('/home')} className="shrink-0 text-left">
            <p className="text-2xl font-black tracking-[0.22em]" style={{ color: '#FDF3E7', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
              城迹
            </p>
            <p className="text-[10px] tracking-[0.2em]" style={{ color: 'rgba(255,239,219,0.74)' }}>
              城市历史文化沉浸平台
            </p>
          </button>

          <nav
            className="hide-scrollbar flex grow gap-1 overflow-x-auto rounded-full p-1"
            style={{ background: 'rgba(255, 243, 226, 0.1)', border: '1px solid rgba(255, 241, 224, 0.15)' }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition md:px-4 ${
                    isActive
                      ? 'bg-white/20 text-[#FFF5E7] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]'
                      : 'text-[#F3E2CF] hover:bg-white/10 hover:text-[#FFF6EA]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => navigate('/profile')}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,244,228,0.22)', color: '#FFF5E7', border: '1px solid rgba(255,245,232,0.4)' }}
              title="进入用户管理"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                (user?.username || 'U').slice(0, 1).toUpperCase()
              )}
            </button>
            <div className="text-right text-xs" style={{ color: 'rgba(255,241,224,0.86)' }}>
              <p>已登录账号</p>
              <p className="font-semibold">{user?.username}</p>
              <p className="opacity-80">{user?.region || '未设置地区'}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{ background: 'rgba(255,244,228,0.2)', color: '#FFF5E7', border: '1px solid rgba(255,245,232,0.4)' }}
            >
              退出
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1480px] px-4 pb-2 md:hidden">
          <div className="flex items-center justify-between rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,245,232,0.15)' }}>
            <button className="text-xs font-semibold" style={{ color: '#FFF8EC' }} onClick={() => navigate('/profile')}>
              账号：{user?.username}
            </button>
            <button onClick={logout} className="text-xs font-semibold" style={{ color: '#FFF8EC' }}>
              退出登录
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 md:px-6">
          <div className="heritage-line" />
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-6 md:px-6 md:py-8">
        <Outlet key={location.pathname} />
      </main>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: '首页', to: '/home' },
  { label: '智能体导游', to: '/guide' },
  { label: '博物馆游览', to: '/museum' },
  { label: '城迹图谱', to: '/atlas' },
  { label: '宝物说话', to: '/treasure' },
  { label: '知识问答', to: '/qa' },
  { label: '3D实景', to: '/scene3d' },
  { label: '博客', to: '/blog' },
];

export function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f2e8 0%, #efe5d5 100%)' }}>
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor: 'rgba(105, 64, 35, 0.25)',
          background: 'linear-gradient(90deg, rgba(114,67,36,0.96), rgba(146,92,53,0.94))',
          boxShadow: '0 6px 20px rgba(91,50,24,0.22)',
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-6">
          <div className="shrink-0">
            <p className="text-2xl font-black tracking-[0.22em]" style={{ color: '#FDF3E7', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
              城迹
            </p>
          </div>

          <nav className="hide-scrollbar flex grow gap-1 overflow-x-auto">
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
            <div className="text-right text-xs" style={{ color: 'rgba(255,241,224,0.86)' }}>
              <p>已登录</p>
              <p className="font-semibold">{user?.username}</p>
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

        <div className="mx-auto max-w-[1400px] px-4 pb-2 md:hidden">
          <div className="flex items-center justify-between rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,245,232,0.15)' }}>
            <span className="text-xs" style={{ color: '#FFF2E2' }}>
              账号：{user?.username}
            </span>
            <button onClick={logout} className="text-xs font-semibold" style={{ color: '#FFF8EC' }}>
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
        <Outlet key={location.pathname} />
      </main>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

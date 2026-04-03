import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const action = mode === 'login' ? login : register;
    const result = action(username, password);

    if (result.ok) {
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          'radial-gradient(circle at 10% 20%, rgba(165,102,54,0.32), transparent 40%), radial-gradient(circle at 80% 18%, rgba(92,58,30,0.24), transparent 44%), linear-gradient(180deg, #2c1d15 0%, #3f291c 40%, #5c3a28 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[10%] h-[280px] w-[280px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,224,180,0.2), transparent 72%)' }} />
        <div className="absolute bottom-[-100px] right-[-80px] h-[260px] w-[260px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,230,194,0.16), transparent 70%)' }} />
      </div>

      <div
        className="relative w-full max-w-md rounded-3xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(255,247,236,0.96), rgba(247,236,223,0.94))',
          border: '1px solid rgba(127,83,49,0.25)',
          boxShadow: '0 14px 50px rgba(44,29,21,0.35)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: '#8f5a35' }}>
          CHENGJI PORTAL
        </p>
        <h1 className="mt-3" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif", fontSize: '40px', color: '#6f3f1f', fontWeight: 900 }}>
          城迹
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#7d5a42' }}>
          城市历史文化沉浸式学习平台
        </p>

        <div className="mt-6 flex rounded-full p-1" style={{ background: 'rgba(143,90,53,0.14)' }}>
          <button
            onClick={() => setMode('login')}
            className="w-1/2 rounded-full py-2 text-sm font-semibold transition"
            style={{
              background: mode === 'login' ? 'linear-gradient(135deg, #8f5a35, #b87a4e)' : 'transparent',
              color: mode === 'login' ? '#fff6ea' : '#7d5a42',
            }}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className="w-1/2 rounded-full py-2 text-sm font-semibold transition"
            style={{
              background: mode === 'register' ? 'linear-gradient(135deg, #8f5a35, #b87a4e)' : 'transparent',
              color: mode === 'register' ? '#fff6ea' : '#7d5a42',
            }}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold" style={{ color: '#6f3f1f' }}>
              用户名
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              className="w-full rounded-xl px-4 py-3 outline-none transition"
              style={{ background: '#fffaf2', border: '1px solid rgba(127,83,49,0.26)' }}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold" style={{ color: '#6f3f1f' }}>
              密码
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'register' ? '至少6位密码' : '请输入密码'}
              className="w-full rounded-xl px-4 py-3 outline-none transition"
              style={{ background: '#fffaf2', border: '1px solid rgba(127,83,49,0.26)' }}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl py-3 text-base font-bold tracking-[0.1em] transition hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #8f5a35, #c28557)', color: '#fff7ee' }}
          >
            {mode === 'login' ? '进入城迹' : '创建账号并进入'}
          </button>
        </form>

        <p className="mt-4 text-xs leading-relaxed" style={{ color: '#8a6a54' }}>
          提示：博客模块支持“不同账号独立发布”。账号信息仅保存在当前浏览器本地，便于演示登录流程。
        </p>
      </div>
    </div>
  );
}

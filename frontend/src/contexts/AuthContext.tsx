import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface StoredUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { ok: boolean; message: string };
  register: (username: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
}

const USERS_KEY = 'chengji_users_v1';
const SESSION_KEY = 'chengji_session_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  const login = useCallback((username: string, password: string) => {
    const safeName = username.trim();
    if (!safeName || !password) {
      return { ok: false, message: '请输入用户名和密码。' };
    }

    const users = readUsers();
    const matched = users.find((item) => item.username === safeName && item.password === password);

    if (!matched) {
      return { ok: false, message: '账号或密码错误。' };
    }

    const sessionUser = { id: matched.id, username: matched.username };
    setUser(sessionUser);
    writeSession(sessionUser);
    return { ok: true, message: '登录成功。' };
  }, []);

  const register = useCallback((username: string, password: string) => {
    const safeName = username.trim();

    if (safeName.length < 3) {
      return { ok: false, message: '用户名至少 3 个字符。' };
    }

    if (password.length < 6) {
      return { ok: false, message: '密码至少 6 位。' };
    }

    const users = readUsers();
    const duplicated = users.some((item) => item.username === safeName);

    if (duplicated) {
      return { ok: false, message: '该用户名已被注册，请换一个。' };
    }

    const nextUser: StoredUser = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      username: safeName,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, nextUser]);

    const sessionUser = { id: nextUser.id, username: nextUser.username };
    setUser(sessionUser);
    writeSession(sessionUser);

    return { ok: true, message: '注册成功，已自动登录。' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

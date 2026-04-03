import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import apiClient, { getErrorMessage } from '@/lib/api-client';

export interface AuthUser {
  id: string;
  username: string;
  role?: string;
  avatarUrl?: string;
  region?: string;
}

interface AuthResult {
  ok: boolean;
  message: string;
}

interface PasswordResetResult extends AuthResult {
  resetCode?: string;
  expiresInSeconds?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
  requestPasswordReset: (username: string) => Promise<PasswordResetResult>;
  resetPassword: (username: string, resetCode: string, newPassword: string) => Promise<AuthResult>;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

const SESSION_KEY = 'chengji_session_v2';

const AuthContext = createContext<AuthContextValue | null>(null);

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

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const safeName = username.trim();

    if (!safeName || !password) {
      return { ok: false, message: '请输入用户名和密码。' };
    }

    try {
      const res = await apiClient.post('/auth/login', {
        username: safeName,
        password,
      });

      const account = res.data?.data?.user as AuthUser | undefined;
      if (!account?.id || !account?.username) {
        return { ok: false, message: '登录响应异常，请重试。' };
      }

      setUser(account);
      writeSession(account);
      return { ok: true, message: '登录成功。' };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) || '登录失败，请稍后重试。' };
    }
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const safeName = username.trim();

    if (safeName.length < 3) {
      return { ok: false, message: '用户名至少 3 个字符。' };
    }

    if (password.length < 6) {
      return { ok: false, message: '密码至少 6 位。' };
    }

    try {
      const res = await apiClient.post('/auth/register', {
        username: safeName,
        password,
      });

      const account = res.data?.data?.user as AuthUser | undefined;
      if (!account?.id || !account?.username) {
        return { ok: false, message: '注册响应异常，请重试。' };
      }

      setUser(account);
      writeSession(account);
      return { ok: true, message: '注册成功，已自动登录。' };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) || '注册失败，请稍后重试。' };
    }
  }, []);

  const requestPasswordReset = useCallback(async (username: string): Promise<PasswordResetResult> => {
    const safeName = username.trim();
    if (!safeName) {
      return { ok: false, message: '请输入用户名。' };
    }

    try {
      const res = await apiClient.post('/auth/forgot-password', { username: safeName });
      return {
        ok: true,
        message: res.data?.data?.message || '重置验证码已发送。',
        resetCode: res.data?.data?.resetCode,
        expiresInSeconds: Number(res.data?.data?.expiresInSeconds || 0) || undefined,
      };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) || '验证码获取失败，请稍后重试。' };
    }
  }, []);

  const resetPassword = useCallback(async (username: string, resetCode: string, newPassword: string): Promise<AuthResult> => {
    const safeName = username.trim();
    const safeCode = resetCode.trim();
    if (!safeName || !safeCode || !newPassword) {
      return { ok: false, message: '请完整填写用户名、验证码和新密码。' };
    }
    if (newPassword.length < 6) {
      return { ok: false, message: '新密码至少 6 位。' };
    }

    try {
      const res = await apiClient.post('/auth/reset-password', {
        username: safeName,
        resetCode: safeCode,
        newPassword,
      });
      return { ok: true, message: res.data?.data?.message || '密码已重置，请重新登录。' };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) || '密码重置失败，请稍后重试。' };
    }
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      writeSession(next);
      return next;
    });
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
      requestPasswordReset,
      resetPassword,
      updateUser,
      logout,
    }),
    [login, logout, register, requestPasswordReset, resetPassword, updateUser, user],
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

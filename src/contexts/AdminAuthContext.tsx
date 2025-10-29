import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AdminUser, getMe, login as apiLogin, logout as apiLogout } from '../lib/auth';

type AdminAuthContextType = {
  admin: AdminUser | null;
  loading: boolean;
  login: (creds: { email?: string; username?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!mounted) return;
        setAdmin(me);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (creds: { email?: string; username?: string; password: string }) => {
    const res = await apiLogin(creds);
    setAdmin(res.admin);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

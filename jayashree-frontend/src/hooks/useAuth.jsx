import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi, getToken, setToken, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  const clear = useCallback(() => {
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clear);
    if (!getToken()) return;
    adminApi
      .get('/auth/me')
      .then((r) => setAdmin(r.data))
      .catch(() => clear())
      .finally(() => setChecking(false));
  }, [clear]);

  const login = useCallback(async (login, password) => {
    const { data } = await adminApi.post('/auth/login', { login, password });
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/auth/logout');
    } catch {
      /* the token is discarded either way */
    }
    clear();
  }, [clear]);

  /** After a password change the server issues a fresh token (all older ones stop working). */
  const replaceToken = useCallback((data) => {
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout, replaceToken }), [admin, checking, login, logout, replaceToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

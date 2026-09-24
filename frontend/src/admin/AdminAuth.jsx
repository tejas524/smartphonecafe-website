import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../lib/api.js";

/**
 * Admin authentication context.
 *
 * The session is an httpOnly cookie set by the backend, so the browser can't
 * read it directly — we learn whether we're signed in by calling /api/auth/me.
 * That check runs once on mount; `login`/`logout` update the cached user.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking"); // checking | authed | anon

  const refresh = useCallback(async (signal) => {
    try {
      const me = await authApi.me(signal);
      setUser(me);
      setStatus("authed");
      return me;
    } catch (err) {
      if (err?.name === "AbortError") return null;
      setUser(null);
      setStatus("anon");
      return null;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const me = await authApi.login(email, password);
    setUser(me);
    setStatus("authed");
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("anon");
    }
  }, []);

  /**
   * Flip to signed-out without calling the API. Used when an admin API call
   * comes back 401 (an expired/invalid session): the guard then redirects to
   * the login screen instead of leaving the operator on a dead page.
   */
  const expire = useCallback(() => {
    setUser(null);
    setStatus("anon");
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await authApi.changePassword(currentPassword, newPassword);
    // The backend clears the session cookie on a successful change.
    setUser(null);
    setStatus("anon");
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ user, status, login, logout, changePassword, refresh, expire }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  return ctx;
}

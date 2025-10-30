/* src/contexts/AuthContext.jsx */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../services/authService';

/* -------------------------------------------------------------------------- */
/*                               Helper functions                             */
/* -------------------------------------------------------------------------- */
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = authService.decodeToken(token);
    return decoded.exp < Date.now() / 1000;
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

const safeJsonParse = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Context                                    */
/* -------------------------------------------------------------------------- */
export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname.includes('/login') ||
    location.pathname.includes('/signup') ||
    location.pathname.includes('/forgot-password');

  /* ------------------------------ State ----------------------------------- */
  const [user, setUser] = useState(() => safeJsonParse('scantyx_user', null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('scantyx_token');
    if (!token || isTokenExpired(token)) return false;
    authService.setAuthToken?.(token) ||
      (authService.defaults.headers.common['Authorization'] = `Bearer ${token}`);
    return true;
  });

  const isRefreshing = useRef(false);
  const tokenRef = useRef(localStorage.getItem('scantyx_token'));
  const refreshTokenRef = useRef(localStorage.getItem('scantyx_refresh_token'));

  /* ---------------------------- Token refs -------------------------------- */
  const updateTokenRefs = useCallback((token, refreshToken) => {
    tokenRef.current = token;
    refreshTokenRef.current = refreshToken;
  }, []);

  /* ------------------------------ Logout --------------------------------- */
  const logout = useCallback(
    async (options = {}) => {
      const { redirectTo = '/login', showMessage = true } = options;

      if (isRefreshing.current) {
        console.log('[Auth] Logout already in progress');
        return { success: false, error: 'Logout already in progress' };
      }

      isRefreshing.current = true;
      setIsAuthenticated(false);

      try {
        localStorage.removeItem('scantyx_user');
        localStorage.removeItem('scantyx_token');
        localStorage.removeItem('scantyx_refresh_token');

        updateTokenRefs(null, null);
        delete authService.defaults.headers.common['Authorization'];

        setUser(null);
        setError(null);
        if (showMessage) toast.dismiss();

        if (redirectTo && window.location.pathname !== redirectTo) {
          navigate(redirectTo, { replace: true });
        }

        return { success: true };
      } catch (err) {
        console.error('[Auth] Logout error:', err);
        return { success: false, error: err.message };
      } finally {
        isRefreshing.current = false;
      }
    },
    [navigate, updateTokenRefs],
  );

  /* --------------------------- Token refresh ----------------------------- */
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = refreshTokenRef.current || localStorage.getItem('scantyx_refresh_token');
    if (!refreshToken) return null;

    try {
      const { data } = await authService.post('/auth/refresh-token', { refreshToken });
      const { token: newToken } = data;
      if (!newToken) return null;

      tokenRef.current = newToken;
      localStorage.setItem('scantyx_token', newToken);
      authService.setAuthToken?.(newToken) ||
        (authService.defaults.headers.common['Authorization'] = `Bearer ${newToken}`);

      return newToken;
    } catch (e) {
      console.error('Token refresh failed:', e);
      return null;
    }
  }, []);

  /* --------------------------- Auth init -------------------------------- */
  const checkAuth = useCallback(async () => {
    const publicRoutes = ['/explore', '/about', '/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublic = publicRoutes.some((p) => location.pathname.startsWith(p));

    try {
      setLoading(true);
      const token = tokenRef.current || localStorage.getItem('scantyx_token');

      // No token → not authenticated (except on public routes)
      if (!token && !isPublic) {
        setIsAuthenticated(false);
        return;
      }

      // Public route → skip verification
      if (isPublic) return;

      // Expired token → try refresh
      if (token && isTokenExpired(token)) {
        const fresh = await refreshAuthToken();
        if (!fresh) {
          setIsAuthenticated(false);
          return;
        }
      }

      // Verify with server
      const { data } = await authService.get('/auth/me');
      setUser(data);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Auth verification failed:', e);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [location.pathname, refreshAuthToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /* --------------------------- Persist auth data -------------------------- */
  const persistAuthData = useCallback(
    ({ user: userData, token, refreshToken }) => {
      try {
        if (token) {
          localStorage.setItem('scantyx_token', token);
          tokenRef.current = token;
          authService.setAuthToken?.(token) ||
            (authService.defaults.headers.common['Authorization'] = `Bearer ${token}`);
        }
        if (refreshToken) {
          localStorage.setItem('scantyx_refresh_token', refreshToken);
          refreshTokenRef.current = refreshToken;
        }
        if (userData) {
          const safeUser = typeof userData === 'string' ? JSON.parse(userData) : userData;
          localStorage.setItem('scantyx_user', JSON.stringify(safeUser));
          setUser(safeUser);
        }
        if (token) setIsAuthenticated(true);
        return true;
      } catch (e) {
        console.error('Persist error:', e);
        setError('Failed to save auth data');
        return false;
      }
    },
    [],
  );

  /* -------------------------- Role check -------------------------------- */
  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  /* --------------------------- Rate limiting ----------------------------- */
  const loginAttempts = useRef(new Map());
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOGIN_WINDOW_MS = 15 * 60 * 1000;

  const cleanupAttempts = useCallback(() => {
    const now = Date.now();
    for (const [k, { timestamp }] of loginAttempts.current.entries())
      if (now - timestamp > LOGIN_WINDOW_MS) loginAttempts.current.delete(k);
  }, []);

  const isRateLimited = useCallback(
    (id) => {
      cleanupAttempts();
      const rec = loginAttempts.current.get(id);
      return rec ? rec.count >= MAX_LOGIN_ATTEMPTS : false;
    },
    [cleanupAttempts],
  );

  const recordAttempt = useCallback(
    (id, success) => {
      cleanupAttempts();
      const now = Date.now();
      const cur = loginAttempts.current.get(id) ?? { count: 0, timestamp: now };
      if (success) loginAttempts.current.delete(id);
      else loginAttempts.current.set(id, { count: cur.count + 1, timestamp: now });
    },
    [cleanupAttempts],
  );

  /* --------------------------- Toast helper ------------------------------ */
  const showToastError = useCallback((msg) => {
    toast.dismiss();
    toast.error(msg);
  }, []);

  /* ------------------------------- Login --------------------------------- */
  const login = useCallback(
    async (email, password) => {
      if (!email) {
        const msg = 'Email is required';
        setError(msg);
        if (isAuthPage) toast.error(msg);
        return { success: false, error: msg };
      }
      const identifier = email.toLowerCase();
      if (isRateLimited(identifier)) {
        const next = new Date(loginAttempts.current.get(identifier).timestamp + LOGIN_WINDOW_MS).toLocaleTimeString();
        const msg = `Too many attempts. Try again after ${next}`;
        setError(msg);
        if (isAuthPage) toast.error(msg);
        return { success: false, error: msg };
      }

      setLoading(true);
      setError(null);

      try {
        const { token, refreshToken, user } = await authService.login(email, password);
        if (!token || !refreshToken) throw new Error('No tokens returned');

        persistAuthData({ token, refreshToken, user });
        setUser(user);
        setIsAuthenticated(true);
        authService.setAuthToken?.(token);

        toast.success('Login successful!');
        recordAttempt(identifier, true);
        return { success: true, user };
      } catch (err) {
        const msg = err.response?.data?.message || 'Login failed';
        setError(msg);
        if (isAuthPage) toast.error(msg);
        recordAttempt(identifier, false);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [isAuthPage, persistAuthData, isRateLimited, recordAttempt],
  );

  /* ------------------------------- Signup -------------------------------- */
  const signup = useCallback(
    async (name, email, password) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await authService.register({ name, email, password });
        const { token, refreshToken, user } = data;

        persistAuthData({ token, refreshToken, user });

        // Fetch full user profile
        const { data: fullUser } = await authService.getCurrentUser();
        setUser(fullUser);
        localStorage.setItem('scantyx_user', JSON.stringify(fullUser));

        toast.success('Registration successful!');
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed';
        setError(msg);
        if (isAuthPage) toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [isAuthPage, persistAuthData],
  );

  /* --------------------------- Context value ----------------------------- */
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      signup,
      logout,
      isAuthenticated,
      isAdmin,
      isInitialized,
    }),
    [
      user,
      loading,
      error,
      login,
      signup,
      logout,
      isAuthenticated,
      isAdmin,
      isInitialized,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
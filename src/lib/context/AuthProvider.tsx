// src/lib/context/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { AuthStateContext, AuthActionsContext } from "./authState";
import type { User as UserType } from "./authState"; 
import * as authApi from '../api/authApi';
import { setAccessToken, subscribeToAccessToken } from '../fetchClient';
import type { AuthResponse } from '../api/authApi';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAccessToken((token) => {
      setToken((currentToken) => (currentToken === token ? currentToken : token));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let listener: (() => void) | null = null;

    const runBootstrap = async () => {
      console.log('[Auth] bootstrap start');
      setLoading(true);
      
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const r = await authApi.refresh();
          console.log(`[Auth] refresh attempt ${attempts + 1} result`, r);

          if (cancelled) return;

          if (!r.ok) {
            const isAuthError = r.error?.status === 401 || r.error?.status === 403;
            
            if (isAuthError) {
              console.warn('[Auth] Session definitively expired. Clearing state.');
              setUser(null);
              setAccessToken(null);
              break; // Exit loop on definitive auth failure
            }

            // If it's a network/server error, wait and retry
            attempts++;
            if (attempts < maxAttempts) {
              console.log(`[Auth] Network error. Retrying in 5s... (${attempts}/${maxAttempts})`);
              await new Promise(res => setTimeout(res, 5000));
              continue;
            }
            
            console.log('[Auth] Max retries reached. Retaining local state.');
            break;
          }

          // SUCCESS CASE
          const resp = r.data as AuthResponse;
          const token = resp.accessToken ?? null;
          setAccessToken(token);

          if (resp.user) {
            setUser(resp.user);
          } else if (token) {
            const me = await authApi.me(token);
            if (!cancelled) {
              if (me.ok && me.data?.user) setUser(me.data.user);
              else {
                setUser(null);
                setAccessToken(null);
              }
            }
          }
          break; // Exit loop on success

        } catch (err) {
          console.error('[Auth] bootstrap error', err);
          attempts++;
          if (attempts < maxAttempts) await new Promise(res => setTimeout(res, 5000));
          else break;
        }
      }

      if (!cancelled) {
        setLoading(false);
        console.log('[Auth] bootstrap done');
      }
    };

    // OAuth and window logic remains untouched
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path === '/oauth-finish') {
        listener = async () => {
          await Promise.resolve();
          if (!cancelled) await runBootstrap();
        };
        window.addEventListener('xpensio:oauth-finalized', listener as EventListener);
      } else {
        (async () => { await runBootstrap(); })();
      }
    } catch (e) {
      console.log(e);
      
      (async () => await runBootstrap())();
    }

    return () => {
      cancelled = true;
      if (listener) window.removeEventListener('xpensio:oauth-finalized', listener as EventListener);
    };
  }, []);

  // Login, Signup, and Logout logic remain untouched
  const login = async (email: string, password: string) => {
    const r = await authApi.login({ email, password });
    if (!r.ok || !r.data) return { ok: false, error: 'Login failed' };
    const resp = r.data as AuthResponse;
    const token = resp.accessToken ?? null;
    setAccessToken(token);
    if (resp.user) {
      setUser(resp.user);
      return { ok: true, user: resp.user };
    } else {
      const me = await authApi.me(token ?? undefined);
      if (me.ok && me.data && me.data.user) {
        setUser(me.data.user);
        return { ok: true, user: me.data.user };
      }
      return { ok: false, error: 'Could not fetch user' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const r = await authApi.signup({ name, email, password });
    if (!r.ok || !r.data) return { ok: false, error: 'Signup failed' };
    const resp = r.data as AuthResponse;
    const token = resp.accessToken ?? null;
    setAccessToken(token);
    if (resp.user) {
      setUser(resp.user);
      return { ok: true, user: resp.user };
    } else {
      const me = await authApi.me(token ?? undefined);
      if (me.ok && me.data && me.data.user) {
        setUser(me.data.user);
        return { ok: true, user: me.data.user };
      }
      return { ok: false, error: 'Could not fetch user' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthStateContext.Provider value={{ user, accessToken: accessToken ?? null, loading }}>
      <AuthActionsContext.Provider value={{ login, signup, logout }}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

export default AuthProvider;
// src/lib/context/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { AuthStateContext, AuthActionsContext } from "./authState";
import type { User as UserType } from "./authState"; import * as authApi from '../api/authApi';
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
      try {
        const r = await authApi.refresh();
        console.log('[Auth] refresh result', r);

        if (cancelled) return;

        if (!r.ok || !r.data) {
          setUser(null);
          setAccessToken(null);
          return;
        }

        const resp = r.data as AuthResponse;
        const token = resp.accessToken ?? null;
        setAccessToken(token);

        if (resp.user) {
          setUser(resp.user);
        } else if (token) {
          const me = await authApi.me(token);
          console.log('[Auth] me result', me);
          if (!cancelled) {
            if (me.ok && me.data?.user) setUser(me.data.user);
            else setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] bootstrap error', err);
        setUser(null);
        setAccessToken(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('[Auth] bootstrap done');
        }
      }
    };

    // If we're on the oauth finish page, delay bootstrap until finalize completes.
    // The OAuthFinish page will dispatch 'xpensio:oauth-finalized' once it has called the finalize endpoint
    // and the backend has set the refresh cookie.
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path === '/oauth-finish') {
        console.log('[Auth] oauth finish detected - deferring bootstrap until finalize event');
        listener = async () => {
          // small microtask wait to ensure cookie flush
          await Promise.resolve();
          if (!cancelled) await runBootstrap();
          // remove listener after first run - event listener will be removed below on cleanup
        };
        window.addEventListener('xpensio:oauth-finalized', listener as EventListener);
      } else {
        // default flow - bootstrap immediately
        (async () => {
          await runBootstrap();
        })();
      }
    } catch (e) {
      console.log(e);

      // if window isn't available, just bootstrap normally
      (async () => await runBootstrap())();
    }

    return () => {
      cancelled = true;
      if (listener) window.removeEventListener('xpensio:oauth-finalized', listener as EventListener);
    };
  }, []);

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

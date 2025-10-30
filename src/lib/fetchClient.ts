// src/lib/fetchClient.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const AUTH_REFRESH_URL = "/api/auth/refresh";

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

// Refresh queue helpers
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}${AUTH_REFRESH_URL}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        setAccessToken(null);
        refreshPromise = null;
        return false;
      }

      const json: unknown = await res.json();
      const data = json as { accessToken?: string };

      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        refreshPromise = null;
        return true;
      }

      setAccessToken(null);
      refreshPromise = null;
      return false;
    } catch {
      setAccessToken(null);
      refreshPromise = null;
      return false;
    }
  })();

  return refreshPromise;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: {
    method?: HttpMethod;
    body?: unknown;
    retry?: number;
    includeCredentials?: boolean;
    skipRefreshOn401?: boolean;
    signal?: AbortSignal | null;
    headers?: Record<string, string>;
  } = {}
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  const {
    method = "GET",
    body,
    retry = 1,
    includeCredentials = false,
    skipRefreshOn401 = false,
    signal = null,
    headers = {},
  } = opts;

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const init: RequestInit = {
    method,
    signal: signal || undefined,
    headers: { "Content-Type": "application/json", ...headers },
  };

  if (accessToken) {
    (
      init.headers as Record<string, string>
    ).Authorization = `Bearer ${accessToken}`;
  }

  if (includeCredentials) {
    init.credentials = "include";
  }

  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  let attempt = 0;
  let lastErr: Error | null = null;

  while (attempt <= retry) {
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      let data: unknown = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (res.ok) {
        return { ok: true, data: data as T };
      }

      // Handle 401 - attempt refresh
      if (res.status === 401 && !skipRefreshOn401) {
        const refreshed = await doRefresh();

        if (refreshed) {
          // Retry with new token
          if (accessToken) {
            (
              init.headers as Record<string, string>
            ).Authorization = `Bearer ${accessToken}`;
          }

          const retried = await fetch(url, init);
          const txt2 = await retried.text();
          let data2: unknown = null;

          try {
            data2 = txt2 ? JSON.parse(txt2) : null;
          } catch {
            data2 = txt2;
          }

          if (retried.ok) {
            return { ok: true, data: data2 as T };
          }

          const errorData = data2 as {
            error?: string;
            message?: string;
          } | null;
          return {
            ok: false,
            error: {
              status: retried.status,
              message:
                errorData?.error || errorData?.message || retried.statusText,
              data: data2,
            },
          };
        } else {
          const errorData = data as { error?: string; message?: string } | null;
          return {
            ok: false,
            error: {
              status: 401,
              message: errorData?.error || errorData?.message || "Unauthorized",
            },
          };
        }
      }

      // Non-401 error
      const errorData = data as { error?: string; message?: string } | null;
      return {
        ok: false,
        error: {
          status: res.status,
          message: errorData?.error || errorData?.message || res.statusText,
          data,
        },
      };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));

      // Network error - retry with backoff
      if (attempt < retry) {
        const backoff = 200 * Math.pow(2, attempt);
        await wait(backoff + Math.random() * 100);
        attempt++;
        continue;
      }

      // Exhausted retries
      return {
        ok: false,
        error: {
          message: lastErr.message || "Network error",
          data: lastErr,
        },
      };
    }
  }

  return {
    ok: false,
    error: {
      message: lastErr?.message || "Unknown error",
    },
  };
}

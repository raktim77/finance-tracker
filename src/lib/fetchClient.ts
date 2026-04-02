// src/lib/fetchClient.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
import { API_ORIGIN, warnIfCookieRefreshMayFail } from "./api/config";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

interface RefreshResponse {
  accessToken?: string;
  [key: string]: unknown;
}

export type RefreshResult =
  | { ok: true; status: "refreshed"; data?: RefreshResponse }
  | {
      ok: false;
      status: "auth-error" | "network-error";
      httpStatus?: number;
      data?: RefreshResponse;
      error?: Error;
    };

const API_BASE = API_ORIGIN;
const AUTH_REFRESH_URL = "/api/auth/refresh";

// For legacy compatibility a separate BASE_URL was present; prefer API_BASE for all calls

let accessToken: string | null = null;
let refreshInFlight: Promise<RefreshResult> | null = null;
const accessTokenListeners = new Set<(token: string | null) => void>();

export function setAccessToken(token: string | null) {
  if (accessToken === token) return;
  accessToken = token;
  accessTokenListeners.forEach((listener) => listener(token));
}
export function getAccessToken() {
  return accessToken;
}

export function subscribeToAccessToken(
  listener: (token: string | null) => void,
) {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Deduped refresh helper.
 * If a refresh is already in-flight, callers will wait for the same promise.
 * Returns a typed result so callers can distinguish auth expiry from transient failures.
 */
async function doRefreshOnce(): Promise<RefreshResult> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      warnIfCookieRefreshMayFail();

      const res = await fetch(`${API_BASE}${AUTH_REFRESH_URL}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();
      let data: RefreshResponse | string | null = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        console.warn("[Auth] Refresh failed:", res.status);

        return {
          ok: false,
          status:
            res.status === 401 || res.status === 403
              ? "auth-error"
              : "network-error",
          httpStatus: res.status,
          data:
            data && typeof data === "object" ? (data as RefreshResponse) : undefined,
        };
      }

      // ✅ update accessToken if provided
      if (
        data &&
        typeof data === "object" &&
        "accessToken" in data &&
        data.accessToken
      ) {
        setAccessToken(data.accessToken);
      }

      return {
        ok: true,
        status: "refreshed",
        data:
          data && typeof data === "object" ? (data as RefreshResponse) : undefined,
      };
    } catch (err) {
      console.error("[fetchClient] doRefreshOnce error", err);

      return {
        ok: false,
        status: "network-error",
        error: err instanceof Error ? err : new Error(String(err)),
      };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function refreshAccessToken() {
  return doRefreshOnce();
}

/**
 * apiFetch - main client for API calls
 */
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
  } = {},
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

  // prefer explicit absolute paths if provided
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const initBase: RequestInit = {
    method,
    signal: signal || undefined,
    headers: baseHeaders as HeadersInit,
  };

  if (accessToken) {
    (initBase.headers as Record<string, string>).Authorization =
      `Bearer ${accessToken}`;
  }

  if (includeCredentials) {
    initBase.credentials = "include";
  }

  if (body !== undefined && body !== null) {
    initBase.body = JSON.stringify(body);
  }

  let attempt = 0;
  let lastErr: Error | null = null;

  while (attempt <= retry) {
    try {
      // Clone the init for each fetch because RequestInit can be mutated (esp. body consumed)
      const init: RequestInit = {
        method: initBase.method,
        headers: { ...(initBase.headers as Record<string, string>) },
        credentials: initBase.credentials,
        signal: initBase.signal,
        body: initBase.body,
      };

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

      // Handle 401 - try refresh (unless explicitly skipped)
      if (res.status === 401 && !skipRefreshOn401) {
        const refreshRes = await doRefreshOnce();

        if (refreshRes.ok) {
          // retry request
          if (accessToken) {
            (init.headers as Record<string, string>).Authorization =
              `Bearer ${accessToken}`;
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
        }

        if (refreshRes.status === "auth-error") {
          setAccessToken(null);
        }

        const errData =
          (data as { error?: string; message?: string } | null) ?? null;

        return {
          ok: false,
          error: {
            status: refreshRes.ok ? res.status : (refreshRes.httpStatus ?? res.status),
            message: errData?.error || errData?.message || "Unauthorized",
            data,
          },
        };
      }

      // Non-401 error -> return structured error
      const errorData =
        (data as { error?: string; message?: string } | null) ?? null;
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

      // Network error - retry with exponential backoff
      if (attempt < retry) {
        const backoff = 200 * Math.pow(2, attempt);
        await wait(backoff + Math.random() * 100);
        attempt++;
        continue;
      }

      return {
        ok: false,
        error: {
          message: lastErr.message || "Network error",
          data: lastErr,
        },
      };
    }
  }

  // Shouldn't reach here; return generic error
  return {
    ok: false,
    error: {
      message: lastErr?.message || "Unknown error",
    },
  };
}

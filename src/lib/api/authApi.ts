// src/lib/api/authApi.ts
import { apiFetch, refreshAccessToken, setAccessToken } from "../fetchClient";

/**
 * Shared types used by the API and the frontend consumer
 */
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  ok?: boolean;
  accessToken?: string;
  user?: User;
  error?: string;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const r = await apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: payload,
    includeCredentials: true,
    skipRefreshOn401: true,
  });
  if (r.ok && r.data.accessToken) setAccessToken(r.data.accessToken);
  return r;
}

export async function login(payload: { email: string; password: string }) {
  const r = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
    includeCredentials: true,
    skipRefreshOn401: true,
  });
  if (r.ok && r.data.accessToken) setAccessToken(r.data.accessToken);
  return r;
}

export async function refresh() {
  return refreshAccessToken();
}

export async function logout() {
  const r = await apiFetch("/api/auth/logout", {
    method: "POST",
    includeCredentials: true,
    skipRefreshOn401: true,
  });
  if (r.ok) setAccessToken(null);
  return r;
}

export async function me(accessToken?: string) {
  if (accessToken) setAccessToken(accessToken);
  // note: me returns { ok: true, user } from the backend
  return apiFetch<{ ok: boolean; user: User }>("/api/auth/me", {
    method: "GET",
  });
}

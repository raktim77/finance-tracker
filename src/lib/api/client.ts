import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";
import type { QueryParams, RequestOptions } from "./types";
import { getAccessToken, refreshAccessToken } from "../fetchClient";

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(
    path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && data && typeof data === "object") {
      const errorData = data as {
        message?: string;
        code?: string;
        errors?: unknown;
      };

      throw new ApiError(
        errorData.message || "Request failed",
        response.status,
        errorData.code,
        errorData.errors
      );
    }

    throw new ApiError(
      typeof data === "string" && data.trim() ? data : "Request failed",
      response.status
    );
  }

  return data as T;
}

function buildHeaders(
  body: unknown,
  headers: Record<string, string> | undefined,
  authToken: string | null | undefined
) {
  const resolvedAuthToken = getAccessToken() ?? authToken;

  return {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(resolvedAuthToken ? { Authorization: `Bearer ${resolvedAuthToken}` } : {}),
    ...headers,
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers, signal, query, authToken } = options;
  const url = buildUrl(path, query);

  let response = await fetch(url, {
    method,
    credentials: "include",
    signal,
    headers: buildHeaders(body, headers, authToken),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    const refreshResult = await refreshAccessToken();

    if (refreshResult?.ok) {
      response = await fetch(url, {
        method,
        credentials: "include",
        signal,
        headers: buildHeaders(body, headers, authToken),
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  return parseResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<TResponse>(path, { ...options, method: "POST", body }),

  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<TResponse>(path, { ...options, method: "PATCH", body }),

  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<TResponse>(path, { ...options, method: "PUT", body }),

  delete: <TResponse>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<TResponse>(path, { ...options, method: "DELETE" }),
};

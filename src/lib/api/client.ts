import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";
import type { QueryParams, RequestOptions } from "./types";

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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers, signal, query, authToken } = options;

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
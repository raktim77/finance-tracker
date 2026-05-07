export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type ResponseType =
  | "json"
  | "text"
  | "blob";
export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  query?: QueryParams;
  authToken?: string | null;
  responseType?: ResponseType;
}
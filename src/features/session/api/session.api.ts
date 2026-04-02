import { apiClient } from "../../../lib/api/client";
import type { GetSessionsResponse } from "../types/session.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getSessions(
  options: AuthOptions = {}
): Promise<GetSessionsResponse> {
  return apiClient.get<GetSessionsResponse>("/auth/sessions", {
    authToken: options.accessToken,
  });
}

export async function revokeSession(
  sessionId: string,
  options: AuthOptions = {}
): Promise<{ ok: boolean }> {
  return apiClient.delete<{ ok: boolean }>(
    `/auth/sessions/${sessionId}`,
    {
      authToken: options.accessToken,
    }
  );
}

export async function revokeOtherSessions(
  options: AuthOptions = {}
): Promise<{ ok: boolean }> {
  return apiClient.post<{ ok: boolean }>(
    "/auth/sessions/revoke-others",
    {},
    {
      authToken: options.accessToken,
    }
  );
}

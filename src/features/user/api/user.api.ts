import { apiClient } from "../../../lib/api/client";
import type {
  UserProfile,
  UpdateProfilePayload,
  getMeResponse,
} from "../types/user.types";

interface AuthOptions {
  accessToken?: string | null;
}

export interface DeleteAccountResponse {
  ok: true;
  message: string;
}

export interface DeleteAccountErrorData {
  code?: string;
  error?: string;
}

interface DeleteAccountPayload {
  password?: string;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
  options: AuthOptions = {}
): Promise<UserProfile> {
  return apiClient.patch<UserProfile, UpdateProfilePayload>(
    "/users/me",
    payload,
    {
      authToken: options.accessToken,
    }
  );
}

export async function getMe(
  options: AuthOptions = {}
): Promise<getMeResponse> {
  return apiClient.get<getMeResponse>("/auth/me", {
    authToken: options.accessToken,
  });
}

export async function deleteAccount(
  password?: string,
  options: AuthOptions = {}
): Promise<DeleteAccountResponse> {
  return apiClient.delete<DeleteAccountResponse, DeleteAccountPayload>(
    "/users/me",
    password ? { password } : undefined,
    {
      authToken: options.accessToken,
    }
  );
}

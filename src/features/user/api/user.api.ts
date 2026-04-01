import { apiClient } from "../../../lib/api/client";
import type {
  UserProfile,
  UpdateProfilePayload,
  getMeResponse,
} from "../types/user.types";

interface AuthOptions {
  accessToken?: string | null;
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
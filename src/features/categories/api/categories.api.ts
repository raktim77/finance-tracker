import { apiClient } from "../../../lib/api/client";
import type { CategoriesResponse } from "../types/category.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getCategories(
  options: AuthOptions = {}
): Promise<CategoriesResponse> {
  return apiClient.get<CategoriesResponse>("/categories", {
    authToken: options.accessToken,
  });
}
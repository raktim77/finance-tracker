import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/categories.api";
import { categoryKeys } from "../api/category.keys";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useCategories(options: AuthOptions = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => getCategories({ accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}
import { apiClient } from "../../../lib/api/client";
import type {
  AccountCategoriesResponse,
  AccountResponse,
  AccountsListResponse,
  CreateAccountPayload,
  GetAccountsParams,
  UpdateAccountPayload,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getAccounts(
  params: GetAccountsParams = {},
  options: AuthOptions = {}
): Promise<AccountsListResponse> {
  return apiClient.get<AccountsListResponse>("/accounts", {
    query: params,
    authToken: options.accessToken,
  });
}

export async function getAccountById(
  id: string,
  options: AuthOptions = {}
): Promise<AccountResponse> {
  return apiClient.get<AccountResponse>(`/accounts/${id}`, {
    authToken: options.accessToken,
  });
}

export async function createAccount(
  payload: CreateAccountPayload,
  options: AuthOptions = {}
): Promise<AccountResponse> {
  return apiClient.post<AccountResponse, CreateAccountPayload>(
    "/accounts",
    payload,
    {
      authToken: options.accessToken,
    }
  );
}

export async function updateAccount(
  id: string,
  payload: UpdateAccountPayload,
  options: AuthOptions = {}
): Promise<AccountResponse> {
  return apiClient.patch<AccountResponse, UpdateAccountPayload>(
    `/accounts/${id}`,
    payload,
    {
      authToken: options.accessToken,
    }
  );
}


export async function getAccountCategories(
  options: AuthOptions = {}
): Promise<AccountCategoriesResponse> {
  return apiClient.get<AccountCategoriesResponse>("/account-categories", {
    authToken: options.accessToken,
  });
}
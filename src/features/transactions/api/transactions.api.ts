import { apiClient } from "../../../lib/api/client";
import type {
  CreateTransactionPayload,
  DeleteTransactionResponse,
  GetTransactionsParams,
  PaginatedTransactionsResponse,
  TransactionResponse,
  UpdateTransactionPayload,
} from "../types/transaction.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getTransactions(
  params: GetTransactionsParams = {},
  options: AuthOptions = {}
): Promise<PaginatedTransactionsResponse> {
  return apiClient.get<PaginatedTransactionsResponse>("/transactions", {
    query: params,
    authToken: options.accessToken,
  });
}

export async function getTransactionById(
  id: string,
  options: AuthOptions = {}
): Promise<TransactionResponse> {
  return apiClient.get<TransactionResponse>(`/transactions/${id}`, {
    authToken: options.accessToken,
  });
}

export async function createTransaction(
  payload: CreateTransactionPayload,
  options: AuthOptions = {}
): Promise<TransactionResponse> {
  return apiClient.post<TransactionResponse, CreateTransactionPayload>(
    "/transactions",
    payload,
    {
      authToken: options.accessToken,
    }
  );
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
  options: AuthOptions = {}
): Promise<TransactionResponse> {
  return apiClient.patch<TransactionResponse, UpdateTransactionPayload>(
    `/transactions/${id}`,
    payload,
    {
      authToken: options.accessToken,
    }
  );
}

export async function deleteTransaction(
  id: string,
  options: AuthOptions = {}
): Promise<DeleteTransactionResponse> {
  return apiClient.delete<DeleteTransactionResponse>(`/transactions/${id}`, {
    authToken: options.accessToken,
  });
}
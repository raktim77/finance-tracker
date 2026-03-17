import type { Account } from "../../accounts/types/account.types";

export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  _id: string;
  user_id: string;
  account_id: Account;
  to_account_id?: Account;
  category_id?: string | null;

  type: TransactionType;
  amount: number;
  signed_amount: number;

  category_name: string | null;
  category_icon: string | null;
  category_color: string | undefined;

  note?: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  account_id: string;
  to_account_id?: string;
  category_id?: string;
  note?: string;
  date: Date;
}

export interface UpdateTransactionPayload {
  amount?: number;
  type?: TransactionType;
  account_id?: string;
  to_account_id?: string;
  category_id?: string;
  note?: string;
  date?: string;
}

export interface GetTransactionsParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  account_id?: string;
  from?: string;
  to?: string;
  sort?: "latest" | "oldest" | "highest" | "lowest";
}

export interface TransactionsListResponse {
  ok: boolean;
  total: number;
  page: number;
  pages: number;
  transactions: Transaction[];
}

export interface TransactionResponse {
  transaction: Transaction;
}

export interface DeleteTransactionResponse {
  message: string;
}
export interface AccountCategory {
  _id: string;
  name: string;
  icon: string;
  color: string;
  group: string;
}

export interface Account {
  _id: string;
  user_id: string;
  name: string;
  note?: string | null;
  opening_balance: number;
  current_balance: number;
  account_category_id: string;

  account_category_name?: string | null;
  account_category_icon?: string | null;
  account_category_color?: string | null;
  account_category_group?: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateAccountPayload {
  name: string;
  opening_balance: number;
  account_category_id: string;
  note?: string;
}

export interface UpdateAccountPayload {
  name?: string;
  opening_balance?: number;
  account_category_id?: string;
  note?: string;
}

export interface GetAccountsParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "latest" | "oldest" | "name_asc" | "name_desc" | "balance_high" | "balance_low";
}

export interface AccountsListResponse {
  ok: boolean;
  total: number;
  page: number;
  pages: number;
  accounts: Account[];
}

export interface AccountResponse {
  account: Account;
}

export interface AccountCategoriesResponse {
  accountCategories: AccountCategory[];
}

export interface DeleteAccountResponse {
  message: string;
}
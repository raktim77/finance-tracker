import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/context/useAuth";
import { useTransactions, useDeleteTransaction, useUpdateTransaction } from "../../features/transactions/hooks/useTransactions";
import { useCategories } from "../../features/categories/hooks/useCategories";
import { useAccounts } from "../../features/accounts/hooks/useAccounts";
import type { Transaction } from "../../features/transactions/types/transaction.types";
import TransactionSheet, { type TransactionDraft } from "../transactions/TransactionSheet";
import TransactionDetails from "../transactions/TransactionDetails";
import TransactionListItem from "../transactions/TransactionListItem";
import {
  formatTransactionDisplayDate,
  getTransactionCategoryLabel,
  getTransactionTitle,
} from "../../features/transactions/utils/transactionDisplay";
import { useConfirm } from "../ui/confirm-modal/useConfirm";
import { useToast } from "../ui/confirm-modal/useToast";

export const RecentTransactions = () => {
  const navigate = useNavigate();
  const { accessToken, loading } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();
  const deleteTransactionMutation = useDeleteTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const { data, isLoading, isError, error } = useTransactions(
    {
      page: 1,
      limit: 4,
      sort: "latest",
    },
    {
      accessToken,
      enabled: !loading && !!accessToken,
    }
  );

  const categories = categoriesData?.categories ?? [];
  const accounts = accountsData?.accounts ?? [];
  const mappedAccounts = accounts.map((acc) => ({
    _id: acc._id,
    name: acc.name,
    type: acc.account_category_group || "account",
    balance: acc.current_balance,
    icon: acc.account_category_icon || "help",
  }));
  const currentItems = data?.transactions ?? [];
  const isReady = categories.length > 0 && accounts.length > 0;

  function mapToDraft(tx: Transaction): TransactionDraft {
    return {
      amount: tx.amount,
      type: tx.type,
      account_id: tx.account_id?._id || null,
      to_account_id: tx.to_account_id?._id || null,
      category_id: tx.category_id || null,
      note: tx.note || "",
      date: new Date(tx.date),
    };
  }

  const handleSubmitTransaction = async (payload: {
    amount: number;
    type: "expense" | "income" | "transfer";
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => {
    if (!editingTx || !editingId) return;

    try {
      await updateTransactionMutation.mutateAsync({
        id: editingId,
        payload,
      });

      setSheetOpen(false);
      setEditingTx(null);
      setSelectedTx(null);
      setEditingId(null);
    } catch (err) {
      console.error("Transaction failed", err);
    }
  };

  return (
    <div className="rounded-[2rem] p-2 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all h-full">
      <div className="flex items-center justify-between mb-8 px-6 pt-6">
        <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
          Recent History
        </h2>
        <button
          onClick={() => navigate("/transactions")}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest hover:brightness-95 transition-all"
        >
          See All
        </button>
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] overflow-hidden w-full">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
              Loading transactions...
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
              {error instanceof Error ? error.message : "Failed to load transactions"}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-20 text-center text-sm font-bold text-[var(--color-text-secondary)]">
              No transactions found
            </div>
          ) : (
            currentItems.map((transaction, index) => (
              <TransactionListItem
                key={transaction._id}
                transaction={transaction}
                title={getTransactionTitle(transaction)}
                categoryLabel={getTransactionCategoryLabel(transaction)}
                displayDate={formatTransactionDisplayDate(transaction.date)}
                layoutMode="compact"
                showDivider={index !== currentItems.length - 1}
                onClick={() => {
                  setSelectedTx(transaction);
                  setDetailsOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      <TransactionSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingTx(null);
          setEditingId(null);
        }}
        categories={categories}
        accounts={mappedAccounts}
        onSubmit={handleSubmitTransaction}
        loading={updateTransactionMutation.isPending}
        initialData={editingTx}
        defaultData={null}
      />
      <TransactionDetails
        transaction={selectedTx}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedTx(null);
        }}
        onEdit={(tx) => {
          if (!isReady) return;
          setEditingTx(mapToDraft(tx));
          setEditingId(tx._id);
          setSheetOpen(true);
        }}
        onDelete={async (tx) => {
          const ok = await confirm({
            title: "Delete Transaction?",
            message: "This transaction will be permanently deleted from your history. This action is irreversible.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
          });

          if (!ok) return;

          try {
            await deleteTransactionMutation.mutateAsync(tx._id);
            setDetailsOpen(false);
            setSelectedTx(null);
            toast.success("Transaction deleted successfully");
          } catch (err) {
            console.error(err);
            toast.error("Failed to delete transaction");
          }
        }}
      />
    </div>
  );
};

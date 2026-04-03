import { useState } from "react";
import { PlusCircle } from "lucide-react";
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
  const hasAccounts = accounts.length > 0;
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
    <div className=" rounded-[2rem] p-2 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all h-full">
      {currentItems.length > 0 ? (
        <div className="flex items-center justify-between mb-4 px-6 pt-6">
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
      ) : ''}
      

      <div className="rounded-xl bg-[var(--color-surface)] overflow-hidden w-full">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="flex flex-col gap-1 p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-between gap-1 rounded-2xl p-3 min-w-0"
                >
                  {index !== 3 && (
                    <div className="absolute bottom-0 left-4 right-4 border-b border-dashed border-[var(--border)]" />
                  )}

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />

                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 mb-2 min-w-0">
                        <div className="h-4 w-28 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                        <div className="h-4 w-14 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                      </div>

                      <div className="flex items-center justify-between min-w-0">
                        <div className="h-3 w-20 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                        <div className="h-3 w-14 bg-[var(--color-text-secondary)]/10 rounded animate-pulse ml-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
              {error instanceof Error ? error.message : "Failed to load transactions"}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="px-4 py-8 md:px-5 md:py-10">
              <div className="relative overflow-hidden rounded-[1.75rem] text-center">
                <div className="absolute inset-0 pointer-events-none" />
                <div className="relative z-10 mx-auto flex max-w-sm flex-col items-center gap-4">
                  {/* <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shadow-inner">
                    <PlusCircle size={24} />
                  </div> */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {hasAccounts ? "No Recent Transactions" : "Add an Account First"}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {hasAccounts
                        ? "Once you start recording activity, your latest transactions will show up here."
                        : "You need at least one account before any transaction activity can appear here."}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(hasAccounts ? "/transactions" : "/accounts")}
                    className="group mt-1 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] px-4 py-2.5 text-[11px] font-black text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)]"
                  >
                    <PlusCircle
                      size={16}
                      strokeWidth={2.5}
                      className="group-hover:rotate-90 transition-transform"
                    />
                    {hasAccounts ? "View Transactions" : "Add Account"}
                  </button>
                </div>
              </div>
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

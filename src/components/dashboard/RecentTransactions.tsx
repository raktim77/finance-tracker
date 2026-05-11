import { useState } from "react";
import { List, PlusCircle } from "lucide-react";
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

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  const formattedStartDate = formatApiDate(startDate);
  const formattedEndDate = formatApiDate(endDate);

  const { data, isLoading, isError, error } = useTransactions(
    {
      page: 1,
      limit: 4,
      sort: "latest",
      startDate: formattedStartDate,
      endDate: formattedEndDate,
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
    iconColor: acc.account_category_color || '#ddd',

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
  // px-2 py-3 md:px-4 md:py-4
  return (
    <div className="mt-4 md:mt-0 md:pl-6 pl-3 pr-2 md:pr-6 md:pb-6 md:p-6 w-full md:rounded-2xl md:border md:border-[var(--border)] md:bg-[var(--color-surface)] md:shadow-xs transition-all h-full flex flex-col">
      {currentItems.length > 0 ? (
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-[14px] md:text-base font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
            <span className="hidden md:inline">Recent Transactions</span>
            <span className="md:hidden">Recent History</span>
          </h2>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center px-1.5 md:px-3 py-1.5 rounded-xl md:border md:border-[var(--color-accent)]/20 md:bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold transition-all"
          >
            View all
            {/* <ArrowRight size={10} strokeWidth={3} className="ml-1"/> */}
          </button>
        </div>
      ) : ''}


      <div className="md:rounded-xl overflow-hidden w-full flex-1">
        <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-between gap-1 rounded-2xl md:py-3 py-2 min-w-0"
                >
                  {index !== 3 && (
                    <div className="absolute bottom-0 left-4 right-4 md:border-b md:border-dashed md:border-[var(--border)]" />
                  )}

                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-text-secondary)]/20 animate-pulse" />

                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 mb-2 min-w-0">
                        <div className="h-4 w-28 bg-[var(--color-text-secondary)]/20 rounded animate-pulse mb-2" />
                        <div className="h-4 w-14 bg-[var(--color-text-secondary)]/20 rounded animate-pulse" />
                      </div>

                      <div className="flex items-center justify-between min-w-0">
                        <div className="h-4 w-20 bg-[var(--color-text-secondary)]/20 rounded animate-pulse" />
                        <div className="h-3 w-14 bg-[var(--color-text-secondary)]/20 rounded animate-pulse ml-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-text-secondary)]/20 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-sm font-bold text-[var(--color-danger)]">
              {error instanceof Error ? error.message : "Failed to load transactions"}
            </div>
          ) :
            currentItems.length === 0 ? (
              <div style={{
                height: "100%",
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <style>{`
      @keyframes rt-pulse {
        0%,100%{ opacity:.45; transform:scale(1); }
        50%    { opacity:.90; transform:scale(1.07); }
      }
      @keyframes rt-float {
        0%,100%{ transform:translateY(0px); }
        50%    { transform:translateY(-4px); }
      }
      @keyframes rt-fadein {
        from{ opacity:0; transform:translateY(6px); }
        to  { opacity:1; transform:translateY(0); }
      }
    `}</style>

                <div style={{
                  borderRadius: 28,
                  width: "100%",
                  maxWidth: 360,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "center",
                  animation: "rt-fadein 0.4s ease both",
                  // paddingTop gives the outermost ring (18px bleed above icon) room to show
                  // paddingTop: 32,
                  paddingBottom: 8,
                  position: "relative",
                  // NO overflow:hidden — this is what caused clipping
                }}>

                  {/* icon wrapper sized to contain rings: 64px icon + 18px ring bleed each side = 100px */}
                  <div style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "rt-float 3.2s ease-in-out infinite",
                  }}>
                    {/* ring 1: sits 8px outside the 64px box → inset 10px from the 100px wrapper */}
                    <div style={{
                      position: "absolute",
                      inset: 10,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(34,197,94,.22)",
                      animation: "rt-pulse 2.8s ease-in-out infinite",
                      pointerEvents: "none",
                    }} />
                    {/* ring 2: sits 18px outside the 64px box → inset 0px from the 100px wrapper */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "1px solid rgba(34,197,94,.10)",
                      animation: "rt-pulse 2.8s ease-in-out 0.5s infinite",
                      pointerEvents: "none",
                    }} />

                    {/* icon box */}
                    <div style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: "linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
                      border: "1px solid rgba(34,197,94,.22)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 0 1px rgba(34,197,94,.06), 0 8px 24px rgba(34,197,94,.10)",
                      position: "relative", zIndex: 1,
                      flexShrink: 0,
                    }}>
                      {hasAccounts ? (
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="6" width="20" height="3" rx="1.5" fill="#22c55e" fillOpacity="0.9" />
                          <rect x="4" y="12.5" width="14" height="3" rx="1.5" fill="#22c55e" fillOpacity="0.55" />
                          <rect x="4" y="19" width="17" height="3" rx="1.5" fill="#22c55e" fillOpacity="0.30" />
                          <circle r="2" fill="white" fillOpacity="0.85">
                            <animateMotion dur="2.4s" repeatCount="indefinite"
                              path="M0 7.5 L16 7.5 M0 14 L10 14 M0 20.5 L13 20.5" />
                          </circle>
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="8" width="22" height="14" rx="3.5" stroke="#22c55e" strokeWidth="1.8" strokeOpacity="0.85" fill="none" />
                          <path d="M3 12h22" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.5" />
                          <circle cx="19.5" cy="17" r="2" fill="#22c55e" fillOpacity="0.9" />
                          <circle cx="22" cy="8" r="4" fill="var(--color-surface)" />
                          <path d="M22 5.5v5M19.5 8h5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 240 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--color-text-primary)" }}>
                      {hasAccounts ? "No Recent Transactions" : "Add an Account First"}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
                      {hasAccounts
                        ? "Your latest transactions from the last 7 days will show up here."
                        : "You need at least one account before any transaction activity can appear here."}
                    </p>
                  </div>

                  {/* original CTA button — unchanged */}
                  <button
                    onClick={() => navigate(hasAccounts ? "/transactions" : "/accounts")}
                    className="group mt-1 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] px-4 py-2.5 text-[11px] font-black text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)]"
                  >
                    {hasAccounts ? (
                      <List size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
                    ) : (
                      <PlusCircle size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
                    )}
                    {hasAccounts ? "View Transactions" : "Add Account"}
                  </button>

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

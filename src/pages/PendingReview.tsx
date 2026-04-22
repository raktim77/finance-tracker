import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Inbox,
} from "lucide-react";
import { getPendingSMS, updateSMSStatus } from "../lib/localDb";
import { isNativeAndroidApp } from "../lib/capacitor/platform";
import TransactionSheet, { type TransactionDraft } from "../components/transactions/TransactionSheet";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { useCategories } from "../features/categories/hooks/useCategories";
import { useCreateTransaction } from "../features/transactions/hooks/useTransactions";
import { useAuth } from "../lib/context/useAuth";
import { useToast } from "../components/ui/confirm-modal/useToast";
import {
  formatPendingDateTime,
  getPendingAmountClass,
  getPendingKind,
  getPendingSignedAmount,
  getPendingSubtitle,
  getPendingTitle,
  type PendingSMSItem,
} from "../components/pending/pendingDisplay";

function getPendingIcon(item: PendingSMSItem) {
  const kind = getPendingKind(item);
  if (kind === "income") return ArrowDownLeft;
  if (kind === "expense") return ArrowUpRight;
  return CircleHelp;
}

function getPendingIconStyle(item: PendingSMSItem) {
  const kind = getPendingKind(item);
  if (kind === "income") {
    return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  }
  if (kind === "expense") {
    return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
  }
  return "bg-[var(--color-accent-soft)] text-[var(--color-accent)]";
}

type TransactionType = TransactionDraft["type"];

type SheetAccount = {
  _id: string;
  name: string;
  type: string;
  balance?: number;
  icon: string;
  iconColor: string;
};

const GENERIC_ACCOUNT_WORDS = new Set([
  "account",
  "bank",
  "card",
  "credit",
  "current",
  "debit",
  "saving",
  "savings",
]);

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(value: string) {
  return normalizeMatchText(value)
    .split(" ")
    .filter((word) => word.length >= 3 && !GENERIC_ACCOUNT_WORDS.has(word));
}

function findMatchingAccount(item: PendingSMSItem, accounts: SheetAccount[]) {
  const searchableText = normalizeMatchText(
    [item.raw_message, item.sender, item.merchant].filter(Boolean).join(" ")
  );
  const searchableWords = new Set(searchableText.split(" ").filter(Boolean));

  const scoredAccounts = accounts
    .map((account) => {
      const accountName = normalizeMatchText(account.name);
      const accountWords = getWords(account.name);
      if (!accountName || accountWords.length === 0) return null;

      let score = 0;
      if (searchableText.includes(accountName)) {
        score += accountName.length >= 5 ? 100 : 45;
      }

      for (const word of accountWords) {
        if (searchableWords.has(word)) score += Math.min(word.length, 12);
      }

      return { account, score };
    })
    .filter((entry): entry is { account: SheetAccount; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  const [best, secondBest] = scoredAccounts;
  if (!best || best.score < 4) return null;
  if (secondBest && best.score === secondBest.score) return null;

  return best.account;
}

function toSupportedTransactionType(type: PendingSMSItem["type"]): TransactionType {
  if (type === "income" || type === "expense") return type;
  return "expense";
}

export default function PendingReview() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<PendingSMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPending, setSelectedPending] = useState<PendingSMSItem | null>(null);
  const { data: categoriesData } = useCategories({ accessToken });
  const { data: accountsData } = useAccounts({}, { accessToken });
  const createTransactionMutation = useCreateTransaction({ accessToken });

  const categories = categoriesData?.categories ?? [];
  const accounts = accountsData?.accounts ?? [];
  const mappedAccounts = useMemo(
    () =>
      accounts.map((account) => ({
        _id: account._id,
        name: account.name,
        type: account.account_category_group || "account",
        balance: account.current_balance,
        icon: account.account_category_icon || "help",
        iconColor: account.account_category_color || "#ddd",
      })),
    [accounts]
  );

  const loadPendingItems = useCallback(async () => {
    if (!isNativeAndroidApp()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await getPendingSMS();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isNativeAndroidApp()) {
        setLoading(false);
        return;
      }

      const data = await getPendingSMS();
      console.log("[RETRIEVED MESSAGES]",JSON.stringify(data))
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingDraft = useMemo<Partial<TransactionDraft> | null>(() => {
    if (!selectedPending) return null;

    const matchingAccount = findMatchingAccount(selectedPending, mappedAccounts);

    return {
      amount:
        typeof selectedPending.amount === "number" && !Number.isNaN(selectedPending.amount)
          ? selectedPending.amount
          : "",
      type: toSupportedTransactionType(selectedPending.type),
      account_id: matchingAccount?._id ?? null,
      category_id: null,
      note: selectedPending.merchant?.trim() || "",
      date: selectedPending.received_at ? new Date(selectedPending.received_at) : new Date(),
    };
  }, [mappedAccounts, selectedPending]);

  const handleSubmitPendingTransaction = async (payload: {
    amount: number;
    type: "expense" | "income" | "transfer";
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => {
    if (!selectedPending) return;

    try {
      await createTransactionMutation.mutateAsync(payload);
      await updateSMSStatus(selectedPending.id, "processed");
      await loadPendingItems();
      toast.success("Transaction recorded successfully");
      setSelectedPending(null);
    } catch (error) {
      console.error("Failed to review pending transaction", error);
      toast.error("Failed to record transaction");
      throw error;
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-hidden pb-24 animate-in fade-in duration-500 p-2">
        <section className="relative min-w-0 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-5 md:p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                            <Inbox size={24} strokeWidth={2.5} />
                        </div> */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                  SMS Review Queue
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)] break-words leading-tight">
                  {items.length} Pending {items.length > 1 ? "Transactions" : "Transaction"}
                </h2>
                <p className="mt-2 max-w-xl text-xs font-medium text-[var(--color-text-secondary)]">
                  Confirm detected SMS activity before it becomes part of your transaction history.
                </p>
              </div>
            </div>

            {/* <div className="flex w-fit max-w-full items-center gap-3 rounded-2xl bg-[var(--color-background)] px-4 py-3">
                        <ShieldCheck size={18} className="text-[var(--color-accent)]" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                                Waiting
                            </p>
                            <p className="text-lg font-black text-[var(--color-text-primary)]">
                                {items.length}
                            </p>
                        </div>
                    </div> */}
          </div>
        </section>

        <section className="min-w-0 overflow-hidden pl-1 gap-3">
          {loading ? (
            <div className="flex flex-col gap-1 p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex min-w-0 items-center gap-3 rounded-2xl p-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-36 rounded bg-[var(--color-text-secondary)]/10 animate-pulse" />
                    <div className="h-3 max-w-full w-48 rounded bg-[var(--color-text-secondary)]/10 animate-pulse" />
                  </div>
                  <div className="hidden h-4 w-20 rounded bg-[var(--color-text-secondary)]/10 animate-pulse sm:block" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-background)] text-[var(--color-text-secondary)]">
                <Inbox size={28} />
              </div>
              <div>
                <h2 className="text-base font-black text-[var(--color-text-primary)]">
                  Nothing waiting for review
                </h2>
                <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
                  New SMS-detected transactions will appear here with amount, merchant, and time.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item, index) => {
                const Icon = getPendingIcon(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      borderLeftColor:
                        item.type === "income"
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                    }}
                    className={`relative flex items-center justify-between pl-2 py-3 md:mb-0 mb-2
border-l-[3px] pl-3 md:border-l-0 rounded-r-xl md:rounded-none 
md:hover:bg-[var(--color-background)] transition-all group min-w-0 cursor-pointer
active:scale-[0.97] active:brightness-[0.98] active:bg-[var(--color-accent-soft)] gap-1`}

                    // className="group relative flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl py-3 px-2 text-left transition-all hover:bg-[var(--color-background)] active:scale-[0.995] overflow-hidden"
                    onClick={() => {
                      if (mappedAccounts.length === 0) {
                        toast.error("Please add an account first");
                        return;
                      }
                      setSelectedPending(item);
                    }}
                  >
                    {index !== items.length - 1 && (
                      <span className="absolute bottom-0 left-16 right-4 border-b border-[var(--border)]" />
                    )}

                    <div className="flex w-0 min-w-0 flex-1 items-center gap-3 md:gap-4 overflow-hidden">
                      <div className={`flex h-11 w-11 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)]/10 ${getPendingIconStyle(item)}`}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>

                      <div className="w-0 min-w-0 flex-1 overflow-hidden">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 sm:gap-4 mb-3">
                          <span className="block flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[15px] text-[var(--color-text-primary)] tracking-tight leading-tight">
                            {getPendingTitle(item)}
                          </span>
                          <span className={`max-w-[40vw] sm:max-w-none truncate shrink-0 text-right text-sm font-black whitespace-nowrap ${getPendingAmountClass(item)}`}>
                            {getPendingSignedAmount(item)}
                          </span>
                        </div>

                        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 overflow-hidden text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                          <span className="max-w-[40%] truncate opacity-70">{getPendingSubtitle(item)}</span>
                          {/* <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/25" /> */}
                          <span className="flex min-w-0 items-center gap-1 truncate">
                            <span className="truncate text-[var(--color-text-secondary)] uppercase opacity-70 tracking-wider">{formatPendingDateTime(item.received_at)}</span>
                          </span>
                          {/* <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/25" /> */}
                          {/* <div className="flex items-center leading-none gap-0.5 opacity-50">
                                                    <span className="shrink-0 text-[var(--color-text-primary)] pt-0.5">Review</span>
                                                    <ChevronRight
                                                        size={16}
                                                        strokeWidth={2.5}
                                                        className="shrink-0 text-[var(--color-accent)] translate-y-[0.5px]"
                                                    />
                                                </div> */}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={2.5}
                      className="shrink-0 text-[var(--color-text-secondary)] opacity-30 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)] group-hover:opacity-100 "
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <TransactionSheet
        open={!!selectedPending}
        onClose={() => setSelectedPending(null)}
        categories={categories}
        accounts={mappedAccounts}
        onSubmit={handleSubmitPendingTransaction}
        loading={createTransactionMutation.isPending}
        initialData={null}
        defaultData={pendingDraft}
        sourceMessage={selectedPending?.raw_message ?? null}
      />
    </>
  );
}

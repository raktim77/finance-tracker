import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Clock3,
  Inbox,
  ShieldCheck,
} from "lucide-react";

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

export default function PendingReview() {
  const [items, setItems] = useState<PendingSMSItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Date.now();

    // 🔥 production-level mock dataset
    const mock: PendingSMSItem[] = [
      {
        id: "1",
        raw_message: "Rs.2,499 debited via UPI to Amazon Pay",
        sender: "HDFCBK",
        amount: 2499,
        type: "expense",
        merchant: "Amazon",
        confidence: 0.96,
        received_at: now - 1000 * 60 * 2,
      },
      {
        id: "2",
        raw_message: "Rs.15,000 credited as salary from Infosys Ltd",
        sender: "INFOSYS",
        amount: 15000,
        type: "income",
        merchant: "Infosys",
        confidence: 0.99,
        received_at: now - 1000 * 60 * 30,
      },
      {
        id: "3",
        raw_message: "Paid Rs.120 to Swiggy",
        sender: "SWIGGY",
        amount: 120,
        type: "expense",
        merchant: "Swiggy",
        confidence: 0.92,
        received_at: now - 1000 * 60 * 60,
      },
      {
        id: "4",
        raw_message: "Rs.799 debited for Flipkart order",
        sender: "FLIPKART",
        amount: 799,
        type: "expense",
        merchant: "Flipkart",
        confidence: 0.94,
        received_at: now - 1000 * 60 * 60 * 2,
      },
      {
        id: "5",
        raw_message: "Rs.500 received via UPI from Rahul",
        sender: "UPI",
        amount: 500,
        type: "income",
        merchant: "Rahul",
        confidence: 0.88,
        received_at: now - 1000 * 60 * 60 * 3,
      },
      {
        id: "6",
        raw_message: "Rs.1,299 debited for Zomato order",
        sender: "ZOMATO",
        amount: 1299,
        type: "expense",
        merchant: "Zomato",
        confidence: 0.91,
        received_at: now - 1000 * 60 * 60 * 5,
      },
      {
        id: "7",
        raw_message: "Rs.8,750 credited from freelance client",
        sender: "PAYMENT",
        amount: 8750,
        type: "income",
        merchant: "Freelance",
        confidence: 0.85,
        received_at: now - 1000 * 60 * 60 * 8,
      },
      {
        id: "8",
        raw_message: "Rs.49 debited for Google Play subscription",
        sender: "GOOGLE",
        amount: 49,
        type: "expense",
        merchant: "Google Play",
        confidence: 0.89,
        received_at: now - 1000 * 60 * 60 * 12,
      },
      {
        id: "9",
        raw_message: "Transaction alert: Rs.3,200 spent at Reliance Smart",
        sender: "ICICIBK",
        amount: 3200,
        type: "expense",
        merchant: "Reliance Smart",
        confidence: 0.93,
        received_at: now - 1000 * 60 * 60 * 18,
      },
      {
        id: "10",
        raw_message: "Rs.2,000 credited via UPI",
        sender: "UPI",
        amount: 2000,
        type: "income",
        merchant: null,
        confidence: 0.6, // 🔥 low confidence example
        received_at: now - 1000 * 60 * 60 * 24,
      },
      {
        id: "11",
        raw_message: "Alert: Transaction detected",
        sender: "UNKNOWN",
        amount: null,
        type: "unknown",
        merchant: null,
        confidence: 0.3,
        received_at: now - 1000 * 60 * 60 * 30,
      },
    ];

    // optional: sort like backend (latest first)
    mock.sort((a, b) => (b.received_at ?? 0) - (a.received_at ?? 0));

    setItems(mock);
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-hidden pb-24 animate-in fade-in duration-500">
      <section className="relative min-w-0 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-5 md:p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Inbox size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                SMS Review Queue
              </p>
              <h2 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)] break-words leading-tight">
                Pending Transactions
              </h2>
              <p className="mt-2 max-w-xl text-sm font-medium text-[var(--color-text-secondary)]">
                Confirm detected SMS activity before it becomes part of your transaction history.
              </p>
            </div>
          </div>

          <div className="flex w-fit max-w-full items-center gap-3 rounded-2xl bg-[var(--color-background)] px-4 py-3">
            <ShieldCheck size={18} className="text-[var(--color-accent)]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                Waiting
              </p>
              <p className="text-lg font-black text-[var(--color-text-primary)]">
                {items.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-2 shadow-sm">
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
                  className="group relative flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl p-3 text-left transition-all hover:bg-[var(--color-background)] active:scale-[0.995] overflow-hidden"
                  onClick={() => {
                    console.log("Clicked:", item);
                    // next step: open review modal
                  }}
                >
                  {index !== items.length - 1 && (
                    <span className="absolute bottom-0 left-4 right-4 border-b border-dashed border-[var(--border)]" />
                  )}

                  <div className="flex w-0 min-w-0 flex-1 items-center gap-3 md:gap-4 overflow-hidden">
                    <div className={`flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)]/10 ${getPendingIconStyle(item)}`}>
                      <Icon size={19} strokeWidth={2.5} />
                    </div>

                    <div className="w-0 min-w-0 flex-1 overflow-hidden">
                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
                        <span className="truncate text-[15px] font-black text-[var(--color-text-primary)]">
                          {getPendingTitle(item)}
                        </span>
                        <span className={`max-w-[40vw] sm:max-w-none truncate shrink-0 text-right text-sm font-black whitespace-nowrap ${getPendingAmountClass(item)}`}>
                          {getPendingSignedAmount(item)}
                        </span>
                      </div>

                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                        {/* <span className="max-w-[40%] truncate">{getPendingSubtitle(item)}</span> */}
                        {/* <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/25" /> */}
                        <span className="flex min-w-0 items-center gap-1 truncate">
                          {/* <Clock3 size={12} /> */}
                          <span className="truncate">{formatPendingDateTime(item.received_at)}</span>
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/25" />
                        <span className="shrink-0 text-[var(--color-accent)]">Review</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    strokeWidth={2.5}
                    className="hidden shrink-0 text-[var(--color-text-secondary)] opacity-30 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)] group-hover:opacity-100 sm:block"
                  />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

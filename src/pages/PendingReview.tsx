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

// ❌ removed: getPendingSMS + native check

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
    // 🔥 realistic dummy data (matches SMS parsing expectations)
  const dummy: PendingSMSItem[] = [
  {
    id: "1",
    raw_message: "Rs.2,500 credited to your HDFC Bank account via UPI.",
    sender: "HDFCBK",
    received_at: Date.now(),
  },
  {
    id: "2",
    raw_message: "Rs.799 debited from your account for Amazon purchase.",
    sender: "AMAZON",
    received_at: Date.now(),
  },
  {
    id: "3",
    raw_message: "Paid Rs.120 to Swiggy using UPI.",
    sender: "SWIGGY",
    received_at: Date.now(),
  },
  {
    id: "4",
    raw_message: "Rs.15,000 credited as salary from TCS.",
    sender: "TCS",
    received_at: Date.now(),
  },
];

    setItems(dummy);
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-32 px-4 pt-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-5 md:p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Inbox size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                SMS Review Queue
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
                Pending Transactions
              </h1>
            </div>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl bg-[var(--color-background)] px-4 py-3 border border-[var(--border)]">
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

      {/* LIST SECTION */}
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-2 shadow-sm">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full rounded-2xl bg-[var(--color-background)] animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
            <Inbox
              size={32}
              className="text-[var(--color-text-secondary)] opacity-20"
            />
            <h2 className="text-base font-black text-[var(--color-text-primary)]">
              Nothing waiting for review
            </h2>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const Icon = getPendingIcon(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  className="group relative flex w-full items-start gap-4 rounded-2xl p-4 transition-all hover:bg-[var(--color-background)] active:scale-[0.99]"
                  onClick={() => console.log("Review:", item)}
                >
                  {/* ICON */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)]/10 ${getPendingIconStyle(
                      item
                    )} shadow-sm`}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                  </div>

                  {/* DATA */}
                  <div className="flex-1 w-0 flex flex-col gap-1">
                    {/* ROW 1 */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[15px] font-black text-[var(--color-text-primary)]">
                        {getPendingTitle(item)}
                      </span>
                      <span
                        className={`shrink-0 text-sm font-black ${getPendingAmountClass(
                          item
                        )}`}
                      >
                        {getPendingSignedAmount(item)}
                      </span>
                    </div>

                    {/* ROW 2 */}
                    <div className="truncate text-xs font-bold text-[var(--color-text-secondary)] opacity-80">
                      {getPendingSubtitle(item)}
                    </div>

                    {/* ROW 3 */}
                    <div className="mt-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        <Clock3 size={12} />
                        {formatPendingDateTime(item.received_at)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/20" />
                      <span className="text-[var(--color-accent)] flex items-center gap-1">
                        Review Action{" "}
                        <ChevronRight
                          size={12}
                          strokeWidth={3}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
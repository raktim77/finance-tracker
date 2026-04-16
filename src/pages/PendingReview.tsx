import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { getPendingSMS } from "../lib/localDb";
import { isNativeAndroidApp } from "../lib/capacitor/platform";
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
    let cancelled = false;

    const load = async () => {
      if (!isNativeAndroidApp()) {
        setLoading(false);
        return;
      }

      const data = await getPendingSMS();
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

            <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--color-surface)] p-2 shadow-sm">
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
                                    className="group relative flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl py-3 px-2 text-left transition-all hover:bg-[var(--color-background)] active:scale-[0.995] overflow-hidden"
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
                                            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4 mb-3">
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
    );
}

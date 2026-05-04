import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock3, Inbox } from "lucide-react";
import { getPendingSMS } from "../../lib/localDb";
import { listenForPendingSMSUpdates } from "../../lib/pendingSmsEvents";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import {
    formatPendingDateTime,
    getPendingSignedAmount,
    getPendingTitle,
    type PendingSMSItem,
} from "./pendingDisplay";

export default function PendingReviewCard() {
    const [items, setItems] = useState<PendingSMSItem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!isNativeAndroidApp()) return;
            const data = await getPendingSMS();
            if (!cancelled) setItems(data);
        };

        load();
        const removePendingSMSListener = listenForPendingSMSUpdates(() => {
            void load();
        });

        return () => {
            cancelled = true;
            removePendingSMSListener();
        };
    }, []);

    if (!isNativeAndroidApp()) return null;

    const count = items.length;
    const latest = items[0];
    const latestColor =
        latest?.type === "income"
            ? "text-[var(--color-success)]"
            : "text-[var(--color-danger)]";

    if (count === 0) return null;

    return (
        <>
            <style>{`
                @keyframes pending-border-spin {
                    0%   { --pending-angle: 0deg; }
                    100% { --pending-angle: 360deg; }
                }

                @property --pending-angle {
                    syntax: "<angle>";
                    initial-value: 0deg;
                    inherits: false;
                }

                .pending-border-wrap {
                    position: relative;
                    padding: 1.5px;
                    border-radius: 1rem; /* matches rounded-2xl = 16px */
                    animation: pending-border-spin 3s linear infinite;
                    /* The spinning conic gradient forms the "border" */
                    background: conic-gradient(
                        from var(--pending-angle),
                        transparent 0deg,
                        transparent 60deg,
                        var(--pending-accent, #22c55e) 90deg,
                        var(--pending-accent-bright, #86efac) 120deg,
                        var(--pending-accent, #22c55e) 150deg,
                        transparent 180deg,
                        transparent 360deg
                    );
                }

                /* Inner card sits on top, covering the gradient except for the 1.5px gap */
                .pending-border-inner {
                    position: relative;
                    z-index: 1;
                    border-radius: calc(1rem - 1.5px);
                    background: var(--color-surface);
                    overflow: hidden;
                }


            `}</style>

            {/*
              CSS custom property injection via inline style.
              Reads from your existing --color-accent variable so it
              automatically adapts to light / dark themes.
            */}
            <div
                className="pending-border-wrap mt-2 -mb-2 w-full"
                style={{
                    "--pending-accent": "var(--color-accent-teal)",
                    "--pending-accent-bright": "color-mix(in srgb, var(--color-accent) 60%, white)",
                } as React.CSSProperties}
            >
                <div
                    className="pending-border-inner group w-full cursor-pointer p-4 md:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
                    onClick={() => navigate("/pending-review")}
                >
                    <div className="flex w-full items-center justify-between gap-3">
                        {/* Main Content */}
                        <div className="flex flex-1 items-center gap-3 md:gap-4 w-0">
                            <div className="flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                                <Inbox size={20} strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 w-0">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                        Pending Review
                                    </p>
                                </div>

                                <h2 className="mt-0.5 truncate text-base md:text-lg font-black text-[var(--color-text-primary)]">
                                    {count} {count === 1 ? "transaction" : "transactions"} waiting
                                </h2>

                                {latest && (
                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                                        <span className="truncate max-w-[60%] opacity-80">
                                            {getPendingTitle(latest)}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/30 shrink-0" />
                                        <span className={`shrink-0 ${latestColor}`}>
                                            {getPendingSignedAmount(latest)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Action */}
                        <div className="flex shrink-0 items-center gap-2">
                            {latest && (
                                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--color-background)] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                                    <Clock3 size={12} />
                                    {formatPendingDateTime(latest.received_at)}
                                </div>
                            )}
                            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-[var(--color-background)] text-[var(--color-text-secondary)] transition-all group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5">
                                <ChevronRight size={18} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
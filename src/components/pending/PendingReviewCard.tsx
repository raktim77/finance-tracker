import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock3, Inbox, Sparkles } from "lucide-react";
import { getPendingSMS } from "../../lib/localDb";
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
        return () => { cancelled = true; };
    }, []);

    if (!isNativeAndroidApp()) return null;

    const count = items.length;
    const latest = items[0];
    const latestColor = latest?.type == 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
    if (count === 0) return null;

    return (
        <div
            onClick={() => navigate("/pending-review")}
            className="group relative w-full overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.99] cursor-pointer mb-4"
        >
            <div className="flex w-full items-center justify-between gap-3">
                {/* 1. Main Content Wrapper: Forced to flex-1 and w-0 to contain children */}
                <div className="flex flex-1 items-center gap-3 md:gap-4 w-0">
                    <div className="flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent)]/10 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <Inbox size={20} strokeWidth={2.5} />
                    </div>

                    {/* 2. Text Wrapper: Using w-0 here is critical for the 'truncate' titles */}
                    <div className="flex-1 w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                Pending Review
                            </p>
                            <Sparkles size={12} className="shrink-0 text-[var(--color-primary)]" />
                        </div>
                        
                        <h2 className="mt-0.5 truncate text-base md:text-lg font-black text-[var(--color-text-primary)]">
                            {count} {count === 1 ? "transaction" : "transactions"} waiting
                        </h2>

                        {latest && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                                <span className="truncate max-w-[60%] opacity-80">{getPendingTitle(latest)}</span>
                                <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/30 shrink-0" />
                                <span className={`shrink-0 ${latestColor}`}>{getPendingSignedAmount(latest)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Right Action Area */}
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
    );
}
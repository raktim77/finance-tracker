import { Calendar } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import type { AnalyticsDatePreset, AnalyticsDateRange } from "./data/types";
import { analyticsDatePresetOptions } from "./data/dateRange";

type AnalyticsHeaderProps = {
  selectedPreset: AnalyticsDatePreset;
  overviewText: string;
  onPresetChange: (preset: AnalyticsDatePreset) => void;
  isCustomModalOpen: boolean;
  pendingRange: AnalyticsDateRange;
  customError: string | null;
  onPendingFromChange: (date: Date | undefined) => void;
  onPendingToChange: (date: Date | undefined) => void;
  onCustomCancel: () => void;
  onCustomApply: () => void;
};

export function AnalyticsHeader({
  selectedPreset,
  overviewText,
  onPresetChange,
  isCustomModalOpen,
  pendingRange,
  customError,
  onPendingFromChange,
  onPendingToChange,
  onCustomCancel,
  onCustomApply
}: AnalyticsHeaderProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-4">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
            Analytics
          </h2>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-[var(--color-accent)]" />
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-60">
              {overviewText}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[220px]">
          <Dropdown
            value={selectedPreset}
            onChange={(value) => onPresetChange(value as AnalyticsDatePreset)}
            options={analyticsDatePresetOptions}
            className="w-full"
            buttonClassName="rounded-2xl h-[46px] text-[10px] uppercase tracking-widest font-black"
          />
        </div>
      </div>

      {isCustomModalOpen && (
        <>
          <div className="fixed inset-0 z-[180] bg-black/30 backdrop-blur-sm" onClick={onCustomCancel} />
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--color-surface)] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col gap-1 mb-5">
                <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">
                  Custom Range
                </h3>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Select a From and To date.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-70">
                    From
                  </span>
                  <div className="w-full px-4 h-11 bg-[var(--color-background)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold transition-all hover:border-[var(--color-accent)]/30 flex items-center">
                    <DatePicker value={pendingRange.from} onChange={onPendingFromChange} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-70">
                    To
                  </span>
                  <div className="w-full px-4 h-11 bg-[var(--color-background)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold transition-all hover:border-[var(--color-accent)]/30 flex items-center">
                    <DatePicker value={pendingRange.to} onChange={onPendingToChange} />
                  </div>
                </div>
              </div>

              {customError && (
                <p className="mt-3 text-xs font-bold text-[var(--color-danger)]">{customError}</p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCustomCancel}
                  className="px-4 h-10 rounded-xl border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onCustomApply}
                  className="px-5 h-10 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] text-xs font-black uppercase tracking-widest text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

import { ChevronRight } from "lucide-react";
import type { Transaction } from "../../features/transactions/types/transaction.types";
import resolveLucideIcon from "../../utils/LucideIconsResolver";
import { getTransactionDisplayAmount } from "../../features/transactions/utils/transactionDisplay";

type Props = {
  transaction: Transaction;
  title: string;
  categoryLabel: string;
  displayDate: string;
  layoutMode?: "auto" | "compact";
  showDivider?: boolean;
  onClick: () => void;
};

export default function TransactionListItem({
  transaction,
  title,
  categoryLabel,
  displayDate,
  layoutMode = "auto",
  showDivider = false,
  onClick,
}: Props) {
  const isCompact = layoutMode === "compact";
  const Icon =
    transaction.type === "income" || transaction.type === "expense"
      ? resolveLucideIcon(transaction.category_icon)
      : resolveLucideIcon("arrow-left-right");

  const displayAmount = getTransactionDisplayAmount(transaction);
  const isSignedType =
    transaction.type === "expense" || transaction.type === "income";
  const amountClassName = isSignedType
    ? displayAmount < 0
      ? "text-[var(--color-danger)]"
      : displayAmount > 0
        ? "text-[var(--color-success)]"
        : "text-[var(--color-text-secondary)]"
    : "text-[var(--color-text-primary)]";

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-between p-3 hover:bg-[var(--color-background)] rounded-2xl transition-all group min-w-0 cursor-pointer ${
        isCompact ? "gap-1" : "gap-1 md:gap-8 md:p-4"
      }`}
    >
      {showDivider && (
        <div className="absolute bottom-0 left-4 right-4 border-b border-dashed border-[var(--border)]" />
      )}

      <div className={`flex items-center min-w-0 flex-1 ${isCompact ? "gap-3" : "gap-3 md:gap-4"}`}>
        <div
          className="w-10 h-10 shrink-0 rounded-full border border-[var(--border)]/10 flex items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors"
          style={
            transaction.type === "income" || transaction.type === "expense"
              ? {
                  backgroundColor: `${transaction.category_color}15`,
                  color: transaction.category_color,
                }
              : {
                  backgroundColor: "#0d948815",
                  color: "#0d9488",
                }
          }
        >
          <Icon size={18} />
        </div>

        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 mb-2 min-w-0">
            <span className="block flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[15px] text-[var(--color-text-primary)] tracking-tight leading-tight">
              {title}
            </span>

            <span className={`${isCompact ? "inline-block" : "md:hidden"} font-black text-sm shrink-0 whitespace-nowrap ${amountClassName}`}>
              {isSignedType ? (displayAmount < 0 ? "-" : displayAmount > 0 ? "+" : "") : ""}
              ₹{Math.abs(displayAmount).toLocaleString()}
            </span>
          </div>

          <div className={`flex items-center justify-between min-w-0 ${isCompact ? "" : "md:justify-start md:gap-2"}`}>
            <span className={`text-[10px] font-black text-[var(--color-text-secondary)] uppercase truncate opacity-70 ${isCompact ? "flex-1 max-w-[120px]" : "flex-1 md:flex-none max-w-[120px] md:max-w-96"}`}>
              {categoryLabel}
            </span>
            <span className={`${isCompact ? "hidden" : "hidden md:block"} w-1 h-1 rounded-full bg-[var(--color-text-secondary)] opacity-20 shrink-0`} />
            <span className={`shrink-0 text-[10px] font-black text-[var(--color-text-secondary)] uppercase opacity-70 tracking-wider ${isCompact ? "ml-4" : "ml-4 md:ml-0"}`}>
              {displayDate}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex items-center shrink-0 min-w-fit ${isCompact ? "gap-1" : "gap-1 md:gap-2"}`}>
        <div className={`font-black text-sm shrink-0 whitespace-nowrap ${amountClassName} ${isCompact ? "" : "md:text-base"}`}>
          <span className={isCompact ? "hidden" : "hidden md:block"}>
            {isSignedType ? (displayAmount < 0 ? "-" : displayAmount > 0 ? "+" : "") : ""}
            ₹{Math.abs(displayAmount).toLocaleString()}
          </span>
        </div>

        <ChevronRight
          size={14}
          strokeWidth={2.5}
          className={`text-[var(--color-text-secondary)] transition-all duration-300 ${
            isCompact
              ? "opacity-20"
              : "opacity-20 md:opacity-0 md:-translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100"
          }`}
        />
      </div>
    </div>
  );
}

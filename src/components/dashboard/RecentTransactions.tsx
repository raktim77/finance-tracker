import { Utensils, Briefcase, ShoppingBag, Car } from "lucide-react";
import { TransactionItem } from "./TransactionItem";

export const RecentTransactions = () => {
  return (
    <div className="rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all h-full">
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
          Recent History
        </h2>
        <button className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-black uppercase tracking-widest hover:brightness-95 transition-all">
          See All
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <TransactionItem
          name="Swiggy"
          category="Food"
          date="Today, 2:45 PM"
          amount="-₹420"
          icon={Utensils}
          negative
        />
        <TransactionItem
          name="Salary"
          category="Work"
          date="Yesterday"
          amount="+₹45,000"
          icon={Briefcase}
        />
        <TransactionItem
          name="Amazon"
          category="Shopping"
          date="Mar 07, 2026"
          amount="-₹2,199"
          icon={ShoppingBag}
          negative
        />
        <TransactionItem
          name="Uber"
          category="Transport"
          date="Mar 06, 2026"
          amount="-₹340"
          icon={Car}
          negative
        />
      </div>
    </div>
  );
};
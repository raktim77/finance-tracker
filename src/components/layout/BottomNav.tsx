import { NavLink } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  Wallet,
  Plus,
  Ellipsis,
} from "lucide-react";

type BottomNavProps = {
  onAddTransaction: () => void;
};

/**
 * Compact Floating Bottom Navigation - Theme Aware Edition
 * Fixed: Stuck in dark mode, inconsistent borders, and height issues.
 */
export default function BottomNav({ onAddTransaction }: BottomNavProps) {
  return (
    <div
      className="fixed left-0 right-0 px-3 lg:hidden z-50"
      style={{ bottom: "calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 0.1rem)" }}
    >
      <nav className="
        mx-auto max-w-[420px] h-16
        bg-[var(--color-bottom-nav-surface)]/95
        backdrop-blur-2xl
        border border-[var(--color-bottom-nav-border)]
        rounded-[2rem]
        shadow-[var(--color-bottom-nav-shadow)]
        ring-1 ring-white/20 dark:ring-white/6
        relative
      ">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-5 h-full items-center">

          {/* Home */}
          <NavLink
            to="/dashboard" replace
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive
                ? "text-[var(--color-nav-highlight)] scale-105"
                : "text-[var(--color-text-secondary)] "
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Home size={18} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
              </>
            )}
          </NavLink>

          {/* History */}
          <NavLink 
            to="/transactions" replace
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive
                ? "text-[var(--color-nav-highlight)] scale-105"
                : "text-[var(--color-text-secondary)] "
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ArrowLeftRight size={18} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest">History</span>
              </>
            )}
          </NavLink>

          {/* Center Action (Copper Highlight) */}
          <div className="flex justify-center relative h-full">
            <button
              type="button"
              onClick={onAddTransaction}
              className="
                absolute -top-6 w-14 h-14 rounded-2xl
                bg-[var(--color-primary)] text-[var(--color-background)]
                flex items-center justify-center
                shadow-[0_15px_35px_rgba(198,124,78,0.4)]
                active:scale-90 transition-all duration-300
                border-[4px] border-[var(--color-bottom-nav-surface)]
              "
              aria-label="Add Transaction"
            >
              <Plus size={28} strokeWidth={3.5} />
            </button>
          </div>

          {/* Accounts */}
          <NavLink
            to="/accounts" replace
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive
                ? "text-[var(--color-nav-highlight)] scale-105"
                : "text-[var(--color-text-secondary)] "
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Wallet size={18} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest">Accounts</span>
              </>
            )}
          </NavLink>

          {/* Budgets */}
          <NavLink
            to="/more" replace
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive
                ? "text-[var(--color-nav-highlight)] scale-105"
                : "text-[var(--color-text-secondary)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Ellipsis size={18} strokeWidth={isActive ? 3 : 2} /> {/* Use Plus rotated as a 'More' icon or lucide 'Menu' */}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">More</span>
              </>
            )}
          </NavLink>

        </div>
      </nav>
    </div>
  );
}

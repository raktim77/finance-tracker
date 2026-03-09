import { NavLink } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  Wallet,
  Plus,
  Logs
} from "lucide-react";

export default function BottomNav() {
  return (<nav className="fixed bottom-0 left-0 right-0 h-18 lg:hidden
   bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)]
   backdrop-blur-md
   border-t border-[var(--input-border)]
   z-50
   shadow-[0_-8px_24px_rgba(0,0,0,0.05)]
   dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]
   pb-[env(safe-area-inset-bottom)]">

    {/* 5-Column Grid for perfect centering */}
    <div className="grid grid-cols-5 h-full w-full items-center">

      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1.5 transition-all ${isActive
            ? "text-[var(--color-accent)] scale-105"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`
        }
      >
        <Home size={22} strokeWidth={2.5} />
        <span className="text-[11px] font-bold tracking-tight">Home</span>
      </NavLink>

      {/* History */}
      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1.5 transition-all ${isActive
            ? "text-[var(--color-accent)] scale-105"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`
        }
      >
        <ArrowLeftRight size={22} strokeWidth={2.5} />
        <span className="text-[11px] font-bold tracking-tight">History</span>
      </NavLink>

      {/* Floating Add Button Wrapper */}
      <div className="flex justify-center items-start h-full relative">
        <button
          className="absolute -top-6 w-15 h-15 rounded-2xl
          bg-[var(--color-accent)] text-white
          flex items-center justify-center
          shadow-[0_10px_25px_rgba(124,108,255,0.45)]
          active:scale-90 transition-all
          border-[6px] border-[var(--color-background)]"
          aria-label="Add Transaction"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Wallets */}
      <NavLink
        to="/wallets"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1.5 transition-all ${isActive
            ? "text-[var(--color-accent)] scale-105"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`
        }
      >
        <Wallet size={22} strokeWidth={2.5} />
        <span className="text-[11px] font-bold tracking-tight">Wallets</span>
      </NavLink>

      {/* Menu */}
      <NavLink
        to="/menu"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1.5 transition-all ${isActive
            ? "text-[var(--color-accent)] scale-105"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`
        }
      >
        <Logs size={22} strokeWidth={2.5} />
        <span className="text-[11px] font-bold tracking-tight">Menu</span>
      </NavLink>

    </div>
  </nav>
  );
}

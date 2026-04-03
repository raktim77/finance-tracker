import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { useConfirm } from "../ui/confirm-modal/useConfirm";
import { useAuth } from "../../lib/context/useAuth";

import Logo from "../../assets/images/logo.png";
import onlyLogo from "../../assets/images/only_logo.png";

type SidebarProps = {
  collapsed: boolean;
  onAddTransaction: () => void;
};

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  { name: "Accounts", icon: Wallet, path: "/accounts" },
  { name: "Budgets", icon: Target, path: "/budgets" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Settings", icon: Settings, path: "/settings" }
];

export default function Sidebar({ collapsed, onAddTransaction }: SidebarProps) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Logout?",
      message: "You will be signed out from this device.",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!ok) return;

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside
      className={`hidden lg:block relative z-[20] h-screen transition-all duration-300 ease-in-out sticky top-0 overflow-visible
      bg-[var(--color-surface)] border-r border-[var(--input-border)]
      ${collapsed ? "w-[80px]" : "w-[260px]"}`}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div
          className="flex items-center justify-center px-4 h-[var(--header-h)] cursor-pointer mb-2"
          onClick={() => navigate("/dashboard")}
        >
          <div className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <img
              src={collapsed ? onlyLogo : Logo}
              className={`h-9 w-auto transition-all duration-300 ${collapsed ? 'px-1' : ''}`}
              alt="xpensio logo"
            />
          </div>
        </div>

        {/* Navigation - Restored to your original style */}
        <nav className="flex flex-col gap-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center group
                  h-11 rounded-xl transition-all duration-200
                  ${collapsed ? "justify-center" : "px-3"}
                  ${isActive
                    ? `bg-[var(--color-surface-elevated)] text-[var(--color-accent)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-[var(--color-accent-soft)]`
                    : `text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-primary)]`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center justify-center min-w-[32px] transition-colors ${isActive ? "text-[var(--color-accent)]" : "group-hover:text-[var(--color-accent)]"}`}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {!collapsed && (
                      <span className="ml-3 text-[14px] font-semibold tracking-tight whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                        {item.name}
                      </span>
                    )}
                    {collapsed && (
                      <div className="absolute left-16 z-[1300] scale-0 group-hover:scale-100 transition-all bg-[var(--color-text-primary)] text-[var(--color-surface)] text-xs px-2 py-1.5 rounded-md font-bold pointer-events-none whitespace-nowrap shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* --- FLAT PREMIUM RECORD BUTTON --- */}
        <button
          type="button"
          onClick={onAddTransaction}
          className={`relative group mt-4 flex items-center rounded-2xl transition-all duration-200
            ${collapsed ? "justify-center h-12" : "px-4 h-12 gap-3"}
            bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20
            hover:scale-[1.02] active:scale-95`}
        >
          <PlusCircle size={20} strokeWidth={3} />
          {!collapsed && (
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              New Transaction
            </span>
          )}
        </button>
        </nav>

        {/* --- REFINED LOGOUT SECTION --- */}
      <div className="mt-auto px-3 pb-8 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className={`relative group flex w-full items-center rounded-xl transition-all duration-200
            ${collapsed ? "justify-center h-11" : "px-4 h-11"}
            text-[var(--color-danger)] hover:bg-red-500/10 font-black`}
        >
          <LogOut size={20} strokeWidth={2.5} />
          {!collapsed && (
            <span className="ml-3 text-[13px] uppercase tracking-widest">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
    </aside>
  );
}
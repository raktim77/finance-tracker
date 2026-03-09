import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  Settings
} from "lucide-react";

import Logo from "../../assets/images/logo.png";
import onlyLogo from "../../assets/images/only_logo.png";

type SidebarProps = {
  collapsed: boolean;
};

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  { name: "Wallets", icon: Wallet, path: "/wallets" },
  { name: "Budgets", icon: Target, path: "/budgets" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Settings", icon: Settings, path: "/settings" }
];

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className={`hidden lg:block h-screen transition-all duration-300 ease-in-out sticky top-0
      bg-[var(--color-surface)] border-r border-[var(--input-border)]
      ${collapsed ? "w-[80px]" : "w-[260px]"}`}
    >
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

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                relative flex items-center group
                h-11 rounded-xl transition-all duration-200
                ${collapsed ? "justify-center" : "px-3"}
                ${isActive
                  ? `
                      bg-[var(--color-surface-elevated)] 
                      text-[var(--color-accent)] 
                      shadow-[0_4px_12px_rgba(0,0,0,0.05)]
                      dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                      ring-1 ring-[var(--color-accent-soft)]
                    `
                  : `
                      text-[var(--color-text-secondary)] 
                      hover:bg-[var(--color-accent-soft)] 
                      hover:text-[var(--color-text-primary)]
                    `
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon Container */}
                  <div
                    className={`flex items-center justify-center min-w-[32px] transition-colors
                    ${isActive ? "text-[var(--color-accent)]" : "group-hover:text-[var(--color-accent)]"}`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {/* Text Label - Hidden when collapsed */}
                  {!collapsed && (
                    <span className="ml-3 text-[14px] font-semibold tracking-tight whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all z-50 bg-[var(--color-text-primary)] text-[var(--color-surface)] text-xs px-2 py-1.5 rounded-md font-bold pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
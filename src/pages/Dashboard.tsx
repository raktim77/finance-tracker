import { AIInsights } from "../components/dashboard/AIInsights";
import { BalanceOverviewCard } from "../components/dashboard/BalanceOverviewCard";
import { BudgetsPromoCard } from "../components/dashboard/BudgetsPromoCard";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import PendingReviewCard from "../components/pending/PendingReviewCard";

import { useDashboardAnalytics, useDashboardSummary } from "../features/dashboard/hooks/useDashboard";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import { useAuth } from "../lib/context/useAuth";
import { isNativeCapacitorApp } from "../lib/capacitor/platform";
import { useRef, useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";

export default function Dashboard() {
  useHeaderConfig({
    heroColor: "#071209",        // matches the hero's top color
    heroHeight: 40,
    showLogo: true,
    scrollTitle: null,
    scrollAction: null,
    isDashboard: true
  });

  const { data, isLoading } = useDashboardSummary();
  const { data: analyticsData, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { user } = useAuth();
  const isApp = isNativeCapacitorApp();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";



  //FOR TOPBAR
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (!themeMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [themeMenuOpen]);

  return (
    <div className="mx-auto flex flex-col gap-4 md:pb-10 pb-24 md:gap-5">
      {/* Mobile dashboard flow */}
      <div className="md:hidden flex flex-col gap-4">
        <HeroDashboard data={data} isLoading={isLoading} />

        {isApp ? (
            <PendingReviewCard />
        ) : null}

        <div className="px-1">
          <RecentTransactions />
        </div>

        <div className="px-3 h-full">
            <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />
        </div>

        <div className="px-3">
          <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />
        </div>

        <div className="px-3">
          <AIInsights insights={data?.insights} />
        </div>

        <div className="px-3">
          <BudgetsPromoCard />
        </div>
      </div>

      {/* Desktop dashboard flow */}
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {greeting}, {firstName}! 👋
            </h2>
            <p className="mt-1 text-l text-[var(--color-text-secondary)]">
              Here's your financial overview
            </p>
          </div>

          {/* RIGHT (DESKTOP ONLY) */}
          <div className="hidden md:flex items-center gap-6">

            {/* THEME SWITCHER */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setThemeMenuOpen((p) => !p)}
                className="w-10 h-10 flex items-center justify-center rounded-full 
        text-[var(--color-text-primary)] bg-[var(--color-warm)]/10
        hover:bg-[var(--color-warm)] hover:text-white transition"
              >
                {theme === "light" && <Sun size={18} />}
                {theme === "dark" && <Moon size={18} />}
                {theme === "system" && <Monitor size={18} />}
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 rounded-2xl 
          bg-[var(--color-surface)] border border-[var(--border)] 
          shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">

                  <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)]">
                    {([
                      { key: "light", icon: Sun },
                      { key: "dark", icon: Moon },
                      { key: "system", icon: Monitor },
                    ] as const).map(({ key, icon: Icon }) => {
                      const active = theme === key;

                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setTheme(key);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-10 h-9 flex items-center justify-center rounded-lg transition
                  ${active
                              ? "bg-[var(--color-warm)]/90 text-white shadow-sm"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                            }`}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <ProfileMenu />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch">
          <div className="lg:col-span-5 h-full">
            <BalanceOverviewCard data={data} isLoading={isLoading} />

          </div>
          <div className="lg:col-span-6 h-full">
            <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch">
          <div className="lg:col-span-5 h-full">
            <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />

          </div>
          <div className="lg:col-span-6 h-full">
            <RecentTransactions />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 h-full">
            <BudgetsPromoCard summary={data?.summary} />
          </div>
          <div className="lg:col-span-5 h-full">
            <AIInsights insights={data?.insights} />
          </div>
        </div>
      </div>
    </div>
  );
}

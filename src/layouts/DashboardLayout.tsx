import { useCallback, useContext, useEffect, useMemo, useState, type UIEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
// import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";
import { AppHeader } from "../components/app-header/AppHeader";
import { ThemeContext } from "../context/ThemeContext";
import { useHeaderContext } from "../context/HeaderContext";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { useCategories } from "../features/categories/hooks/useCategories";
import {
  useCreateTransaction,
} from "../features/transactions/hooks/useTransactions";
import TransactionSheet from "../components/transactions/TransactionSheet";
import { useAuth } from "../lib/context/useAuth";
import { useToast } from "../components/ui/confirm-modal/useToast";
import { isNativeCapacitorApp } from "../lib/capacitor/platform";
import Topbar from "../components/layout/Topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarLayout,toggleSidebarLayout } = useContext(ThemeContext);
  const collapsed = sidebarLayout === "icons";
  const navigate = useNavigate();
  const location = useLocation();
  const { onScroll, registerConfig } = useHeaderContext();
  const { accessToken } = useAuth();
  const toast = useToast();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { data: categoriesData } = useCategories({ accessToken });
  const { data: accountsData } = useAccounts({}, { accessToken });
  const createTransactionMutation = useCreateTransaction({ accessToken });

  const categories = categoriesData?.categories ?? [];
  const accounts = accountsData?.accounts ?? [];
  const hasAccounts = accounts.length > 0;
  const mappedAccounts = useMemo(
    () =>
      accounts.map((account) => ({
        _id: account._id,
        name: account.name,
        type: account.account_category_group || "account",
        balance: account.current_balance,
        icon: account.account_category_icon || "help",
        iconColor: account.account_category_color || '#ddd',

      })),
    [accounts]
  );

  const handleOpenQuickAdd = () => {
    if (!hasAccounts) {
      toast.error("Please add an account first");
      navigate("/accounts");
      return;
    }

    setQuickAddOpen(true);
  };

  useEffect(() => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/transactions" ||
      location.pathname.startsWith("/accounts/transactions/")
    ) {
      return;
    }

    const titleByPath: Record<string, string> = {
      "/accounts": "Accounts",
      "/budgets": "Budgets",
      "/analytics": "Analytics",
      "/settings": "Settings",
      "/more": "More",
      "/pending-review": "Pending Review",
    };

    registerConfig({
      heroColor: null,
      heroHeight: 80,
      showLogo: true,
      scrollTitle: titleByPath[location.pathname] ?? "Xpensio",
      scrollAction: null,
    });
  }, [location.pathname, registerConfig]);

  const handleMainScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      onScroll(event.currentTarget.scrollTop);
    },
    [onScroll]
  );

  const handleSubmitQuickAdd = async (payload: {
    amount: number;
    type: "expense" | "income" | "transfer";
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => {
    await createTransactionMutation.mutateAsync(payload);
    toast.success("Transaction recorded successfully");
    setQuickAddOpen(false);
  };
  const appPadding = "pt-[var(--app-header-height,76px)]"
  const webPadding = "pt-[48px]"
  const paddingClass = isNativeCapacitorApp() ? appPadding : webPadding
  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      <AppHeader />

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onAddTransaction={handleOpenQuickAdd} />

      {/* Right Side */}
      <div className="flex flex-col flex-1">

        {/* Topbar */}
        {/* <Topbar toggleSidebar={toggleSidebarLayout} /> */}

        {/* Page Content */}
        <main
          data-route-scroll-container
          onScroll={handleMainScroll}
          className={`flex-1 overflow-auto md:pt-6 md:p-6 ${paddingClass}`}
           style={{ 
          paddingBottom: "env(safe-area-inset-bottom, 0px)"
          
        }}
        >
          {children}
        </main>

        {/* Bottom navbar for mobile */}
        <BottomNav onAddTransaction={handleOpenQuickAdd} />

      </div>

      <TransactionSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        categories={categories}
        accounts={mappedAccounts}
        onSubmit={handleSubmitQuickAdd}
        loading={createTransactionMutation.isPending}
        initialData={null}
        defaultData={null}
      />

    </div>
  );
};

export default DashboardLayout;

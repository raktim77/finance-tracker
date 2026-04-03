import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";
import { ThemeContext } from "../context/ThemeContext";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { useCategories } from "../features/categories/hooks/useCategories";
import {
  useCreateTransaction,
} from "../features/transactions/hooks/useTransactions";
import TransactionSheet from "../components/transactions/TransactionSheet";
import { useAuth } from "../lib/context/useAuth";
import { useToast } from "../components/ui/confirm-modal/useToast";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarLayout, toggleSidebarLayout } = useContext(ThemeContext);
  const collapsed = sidebarLayout === "icons";
  const navigate = useNavigate();
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

  return (
    <div className="flex h-screen bg-[var(--color-background)]">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onAddTransaction={handleOpenQuickAdd} />

      {/* Right Side */}
      <div className="flex flex-col flex-1">

        {/* Topbar */}
        <Topbar toggleSidebar={toggleSidebarLayout} />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto md:p-6">
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

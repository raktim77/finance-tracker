import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AmountInput from "./AmountInput";
import TypeToggle from "./TypeToggle";
import CategoryDropdown, { type Category } from "./CategoryDropdown";
import AccountDropdown, { type Account } from "./AccountDropdown";
import DateField from "./DateField";
import NoteInput from "./NoteInput";

type TransactionType = "expense" | "income" | "transfer";

export type TransactionDraft = {
    amount: number | "";
    type: TransactionType;

    account_id: string | null;
    to_account_id: string | null;

    category_id: string | null;

    note: string;
    date: Date;
};

type Props = {
    open: boolean;
    onClose: () => void;

    categories: Category[];
    accounts: Account[];

    onSubmit: (data: {
        amount: number;
        type: TransactionType;
        account_id: string;
        to_account_id?: string;
        category_id?: string;
        note?: string;
        date: Date;
    }) => Promise<void>;
};

export default function TransactionSheet({
    open,
    onClose,
    categories,
    accounts,
    onSubmit,
}: Props) {
    const [isMobile, setIsMobile] = useState(false);

    const [draft, setDraft] = useState<TransactionDraft>({
        amount: "",
        type: "expense",
        account_id: null,
        to_account_id: null,
        category_id: null,
        note: "",
        date: new Date(),
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);


        return () => window.removeEventListener("resize", check);


    }, []);

    // reset form when closing
    useEffect(() => {
        if (!open) {
            setDraft({
                amount: "",
                type: "expense",
                account_id: null,
                to_account_id: null,
                category_id: null,
                note: "",
                date: new Date(),
            });
        }
    }, [open]);

    if (!open) return null;

    const isValid = () => {
        if (!draft.amount || draft.amount <= 0) return false;


        if (!draft.account_id) return false;

        if (draft.type === "transfer") {
            if (!draft.to_account_id) return false;
        } else {
            if (!draft.category_id) return false;
        }

        return true;


    };

    const handleSubmit = async () => {
        if (!isValid()) return;


        await onSubmit({
            amount: Number(draft.amount),
            type: draft.type,
            account_id: draft.account_id!,
            to_account_id: draft.type === "transfer" ? draft.to_account_id! : undefined,
            category_id: draft.type !== "transfer" ? draft.category_id! : undefined,
            note: draft.note || undefined,
            date: draft.date,
        });

        onClose();


    };

    const container = (<div className="flex flex-col h-full transition-all">


        {/* Header */}

        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold">Add Transaction</h2>

            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)]"
            >
                <X size={18} />
            </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <AmountInput
                value={draft.amount}
                onChange={(amount) =>
                    setDraft((d) => ({
                        ...d,
                        amount,
                    }))
                }
            />

            <TypeToggle
                value={draft.type}
                onChange={(type) =>
                    setDraft((d) => ({
                        ...d,
                        type,
                        category_id: null,
                        to_account_id: null,
                    }))
                }
            />

            <CategoryDropdown
                categories={categories}
                type={draft.type}
                value={draft.category_id}
                onChange={(id) =>
                    setDraft((d) => ({
                        ...d,
                        category_id: id,
                    }))
                }
            />

            <AccountDropdown
                accounts={accounts}
                type={draft.type}
                accountId={draft.account_id}
                toAccountId={draft.to_account_id}
                onAccountChange={(id) =>
                    setDraft((d) => ({
                        ...d,
                        account_id: id,
                    }))
                }
                onToAccountChange={(id) =>
                    setDraft((d) => ({
                        ...d,
                        to_account_id: id,
                    }))
                }
            />

            <DateField
                value={draft.date}
                onChange={(date) =>
                    setDraft((d) => ({
                        ...d,
                        date,
                    }))
                }
            />

            <NoteInput
                value={draft.note}
                onChange={(note) =>
                    setDraft((d) => ({
                        ...d,
                        note,
                    }))
                }
            />

        </div>

        {/* Footer */}

        <div className="p-4 border-t border-[var(--border)]">
            <button
                onClick={handleSubmit}
                disabled={!isValid()}
                className="
        w-full
        h-11
        rounded-xl
        font-medium
        text-white
        transition
        bg-[var(--color-accent)]
        disabled:opacity-50
      "
            >
                Save Transaction
            </button>
        </div>

    </div>


    );

    return (<div className="fixed inset-0 z-100">


        {/* Backdrop */}

        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* Mobile Bottom Sheet */}

        {isMobile ? (
            <div className="absolute bottom-0 left-0 right-0 h-[85%] rounded-t-3xl bg-[var(--color-background)] shadow-xl">
                {container}
            </div>
        ) : (
            <div className="absolute left-1/2 top-1/2 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--color-background)] shadow-xl">
                {container}
            </div>
        )}
    </div>


    );
}

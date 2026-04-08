import React from "react";
import {
    Target,
    ChevronRight,
    BarChart3,
    Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/context/useAuth";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { isNativeAndroidApp } from "../lib/capacitor/platform";

type MenuItem = {
    name: string;
    icon: React.ElementType;
    path: string;
    description: string;
};

const items: MenuItem[] = [
    { name: "Budgets", icon: Target, path: "/budgets", description: "Manage monthly limits" },
    { name: "Analytics", icon: BarChart3, path: "/analytics", description: "Deep spending insights" },
    { name: "Settings", icon: Settings, path: "/settings", description: "App & Security config" },
];

export default function MorePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const confirm = useConfirm();
    const isNativeApp = isNativeAndroidApp();

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
            navigate(isNativeApp ? "/login" : "/", { replace: true });
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="bg-[var(--color-background)] pb-32 md:hidden min-h-screen">

            {/* --- ELEVATED HEADER --- */}
            <header className="mb-12 relative">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-primary)] opacity-80">
                        Xpensio Directory
                    </span>
                    <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)]">
                        More Options<span className="text-[var(--color-primary)]">.</span>
                    </h1>
                </div>
            </header>

            {/* --- MENU LIST --- */}
            <div className="space-y-3">
                {items.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className="
                            w-full flex items-center justify-between p-2 
                            rounded-[1.75rem] bg-[var(--color-surface)] 
                            border border-[var(--border)] 
                            shadow-sm active:scale-[0.97] 
                            transition-all duration-300 group
                        "
                    >
                        <div className="flex items-center gap-5">
                            <div className="
                                p-3.5 rounded-2xl 
                                bg-[var(--color-background)] 
                                border border-[var(--border)] 
                                text-[var(--color-text-secondary)] 
                                group-hover:text-[var(--color-primary)] 
                                group-hover:border-[var(--color-primary)]/30 
                                transition-all
                            ">
                                <item.icon size={22} strokeWidth={2.5} />
                            </div>

                            <div className="text-left">
                                <p className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                    {item.name}
                                </p>
                                <p className="text-[11px] font-bold text-[var(--color-text-secondary)] opacity-60">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-2 rounded-full bg-[var(--color-background)] opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={14} className="text-[var(--color-primary)]" />
                        </div>
                    </button>
                ))}
            </div>

            {/* --- SYSTEM FOOTER --- */}
            <footer className="mt-10 text-center space-y-6">
                {/* Text-Link Logout */}
                <button 
                    onClick={handleLogout}
                    className="mb-10 text-[11px] font-black uppercase tracking-[0.3em] text-red-500/80 hover:text-red-500 active:opacity-60 transition-all"
                >
                    Logout
                </button>

                <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    {/* <div className="flex items-center gap-2">
                        <ShieldCheck size={12} />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                            Vault Verified
                        </p>
                    </div> */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                        Xpensio Build 2026.4.0
                    </p>
                </div>
            </footer>
        </div>
    );
}
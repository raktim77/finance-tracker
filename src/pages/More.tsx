import React, { useContext } from "react";
import {
    Target,
    ChevronRight,
    BarChart3,
    Settings,
    Monitor,
    Moon,
    Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/context/useAuth";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { isNativeAndroidApp } from "../lib/capacitor/platform";
import { ThemeContext } from "../context/ThemeContext";

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

function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);

  const base =
    "p-2 rounded-lg transition-all duration-200 flex items-center justify-center";
  const active =
    "bg-[var(--color-accent)]/20 text-[var(--color-text-primary)]";
  const inactive =
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]";

  return (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--color-surface)] w-fit">
      <button
        onClick={() => setTheme("light")}
        className={`${base} ${theme === "light" ? active : inactive}`}
      >
        <Sun size={14} />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`${base} ${theme === "dark" ? active : inactive}`}
      >
        <Moon size={14} />
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`${base} ${theme === "system" ? active : inactive}`}
      >
        <Monitor size={14} />
      </button>
    </div>
  );
}

export default function MorePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const confirm = useConfirm();
    const isNativeApp = isNativeAndroidApp();
    const versioNumber = import.meta.env.VITE_VERSION_NUMBER;
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
        <div className="section-animate bg-[var(--color-background)] pb-10 md:hidden min-h-screen p-2">

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
                            rounded-[1.25rem] bg-[var(--color-surface)] 
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
                <div className="flex items-center justify-center mt-10">
            <ThemeSwitcher />

                </div>

            {/* --- SYSTEM FOOTER --- */}
            <footer className="mt-10 text-center space-y-6">
                {/* Text-Link Logout */}
                <button 
                    onClick={handleLogout}
                    className="pl-1.5 mb-14 text-[14px] font-black uppercase tracking-[0.3em] text-red-500/80 hover:text-red-500 active:opacity-60 transition-all"
                >
                    Logout
                </button>
                <div className="flex items-center justify-center gap-5 text-[12px] font-semibold text-[var(--color-text-secondary)] opacity-75">
                    <a
                        href="https://xpensio.vercel.app/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-[var(--color-primary)]"
                    >
                        Terms
                    </a>
                    <span className="h-1 w-1 rounded-full bg-[var(--color-text-secondary)]/40" />
                    <a
                        href="https://xpensio.vercel.app/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-[var(--color-primary)]"
                    >
                        Privacy Policy
                    </a>
                </div>


                <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    {/* <div className="flex items-center gap-2">
                        <ShieldCheck size={12} />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                            Vault Verified
                        </p>
                    </div> */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                        Xpensio Build {versioNumber}
                    </p>
                </div>
            </footer>
        </div>
    );
}

// src/components/ProfileMenu.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/context/useAuth";
import { useMe } from "../features/user/hooks/useUsers";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";

function initialsFromUser(user: { name?: string; email?: string } | null) {
  if (!user) return "";
  if (user.name) {
    const parts = user.name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (user.email?.[0] ?? "").toUpperCase();
}

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { data } = useMe();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

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
      setOpen(false);
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const meUser = data?.user ?? user;
  const avatarUrl = meUser?.profile?.avatar_url;
  const hasAvatar =
    typeof avatarUrl === "string" &&
    avatarUrl.trim() !== "" &&
    avatarUrl.trim().toLowerCase() !== "null";
  const initials = initialsFromUser(meUser);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-[var(--color-primary)] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
        onClick={() => setOpen((s) => !s)}
        title={meUser?.name ?? meUser?.email ?? "Account"}
      >
        {hasAvatar ? (
          <img
            src={avatarUrl}
            alt={meUser?.name ?? "Profile avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          initials || "U"
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-44 bg-[var(--color-surface)] rounded-lg shadow-lg ring-1 ring-black/5 z-50"
          >
            <div role="menu" aria-label="User menu" className="py-2">
              <button
                role="menuitem"
                onClick={() => handleNavigate("/profile")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-background)]"
              >
                Profile
              </button>
              <button
                role="menuitem"
                onClick={() => handleNavigate("/settings")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-background)]"
              >
                Settings
              </button>
              <div className="border-t border-black/5 my-1" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--color-background)]"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// src/components/Header.tsx
"use client";
import { useContext, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import Logo from "../assets/images/logo.png";
import LogoLight from "../assets/images/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import { useAuth } from "../lib/context/useAuth";
import { useMe } from "../features/user/hooks/useUsers";

type NavItem = { label: string; id: "home" | "features" | "benefits" | "pricing" };
type HeaderProps = {
  toggleSidebar?: () => void;
};

const NAV: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "Benefits", id: "benefits" },
  { label: "Pricing", id: "pricing" },
];

// Smooth scroll that accounts for sticky header height
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector("header");
  const headerH = header ? (header as HTMLElement).offsetHeight : 72;

  const top =
    el.getBoundingClientRect().top + window.scrollY - (headerH + 8); // tiny breathing space

  window.scrollTo({ top, behavior: "smooth" });
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data } = useMe();
  const meUser = data?.user ?? user;

  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  // You can tweak this to include other auth routes if needed
  const isAuthenticated = !!user;

  const handleNav = (id: string) => {
    scrollToId(id);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const smartNavigate = (targetId: string) => {
    const currentPath = location.pathname;

    if (currentPath === "/") {
      // Home: scroll to section
      scrollToId(targetId);
    } else if (currentPath === "/login") {
      // Login: go home
      navigate("/");
    } else if (currentPath.startsWith("/dashboard")) {
      // Dashboard: stay on dashboard or go to dashboard home
      navigate("/dashboard");
    } else {
      // All other routes: go to home page
      navigate("/");
    }

    setMobileMenuOpen(false);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-black/10 transition"
            >
              <Menu size={20} />
            </button>
          )}

          <div
            className="flex items-center cursor-pointer"
            onClick={() => smartNavigate("home")}
          >
            <img
              src={theme === "light" ? LogoLight : Logo}
              alt="Xpensio Logo"
              className="w-35"
            />
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 lg:gap-8 text-[var(--color-text-secondary)] font-medium">
          {/* show nav links only on home and when unauthenticated */}
          {isHome && !isAuthenticated && NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNav(n.id)}
              className="hover:text-[var(--color-primary)] transition cursor-pointer"
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        {/* Actions */}
        <div className="flex items-center md:gap-6">
          {/* Theme toggle - always visible */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full 
      bg-[var(--color-surface)] text-[var(--color-text-primary)] 
      hover:bg-[var(--color-primary)] hover:text-white transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Desktop view */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              isHome ? (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition"
                >
                  Login
                </button>
              ) : null
            ) : (
              <ProfileMenu />
            )}
          </div>

          {/* Mobile view */}
          <div className="md:hidden flex items-center">
            {!isAuthenticated ? (
              // if not logged in -> show hamburger except on /login
              !isLogin && (
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-lg 
            bg-[var(--color-surface)] text-[var(--color-text-primary)] 
            hover:bg-[var(--color-background)] transition"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
              )
            ) : (
              // if logged in -> show avatar instead of hamburger
              <ProfileMenu />
            )}
          </div>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              id="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-[var(--color-surface)] shadow-lg z-[70] flex flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <div />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="self-end mb-2"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-4 text-[var(--color-text-primary)] font-medium">
                {/* If home & not authenticated, show section links */}
                {isHome && !isAuthenticated && NAV.map((n) => (
                  <button
                    key={n.id}
                    className="text-left hover:text-[var(--color-primary)] transition"
                    onClick={() => { handleNav(n.id); }}
                  >
                    {n.label}
                  </button>
                ))}

                {/* Auth / unauth actions */}
                {!isAuthenticated ? (
                  <>
                    <button
                      className="mt-6 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90"
                      onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mt-4">
                      <div className="px-2 text-sm text-[var(--color-text-secondary)]">Signed in as</div>
                      <div className="px-2 py-2 font-medium">{meUser?.name ?? meUser?.email}</div>
                    </div>
                    <div className="mt-4 border-t border-black/5 pt-4">
                      <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2">Profile</button>
                      <button onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2">Settings</button>
                      <button onClick={async () => { await (await import("../lib/context/useAuth")).useAuth().logout(); /* noop */ }} className="w-full text-left px-4 py-2 text-red-600">Logout</button>
                    </div>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

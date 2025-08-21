"use client";
import { useContext, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import Logo from "../assets/images/logo.png";
import LogoLight from "../assets/images/logo.png";

type NavItem = { label: string; id: "home" | "features" | "benefits" | "pricing" };

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

  // approximate header height (adjust if you change header size)
  const header = document.querySelector("header");
  const headerH = header ? (header as HTMLElement).offsetHeight : 72;

  const top =
    el.getBoundingClientRect().top + window.scrollY - (headerH + 8); // tiny breathing space

  window.scrollTo({ top, behavior: "smooth" });
}

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (id: string) => {
    scrollToId(id);
    setMobileMenuOpen(false);
  };

  return (
<header
  className="fixed inset-x-0 top-0 z-50 bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-md"
>
  <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => handleNav("home")}>
          <img
            src={theme === "light" ? LogoLight : Logo}
            alt="Xpensio Logo"
            className="w-35"
          />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 lg:gap-8 text-[var(--color-text-secondary)] font-medium">
          {NAV.map((n) => (
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
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full 
             bg-[var(--color-surface)] text-[var(--color-text-primary)] 
             hover:bg-[var(--color-primary)] hover:text-white transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="hidden md:inline-flex px-4 py-2 rounded-xl 
                   bg-[var(--color-primary)] text-white font-medium 
                   hover:opacity-90 transition cursor-pointer">
            Login
          </button>

          {/* Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg 
             bg-[var(--color-surface)] text-[var(--color-text-primary)] 
             hover:bg-[var(--color-background)] transition"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
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
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="self-end mb-6"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              <nav className="flex flex-col gap-4 text-[var(--color-text-primary)] font-medium">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    className="text-left hover:text-[var(--color-primary)] transition"
                    onClick={() => handleNav(n.id)}
                  >
                    {n.label}
                  </button>
                ))}
              </nav>

              <button className="mt-6 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90">
                Login
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

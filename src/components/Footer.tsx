import { Github } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Smooth scroll that accounts for the sticky header height
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector("header");
  const headerH = header ? (header as HTMLElement).offsetHeight : 72;
  const top = el.getBoundingClientRect().top + window.scrollY - (headerH + 8);
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionNav = (id: string) => {
    const targetHash = `#${id}`;

    if (location.pathname === "/" && location.hash === targetHash) {
      scrollToId(id);
      return;
    }

    navigate({ pathname: "/", hash: targetHash });
  };

  return (
    <footer className="relative bg-[var(--color-background)] border-t border-black/10 dark:border-white/10">
      {/* subtle top aura */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-20 h-40 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(50,165,158,0.12) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-6 py-12 md:py-15 space-y-10">
        {/* top row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo + nav */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-extrabold text-xl">
              <span className="bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-warm)] bg-clip-text text-transparent">
                Xpensio
              </span>
            </div>

            {/* Footer Nav (JS smooth scroll with offset) */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium text-[var(--color-text-secondary)]">
              <button
                onClick={() => handleSectionNav("home")}
                className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
                aria-label="Go to Home"
              >
                Home
              </button>
              <button
                onClick={() => handleSectionNav("features")}
                className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
                aria-label="Go to Features"
              >
                Features
              </button>
              <button
                onClick={() => handleSectionNav("benefits")}
                className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
                aria-label="Go to Benefits"
              >
                Benefits
              </button>
              <button
                onClick={() => handleSectionNav("pricing")}
                className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
                aria-label="Go to Pricing"
              >
                Pricing
              </button>
              {/* <button
                
                className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
                aria-label="Go to FAQ"
              >
                FAQ
              </button> */}
            </nav>
          </div>

          {/* Socials */}
          <div className="flex justify-center md:justify-end gap-4">
            <a
              href="https://github.com/raktim77/finance-tracker"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-accent-teal)]/20 transition"
              aria-label="GitHub"
            >
              <Github size={18} className="text-[var(--color-text-primary)]" />
            </a>
            {/* <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-accent-teal)]/20 transition"
              aria-label="Twitter"
            >
              <Twitter size={18} className="text-[var(--color-text-primary)]" />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-accent-teal)]/20 transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} className="text-[var(--color-text-primary)]" />
            </a> */}
          </div>
        </div>

        {/* divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

        {/* bottom row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-[var(--color-text-secondary)]">
          {/* legal */}
          <div className="flex justify-center md:justify-start gap-6">
            <Link
              to="/privacy"
              className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
              aria-label="Go to Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-[var(--color-accent-teal)] transition cursor-pointer"
              aria-label="Go to Terms of Use"
            >
              Terms of Use
            </Link>
          </div>

          <div className="text-center md:text-left">
            Developed with ❤️ by{" "}
            <span className="text-[var(--color-accent-teal)] font-medium cursor-pointer">
              <a  aria-label="Raktim Routh profile" href="https://www.linkedin.com/in/raktim-routh-9a5447197/" target="_blank">Raktim Routh</a>
            </span>
          </div>

          <div className="text-center md:text-right">
            © {new Date().getFullYear()} Xpensio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

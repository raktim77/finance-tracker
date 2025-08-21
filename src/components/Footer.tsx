import { Github, Twitter, Linkedin } from "lucide-react";

// Smooth scroll that accounts for the sticky header height
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerEl = document.querySelector("header") as HTMLElement | null;
  const headerH = headerEl?.offsetHeight ?? 72;

  const top =
    el.getBoundingClientRect().top + window.scrollY - (headerH + 8); // small breathing space
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Footer() {
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
                onClick={() => scrollToId("home")}
                className="hover:text-[var(--color-accent-teal)] transition"
                aria-label="Go to Home"
              >
                Home
              </button>
              <button
                onClick={() => scrollToId("features")}
                className="hover:text-[var(--color-accent-teal)] transition"
                aria-label="Go to Features"
              >
                Features
              </button>
              <button
                onClick={() => scrollToId("benefits")}
                className="hover:text-[var(--color-accent-teal)] transition"
                aria-label="Go to Benefits"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToId("pricing")}
                className="hover:text-[var(--color-accent-teal)] transition"
                aria-label="Go to Pricing"
              >
                Pricing
              </button>
              <button
                
                className="hover:text-[var(--color-accent-teal)] transition"
                aria-label="Go to FAQ"
              >
                FAQ
              </button>
            </nav>
          </div>

          {/* Socials */}
          <div className="flex justify-center md:justify-end gap-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-accent-teal)]/20 transition"
              aria-label="GitHub"
            >
              <Github size={18} className="text-[var(--color-text-primary)]" />
            </a>
            <a
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
            </a>
          </div>
        </div>

        {/* divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

        {/* bottom row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-[var(--color-text-secondary)]">
          {/* legal (smooth scroll to #privacy / #terms if present) */}
          <div className="flex justify-center md:justify-start gap-6">
            <button
              
              className="hover:text-[var(--color-accent-teal)] transition"
              aria-label="Go to Privacy Policy"
            >
              Privacy Policy
            </button>
            <button
           
              className="hover:text-[var(--color-accent-teal)] transition"
              aria-label="Go to Terms of Use"
            >
              Terms of Use
            </button>
          </div>

          <div className="text-center md:text-left">
            Developed with ❤️ by{" "}
            <span className="text-[var(--color-accent-teal)] font-medium">
              <a  aria-label="Raktim Routh profile">Raktim Routh</a>
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

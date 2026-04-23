import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ProfileMenu from "../ProfileMenu";
import LogoLight from "../../assets/images/only_logo.png";
import Logo from "../../assets/images/only_logo.png";
import { useNavigate } from "react-router-dom";

type Props = {
  toggleSidebar: () => void;
};

export default function Topbar({ toggleSidebar }: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!themeMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current) return;

      // 👇 if click is OUTSIDE → close
      if (!menuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [themeMenuOpen]);

  return (
    <header
      className="hidden md:flex items-center justify-between px-6 md:border-b md:border-black/10 md:bg-[var(--color-surface)]"
      style={{
        minHeight: "calc(var(--header-h) + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)))",
        paddingTop: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
      }}
    >

      {/* Left */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-black/5 transition lg:block hidden"
      >
        <Menu size={20} />
      </button>

      <div
        className="flex items-center cursor-pointer lg:hidden"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src={theme === "light" ? LogoLight : Logo}
          alt="Xpensio Logo"
          className="w-10"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <div className="relative" ref={menuRef}>
          {/* Trigger */}
          <button
            onClick={() => setThemeMenuOpen((p) => !p)}
            className="w-10 h-10 flex items-center justify-center rounded-full 
     text-[var(--color-text-primary)] 
    hover:bg-[var(--color-warm)] hover:text-white transition"
          >
            {theme === "light" && <Sun size={18} />}
            {theme === "dark" && <Moon size={18} />}
            {theme === "system" && <Monitor size={18} />}
          </button>

          {/* Popover */}
          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 rounded-2xl 
      bg-[var(--color-surface)] border border-[var(--border)] 
      shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">

              <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)]">
                {([
                  { key: "light", icon: Sun },
                  { key: "dark", icon: Moon },
                  { key: "system", icon: Monitor },
                ] as const).map(({ key, icon: Icon }) => {
                  const active = theme === key;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setTheme(key);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-10 h-9 flex items-center justify-center rounded-lg transition
          ${active
                          ? "bg-[var(--color-warm)]/90 text-white shadow-sm"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                        }`}
                      aria-label={key}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ProfileMenu />

      </div>
    </header>
  );
}

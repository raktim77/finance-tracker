import { useContext } from "react";
import LogoSpinnerMotion from "./LogoSpinnerMotion";
import { ThemeContext } from "../../context/ThemeContext";

export default function FullscreenLogoLoaderMotion({ message = "Please wait…" }: { message?: string }) {
  // Restore your original textClass logic
  const { theme } = useContext(ThemeContext);
  let textClass = "";
  if(theme == 'dark'){
    textClass = "text-[var(--color-nav-highlight)]"
  }else if(theme == 'light'){
    textClass = "text-[var(--color-background)]"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center fullscreen-loader-backdrop">
      <div className="flex flex-col items-center gap-6 p-6">
        {/* Elevated glass container for the logo */}
        <div className="p-5 bg-[var(--color-surface)]/80 backdrop-blur-md rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
          <LogoSpinnerMotion size={60} />
        </div>
        <div className={`text-sm font-black uppercase tracking-[0.2em] ${textClass}`}>
          {message}
        </div>
      </div>
    </div>
  );
}

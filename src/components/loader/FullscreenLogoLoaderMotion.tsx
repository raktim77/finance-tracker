import LogoSpinnerMotion from "./LogoSpinnerMotion";

export default function FullscreenLogoLoaderMotion({ message = "Please wait…" }: { message?: string }) {

  // theme === 'light' -> use a Tailwind neutral color with good contrast
  // theme === 'dark'  -> use your CSS variable (assumed to be tuned for dark)
  const textClass = "text-[var(--color-text-primary)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center fullscreen-loader-backdrop">
      <div className="flex flex-col items-center gap-4 p-6 rounded-md">
        <div className="p-4 bg-[var(--color-surface)] rounded-full">
          <LogoSpinnerMotion size={60} />
        </div>
        <div className={`text-sm ${textClass}`}>{message}</div>
      </div>
    </div>
  );
}

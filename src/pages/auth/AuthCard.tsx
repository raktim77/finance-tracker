/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lightbulb, Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";
import { API_ORIGIN, warnIfCookieRefreshMayFail } from "../../lib/api/config";

/**
 * AuthCard.tsx
 * - Desktop: centered rounded card (unchanged)
 * - Mobile: full-bleed app-like view (edge-to-edge, top-to-bottom)
 * - Includes background blobs, sign-in / sign-up swap, TipRotator embedded, and forms
 */

/* ---------------------- Body-scroll helper ---------------------- */
function useDisableBodyScrollOnAuth(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("app-no-scroll-desktop");
    return () => {
      document.body.classList.remove("app-no-scroll-desktop");
    };
  }, [enabled]);
}

/* ---------------------- TipRotator component (embedded) ---------------------- */
type TipRotatorProps = {
  isSignup: boolean;
  intervalMs?: number;
};
type AuthOk = { ok: true; user: User };
type AuthErr = { ok: false; error?: string };
type AuthResult = AuthOk | AuthErr;
const TipRotator: React.FC<TipRotatorProps> = ({ isSignup, intervalMs = 4200 }) => {
  const signInMessages = [
    "Use the Quick Add (FAB) to log purchases in seconds.",
    "Enable smart categories to auto-sort transactions.",
    "Connect multiple cards and view consolidated reports."
  ];
  const signUpMessages = [
    "Private-first, lightweight, and built for daily use.",
    "Create budgets and get alerted when you overspend.",
    "Sync across devices instantly and securely."
  ];

  const messages = isSignup ? signUpMessages : signInMessages;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => setIndex(0), [isSignup]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, intervalMs, messages.length]);

  const variants = {
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.36 } },
    exit: { y: -10, opacity: 0, transition: { duration: 0.28 } }
  };

  return (
    <div
      className="mt-8 py-4 rounded-lg"
      style={{
        background: "var(--benefits-card-color)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      {/* Title with icon */}
      <div className="flex items-center gap-2 mb-2">
        {isSignup ? (
          <Sparkles size={16} className="text-[var(--color-accent-teal)]" />
        ) : (
          <Lightbulb size={16} className="text-[var(--color-accent-teal)]" />
        )}
        <p className="text-xs font-medium text-[var(--color-text-secondary`)]">
          {isSignup ? "Why Xpensio?" : "Pro tip"}
        </p>
      </div>

      {/* Rotating text */}
      <div className="mt-1 relative min-h-[30px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={messages[index]}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------------------- Types ---------------------- */
interface User {
  id: string;
  email: string;
  name?: string;
}

type Props = {
  onAuthSuccess?: (user: User) => void;
};

/* ---------------------- Icons ---------------------- */
const GoogleIcon = () => (
  <svg viewBox="0 0 533.5 544.3" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.2h147.5c-6.4 34.7-25.7 64.1-54.6 83.8v69.4h88.3c51.6-47.5 80.3-117.5 80.3-197.9z" />
    <path fill="#34A853" d="M272 544.3c73.5 0 135.2-24.3 180.2-65.8l-88.3-69.4c-24.5 16.4-55.8 26-91.9 26-70.6 0-130.4-47.6-151.8-111.5H27.2v70.2c44.9 88.5 137.5 150.5 244.8 150.5z" />
    <path fill="#FBBC05" d="M120.2 323.6c-10.9-32.7-10.9-68.1 0-100.8V152.6H27.2c-43.8 87.7-43.8 191 0 278.6l93-70.2z" />
    <path fill="#EA4335" d="M272 107.7c39.9-.6 77.1 14 105.9 40.8l78.9-78.9C407 24.8 345.5 0 272 0 164.7 0 72.1 62 27.2 150.5l93 70.2C141.6 155.3 201.4 107.7 272 107.7z" />
  </svg>
);

/* ---------------------- Animation settings ---------------------- */
const slideDuration = 0.56;

/* ---------------------- Component ---------------------- */
export default function AuthCard({ onAuthSuccess }: Props) {
  useDisableBodyScrollOnAuth(true);

  // only import actions from the hook here; we do not rely on a cached authUser
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

  /* Handlers */

  const handleSignin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!siEmail) return setError("Please enter email");
    if (!siPassword) return setError("Please enter password");
    setLoading(true);
    try {
      // login() might not have perfect typing from the hook; coerce into our union
      const result = (await login(siEmail, siPassword)) as unknown as AuthResult;

      if (!result.ok) {
        // result is AuthErr here
        setError(result.error ?? "Sign in failed");
      } else {
        // result is AuthOk here
        const currentUser = result.user ?? null;
        if (currentUser) {
          onAuthSuccess?.(currentUser);
          // navigation / redirect handled by App-level callback
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!suName) return setError("Please enter your name");
    if (!suEmail) return setError("Please enter email");
    if (!suPassword) return setError("Please enter password");
    setLoading(true);
    try {
      const result = (await signup(suName, suEmail, suPassword)) as unknown as AuthResult;

      if (!result.ok) {
        setError(result.error ?? "Sign up failed");
      } else {
        const currentUser = result.user ?? null;
        if (currentUser) {
          onAuthSuccess?.(currentUser);
          // navigation / redirect handled by App-level callback
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    warnIfCookieRefreshMayFail();
    window.location.href = `${API_ORIGIN}/api/auth/google?prompt=select_account`;
  };

  const inputClass =
    "w-full h-12 rounded-xl px-4 bg-[var(--color-surface-elevated)] border border-[var(--input-border)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)]";

  return (
    <div
      className="relative w-full flex items-stretch justify-center"
      style={{ overflow: "hidden", WebkitOverflowScrolling: "auto", minHeight: "calc(100vh - 64px)" }}
    >
      {/* Inline CSS for animations + mobile full-bleed rules */}
      <style>{`
        @keyframes blobFloat1 {
          0% { transform: translate3d(-10%, -10%, 0) scale(1); }
          50% { transform: translate3d(8%, 6%, 0) scale(1.05); }
          100% { transform: translate3d(-10%, -10%, 0) scale(1); }
        }
        @keyframes blobFloat2 {
          0% { transform: translate3d(10%, -6%, 0) scale(1); }
          50% { transform: translate3d(-6%, 8%, 0) scale(1.04); }
          100% { transform: translate3d(10%, -6%, 0) scale(1); }
        }
        /* MOBILE: make the card full-bleed like a native app */
        @media (max-width: 767px) {
          .auth-card {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-height: calc(100vh - 64px);
            height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
            overflow-y: auto !important;
          }
          .auth-card .card-inner {
            padding: 18px !important;
          }
          /* reduce inner rounded inputs on mobile for better fit */
          .auth-card input {
            border-radius: 10px !important;
          }
        }
      `}</style>

      {/* Background (blobs + subtle noise) */}
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(800px 600px at 18% 18%, rgba(9,204,206,0.08), transparent 55%), radial-gradient(900px 600px at 86% 82%, rgba(88,64,255,0.06), transparent 66%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 520,
            height: 420,
            left: "-6%",
            top: "-12%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(9,204,206,0.45), rgba(9,204,206,0.18) 38%, rgba(9,204,206,0.06) 68%, transparent 90%)",
            filter: "blur(72px)",
            animation: "blobFloat1 16s ease-in-out infinite",
            mixBlendMode: "screen",
            opacity: 0.8,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 620,
            height: 520,
            right: "-12%",
            bottom: "-10%",
            background:
              "radial-gradient(circle at 70% 70%, rgba(96,72,255,0.42), rgba(96,72,255,0.18) 36%, rgba(96,72,255,0.06) 64%, transparent 90%)",
            filter: "blur(92px)",
            animation: "blobFloat2 20s ease-in-out infinite",
            mixBlendMode: "lighten",
            opacity: 0.75,
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          style={{ opacity: 0.035 }}
        >
          <filter id="noiseFilter2">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter2)" />
        </svg>
      </div>

      {/* Center wrapper (desktop keeps centered card; mobile becomes full-bleed) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        className="w-full flex justify-center items-center relative z-10"
      >
        {/* auth-card: responsive — desktop is constrained, mobile is full-bleed */}
        <div
          className="auth-card rounded-2xl shadow-2xl overflow-visible"
          style={{
            background: "var(--color-surface)",
            boxShadow: "0 20px 40px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.02)",
            maxWidth: 1100,
            width: "100%",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Divider between halves */}

          {/* Desktop swap area (unchanged behavior) */}
          <div className="relative hidden md:block md:h-[640px]">
            {/* MARKETING panel */}
            <motion.div className="absolute top-0 left-0 w-1/2 h-full" animate={{ transform: isSignup ? "translateX(100%)" : "translateX(0%)" }} transition={{ duration: slideDuration }}>
              <div className="h-full p-10 flex flex-col justify-center" style={{ background: "linear-gradient(120deg, rgba(9,204,206,0.03) 0%, rgba(2,6,23,0.02) 60%)" }}>
                <h2 className="text-3xl md:text-5xl leading-tight font-extrabold" style={{ color: "var(--color-text-primary)" }}>
                  {isSignup ? <>Join Xpensio — <span className="text-[var(--color-accent-teal)]">Get started</span></> : <>Welcome back to <span className="text-[var(--color-accent-teal)]">Xpensio</span></>}
                </h2>

                <p className="mt-4 text-sm text-[var(--color-text-secondary)] max-w-[36ch]">
                  {isSignup ? "Create your account to keep your finances organized. Set budgets, view reports, and stay in control." : "Sign in to continue tracking expenses, setting budgets, and getting insights. Quick, private, and beautiful."}
                </p>

                {/* REPLACED: TipRotator inserted here */}
                <TipRotator isSignup={isSignup} />
              </div>
            </motion.div>

            {/* FORM panel */}
            <motion.div className="absolute top-0 left-1/2 w-1/2 h-full" style={{ zIndex: 10 }} animate={{ transform: isSignup ? "translateX(-100%)" : "translateX(0%)" }} transition={{ duration: slideDuration }}>
              <div className="h-full px-8 py-12 flex flex-col justify-center" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.02) 0%, rgba(2,6,23,0.03) 70%)" }}>
                <div className="max-w-md mx-auto w-full max-h-[520px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{isSignup ? "Create account" : "Sign in"}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{isSignup ? "Set up your account and start tracking" : "Use your email or sign in with Google"}</p>
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {isSignup ? (<button className="underline" onClick={() => setIsSignup(false)} aria-label="Switch to sign in">Sign in</button>) : (<button className="underline" onClick={() => setIsSignup(true)} aria-label="Switch to sign up">Sign up</button>)}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isSignup ? (
                      <motion.form key="signin-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} onSubmit={handleSignin} className="space-y-4">
                        {error && <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">{error}</div>}

                        <label className="block">
                          <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                          <div className="mt-2 relative">
                            <input type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} className={inputClass} placeholder="you@domain.com" required />
                            <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]"><Mail size={18} /></div>
                          </div>
                        </label>

                        <label className="block">
                          <span className="text-xs text-[var(--color-text-secondary)]">Password</span>
                          <div className="mt-2 relative">
                            <input type={showPassword ? "text" : "password"} value={siPassword} onChange={(e) => setSiPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                            <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
{/* <button
                              type="button"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              onClick={() => setShowPassword((current) => !current)}
                              className="absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[var(--color-text-secondary)] opacity-60 transition-opacity hover:opacity-100"
                            >
                            </button> */}
                              {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword((current) => !current)} size={18} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword((current) => !current)} size={18} />}

                            </div>
                          </div>
                        </label>

                        <div className="flex items-center justify-end">
                          {/* <label className="flex items-center gap-3 text-sm">
                            <input type="checkbox" className="h-4 w-4" />
                            <span className="text-[var(--color-text-secondary)]">Remember me</span>
                          </label> */}
                          <a className="text-sm underline">Forgot password?</a>
                        </div>

                        <div>
                          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold" style={{ background: "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)", color: "white" }}>{loading ? "Signing in..." : "Sign in"}</button>
                        </div>

                        <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

                        <button type="button" onClick={() => handleGoogle()} className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3">
                          <GoogleIcon />
                          <span className="text-sm">Sign in with Google</span>
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form key="signup-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} onSubmit={handleSignup} className="space-y-4">
                        {error && <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">{error}</div>}

                        <label className="block">
                          <span className="text-xs text-[var(--color-text-secondary)]">Full name</span>
                          <div className="mt-2">
                            <input type="text" value={suName} onChange={(e) => setSuName(e.target.value)} className={inputClass} placeholder="Your name" required />
                          </div>
                        </label>

                        <label className="block">
                          <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                          <div className="mt-2">
                            <input type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} className={inputClass} placeholder="you@domain.com" required />
                          </div>
                        </label>

                        <label className="block">
                          <span className="text-xs text-[var(--color-text-secondary)]">Create password</span>
                          <div className="mt-2 relative">
                            <input type={showNewPassword ? "text" : "password"} value={suPassword} onChange={(e) => setSuPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" required />
                            <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
{/* <button
                              type="button"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              onClick={() => setShowPassword((current) => !current)}
                              className="absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[var(--color-text-secondary)] opacity-60 transition-opacity hover:opacity-100"
                            >
                            </button> */}
                              {showNewPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowNewPassword((current) => !current)} size={18} /> : <Eye className="cursor-pointer" onClick={() => setShowNewPassword((current) => !current)} size={18} />}

                            </div>
                          </div>
                        </label>

                        <div>
                          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold" style={{ background: "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)", color: "white" }}>{loading ? "Creating account..." : "Create account"}</button>
                        </div>

                        <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

                        <button type="button" onClick={() => handleGoogle()} className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3"><GoogleIcon /><span className="text-sm">Continue with Google</span></button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <footer className="mt-6 text-xs text-[var(--color-text-secondary)] text-center">
                    By continuing, you agree to Xpensio's <a className="underline">Terms</a> and <a className="underline">Privacy Policy</a>.
                  </footer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile stacked area (full-bleed; paddings reduced) */}
          <div className="block md:hidden pt-8">
            <div className="card-inner p-6 bg-[linear-gradient(180deg, rgba(9,204,206,0.03), rgba(9,204,206,0.01))]">
              <h2 className="text-2xl font-bold">{isSignup ? "Join Xpensio — Get started" : "Welcome back to Xpensio"}</h2>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{isSignup ? "Create your account to keep your finances organized. Set budgets, view reports, and stay in control." : "Sign in to continue tracking expenses, setting budgets, and getting insights. Quick, private, and beautiful."}</p>
            </div>

            <div className="card-inner p-6 bg-[var(--color-surface)]">
              <div className="max-w-md mx-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{isSignup ? "Create account" : "Sign in"}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{isSignup ? "Set up your account and start tracking" : "Use your email or sign in with Google"}</p>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {isSignup ? (<button className="underline" onClick={() => setIsSignup(false)}>Sign in</button>) : (<button className="underline" onClick={() => setIsSignup(true)}>Sign up</button>)}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!isSignup ? (
                    <motion.form key="m-signin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} onSubmit={handleSignin} className="space-y-4">
                      {error && <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">{error}</div>}

                      <label className="block">
                        <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                        <div className="mt-2 relative">
                          <input type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} className={inputClass} placeholder="you@domain.com" required />
                          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]"><Mail size={18} /></div>
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-xs text-[var(--color-text-secondary)]">Password</span>
                        <div className="mt-2 relative">
                          <input type={showPassword ? "text" : "password"} value={siPassword} onChange={(e) => setSiPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
                            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword((current) => !current)} size={18} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword((current) => !current)} size={18} />}

                          </div>
                        </div>
                      </label>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4" /><span className="text-[var(--color-text-secondary)]">Remember me</span></label>
                        <a className="text-sm underline">Forgot password?</a>
                      </div>

                      <div>
                        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold" style={{ background: "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)", color: "white" }}>{loading ? "Signing in..." : "Sign in"}</button>
                      </div>

                      <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

                      <button type="button" onClick={() => handleGoogle()} className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3"><GoogleIcon /><span className="text-sm">Sign in with Google</span></button>
                    </motion.form>
                  ) : (
                    <motion.form key="m-signup" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }} onSubmit={handleSignup} className="space-y-4">
                      {error && <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">{error}</div>}

                      <label className="block">
                        <span className="text-xs text-[var(--color-text-secondary)]">Full name</span>
                        <div className="mt-2">
                          <input type="text" value={suName} onChange={(e) => setSuName(e.target.value)} className={inputClass} placeholder="Your name" required />
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                        <div className="mt-2">
                          <input type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} className={inputClass} placeholder="you@domain.com" required />
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-xs text-[var(--color-text-secondary)]">Create password</span>
                        <div className="mt-2 relative">
                          <input type={showNewPassword ? "text" : "password"} value={suPassword} onChange={(e) => setSuPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" required />
                          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
                            {/* <button
                              type="button"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              onClick={() => setShowPassword((current) => !current)}
                              className="absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[var(--color-text-secondary)] opacity-60 transition-opacity hover:opacity-100"
                            >
                            </button> */}
                              {showNewPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowNewPassword((current) => !current)} size={18} /> : <Eye className="cursor-pointer" onClick={() => setShowNewPassword((current) => !current)} size={18} />}

                            </div>
                        </div>
                      </label>

                      <div>
                        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold" style={{ background: "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)", color: "white" }}>{loading ? "Creating account..." : "Create account"}</button>
                      </div>

                      <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

                      <button type="button" onClick={() => handleGoogle()} className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3"><GoogleIcon /><span className="text-sm">Continue with Google</span></button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

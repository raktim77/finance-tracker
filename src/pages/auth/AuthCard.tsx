/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lightbulb, Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../lib/context/useAuth";
import { API_ORIGIN, warnIfCookieRefreshMayFail } from "../../lib/api/config";
import * as authApi from "../../lib/api/authApi";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";
import { useToast } from "../../components/ui/confirm-modal/useToast";
import { useNavigate } from "react-router-dom";
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

const TipRotator: React.FC<TipRotatorProps> = ({
  isSignup,
  intervalMs = 4200,
}) => {
  const signInMessages = [
    "Use the Quick Add (FAB) to log purchases in seconds.",
    "Enable smart categories to auto-sort transactions.",
    "Connect multiple cards and view consolidated reports.",
  ];
  const signUpMessages = [
    "Private-first, lightweight, and built for daily use.",
    "Create budgets and get alerted when you overspend.",
    "Sync across devices instantly and securely.",
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
    exit: { y: -10, opacity: 0, transition: { duration: 0.28 } },
  };

  return (
    <div
      className="mt-8 py-4 rounded-lg"
      style={{
        background: "var(--benefits-card-color)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
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

type AuthView = "signin" | "signup" | "forgot_password";
type SignupStep = "form" | "otp";
type ForgotPasswordStep = "email" | "otp" | "reset";

type PendingSignup = {
  name: string;
  email: string;
  password: string;
};

/* ---------------------- Icons ---------------------- */
const GoogleIcon = () => (
  <svg
    viewBox="0 0 533.5 544.3"
    className="w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      fill="#4285F4"
      d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.2h147.5c-6.4 34.7-25.7 64.1-54.6 83.8v69.4h88.3c51.6-47.5 80.3-117.5 80.3-197.9z"
    />
    <path
      fill="#34A853"
      d="M272 544.3c73.5 0 135.2-24.3 180.2-65.8l-88.3-69.4c-24.5 16.4-55.8 26-91.9 26-70.6 0-130.4-47.6-151.8-111.5H27.2v70.2c44.9 88.5 137.5 150.5 244.8 150.5z"
    />
    <path
      fill="#FBBC05"
      d="M120.2 323.6c-10.9-32.7-10.9-68.1 0-100.8V152.6H27.2c-43.8 87.7-43.8 191 0 278.6l93-70.2z"
    />
    <path
      fill="#EA4335"
      d="M272 107.7c39.9-.6 77.1 14 105.9 40.8l78.9-78.9C407 24.8 345.5 0 272 0 164.7 0 72.1 62 27.2 150.5l93 70.2C141.6 155.3 201.4 107.7 272 107.7z"
    />
  </svg>
);

/* ---------------------- Animation settings ---------------------- */
const slideDuration = 0.56;

/* ---------------------- Component ---------------------- */
export default function AuthCard({ onAuthSuccess }: Props) {
  useDisableBodyScrollOnAuth(true);

  const { login, signup } = useAuth();

  const [authView, setAuthView] = useState<AuthView>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [forgotPasswordStep, setForgotPasswordStep] =
    useState<ForgotPasswordStep>("email");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(6).fill(""));
  const [resetEmail, setResetEmail] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpCode = otpDigits.join("");
  const isSignup = authView === "signup";
  const isBusy = loading || sendingOtp || verifyingOtp || resettingPassword;
  const toast = useToast();
  const navigate = useNavigate()
  useEffect(() => {
    if (signupStep !== "otp" && forgotPasswordStep !== "otp") return;
    otpInputRefs.current[0]?.focus();
  }, [signupStep, forgotPasswordStep]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = window.setTimeout(() => {
      setResendTimer((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendTimer]);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => {
      setError((current) => (current === error ? null : current));
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [error]);

  const resetOtpState = () => {
    setOtpDigits(Array(6).fill(""));
    setResendTimer(0);
    otpInputRefs.current = [];
  };

  const resetSignupFlow = () => {
    setSignupStep("form");
    setPendingSignup(null);
    setSendingOtp(false);
    setVerifyingOtp(false);
    resetOtpState();
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordStep("email");
    setSendingOtp(false);
    setVerifyingOtp(false);
    setResettingPassword(false);
    setResetEmail("");
    setResetPasswordValue("");
    setShowResetPassword(false);
    resetOtpState();
  };

  const switchToSignin = () => {
    setAuthView("signin");
    setError(null);
    resetSignupFlow();
    resetForgotPasswordFlow();
  };

  const switchToSignup = () => {
    setAuthView("signup");
    setError(null);
    setLoading(false);
    resetForgotPasswordFlow();
  };

  const switchToForgotPassword = () => {
    setAuthView("forgot_password");
    setError(null);
    resetSignupFlow();
    setForgotPasswordStep("email");
    setResetEmail(siEmail.trim());
    setResetPasswordValue("");
    setShowResetPassword(false);
    resetOtpState();
  };

  const maskedEmail = (email: string) => {
    const [local = "", domain = ""] = email.split("@");
    if (!domain) return email;
    const visibleLocal = local.slice(0, Math.min(local.length, 3));
    return `${visibleLocal}${local.length > 3 ? "•••" : ""}@${domain}`;
  };

  const handleSignin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!siEmail) return setError("Please enter email");
    if (!siPassword) return setError("Please enter password");
    setLoading(true);
    try {
      const result = (await login(siEmail, siPassword)) as unknown as AuthResult;

      if (!result.ok) {
        setError(result.error ?? "Sign in failed");
      } else {
        const currentUser = result.user ?? null;
        if (currentUser) onAuthSuccess?.(currentUser);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignupOtp = async (payload?: PendingSignup) => {
    const nextPayload = payload ?? pendingSignup;

    if (!nextPayload?.email) {
      setError("Please enter email");
      return false;
    }

    try {
      setSendingOtp(true);
      const response = await authApi.sendOtp({
        email: nextPayload.email,
        purpose: "email_verification",
      });

      if (!response.ok) {
        setError(response.error?.message || "Failed to send verification code");
        return false;
      }

      setPendingSignup(nextPayload);
      setSignupStep("otp");
      setOtpDigits(Array(6).fill(""));
      setResendTimer(60);
      setError(null);
      return true;
    } catch {
      setError("Failed to send verification code");
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!suName) return setError("Please enter your name");
    if (!suEmail) return setError("Please enter email");
    if (!suPassword) return setError("Please enter password");

    const payload = {
      name: suName.trim(),
      email: suEmail.trim(),
      password: suPassword,
    };

    await handleSendSignupOtp(payload);
  };

  const handleVerifySignupOtp = async () => {
    if (!pendingSignup) {
      setError("Please start signup again");
      resetSignupFlow();
      return;
    }

    try {
      setVerifyingOtp(true);
      setError(null);

      const otpResponse = await authApi.verifyOtp({
        email: pendingSignup.email,
        code: otpCode,
        purpose: "email_verification",
      });

      if (!otpResponse.ok) {
        setError(otpResponse.error?.message || "Invalid verification code");
        return;
      }
    } catch {
      setError("Invalid verification code");
      return;
    } finally {
      setVerifyingOtp(false);
    }

    setLoading(true);
    try {
      const result = (await signup(
        pendingSignup.name,
        pendingSignup.email,
        pendingSignup.password
      )) as unknown as AuthResult;

      if (!result.ok) {
        setError(result.error ?? "Sign up failed");
        return;
      }

      const currentUser = result.user ?? null;
      if (currentUser) {
        resetSignupFlow();
        onAuthSuccess?.(currentUser);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignupDetails = () => {
    setError(null);
    setSignupStep("form");
    setOtpDigits(Array(6).fill(""));
  };

  const handleCancelSignup = () => {
    setError(null);
    resetSignupFlow();
    setSuPassword("");
    setSuName("");
    setSuEmail("");
    setShowNewPassword(false);
    setAuthView("signin");
  };

  const handleSendResetOtp = async () => {
    if (!resetEmail.trim()) {
      setError("Please enter email");
      return false;
    }

    try {
      setSendingOtp(true);
      const res = await authApi.sendOtp({
        email: resetEmail.trim(),
        purpose: "password_reset",
      });

      if (!res.ok) {
        setError(res.error?.message || "Failed to send OTP");
        return false;
      }

      setForgotPasswordStep("otp");
      setOtpDigits(Array(6).fill(""));
      setResendTimer(60);
      setError(null);
      return true;
    } catch {
      setError("Failed to send OTP");
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!resetEmail.trim()) {
      setError("Please enter email");
      setForgotPasswordStep("email");
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await authApi.verifyOtp({
        email: resetEmail.trim(),
        code: otpCode,
        purpose: "password_reset",
      });

      if (!res.ok) {
        setError(res.error?.message || "Invalid OTP");
        return;
      }

      setError(null);
      setForgotPasswordStep("reset");
    } catch {
      setError("Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!resetPasswordValue) {
      setError("Please enter a new password");
      return;
    }

    try {
      setResettingPassword(true);
      const res = await authApi.resetPassword({
        email: resetEmail.trim(),
        code: otpCode,
        new_password: resetPasswordValue,
      });

      if (!res.ok) {
        setError(res.error?.message || "Failed to reset password");
        return;
      }

      setError("Password reset successful. Please sign in.");
      setSiEmail(resetEmail.trim());
      setSiPassword("");
      resetForgotPasswordFlow();
      setAuthView("signin");
    } catch {
      setError("Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleOtpInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtpDigits = [...otpDigits];
    nextOtpDigits[index] = digit;
    setOtpDigits(nextOtpDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        const nextOtpDigits = [...otpDigits];
        nextOtpDigits[index] = "";
        setOtpDigits(nextOtpDigits);
        return;
      }

      if (index > 0) {
        event.preventDefault();
        otpInputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedCode) return;

    setOtpDigits(Array.from({ length: 6 }, (_, index) => pastedCode[index] ?? ""));

    const focusIndex = Math.min(pastedCode.length, 6) - 1;
    otpInputRefs.current[Math.max(focusIndex, 0)]?.focus();
  };

  const setOtpInputRef = (index: number, node: HTMLInputElement | null) => {
    if (!node) return;
    if (node.offsetParent === null) return;
    otpInputRefs.current[index] = node;
  };

  const handleGoogle = async () => {
    if (isBusy) return;

    warnIfCookieRefreshMayFail();

    if (!isNativeAndroidApp()) {
      window.location.href = `${API_ORIGIN}/api/auth/google?prompt=select_account`;
      return;
    }

    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        scopes: ["email", "profile"],
        mode: "popup"
      });

      const idToken = result.credential?.idToken;

      if (!idToken) {
        throw new Error("No ID token received");
      }

      const res = await fetch(`${API_ORIGIN}/api/auth/google/mobile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        throw new Error("Backend auth failed");
      }

      const data = await res.json();
      const ott = data.ott;

      if (!ott) {
        throw new Error("No OTT received");
      }

      // 🔥 IMPORTANT: go to oauth-finish like web
      navigate(`/oauth-finish#ott=${ott}`, { replace: true });

    } catch (err: unknown) {
      console.log("[ERROR FROM GOOGLE SIGN IN]", err)
      if (
        err instanceof Error &&
        err.message.includes("No credential")
      ) {
        // toast.show("No Google account found. Please add one to your device.");
        toast.show(err.message)
      } else {
        toast.show("Google sign-in failed");
      }
    }
  };

  const inputClass =
    "w-full h-12 rounded-xl px-4 bg-[var(--color-surface-elevated)] border border-[var(--input-border)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)]";

  const otpInputClass =
    "w-full h-14 rounded-xl border border-[var(--input-border)] bg-[var(--color-surface-elevated)] text-center text-xl font-semibold tracking-[0.15em] focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)]";

  const renderSigninForm = () => (
    <motion.form
      key="signin-form"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      onSubmit={handleSignin}
      className="space-y-4"
    >
      {error && (
        <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
        <div className="mt-2 relative">
          <input
            type="email"
            value={siEmail}
            onChange={(e) => setSiEmail(e.target.value)}
            className={inputClass}
            placeholder="email@example.com"
            disabled={isBusy}
            required
          />
          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
            <Mail size={18} />
          </div>
        </div>
      </label>

      <label className="block">
        <span className="text-xs text-[var(--color-text-secondary)]">Password</span>
        <div className="mt-2 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={siPassword}
            onChange={(e) => setSiPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            disabled={isBusy}
            required
          />
          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
            {showPassword ? (
              <EyeOff
                className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                onClick={() => {
                  if (isBusy) return;
                  setShowPassword((current) => !current);
                }}
                size={18}
              />
            ) : (
              <Eye
                className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                onClick={() => {
                  if (isBusy) return;
                  setShowPassword((current) => !current);
                }}
                size={18}
              />
            )}
          </div>
        </div>
      </label>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-sm underline disabled:opacity-50"
          onClick={switchToForgotPassword}
          disabled={isBusy}
        >
          Forgot password?
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={isBusy}
          className="w-full h-12 rounded-xl font-semibold"
          style={{
            background:
              "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
            color: "white",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isBusy}
        className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <GoogleIcon />
        <span className="text-sm">Sign in with Google</span>
      </button>
    </motion.form>
  );

  const renderSignupForm = (motionKey: string) => (
    <motion.form
      key={motionKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      onSubmit={handleSignup}
      className="space-y-4"
    >
      {error && (
        <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-xs text-[var(--color-text-secondary)]">Full name</span>
        <div className="mt-2">
          <input
            type="text"
            value={suName}
            onChange={(e) => setSuName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
            disabled={isBusy}
            required
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
        <div className="mt-2">
          <input
            type="email"
            value={suEmail}
            onChange={(e) => setSuEmail(e.target.value)}
            className={inputClass}
            placeholder="you@domain.com"
            disabled={isBusy}
            required
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs text-[var(--color-text-secondary)]">
          Create password
        </span>
        <div className="mt-2 relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={suPassword}
            onChange={(e) => setSuPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            disabled={isBusy}
            required
          />
          <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
            {showNewPassword ? (
              <EyeOff
                className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                onClick={() => {
                  if (isBusy) return;
                  setShowNewPassword((current) => !current);
                }}
                size={18}
              />
            ) : (
              <Eye
                className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                onClick={() => {
                  if (isBusy) return;
                  setShowNewPassword((current) => !current);
                }}
                size={18}
              />
            )}
          </div>
        </div>
      </label>

      <div>
        <button
          type="submit"
          disabled={isBusy}
          className="w-full h-12 rounded-xl font-semibold"
          style={{
            background:
              "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
            color: "white",
          }}
        >
          {sendingOtp ? "Sending code..." : "Continue"}
        </button>
      </div>

      <div className="text-center text-sm text-[var(--color-text-secondary)]">or</div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isBusy}
        className="w-full h-12 rounded-xl border border-neutral-700 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <GoogleIcon />
        <span className="text-sm">Continue with Google</span>
      </button>
    </motion.form>
  );

  const renderSignupOtpStep = (motionKey: string) => (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      {error && (
        <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          Verify your email
        </p>
        <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
          Enter the 6-digit code
        </h4>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We sent a verification code to {maskedEmail(pendingSignup?.email ?? suEmail)}.
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(node) => setOtpInputRef(index, node)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={otpDigits[index] ?? ""}
            onChange={(e) => handleOtpInputChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            disabled={isBusy}
            className={otpInputClass}
          />
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={handleVerifySignupOtp}
          disabled={otpCode.length < 6 || isBusy}
          className="w-full h-12 rounded-xl font-semibold"
          style={{
            background:
              "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
            color: "white",
          }}
        >
          {verifyingOtp
            ? "Verifying code..."
            : loading
              ? "Creating account..."
              : "Verify and create account"}
        </button>
      </div>

      <button
        type="button"
        disabled={resendTimer > 0 || isBusy}
        onClick={() => void handleSendSignupOtp()}
        className="w-full text-sm underline text-[var(--color-text-secondary)] disabled:opacity-40"
      >
        {sendingOtp
          ? "Sending code..."
          : resendTimer > 0
            ? `Resend available in ${resendTimer}s`
            : "Resend code"}
      </button>

      <div className="flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          onClick={handleBackToSignupDetails}
          disabled={sendingOtp || verifyingOtp || loading}
          className="underline text-[var(--color-text-secondary)]"
        >
          Back to details
        </button>
        <button
          type="button"
          onClick={handleCancelSignup}
          disabled={sendingOtp || verifyingOtp || loading}
          className="underline text-[var(--color-text-secondary)]"
        >
          Cancel sign up
        </button>
      </div>
    </motion.div>
  );

  const renderForgotPasswordForm = (motionKey: string) => (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      {error && (
        <div role="alert" className="text-sm text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </div>
      )}

      {forgotPasswordStep === "email" && (
        <>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Reset password
            </p>
            <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Get a verification code
            </h4>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Enter your email and we&apos;ll send you a 6-digit OTP.
            </p>
          </div>

          <label className="block">
            <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
            <div className="mt-2 relative">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={inputClass}
                placeholder="you@domain.com"
                disabled={isBusy}
                required
              />
              <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
                <Mail size={18} />
              </div>
            </div>
          </label>

          <button
            type="button"
            onClick={() => void handleSendResetOtp()}
            disabled={isBusy}
            className="w-full h-12 rounded-xl font-semibold"
            style={{
              background:
                "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
              color: "white",
            }}
          >
            {sendingOtp ? "Sending code..." : "Send verification code"}
          </button>
        </>
      )}

      {forgotPasswordStep === "otp" && (
        <>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Verify OTP
            </p>
            <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Enter the 6-digit code
            </h4>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              We sent a verification code to {maskedEmail(resetEmail)}.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <input
                key={index}
                ref={(node) => setOtpInputRef(index, node)}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={otpDigits[index] ?? ""}
                onChange={(e) => handleOtpInputChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                disabled={isBusy}
                className={otpInputClass}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleVerifyResetOtp}
            disabled={otpCode.length < 6 || isBusy}
            className="w-full h-12 rounded-xl font-semibold"
            style={{
              background:
                "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
              color: "white",
            }}
          >
            {verifyingOtp ? "Verifying code..." : "Verify code"}
          </button>

          <button
            type="button"
            disabled={resendTimer > 0 || isBusy}
            onClick={() => void handleSendResetOtp()}
            className="w-full text-sm underline text-[var(--color-text-secondary)] disabled:opacity-40"
          >
            {sendingOtp
              ? "Sending code..."
              : resendTimer > 0
                ? `Resend available in ${resendTimer}s`
                : "Resend code"}
          </button>
        </>
      )}

      {forgotPasswordStep === "reset" && (
        <>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              New password
            </p>
            <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Set a new password
            </h4>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Create a new password for {maskedEmail(resetEmail)}.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <label className="block">
              <span className="text-xs text-[var(--color-text-secondary)]">
                New password
              </span>
              <div className="mt-2 relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className={inputClass}
                  placeholder="At least 8 characters"
                  disabled={isBusy}
                  required
                />
                <div className="absolute right-3 top-4 text-[var(--color-text-secondary)]">
                  {showResetPassword ? (
                    <EyeOff
                      className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      onClick={() => {
                        if (isBusy) return;
                        setShowResetPassword((current) => !current);
                      }}
                      size={18}
                    />
                  ) : (
                    <Eye
                      className={isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      onClick={() => {
                        if (isBusy) return;
                        setShowResetPassword((current) => !current);
                      }}
                      size={18}
                    />
                  )}
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full h-12 rounded-xl font-semibold"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-accent-teal, #09ccce), #007a78)",
                color: "white",
              }}
            >
              {resettingPassword ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        </>
      )}

      <div className="flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          onClick={() => {
            if (forgotPasswordStep === "otp") {
              setForgotPasswordStep("email");
              setOtpDigits(Array(6).fill(""));
              return;
            }

            if (forgotPasswordStep === "reset") {
              setForgotPasswordStep("otp");
              return;
            }

            switchToSignin();
          }}
          disabled={isBusy}
          className="underline text-[var(--color-text-secondary)] disabled:opacity-50"
        >
          {forgotPasswordStep === "email" ? "Back to sign in" : "Go back"}
        </button>

      </div>
    </motion.div>
  );

  return (
    <div
      className="relative w-full flex items-stretch justify-center"
      style={{
        overflow: "hidden",
        WebkitOverflowScrolling: "auto",
        minHeight: "calc(100vh - 64px)",
      }}
    >
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
        @media (max-width: 767px) {
          .auth-card {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-height: calc(100vh - 64px);
            height: calc(100vh - var(--safe-area-inset-top, env(safe-area-inset-top, 0px)) - var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
            overflow-y: auto !important;
          }
          .auth-card .card-inner {
            padding: 18px !important;
          }
          .auth-card input {
            border-radius: 10px !important;
          }
        }
      `}</style>

      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
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
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="1"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter2)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        className="w-full flex justify-center items-center relative z-10"
      >
        <div
          className="auth-card rounded-2xl shadow-2xl overflow-visible"
          style={{
            background: "var(--color-surface)",
            boxShadow:
              "0 20px 40px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.02)",
            maxWidth: 1100,
            width: "100%",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="relative hidden md:block md:h-[640px]">
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full"
              animate={{
                transform: isSignup ? "translateX(100%)" : "translateX(0%)",
              }}
              transition={{ duration: slideDuration }}
            >
              <div
                className="h-full p-10 flex flex-col justify-center"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(9,204,206,0.03) 0%, rgba(2,6,23,0.02) 60%)",
                }}
              >
                <h2
                  className="text-3xl md:text-5xl leading-tight font-extrabold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {isSignup ? (
                    <>
                      Join Xpensio <span className="text-[var(--color-accent-teal)]">Get started</span>
                    </>
                  ) : (
                    <>
                      Welcome back to <span className="text-[var(--color-accent-teal)]">Xpensio</span>
                    </>
                  )}
                </h2>

                <p className="mt-4 text-sm text-[var(--color-text-secondary)] max-w-[36ch]">
                  {isSignup
                    ? "Create your account to keep your finances organized. Set budgets, view reports, and stay in control."
                    : "Sign in to continue tracking expenses, setting budgets, and getting insights. Quick, private, and beautiful."}
                </p>

                <TipRotator isSignup={isSignup} />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-0 left-1/2 w-1/2 h-full"
              style={{ zIndex: 10 }}
              animate={{
                transform: isSignup ? "translateX(-100%)" : "translateX(0%)",
              }}
              transition={{ duration: slideDuration }}
            >
              <div
                className="h-full px-8 py-12 flex flex-col justify-center"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(255,255,255,0.02) 0%, rgba(2,6,23,0.03) 70%)",
                }}
              >
                <div className="max-w-md mx-auto w-full max-h-[560px]">
                  {signupStep !== "otp" && authView !== "forgot_password" ? (
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {authView === "signin"
                            ? "Sign in"
                            : "Create account"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {authView === "signin"
                            ? "Use your email or sign in with Google"
                            : "Set up your account and start tracking"}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {authView !== "signin" ? (
                          <button
                            className="underline"
                            onClick={switchToSignin}
                            aria-label="Switch to sign in"
                            disabled={isBusy}
                          >
                            Sign in
                          </button>
                        ) : (
                          <button
                            className="underline"
                            onClick={switchToSignup}
                            aria-label="Switch to sign up"
                            disabled={isBusy}
                          >
                            Sign up
                          </button>
                        )}
                      </div>
                    </div>

                  ) : <></>}

                  <AnimatePresence mode="wait">
                    {authView === "signin"
                      ? renderSigninForm()
                      : authView === "forgot_password"
                        ? renderForgotPasswordForm("forgot-password-desktop")
                        : signupStep === "otp"
                          ? renderSignupOtpStep("signup-otp-desktop")
                          : renderSignupForm("signup-form")}
                  </AnimatePresence>

                  <footer className="mt-6 text-xs text-[var(--color-text-secondary)] text-center">
                    By continuing, you agree to Xpensio's <a className="underline">Terms</a> and{" "}
                    <a className="underline">Privacy Policy</a>.
                  </footer>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="block md:hidden pt-8">

            <div className="card-inner p-6 bg-[linear-gradient(180deg, rgba(9,204,206,0.03), rgba(9,204,206,0.01))]">
              <h2 className="text-2xl font-bold">
                {isSignup ? "Join Xpensio — Get started" : "Welcome back to Xpensio"}
              </h2>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                {isSignup
                  ? "Create your account to keep your finances organized. Set budgets, view reports, and stay in control."
                  : "Sign in to continue tracking expenses, setting budgets, and getting insights. Quick, private, and beautiful."}
              </p>
            </div>

            <div className="card-inner p-6 bg-[var(--color-surface)]">
              <div className="max-w-md mx-auto">
                {signupStep !== "otp" && authView !== "forgot_password" ? (
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {authView === "signin"
                          ? "Sign in"
                          : "Create account"}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {authView === "signin"
                          ? "Use your email or sign in with Google"
                          : "Set up your account and start tracking"}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {authView !== "signin" ? (
                        <button className="underline disabled:opacity-50" onClick={switchToSignin} disabled={isBusy}>
                          Sign in
                        </button>
                      ) : (
                        <button className="underline disabled:opacity-50" onClick={switchToSignup} disabled={isBusy}>
                          Sign up
                        </button>
                      )}
                    </div>
                  </div>

                ) : <></>}

                <AnimatePresence mode="wait">
                  {authView === "signin"
                    ? renderSigninForm()
                    : authView === "forgot_password"
                      ? renderForgotPasswordForm("forgot-password-mobile")
                      : signupStep === "otp"
                        ? renderSignupOtpStep("signup-otp-mobile")
                        : renderSignupForm("m-signup")}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

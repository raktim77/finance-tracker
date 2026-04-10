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
import FullscreenLogoLoaderMotion from "../../components/loader/FullscreenLogoLoaderMotion";
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
      className="mt-8 p-4 rounded-lg"
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

type FeedbackTone = "error" | "success";

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
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("error");
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
  const [nativeGoogleLoading, setNativeGoogleLoading] = useState(false);

  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpCode = otpDigits.join("");
  const isSignup = authView === "signup";
  const isBusy = loading || sendingOtp || verifyingOtp || resettingPassword;
  const toast = useToast();
  const navigate = useNavigate()
  useEffect(() => {
    if (signupStep !== "otp" && forgotPasswordStep !== "otp") return;

    const focusFirstOtp = () => {
      const firstInput = otpInputRefs.current[0];
      if (!firstInput) return;
      firstInput.focus();
      firstInput.select();
    };

    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(focusFirstOtp);
    });

    return () => window.cancelAnimationFrame(frameId);
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

  const clearFeedback = () => {
    setError(null);
    setFeedbackTone("error");
  };

  const showError = (message: string) => {
    setFeedbackTone("error");
    setError(message);
  };

  const showSuccess = (message: string) => {
    setFeedbackTone("success");
    setError(message);
  };

  const inlineFeedbackClass =
    feedbackTone === "success"
      ? "text-sm text-green-400 bg-green-900/10 border border-green-500/20 p-2 rounded"
      : "text-sm text-red-400 bg-red-900/10 border border-red-500/20 p-2 rounded";

  const renderFeedback = (mobile = false) => (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.div
          key={`${feedbackTone}:${error}`}
          role="alert"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
          className={mobile ? (feedbackTone === "success" ? "mpa-success" : "mpa-error") : inlineFeedbackClass}
        >
          {error}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

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
    clearFeedback();
    resetSignupFlow();
    resetForgotPasswordFlow();
  };

  const switchToSignup = () => {
    setAuthView("signup");
    clearFeedback();
    setLoading(false);
    resetForgotPasswordFlow();
  };

  const switchToForgotPassword = () => {
    setAuthView("forgot_password");
    clearFeedback();
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
    clearFeedback();
    if (!siEmail) return showError("Please enter email");
    if (!siPassword) return showError("Please enter password");
    setLoading(true);
    try {
      const result = (await login(siEmail, siPassword)) as unknown as AuthResult;

      if (!result.ok) {
        showError(result.error ?? "Sign in failed");
      } else {
        const currentUser = result.user ?? null;
        if (currentUser) onAuthSuccess?.(currentUser);
      }
    } catch {
      showError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignupOtp = async (payload?: PendingSignup) => {
    const nextPayload = payload ?? pendingSignup;

    if (!nextPayload?.email) {
      showError("Please enter email");
      return false;
    }

    try {
      setSendingOtp(true);
      const response = await authApi.sendOtp({
        email: nextPayload.email,
        purpose: "email_verification",
      });

      if (!response.ok) {
        showError(response.error?.message || "Failed to send verification code");
        return false;
      }

      setPendingSignup(nextPayload);
      setSignupStep("otp");
      setOtpDigits(Array(6).fill(""));
      setResendTimer(60);
      clearFeedback();
      return true;
    } catch {
      showError("Failed to send verification code");
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearFeedback();

    if (!suName) return showError("Please enter your name");
    if (!suEmail) return showError("Please enter email");
    if (!suPassword) return showError("Please enter password");

    const payload = {
      name: suName.trim(),
      email: suEmail.trim(),
      password: suPassword,
    };

    await handleSendSignupOtp(payload);
  };

  const handleVerifySignupOtp = async () => {
    if (!pendingSignup) {
      showError("Please start signup again");
      resetSignupFlow();
      return;
    }

    try {
      setVerifyingOtp(true);
      clearFeedback();

      const otpResponse = await authApi.verifyOtp({
        email: pendingSignup.email,
        code: otpCode,
        purpose: "email_verification",
      });

      if (!otpResponse.ok) {
        showError(otpResponse.error?.message || "Invalid verification code");
        return;
      }
    } catch {
      showError("Invalid verification code");
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
        showError(result.error ?? "Sign up failed");
        return;
      }

      const currentUser = result.user ?? null;
      if (currentUser) {
        resetSignupFlow();
        onAuthSuccess?.(currentUser);
      }
    } catch {
      showError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignupDetails = () => {
    clearFeedback();
    setSignupStep("form");
    setOtpDigits(Array(6).fill(""));
  };

  const handleCancelSignup = () => {
    clearFeedback();
    resetSignupFlow();
    setSuPassword("");
    setSuName("");
    setSuEmail("");
    setShowNewPassword(false);
    setAuthView("signin");
  };

  const handleSendResetOtp = async () => {
    if (!resetEmail.trim()) {
      showError("Please enter email");
      return false;
    }

    try {
      setSendingOtp(true);
      const res = await authApi.sendOtp({
        email: resetEmail.trim(),
        purpose: "password_reset",
      });

      if (!res.ok) {
        showError(res.error?.message || "Failed to send OTP");
        return false;
      }

      setForgotPasswordStep("otp");
      setOtpDigits(Array(6).fill(""));
      setResendTimer(60);
      clearFeedback();
      return true;
    } catch {
      showError("Failed to send OTP");
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!resetEmail.trim()) {
      showError("Please enter email");
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
        showError(res.error?.message || "Invalid OTP");
        return;
      }

      clearFeedback();
      setForgotPasswordStep("reset");
    } catch {
      showError("Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!resetPasswordValue) {
      showError("Please enter a new password");
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
        showError(res.error?.message || "Failed to reset password");
        return;
      }

      showSuccess("Password reset successful. Please sign in.");
      setSiEmail(resetEmail.trim());
      setSiPassword("");
      resetForgotPasswordFlow();
      setAuthView("signin");
    } catch {
      showError("Failed to reset password");
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
    otpInputRefs.current[index] = node;
  };

  const handleGoogle = async () => {
  if (isBusy || nativeGoogleLoading) return;

  warnIfCookieRefreshMayFail();

  if (!isNativeAndroidApp()) {
    window.location.href = `${API_ORIGIN}/api/auth/google?prompt=select_account`;
    return;
  }

  // 🔒 helper retry wrapper
  const attemptGoogleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithGoogle({
      scopes: ["email", "profile"],
      mode: "popup"
    });

    const idToken = result.credential?.idToken;

    if (!idToken) {
      throw new Error("No ID token received");
    }

    return idToken;
  };

  try {
    setNativeGoogleLoading(true);

    // 🧠 slight delay helps on flaky WiFi / Play Services sync
    await new Promise((r) => setTimeout(r, 200));

    let idToken: string | undefined;

    try {
      // 👉 first attempt
      idToken = await attemptGoogleSignIn();
    } catch (err) {
      // 🔁 retry ONLY for credential errors
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("credential")
      ) {
        console.log("[GOOGLE RETRY TRIGGERED]", err.message);

        await new Promise((r) => setTimeout(r, 300));

        idToken = await attemptGoogleSignIn();
      } else {
        throw err;
      }
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

    navigate(`/oauth-finish#ott=${ott}`, { replace: true });

  } catch (err: unknown) {
    console.log("[ERROR FROM GOOGLE SIGN IN]", err);

    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("credential")
    ) {
      toast.show("Network issue. Retrying may help.");
      // toast.show("Network issue or no Google account found on device. Retrying may help.");
        // toast.show(err.message + ". Please try again after some time")
    } else {
      toast.show("Google sign-in failed");
    }

  } finally {
    setNativeGoogleLoading(false);
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
      {renderFeedback()}

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
              "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
            color: "white",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <div className="text-center text-sm text-[var(--color-text-secondary)]">OR</div>

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
      {renderFeedback()}

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
              "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
            color: "white",
          }}
        >
          {sendingOtp ? "Sending code..." : "Continue"}
        </button>
      </div>

      <div className="text-center text-sm text-[var(--color-text-secondary)]">OR</div>

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
      {renderFeedback()}

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
              "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
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
      {renderFeedback()}

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
                "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
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
                "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
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
                  "linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%)",
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
    <>
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
                className="relative h-full p-10 flex flex-col justify-center overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, var(--color-accent) 0%, var(--color-primary) 48%, var(--color-accent-teal) 100%)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 360,
                      height: 360,
                      top: -120,
                      right: -70,
                      background: "rgba(255, 255, 255, 0.14)",
                    }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 240,
                      height: 240,
                      left: -110,
                      top: 150,
                      background: "rgba(255, 255, 255, 0.09)",
                    }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-44"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(169, 94, 31, 0.32) 100%)",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <h2
                    className="text-3xl md:text-5xl leading-tight font-extrabold text-white"
                  >
                    {isSignup ? (
                      <>
                        Join Xpensio <span className="text-white/95">Get started</span>
                      </>
                    ) : (
                      <>
                        Welcome back to <span className="text-white/95">Xpensio</span>
                      </>
                    )}
                  </h2>

                  <p className="mt-4 text-sm text-white/75 max-w-[36ch]">
                    {isSignup
                      ? "Create your account to keep your finances organized. Set budgets, view reports, and stay in control."
                      : "Sign in to continue tracking expenses, setting budgets, and getting insights. Quick, private, and beautiful."}
                  </p>

                  <TipRotator isSignup={isSignup} />
                </div>
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
                    By continuing, you agree to Xpensio&apos;s <a href="https://xpensio.vercel.app/terms" target="_blank" rel="noreferrer" className="underline">Terms</a> and{" "}
                    <a href="https://xpensio.vercel.app/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a>.
                  </footer>
                </div>
              </div>
            </motion.div>
          </div>

{/* ═══════════════ MOBILE ONLY — PREMIUM REVAMP ═══════════════ */}
         <div className="flex md:hidden" style={{ minHeight: "calc(100vh - 64px)", flexDirection: "column" }}>
            <style>{`
              .mpa-root {
                 --mpa-bg: var(--color-background);
                --mpa-header-start: var(--color-accent);
                --mpa-header-mid: var(--color-primary);
                --mpa-header-end: var(--color-accent-teal);
                --mpa-header-blob-1: rgba(255, 255, 255, 0.14);
                --mpa-header-blob-2: rgba(255, 255, 255, 0.09);
                --mpa-card-shadow: 0 -4px 32px rgba(82, 61, 255, 0.18);
                --mpa-tab-bg: var(--color-accent-soft);
                --mpa-tab-shadow: 0 2px 10px rgba(82, 61, 255, 0.2);
                --mpa-input-bg: var(--color-surface-elevated);
                --mpa-input-border: var(--input-border);
                --mpa-border: var(--border);
                --mpa-input-focus: var(--color-accent);
                --mpa-muted: var(--color-text-secondary);
                --mpa-soft-muted: var(--color-text-secondary);
                --mpa-danger-bg: rgba(239, 68, 68, 0.12);
                --mpa-danger-border: rgba(239, 68, 68, 0.32);
                --mpa-danger-text: var(--color-danger);
                --mpa-success-bg: rgba(34, 197, 94, 0.12);
                --mpa-success-border: rgba(34, 197, 94, 0.32);
                --mpa-success-text: var(--color-success);
                display: flex;
                flex-direction: column;
                min-height: calc(100vh - 64px);
                background: var(--mpa-bg);
                color: var(--color-text-primary);
                font-family: inherit;
              }

              .mpa-header { position: relative; padding: 52px 28px 80px; background: linear-gradient(145deg, var(--mpa-header-start) 0%, var(--mpa-header-mid) 48%, var(--mpa-header-end) 100%); overflow: hidden; flex-shrink: 0; }
              .mpa-header::before { content: ''; position: absolute; width: 280px; height: 280px; border-radius: 50%; top: -90px; right: -80px; background: var(--mpa-header-blob-1); }
              .mpa-header::after { content: ''; position: absolute; width: 180px; height: 180px; border-radius: 50%; bottom: 20px; left: -60px; background: var(--mpa-header-blob-2); }

              .mpa-brand-row { display: flex; align-items: center; gap: 9px; margin-bottom: 28px; position: relative; z-index: 2; }
              .mpa-brand-dot { width: 32px; height: 32px; border-radius: 10px; background: rgba(255, 255, 255, 0.24); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
              .mpa-brand-name { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; }
              .mpa-header-title { font-size: 32px; font-weight: 800; line-height: 1.18; color: #ffffff; letter-spacing: -0.025em; margin: 0; position: relative; z-index: 2; white-space: pre-line; }
              .mpa-header-sub { margin-top: 10px; font-size: 14px; font-weight: 400; color: rgba(255, 255, 255, 0.74); line-height: 1.5; position: relative; z-index: 2; }

              .mpa-card { flex: 1; background: var(--color-surface); border-radius: 28px 28px 0 0; margin-top: -28px; padding: 32px 24px 40px; position: relative; z-index: 3; box-shadow: var(--mpa-card-shadow); overflow-y: auto; -webkit-overflow-scrolling: touch; }

              .mpa-tabs { display: flex; background: var(--mpa-tab-bg); border-radius: 14px; padding: 4px; margin-bottom: 28px; position: relative; }
              .mpa-tab-slider { position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); background: var(--color-surface); border-radius: 10px; box-shadow: var(--mpa-tab-shadow); transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1); pointer-events: none; }
              .mpa-tab-slider.right { transform: translateX(calc(100% + 4px)); }
              .mpa-tab-btn { flex: 1; padding: 11px 0; border: none; background: transparent; font-family: inherit; font-size: 14px; font-weight: 600; color: var(--mpa-soft-muted); cursor: pointer; border-radius: 10px; position: relative; z-index: 2; transition: color 0.2s; }
              .mpa-tab-btn.active { color: var(--color-accent); }
              .mpa-tab-btn:disabled { cursor: not-allowed; opacity: 0.5; }

              .mpa-field { margin-bottom: 18px; }
              .mpa-label { display: block; font-size: 12px; font-weight: 600; color: var(--mpa-muted); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px; }
              .mpa-input-wrap { position: relative; }
              .mpa-input { width: 100%; height: 54px; border-radius: 14px; border: 1.5px solid var(--mpa-input-border); background: var(--mpa-input-bg); padding: 0 46px 0 16px; font-family: inherit; font-size: 15px; font-weight: 500; color: var(--color-text-primary); box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; -webkit-appearance: none; }
              .mpa-input::placeholder { color: var(--mpa-soft-muted); font-weight: 400; }
              .mpa-input:focus { outline: none; border-color: var(--mpa-input-focus); box-shadow: 0 0 0 4px rgba(82, 61, 255, 0.18); background: var(--color-surface); }
              .mpa-input-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--mpa-soft-muted); display: flex; align-items: center; cursor: pointer; }
              .mpa-input-icon:hover { color: var(--color-accent); }

              .mpa-forgot-row { display: flex; justify-content: flex-end; margin: -8px 0 12px; }
              .mpa-forgot-btn { border: none; background: transparent; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--color-accent); cursor: pointer; padding: 0;margin-top:5px }

              .mpa-cta { width: 100%; height: 56px; border-radius: 16px; border: none; background: linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent) 100%); color: #fff; font-family: inherit; font-size: 15px; font-weight: 700; letter-spacing: 0.01em; cursor: pointer;transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; margin-top: 8px; }

              .mpa-cta:active { transform: scale(0.98); opacity: 0.92; }
              .mpa-cta:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

              .mpa-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
              .mpa-divider-line { flex: 1; height: 1px; background: var(--border); }
              .mpa-divider-text { font-size: 12px; font-weight: 500; color: var(--mpa-soft-muted);}

              .mpa-social-btn { width: 100%; height: 52px; border-radius: 14px; border: 2px solid var(--mpa-border); background: var(--mpa-input-bg); display: flex; align-items: center; justify-content: center; gap: 10px; font-family: inherit; font-size: 14px; font-weight: 600; color: var(--color-text-primary); cursor: pointer; transition: background 0.15s, border-color 0.15s; }
              .mpa-social-btn:hover { background: var(--color-surface); border-color: var(--mpa-input-focus); }
              .mpa-social-btn:disabled { opacity: 0.45; cursor: not-allowed; }

              .mpa-error { background: var(--mpa-danger-bg); border: 1px solid var(--mpa-danger-border); border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 500; color: var(--mpa-danger-text); margin-bottom: 18px; }
              .mpa-success { background: var(--mpa-success-bg); border: 1px solid var(--mpa-success-border); border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 500; color: var(--mpa-success-text); margin-bottom: 18px; }
              .mpa-terms { font-size: 11.5px; font-weight: 400; color: var(--mpa-soft-muted); text-align: center; margin-top: 20px; line-height: 1.6; }
              .mpa-terms a { color: var(--color-accent); text-decoration: none; font-weight: 500; }

              .mpa-otp-header { margin-bottom: 24px; }
              .mpa-otp-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--mpa-tab-bg); color: var(--color-accent); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 14px; }
              .mpa-otp-title { font-size: 26px; font-weight: 800; color: var(--color-text-primary); letter-spacing: -0.02em; margin: 0 0 8px; }
              .mpa-otp-sub { font-size: 14px; color: var(--mpa-muted); line-height: 1.5; }
              .mpa-otp-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin: 0 0 8px; width: 100%; min-width: 0; }
              .mpa-otp-box { width: 100%; min-width: 0; height: 58px; border-radius: 14px; border: 2px solid var(--mpa-border); background: var(--mpa-input-bg); text-align: center; font-family: inherit; font-size: 22px; font-weight: 800; color: var(--color-text-primary); transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; -webkit-appearance: none; box-sizing: border-box; }
              .mpa-otp-box:focus { outline: none; border-color: var(--mpa-input-focus); box-shadow: 0 0 0 4px rgba(82, 61, 255, 0.18); background: var(--color-surface); }
              .mpa-resend { width: 100%; border: none; background: transparent; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--color-accent); cursor: pointer; padding: 10px 0; text-align: center; }
              .mpa-resend:disabled { color: var(--mpa-soft-muted); cursor: not-allowed; }

              .mpa-nav-row { display: flex; justify-content: space-between; margin-top: 14px; }
              .mpa-nav-btn { border: none; background: transparent; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--mpa-muted); cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 3px; }
              .mpa-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

              .mpa-fp-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; }
              .mpa-fp-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
              .mpa-fp-dot.active { background: var(--color-accent); width: 22px; border-radius: 4px; }
            `}</style>

            <div className="mpa-root">
              <div className="mpa-header">
                <div className="mpa-brand-row">
                  <div className="mpa-brand-dot">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.9)"/>
                    </svg>
                  </div>
                  <span className="mpa-brand-name">Xpensio</span>
                </div>
                <h2 className="mpa-header-title">
                  {authView === "forgot_password" ? "Reset your\npassword" : isSignup ? "Get started\nfor free." : "Welcome\nback."}
                </h2>
                <p className="mpa-header-sub">
                  {authView === "forgot_password" ? "We'll get you back in quickly." : isSignup ? "Free forever. No credit card needed." : "Enter your details below to continue."}
                </p>
              </div>

              <div className="mpa-card">
                {authView !== "forgot_password" && signupStep !== "otp" && (
                  <div className="mpa-tabs">
                    <div className={`mpa-tab-slider${isSignup ? " right" : ""}`} />
                    <button className={`mpa-tab-btn${!isSignup ? " active" : ""}`} type="button" onClick={switchToSignin} disabled={isBusy}>Sign in</button>
                    <button className={`mpa-tab-btn${isSignup ? " active" : ""}`} type="button" onClick={switchToSignup} disabled={isBusy}>Sign up</button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {authView === "signin" && (
                    <motion.div key="mpa-si" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      {renderFeedback(true)}
                      <div className="mpa-field">
                        <label className="mpa-label">Email address</label>
                        <div className="mpa-input-wrap">
                          <input type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} className="mpa-input" placeholder="nicholas@example.com" disabled={isBusy} required />
                          <div className="mpa-input-icon"><Mail size={17} /></div>
                        </div>
                      </div>
                      <div className="mpa-field">
                        <label className="mpa-label">Password</label>
                        <div className="mpa-input-wrap">
                          <input type={showPassword ? "text" : "password"} value={siPassword} onChange={e => setSiPassword(e.target.value)} className="mpa-input" placeholder="••••••••" disabled={isBusy} required />
                          <div className="mpa-input-icon" onClick={() => { if (!isBusy) setShowPassword(p => !p); }}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</div>
                        </div>
                      </div>
                      <div className="mpa-forgot-row">
                        <button type="button" className="mpa-forgot-btn" onClick={switchToForgotPassword} disabled={isBusy}>Forgot password?</button>
                      </div>
                      <button type="button" className="mpa-cta" disabled={isBusy} onClick={e => handleSignin(e as unknown as React.FormEvent)}>{loading ? "Signing in…" : "Sign in"}</button>
                      <div className="mpa-divider"><div className="mpa-divider-line"/><span className="mpa-divider-text">OR</span><div className="mpa-divider-line"/></div>
                      <button type="button" className="mpa-social-btn" onClick={handleGoogle} disabled={isBusy}><GoogleIcon /><span>Sign in with Google</span></button>
                      <p className="mpa-terms">By continuing you agree to Xpensio&apos;s <a href="https://xpensio.vercel.app/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="https://xpensio.vercel.app/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
                    </motion.div>
                  )}

                  {authView === "signup" && signupStep === "form" && (
                    <motion.div key="mpa-su" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      {renderFeedback(true)}
                      <div className="mpa-field">
                        <label className="mpa-label">Full name</label>
                        <div className="mpa-input-wrap">
                          <input type="text" value={suName} onChange={e => setSuName(e.target.value)} className="mpa-input" placeholder="Nicholas Ergema" disabled={isBusy} required />
                        </div>
                      </div>
                      <div className="mpa-field">
                        <label className="mpa-label">Email address</label>
                        <div className="mpa-input-wrap">
                          <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} className="mpa-input" placeholder="nicholas@example.com" disabled={isBusy} required />
                          <div className="mpa-input-icon"><Mail size={17} /></div>
                        </div>
                      </div>
                      <div className="mpa-field">
                        <label className="mpa-label">Password</label>
                        <div className="mpa-input-wrap">
                          <input type={showNewPassword ? "text" : "password"} value={suPassword} onChange={e => setSuPassword(e.target.value)} className="mpa-input" placeholder="At least 8 characters" disabled={isBusy} required />
                          <div className="mpa-input-icon" onClick={() => { if (!isBusy) setShowNewPassword(p => !p); }}>{showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}</div>
                        </div>
                      </div>
                      <button type="button" className="mpa-cta" disabled={isBusy} onClick={e => handleSignup(e as unknown as React.FormEvent)}>{sendingOtp ? "Sending code…" : "Sign up"}</button>
                      <div className="mpa-divider"><div className="mpa-divider-line"/><span className="mpa-divider-text">OR</span><div className="mpa-divider-line"/></div>
                      <button type="button" className="mpa-social-btn" onClick={handleGoogle} disabled={isBusy}><GoogleIcon /><span>Continue with Google</span></button>
                      <p className="mpa-terms">By continuing you agree to Xpensio&apos;s <a href="https://xpensio.vercel.app/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="https://xpensio.vercel.app/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
                    </motion.div>
                  )}

                  {authView === "signup" && signupStep === "otp" && (
                    <motion.div key="mpa-su-otp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      {renderFeedback(true)}
                      <div className="mpa-otp-header">
                        <div className="mpa-otp-badge">Verify email</div>
                        <h4 className="mpa-otp-title">Enter the 6-digit code</h4>
                        <p className="mpa-otp-sub">Sent to {maskedEmail(pendingSignup?.email ?? suEmail)}</p>
                      </div>
                      <div className="mpa-otp-grid">
                        {Array.from({ length: 6 }, (_, i) => (
                          <input key={i} ref={node => setOtpInputRef(i, node)} type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} value={otpDigits[i] ?? ""} onChange={e => handleOtpInputChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} onPaste={i === 0 ? handleOtpPaste : undefined} disabled={isBusy} className="mpa-otp-box" />
                        ))}
                      </div>
                      <button type="button" className="mpa-cta" style={{ marginTop: 16 }} disabled={otpCode.length < 6 || isBusy} onClick={handleVerifySignupOtp}>{verifyingOtp ? "Verifying…" : loading ? "Creating account…" : "Verify & create account"}</button>
                      <button type="button" className="mpa-resend" disabled={resendTimer > 0 || isBusy} onClick={() => void handleSendSignupOtp()}>{sendingOtp ? "Sending…" : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}</button>
                      <div className="mpa-nav-row">
                        <button type="button" className="mpa-nav-btn" disabled={isBusy} onClick={handleBackToSignupDetails}>Edit details</button>
                        <button type="button" className="mpa-nav-btn" disabled={isBusy} onClick={handleCancelSignup}>Cancel</button>
                      </div>
                    </motion.div>
                  )}

                  {authView === "forgot_password" && (
                    <motion.div key="mpa-fp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      {renderFeedback(true)}
                      <div className="mpa-fp-steps">
                        {(["email","otp","reset"] as const).map(s => <div key={s} className={`mpa-fp-dot${forgotPasswordStep === s ? " active" : ""}`} />)}
                      </div>
                      {forgotPasswordStep === "email" && (
                        <>
                          <div className="mpa-otp-header"><h4 className="mpa-otp-title">Find your account</h4><p className="mpa-otp-sub">Enter your email and we'll send a 6-digit code.</p></div>
                          <div className="mpa-field">
                            <label className="mpa-label">Email address</label>
                            <div className="mpa-input-wrap">
                              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="mpa-input" placeholder="you@domain.com" disabled={isBusy} required />
                              <div className="mpa-input-icon"><Mail size={17} /></div>
                            </div>
                          </div>
                          <button type="button" className="mpa-cta" disabled={isBusy} onClick={() => void handleSendResetOtp()}>{sendingOtp ? "Sending…" : "Send verification code"}</button>
                        </>
                      )}
                      {forgotPasswordStep === "otp" && (
                        <>
                          <div className="mpa-otp-header"><h4 className="mpa-otp-title">Check your inbox</h4><p className="mpa-otp-sub">Code sent to {maskedEmail(resetEmail)}.</p></div>
                          <div className="mpa-otp-grid">
                            {Array.from({ length: 6 }, (_, i) => (
                              <input key={i} ref={node => setOtpInputRef(i, node)} type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} value={otpDigits[i] ?? ""} onChange={e => handleOtpInputChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} onPaste={i === 0 ? handleOtpPaste : undefined} disabled={isBusy} className="mpa-otp-box" />
                            ))}
                          </div>
                          <button type="button" className="mpa-cta" style={{ marginTop: 16 }} disabled={otpCode.length < 6 || isBusy} onClick={handleVerifyResetOtp}>{verifyingOtp ? "Verifying…" : "Verify code"}</button>
                          <button type="button" className="mpa-resend" disabled={resendTimer > 0 || isBusy} onClick={() => void handleSendResetOtp()}>{sendingOtp ? "Sending…" : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}</button>
                        </>
                      )}
                      {forgotPasswordStep === "reset" && (
                        <>
                          <div className="mpa-otp-header"><h4 className="mpa-otp-title">Set a new password</h4><p className="mpa-otp-sub">For {maskedEmail(resetEmail)}.</p></div>
                          <div className="mpa-field">
                            <label className="mpa-label">New password</label>
                            <div className="mpa-input-wrap">
                              <input type={showResetPassword ? "text" : "password"} value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} className="mpa-input" placeholder="At least 8 characters" disabled={isBusy} required />
                              <div className="mpa-input-icon" onClick={() => { if (!isBusy) setShowResetPassword(p => !p); }}>{showResetPassword ? <EyeOff size={17} /> : <Eye size={17} />}</div>
                            </div>
                          </div>
                          <button type="button" className="mpa-cta" disabled={isBusy} onClick={e => handleResetPassword(e as unknown as React.FormEvent)}>{resettingPassword ? "Resetting…" : "Reset password"}</button>
                        </>
                      )}
                      <div className="mpa-nav-row">
                        <button type="button" className="mpa-nav-btn" disabled={isBusy} onClick={() => { if (forgotPasswordStep === "otp") { setForgotPasswordStep("email"); setOtpDigits(Array(6).fill("")); return; } if (forgotPasswordStep === "reset") { setForgotPasswordStep("otp"); return; } switchToSignin(); }}>{forgotPasswordStep === "email" ? " Back to sign in" : " Go back"}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {/* ═══════════════ END MOBILE ═══════════════ */}
        </div>
      </motion.div>
      </div>
      {nativeGoogleLoading && isNativeAndroidApp() ? (
        <FullscreenLogoLoaderMotion message="Signing you in..." />
      ) : null}
    </>
  );
}

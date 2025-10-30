import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

/* Improved Xpensio LoginPage — modern UI polish, animations, accessible */
interface User {
    id: string;
    email: string;
    name: string;
}
type AuthSuccess = { ok: true; user: User };
type AuthFailure = { ok: false; status?: number; message?: string };
type AuthResponse = AuthSuccess | AuthFailure;
type Props = { onLoginSuccess?: (user: User) => void };

const fakeLoginRequest = async (
    payload: { email: string; password: string }
): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 700));
    if (payload.email === "demo@xpensio.app" && payload.password === "password") {
        return { ok: true, user: { id: "u1", email: payload.email, name: "Demo User" } };
    }
    return { ok: false, status: 401, message: "Invalid credentials" };
};

const GoogleIcon = () => (
    <svg viewBox="0 0 533.5 544.3" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.2h147.5c-6.4 34.7-25.7 64.1-54.6 83.8v69.4h88.3c51.6-47.5 80.3-117.5 80.3-197.9z" />
        <path fill="#34A853" d="M272 544.3c73.5 0 135.2-24.3 180.2-65.8l-88.3-69.4c-24.5 16.4-55.8 26-91.9 26-70.6 0-130.4-47.6-151.8-111.5H27.2v70.2c44.9 88.5 137.5 150.5 244.8 150.5z" />
        <path fill="#FBBC05" d="M120.2 323.6c-10.9-32.7-10.9-68.1 0-100.8V152.6H27.2c-43.8 87.7-43.8 191 0 278.6l93-70.2z" />
        <path fill="#EA4335" d="M272 107.7c39.9-.6 77.1 14 105.9 40.8l78.9-78.9C407 24.8 345.5 0 272 0 164.7 0 72.1 62 27.2 150.5l93 70.2C141.6 155.3 201.4 107.7 272 107.7z" />
    </svg>
);

export default function XpensioLoginPage({ onLoginSuccess }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);
        if (!email) return setError("Please enter your email.");
        if (!password) return setError("Please enter your password.");
        setLoading(true);
        try {
            const res = await fakeLoginRequest({ email, password });
            if (res.ok) {
                onLoginSuccess?.(res.user);
            } else {
                setError(res.message ?? "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onGoogleCredential = async (_credential: string) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise((r) => setTimeout(r, 700));
            const payload: AuthSuccess = { ok: true, user: { id: "g1", email: "google@xpensio.app", name: "Google User" } };
            onLoginSuccess?.(payload.user);
        } catch (err) {
            console.error(err);
            setError("Google sign-in network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--color-background)]">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36 }}
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
            >
                {/* Left: Branding panel with subtle glass + blur */}
                <motion.aside
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 }}
                    className="hidden md:flex flex-col justify-center rounded-2xl p-10"
                    style={{
                        background: "linear-gradient(180deg, rgba(9,204,206,0.06), rgba(9,204,206,0.02))",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <div className="mb-8">
                        <h2 className="text-4xl font-extrabold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                            Welcome back to
                            <span className="ml-2 text-[var(--color-accent-teal)]">Xpensio</span>
                        </h2>
                        <p className="mt-4 text-sm text-[var(--color-text-secondary)] max-w-[36ch]">
                            Log in to track your expenses, set budgets, and understand where your money goes. Fast, secure, and privacy-first.
                        </p>
                    </div>

                    <div className="mt-6 bg-[var(--benefits-card-color)] rounded-xl p-5 shadow-inner">
                        <p className="text-sm text-[var(--color-text-secondary)]">Pro tip</p>
                        <p className="mt-1 text-sm font-medium">Use the Quick Add (FAB) to log purchases in <em>seconds</em>.</p>
                    </div>
                </motion.aside>

                {/* Right: Form card */}
                <motion.main
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-2xl p-6 md:p-10 shadow-2xl"
                    style={{
                        background: "linear-gradient(180deg, var(--color-surface), color-mix(in_oklab,var(--color-surface) 94%, black))",
                        color: "var(--color-text-primary)",
                    }}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-semibold">Sign in</h3>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Use your email or sign in with Google</p>
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">
                            Need an account? <a className="underline">Sign up</a>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4" aria-describedby={error ? "login-error" : undefined}>
                        {error && (
                            <div id="login-error" role="alert" className="text-sm text-red-300 bg-red-900/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <label className="block">
                            <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                            <div className="mt-2 relative">
                                <input
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    className="w-full h-12 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)] px-4 pr-12 bg-[var(--color-surface-elevated)] placeholder:text-[var(--color-text-secondary)]"
                                    placeholder="you@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    aria-required
                                />
                                <div className="absolute right-3 top-3 rounded p-1 bg-[transparent] text-[var(--color-text-secondary)]">
                                    <Mail size={18} />
                                </div>
                            </div>
                        </label>

                        {/* Password */}
                        <label className="block">
                            <span className="text-xs text-[var(--color-text-secondary)]">Password</span>
                            <div className="mt-2 relative">
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    className="w-full h-12 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)] px-4 pr-12 bg-[var(--color-surface-elevated)] placeholder:text-[var(--color-text-secondary)]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="absolute right-3 top-3 rounded p-1 bg-[transparent] text-[var(--color-text-secondary)]">
                                    <Lock size={18} />
                                </div>
                            </div>
                        </label>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 rounded border-[var(--color-surface-elevated)]"
                                />
                                <span className="text-[var(--color-text-secondary)]">Remember me</span>
                            </label>

                            <a className="text-sm underline">Forgot password?</a>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {/* Primary CTA - full width, strong contrast, focus + disabled states */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { translateY: -2 } : undefined}
                                className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl shadow transition-shadow font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--exp-glow)] focus:ring-offset-2 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
                                style={{
                                    // Avoid 'color-mix' — use a hard fallback color so dark mode shows up correctly.
                                    background: 'linear-gradient(90deg, var(--color-accent-teal, #09ccce) 0%, #007a78 100%)',
                                    color: 'white',
                                }}
                                aria-label="Sign in"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </motion.button>

                            <div className="relative text-center text-sm text-[var(--color-text-secondary)]">or</div>

                            {/* Google CTA - match width of primary button */}
                            <button
                                type="button"
                                onClick={() => onGoogleCredential("demo-google-credential-token")}
                                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-neutral-700 bg-transparent px-4"
                                aria-label="Sign in with Google"
                            >
                                <span className="flex items-center justify-center w-6 h-6">
                                    <GoogleIcon />
                                </span>
                                <span className="text-sm">Sign in with Google</span>
                            </button>
                        </div>

                    </form>

                    <footer className="mt-6 text-xs text-[var(--color-text-secondary)]">
                        By signing in, you agree to Xpensio's <a className="underline">Terms</a> and <a className="underline">Privacy Policy</a>.
                    </footer>
                </motion.main>
            </motion.div>
        </div>
    );
}

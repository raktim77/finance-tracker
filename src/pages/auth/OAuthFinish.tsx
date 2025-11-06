// src/pages/OAuthFinish.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthFinish() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const params = new URLSearchParams(hash);
        const ott = params.get("ott");
        if (!ott) {
          navigate("/login");
          return;
        }

        const base = import.meta.env.DEV
          ? "http://localhost:4000"
          : "https://xpensio-backend-i54c.onrender.com";

        const res = await fetch(`${base}/api/auth/google/finalize`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ott }),
        });

        if (!res.ok) {
          navigate("/login?oauth=failed");
          return;
        }

        // Notify AuthProvider (and any other listeners) that OAuth finalize completed
        // so it can run its bootstrap refresh now that cookie is present.
        try {
          window.dispatchEvent(new Event("xpensio:oauth-finalized"));
        } catch (e) {
          // ignore if event dispatch fails in some environment
          console.warn("Could not dispatch xpensio:oauth-finalized", e);
        }

        // SPA navigate to dashboard — AuthProvider will perform refresh and set user
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuthFinish error:", err);
        navigate("/login?oauth=failed");
      }
    })();
  }, [navigate]);

  return <div className="p-6">Finalizing sign-in…</div>;
}

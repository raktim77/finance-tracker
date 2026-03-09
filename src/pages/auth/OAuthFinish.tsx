// src/pages/auth/OAuthFinish.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullscreenLogoLoaderMotion from "../../components/loader/FullscreenLogoLoaderMotion";

export default function OAuthFinish() {
  const navigate = useNavigate();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const params = new URLSearchParams(hash);
        const ott = params.get("ott");
        if (!ott) {
          if (mounted.current) navigate("/login", { replace: true });
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
          if (mounted.current) navigate("/login?oauth=failed", { replace: true });
          return;
        }

        // Notify AuthProvider (and any other listeners) that OAuth finalize completed
        try {
          window.dispatchEvent(new Event("xpensio:oauth-finalized"));
        } catch (e) {
          console.warn("Could not dispatch xpensio:oauth-finalized", e);
        }

        // SPA navigate to dashboard — AuthProvider will perform refresh and set user
        if (mounted.current) navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuthFinish error:", err);
        if (mounted.current) navigate("/login?oauth=failed", { replace: true });
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [navigate]);

  // show the fullscreen loader component while finalizing
  return <FullscreenLogoLoaderMotion message="Finalizing sign-in…" />;
}

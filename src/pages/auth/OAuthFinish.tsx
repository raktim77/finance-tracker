// src/pages/auth/OAuthFinish.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullscreenLogoLoaderMotion from "../../components/loader/FullscreenLogoLoaderMotion";
import { API_ORIGIN, warnIfCookieRefreshMayFail } from "../../lib/api/config";

const finalizedOtts = new Set<string>();
const PENDING_DELETE_STORAGE_KEY = "xpensio:pending_delete";

type PendingDeleteState = {
  status: "awaiting_reauth" | "ready_to_resume";
  returnTo: string;
};

function readPendingDeleteState(): PendingDeleteState | null {
  const stored = localStorage.getItem(PENDING_DELETE_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as PendingDeleteState;

    if (
      (parsed.status === "awaiting_reauth" || parsed.status === "ready_to_resume") &&
      typeof parsed.returnTo === "string" &&
      parsed.returnTo.length > 0
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse pending delete state", error);
  }

  localStorage.removeItem(PENDING_DELETE_STORAGE_KEY);
  return null;
}

export default function OAuthFinish() {
  const navigate = useNavigate();
  const mounted = useRef(true);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    (async () => {
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const params = new URLSearchParams(hash);
        const ott = params.get("ott");
        const pendingDelete = readPendingDeleteState();
        const fallbackPath = pendingDelete?.returnTo ?? "/dashboard";
        if (!ott) {
          if (mounted.current) navigate("/login", { replace: true });
          return;
        }

        if (finalizedOtts.has(ott)) {
          if (mounted.current) navigate(fallbackPath, { replace: true });
          return;
        }

        finalizedOtts.add(ott);
        warnIfCookieRefreshMayFail();

        const res = await fetch(`${API_ORIGIN}/api/auth/google/finalize`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ott }),
        });

        if (!res.ok) {
          finalizedOtts.delete(ott);
          if (mounted.current) navigate("/login?oauth=failed", { replace: true });
          return;
        }

        // Notify AuthProvider (and any other listeners) that OAuth finalize completed
        try {
          window.dispatchEvent(new Event("xpensio:oauth-finalized"));
        } catch (e) {
          console.warn("Could not dispatch xpensio:oauth-finalized", e);
        }

        if (pendingDelete?.status === "awaiting_reauth") {
          localStorage.setItem(
            PENDING_DELETE_STORAGE_KEY,
            JSON.stringify({
              ...pendingDelete,
              status: "ready_to_resume",
            } as PendingDeleteState)
          );
        }

        // SPA navigate to the intended post-auth screen — AuthProvider will perform refresh and set user
        if (mounted.current) navigate(fallbackPath, { replace: true });
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

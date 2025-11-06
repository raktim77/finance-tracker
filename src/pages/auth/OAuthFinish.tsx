import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthFinish() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const ott = params.get("ott");
    if (!ott) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.DEV ? "http://localhost:4000" : "https://xpensio-backend-i54c.onrender.com"}/api/auth/google/finalize`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ott }),
        });

        if (res.ok) {
          // cookie is now set by server; you can call your usual refresh or go to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          const body = await res.json().catch(() => null);
          console.error("finalize failed", body);
          navigate("/login?oauth=failed", { replace: true });
        }
      } catch (err) {
        console.error(err);
        navigate("/login?oauth=failed", { replace: true });
      }
    })();
  }, [navigate]);

  return <div className="p-6">Finalizing sign-in…</div>;
}

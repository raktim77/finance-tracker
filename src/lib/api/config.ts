const DEFAULT_API_ORIGIN = import.meta.env.PROD
  ? "https://xpensio-backend-i54c.onrender.com"
  : "http://192-168-29-182.nip.io:4000";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function removeApiSuffix(value: string) {
  return value.replace(/\/api\/?$/, "");
}

const configuredApiBase = import.meta.env.VITE_API_BASE;

export const API_ORIGIN = stripTrailingSlash(
  configuredApiBase
    ? removeApiSuffix(configuredApiBase)
    : DEFAULT_API_ORIGIN
);

export const API_BASE_URL = `${API_ORIGIN}/api`;

let hasWarnedAboutCookieOrigin = false;

export function warnIfCookieRefreshMayFail() {
  if (
    hasWarnedAboutCookieOrigin ||
    typeof window === "undefined" ||
    !import.meta.env.DEV
  ) {
    return;
  }

  const pageHost = window.location.hostname;
  const apiHost = new URL(API_ORIGIN).hostname;

  if (pageHost !== apiHost) {
    hasWarnedAboutCookieOrigin = true;
    console.warn(
      `[Auth] Frontend is running on ${window.location.origin} while API is ${API_ORIGIN}. Cookie-based refresh can fail unless the backend cookie and CORS settings explicitly allow this cross-origin dev setup.`
    );
  }
}

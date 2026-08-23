import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * These two values are public OAuth client configuration, not secrets. They are
 * fallbacks for static hosts that did not inject VITE_* values at build time.
 * The host can still override them with VITE_APP_ID and VITE_OAUTH_PORTAL_URL.
 */
export const DEFAULT_OAUTH_APP_ID = "PpvUjoBi8FvkvGhjMS4GbQ";
export const DEFAULT_OAUTH_PORTAL_URL = "https://manus.im";

type OAuthLoginUrlInput = {
  appId: string;
  oauthPortalUrl: string;
  redirectUri: string;
  state: string;
};

/** Build a valid OAuth URL without relying on a possibly empty environment value. */
export function createOAuthLoginUrl({
  appId,
  oauthPortalUrl,
  redirectUri,
  state,
}: OAuthLoginUrlInput) {
  const portal = (oauthPortalUrl.trim() || DEFAULT_OAUTH_PORTAL_URL).replace(
    /\/$/,
    ""
  );
  const url = new URL(`${portal}/app-auth`);
  url.searchParams.set("appId", appId.trim() || DEFAULT_OAUTH_APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url;
}

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. onClick={() => startLogin()}.
export const startLogin = () => {
  const oauthPortalUrl =
    import.meta.env.VITE_OAUTH_PORTAL_URL || DEFAULT_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID || DEFAULT_OAUTH_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  window.location.href = createOAuthLoginUrl({
    appId,
    oauthPortalUrl,
    redirectUri,
    state,
  }).toString();
};

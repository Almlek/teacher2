import { describe, expect, it } from "vitest";
import {
  DEFAULT_OAUTH_APP_ID,
  DEFAULT_OAUTH_PORTAL_URL,
  createOAuthLoginUrl,
} from "./const";

describe("createOAuthLoginUrl", () => {
  it("uses safe public defaults when static hosting omits Vite OAuth values", () => {
    const url = createOAuthLoginUrl({
      appId: "",
      oauthPortalUrl: "",
      redirectUri: "https://teatcher2.netlify.app/api/oauth/callback",
      state: "nonce-state",
    });

    expect(url.origin).toBe(DEFAULT_OAUTH_PORTAL_URL);
    expect(url.pathname).toBe("/app-auth");
    expect(url.searchParams.get("appId")).toBe(DEFAULT_OAUTH_APP_ID);
    expect(url.searchParams.get("redirectUri")).toBe(
      "https://teatcher2.netlify.app/api/oauth/callback",
    );
    expect(url.searchParams.get("state")).toBe("nonce-state");
    expect(url.searchParams.get("type")).toBe("signIn");
  });

  it("normalizes an explicitly configured portal URL", () => {
    const url = createOAuthLoginUrl({
      appId: "public-app-id",
      oauthPortalUrl: "https://login.example.com/",
      redirectUri: "https://example.com/api/oauth/callback",
      state: "state",
    });

    expect(url.toString()).toContain("https://login.example.com/app-auth?");
    expect(url.searchParams.get("appId")).toBe("public-app-id");
  });
});

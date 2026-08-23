import { beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "./db";
import type { User } from "../../drizzle/schema";
import { sdk } from "./_core/sdk";
import { createContext } from "./_core/context";

vi.mock("./db", () => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: vi.fn(),
    createSessionToken: vi.fn(),
  },
}));

const guestUser: User = {
  id: 41,
  openId: "guest_test",
  name: "معلم زائر",
  email: null,
  loginMethod: "guest",
  role: "user",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  lastSignedIn: new Date("2026-01-01T00:00:00.000Z"),
};

describe("createContext guest mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sdk.authenticateRequest).mockRejectedValue(
      new Error("no OAuth session")
    );
    vi.mocked(sdk.createSessionToken).mockResolvedValue("signed-guest-session");
    vi.mocked(db.getUserByOpenId).mockResolvedValue(guestUser);
  });

  it("creates a signed browser session when no OAuth session exists", async () => {
    const cookie = vi.fn();
    const context = await createContext({
      req: {
        protocol: "https",
        headers: {},
      } as never,
      res: { cookie } as never,
    });

    expect(context.user).toMatchObject({
      name: "معلم زائر",
      email: null,
      loginMethod: "guest",
      role: "user",
    });
    expect(db.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: expect.stringMatching(/^guest_/),
        name: "معلم زائر",
        loginMethod: "guest",
      })
    );
    expect(sdk.createSessionToken).toHaveBeenCalledWith(
      expect.stringMatching(/^guest_/),
      { name: "معلم زائر" }
    );
    expect(cookie).toHaveBeenCalledWith(
      "app_session_id",
      "signed-guest-session",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
    );
  });
});

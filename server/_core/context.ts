import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { randomUUID } from "node:crypto";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Creates a signed, browser-scoped visitor account for the free no-login mode.
 * The database still receives a normal users row, so all existing ownership
 * queries continue to isolate one teacher's data from another's browser.
 */
async function createGuestSession(
  opts: CreateExpressContextOptions
): Promise<User | null> {
  const openId = `guest_${randomUUID()}`;
  const name = "معلم زائر";

  try {
    await db.upsertUser({
      openId,
      name,
      email: null,
      loginMethod: "guest",
    });

    const user = await db.getUserByOpenId(openId);
    if (!user) return null;

    const sessionToken = await sdk.createSessionToken(openId, { name });
    opts.res.cookie(COOKIE_NAME, sessionToken, {
      ...getSessionCookieOptions(opts.req),
      maxAge: ONE_YEAR_MS,
    });

    return user;
  } catch (error) {
    console.error("[Auth] Failed to create guest session:", error);
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional. When OAuth is absent, use a signed guest
    // session so public visitors can still use the educational workspace.
    user = null;
  }

  if (!user) {
    user = await createGuestSession(opts);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

import { betterAuth } from "better-auth";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

import { components } from "./_generated/api";
import { action, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL;

// In dev the app is often reached via a host that isn't exactly `SITE_URL`
// (e.g. 127.0.0.1 instead of localhost, or a fallback port like 3001).
const isLocalDev =
  !siteUrl || siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

/**
 * Origins allowed to initiate auth requests. Better Auth otherwise defaults to
 * just `baseURL`, so any request whose `Origin` header doesn't match it exactly
 * is rejected with `INVALID_ORIGIN` ("Invalid origin"). We trust:
 *   - the canonical app origin (`SITE_URL`),
 *   - extra origins for preview/prod deploys via `TRUSTED_ORIGINS` (comma-separated),
 *   - localhost / 127.0.0.1 on any port while developing locally.
 */
const trustedOrigins = [
  siteUrl,
  ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
  ...(isLocalDev ? ["http://localhost:*", "http://127.0.0.1:*"] : []),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

// Better Auth component client (hosted install — uses the component's own schema).
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        // `repo` is needed so we can push exported projects back to GitHub.
        scope: ["repo"],
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline",
        prompt: "select_account consent",
      },
    },
    plugins: [convex({ authConfig })],
  });

export const { getAuthUser } = authComponent.clientApi();

/**
 * Kept from the original Clerk setup so existing data functions
 * (projects/files/conversations) keep working unchanged. `identity.subject`
 * is now the Better Auth user id and is used as `ownerId`.
 */
export const verifyAuth = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
};

// Current user id (== identity.subject), used by Next route handlers as ownerId.
export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
  },
});

/**
 * Server-side retrieval of the GitHub OAuth access token Better Auth stored at
 * sign-in. Replaces Clerk's `getUserOauthAccessToken`. Auto-refreshes if expired.
 */
export const getGithubAccessToken = action({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const auth = createAuth(ctx);
    const headers = await authComponent.getHeaders(ctx);

    try {
      const res = await auth.api.getAccessToken({
        body: { providerId: "github" },
        headers,
      });
      return res?.accessToken ?? null;
    } catch {
      return null;
    }
  },
});

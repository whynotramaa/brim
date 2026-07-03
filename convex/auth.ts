import { betterAuth } from "better-auth";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

import { components } from "./_generated/api";
import { action, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL;

// Better Auth component client (hosted install — uses the component's own schema).
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
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

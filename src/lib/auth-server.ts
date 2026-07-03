import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

import { api } from "../../convex/_generated/api";

export const {
  handler,
  getToken,
  isAuthenticated,
  preloadAuthQuery,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

/**
 * Returns the signed-in user's id (== Convex `identity.subject`), or null.
 * Reads the session from the ambient request cookies.
 */
export async function requireUserId(): Promise<string | null> {
  return await fetchAuthQuery(api.auth.getCurrentUserId);
}

/** Server-side GitHub OAuth access token for the current user (or null). */
export async function getGithubToken(): Promise<string | null> {
  return await fetchAuthAction(api.auth.getGithubAccessToken);
}

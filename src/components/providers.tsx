"use client";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  ConvexReactClient,
} from "convex/react";
import {
  ConvexBetterAuthProvider,
  type AuthClient,
} from "@convex-dev/better-auth/react";

import { authClient } from "@/lib/auth-client";
import { UnauthenticatedView } from "@/features/auth/components/unauthenticated-view";
import { AuthLoadingView } from "@/features/auth/components/auth-loading-view";

import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  // Cast: the provider's AuthClient type is generated against a slightly older
  // better-auth core than the installed one — structural-only skew, runtime is
  // unaffected.
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient as unknown as AuthClient}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Authenticated>{children}</Authenticated>
        <Unauthenticated>
          <UnauthenticatedView />
        </Unauthenticated>
        <AuthLoading>
          <AuthLoadingView />
        </AuthLoading>
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
};

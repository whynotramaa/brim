"use client";

import { FaGithub, FaGoogle } from "react-icons/fa";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export const UnauthenticatedView = () => {
  const signIn = (provider: "github" | "google") =>
    authClient.signIn.social({ provider, callbackURL: "/" });

  return (
    <div className="grain relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Ember horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[60%] opacity-50 [mask-image:radial-gradient(70%_100%_at_50%_100%,black,transparent)]"
      >
        <div className="absolute inset-x-[15%] bottom-0 h-full rounded-[100%] bg-brand/[0.09] blur-3xl" />
      </div>

      <header className="relative z-10 flex h-16 items-center px-6 md:px-10">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brim-transparent.png"
            alt="Brim"
            width={72}
            height={32}
          />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center text-center">
            <h1
              className="stagger-in text-balance text-[clamp(2rem,5vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.03em]"
              style={{ "--stagger-index": 0 } as React.CSSProperties}
            >
              Build at the speed of{" "}
              <em className="font-display text-brand">thought</em>
            </h1>
            <p
              className="stagger-in mt-4 max-w-[300px] text-balance text-[15px] leading-relaxed text-muted-foreground"
              style={{ "--stagger-index": 1 } as React.CSSProperties}
            >
              An AI-native IDE that writes, runs, and refines code with you.
            </p>
          </div>

          <div
            className="stagger-in mt-10 flex flex-col gap-2.5"
            style={{ "--stagger-index": 2 } as React.CSSProperties}
          >
            {(
              [
                { provider: "github", icon: <FaGithub />, label: "GitHub" },
                { provider: "google", icon: <FaGoogle />, label: "Google" },
              ] as const
            ).map(({ provider, icon, label }) => (
              <button
                key={provider}
                onClick={() => signIn(provider)}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-raised text-sm font-medium shadow-elevation-low transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-px hover:border-hairline-strong hover:shadow-elevation-medium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-110"
              >
                {icon}
                Continue with {label}
              </button>
            ))}
          </div>

          <p
            className="stagger-in mt-8 text-center text-[11px] leading-relaxed text-muted-foreground/60"
            style={{ "--stagger-index": 3 } as React.CSSProperties}
          >
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

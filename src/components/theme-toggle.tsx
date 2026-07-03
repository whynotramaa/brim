"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: resolvedTheme is only known on the client, so we
  // gate theme-dependent rendering until after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative flex size-8 items-center justify-center overflow-hidden rounded-lg",
        "text-muted-foreground transition-colors duration-200",
        "hover:bg-accent hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        "active:scale-95 transition-transform",
        className
      )}
    >
      {/* Both icons stacked; the active one rotates/scales in */}
      <SunIcon
        className={cn(
          "absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
      />
      <MoonIcon
        className={cn(
          "absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
};

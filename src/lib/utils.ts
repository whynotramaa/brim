import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip a surrounding Markdown code fence (```lang ... ```) that models often
 * wrap raw-code responses in, returning just the inner code. Leaves un-fenced
 * text untouched.
 */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```[^\n]*\n([\s\S]*?)\n?```$/)
  return fenced ? fenced[1] : trimmed
}

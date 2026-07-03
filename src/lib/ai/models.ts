import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Central AI provider layer for Brim.
 *
 * Everything routes through opencode-zen (https://opencode.ai/zen) — the default
 * provider. Swap model ids in `MODEL_IDS` below; they are the single source of
 * truth for which model each task uses.
 *
 * We deliberately keep every default on models served from zen's
 * OpenAI-compatible `/chat/completions` endpoint (DeepSeek / MiniMax / GLM /
 * Kimi / Grok / free models). That one endpoint is spoken by BOTH consumers:
 *   - the Vercel AI SDK client below (`zen(...)`), used in route handlers, and
 *   - @inngest/agent-kit's `openai()` adapter (see process-message.ts), which
 *     posts to `${ZEN_BASE_URL}/chat/completions`.
 * Picking an Anthropic/Gemini/OpenAI-Responses model would require a different
 * SDK package and base URL per model, so avoid those here unless you also wire
 * up the matching provider.
 */

// Base URL for zen's OpenAI-compatible clients (also used by agent-kit's openai adapter).
export const ZEN_BASE_URL = "https://opencode.ai/zen/v1";

// opencode-zen — default provider. OpenAI-compatible gateway.
export const zen = createOpenAICompatible({
  name: "opencode-zen",
  baseURL: ZEN_BASE_URL,
  apiKey: process.env.OPENCODE_ZEN_API_KEY ?? "",
});

/**
 * Model id per task. Must be zen `/chat/completions` models (see the note above).
 *
 * Defaults use zen's free tier (no payment method required):
 *   - `deepseek-v4-flash-free` — fast, strong at code; the default for every task.
 *     It also emits well-formed tool-call JSON, which the coding agent needs:
 *     the previous `big-pickle` model produced malformed JSON on large file
 *     writes, breaking agent-kit's tool-argument parser.
 *
 * NOTE: this is a reasoning model — it spends tokens on hidden reasoning before
 * the visible answer, which lands in a separate field (so `generateText().text`
 * still returns clean output). Because of that, never cap their output tokens too
 * low or the visible answer never arrives (see the title budget in
 * process-message.ts). Once billing is added the ideal paid upgrades are inline.
 */

export const MODEL_IDS = {
  // Inline autocomplete — latency-critical. Paid upgrade: "deepseek-v4-flash".
  suggestion: "deepseek-v4-flash-free",
  // Quick inline edits — fast, good at code. Paid upgrade: "deepseek-v4-flash".
  quickEdit: "deepseek-v4-flash-free",
  // Main coding agent with file tools — needs reliable tool-call JSON. Paid: "kimi-k2.7-code".
  agent: "deepseek-v4-flash-free",
} as const;

// Vercel AI SDK models (used by generateText/streamText in route handlers).
export const suggestionModel = () => zen(MODEL_IDS.suggestion);
export const quickEditModel = () => zen(MODEL_IDS.quickEdit);

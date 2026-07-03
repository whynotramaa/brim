import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Central AI provider layer for Brim.
 *
 * Everything routes through OpenRouter (major + open-source labs, one key) or
 * opencode-zen (OpenAI-compatible gateway). Swap model ids in `MODEL_IDS` below
 * — they are the single source of truth for which model each task uses.
 */

// Base URLs for OpenAI-compatible clients (also used by @inngest/agent-kit's openai adapter).
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const ZEN_BASE_URL = "https://opencode.ai/zen/v1";

// OpenRouter — https://openrouter.ai (default provider, 300+ models).
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

// opencode-zen — OpenAI-compatible gateway. Use for models routed through zen.
export const zen = createOpenAICompatible({
  name: "opencode-zen",
  baseURL: ZEN_BASE_URL,
  apiKey: process.env.OPENCODE_ZEN_API_KEY ?? "",
});

/**
 * Model ids per task. Edit freely. OpenRouter model ids look like
 * `vendor/model` (e.g. "anthropic/claude-sonnet-4", "meta-llama/llama-3.3-70b-instruct").
 */
export const MODEL_IDS = {
  suggestion: "nvidia/nemotron-3-ultra-550b-a55b:free",
  quickEdit: "nvidia/nemotron-3-ultra-550b-a55b:free",
  agent: "nvidia/nemotron-3-ultra-550b-a55b:free",
  title: "nvidia/nemotron-3-ultra-550b-a55b:free",
} as const;

// Vercel AI SDK models (used by generateText/streamText in route handlers).
export const suggestionModel = () => openrouter.chat(MODEL_IDS.suggestion);
export const quickEditModel = () => openrouter.chat(MODEL_IDS.quickEdit);
export const demoModel = () => openrouter.chat(MODEL_IDS.suggestion);

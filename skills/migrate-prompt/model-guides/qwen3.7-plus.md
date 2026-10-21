---
model: qwen3.7-plus
vendor: Alibaba
family: Qwen
aliases: [qwen3.7-plus-2026-05-26, qwen37-plus, qwen3-7-plus]
last_verified: 2026-10-13
status: current
---

# Qwen3.7-Plus

## Reasoning / Thinking
- Type: **hybrid, enabled by default** — the Deep Thinking documentation lists the "Qwen3.7 Plus series" (`qwen3.7-plus`, `qwen3.7-plus-2026-05-26`) under "Hybrid thinking mode, thinking mode enabled by default". Disable per request via `enable_thinking: false`.
- Parameter placement depends on SDK: in the OpenAI Python SDK, pass `enable_thinking`/`thinking_budget` via `extra_body`; in the Node.js SDK, pass them as top-level parameters.
- `thinking_budget` caps reasoning tokens; default according to API reference is the model's maximum Chain-of-Thought length, which is **262,144 tokens** according to the model page (the console diverges, showing default 4,000, range 1–32,768).
- Reasoning is returned in `reasoning_content`; `preserve_thinking` is documented for `qwen3.7-plus` and the snapshot — without this flag, prior reasoning in conversation history is ignored.
- Thinking consumes context: max input is 983,616 tokens in thinking mode versus 991,808 without; max output in both modes is 131,072.
- Anthropic-compatible Messages endpoint: `qwen3.7-plus` is listed under Qwen-Plus, but `output_config.effort` values are only documented for qwen3.8-max/-flash (and other providers) — which `effort` values qwen3.7-plus accepts is (unbelegt). On that endpoint, qwen3.7-plus falls under "Other models": `max_tokens` limits only the answer, not the thinking; the page generically points to `thinking.budget_tokens` (itself "to be deprecated").

## Prompting Style
- **No model-specific prompting page.** The only official source is Alibaba's generic Prompt Engineering Guide: framework consisting of Context, Objective, Style, Tone, Audience, Response; few-shot examples for consistent formatting; step-by-step lists for complex tasks; distinct delimiters (`###`, `===`). Everything beyond this is (unbelegt) for this model.
- Thinking runs by default — control depth via `thinking_budget` rather than CoT instructions in prompt text.
- JSON: in `json_object` mode, the word **"JSON"** (case-insensitive) must appear in the system or user message, otherwise an error occurs; not required in `json_schema` mode.
- Keep context below 256k tokens if possible: above that, pricing triples (see Output). Place stable content at the beginning so the implicit prefix cache (starting at 1,024 tokens) takes effect.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning according to model page: cost-effective Plus model of the Qwen3.7 series with stronger vision-language and agent capabilities for coding, tool use, and productivity; key feature "multi-modal interactive hybrid agent capabilities" — perceiving real scenes, reading screens and operating GUIs, generating code from visual assets, and navigating mobile apps end-to-end. Input image/text/video, output text.
  - Alibaba's recommended list features qwen3.7-plus as a Plus text model alongside qwen3.8-max and qwen3.8-flash; a Qwen3.8-Plus is not listed on official pages.
  - Enabled features: Function Calling, Prefix Completion, and Context Caching in all regions; Structured Outputs and Web Search everywhere **except within the US scope**; Batch only Beijing and Singapore.
- Weaknesses:
  - **No fine-tuning** supported.
  - Not published (unbelegt): knowledge cutoff, recommended sampling parameters, benchmarks against qwen3.8-max/-flash.
  - Pricing tier jumps threefold above 256k tokens.

## Output & Format Conventions
- Context window: 1,000,000 tokens; max input 991,808 (without thinking) or 983,616 (with); max output 131,072; max Chain-of-Thought 262,144.
- **Tiered length pricing**: up to 256k input tokens, e.g., Singapore $0.4 input / $1.6 output per 1M; from 256k to 1M, $1.2 / $4.8 — a factor of 3; the same multiplier applies to cache pricing.
- Structured Output: `json_object` (keyword requirement) or `json_schema` (the Qwen3.7-Plus series is listed among schema-capable models). Limitations: no Structured Outputs in the US scope according to the model page; the Structured Output page marks `json_schema` for Singapore as "not supported yet" (the model page marks Singapore as supported — contradictory, test prior to production); multimodal inputs automatically fall back to `json_object` without schema guarantees. Anthropic endpoint: strict `json_schema` enforcement for the Qwen3.7 series.
- Prefix Completion (Partial Mode): last assistant message with `partial: true`; documented under "Qwen-Plus (non-thinking mode): Qwen3.7-Plus series" — therefore only supported with `enable_thinking: false`.
- Context Cache: implicit cache active by default and cannot be disabled, minimum prefix 1,024 tokens; explicit cache via `cache_control: {"type": "ephemeral"}`, 5-minute TTL with reset on hit.
- IDs: `qwen3.7-plus` (according to model page functionally identical to snapshot `qwen3.7-plus-2026-05-26`). The documentation URL slug `qwen3-7-plus` is **not** the API ID. Anthropic endpoint: no `/v1/models`, configure ID manually.

## Migration Notes
- **MIGRATING TO qwen3.7-plus**:
  - **Thinking runs by default** — prompts from non-thinking models incur additional latency and reasoning costs; set `enable_thinking: false` or allocate a `thinking_budget` and remove manual CoT instructions from prompt text.
  - Assistant prefill works only with thinking disabled.
  - Large contexts over 256k cost 3x — size retrieval/chunking to keep requests below 256k.
  - From Claude prompts: do not blindly transfer `effort` levels (for qwen3.7-plus: unbelegt); `max_tokens` on the Anthropic endpoint covers only the response, not thinking tokens.
  - Strict schemas are unavailable in the US scope and when using image/video inputs.
- Specifically **from qwen3.8-max / qwen3.8-flash** (up or down):
  - Same OpenAI/DashScope parameters (`enable_thinking`, `thinking_budget`, `preserve_thinking`) and identical limits (1M / 131,072 / 262,144); differences lie in tiered length pricing, documented Partial Mode, and Anthropic `effort` values (documented for 3.8, not here).
- **MIGRATING FROM qwen3.7-plus**:
  - `enable_thinking`, `thinking_budget`, `preserve_thinking`, `reasoning_content`, `partial: true`, and `cache_control` are Model Studio specifics — remap according to the target model guide rather than adopting 1:1.
  - The "JSON" keyword requirement is a Qwen-specific trait; verify the target's schema dialect.
  - Whether the target model supports GUI/screen agent tasks should be checked in the target guide.
  - Do not confuse: `qwen-plus` is a separate, continuously offered model (functionally `qwen-plus-2025-12-01`, max output 32,768, thinking **off** by default according to Deep Thinking docs) and is **not** an alias for qwen3.7-plus.

## Sources
- https://www.alibabacloud.com/help/en/model-studio/qwen3-7-plus — Model page: IDs `qwen3.7-plus` / snapshot `qwen3.7-plus-2026-05-26` (functionally identical), positioning as cost-effective Plus model with "multi‑modal interactive hybrid agent capabilities" (GUI, screens, mobile apps, code from images), input image/text/video → text, 1M context, max input 991,808 / 983,616, output 131,072, CoT 262,144, feature matrix per region (US scope lacks Structured Outputs/Web Search, batch only Beijing/Singapore, no fine-tuning), tiered pricing ≤256k vs. 256k–1M.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Entry 2026-06-01 `qwen3.7-plus`, `qwen3.7-plus-2026-05-26`: cost-effective Plus model of Qwen3.7 series; no Qwen3.8-Plus listed.
- https://www.alibabacloud.com/help/en/model-studio/models — Recommended text models: qwen3.8-max, qwen3.7-plus, qwen3.8-flash.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — "Qwen3.7 Plus series (Hybrid thinking mode, thinking mode enabled by default)", `preserve_thinking` for qwen3.7-plus and snapshot, `thinking_budget` default = max CoT (console: 4,000), `extra_body` vs. top-level, qwen-plus "thinking mode not enabled by default".
- https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages — qwen3.7-plus listed under Qwen-Plus; `effort` values only documented for other models; "Other models": `max_tokens` does not limit thinking; strict `json_schema` enforcement for the qwen3.7 series; no `/v1/models`.
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — Qwen3.7-Plus series among `json_schema` models; Singapore "not supported yet"; multimodal inputs fall back to `json_object`; "JSON" keyword requirement.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — "Qwen-Plus (non-thinking mode): Qwen3.7-Plus series", `partial: true` on last assistant message.
- https://www.alibabacloud.com/help/en/model-studio/context-cache — qwen3.7-plus in cache lists, minimum prefix 1,024 tokens, implicit cache cannot be disabled, explicit cache 5 minutes with reset on hit.
- https://www.alibabacloud.com/help/en/model-studio/qwen-plus — Versionless ID `qwen-plus` = `qwen-plus-2025-12-01`, max output 32,768; separate model.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — Generic, non-model-specific prompt framework (Context, Objective, Style, Tone, Audience, Response), few-shot, step lists, delimiters.

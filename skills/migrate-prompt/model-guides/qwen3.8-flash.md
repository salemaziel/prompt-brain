---
model: qwen3.8-flash
vendor: Alibaba
family: Qwen
aliases: [qwen38-flash, qwen3-8-flash]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-Flash

## Reasoning / Thinking
- Type: **hybrid, enabled by default** — the Deep Thinking documentation lists the "Qwen3.8 Flash series" under "Hybrid thinking mode, thinking mode enabled by default". A request without a thinking field generates reasoning; disable per request via `enable_thinking: false`.
- Parameter placement depends on SDK: in the OpenAI Python SDK, pass `enable_thinking`/`thinking_budget` via `extra_body`; in the Node.js SDK, pass them as top-level parameters.
- `thinking_budget` caps reasoning tokens; default according to API reference is the model's maximum Chain-of-Thought length, which is **262,144 tokens** for qwen3.8-flash (the console diverges, showing default 4,000, range 1–32,768).
- Reasoning is returned in `reasoning_content`, response in `content`. `preserve_thinking` is explicitly documented for qwen3.8-flash — without this flag, prior reasoning in history is ignored.
- Thinking consumes context: max input is 983,616 tokens in thinking mode versus 991,808 without; max output in both modes is 131,072.
- Anthropic-compatible Messages endpoint: `thinking: {type: "enabled" | "disabled"}`; depth via `output_config.effort`, with default `xhigh` for qwen3.8-flash, valid values `xhigh`/`medium`/`low`; `max` and `high` are mapped to `xhigh`. `budget_tokens` is "to be deprecated". `max_tokens` on that endpoint counts response **and** Chain-of-Thought together for qwen3.8-flash. What happens on this endpoint if the `thinking` field is omitted is not specified (unbelegt).

## Prompting Style
- **No model-specific prompting page.** Officially only Alibaba's generic prompt engineering guide: framework consisting of Context, Objective, Style, Tone, Audience, Response; few-shot examples for consistent formatting; step lists for complex tasks; rare delimiters (`###`, `===`) for separation. Everything beyond this is (unbelegt) for this model.
- Because thinking runs by default, control depth via `thinking_budget` or `effort` rather than "think step by step" scaffolding in prompt text.
- JSON: in `json_object` mode, the word **"JSON"** (case-insensitive) must appear in the system or user message, otherwise an error occurs; not required in `json_schema` mode.
- Design prompts for caching: place recurring static content at the beginning and variable content at the end (implicit prefix cache starting at 1,024 tokens).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning according to release note: "the latest multimodal model from the Qwen family"; multimodal input: image, text, video; output: text; "fully compatible with both OpenAI and Anthropic API protocols" (model page mentions Claude Code and Codex as integrated developer tools).
  - Lowest-cost tier among the three recommended Qwen text models (qwen3.8-max, qwen3.7-plus, qwen3.8-flash); pricing has no tiered length penalties across the entire 1M window (reference Beijing/Global $0.113 input / $0.382 output per 1M tokens).
  - Enabled features according to model page: Function Calling, Structured Outputs, Partial Mode, and Context Cache in all regions; Web Search in Beijing and Singapore; Batch in Beijing.
  - Open foundation: official Qwen model card describes qwen3.8-flash as "the official version based on Qwen3.8-Flash-Next with more production features".
- Weaknesses:
  - **No fine-tuning** supported.
  - Web Search limited to Beijing and Singapore; Batch only in Beijing.
  - Sampling recommendations from the open weights (`temperature` 1.0 / 0.95 / 20 for thinking; 0.7 / 0.80 / 20 with `presence_penalty` 1.5 for non-thinking) apply to open weights — whether they apply to the hosted API is (unbelegt).
  - Not published (unbelegt): knowledge cutoff, pinned snapshot IDs, benchmarks against qwen3.8-max.

## Output & Format Conventions
- Context window: 1,000,000 tokens; max input 991,808 (without thinking) or 983,616 (with); max output 131,072; max Chain-of-Thought 262,144.
- Structured Output: `response_format` with `json_object` (keyword requirement) or `json_schema` (Qwen3.8-Flash series is listed under schema-capable models). Restrictions: `json_schema` for Singapore region is marked "not supported yet" on the Structured Output page (while the model page marks it supported — contradictory, test prior to production); multimodal inputs automatically fall back to `json_object` without schema guarantees. Anthropic endpoint: `output_config.format` with strict enforcement for the Qwen3.8 series.
- Partial Mode (Prefix Completion): model page marks it as supported, but the Partial Mode page does not list qwen3.8-flash and documents Qwen prefill only for non-thinking mode — prefill together with thinking is (unbelegt).
- Context Cache: implicit cache active by default and cannot be disabled, minimum prefix 1,024 tokens; explicit cache via `cache_control: {"type": "ephemeral"}`, 5-minute TTL with reset on hit.
- IDs: `qwen3.8-flash` (Model Studio lists no dated snapshots). The documentation URL slug `qwen3-8-flash` is **not** the API ID. Anthropic endpoint: only `/v1/messages`, no `/v1/models` — configure ID manually.

## Migration Notes
- **MIGRATING TO qwen3.8-flash**:
  - Major breaking change: **thinking runs unless `enable_thinking: false` is set.** Prompts from non-thinking models: recalculate latency, cost, and `max_tokens` (on the Anthropic endpoint, Chain-of-Thought shares the same `max_tokens` pool); remove explicit CoT instructions and control depth via `thinking_budget` or `effort`.
  - From Claude prompts: replace `budget_tokens` with `output_config.effort`; `high`/`max` map to `xhigh` (default, highest level); set `medium` for intermediate depth.
  - Assistant prefill: set `enable_thinking: false` or rely on Structured Outputs (strict mode available only without image/video input).
  - Multi-turn: `preserve_thinking` determines whether previous reasoning context is carried forward.
- Specifically **from qwen3.8-max** (moving down):
  - Identical parameter interface (`enable_thinking`, `thinking_budget` with the same 262,144 default, `preserve_thinking`, `effort` scale, 1M context, 131,072 output) — prompts can remain structurally unchanged; quality differences between Max and Flash are not officially quantified (unbelegt), so test on custom evaluation suites. Web search is absent outside Beijing and Singapore.
- **MIGRATING FROM qwen3.8-flash**:
  - `enable_thinking`, `thinking_budget`, `preserve_thinking`, `reasoning_content`, `partial: true`, and `cache_control` are Model Studio specific — remap to target specifications.
  - The "JSON" keyword requirement is a Qwen-specific rule; verify target schema dialect.
  - The 1M window shrinks on many targets — redesign chunking; video input is often unsupported.
  - Do not confuse: `qwen-flash` is a separate, continuously offered model (functionally `qwen-flash-2025-07-28`, max output 32,768, thinking **off** by default according to Deep Thinking docs) and is **not** an alias for qwen3.8-flash.

## Sources
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-flash — Model page: 1M context, max input 991,808 / 983,616 (thinking), max output 131,072, max CoT 262,144, input image/text/video → text, OpenAI and Anthropic compatibility, Claude Code/Codex; feature matrix per region (Function Calling, Structured Outputs, Partial Mode, Context Cache everywhere; Web Search only Beijing/Singapore; Batch only Beijing; no fine-tuning); pricing per region without tiered length; no knowledge cutoff, no snapshot IDs.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Entry 2026-08-26 `qwen3.8-flash`: "the latest multimodal model from the Qwen family", OpenAI and Anthropic compatible.
- https://www.alibabacloud.com/help/en/model-studio/models — Recommended text models: qwen3.8-max, qwen3.7-plus, qwen3.8-flash.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — "Qwen3.8 Flash series (Hybrid thinking mode, thinking mode enabled by default)", `preserve_thinking` for qwen3.8-flash, `thinking_budget` default = max CoT (console: 4,000), `extra_body` (Python) vs. top-level (Node.js), qwen-flash "thinking mode not enabled by default".
- https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages — qwen3.8-flash listed under Qwen-Flash; `output_config.effort` default xhigh, values xhigh/medium/low, max/high → xhigh; `budget_tokens` "to be deprecated"; `max_tokens` covers response and Chain-of-Thought together for qwen3.8-flash; strict `json_schema` enforcement for the qwen3.8 series; no `/v1/models`.
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — Qwen3.8-Flash series among `json_schema` models; Singapore "not supported yet"; multimodal inputs fall back to `json_object`; "JSON" keyword requirement in `json_object` mode.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — List of Partial Mode models (Qwen-Flash listed only up to Qwen3.7-Flash, each non-thinking); qwen3.8-flash not listed.
- https://www.alibabacloud.com/help/en/model-studio/context-cache — qwen3.8-flash in cache lists, minimum prefix 1,024 tokens, implicit cache cannot be disabled, explicit cache 5 minutes with reset on hit.
- https://www.alibabacloud.com/help/en/model-studio/qwen-flash — Versionless ID `qwen-flash` = `qwen-flash-2025-07-28`, max output 32,768; separate model.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — Generic, non-model-specific prompt framework (Context, Objective, Style, Tone, Audience, Response), few-shot, step lists, delimiters.
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next — Official Qwen model card of the open base model: qwen3.8-flash as "official version based on Qwen3.8-Flash-Next", native 262,144 context (YaRN up to 1M), sampling recommendations for thinking/non-thinking.

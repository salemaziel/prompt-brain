---
model: qwen3.8-max
vendor: Alibaba
family: Qwen
aliases: [qwen, qwen38-max, qwen3.8-max-0902, qwen3.8-max-2026-09-02]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-Max

## Reasoning / Thinking
- Type: **hybrid, enabled by default**. The commercial Qwen3.8 series (max, flash, 27b) is listed on the Deep Thinking documentation page under "thinking mode enabled by default" (the open-source qwen3.8-2.4t-a95b as "thinking mode only") — a request without a thinking field triggers reasoning. Disable per request via `enable_thinking: false`.
- Parameter placement is SDK-dependent: in the OpenAI Python SDK, pass `enable_thinking`/`thinking_budget` in `extra_body` (not standard OpenAI parameters); in the Node.js SDK, pass them as top-level properties; in DashScope, directly.
- `thinking_budget` caps reasoning tokens; default according to the API reference is the model's maximum Chain-of-Thought length — for qwen3.8-max **262,144 tokens** (the console diverges, showing default 4,000, range 1–32,768). If the budget is exhausted, the model interrupts thinking and responds immediately.
- Reasoning is returned in `reasoning_content`, response in `content`. In conversation history, `reasoning_content` is ignored **unless** `preserve_thinking: true` is set (documented for qwen3.8-max) — in which case previous reasoning is included in the input context and billed.
- Streaming is recommended due to latency, but not mandatory: commercial thinking models support synchronous calls according to documentation (the streaming-only restriction applies to open models like qwen3.5-122b-a10b and qwen3.5-27b).
- Thinking consumes context: max input is 983,616 tokens in thinking mode versus 991,808 without; max output remains 131,072.
- On the Anthropic-compatible Messages endpoint: `thinking: {type: "enabled" | "disabled"}`; depth is controlled by `output_config.effort`, with default `xhigh` for qwen3.8-max, valid values `xhigh`/`medium`/`low`; `max` and `high` map to `xhigh`. `budget_tokens` is marked as "to be deprecated" (docs: use `effort` for new integrations). Whether thinking runs when the `thinking` field is omitted on this endpoint is not specified (unbelegt).

## Prompting Style
- **There is no model-specific prompting page for qwen3.8-max.** The only official source is Alibaba's generic prompt engineering guide: framework consisting of Context, Objective, Style, Tone, Audience, Response; few-shot examples for consistent formatting; explicit step lists for complex tasks; rare delimiters (`###`, `===`, `>>>`) to separate sections. Everything beyond this is (unbelegt) for this model.
- Because thinking runs by default, depth control belongs in `thinking_budget` rather than prompt text — "think step by step" scaffolding merely duplicates built-in reasoning and lengthens the visible response.
- JSON: in `json_object` mode, the word **"JSON" must appear literally in the prompt** (case-insensitive); not required in `json_schema` mode. Documentation nonetheless recommends describing field names, types, and an example in prompt text.
- Design prompt order for caching: place recurring static content at the beginning, variable content at the end; for vision tasks, place stable images/videos **before** changing text questions.
- For long agentic runs, supply the full task specification upfront — Alibaba explicitly positions the 0902 snapshot for "long-horizon autonomous development" and "multi-tool orchestration and end-to-end task delivery".

## Strengths & Weaknesses (prompt-relevant)
- Architecture according to press release: 2.4 trillion parameters as **Sparse MoE with hybrid attention mechanism**, of which only 95B are active; 1M context; natively multimodal ("hundred-page documents, full television series, or 100-hour livestreams").
- Strengths:
  - Agentic coding and long-horizon tasks (internal trial: an actual software project developed autonomously over 16 days).
  - Vision/chart reasoning and document parsing (further sharpened in the 0902 snapshot).
  - Broad feature support: Function Calling, Structured Outputs, Web Search (rolling ID in Beijing and Singapore only; snapshot 0902 across all listed regions), Prefix Completion, and Context Caching enabled.
  - Multi-protocol accessibility across OpenAI-, Anthropic-, and DashScope-compatible endpoints.
- Weaknesses:
  - **No fine-tuning** supported.
  - Batch inference unavailable in multiple regions (including Singapore, Germany, US, Japan).
  - Prefix Continuation is documented only for **non-thinking mode** — prefill and thinking cannot be combined.
  - Usable context length warning: documentation notes usable length "may vary depending on different combinations of API input parameters".
  - Not published and thus (unbelegt): knowledge cutoff, recommended sampling parameters (`temperature`/`top_p`/`top_k`), behavior with out-of-range `thinking_budget`.

## Output & Format Conventions
- Context window: 1,000,000 tokens; max input 991,808 (without thinking) or 983,616 (with); max output 131,072; max Chain-of-Thought 262,144. Input text/image/video, output text only.
- Structured Output: `response_format` with `json_object` (keyword requirement) or `json_schema` with `strict: true`; the schema variant is explicitly documented for the Qwen3.8-Max series. Limitations from Structured Output page: `json_schema` is "not supported yet" for models in the Singapore region (the model page marks Structured Outputs in Singapore as supported — contradictory, test prior to production), and multimodal inputs (image, video, audio) automatically fall back to `json_object` — where the "JSON" keyword rule applies and no schema guarantees exist. On the Anthropic-compatible endpoint, equivalent functionality uses `output_config` with `format.type: "json_schema"`, with strict enforcement for the 3.8/3.7 line.
- Prefix Completion: last message with `role: "assistant"` and `partial: true`; the prefix is billed as input and must be manually concatenated with the completion by the caller.
- Context Cache: implicit cache active by default and **cannot be disabled**, minimum length **1,024 tokens**; explicit cache via `cache_control: {"type": "ephemeral"}`; 5-minute TTL resetting on hit. Documented miss triggers: expired cache block, more than 20 content blocks between `cache_control` marker and matching content, non-identical tool definitions (including tool and property order), and prefix mismatch. Documentation explicitly notes cache hit rate is not 100% even with identical context.
- Pricing has no length tiers across the entire 1M window; Singapore reference $2 input / $6 output per 1M tokens, cache hits significantly cheaper (implicit cache input $0.25, explicit cache read $0.17). Other regions vary — see model page.
- IDs: `qwen3.8-max` is the rolling alias, `qwen3.8-max-0902` (alias `qwen3.8-max-2026-09-02`, released 2026-09-02) is the pinned snapshot. The documentation URL slug `qwen3-8-max` is **not** the API ID.
- Anthropic-compatible endpoint offers only `/v1/messages`, no `/v1/models`: model ID must be configured manually in clients.

## Migration Notes
- **MIGRATING FROM qwen3.8-max**:
  - Do not copy Qwen-specific fields 1:1 — `enable_thinking`, `thinking_budget`, `preserve_thinking`, `reasoning_content`, `partial: true` prefill, and `cache_control` markers are Model Studio specifics; fields with similar names from other providers have different syntax, ranges, and defaults — remap or remove thinking controls, prefill, and caching based on the target guide.
  - If the target model lacks native thinking, reintroduce explicit reasoning/verification steps into the prompt text.
  - The 1M window will shrink on most target models — redesign chunking strategies.
  - Video input is not supported by most target models.
  - The "JSON" keyword requirement in `json_object` mode is a Qwen peculiarity and can be dropped; verify target schema dialect and `strict` semantics.
  - Cache parameters (1,024-token threshold, stable prefix first) are Qwen-specific.
- **MIGRATING TO qwen3.8-max**:
  - Primary breaking change: **thinking is enabled unless `enable_thinking: false` is set.** A prompt ported from a non-thinking model will unexpectedly reason: recalculate latency, costs, and `max_tokens`, and configure `thinking_budget`, otherwise up to 262,144 tokens of Chain-of-Thought may be budgeted.
  - Remove explicit CoT instructions from the prompt and regulate depth via `thinking_budget`.
  - In multi-turn setups, `preserve_thinking` dictates whether previous reasoning context is carried forward — default is to ignore it.
  - If a workflow uses assistant prefill, set `enable_thinking: false` or transition to Structured Outputs (strict mode requires text-only input and non-Singapore regions according to docs, otherwise only `json_object` with "JSON" in the prompt; Partial Mode is documented exclusively for non-thinking mode).
  - From the Anthropic ecosystem: `thinking.type` is supported, but replace `budget_tokens` with `output_config.effort`; Claude `effort: high`/`max` maps to `xhigh` (default, highest tier); explicitly set `medium` for intermediate depth (the `thinking_budget` control belongs on the OpenAI/DashScope route); model IDs must be configured manually (no `/v1/models`).
  - Position stable prompt prefixes first to activate implicit prefix caching; for explicit caching, tool definitions including ordering must remain strictly identical across requests.
  - For reproducibility, pin `qwen3.8-max-0902` instead of the rolling ID (note: the snapshot is capped at 150,000 TPM in Frankfurt, US, Tokyo, and Hong Kong, whereas the rolling ID has 5,000,000 TPM there).
  - No fine-tuning routes exist here, and batch inference is unavailable in several regions.
- Do not confuse: The versionless vendor ID `qwen-max` is a separate legacy model (functionally `qwen-max-2025-01-25`, 32,768 context, max output 8,192, no documented thinking mode) and **not** qwen3.8-max — a prompt using `model="qwen-max"` is not described by this guide. The same applies to `qwen-plus`/`qwen-flash` (separate hybrid models with thinking off by default according to Deep Thinking docs; refer to guides `qwen3.7-plus` and `qwen3.8-flash` for current tiers).

## Sources
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-max — Model page: ID `qwen3.8-max`, snapshot `qwen3.8-max-0902` (alias `qwen3.8-max-2026-09-02`), 1M context, max input 991,808 / 983,616 (thinking), max output 131,072, max Chain-of-Thought 262,144, input image/text/video → text, supported features (Function Calling, Structured Output, Web Search — rolling ID Beijing/Singapore only, snapshot in all regions —, Prefix Completion, Context Cache) and unsupported features (Fine-Tuning, Batch varying by region), pricing per region (no tiered length), snapshot limit 150,000 TPM outside Beijing/Singapore vs. 5,000,000 for rolling ID, note on parameter-dependent lengths; no knowledge cutoff, no prompting guidance.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — qwen3.8-max/-flash/-27b as "thinking mode enabled by default", qwen3.8-2.4t-a95b "thinking mode only", qwen-plus/qwen-flash "not enabled by default", `enable_thinking` true/false, `thinking_budget` with default = max CoT length (console: 4,000), streaming-only examples qwen3.5-122b-a10b/qwen3.5-27b, `reasoning_content` vs. `content`, `preserve_thinking` (including qwen3.8-max) and rule that history reasoning is otherwise ignored, parameter placement `extra_body` (Python) vs. top-level (Node.js), streaming recommended but not mandatory for commercial models.
- https://www.alibabagroup.com/en-US/document-2021044032125272064 — Press release August 3, 2026: 2.4 trillion parameters, Sparse MoE with hybrid attention, 95B active parameters, 1M context, 16-day autonomy benchmark, native vision details, availability via Model Studio.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Release date 2026-09-02 of snapshot `qwen3.8-max-0902` and updates (coding for engineering projects, multi-tool orchestration, vision refinements); tier positioning alongside qwen3.8-flash and qwen3.8-27b.
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — `json_object` ("JSON" keyword required in prompt) vs. `json_schema` with `strict: true`, Qwen3.8-Max series listed under schema-capable models, recommendation to describe schema in prompt text; json_schema in Singapore "not supported yet", multimodal inputs fall back to json_object.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Prefix Continuation via last assistant message with `partial: true`, billing prefix as input, manual concatenation, documented exclusively for non-thinking mode.
- https://www.alibabacloud.com/help/en/model-studio/context-cache — Implicit cache enabled by default and cannot be disabled, minimum prefix 1,024 tokens, explicit cache via `cache_control: {"type": "ephemeral"}`, 5-minute TTL with reset on hit, miss triggers (expiry, >20 content blocks distance, non-identical tool definitions including ordering, prefix mismatch) and notice of non-100% hit rate, qwen3.8-max as supported model, recommendation for stable content first / image/video before text.
- https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages — Anthropic-compatible Messages endpoint with `thinking: {type: enabled|disabled}`, `budget_tokens` as "to be deprecated" referencing `effort` for new integrations, `output_config.effort` for qwen3.8-max: default xhigh, values xhigh/medium/low, max/high → xhigh, thinking content blocks, `output_config` with `format.type: "json_schema"` and strict enforcement for 3.8/3.7, qwen3.8-max among supported models, no `/v1/models`.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — Alibaba's generic, explicitly non-model-specific prompt framework (Context, Objective, Style, Tone, Audience, Response), few-shot recommendations, step lists, delimiters `###`/`===`/`>>>`, structured extraction workflows.
- https://www.alibabacloud.com/help/en/model-studio/qwen-max — Versionless ID `qwen-max` = `qwen-max-2025-01-25`, 32,768 context, 8,192 output, no thinking in capability tables, no deprecation notice; separate model, not an alias of qwen3.8-max.

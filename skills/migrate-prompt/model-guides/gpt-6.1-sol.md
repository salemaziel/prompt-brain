---
model: gpt-6.1-sol
vendor: OpenAI
family: GPT
aliases: [sol, gpt6.1-sol, 6.1-sol, gpt-6-1-sol]
last_verified: 2026-10-13
status: current
---

# GPT-6.1 Sol

## Reasoning / Thinking
- `reasoning.effort` (Responses) or `reasoning_effort` (Chat Completions) accepts `low | medium (default) | high | xhigh | max`. **"The `none` and `minimal` reasoning efforts are not supported"** — documentation guidance for migrating users: Replace `none` with `low`; for `minimal`, start with `low` and compare results.
- `reasoning.mode`: `standard` (default) or `pro` — GPT-5.6 and GPT-6 models support both modes in the Responses API; mode and effort are independent, pro tokens are billed at standard rates.
- `reasoning.context`: `auto | current_turn | all_turns`; according to documentation, GPT-6.1 Sol supports `all_turns` (renders compatible reasoning items from prior turns). Whether `auto` falls back to `all_turns` or `current_turn` is not designated (unbelegt) — check the effective mode in the `reasoning.context` field of the response. Persisted reasoning is reused only within the same model family.
- Effort can be adjusted mid-conversation via a `configuration_update` item without rewriting the prompt prefix (and thus preserving the cache) — supported for the GPT-6 family only in standard, single-agent mode; do not combine with automatic compaction/truncation.

## Prompting Style
- OpenAI provides no dedicated Sol prompting guide; the GPT-6 prompts are explicitly "a starting point across the GPT-6 model family", but address "behavior observed with GPT-6 Astra". Any extrapolation of the following Astra idiosyncrasies to 6.1 Sol is therefore (unbelegt) and must be verified by eval.
- Building blocks from the GPT-6 guide: Grant autonomy explicitly ("bias towards action and carry the user's intended task to completion"); seek confirmations only after "a concrete, reviewable result"; state precedence over skills/files explicitly ("The user's instructions take precedence over guidelines provided in a skill."); explicitly request prose when Markdown is not desired; prohibit slop words and contrastive framing; actively manage delegation to subagents; calibrate test scope for small, reversible changes.
- Tool calling only via the Responses API — tool instructions in the prompt require a Responses request.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning: "Near-Astra performance for complex work at a lower cost" — in OpenAI's flagship group the middle tier "Balanced speed, cost, and intelligence" between GPT-6 Astra and GPT-6 Luna; used for "complex coding, computer use, and professional work".
  - Effort guidance per model selection guide: Medium for "Complex technical work and coordinated deliverables you expect to revise", Extra high for "Polished deliverables, connected visual systems, and decisions built from conflicting evidence".
  - Multi-agent (delegation to subagents within a single Responses request) available in **Beta**.
  - Ultrafast mode (`service_tier: "ultrafast"`) supported in Responses API with US and EU data residency and global processing; Fast mode also with EU data residency.
- Weaknesses:
  - No `none`/`minimal` effort supported.
  - Chat Completions does not support tool calling.
  - Note on naming: In GPT-5.6, "Sol" was the top flagship tier, whereas in GPT-6 it represents the middle tier; for maximum capability test against Astra.
  - Unsupported: Realtime, Assistants, Fine-tuning, Embeddings, image/video/audio endpoints, Moderation, legacy completions, and `predicted_outputs`.

## Output & Format Conventions
- Context window **1,050,000** tokens, max input **922,000**, max output **128,000**; knowledge cutoff **April 30, 2026**; input text + image, output text only. Single snapshot: `gpt-6.1-sol`.
- Endpoints: `v1/chat/completions` (without tools), `v1/responses`, `v1/batch`. Features: streaming, structured_outputs, function_calling, file_search, image_input, web_search, prompt_caching. Hosted tools (Responses): web_search, file_search, image_generation, code_interpreter, hosted_shell, apply_patch, skills, computer_use, mcp, tool_search.
- Pricing per 1M tokens: Input $2, Cached Input $0.10 (5% of input rate), Cache Writes $2.50 (1.25x), Output $10. Over 272K input tokens: 2x input/cache rates and 1.5x output for the entire request. Fast 2x, Batch/Flex −50%, Ultrafast 6x.
- Prompt caching: Lifetime via `prompt_cache_options.ttl` (only value `"30m"`, which is also the default) instead of `prompt_cache_retention`.
- Fix output contract via Structured Outputs or explicit format instructions; the GPT-6 guide notes a tendency toward lists, tables, and Markdown for Astra — for 6.1 Sol (unbelegt).

## Migration Notes
- **MIGRATING FROM gpt-6.1-sol**: Map effort to target guide ladder (carry over `xhigh`/`max` only if documented by target); remove or rewrite `reasoning.mode`, `reasoning.context`, `configuration_update`, multi-agent beta, and `service_tier: "ultrafast"` to target equivalents; translate `prompt_cache_options.ttl` to target's caching syntax; audit autonomy/precedence/prose components inherited from GPT-6 guide for continued need; shrink the 1.05M context budget to the target window.
- **MIGRATING TO gpt-6.1-sol**: (1) Set `model` to `gpt-6.1-sol`. (2) Preserve previous effective effort where supported; `none` → `low`, `minimal` → start with `low` and compare. (3) Switch tool calling to Responses API. (4) If effort is not `none`: Remove `temperature`, `top_p`, `top_logprobs`, in Chat Completions also `logprobs`, in Responses remove `message.output_text.logprobs` from `include`. (5) Coming from GPT-5.5 or earlier: `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`. (6) Implement changing effort via `configuration_update` instead of request parameters. (7) If approval pauses occur, add autonomy building blocks from GPT-6 guide.
- Specifically **from gpt-6-sol**: OpenAI explicitly requires: "review the migration guidance before switching to GPT-6.1 Sol" — primarily because 6-Sol supports `none` and Chat Completions function calling (only with `none`), whereas 6.1 Sol supports neither.
- Specifically **from gpt-5.6-sol**: The alias name "Sol" remains, but the tier drops from flagship to mid-tier; test against gpt-6-astra for maximum quality instead.

## Sources
- https://developers.openai.com/api/docs/models/gpt-6.1-sol — Model page: id/snapshot `gpt-6.1-sol`, "Near-Astra performance for complex work at a lower cost", effort levels including "The `none` and `minimal` reasoning efforts are not supported", Chat Completions without tool calling, Ultrafast/data residency, 1,050,000 / 922,000 / 128,000, cutoff April 30, 2026, pricing and multipliers, endpoints, features, tools, `predicted_outputs` not supported.
- https://developers.openai.com/api/docs/guides/latest-model — "Using GPT-6" (rolling page, as of 2026-10-13): Tier labels, GPT-6.1 Sol section, prompting best practices "across the GPT-6 model family" with Astra reference, limitations, migration quickstart (effort, tool calling, unsupported parameters, data residency, `configuration_update`, `prompt_cache_options.ttl`), note regarding `gpt-6-sol`.
- https://developers.openai.com/api/docs/guides/reasoning — Effort table, 6.1 Sol default `medium` and missing `none`/`minimal`, `reasoning.mode` for GPT-5.6/GPT-6, `reasoning.context` with `all_turns` support for GPT-6.1 Sol, `configuration_update` (standard, single-agent mode).
- https://developers.openai.com/api/docs/guides/model-selection — "When to consider GPT-6.1 Sol" and effort recommendations Medium / Extra high.
- https://developers.openai.com/api/docs/guides/responses-multi-agent — Multi-agent in beta "with GPT-6.1 Sol and all GPT-5.6 models".
- https://developers.openai.com/api/docs/guides/ultrafast-mode — Ultrafast for GPT-6 Astra and GPT-6.1 Sol, `service_tier: "ultrafast"`.
- https://developers.openai.com/api/docs/guides/prompt-caching — `prompt_cache_options.ttl` (`"30m"`) for GPT-5.6 and later, cache read 0.05x for GPT-6.1 Sol, cache write 1.25x.
- https://developers.openai.com/api/docs/changelog — 2026-09-29: Release `gpt-6.1-sol` "for complex coding and professional work at a lower cost than GPT-6 Astra", multi-agent beta; 2026-10-08: Ultrafast for GPT-6.1 Sol (Responses API, global as well as US/EU residency).

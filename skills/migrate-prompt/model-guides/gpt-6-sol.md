---
model: gpt-6-sol
vendor: OpenAI
family: GPT
aliases: [gpt6-sol, 6-sol]
last_verified: 2026-10-13
status: current
---

# GPT-6 Sol

## Reasoning / Thinking
- `reasoning.effort` (Responses) or `reasoning_effort` (Chat Completions) accepts `none | low | medium (default) | high | xhigh | max`. Unlike GPT-6 Astra and GPT-6.1 Sol, GPT-6 Sol explicitly supports `none`; `minimal` is not listed.
- `reasoning.mode`: `standard` (default) or `pro` — according to the reasoning guide, for GPT-5.6 and GPT-6 models in the Responses API; mode and effort are independent, pro tokens are billed at standard rates.
- `reasoning.context`: The documentation lists `all_turns` support only for GPT-5.6 models and GPT-6.1 Sol; it is not designated for GPT-6 Sol (unbelegt) — verify the effective mode in the `reasoning.context` field of the response instead of assuming reasoning persistence across turns.
- Mid-conversation effort changes via `configuration_update` are documented for "the GPT-6 model family in standard, single-agent mode"; that GPT-6 Sol falls under this is not named explicitly in the documentation (unbelegt).

## Prompting Style
- No dedicated prompting guide for GPT-6 Sol. The GPT-6 prompts serve as "a starting point across the GPT-6 model family", but address "behavior observed with GPT-6 Astra" — any transfer to GPT-6 Sol is (unbelegt) and must be verified by eval.
- Building blocks from that guide, if supported by evals: Explicitly grant autonomy ("bias towards action"), seek approvals only after a "concrete, reviewable result", state user instruction precedence over skills explicitly, request prose explicitly, cap test scope on small changes.
- Tie tool instructions to the API path: Built-in tools and function calling run via the Responses API; in Chat Completions only function calling and only with `reasoning_effort: "none"`.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning: "Built to power complex coding and agentic workflows". OpenAI names `gpt-6-sol` as recommended replacement for deprecated `gpt-5.1` and `gpt-5.3-codex` (shutdown April 1, 2027) — a typical migration destination from older coding setups.
  - Advantage over 6.1 Sol: Supports `none` effort as a low-latency path and supports function calling in Chat Completions (only with `none`).
- Weaknesses:
  - In the model catalog under "More models", not in the flagship group; the model page points to "GPT-6.1 Sol … for the newer Sol model".
  - On Sep 25, 2026, OpenAI fixed an image encoding bug that degraded image comprehension; repeat evals with image input run prior to that date. Multi-agent beta and Ultrafast mode are listed on retrieved pages only for other models (including GPT-6.1 Sol), not for GPT-6 Sol.
  - Unsupported: Realtime, Assistants, Fine-tuning, Embeddings, image/video/audio endpoints, Moderation, legacy completions.

## Output & Format Conventions
- Context window **1,050,000** tokens, max input **922,000**, max output **128,000**; knowledge cutoff **April 20, 2026**; input text + image, output text only. Single snapshot: `gpt-6-sol`.
- Endpoints: `v1/chat/completions`, `v1/responses`, `v1/batch`. Features: streaming, structured_outputs, function_calling, file_search, image_input, web_search, prompt_caching. Hosted tools (Responses): web_search, file_search, image_generation, code_interpreter, hosted_shell, apply_patch, skills, computer_use, mcp, tool_search.
- Pricing per 1M tokens: Input $2, Cached Input $0.20 (10% of input rate), Cache Writes $2.50 (1.25x), Output $10. Over 272K input tokens: 2x input/cache rates and 1.5x output for the entire request. Batch/Flex 50%, Fast 2x; EU data residency with Standard, Fast, Flex, and Batch (+10% regional surcharge).
- Prompt caching follows the rules for "GPT-5.6 and later": Lifetime via `prompt_cache_options.ttl` (`"30m"`), not `prompt_cache_retention`.

## Migration Notes
- **MIGRATING FROM gpt-6-sol**: Map effort to target guide ladder; carry over `none` only if target documents it. Chat Completions function calling with `none` breaks on targets requiring tools via Responses. Rewrite `reasoning.mode`, `configuration_update`, and `prompt_cache_options.ttl` to target equivalents; shrink context budget from 1.05M tokens to target window.
- Specifically **to gpt-6.1-sol** (according to OpenAI "the newer Sol model"): OpenAI requires: "review the migration guidance before switching to GPT-6.1 Sol". (1) `none` → `low`, `minimal` → start with `low`. (2) Move function calling from Chat Completions to the Responses API. (3) If effort ≠ `none`, remove `temperature`, `top_p`, `top_logprobs` (in Chat Completions also `logprobs`). (4) Newly usable: Multi-agent beta, Ultrafast mode, `all_turns`.
- **MIGRATING TO gpt-6-sol** (e.g. from `gpt-5.1` or `gpt-5.3-codex`, official replacement): Set effort explicitly (default `medium`); move tool workloads with reasoning to Responses API; according to GPT-6 migration guide, remove sampling parameters and logprobs if effort ≠ `none`; coming from GPT-5.5 or earlier, `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`.

## Sources
- https://developers.openai.com/api/docs/models/gpt-6-sol — Model page: id/snapshot `gpt-6-sol`, "Built to power complex coding and agentic workflows", pointer to GPT-6.1 Sol as "newer Sol model", effort levels `none`…`max` (default `medium`), function calling in Chat Completions only with `none`, EU residency, 1,050,000 / 922,000 / 128,000, cutoff April 20, 2026, pricing and multipliers, endpoints, features, tools.
- https://developers.openai.com/api/docs/guides/latest-model — "Using GPT-6" (rolling page, as of 2026-10-13): Note "If you already use `gpt-6-sol`, review the migration guidance before switching to GPT-6.1 Sol", limitations (`none` supported on GPT-6 Sol), migration quickstart (tool calling, unsupported parameters, `prompt_cache_options.ttl`), prompting best practices with Astra reference.
- https://developers.openai.com/api/docs/guides/reasoning — Default `medium` for GPT-6 Sol, `reasoning.mode` for GPT-5.6/GPT-6, `all_turns` support listed only for GPT-5.6 and GPT-6.1 Sol, `configuration_update` for GPT-6 family.
- https://developers.openai.com/api/docs/deprecations — Entry 2026-10-01: `gpt-5.3-codex` and `gpt-5.1` → `gpt-6-sol`, shutdown April 1, 2027.
- https://developers.openai.com/api/docs/models/all — Classification under "More models"; flagship group = GPT-6 Astra / GPT-6.1 Sol / GPT-6 Luna.
- https://developers.openai.com/api/docs/guides/prompt-caching — `prompt_cache_options.ttl` (`"30m"`) for GPT-5.6 and later.
- https://developers.openai.com/api/docs/guides/responses-multi-agent — Multi-agent beta listed for GPT-6.1 Sol and GPT-5.6, not for GPT-6 Sol.
- https://developers.openai.com/api/docs/changelog — 2026-09-22: Release of `gpt-6-sol` (Responses and Chat Completions, $2 / $0.20 / $10); 2026-09-25: Fix for image encoding bug in GPT-6 Sol/Luna.

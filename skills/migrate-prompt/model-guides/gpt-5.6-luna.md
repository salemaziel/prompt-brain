---
model: gpt-5.6-luna
vendor: OpenAI
family: GPT
aliases: [gpt5.6-luna, 5.6-luna]
last_verified: 2026-10-13
status: current
---

# GPT-5.6 Luna

## Reasoning / Thinking
- `reasoning.effort`: `none | low | medium (default) | high | xhigh | max` — same ladder as `gpt-5.6-sol` and `gpt-5.6-terra`. Family guideline: `medium` as balanced starting point, `low` for latency-critical workloads; whoever uses `none` preserves it as a latency baseline and additionally tests `low` if reasoning or tool usage helps.
- `reasoning.mode` = `standard` (default) | `pro`, independent of effort; "Pro mode works with any GPT-5.6 model" (Responses API only). The documentation explicitly advises `standard` for "routine, latency-sensitive, or high-volume work" — fits Luna's usage profile.
- `reasoning.context` = `auto | current_turn | all_turns`, default for GPT-5.6 models is `all_turns`. Reasoning items are reusable between `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`, but not across family boundaries (e.g. GPT-5.5).
- `configuration_update` (mid-conversation effort changes) is documented only for the GPT-6 family, not for GPT-5.6.

## Prompting Style
- There is no dedicated Luna guidance; according to OpenAI, the GPT-5.6 prompt rules apply to the family (family transfer; benchmark metrics originate from internal coding agent evals, not from Luna-specific tests).
- **Lean prompts**: State each instruction once, prune redundant examples and tool descriptions, expose only relevant tools. OpenAI reports ~10–15% better eval scores with 41–66% fewer tokens, calling the ranges "directional".
- Length: GPT-5.6 is more concise by default than GPT-5.5; re-evaluate blanket "Be concise" instructions. Control default level of detail via `text.verbosity`, specify in the prompt what a concise response must contain ("Keep all required facts, decisions, caveats, and next steps.").
- Set autonomy and approval boundaries in a single place: Allow safe local actions explicitly by name, require confirmation for "external writes, destructive actions, purchases, or a material expansion of scope".

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning: "designed for cost-sensitive, high-volume workloads" and "roughly corresponds to the nano model tier used in earlier GPT-5 families"; in the reasoning guide the choice "for the lowest cost and latency".
  - Family strengths: According to documentation, GPT-5.6 reaches flagship-level performance with fewer output tokens and infers user intent and scope of work better from context. To what degree this holds for the nano tier is not proven (unbelegt).
  - Full Responses tool set (`web_search`, `file_search`, `image_generation`, `code_interpreter`, `hosted_shell`, `apply_patch`, `skills`, `computer_use`, `mcp`, `tool_search`); images in native resolution via `original`/`auto` detail.
- Weaknesses: Smallest tier of the family — if a quality gap is measured, use `gpt-5.6-terra` (mini tier) or `gpt-5.6-sol`. Family-wide safeguards can pause generation mid-stream for multiple seconds or block requests; configure timeouts and streaming accordingly.

## Output & Format Conventions
- Context window 1,050,000 tokens, max 922,000 input and 128,000 output; knowledge cutoff Feb 16, 2026. Input text + image, output text. Sole snapshot `gpt-5.6-luna`, no dated snapshot.
- Pricing per 1M tokens: Input $0.20, Cached Input $0.02, Output $1.20; cache writes 1.25x input rate; over 272K input tokens 2x input and 1.5x output for the entire request.
- Endpoints: Chat Completions, Responses, Batch. Features: Streaming, Structured Outputs, Function Calling, File Search, image input, Web Search, Prompt Caching. OpenAI recommends the Responses API for reasoning, tool calling, and multi-turn.
- `text.verbosity` = `low | medium | high` as default detail level.
- Prompt caching (GPT-5.6 and newer): `prompt_cache_options.ttl` (`"30m"`) instead of `prompt_cache_retention`, explicit breakpoints possible, minimum prefix 1,024 visible input tokens.

## Migration Notes
- **MIGRATING FROM gpt-5.6-luna**: Remove `reasoning.effort`/`mode`/`context` and `text.verbosity` if target does not support them; explicitly formulate brevity and format rules that `text.verbosity` handled; adjust context assumptions (1.05M) down to target. Persisted reasoning items do not migrate to other families.
- **MIGRATING TO gpt-5.6-luna**: Official replacement for `gpt-4.1-nano`/`gpt-4.1-nano-2025-04-14` (shutdown October 23, 2026) and `gpt-5-nano-2025-08-07` (shutdown December 11, 2026). (1) Effort baseline: From GPT-5.5/5.4 keep current effort and test one level lower; that this also applies to Nano sources is an extrapolation (unbelegt). (2) Slim down prompt, prune few-shot stacks and long tool descriptions. (3) Re-test blanket brevity lines, set default via `text.verbosity`. (4) Use Responses API for reasoning and tools. (5) `prompt_cache_retention` → `prompt_cache_options.ttl`. (6) Add autonomy/approval boundaries.
- Context / Family position: Upward migration within the family via `gpt-5.6-terra` (replacement for `gpt-5-mini`) to `gpt-5.6-sol`. OpenAI now lists GPT-6 Luna (`gpt-6-luna`) as Featured Model for cost-sensitive volume workloads; there is no official successor mapping for `gpt-5.6-luna` (as of 2026-10-13).

## Sources
- https://developers.openai.com/api/docs/models/gpt-5.6-luna — Model page: id `gpt-5.6-luna`, positioning ("cost-sensitive, high-volume workloads", nano tier), effort `none`–`max` (default `medium`), 1,050,000/922,000/128,000 tokens, cutoff Feb 16, 2026, pricing $0.20/$0.02/$1.20, 272K rule, cache writes, endpoints, features, tools, sole snapshot.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.6-sol — GPT-5.6 section (applies to family): Lean prompts (10–15% / 41–66%), brevity rules, `text.verbosity`, autonomy boundaries, effort migration, `reasoning.context` default `all_turns`, Pro mode "works with any GPT-5.6 model" and standard for volume work, safeguard pauses, family strengths.
- https://developers.openai.com/api/docs/guides/reasoning — `gpt-5.6-luna` "for the lowest cost and latency", `reasoning.mode` standard/pro for GPT-5.6, default `medium`, reasoning reuse between sol/terra/luna, `configuration_update` only GPT-6.
- https://developers.openai.com/api/docs/guides/prompt-caching — Differences starting with GPT-5.6: `prompt_cache_options.ttl` `"30m"`, breakpoints, 1.25x cache writes, 1,024-token minimum prefix.
- https://developers.openai.com/api/docs/deprecations — `gpt-4.1-nano`/`gpt-4.1-nano-2025-04-14` → `gpt-5.6-luna` (Oct 23, 2026), `gpt-5-nano-2025-08-07` → `gpt-5.6-luna` (Dec 11, 2026), `gpt-5-mini-2025-08-07` → `gpt-5.6-terra`; no entry for `gpt-5.6-luna` itself.
- https://developers.openai.com/api/docs/models.md — Catalog: GPT-6 Luna as Featured Model, GPT-5.6 Luna still in complete catalog.
- https://developers.openai.com/api/docs/changelog.md — Release of GPT-5.6 family on July 9, 2026 with "GPT-5.6 Luna for efficient, high-volume workloads".

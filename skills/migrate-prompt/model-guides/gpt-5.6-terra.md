---
model: gpt-5.6-terra
vendor: OpenAI
family: GPT
aliases: [terra, gpt5.6-terra, 5.6-terra]
last_verified: 2026-10-13
status: current
---

# GPT-5.6 Terra

## Reasoning / Thinking
- Same reasoning controls as `gpt-5.6-sol`: `reasoning.effort` with `none | low | medium (default) | high | xhigh | max`. Semantics: `none` for latency-critical tasks with no reasoning benefit, `low` = "Efficient reasoning with a modest latency increase", `medium` as balanced default, `high` for "Hard reasoning, complex debugging, deep planning", `xhigh` for "Deep research, asynchronous workflows and agentic tasks", `max` for "Maximum reasoning for your most complex tasks".
- Additionally `reasoning.mode` = `standard` (default) / `pro` — independent of `effort`; `pro` performs more model work at higher latency/cost. And `reasoning.context` = `auto | current_turn | all_turns`, defaulting to `all_turns` on GPT-5.6 models. At this price/performance tier: Start at `medium` (default), test `low` for latency-critical paths, compare `effort` independently of other parameters.

## Prompting Style
- **Lean prompts**: Remove repeated instructions and redundant examples, state each instruction exactly once, expose only relevant tools with concise, precise descriptions. OpenAI measures ~10–15% better eval scores with 41–66% fewer tokens (sample from internal coding agent evals; the documentation explicitly characterizes these ranges as "directional"). Retain examples only when they encode product requirements or close a measured gap.
- Set response length deliberately: `text.verbosity` (`low`/`medium`/`high`) as baseline, layer task-specific requirements in the prompt above it. When asking for brevity, specify what must survive: "Keep all required facts, decisions, caveats, and next steps. Trim introductions, repetition, generic reassurance, and optional background first."
- Explicitly define autonomy and approval boundaries: Explicitly permit safe local actions (reading files, editing code, running tests) by name, require confirmation for "external writes, destructive actions, purchases, or a material expansion of scope".
- For tool/routing tasks, specify permitted tools and exact output schemas. Programmatic Tool Calling fits bounded aggregation/filtering workflows with heavy intermediate data reduction — poor fit when a single call suffices, intermediate results are small, or every result alters the next decision.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Positioned as "designed for workloads that balance intelligence and cost", roughly corresponds to the mini tier of earlier GPT-5 families; in the model guide "strong performance at a lower price". Inherits family characteristics: frontier quality with fewer output tokens, stronger frontend/design judgment, better inference of the actual user objective and desired scope of work from context.
- Weaknesses: Not the frontier model — quality-critical or most challenging reasoning work belongs on `gpt-5.6-sol` (optionally `reasoning.mode: "pro"`) or, since 2026-09-03, `gpt-6-astra`, which OpenAI names in the reasoning guide as the starting point for most reasoning workloads. Realtime, Assistants, Fine-tuning, Embeddings, as well as audio/image/video endpoints are not supported. Family-wide safeguard behavior applies here too: Generation can pause mid-stream for multiple seconds while classifiers check the output synchronously — configure timeouts/streaming accordingly.

## Output & Format Conventions
- Context window 1,050,000 tokens, max input 922,000, max output 128,000 tokens; knowledge cutoff Feb 16, 2026. Input: text + image, output: text.
- Endpoints: Chat Completions, Responses, Batch. Features: Streaming, Structured Outputs, Function Calling, File Search, image input, Web Search, Prompt Caching. Only one snapshot listed: `gpt-5.6-terra` — no dated snapshot ID, no documented short alias.
- Control detail level via `text.verbosity` = `low | medium | high`, not via prose instructions in the prompt.
- Pricing per 1M tokens: Input $2, Cached Input $0.20, Output $12; rule: "Prompts with >272K input tokens are priced at 2x input and 1.5x output for the full request" (cache writes 1.25x input rate).

## Migration Notes
- **MIGRATING FROM gpt-5.6-terra**: Remove `reasoning.effort`, `reasoning.mode`, `reasoning.context`, and `text.verbosity` (OpenAI parameter names; map effort to target guide ladder, carry over `reasoning.mode`/`reasoning.context`/`text.verbosity` only if documented by target); re-insert explicit brevity/format instructions and examples required by target into prompt; shrink assumptions about 1.05M context and 128K output.
- **MIGRATING TO gpt-5.6-terra**: Official successor to `gpt-5-mini-2025-08-07` (shutdown Dec 11, 2026). (1) Preserve existing effort as baseline and test one level below ("preserve your current reasoning effort as the baseline, then compare one level lower" — doc states this for migrations from GPT-5.5/5.4; for gpt-5-mini as a starting point this is an extrapolation). (2) Heavily slim down prompt: Delete duplicate instructions, stacked few-shot examples, and bloated tool descriptions from the gpt-5-mini era. (3) Remove or re-test blanket brevity lines — GPT-5.6 is naturally more concise than GPT-5.5, "Be concise" can now over-prune; set default via `text.verbosity`, use prompt only for task-specific length/format rules. (4) Prefer Responses API for reasoning, tool calling, and multi-turn; `reasoning.context` to `auto`/`all_turns`, `current_turn` when prior reasoning is irrelevant. (5) Add autonomy/approval boundaries explicitly. (6) Escalate to `gpt-5.6-sol` (optionally `reasoning.mode: "pro"`) or, since 2026-09-03, `gpt-6-astra` (which OpenAI names as starting point for most reasoning workloads) only upon measured quality gap; Terra is the balance tier ("strong performance at a lower price"), `gpt-5.6-luna` the cheaper nano tier below "for efficient, high-volume workloads".

## Sources
- https://developers.openai.com/api/docs/models/gpt-5.6-terra — Model ID, mini-tier positioning, 1,050,000 context / 922,000 input / 128,000 output, cutoff Feb 16, 2026, effort levels, endpoints/features, pricing $2/$0.20/$12 and the >272K token rule.
- https://developers.openai.com/api/docs/models/all — Lists gpt-5.6-terra under "More models" ("GPT-5.6 model that balances intelligence and cost"), not deprecated; flagship group there is GPT-6 (Astra / 6.1 Sol / Luna).
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.6-sol — Shared GPT-5.6 prompt rules: Lean prompts (10–15% / 41–66%), autonomy boundaries, `text.verbosity`, Programmatic Tool Calling, `reasoning.context`; section "Using GPT-5.6": "strong performance at a lower price", migration baseline (one effort level lower), trimming/verbosity guidelines, family strengths, safeguard pauses.
- https://developers.openai.com/api/docs/guides/reasoning — Effort levels and their semantics, `reasoning.mode` standard/pro, `reasoning.context` default `all_turns` for GPT-5.6; "Start with `gpt-6-astra` for most reasoning workloads", Terra/Luna as lower-cost options.
- https://developers.openai.com/api/docs/changelog — Sep 3, 2026: "Released GPT-6 Astra".
- https://developers.openai.com/api/docs/deprecations — Replacement mapping gpt-5-mini-2025-08-07 → gpt-5.6-terra, shutdown Dec 11, 2026.
- https://developers.openai.com/api/docs/models/gpt-5.6-luna — Cheaper nano tier ($0.20/$0.02/$1.20) for positioning on the tier ladder.

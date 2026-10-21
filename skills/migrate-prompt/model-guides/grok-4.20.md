---
model: grok-4.20
vendor: xAI
family: Grok
aliases: [grok-4.20-0309-reasoning, grok-4.20-reasoning, grok-4.20-reasoning-latest, grok-4.20-0309, grok-4.20-beta-latest]
last_verified: 2026-10-13
status: current
---

# Grok 4.20

This guide covers the vendor alias `grok-4.20`, which points to `grok-4.20-0309-reasoning` according to xAI. Sister slugs `grok-4.20-0309-non-reasoning` and `grok-4.20-multi-agent-0309` are distinct models with their own behavior; they are described below, but are not tracked as aliases of this guide.

## Reasoning / Thinking
- Type: **Reasoning by model choice, not by parameter.** `grok-4.20-0309-reasoning` carries "Reasoning: Yes", `grok-4.20-0309-non-reasoning` "Reasoning: No" — to enable or disable thinking, switch the slug.
- Effort levels for the reasoning variant: not listed on the model page, and the summary table of the reasoning page does not mention them. Whether `reasoning_effort` takes effect, is ignored, or triggers an error is unbelegt; default depth is likewise (unbelegt).
- **Multi-Agent variant** (`grok-4.20-multi-agent`): here `reasoning.effort` controls "how many agents collaborate on a request rather than reasoning depth" — `low`/`medium` = 4 agents, `high`/`xhigh` = 16 (in the xAI SDK `agent_count` 4 or 16). The same effort number therefore means something completely different than on grok-4.5/4.6/4.7.
- Class rule: "`presencePenalty`, `frequencyPenalty`, and `stop` cannot be used with reasoning models. Requests that include them return an error." Reasoning tokens are billed.
- Readable reasoning summaries are described by xAI only for grok-4.7; for grok-4.20 no readable thinking process is documented (unbelegt).

## Prompting Style
- Vendor description: "a high-performance model with industry-leading speed and agentic tool calling capabilities. It combines the lowest hallucination rate on the market with strict prompt adherence" (vendor claim, not independently verified). It follows: precise, literal instructions; ambiguity is unlikely to be resolved "charitably" (inference, unbelegt).
- xAI does not publish model-specific prompting guidance for grok-4.20; any stylistic assertion beyond this is unbelegt.
- Control tool selection via tool descriptions ("helps the model decide when to use it"); parallel tool calling is enabled, `parallel_tool_calls: false` disables it. Enforce format via Structured Outputs (`response_format.type: "json_schema"`, "guaranteed to match your schema", limits 2,048 / 256 / 64).
- Multi-Agent: xAI recommends setting the scope explicitly (which dimensions should be covered), requesting structured output such as comparison tables, specifying desired sources/perspectives, splitting deep topics across follow-up turns, and providing context such as constraints or target market.
- Caching is automatic from the beginning of the `messages` array; keep static prefix stable, set `x-grok-conv-id` or `prompt_cache_key`.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: **1M tokens context**; economical ($1.25 input / $2.50 output per 1M below 200k, identical for all three variants); **Batch API supported** with 20% discount; a non-reasoning variant for latency-critical paths; Multi-Agent for deep research using server-side tools (`web_search`, `x_search`, `code_execution`, `collections_search`, Remote MCP).
- Weaknesses: No documented effort control; no published knowledge cutoff and no output limit; `logprobs`/`top_logprobs` are silently ignored for "`grok-4.20` and newer"; only us-east-1/us-west-2. The model overview recommends grok-4.7 for code and chat, not 4.20.
  - Multi-Agent additionally: **Beta** ("The API interface and behavior may change"); "Client-side tools (function calling) and custom tools are not currently supported"; `max_tokens` not supported; runs **not** via Chat Completions, only xAI SDK / Responses API; only tool calls and the final answer of the leader agent are returned; all agent tokens and tool calls are billed; rate limit only 9 rps / 2.5M tpm.

## Output & Format Conventions
- 1,000,000 tokens context (all three variants); input text + image, output text only. Max output and cutoff: not published (unbelegt).
- Reasoning variant: function calling yes, Structured Outputs yes, reasoning yes; Non-Reasoning: reasoning no; Batch API with 20% discount on all.
- Prices per 1M tokens: input $1.25 (<200k) / $2.50 (≥200k), cached input $0.20 / $0.40, output $2.50 / $5.00; starting at 200k prompt tokens, the higher rate applies to all tokens of the request. Rate limits: 37 rps / 10M tpm (Reasoning and Non-Reasoning), 9 rps / 2.5M tpm (Multi-Agent). Regions us-east-1, us-west-2.
- Vendor aliases of the reasoning variant include `grok-4.20`, `grok-4.20-reasoning`, `grok-4.20-reasoning-latest`, `grok-4.20-0309`, `grok-4.20-beta-latest` as well as various `…-beta`/`…-experimental-beta` strings; Non-Reasoning includes `grok-4.20-non-reasoning`; Multi-Agent includes `grok-4.20-multi-agent`, `grok-4.20-multi-agent-latest`.
- Date: Release notes report "Grok 4.20 and Grok 4.20 Multi-agent are live" only under "March" without a year — no reliable release date (unbelegt).

## Migration Notes
- **MIGRATING TO grok-4.20**: (1) Choose variant deliberately — reasoning slug for thinking tasks, `grok-4.20-0309-non-reasoning` as a zero-thinking path (instead of a `none` effort). (2) Do not plan on `reasoning_effort` as a depth lever; effect is unbelegt. (3) Remove `presence_penalty`/`frequency_penalty`/`stop` on reasoning and multi-agent slugs; enforce format control via Structured Outputs. (4) Replace logic relying on `logprobs` — the fields are silently ignored. (5) Formulate instructions literally and completely (strict prompt adherence according to vendor). (6) Batch jobs are possible here and 20% cheaper.
- **Switching to Multi-Agent**: Client functions and custom tools are unavailable — only server-side tools/Remote MCP; migrate Chat Completions integrations to Responses API; omit `max_tokens`; move length control into the prompt or schema; recalculate costs due to parallel agents.
- **MIGRATING FROM grok-4.20** (to grok-4.7/4.6/4.5): Context halves to 500k — check chunking; prices rise to $2/$6 per 1M (<200k); reasoning cannot be disabled there and effort defaults to `high`, so a non-reasoning path must be shifted to `low`. **Reinterpret effort semantics**: a `high`/`xhigh` carried over from Multi-Agent meant 16 agents; there it denotes reasoning depth. To grok-4.3: same price tier and 1M context, but with `reasoning_effort: none` as a zero-thinking path instead of a distinct slug.

## Sources
- https://docs.x.ai/developers/models/grok-4.20-0309-reasoning — Model page: id `grok-4.20-0309-reasoning`, alias list including `grok-4.20`, description ("industry-leading speed and agentic tool calling", "lowest hallucination rate on the market with strict prompt adherence"), 1M context, text+image→text, function calling/Structured Outputs/reasoning yes without effort options, batch with 20% discount, pricing table, 37 rps / 10M tpm, us-east-1/us-west-2.
- https://docs.x.ai/developers/models/grok-4.20-0309-non-reasoning — "Reasoning: No", separate alias list, same prices, limits, and regions.
- https://docs.x.ai/developers/models/grok-4.20-multi-agent-0309 — Multi-Agent model page: aliases, 1M context, batch with 20% discount, 9 rps / 2.5M tpm.
- https://docs.x.ai/developers/model-capabilities/text/multi-agent — Beta note, `agent_count` 4/16 or effort mapping, supported server tools, no client functions/custom tools, no `max_tokens`, not via Chat Completions, only leader response, billing of all agents, prompting recommendations.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Summary table (grok-4.20-multi-agent: "Controls agent count (4 or 16)"), class rule `presencePenalty`/`frequencyPenalty`/`stop`, default `high` and non-disableable reasoning on grok-4.5/4.6/4.7, summaries only for grok-4.7.
- https://docs.x.ai/developers/models — Pricing roster, `logprobs` note for "`grok-4.20` and newer", recommendation of grok-4.7 for code and chat, comparative values grok-4.3/4.5/4.6/4.7.
- https://docs.x.ai/developers/release-notes — "Grok 4.20 and Grok 4.20 Multi-agent are live" under "March" without year.
- https://docs.x.ai/developers/migration/may-15-retirement — Verifies `none` reasoning effort on grok-4.3 as zero-thinking target.
- https://docs.x.ai/developers/tools/function-calling — Tool descriptions, `parallel_tool_calls: false`.
- https://docs.x.ai/developers/model-capabilities/text/structured-outputs — Schema guarantee and limits.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching — Automatic caching, `x-grok-conv-id`, `prompt_cache_key`.

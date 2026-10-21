---
model: grok-4.7
vendor: xAI
family: Grok
aliases: [grok, grok4.7, grok-4.7-latest, grok47, grok-4-7, grok4-7]
last_verified: 2026-10-13
status: current
---

# Grok 4.7

## Reasoning / Thinking
- Type: **always on**. The reasoning page lists grok-4.7 with "Reasoning cannot be disabled" — there is no `none` (unlike grok-4.3).
- Ladder: `reasoning.effort` (Responses API) or `reasoning_effort` = `low | medium | high | xhigh`, **default `high`**. `xhigh` controls genuine thinking depth here ("available on `grok-4.6` and later") — "Maximum reasoning depth, with correspondingly higher latency".
- Usage according to docs: `low` for latency-sensitive agentic loops and simple tool calling, `medium` for data analysis and long-context reasoning, `high` for hard math/multi-step problems, `xhigh` for the hardest cases. The Best Practices Guide requires setting effort **explicitly on every request** rather than letting a default decide.
- **Readable reasoning summaries** are documented by xAI exclusively for grok-4.7 (streaming deltas `response.reasoning_summary_text.delta`).
- **Encrypted reasoning is always returned:** On the Responses API, grok-4.7 returns `reasoning.encrypted_content` on every response, even without `include`. Reasoning items must be returned unchanged in the `input` of the next request, otherwise the model loses its thinking process and the prompt cache breaks. Chat Completions has no field for this.
- Reasoning tokens are billed (`reasoning_tokens` in `usage`). `presencePenalty`, `frequencyPenalty`, and `stop` return an error.

## Prompting Style
- Positioning: "frontier model for coding, agentic tasks, and knowledge work"; xAI recommends grok-4.7 for code **and** chat ("It is the most capable model we've built").
- Best Practices Guide: **State task, constraints, and output format directly** ("state the task, constraints, and output format directly"); specifically retune a prompt tuned for another model for Grok.
- **Use the Responses API** — Chat Completions is considered "deprecated" according to the guide and discards encrypted reasoning across turns.
- Sampling: Explicitly set `temperature` 0.7 and `top_p` 0.95 and rarely deviate from them ("Grok models don't respond well to other sampling settings").
- Caching: Set `prompt_cache_key` (Responses API) or `x-grok-conv-id` (Chat Completions) per conversation; place static content (system prompt, few-shots, reference documents) at the front, only appending the conversation rather than reordering it. For long agent loops, additionally use Context Compaction.
- According to the announcement, the model works longer on difficult tasks and checks its work more carefully — planning and self-verification can be left to the model. There is no model-specific prompting guide beyond the Best Practices Guide; further style rules are (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: According to the announcement, a new, larger base model than grok-4.6 with a longer RL run on tasks spanning many hours; better at verifying its own work and handling long context; superior document and presentation creation; same price and speed as grok-4.6; full flagship throughput ceiling (150 rps / 50M tpm).
  - Vendor-reported benchmarks (not independently verified, `xhigh`): CursorBench 4.0 46.3%, Terminal-Bench 4.0 37.6%, Harvey Legal Agent Benchmark 19.6%; DeepSWE v1.1 71.0% (at `high`).
- Weaknesses: Reasoning cannot be disabled (fixed latency/cost floor); **price cliff at 200k prompt tokens** — above that, double rates apply to all tokens of the request; **Batch API "Not supported"**; no EU region.

## Output & Format Conventions
- 500,000 tokens context; input text + image, output text only; "No text output limit". Knowledge cutoff May 2026.
- `max_output_tokens` limits only the visible response (reasoning does not count), default 128,000; treat responses with `status: "incomplete"` as truncated. Do not control length via `stop`.
- Function calling, Structured Outputs, and reasoning: yes for each; server-side tools Web Search, X Search, and Code Execution. Real-time knowledge only with enabled search tools.
- Prices per 1M tokens: input $2.00 (<200k) / $4.00 (≥200k), cached input $0.50 / $1.00, output $6.00 / $12.00. Rate limits 150 rps / 50M tpm. Regions us-east-1, us-west-2, us-central-1; additionally US regional endpoint `https://us.api.x.ai/v1` (+10% token price).
- "Grok 4.7 Fast" (same model, double price) exists only in Cursor and Grok Build, **not** on the public xAI API.
- The model page lists no aliases; `grok-4.7-latest` is repo convenience following xAI's `<modelname>-latest` convention, the bare ID `grok-4.7` is the verified address.

## Migration Notes
- **MIGRATING FROM grok-4.6** to grok-4.7: Price, context (500k), effort ladder, and default (`high`) are identical — effort values can be carried over. New: reasoning summaries during streaming and always-supplied `reasoning.encrypted_content` on the Responses API; clients managing history themselves must return reasoning items unchanged. Knowledge cutoff is newly documented (May 2026).
- **MIGRATING FROM grok-4.3 / grok-4.5** to grok-4.7: (1) `none` does not exist — raise zero-thinking paths to `low` and recalculate latency/cost. (2) Default jumps from `low` to `high` when coming from grok-4.3; without explicit `reasoning_effort`, cost and latency increase. (3) Coming from grok-4.3: context shrinks from 1M to 500k, eu-west-1 and 20% batch discount are eliminated, price increases to $2.00/$6.00. (4) Coming from grok-4.5: `xhigh` is now genuinely executed — remeasure costs.
- **MIGRATING TO grok-4.7** (general): Remove `presence_penalty`/`frequency_penalty`/`stop`, enforcing format control via Structured Outputs; transition to the Responses API; set `temperature` 0.7 / `top_p` 0.95; add `prompt_cache_key`; keep prompts below the 200k cliff.
- **MIGRATING FROM grok-4.7**: Rebuild pipelines that evaluate summaries or automatically returned encrypted reasoning; on grok-4.5, `xhigh` is silently treated as `high` according to the reasoning page.

## Sources
- https://docs.x.ai/developers/models/grok-4.7 — Model page: id `grok-4.7` without aliases, 500k context, text+image→text, function calling/Structured Outputs/reasoning yes, efforts `low`/`medium`/`high`/`xhigh` with default `high`, Batch API "Not supported", pricing table with 200k tier, 150 rps / 50M tpm, regions us-east-1/us-west-2/us-central-1.
- https://docs.x.ai/developers/grok-4-7 — Developer page: knowledge cutoff May 2026, "No text output limit", tools, `prompt_cache_key` recommendation, Context Compaction, always-returned `reasoning.encrypted_content`, Fast variant only in Cursor/Grok Build, US endpoint +10%, default model of Grok Build.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — "Reasoning cannot be disabled", effort table and usage recommendations, `xhigh` starting from grok-4.6, summaries only for grok-4.7, "Always returned for grok-4.7", error on `presencePenalty`/`frequencyPenalty`/`stop`, billing of reasoning tokens.
- https://docs.x.ai/developers/model-capabilities/text/best-practices — Responses API instead of (deprecated) Chat Completions, returning reasoning items, set effort explicitly, `temperature` 0.7 / `top_p` 0.95, `max_output_tokens` default 128,000, state task/constraints/format directly, caching rules.
- https://docs.x.ai/developers/models — Recommendation "Code: Grok 4.7 / Chat: Grok 4.7", cutoff May 2026, pricing table, alias convention, real-time knowledge only with search tools.
- https://docs.x.ai/developers/release-notes — Entry "Grok 4.7" (September): availability as `grok-4.7`, prices, effort ladder, always-returned encrypted reasoning, US endpoint, Fast variant.
- https://x.ai/news/grok-4-7 — Announcement of 09/21/2026: larger base model, longer RL run, better self-verification and long-context handling, same price/speed as grok-4.6, vendor benchmarks.
- https://docs.x.ai/developers/advanced-api-usage/regions — US endpoint `https://us.api.x.ai/v1` serves grok-4.7 and grok-4.6, token price +10%.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — `x-grok-conv-id` or `prompt_cache_key` route a conversation to the same server.
- https://docs.x.ai/developers/advanced-api-usage/context-compaction — Context Compaction for long agent loops.

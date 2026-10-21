---
model: grok-4.6
vendor: xAI
family: Grok
aliases: [grok4.6, grok-4.6-latest, grok46, grok-4-6, grok4-6]
last_verified: 2026-10-13
status: current
---

# Grok 4.6

## Reasoning / Thinking
- Type: **always on**. For `grok-4.6` (as for `grok-4.5` and `grok-4.7`), documentation states "Reasoning cannot be disabled" — there is no `none`. Depth is controlled exclusively via `reasoning_effort` (Chat Completions) or `reasoning.effort` (Responses API): `low | medium | high | xhigh`, default `high`.
- Usage according to docs: `low` for latency-sensitive agentic loops and simple tool calling, `medium` for complex data analysis and long-context reasoning, `high` for very hard problems/math/multi-step logic, `xhigh` for the hardest cases when quality takes precedence over response time.
- According to the reasoning page, `xhigh` controls genuine thinking depth on "`grok-4.6` and later" (thus also `grok-4.7`); `grok-4.20-multi-agent` uses it to regulate agent count. On `grok-4.5`, `xhigh` is **silently treated as `high`** according to the reasoning page — no error, just less thinking time.
- Reasoning tokens are billed and appear as `reasoning_tokens` in `usage`. Readable reasoning summaries are documented by xAI only for `grok-4.7`; for grok-4.6 (unbelegt). Encrypted carry-over is supported via `include: ["reasoning.encrypted_content"]` (Responses API); returning raw chain-of-thought is nowhere documented (unbelegt).
- `presence_penalty`, `frequency_penalty`, and `stop` **cannot be combined** with reasoning models — requests including them return an error (docs write them as `presencePenalty`/`frequencyPenalty`).

## Prompting Style
- Positioning: "frontier model for coding, agentic tasks, and knowledge work"; xAI now recommends `grok-4.7` for code and chat. Trained on agentic RL tasks (knowledge work, general coding, kernel optimization, web development, CAD).
- Prompt at the **goal level** instead of step-by-step: according to the announcement, strong at turning a rough product idea into a first working version (researching an unfamiliar domain, structuring the app, building core features) and performing "more self-testing and verification" across long task chains — leave planning and self-testing to the model.
- **Caching is the central operational prompt rule**: set `prompt_cache_key` (Responses API) or header `x-grok-conv-id` (Chat Completions) so requests from a conversation route to the same server — cache entries reside per server. Keep prompt prefix stable.
- For long agent loops, additionally plan for Context Compaction; server-side search tools (Web Search, X Search) must be explicitly enabled, otherwise the model has no real-time knowledge.
- Beyond these documented points, xAI publishes no prompt engineering guide for this model — further style rules are (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Agentic coding and knowledge work at the top tier; Artificial Analysis Intelligence Index 61 (Fable 5 Max leads the announcement's table with 62); best listed score on Harvey LAB (15.8%); research in unfamiliar domains; very high throughput (150 rps / 50 million tokens per minute).
- Weaknesses: Reasoning cannot be disabled → fixed latency and cost floor; on the announcement's coding benchmarks, other models lead (DeepSWE v1.1 65.9% vs. GPT-5.6 Sol Max 73%; FrontierCode v1.1 61.3% vs. Fable 5 Max 63.6%; CursorBench v3.2 69.9% vs. Fable 5 Max 70.5%).
  - **200k price cliff**: as soon as the prompt reaches 200k tokens, the entire request (input *and* output) is billed at double the rate — consciously keep context below the threshold.
  - 500k context is only half of `grok-4.3` (1M); regions `us-east-1`, `us-west-2`, and `us-central-1` — no EU region (which `grok-4.3` has with `eu-west-1`); additionally US regional endpoint `https://us.api.x.ai/v1` (+10% token price).

## Output & Format Conventions
- Context window 500,000 tokens; input text + image, output text only. Knowledge cutoff: no longer published (unbelegt). Function calling, Structured Outputs, and reasoning: yes for each.
- Batch API: "Not supported" according to the model page — batch jobs must run via real-time requests.
- Output limit: release notes explicitly mention "no text output limit"; a max output number is not published. Therefore limit length via max tokens — `stop` sequences are not permitted here.
- Prices per 1M tokens: input $2.00 (<200k) / $4.00 (≥200k), cached input $0.50 / $1.00, output $6.00 / $12.00. The announcement additionally mentions a "fast variant" at double the price.
- Alias convention: `<modelname>` = newest stable version, `<modelname>-latest` = newest version, `<modelname>-<date>` = pinned release. For Grok 4.6, neither a dated ID nor a `-latest` alias is published; the bare ID `grok-4.6` is the only verified address. `grok-4.6-latest` is in the registry only as a convenience alias following xAI's `<modelname>-latest` convention.

## Migration Notes
- **MIGRATING FROM grok-4.6**: Target `grok-4.7` (recommended by xAI for code and chat) has identical price, context, and the same effort ladder with default `high`; there, `reasoning.encrypted_content` is returned on every response in the Responses API — return reasoning items unchanged in the next `input`. Target `grok-4.5`: remove `xhigh`, which is demoted to `high` without comment according to the reasoning page. Target `grok-4.3` brings 1M context, a `none` effort level (default there `low`), `eu-west-1`, and batch discount, but steps down from the frontier coding tier. In all cases check `prompt_cache_key`/`x-grok-conv-id` assumptions.
- **MIGRATING TO grok-4.6** (typically from `grok-4`, which has been retired since 05/15/2026 12:00 PT and is rerouted to `grok-4.3` with `low` effort): (1) Set `reasoning_effort` explicitly instead of budgeting thinking depth indirectly via max_tokens — default is `high`, `low` for tool loops, `xhigh` for maximum depth. (2) Structure long prompts around the 200k price cliff even though 500k context is available. (3) Add `prompt_cache_key` or `x-grok-conv-id` as well as Context Compaction for long agent runs — new operational surface. (4) Encrypted reasoning can be carried over turns via `include`. (5) Keep `presence_penalty`/`frequency_penalty`/`stop` out of requests. (6) Web/X-Search are server-side tools that must still be explicitly requested. (7) Dismantle overly prescriptive step lists; use goal + constraints instead, the model verifies itself. (8) Reschedule batch jobs — the Batch API does not serve grok-4.6.

## Sources
- https://docs.x.ai/developers/models/grok-4.6 — Model spec: ID `grok-4.6` without aliases, blurb "frontier model for coding, agentic tasks, and knowledge work", 500k context, text+image→text, function calling/Structured Outputs/reasoning, efforts `low`–`xhigh` with default `high`, Batch API "Not supported", complete pricing table including 200k cliff, 150 rps / 50M tpm, regions us-east-1, us-west-2, and us-central-1.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Reasoning contract: cannot be disabled, effort table for grok-4.7/4.6/4.5/4.20-multi-agent, `xhigh` "available on `grok-4.6` and later" and silently demoted to `high` on grok-4.5, summaries only for grok-4.7, `include: ["reasoning.encrypted_content"]`, `reasoning_tokens`, unsupported sampling parameters (`presencePenalty`/`frequencyPenalty`/`stop`).
- https://docs.x.ai/developers/release-notes — Entry "Grok 4.6" (August): 500k context, "no text output limit", prices, effort low/medium/high (default)/xhigh.
- https://docs.x.ai/developers/models — Recommendation "Code: Grok 4.7 / Chat: Grok 4.7", cutoff only stated for Grok 4.7, alias convention (`-latest`, `-<date>`), real-time knowledge only with activated search tools.
- https://docs.x.ai/developers/advanced-api-usage/regions — US endpoint `https://us.api.x.ai/v1` serves grok-4.7 and grok-4.6, token price +10%.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — `x-grok-conv-id` (Chat Completions) or `prompt_cache_key` (Responses API) route a conversation to the same server; cache entries reside per server.
- https://docs.x.ai/developers/advanced-api-usage/context-compaction — Context Compaction for long agent loops.
- https://docs.x.ai/developers/models/grok-4.7 — Comparison model: identical price, 500k context, same effort ladder with default `high`.
- https://docs.x.ai/developers/models/grok-4.3 — Comparison model: `grok-4.3` with 1M context, region `eu-west-1`, Batch API supported, default effort `low`.
- https://x.ai/news/grok-4-6 — Announcement (08/12/2026): agentic RL training (knowledge work, coding, kernel optimization, web, CAD), "more self-testing and verification" across long task chains, product idea→first version, Intelligence Index 61 (Fable 5 Max 62), Harvey LAB 15.8% (best score), DeepSWE/FrontierCode/CursorBench comparison, $2/$6 per 1M tokens plus "fast variant" at double the price.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement table: `grok-4-0709` retired on 05/15/2026 12:00 PT, routing to `grok-4.3` with `low` effort; `none` effort verified for other redirect targets.

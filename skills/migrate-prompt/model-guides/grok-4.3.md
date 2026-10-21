---
model: grok-4.3
vendor: xAI
family: Grok
aliases: [grok4.3, grok-4.3-latest, grok43, grok-4-3, grok4-3]
last_verified: 2026-10-13
status: current
---

# Grok 4.3

## Reasoning / Thinking
- Type: **can be disabled** — grok-4.3 is also operated with `reasoning_effort: none` according to the retirement table (for grok-4.5/4.6/4.7, reasoning cannot be disabled according to documentation). Model page: supports `none | low | medium | high | xhigh`, **default `low`**. The retirement page lists only four levels (none/low/medium/high), the reasoning page does not list grok-4.3 and mentions `xhigh` only starting from grok-4.6 — `xhigh` on 4.3 is therefore (unbelegt) as a genuine depth level. According to the retirement page, non-reasoning slugs land on `none` and reasoning slugs on `low`, with an explicit note to set `medium`/`high` explicitly if the task requires deeper thinking.
- **Always set `reasoning_effort` explicitly.** Default according to model page and Best Practices Guide is `low` ("`grok-4.3` defaults to `"low"` and also accepts `"none"`"); the guide requires setting effort on every request so no default determines the result.
- Class rules for xAI reasoning models (reasoning tokens are billed as part of total usage and reported as `reasoning_tokens` in usage; `presence_penalty`/`frequency_penalty`/`stop` result in an error) likely apply, but are not verified for grok-4.3 (unbelegt) — the reasoning page does not list the model. Treat defensively: omit these parameters.

## Prompting Style
- xAI describes the model as a "Fast, reliable model with strong tool calling and instruction following capabilities" — prompt in a **directive and schema-driven** manner: clear instructions, clean tool/function definitions, no defensive re-explaining of tools in prose.
- Because effort can drop down to `none` and the default is only `low`, the prompt carries more burden: formulate the goal, output shape, and tool policy explicitly instead of letting the model plan its path autonomously.
- Enforce format via **Structured Outputs** instead of free-text conventions (Structured Outputs are explicitly verified for grok-4.3) — do not rely on `stop` sequences, which are generally excluded for xAI reasoning models (for grok-4.3 itself unbelegt).
- Positioning according to official listing: for code and chat, xAI recommends grok-4.7, not 4.3. grok-4.3 is the economical long-context throughput workhorse, not the reasoning frontier.
- A dedicated developer/prompting page for grok-4.3 does not exist; any stylistic assertion beyond this is unbelegt.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: **1M tokens context** (twice as much as grok-4.6/4.7 with 500k); cheaper than grok-4.6/4.7 ($1.25/$2.50 vs. $2.00/$6.00 per 1M — input −37.5%, output −58%); additional **EU region** (eu-west-1 alongside us-east-1/us-west-2) for data residency requirements; additional 20% discount via the Batch API; xAI's own migration target for deprecated Grok 4 Fast and legacy text slugs (`grok-4-fast-*`, `grok-4-1-fast-*`, `grok-3`) including `grok-4-0709` (exception: `grok-code-fast-1` → `grok-build-0.1`); documented effort path down to `none`, which grok-4.5/4.6/4.7 do not have.
- Weaknesses: Significantly lower throughput ceiling than the flagship (37 requests/s, 10M tokens/min vs. 150 rps / 50M tpm); **price cliff at 200k prompt tokens** — above that, double rates apply to ALL tokens of the request; not the model recommended for code/chat; no published knowledge cutoff, no published output limit, no official benchmark data.

## Output & Format Conventions
- 1,000,000 tokens context window; input text + image, output text only. Max output tokens: not published (unbelegt). Knowledge cutoff: not published (unbelegt).
- Function calling: yes; Structured Outputs: yes; Reasoning: yes.
- Prices per 1M tokens: input $1.25 (<200k prompt) / $2.50 (≥200k), cached input $0.20 / $0.40, output $2.50 / $5.00; Batch API additional −20%. Rate limits: 37 requests/s, 10M tokens/min; regions us-east-1, eu-west-1, us-west-2.
- Documented alias `grok-4.3-latest` alongside the bare id `grok-4.3`.

## Migration Notes
- **MIGRATING FROM grok-4.3** (to grok-4.7, recommended by xAI for code and chat, or to grok-4.6): `none` is eliminated — reasoning cannot be disabled there, so any zero-thinking fast path must be re-tuned to `low` and re-budgeted; the default jumps from `low` (4.3) to `high` (4.5/4.6/4.7) — without explicit `reasoning_effort`, latency and reasoning costs increase; `xhigh` represents genuine reasoning depth starting from grok-4.6 according to the reasoning page; context shrinks from 1M to 500k; the EU region is eliminated (grok-4.6/4.7: us-east-1/us-west-2/us-central-1); the Batch API (discounted 20% on 4.3) is not supported by grok-4.6 or grok-4.7 — reschedule batch jobs; add `prompt_cache_key` or `x-grok-conv-id` for cache hit routing; price increases to $2.00/$6.00. On grok-4.7, `reasoning.encrypted_content` is returned on every response in the Responses API — send reasoning items back unchanged.
- **MIGRATING TO grok-4.3** (from grok-4): this is xAI's **own prescribed target** — `grok-4-0709` was retired on May 15, 2026, at 12:00 PT and has since been automatically routed to `grok-4.3` with `low` effort; an untouched grok-4 integration therefore runs quietly on shallower reasoning. Specifically: (1) Explicitly set `reasoning_effort` — grok-4 did not recognize this parameter and always reasoned deeply (unbelegt — grok-4 model pages are offline); if quality depended on this, set `medium`/`high` instead of accepting the routed `low`. (2) `none` is newly available — transition latency-critical extraction/classification prompts to a single-pass call. (3) Context grows from 256k (according to Grok 4 announcement) to 1M, but the 200k price cliff doubles input **and** output of the entire request — chunking strategy matters more than pure capacity. (4) Costs decrease significantly, throughput is capped at 37 rps / 10M tpm — rebalance concurrency assumptions. (5) eu-west-1 becomes available. (6) Continue to omit `presence_penalty`/`frequency_penalty`/`stop`, enforcing format control via Structured Outputs.

## Sources
- https://docs.x.ai/developers/models/grok-4.3 — Model page: id `grok-4.3` + alias `grok-4.3-latest`, blurb "Fast, reliable model with strong tool calling and instruction following capabilities", 1M context, text+image→text, function calling/Structured Outputs/reasoning yes, efforts `none`/`low`/`medium`/`high`/`xhigh` with default `low`, full pricing table including cached input and 20% batch discount, 37 rps / 10M tpm, regions us-east-1/eu-west-1/us-west-2; without prompting guidance, cutoff, or output limit.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement table: `grok-4-0709`, `grok-4-fast-reasoning`, `grok-4-1-fast-reasoning` → `grok-4.3` with `low`; `grok-3` and non-reasoning slugs → `grok-4.3` with `none`; retirement May 15, 2026 12:00 PT; "4 reasoning effort levels (none, low, medium, and high)"; note on explicit `medium`/`high`; $1.25/$2.50 per 1M.
- https://docs.x.ai/developers/model-capabilities/text/best-practices — Explicitly set effort on every request; "`grok-4.3` defaults to `"low"` and also accepts `"none"`".
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Class rules for reasoning models (`reasoning_tokens` billing; `presencePenalty`/`frequencyPenalty`/`stop` → error); enumerates only `grok-4.7`, `grok-4.6` (each `low`/`medium`/`high` default/`xhigh`), `grok-4.5`, and `grok-4.20-multi-agent`, **not** grok-4.3; `xhigh` "available on `grok-4.6` and later" — therefore the class rules, `xhigh` semantics, and statement "Reasoning cannot be disabled" are not transferable to grok-4.3.
- https://docs.x.ai/developers/models — Alias convention (`<modelname>`, `<modelname>-latest`, `<modelname>-<date>`) and current roster with grok-4.3 (1M) alongside grok-4.7/4.6/4.5 (500k), but without grok-4/grok-4-0709; grok-4.7 recommended for code and chat; cutoff only listed for grok-4.7.
- https://docs.x.ai/developers/models/grok-4.6 — Comparative values for migration direction: 500k context, $2.00/$6.00 per 1M (≥200k: $4.00/$12.00), 150 rps / 50M tpm, regions us-east-1/us-west-2/us-central-1 (no eu-west-1), Batch API "Not supported".
- https://docs.x.ai/developers/models/grok-4.7 — Comparative values of the recommended flagship: 500k context, same prices as grok-4.6, efforts `low`–`xhigh` with default `high`, Batch API "Not supported", regions us-east-1/us-west-2/us-central-1.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching/maximizing-cache-hits — Cache hit routing via `prompt_cache_key` (Responses API) or header `x-grok-conv-id` (Chat Completions).
- https://x.ai/news/grok-4 — Grok 4 announcement: "a 256,000 context window" for the Grok 4 API.

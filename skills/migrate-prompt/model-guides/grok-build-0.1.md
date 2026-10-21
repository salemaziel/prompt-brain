---
model: grok-build-0.1
vendor: xAI
family: Grok
aliases: [grok-code-fast-1, grok-code-fast, grok-code-fast-1-0825, grok-build-0-1]
last_verified: 2026-10-13
status: current
---

# Grok Build 0.1

## Reasoning / Thinking
- Type: **Reasoning model without documented controls.** The model page lists "Reasoning: Yes", but mentions no effort levels; the summary table of the reasoning page also lists only grok-4.7, grok-4.6, grok-4.5, and grok-4.20-multi-agent. Whether `reasoning_effort` is accepted, ignored, or rejected is not documented (unbelegt). Likewise unbelegt: default depth and whether reasoning can be disabled.
- Reasoning tokens are generally billed according to the reasoning page ("the reasoning tokens are billed as part of your total consumption").
- Class rule of the reasoning page: "`presencePenalty`, `frequencyPenalty`, and `stop` cannot be used with reasoning models. Requests that include them return an error." grok-build-0.1 is not explicitly named there, but carries the reasoning flag — therefore omit these parameters as a precaution.
- Readable reasoning summaries are described by xAI only for grok-4.7; whether grok-build-0.1 provides `reasoning.encrypted_content` ("Some models can") is not verified (unbelegt). Pipelines evaluating a reasoning trace must not rely on anything here.

## Prompting Style
- Positioning according to announcement: "a coding model specifically trained for agentic coding tasks, including web development, debugging, and MCP support"; outside of coding "a speedy, economical option for general-purpose agentic and tool calling use cases". Prompt accordingly in an **agentic and task-oriented** manner, not as general-purpose chat.
- The announcement states the model "performs best in agentic harness" (citing Grok Build, Cursor, OpenCode, among others). Prompts for pure single-shot chats without a tool loop therefore run outside the profile for which xAI positions it.
- Steer tool selection via **tool definitions**: the description of a tool "helps the model decide when to use it". Parallel tool calling is enabled and is disabled with `parallel_tool_calls: false`.
- Enforce format via **Structured Outputs** (`response_format.type: "json_schema"`): "the response is guaranteed to match your schema" — with documented limits (string length 2,048, arrays 256, 64 properties; `not` and `if`/`then`/`else` only best-effort).
- Prompt caching runs automatically from the start of the `messages` array: keep static prefix (system prompt, tool definitions) at the front and unchanged, set `x-grok-conv-id` or `prompt_cache_key`.
- Model-specific prompting guidance for grok-build-0.1 or grok-code-fast-1 cannot be found in current xAI docs; any further stylistic claim is unbelegt.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: **Cheapest xAI coding model** in the roster ($1.00 input / $2.00 output per 1M below 200k); according to announcement "100+ tokens/second"; function calling, Structured Outputs, and image input available; according to retirement guide compared to grok-code-fast-1 "significantly improved agentic coding and web dev capabilities". No benchmarks have been published by the vendor.
- Weaknesses: **Smallest context window** of current Grok text models (256k instead of 500k on grok-4.5/4.6/4.7 or 1M on grok-4.3/4.20); **Batch API "Not supported"**; only us-east-1/us-west-2, no EU region; significantly lower rate limits than flagships (37 rps / 10M tpm instead of 150 rps / 50M tpm on grok-4.5); no published knowledge cutoff, no published output limit, no effort control. The model overview explicitly recommends grok-4.7 for code, not grok-build-0.1.

## Output & Format Conventions
- 256,000 tokens context; input text + image, output text only. Max output tokens and knowledge cutoff: not published (unbelegt).
- Function calling: yes; Structured Outputs: yes; Reasoning: yes; Batch API: "Not supported".
- Prices per 1M tokens: input $1.00 (<200k prompt) / $2.00 (≥200k), cached input $0.20 / $0.40, output $2.00 / $4.00. Starting at 200k prompt tokens, the higher rate applies to **all** tokens of the request. Rate limits: 37 requests/s, 10M tokens/min; regions us-east-1, us-west-2.
- Vendor aliases on the model page: `grok-code-fast-1`, `grok-code-fast`, `grok-code-fast-1-0825`. According to xAI, `grok-build-latest` does **not** belong here, but is listed on the grok-4.5 model page — a prompt targeting "grok-build-latest" does not land on grok-build-0.1.
- Availability status contradictory: announcement of May 29, 2026 states "now available via the xAI API in public beta", release notes (month "May", without year) state "Currently in early access"; model page lists no status. Plan for beta status.

## Migration Notes
- **MIGRATING FROM grok-code-fast-1**: Since May 15, 2026, requests to `grok-code-fast-1` are routed to `grok-build-0.1` according to the retirement guide; "The slugs themselves continue to resolve". Prompts tuned for grok-code-fast-1 therefore already run on this model — re-evaluate behavior rather than perpetuating assumptions about the old model (its specific traits are no longer described in current documentation, unbelegt).
- **MIGRATING TO grok-build-0.1** (e.g. from grok-4.5/4.6/4.7): (1) Do not plan on `reasoning_effort`/`reasoning.effort` as a lever — no level is documented for this model. (2) Remove `presence_penalty`, `frequency_penalty`, and `stop`, enforcing format via Structured Outputs. (3) Plan context for ≤256k; the 200k price cliff sits near the end of context. (4) Reschedule batch jobs (not supported). (5) Embed the model in a tool loop / agent harness rather than using it as a chat generalist. (6) For demanding tasks that previously relied on deep reasoning, verify quality — xAI recommends grok-4.7 for code.
- **MIGRATING FROM grok-build-0.1** (to grok-4.7/4.6): Set effort explicitly (default `high` there, cannot be disabled); costs rise to $2/$6 per 1M (<200k); context grows to 500k.
- `logprobs`/`top_logprobs` are silently ignored for "`grok-4.20` and newer" according to overview; whether grok-build-0.1 falls under this is not documented (unbelegt) — do not rely on it in pipelines.
- Grok Build (Agent/CLI) ≠ Model: The announcement called grok-build-0.1 "the same model that powers Grok Build"; current Grok Build docs cite no default model and allow arbitrary models, while release notes list Grok 4.7 Fast as available in Grok Build. Therefore, do not equate "Grok Build" in a prompt with this model.

## Sources
- https://docs.x.ai/developers/models/grok-build-0.1 — Model page: id `grok-build-0.1`, aliases `grok-code-fast-1`/`grok-code-fast`/`grok-code-fast-1-0825`, 256k context, text+image→text, function calling/Structured Outputs/reasoning yes without effort options, Batch API "Not supported", pricing table including 200k tier, 37 rps / 10M tpm, regions us-east-1/us-west-2; without cutoff, output limit, or status notice.
- https://x.ai/news/grok-build-0-1 — Announcement of May 29, 2026: "public beta", "100+ tokens/second", positioning for agentic coding/web dev/debugging/MCP, "performs best in agentic harness", $1/$2 per 1M, "the same model that powers Grok Build"; no benchmarks, no prompting tips.
- https://docs.x.ai/developers/migration/may-15-retirement — Mapping `grok-code-fast-1` → `grok-build-0.1`, "significantly improved agentic coding and web dev capabilities", slugs continue to resolve.
- https://docs.x.ai/developers/release-notes — Entry "Grok Build 0.1 … Currently in early access" under "May" without year; Grok Build (agent) "now available in beta"; Grok 4.7 Fast available in Grok Build.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — Summary table without grok-build-0.1, class rule on `presencePenalty`/`frequencyPenalty`/`stop`, billing of reasoning tokens, summaries only for grok-4.7, "Some models can also return encrypted reasoning".
- https://docs.x.ai/developers/models — Pricing roster (256k), recommendation "For everything else, including code, use Grok 4.7", `logprobs` note for "`grok-4.20` and newer", alias convention.
- https://docs.x.ai/developers/models/grok-4.5 — Verifies that `grok-build-latest` is listed as an alias of grok-4.5, not grok-build-0.1; comparative values 150 rps / 50M tpm.
- https://docs.x.ai/build/overview — Grok Build supports "any custom model", no default model named.
- https://docs.x.ai/developers/tools/function-calling — Tool description "helps the model decide when to use it", `parallel_tool_calls: false` for disabling.
- https://docs.x.ai/developers/model-capabilities/text/structured-outputs — `response_format.type: "json_schema"`, schema guarantee, limits, and best-effort keywords.
- https://docs.x.ai/developers/advanced-api-usage/prompt-caching — Automatic caching from start of `messages` array, `x-grok-conv-id`, and `prompt_cache_key`.

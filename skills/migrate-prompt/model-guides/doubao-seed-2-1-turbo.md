---
model: doubao-seed-2-1-turbo
vendor: ByteDance
family: Doubao
aliases: [doubao-seed-2-1-turbo-260628, dola-seed-2-1-turbo-260628, doubao-seed-2.1-turbo, seed-2.1-turbo]
last_verified: 2026-10-13
status: current
---

# Doubao Seed 2.1 Turbo

## Reasoning / Thinking
- Typ: **Deep Thinking enabled by default**. `thinking.type` platform-wide supports `enabled | disabled | auto`; `doubao-seed-2-1-turbo-260628` (Ark) as well as `dola-seed-2-1-turbo-260628` (BytePlus) are listed in the support list only with `enabled` (default) and `disabled` — **no `auto`**.
- Depth via `reasoning_effort` (Chat API) or `reasoning.effort` (Responses API). On Ark, the same rule as 2.1 Pro applies: All seven levels are accepted, **default `high`**, `minimal` = off, `none` → `minimal`, **`xhigh`/`max` → `high`**. The Ark model page summarizes this as four effective modes: `minimal | low | medium | high`. On BytePlus, the effort table row for the dola ID is shown without default or mapping — set `reasoning_effort` explicitly there (default unbelegt).
- **Thinking Summary active by default** (Ark and BytePlus): `reasoning_content` contains only a summary, `encrypted_content` contains the encrypted original. `reasoning_effort` only affects the raw reasoning chain; billing is based on raw tokens. Higher packet latency per documentation — raise `timeout`.
- Tool calling: **Pass back `encrypted_content` unmodified** (takes precedence over `reasoning_content`; returning only the summary lowers quality in agent runs, returning nothing raises no error); in the Responses API `previous_response_id` handles this.
- Max reasoning chain 256k tokens; it shares the output budget with the response.

## Prompting Style
- Deep Thinking recommendations apply identically on Ark and BytePlus: Add **goal, scenario, and target audience** instead of stating only the task; **reduce or avoid step-by-step decomposition and examples** (they constrain the reasoning logic); **reduce system prompts** and pass everything via `role: user`.
- Structured Output: Define format via `response_format` (`json_schema`, `strict: true`), avoid emphasizing "output JSON" or repeating the schema in the prompt, describe technical content instead; omit `frequency_penalty`/`presence_penalty`.
- Images are passed as `image_url` content parts alongside text in the same user message (example on Ark model page).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning per release note: **Cost-effective low-latency variant for large-scale production**, fully featured, performance "on par" with doubao-seed-2-1-pro; designed for high-volume online calls in coding, agentic, and multimodal tasks and for deployments prioritizing cost, throughput, and batching. Seed2.1 page designates Pro and Turbo as the two sizes of the family.
  - Per Ark model page: Coding across the entire development chain including long-running repo-level coding agents; end-to-end agent execution with more flexible fallbacks and better utilization of external CLIs; VLM with more stable **GUI operation across mobile, desktop, and web** and refined image/video understanding.
  - Capability tags: Deep Thinking, text generation, multimodal understanding (input text, image, video → text; **no audio**), GUI tasks, tool calling, Structured Output. Ark tool matrix is complete (Function Calling, Knowledge Base, MCP, Web Search, Image Processing, Doubao Assistant); BytePlus lists Function Calling and MCP.
- Weaknesses:
  - **Only 256k context** (Pro 260915 and Lite: 1024k).
  - **500 RPM / 1,000,000 TPM** like Pro (Lite: 30,000 RPM).
  - **Default response length 4k** despite 256k ceiling.
  - Structured Output is beta and cannot be used with TPM guarantee packages.
  - No `auto` thinking, no genuine level above `high`. No knowledge cutoff published (unbelegt).
  - Availability: Sole Seed 2.1 model on BytePlus ModelArk (international).

## Output & Format Conventions
- Model ID Ark (China): `doubao-seed-2-1-turbo-260628` (recommended model, primary choice), base URL in documentation examples `https://ark.cn-beijing.volces.com/api/v3`. Model ID BytePlus (international): **`dola-seed-2-1-turbo-260628`**, region ap-southeast-1 with base URL `https://ark.ap-southeast.bytepluses.com/api/v3` (eu-west-1 lists additionally only seed-2-0 and seedream-5-0-lite models per BytePlus). `doubao-seed-2.1-turbo` is only a billing name on the pricing page (unverified as a callable model ID (unbelegt)).
- Lengths (identical on Ark and BytePlus): Context 256k, max input 256k, max response including reasoning chain 256k with **default 4k**, max reasoning chain 256k. Bound via `max_completion_tokens` or `max_output_tokens`.
- Structured Output: `json_schema` with `strict: true` recommended, `json_object` requires string `json` in input; field order follows schema; `$ref` local only, `oneOf`/`allOf` without semantic guarantees; unsupported keywords raise an error.
- Operations: Streaming recommended, otherwise set `timeout` above 30 minutes. Caching: Implicit via Responses + Chat API, explicit via Responses API (prefix, session cache) — on both Ark and BytePlus.
- Volcengine pricing per million tokens (0–256k, flat): Online ¥3.00 input / ¥0.60 cache hit / ¥15.00 output, cache storage ¥0.017 per million tokens/hour; Low-Latency (Fast) ¥6.00 / ¥1.20 / ¥30.00; Low-Priority (Flex) and Batch ¥1.50 / ¥0.60 / ¥7.50 — exactly half the Pro price under online rates. BytePlus prices are not recorded here (unbelegt).

## Migration Notes
- **Pro ↔ Turbo**: Identical parameter surface (same `thinking.type`, effort, summary, and pass-back rules, same response / reasoning chain limits) — prompt itself rarely requires modification. Re-evaluate only: Context (Pro 260915: 1024k, Turbo: 256k — chunk Pro→Turbo prompts exceeding 256k input), price, and latency; confirm quality differences via own evaluations (the release note only states "on par").
- **MIGRATING TO doubao-seed-2.1-turbo**: (1) Strip reasoning scaffolding and few-shot examples, add goal/scenario, slim down system prompt. (2) Set `reasoning_effort` explicitly — `xhigh`/`max` from other providers silently land on `high`; on BytePlus no default is documented. (3) Configure fast paths via `thinking: {"type":"disabled"}` or `reasoning_effort: "minimal"`, as there is no `auto`. (4) Set `max_completion_tokens`/`max_output_tokens` against the 4k default. (5) Shift format into `response_format`. (6) Pass `encrypted_content` through in tool chains. (7) Adjust concurrency to 500 RPM / 1M TPM. (8) Internationally, always use the `dola-` ID and the BytePlus base URL. (9) Audio inputs do not apply — within the family, only Lite documents audio support.
- **MIGRATING FROM doubao-seed-2.1-turbo**: `thinking.type`, `reasoning_effort`, and `encrypted_content` are Ark-specific — re-map reasoning control against target guide rather than adopting 1:1 or removing indiscriminately; re-add stripped CoT scaffolding, examples, and role separation if target is not an always-on reasoner; translate `response_format` to target's structured output format.

## Sources
- https://docs.volcengine.com/docs/ark/model-list?lang=zh — Ark model list (as of 2026.10.09): `doubao-seed-2-1-turbo-260628` under recommended models with capability tags, 256k context / 256k input / 256k response with 4k default / 256k reasoning chain, 500 RPM / 1,000,000 TPM; tool and caching matrix; Pro 260915 and Lite with 1024k as comparison; Turbo absent from audio table.
- https://docs.volcengine.com/docs/ark/deep-thinking?lang=zh — Deep Thinking page (as of 2026.10.09): `thinking.type` support (Turbo only `enabled`/`disabled`), effort table (Turbo in same row as Pro: default `high`, mapping), Thinking Summary list, pass-back rules for `encrypted_content`, timeout and streaming notes, prompt optimization recommendations.
- https://docs.volcengine.com/docs/ark/structured-output-beta?lang=zh — Structured Output (beta, as of 2026.09.22): `json_schema`/`json_object`, schema constraints, beta and TPM package caveats, penalty warning, prompt recommendations (appendix 3).
- https://docs.volcengine.com/docs/ark/model-pricing?lang=zh — Pricing page (as of 2026.10.10): `doubao-seed-2.1-turbo` in Online, Low-Latency, Low-Priority, and Batch tables; Pro prices as comparison.
- https://docs.volcengine.com/docs/ark/model-release-announcement?lang=zh — Release announcements (as of 2026.10.13): `doubao-seed-2-1-turbo-260628` as new release under 202606 — cost-effective, low-latency, fully featured, comparable to doubao-seed-2-1-pro, for large-scale production volume.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-turbo — Ark model page: 260628 as primary recommendation, input text/image/video → text, pricing including Fast and Flex rates, `reasoning_effort` with four modes and default `high`, coding/agent/VLM bullet points (GUI across mobile, desktop, web), request example with `image_url`.
- https://seed.bytedance.com/en/seed2_1 — Seed2.1 page: Family with the two sizes Pro and Turbo.
- https://docs.byteplus.com/en/docs/modelark/model-list — BytePlus ModelArk model list (as of 2026-10-13): `dola-seed-2-1-turbo-260628` as sole 2.1 model, lengths and limits, Function Calling / MCP, caching, Structured Output (beta); regions ap-southeast-1 / eu-west-1 and base URLs.
- https://docs.byteplus.com/en/docs/modelark/deep-thinking — BytePlus Deep Thinking page (as of 2026-10-06): dola-Turbo with `enabled` (default)/`disabled`, in Thinking Summary list, effort table row without default/mapping, prompt recommendations matching Ark.

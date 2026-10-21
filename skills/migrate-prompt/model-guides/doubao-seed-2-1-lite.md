---
model: doubao-seed-2-1-lite
vendor: ByteDance
family: Doubao
aliases: [doubao-seed-2-1-lite-260915, doubao-seed-2.1-lite, seed-2.1-lite]
last_verified: 2026-10-13
status: current
---

# Doubao Seed 2.1 Lite

## Reasoning / Thinking
- Type: **Deep Thinking per default on**. `thinking.type` supports `enabled | disabled | auto` across the platform, but doubao-seed-2-1-lite-260915 is listed in the support list only with `enabled` (default) and `disabled` — **no `auto`**. A request without a `thinking` field engages in thinking.
- Depth control via `reasoning_effort` (Chat API) or `reasoning.effort` (Responses API). All seven tiers are accepted (`none | minimal | low | medium | high | xhigh | max`), **default `high`**; `minimal` disables thinking, `none` maps to `minimal`, **`xhigh`/`max` silently default to `high`**. The 2.0 models that Lite replaces, by contrast, run with default `medium`.
- **Thinking Summary active by default**: returns `reasoning_content` (summary) and `encrypted_content` (encrypted original). `reasoning_effort` only affects the raw thought process; billing is based on raw tokens (`usage.completion_tokens_details.reasoning_tokens`). According to docs, the summary increases packet latency — set `timeout` generously.
- Tool Calling: **pass `encrypted_content` back unmodified** — it takes precedence over `reasoning_content`; returning only the summary degrades quality in multi-turn / agent runs according to docs, though returning nothing does not throw an error. The Responses API handles this automatically via `previous_response_id`.
- Maximum chain of thought 256k tokens; counts against the same output budget as the response.

## Prompting Style
- The Ark "Prompt Optimization Recommendations" for Deep Thinking models apply: add **goal, scenario, and audience** (language/tool, readership, occasion, target) rather than stating only the task.
- **Reduce or avoid step-by-step decomposition and examples** — step-by-step requirements and few-shot constrain the reasoning logic according to docs.
- **Reduce system prompts**: place all prompt information directly in the user prompt (`role: user`).
- Structured Output (Appendix 3 of docs): do not emphasize "output JSON" in the prompt and do not repeat schema structure; instead, describe the domain content of the task; format belongs in `response_format`.
- Images are passed as `image_url` content parts alongside text in the same user message (example on the Ark page for sibling model Turbo); audio input formats and audio-specific prompt rules have not been tested here (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - **Omni-modal**: native, unified processing of text, image/video, and audio according to release notes and model page (input text, image, video, audio → output text). In the Ark model list, Lite is the only 2.1 model in the audio understanding table.
  - **1M context** (1024k context / 1024k input) and **30,000 RPM / 5,000,000 TPM** — 60× the RPM ceiling of 2.1 Pro and Turbo (500 RPM each).
  - Improved in coding, agentic tasks, general reasoning, long-text, and multimodal understanding compared to Doubao-Seed-2.0-lite/260428 according to the Ark model page; targeted scenarios: education, office, content analysis, developer assistance. Concrete benchmark scores for Lite are not listed on verified pages (unbelegt).
  - Capability tags: Deep Thinking, text generation, multimodal understanding, GUI tasks, tool calling, Structured Output; complete tool matrix (Function Calling, Knowledge Base, MCP, Web Search, Image Processing, Doubao Assistant — all except Function Calling via Responses API only).
- Weaknesses / quirks: **default response length 4k** despite 256k ceiling; Structured Output is in **beta** and cannot be used with TPM guarantee packages; no `auto` thinking, no actual tier above `high`. No published knowledge cutoff (unbelegt).
- Availability: Volcengine Ark (China) only; the BytePlus ModelArk list (international) does not offer a Lite variant.

## Output & Format Conventions
- Model ID: `doubao-seed-2-1-lite-260915` (Ark: 推荐模型 [Recommended Model], 首推 [Top Pick]). Context window 1024k, max input 1024k, max response 256k with **default 4k**, max chain of thought 256k. `doubao-seed-2.1-lite` appears only as a billing identifier on the pricing page; its status as a callable model ID is not documented (unbelegt).
- Output length via `max_completion_tokens` (Chat API) or `max_output_tokens` (Responses API) — covers chain of thought **plus** response.
- Structured Output: `json_schema` with `strict: true` recommended; `json_object` requires the string `json` in input; field order follows the schema; `$ref` only local (`#`), `oneOf`/`allOf` without semantic guarantee; unsupported keywords raise an error; do not combine with `frequency_penalty`/`presence_penalty`.
- Operations: streaming recommended, otherwise set `timeout` above 30 minutes. APIs: Chat Completions, Responses, Batch (`/v3/batch/chat/completions`), Tokenization. Caching: implicit via Responses + Chat API, explicit via Responses API (prefix, session cache).
- Volcengine pricing per million tokens, flat across 0–1024k: Online 0.80 ¥ input / 12.00 ¥ audio input / 0.16 ¥ cache hit / 2.40 ¥ audio cache hit / 2.70 ¥ output, cache storage 0.017 ¥ per million tokens/hour. Low-Latency (Fast): 1.60 / 24.00 / 0.32 / 4.80 / 5.40 ¥. Low-Priority (Flex) and Batch: 0.40 / 6.00 / 0.16 / 2.40 / 1.35 ¥. Audio input costs 15× text input.

## Migration Notes
- **MIGRATING TO doubao-seed-2.1-lite** (Ark designates Lite as the recommended target for doubao-seed-2-0-pro-260215 and doubao-seed-2-0-lite-260215; EOS 2026-11-24 and 2026-10-22 respectively, each at 14:00 UTC+8; unmigrated endpoints are automatically switched to the recommended model or decommissioned according to Ark): (1) set `reasoning_effort` explicitly — 2.0 models defaulted to `medium`, Lite to `high`; without explicit setting, thinking tokens, costs, and latency increase. (2) Increase length assumptions: 2.0 had 224k input and 128k response/chain of thought, Lite has 1024k and 256k respectively; chunking scaffolding can be eliminated. (3) Thinking Summary is now default (not listed for 2.0-pro-260215 / -lite-260215): `reasoning_content` is only a summary; pass `encrypted_content` through in tool chains. (4) Recalculate pricing — 2.0-lite was tiered by input length, Lite is flat. (5) Prompt rules as with all Ark Deep Thinking models: prune reasoning scaffolding and few-shot examples, add goal/scenario, place format in `response_format`.
- **Pro ↔ Lite**: identical parameter surface (same `thinking.type`, effort, and summary rules, identical lengths for Pro 260915) — prompt rewrite generally unnecessary; re-evaluate: quality on highly complex tasks (Pro is positioned for this according to release notes; direct Pro vs. Lite comparisons are unbelegt), price (output 2.70 ¥ instead of 30.00 ¥), throughput (30,000 instead of 500 RPM), and audio, which only Lite accepts.
- **MIGRATING FROM doubao-seed-2.1-lite**: Retain audio content only if the target documents audio input (Pro and Turbo accept text/image/video only according to Ark model pages). When moving from Lite → Turbo, down-plan context to 256k. `thinking.type`, `reasoning_effort`, and `encrypted_content` are Ark-specific — remap reasoning controls according to the target guide; restore removed CoT scaffolding, examples, and role separation if target is not an always-on reasoner; verify throughput against target limits.

## Sources
- https://docs.volcengine.com/docs/ark/model-list?lang=zh — Ark model list (as of 2026.10.09): `doubao-seed-2-1-lite-260915` under 推荐模型 with capability tags, 1024k context / 1024k input / 256k response with default 4k / 256k chain of thought, 30,000 RPM / 5,000,000 TPM; Lite in audio understanding table; tool and caching matrix; 2.0 limits (224k input, 128k response) and 500 RPM for 2.1 Pro/Turbo for comparison.
- https://docs.volcengine.com/docs/ark/deep-thinking?lang=zh — Deep Thinking page (as of 2026.10.09): `thinking.type` support (Lite only `enabled`/`disabled`), effort table (2.1 models default `high`, 2.0 models default `medium`, mapping `minimal`/`none`/`xhigh`/`max`), Thinking Summary model list with `reasoning_content`/`encrypted_content` and return rules, latency and timeout notes, prompt optimization recommendations.
- https://docs.volcengine.com/docs/ark/structured-output-beta?lang=zh — Structured Output (beta, as of 2026.09.22): `json_schema`/`json_object`, schema constraints, beta and TPM package reservation, penalty warning, prompt recommendations (Appendix 3).
- https://docs.volcengine.com/docs/ark/model-pricing?lang=zh — pricing page (as of 2026.10.10): `doubao-seed-2.1-lite` in Online, Low-Latency, Low-Priority, and Batch tables incl. audio columns; tiered 2.0-lite pricing in contrast.
- https://docs.volcengine.com/docs/ark/model-release-announcement?lang=zh — release announcements (as of 2026.10.13): `doubao-seed-2-1-lite-260915` as new release under 202609, omni-modal (text, vision, audio) with 1M context, improved coding/agentic tasks; `doubao-seed-2-1-pro-260628` under 202606 positioned for highly complex coding/agentic tasks.
- https://docs.volcengine.com/docs/ark/model-deprecation-notice?lang=zh — deprecations (as of 2026.10.09): 10th batch, Lite as recommended target for doubao-seed-2-0-pro-260215 and -lite-260215, EOS dates and automatic migration or decommissioning.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-lite — Ark model page: 260915 as top pick, input text/image/video/audio → text, pricing incl. Fast tier, supported APIs (incl. batch), improvements over Doubao-Seed-2.0-lite/260428 and application scenarios.
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-pro — Ark model page Pro: input text/image/video → text (no audio).
- https://ark.volcengine.com/region:cn-beijing/model/detail?Id=doubao-seed-2-1-turbo — Ark model page Turbo: input text/image/video → text (no audio); request example with `image_url` and `text` content parts in a single user message.
- https://docs.byteplus.com/en/docs/modelark/model-list — BytePlus ModelArk model list (as of 2026-10-13): from 2.1 series only `dola-seed-2-1-turbo-260628`, no Lite variant.

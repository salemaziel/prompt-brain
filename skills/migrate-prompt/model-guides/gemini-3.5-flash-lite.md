---
model: gemini-3.5-flash-lite
vendor: Google
family: Gemini
aliases: [gemini-flash-lite, gemini-3-5-flash-lite, 3.5-flash-lite, gemini-flash-lite-3.5, gemini3.5flashlite]
last_verified: 2026-10-13
status: current
---

# Gemini 3.5 Flash-Lite

## Reasoning / Thinking
- Type: **dynamic thinking with minimal default**. Controlled via the string enum `thinking_level` with `minimal | low | medium | high`, default **`minimal`** (thinking table: "On (minimal)").
- According to documentation, `minimal` corresponds to the "no thinking" setting for most requests, but does not guarantee thinking is turned off ("`minimal` does not guarantee that thinking is off").
- Level selection according to migration checklist: leave at `minimal` for high-volume extraction, routing, and classification; set to `medium` or `high` for autonomous subagents with tool calls, code execution, or multi-step reasoning "to prevent premature tool termination". For document parsing, Google advises testing `minimal` against `high` depending on document complexity.
- `thinking_budget` is deprecated; providing both `thinking_level` and `thinking_budget` in the same request yields a 400 error. The levels are "relative allowances for thinking rather than strict token guarantees".
- Thought Signatures: In stateful operation (`store: true` + `previous_interaction_id`), the server manages them; in stateless operation, all `thought` blocks must be returned unchanged. Thinking tokens are billed as output tokens, and `max_output_tokens` counts them towards the limit.

## Prompting Style
- **Concise and direct**: "Be concise. Gemini 3.x responds best to direct, clear instructions." Verbose prompt engineering techniques designed for older models can lead to "over-analyze" according to documentation.
- **Request verbosity explicitly**: Gemini 3.x answers with low verbosity by default; request a conversational tone explicitly if needed.
- **Long context**: Place data first, with the question or instruction at the end, introduced by "Based on the preceding information...".
- **No sampling controls**: `temperature`, `top_p`, and `top_k` are "deprecated and ignored"; future model generations will respond with HTTP 400. To achieve higher determinism, Google recommends a system instruction with explicit rules.
- **No Assistant prefill**: A request ending with a non-empty `model` turn returns 400. Enforce output formatting via `system_instruction` or Structured Outputs.
- **Subagent prompts**: Because the default is `minimal`, thinking depth for planning and tool tasks must be actively raised via `thinking_level`; Google explicitly recommends this for "autonomous planning and complex subagent tasks".

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Highest throughput in the 3.5 family for data parsing and document extraction according to Google; more reliable tool execution for Code Execution, Search, and MCP; more accurate document parsing and structured data extraction; frontend JavaScript and tabular processing via lightweight Code Execution; more stable multi-turn instruction following and persona consistency than Gemini 3.1 Flash-Lite; Computer Use available as a built-in tool.
- Compared to Gemini 2.5 Flash, Google highlights a "Strong migration path" with higher scores on HLE (18.0% vs. 11.0%) and CharXIV (74.5% vs. 63.7%).
- Model Card: Based on Gemini 3.1 Flash-Lite; optimized for latency-critical tasks in high volume such as translation and classification, as well as agentic workflows.
- Weaknesses: Usual hallucinations, jailbreak resistance still in progress, occasional slowness or timeouts according to the Model Card. Knowledge cutoff **March 2026**, in some domains only up to January 2025.
- Image segmentation (pixel masks) is not supported in Gemini 3.x according to Google.

## Output & Format Conventions
- 1,048,576 input tokens / 65,536 output tokens. Input: text, image, video, audio, PDF → output text only.
- Supported: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Grounding with Google Maps, Computer Use (Preview), Batch, Flex, and Priority inference. **Not** supported: audio generation, image generation, Live API.
- Function Calling: Same rules as 3.6 Flash — pass multimodal assets into the response payload, format inline instructions in function responses with `\n\n`.
- Pricing per 1M tokens (Paid Tier): input $0.30, output $2.50 (including thinking tokens); Batch $0.15 / $1.25; context caching $0.03 plus $1.00 storage per 1M tokens/hour.

## Migration Notes
- **Status**: GA since 2026-07-21, no shutdown date announced. For new projects, Google recommends "3.5 Flash-Lite or 3.8 Flash" as "latest models". There is no newer Flash-Lite text model; `gemini-3.1-flash-lite` (shutdown earliest 2027-05-07) specifies `gemini-3.5-flash-lite` as its replacement.
- **MIGRATING TO gemini-3.5-flash-lite**: Swap model ID; choose `thinking_level` deliberately (`minimal` for throughput, `medium`/`high` for subagents with tools); remove `temperature`/`top_p`/`top_k`, `candidate_count`, and prefilled model turns; review function calling according to the same rules as 3.6 Flash; preserve thought signatures or switch to `previous_interaction_id`; strip verbose prompt engineering and CoT scaffolding.
- Specifically **from `gemini-2.5-flash`**: Replace `thinkingBudget` with `thinking_level`; a budget of `0` maps most closely to `minimal`, which does not guarantee thinking is disabled; remove explicitly set temperature. Do not migrate segmentation workloads — Google continues to recommend Gemini 2.5 Flash with thinking disabled for this purpose.
- Specifically **from `gemini-3.1-flash-lite`**: Same `minimal` default; Google highlights improved persona consistency and multi-turn instruction following.
- **MIGRATING FROM gemini-3.5-flash-lite**: Translate `thinking_level` to the target's control scheme — migrating to `gemini-3.8-flash` requires upgrading `minimal` to `low`, as `minimal` throws an error there; remove thought signature and `previous_interaction_id` logic if unsupported by the target; set sampling parameters only if required by the target guide; re-evaluate cost and latency.

## Sources
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite — Model page: ID `gemini-3.5-flash-lite` (Stable, July 2026), 1,048,576 input / 65,536 output, input text/image/video/audio/PDF → text, capability list including Computer Use (Preview), unsupported features, focus on subagents and document parsing.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — "What's new in Gemini 3.6 Flash and 3.5 Flash-Lite": Default `minimal`, pricing $0.30 / $2.50, strengths (throughput, tool reliability, document parsing, persona consistency), "Strong migration path from Gemini 2.5 Flash" with HLE and CharXIV scores, sampling deprecation and prefill 400, checklist "Migrate to gemini-3.5-flash-lite" (`minimal` for throughput, `medium`/`high` "to prevent premature tool termination").
- https://ai.google.dev/gemini-api/docs/thinking — Thinking table (`gemini-3.5-flash-lite`: "On (minimal)", `minimal, low, medium, high`), thought signature handling stateful/stateless, thinking tokens in billing, `max_output_tokens` inclusive of thought tokens.
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingLevel` table (3.5 & 3.1 Flash-Lite: `minimal` default), "`minimal` does not guarantee that thinking is off", 2.5 Flash budget 0 to 24576.
- https://ai.google.dev/gemini-api/docs/gemini-3 — "relative allowances for thinking rather than strict token guarantees", 400 error on `thinking_level` + `thinking_budget`.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Best practices for all Gemini 3.x (conciseness, verbosity, long-context rule), "Image segmentation is not supported in Gemini 3.x" recommending Gemini 2.5 Flash with thinking disabled.
- https://ai.google.dev/gemini-api/docs/models — Model list: Gemini 3.5 Flash-Lite (Stable) and note "For any new projects, use our latest models: 3.5 Flash-Lite or 3.8 Flash".
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.5-flash-lite` (2026-07-21, no shutdown date announced); `gemini-3.1-flash-lite` with shutdown 2027-05-07 and replacement `gemini-3.5-flash-lite`.
- https://ai.google.dev/gemini-api/docs/changelog — 2026-07-21: GA of Gemini 3.5 Flash-Lite as "low-latency, highly cost-effective subagent option".
- https://ai.google.dev/gemini-api/docs/pricing — Pricing 3.5 Flash-Lite: $0.30 / $2.50, Batch $0.15 / $1.25, caching $0.03 plus $1.00 storage per 1M tokens/hour.
- https://deepmind.google/models/model-cards/gemini-3-5-flash-lite/ — Model Card: Based on Gemini 3.1 Flash-Lite, focus on translation, classification, and agentic workflows, limitations (hallucinations, jailbreaks, slowness/timeouts), knowledge cutoff March 2026 (partially January 2025).

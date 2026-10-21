---
model: muse-spark-1.2
vendor: Meta
family: Muse
aliases: [muse-spark-1.2-contributor, spark-1.2, muse-spark-1-2]
last_verified: 2026-10-13
status: legacy
successor: muse-spark-1.3
---

# Muse Spark 1.2

## Reasoning / Thinking
- Type: **always on, cannot be disabled**. `reasoning_effort: "none"` is not supported for Muse Spark and returns HTTP 400 ("Not supported by Muse Wonder or Muse Spark"); on the Messages API the same applies to `thinking: {type: "disabled"}`. Every zero-thinking path must be mapped to `minimal` or `low`.
- Parameter is protocol-dependent: `reasoning_effort` (Chat Completions) or `reasoning.effort` (Responses API), on the Messages API `output_config.effort` (`low`–`xhigh`). Levels for 1.2: `minimal | low | medium | high | xhigh` — **no `max`**, which is enabled only for `muse-wonder-1.0` and `muse-spark-1.3` according to reasoning documentation.
- **No published default**: Without parameter "the model still reasons at a model-determined level" — what level that is is stated nowhere (unbelegt). Set effort explicitly in the prompt contract.
- Chain of thought is private; reasoning tokens count against `max_tokens` or `max_output_tokens` and are billed at the output rate. Preserving reasoning across turns works only on Responses (`previous_response_id` or `include: ["reasoning.encrypted_content"]`) and Messages (`thinking`/`redacted_thinking` replay); Chat Completions "reasons from scratch". Protocol documentation applies to all models of the Model API; 1.2-specific deviations are not documented (unbelegt).
- `logprobs` is not supported (HTTP 400) — "Muse Spark is a reasoning model".

## Prompting Style
- **`developer` role instead of `system`**: Meta's build blog recommends "Prefer a `developer` message over the `system` to set tone, format, and standing rules". The blog refers to Muse Spark 1.1 and predates 1.2 — the recommendation applies family-wide here; 1.2-specific confirmation is missing (unbelegt).
- **Match effort to the task**: "match effort to the task"; according to the same blog, `reasoning_effort=xhigh` can produce an entire artifact in a single turn for well-scoped tasks (likewise 1.1 context).
- **Complex instructions are supported**: 1.2 follows "complex instructions more precisely than its predecessor" according to the launch blog and uses planning, goal conditioning, and context compaction for long tasks.
- **Tool descriptions carry the weight**: "Write clear, specific descriptions for the tool and for each parameter. The model uses them to decide when and how to call the tool."
- **Caching via ordering**: Prefix caching is automatic; "put stable content first … and put variable content last".

## Strengths & Weaknesses (prompt-relevant)
- Positioning: According to the model overview "the previous version" of the Muse Spark line; `muse-spark-1.3` is "the latest version" and "Recommended for new work". Meta does not state a deprecation.
- Strengths: Coding focus — "a coding-focused update to Muse Spark 1.1" with improvements in code generation, debugging, codebase understanding, and end-to-end workflows; the model page promises "higher first-attempt accuracy and more reliable tool calling". Agentic long-horizon runs (kernel case study with 1,000+ tool calls over up to 24 hours).
- Strengths: "robust audio-visual understanding to enable video-heavy workflows" (Multimodal blog). **Audio**: Meta explicitly refers audio workloads to 1.2 ("For audio, use Muse Spark 1.2") because audio is not fully supported in 1.3.
- Weaknesses: `tool_choice` accepts only `"auto"` on the Model API — `"required"`, `"none"`, and named functions result in HTTP 400; formulate tool forcing linguistically in the prompt.
  - More verbose compared to 1.3: 1.3 uses "~20% fewer tool calls and ~25% fewer tokens" and is "less verbose" according to Meta — 1.2 prompts therefore often contain conciseness and turn-saving instructions.
  - No published knowledge cutoff and no published output token limit (unbelegt).

## Output & Format Conventions
- Context window **1,048,576 tokens**; input text, image, video, audio, and PDF, output text only.
- Structured Output via `response_format` (`json_schema`, Chat Completions) or `text.format` (Responses); decoding is schema-constrained. Schema limits identical to 1.3: depth 10, 5,000 properties, 120,000 characters, 1,000 enum values (default, raisable per app), no recursive schemas. Function tool arguments are only schema-guided even with `strict: true` — validate server-side.
- Tool calling: `parallel_tool_calls` default `true`; tool names `^[a-zA-Z0-9_.-]+$` with at most one dot.
- Three protocols (Responses, Chat Completions, Messages) with the same models, same auth, and same price; search grounding only on the Responses API.
- Prices per 1M tokens identical to 1.3: Standard $1.25 / $0.15 (cached) / $4.25, Contributor (`muse-spark-1.2-contributor`) $0.10 / $0.002 / $0.20 — Contributor mode grants Meta permission to use content for training.

## Migration Notes
- **Status**: Meta lists 1.2 as "the previous version" and recommends 1.3 for new work; 1.2 remains available on Model API and in Muse Code, with no retirement date named. Exception: For audio, Meta continues to recommend 1.2 (or Muse Voice Transcribe) — do not move audio workloads to 1.3 without verification.
- **MIGRATING TO muse-spark-1.3** (MIGRATING FROM muse-spark-1.2): Remove conciseness, verbosity, and turn-saving instructions (1.3 is more concise); effort levels transfer 1:1, adding `max` only on standard tier 1.3; leave audio paths on 1.2 or Muse Voice Transcribe; prompts with many individual steps can be streamlined because 1.3 follows long instructions more reliably.
- **MIGRATING TO muse-spark-1.2**: Map `max` to `xhigh`; remove `reasoning_effort: "none"`, forced `tool_choice` values, and `logprobs` (each HTTP 400); set token budgets generously for reasoning; maintain the system prompt layer as a `developer` message; add conciseness instructions when migrating from 1.3 sources if needed.
- **MIGRATING FROM muse-spark-1.2 to third-party models**: Remove Meta-specific fields (`reasoning.summary`, `include: ["reasoning.encrypted_content"]`, `previous_response_id`), convert `developer` back to `system` if the target lacks a developer role, and verify audio capabilities of the target.

## Sources
- https://dev.meta.ai/docs/models.md — Verifies `muse-spark-1.2` as "the previous version" and `muse-spark-1.3` as "the latest version"/"Recommended for new work", 1,048,576 tokens context, input modalities and text output, availability of `muse-spark-1.2`/`muse-spark-1.2-contributor` on Model API and in Muse Code, and the audio notice "For audio, use Muse Spark 1.2".
- https://dev.meta.ai/docs/reasoning.md — Verifies effort levels, `max` only for `muse-wonder-1.0` and `muse-spark-1.3`, HTTP 400 for `none` and `logprobs`, "model-determined level" default, private chain of thought, token billing, and reasoning preservation per protocol.
- https://dev.meta.ai/docs/protocols.md — Verifies the three protocols with identical models, auth, and price, reasoning preservation on Responses and Messages (not on Chat Completions), and search grounding only on Responses.
- https://dev.meta.ai/docs/protocols/messages.md — Verifies `thinking`/`output_config.effort` (`low`–`xhigh`), HTTP 400 for `thinking: {type: "disabled"}` and `redacted_thinking` replay.
- https://dev.meta.ai/models/muse-spark-1-2 — Official model page: "optimized for real coding workflows, with higher first-attempt accuracy and more reliable tool calling", 1M context, pricing table for both tiers.
- https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2 — Launch blog of 2026-08-05: "coding-focused update to Muse Spark 1.1", more precise instruction following for complex prompts, planning/goal conditioning/context compaction, kernel case study, availability in Muse Code and Model API.
- https://research.meta.ai/blog/multimodal-intelligence-of-muse-spark-1-2 — Blog of 2026-08-20: "robust audio-visual understanding" and video workflows; lists no prompting rules and no 1.2-specific limitations.
- https://research.meta.ai/blog/introducing-muse-spark-1-3 — Verifies differences of 1.3 compared to 1.2 (~20% fewer tool calls, ~25% fewer tokens, "less verbose", more reliable following of long instructions).
- https://dev.meta.ai/resources/blog/build-with-muse-spark — Build blog of 2026-07-08 (Muse Spark 1.1): `developer` instead of `system` recommendation, matching effort to task complexity, `xhigh` single-turn execution.
- https://dev.meta.ai/docs/tool-calling.md — Verifies `tool_choice` supports only `"auto"` (otherwise HTTP 400), `parallel_tool_calls` default `true`, naming rules, description recommendation, and schema-guided, non-guaranteed arguments.
- https://dev.meta.ai/docs/structured-output.md — Verifies `response_format`/`text.format`, schema-constrained decoding, no recursive schemas, and schema limits.
- https://dev.meta.ai/docs/prompt-caching.md — Verifies automatic prefix caching and "stable content first".
- https://dev.meta.ai/docs/pricing-rate-limits — Verifies identical prices for 1.2 and 1.3 across standard and contributor tiers and the training data agreement of contributor mode.

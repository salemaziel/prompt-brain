---
model: gemini-3.7-flash
vendor: Google
family: Gemini
aliases: [gemini-3.7, gemini-3-7-flash, 3.7-flash, gemini-flash-3.7]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.8-flash
---

# Gemini 3.7 Flash

## Reasoning / Thinking
- Type: **string enum, not a token budget**. `thinking_level` with `low | medium | high`; default is `medium`. `minimal` is invalid here ("`minimal` is not supported and returns an error"). Meaning according to documentation: `low` = shorter time-to-answer for latency-critical cases, `medium` = best quality for most tasks, `high` = maximum thinking and maximum tool usage, with higher token consumption and higher costs.
- Family distinction to note: The `medium` default for 3.7 Flash is stated in "What's new in Gemini 3.7 Flash" and on the Model Card. The phrase "The default thinking effort is now `medium`, changed from `high` in Gemini 3 Flash Preview" originates from the Gemini 3.5 Flash guide and does not mention 3.7 Flash directly. Other 3.x models continue to default to `high` (Gemini 3.1 Pro, Gemini 3 Flash) or `minimal` (Gemini 3.1 Flash-Lite).
- `thinking_budget` is legacy: The Gemini 3 checklists replace it with the string enum `thinking_level`. It is still accepted in Gemini 3 for backward compatibility, but cannot be combined with `thinking_level` in the same request (400 error); levels are relative allowances, not token guarantees.
- Reasoning state is handled via **Thought Signatures** (encrypted representations of internal reasoning). On legacy `generateContent`, the complete, unaltered history including thought signatures must be returned; the Interactions API manages this automatically (`previous_interaction_id`).

## Prompting Style
- **Short and direct**: "Be concise. Gemini 3.x responds best to direct, clear instructions." Explicit warning: "Verbose or complex prompt engineering techniques designed for older models may cause the model to over-analyze."
- No handcrafted Chain-of-Thought — use `thinking_level: "medium"`/`"high"` with a simpler prompt instead.
- In long-context / large data scenarios, place the concrete question or instruction **at the end after the data block** (anchor with "Based on the preceding information...").
- Function Calling: Format inline instructions in function responses with `\n\n` — documentation lists this rule under "Audit function calling", not as a general prompt rule.
- Sampling: For Gemini 3, Google recommends the temperature default `1.0` ("may lead to unexpected behavior, such as looping or degraded performance"). Starting with Gemini 3.6 Flash, `temperature`, `top_p`, and `top_k` are considered "deprecated and ignored" for this and all subsequent models — remove them from the generation config.
- Tone: "By default, Gemini 3 and 3.1 is less verbose and prefers direct, efficient answers." — explicitly request a conversational style if desired (family-level statement; not separately confirmed for 3.7 Flash). For dense documents, set `media_resolution` per item (`low|medium|high|ultra_high`); documentation advises testing `media_resolution_high` for PDFs ("test the new `media_resolution_high` setting to ensure continued accuracy").

## Strengths & Weaknesses (prompt-relevant)
- Strengths: "Significantly higher quality on real-world software engineering and agentic benchmarks, improving issue resolution and reducing failed agent loops"; "higher-fidelity desktop and web application code directly from design mocks, with strong gains in design adherence". Model Card: 43.6% on FrontierCode 1.1, 97.0% on GDM-MRCR v2 (8-needle) at 128k context; target profile is agentic workflows, coding, enterprise automation. Knowledge cutoff: March 2026.
- Weaknesses: General foundation model limitations including hallucinations; "occasional slowness or timeout issues"; certain domains covered only up to January 2025; jailbreak resistance according to Google is still in progress.
- Modality gaps: No image generation, no audio generation, Live API "Not supported". Image segmentation (pixel masks) is "not supported in Gemini 3.x" according to Google — do not migrate segmentation workloads to Gemini 3.x (Gemini 2.5 is legacy here; verify target segmentation support in advance). Google itself continues to recommend Gemini 2.5 Flash with thinking disabled for this, though since 2026-09-18 that model is only available to existing users.

## Output & Format Conventions
- **Deprecated since 2026-10-08** (GA was 2026-08-13): "API requests to `gemini-3.7-flash` are automatically routed to `gemini-3.8-flash`"; the endpoint is not shutting down, but is no longer selectable in Google AI Studio. A prompt targeting `gemini-3.7-flash` is effectively executed by 3.8 Flash. Context: **1,048,576 input tokens**, **65,536 output tokens** (documentation shorthand: "a 1M token context window, 64k max output tokens").
- Input: text, image, video, audio, PDF — output: text only. Supported: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Maps Grounding, Computer Use (Preview), Batch/Flex/Priority. Not supported: Live API, image generation, audio generation.
- Structured outputs can be combined with built-in tools: "Gemini 3 models allow you to combine Structured Outputs with built-in tools, including Grounding with Google Search, URL Context, Code Execution, and Function Calling." (Family statement for Gemini 3, not formulated specifically for 3.7 Flash).
- **No Assistant prefill**: Starting with Gemini 3.6 Flash, a request ending with a non-empty `model` turn returns a 400 error; `candidate_count` is unsupported in Gemini 3 and later. Enforce desired output format via response schema or system instruction.
- Historical (the pricing page no longer lists 3.7 Flash): Launched according to changelog with introductory pricing until 2026-12-31; specific values (input $0.75 / output $3.75 per 1M tokens, then $1.50 / $7.50) are no longer officially verifiable ((unbelegt)).

## Migration Notes
- **Status caveat**: Deprecated since 2026-10-08, replaced by `gemini-3.8-flash`; all API requests to `gemini-3.7-flash` are automatically routed there. No shutdown date, the endpoint remains reachable.
- **MIGRATING FROM gemini-3.7-flash**: Re-add explicit step-by-step / CoT scaffolding; translate `thinking_level` to the target model's effort/budget control; explicitly set temperature again (the 1.0 default is not a portable assumption); remove thought signature plumbing; materialize conversation history client-side since `previous_interaction_id` has no equivalent; prefill is permitted again elsewhere. When migrating to `gemini-3.8-flash`, it is essentially just updating the model string, since 3.7 requests already run there.
- **MIGRATING TO gemini-3.7-flash**: Do not select as a new migration target — requests land on `gemini-3.8-flash`; migrate directly there. For existing prompts: remove `temperature`/`top_p`/`top_k`; `thinking_budget` → `thinking_level` (a 2.5 zero budget becomes `low`, **not** `minimal`); remove `candidate_count`; rewrite prefill turns into instructions or response schemas; standardize multi-turn on `previous_interaction_id` (Interactions API, `store=true`); streamline verbose prompts and convert CoT into `thinking_level`; re-test dense PDFs with `media_resolution_high`; audit function calling — multimodal content belongs *inside* function response parts, format inline instructions there with `\n\n`, and return thought signatures from tool turns. Do not migrate image segmentation prompts here.

## Sources
- https://ai.google.dev/gemini-api/docs/models — Official model list; no longer lists 3.7 Flash since deprecation, shows 3.8 Flash as latest Flash version.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.7 — "What's new in Gemini 3.7 Flash" (preserved as reference with deprecation note): thinking_level values + `medium` default, meaning of levels, coding/agentic/web design improvements, "a 1M token context window, 64k max output tokens".
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6#api-changes-and-parameter-updates — API changes from 3.6 Flash onwards "and all future Gemini model releases": sampling parameters "deprecated and ignored", prefill turn → 400, `candidate_count` "unsupported in Gemini 3 and later".
- https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash — Model page: carries deprecated notice since 10/2026 with auto-routing to `gemini-3.8-flash`; 1,048,576 input / 65,536 output, modalities, capability list, Live API not supported, "`minimal` is not supported and returns an error".
- https://deepmind.google/models/model-cards/gemini-3-7-flash/ — DeepMind Model Card: published 2026-08-13; knowledge cutoff March 2026 (certain domains January 2025), 1M in / 64K out, FrontierCode 1.1 43.6%, GDM-MRCR v2 (8-needle) @128k 97.0%, documented limitations (hallucinations, "occasional slowness or timeout issues", "we are continually working to improve jailbreak resistance").
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Gemini 3.5 Flash guide (family level, does not mention 3.7 Flash by name): "The default thinking effort is now `medium`, changed from `high` in Gemini 3 Flash Preview", conciseness guidance ("Be concise. Gemini 3.x responds best to direct, clear instructions."), verbosity and long-context rule, media_resolution levels, full unchanged history including thought signatures on `generateContent`, "Image segmentation is not supported in Gemini 3.x".
- https://ai.google.dev/gemini-api/docs/latest-model — Gemini 3.8 Flash guide: Migration checklist with `thinking_budget` → `thinking_level` and `\n\n` rule under "Audit function calling".
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingBudget` "accepted for backwards compatibility" in Gemini 3, default level per model (3.1 Pro `high`, 3 Flash `high`, 3.1 Flash-Lite `minimal`).
- https://ai.google.dev/gemini-api/docs/migrate-to-interactions — Interactions API as recommended interface ("we recommend the Interactions API for all new development"), `previous_interaction_id` and `store=true` semantics.
- https://ai.google.dev/gemini-api/docs/gemini-3 — Family guidance: temperature default 1.0, 400 error on `thinking_level` + `thinking_budget`, Gemini 2.5 migration points including `media_resolution_high` testing, structured outputs combinable with built-in tools, lack of image segmentation ("not supported in Gemini 3 Pro or Gemini 3 Flash").
- https://ai.google.dev/gemini-api/docs/changelog — 2026-08-13 GA of 3.7 Flash with introductory pricing until 2026-12-31; 2026-10-08 deprecation with automatic routing to `gemini-3.8-flash`; 2026-09-18 access restriction of 2.5 models to existing users.
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.7-flash` (release 2026-08-13), replacement `gemini-3.8-flash`, "the endpoint is not shutting down and automatically routes API requests to `gemini-3.8-flash`".

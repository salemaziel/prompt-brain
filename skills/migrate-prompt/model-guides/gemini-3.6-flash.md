---
model: gemini-3.6-flash
vendor: Google
family: Gemini
aliases: [gemini-3.6, gemini-3-6-flash, 3.6-flash, gemini-flash-3.6, gemini3.6flash, gemini-3.5-flash]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.8-flash
---

# Gemini 3.6 Flash

## Reasoning / Thinking
- Type: **dynamic thinking, on by default**. Controlled via the string enum `thinking_level` with `minimal | low | medium | high`, default **`medium`** (thinking table: "On (medium)"). Unlike `gemini-3.8-flash`, 3.6 Flash supports the `minimal` level.
- According to documentation, `minimal` corresponds to the "no thinking" setting for most requests, but does not guarantee thinking is turned off ("`minimal` does not guarantee that thinking is off"). There is no true zero-thinking path such as `thinkingBudget = 0` in Gemini 2.5 Flash.
- `thinking_budget` is deprecated: "Replace `thinking_budget` with `thinking_level`". Providing both parameters in the same request yields a 400 error. The levels are "relative allowances for thinking rather than strict token guarantees".
- `max_output_tokens` counts thought tokens and cuts off hard, even mid-reasoning. To reduce costs or latency, Google recommends lowering `thinking_level` rather than setting a small `max_output_tokens`.
- Thought Signatures preserve reasoning continuity across turns. In stateful operation (`store: true` + `previous_interaction_id`), the server manages them; in stateless operation, all `thought` blocks must be returned unchanged. Billing: "response pricing is the sum of output tokens and thinking tokens".

## Prompting Style
- **Concise and direct**: "Be concise. Gemini 3.x responds best to direct, clear instructions." Verbose prompt engineering techniques designed for older models can cause the model to "over-analyze" according to documentation; replace handcrafted CoT chains with `thinking_level`.
- **Request verbosity explicitly**: Gemini 3.x answers with low verbosity and directness by default; explicitly request a conversational tone in the prompt if desired.
- **Long context**: Place data first, with the specific question or instruction at the end, introduced by an anchor like "Based on the preceding information...".
- **No sampling controls**: `temperature`, `top_p`, and `top_k` are "deprecated and ignored"; future model generations will respond with HTTP 400. For higher determinism, Google recommends using a system instruction with explicit rules instead.
- **No Assistant prefill**: Ending a request with a non-empty `model` turn yields a 400 error. Enforce output formatting via `system_instruction` or Structured Outputs.
- **UI work**: Human evaluators preferred earlier models for visual layout and styling; Google advises compensating with "explicit design guidelines" in the prompt.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Fewer reasoning steps, turns, and tool calls than Gemini 3.5 according to Google, as well as reduced "execution loop spiraling"; code generation with fewer unwanted edits and debugging loops; better instruction following (fewer unintended file modifications during diagnostic tasks); strong multimodal and spatial reasoning (charts, blueprints, web layouts). The model page highlights code generation, agentic execution, and spatial reasoning as focus areas.
- Quirk "Upfront programmatic inspection": Executes diagnostic scripts prior to making changes more frequently than 3.5 Flash. This improves accuracy on complex tasks, but can introduce additional exploratory steps during routine frontend work. Google does not specify an official prompt-level mitigation.
- Model Card: "Workhorse model" with better token efficiency than 3.5 Flash, based on Gemini 3.5 Flash; applicable to agentic workflows, complex video reasoning, coding, enterprise workflows.
- Weaknesses: Usual hallucinations, jailbreak resistance still in progress, occasional slowness or timeouts, slight regression in tone of refusals compared to 3.5 Flash according to the Model Card. Knowledge cutoff **March 2026**, in some domains only up to January 2025 — provide time-sensitive facts in the prompt.
- Image segmentation (pixel masks) is not supported in Gemini 3.x according to Google.

## Output & Format Conventions
- 1,048,576 input tokens / 65,536 output tokens. Input: text, image, video, audio, PDF → output text only.
- Supported: Structured Outputs, Function Calling, Caching, Code Execution, Search Grounding, URL Context, File Search, Grounding with Google Maps, Computer Use (Preview), Batch, Flex, and Priority inference. **Not** supported: audio generation, image generation, Live API.
- Function Calling: Multimodal assets belong in the response payload, and inline instructions in function responses are formatted with `\n\n`. `Malformed_Function_Call` errors related to text preceding tool calls are a documented failure mode.
- Pricing per 1M tokens (Paid Tier): input $0.75 / output $3.75 through 2026-12-31, after 2027-01-01 $1.50 / $7.50; Batch $0.375 / $1.875 through 2026-12-31, thereafter $0.75 / $3.75 — same tier as `gemini-3.8-flash`.

## Migration Notes
- **Status caveat**: Google classifies 3.6 Flash as "Our previous-generation Flash model"; the latest Flash version is `gemini-3.8-flash`. 3.6 Flash is **not** deprecated, remains "available for production use", and no shutdown date is announced. Google explicitly mentions it as an alternative when the higher token consumption of 3.8 Flash is not needed ("Alternatively, Gemini 3.6 Flash remains supported"). Note when switching to 3.8 Flash: `minimal` throws an error there.
- **`gemini-3.5-flash` resolves to this guide**: 3.5 Flash has been deprecated since 2026-10-08; API requests are automatically routed to `gemini-3.6-flash`; Google designates 3.6 Flash as the "Direct replacement for `gemini-3.5-flash`". A prompt tuned for 3.5 Flash therefore already runs on 3.6 Flash; the `medium` default remains unchanged, requiring only updating the model string.
- **MIGRATING TO gemini-3.6-flash**: Swap model ID; remove `temperature`/`top_p`/`top_k`, `candidate_count`, and prefilled model turns; replace `thinking_budget` with `thinking_level` (checklist suggests `"medium"` or `"high"`); verify function calling (multimodal assets in response payload, inline instructions formatted with `\n\n`); preserve thought signatures or switch to `previous_interaction_id`; strip verbose prompt engineering remnants and CoT scaffolding; add explicit design guidelines for UI tasks. The selection table maps 3.6 Flash to workloads from Gemini 3.5 Flash, Gemini 3 Flash (Preview), and Gemini 3.1 Pro; the deprecation list lists it as the replacement for `gemini-3-flash-preview`. Do not migrate segmentation workloads here.
- **MIGRATING FROM gemini-3.6-flash**: Translate `thinking_level` to the target's control scheme (to 3.8 Flash: `minimal` → `low`, re-measure token consumption); remove `previous_interaction_id` and thought signature logic if unsupported by target; set sampling parameters only if required by the target guide; re-add verbose prompt scaffolding only if the target explicitly needs it.

## Sources
- https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash — Model page: ID `gemini-3.6-flash` (Stable), 1,048,576 input / 65,536 output, input text/image/video/audio/PDF → text, complete capability list including Computer Use (Preview) and unsupported features, focus areas "code generation, agentic execution, and spatial reasoning".
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — "What's new in Gemini 3.6 Flash and 3.5 Flash-Lite": "previous-generation releases … remain available for production use", default `medium`, token and turn reduction, code and instruction improvements, "Upfront programmatic inspection", UI styling note with "explicit design guidelines", sampling deprecation ("deprecated and ignored", HTTP 400 in future), prefill → 400 with `system_instruction`/Structured Outputs as replacement, migration checklist, selection table (3.5 Flash, 3 Flash Preview, 3.1 Pro).
- https://ai.google.dev/gemini-api/docs/thinking — Thinking table (`gemini-3.6-flash`: "On (medium)", `minimal, low, medium, high`), `max_output_tokens` inclusive of thought tokens, stateful vs. stateless thought signature handling, "response pricing is the sum of output tokens and thinking tokens".
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingLevel` table (3.6 Flash: `minimal` supported, `medium` default), "`minimal` does not guarantee that thinking is off", default level 3.6 Flash `medium`.
- https://ai.google.dev/gemini-api/docs/gemini-3 — Gemini 3 family: "relative allowances for thinking rather than strict token guarantees", 400 error on `thinking_level` + `thinking_budget` in the same request.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — Best practices for all Gemini 3.x ("Be concise…", low default verbosity, long-context rule with "Based on the preceding information..."), "Image segmentation is not supported in Gemini 3.x", 3.5 Flash deprecated and auto-routed to 3.6 Flash, 3.6 Flash as "Direct replacement for `gemini-3.5-flash`".
- https://ai.google.dev/gemini-api/docs/latest-model — Gemini 3.8 Flash guide: "can use more tokens on longer running and complex tasks, by design", "Alternatively, Gemini 3.6 Flash remains supported", `minimal` unsupported on 3.8 Flash.
- https://ai.google.dev/gemini-api/docs/models — Model list: Gemini 3.6 Flash "Our previous-generation Flash model" (Stable), Gemini 3.8 Flash as latest Flash version.
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-3.6-flash` (2026-07-21, no shutdown date announced); `gemini-3.5-flash` with auto-routing to `gemini-3.6-flash`; `gemini-3.6-flash` as recommended replacement for `gemini-3-flash-preview`.
- https://ai.google.dev/gemini-api/docs/changelog — 2026-07-21 GA of 3.6 Flash and deprecation of sampling parameters; 2026-10-08 deprecation of `gemini-3.5-flash` with automatic routing to `gemini-3.6-flash`.
- https://ai.google.dev/gemini-api/docs/pricing — Pricing tier 3.6 Flash: $0.75 / $3.75 through 2026-12-31, thereafter $1.50 / $7.50; Batch $0.375 / $1.875 → $0.75 / $3.75.
- https://deepmind.google/models/model-cards/gemini-3-6-flash/ — Model Card (2026-07-21): "workhorse model", token efficiency compared to 3.5 Flash, based on Gemini 3.5 Flash, target domains, limitations (hallucinations, jailbreaks, slowness/timeouts), knowledge cutoff March 2026 (partially January 2025), slight tone regression.

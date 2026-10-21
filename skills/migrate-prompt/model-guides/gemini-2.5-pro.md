---
model: gemini-2.5-pro
vendor: Google
family: Gemini
aliases: [gemini-2.5-pro-preview-06-05, gemini25pro, gemini-25-pro, gemini2.5pro]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.1-pro-preview
---

# Gemini 2.5 Pro

## Reasoning / Thinking
- **Type: always on (thinking model, cannot be disabled).** Gemini 2.5 Pro is a "thinking model"; thinking cannot be deactivated — the configuration table explicitly states "N/A: Cannot disable thinking". `thinkingBudget = 0` is not supported.
- **Depth control via `thinkingBudget`** (part of `generationConfig` / `thinkingConfig`): Value range for 2.5 Pro is **128 to 32,768 tokens**. The default is **dynamic thinking** (`thinkingBudget = -1`): the model automatically adjusts the effort to the complexity of the request. The budget is a guideline, not a hard limit. This applies to `generateContent` ("Gemini 2.5 series models don't support `thinkingLevel`; use `thinkingBudget` instead"); in the Interactions API, the thinking table lists gemini-2.5-pro with `thinking_level` "low, medium, high".
- **Thought summaries via `includeThoughts: true`**: Provides "thought summaries" — refined versions of internal reflections structured with headings and key details (including hints on tool usage). Accessed in the response via `parts` that carry the boolean field `thought`. Raw thoughts are not exposed.
- **Thought Signatures**: Encrypted representations of the internal reasoning process. On 2.5 Pro, they are returned when thinking is active and the request contains function calling with function declarations. When editing conversation history or using the REST API, signatures must be passed back manually to preserve reasoning context across multiple turns; the Google GenAI SDK handles this automatically.
- **Deep Think**: An extended reasoning mode that evaluates multiple hypotheses before responding (for highly complex math/coding cases); available separately according to the I/O 2025 announcement (Trusted Tester / Vertex AI; as of May 2025), not the standard API mode of 2.5 Pro.

## Prompting Style
- **Moderately prescriptive, instruction-following.** Google recommends "clear and specific instructions" as the foundation; formulate instructions as question/task/entity operations, avoiding vague requests.
- **Use System Instructions** for role, constraints, and output format; in the recommended prompt structure, the system instruction comes first, followed by context/background, then few-shot examples, then the specific task, and finally a clarifying instruction.
- **Few-shot examples are explicitly critical**: "always include few-shot examples … Prompts without few-shot examples are likely to be less effective." 2–5 varied, specific examples with **identical formatting** across all examples are recommended.
- **Structure via delimiters**: XML tags (e.g. `<context>`, `<task>`) or Markdown headings to separate prompt components; consistency is more important than the specific choice of format.
- **Very large context:** Input token limit **1,048,576 tokens** (≈1M). In long contexts, place large context blocks first and put the actual question at the end; use transition phrasing such as "Based on the information above…".
- **Known quirk (knowledge cutoff):** Since the cutoff is January 2025, Google recommends explicitly including the current date and cutoff in the system instruction for factual accuracy, emphasizing strict reliance on the provided context.
- Note: A warning against lowering the temperature below default in the documentation refers specifically to **Gemini 3.x**, not 2.5 Pro; transferability to 2.5 Pro is (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: "State-of-the-art thinking model" for complex reasoning in code, math, and STEM, as well as for analyzing large datasets, codebases, and documents over long contexts. Coding and agentic tasks are considered core use cases. Multimodal input (text, images, audio, video, PDF).
- Weaknesses: Thinking cannot be disabled → for very simple/latency-critical tasks, thinking tokens inevitably incur cost and latency; Flash/Flash-Lite is intended for such cases (unbelegt, derived from family positioning). No image/audio output (output is text-only); knowledge cutoff January 2025 → subsequent events must be provided via context/grounding.

## Output & Format Conventions
- **Output is strictly text** (no image/audio output). Output token limit **65,536 tokens**.
- **Structured outputs / JSON** are supported — demonstrate format best via examples rather than description alone; specify desired formatting via few-shot examples or completion-style prompts.
- State constraints explicitly: length limits ("summarize in one sentence"), format (table, list, JSON), scope, and what **not** to do.
- Supported features include: Function Calling, Code Execution, Structured Outputs, Caching, Batch API, Search Grounding, URL Context, File Search.

## Migration Notes
- **Successor caveat:** The `successor` `gemini-3.1-pro-preview` specified in the frontmatter is a **preview model** (according to the deprecation table, the replacement for the 2.5 Pro preview snapshots with a shutdown date of 2025-12-02); a GA ID of the form `gemini-3.1-pro` does not exist (404 on the model page). Gemini 2.5 Pro is therefore the only stable Pro model as of 2026-10-13 — the successor is the documented path forward, but not a stable production migration target. Furthermore, according to family documentation, Gemini 3 Pro does not support image segmentation (not specifically mentioned by name for 3.1 Pro, transferability (unbelegt)) — do not migrate segmentation workloads to the successor.
- **Access restricted since 2026-09-18:** Google limits access to 2.5 models to users who have actively used them in the past ("limiting access to the 2.5 models to users who have actively used them in the past"); according to Google, the models are not deprecated and will continue to be served "until further notice" (no shutdown date). For new projects, Google specifies "3.5 Flash-Lite or 3.8 Flash" — users who have not previously used 2.5 Pro can no longer select it as a target; in that case, refer to this recommendation or the preview `gemini-3.1-pro-preview`.
- **MIGRATING FROM gemini-2.5-pro** (e.g. to Gemini 3.x): Check model-specific prompt guidelines — for Gemini 3.x, Google explicitly warns against lowering the temperature below default. Thinking controls may differ across generations (re-verify parameters/defaults). Verify higher output limits and cutoff dates of target models.
- **MIGRATING TO gemini-2.5-pro** (e.g. from a non-thinking model): Expect **dynamic thinking** to be active by default and thinking cannot be disabled — account for cost/latency from thinking tokens or set `thinkingBudget` (128–32,768). Pay attention to **thought signatures** in function calling and pass them back via REST / custom history management. Add few-shot examples for format fidelity; leverage large context (up to ~1M tokens), placing the question at the end. Account for January 2025 knowledge cutoff (provide current date / grounding in system instructions).

## Sources
- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro — Model code, input limit 1,048,576, output limit 65,536, knowledge cutoff January 2025, inputs (audio/image/video/text/PDF), output text, supported features, positioning as thinking model.
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — Thinking cannot be disabled on 2.5 Pro ("N/A: Cannot disable thinking"), `thinkingBudget` 128–32,768, default dynamic (-1), "Gemini 2.5 series models don't support `thinkingLevel`", `includeThoughts`/thought summaries, thought signatures in function calling.
- https://ai.google.dev/gemini-api/docs/thinking — Interactions API: Thinking table lists gemini-2.5-pro with default "On" and `thinking_level` "low, medium, high".
- https://ai.google.dev/gemini-api/docs/changelog — Entry 2026-09-18: Access to 2.5 models restricted to existing users, not deprecated, for new projects 3.5 Flash-Lite or 3.8 Flash.
- https://ai.google.dev/gemini-api/docs/deprecations — `gemini-2.5-pro` without shutdown date; `gemini-3.1-pro-preview` as replacement for 2.5 Pro preview snapshots (03-25 / 05-06 / 06-05).
- https://ai.google.dev/gemini-api/docs/gemini-3 — Gemini 3 family documentation (deprecated according to banner, still accessible as of 2026-10-13): Image segmentation "not supported in Gemini 3 Pro or Gemini 3 Flash".
- https://ai.google.dev/gemini-api/docs/prompting-strategies — Prompt design: clear instructions, few-shot requirement, delimiters/structure, prompt layout, long context (question at end), date/cutoff in system instruction, Gemini 3.x temperature warning.
- https://developers.googleblog.com/en/gemini-2-5-thinking-model-updates/ — Thinking budget control as family feature, coding/agentic tasks as core use case, 06-05 stable.
- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-updates-io-2025/ — Deep Think mode (multiple hypotheses), GA positioning of 2.5 Pro.

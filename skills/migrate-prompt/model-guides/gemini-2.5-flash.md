---
model: gemini-2.5-flash
vendor: Google
family: Gemini
aliases: [gemini25flash, gemini-25-flash, gemini2.5flash]
last_verified: 2026-10-13
status: legacy
successor: gemini-3.8-flash
---

# Gemini 2.5 Flash

## Reasoning / Thinking
- Type: **adaptive / toggleable**. Gemini 2.5 Flash is the first Flash model with thinking capability; by default, "Dynamic Thinking" runs (the model decides the thinking depth itself depending on the perceived task complexity).
- Control on the `generateContent` API via the `thinkingBudget` parameter (tokens). Valid range for 2.5 Flash: **0 to 24576**. The rule states: "Gemini 2.5 series models don't support `thinkingLevel`; use `thinkingBudget` instead". In the Interactions API, the thinking table lists `gemini-2.5-flash` with `thinking_level` `low, medium, high` (default: "On").
  - `thinkingBudget = 0` → **Thinking completely disabled** (no thought content).
  - `thinkingBudget = -1` → **Dynamic Thinking** (model adjusts the budget to complexity itself).
  - Positive integer → fixed budget; higher values allow deeper reasoning for complex tasks.
  - Default (parameter not set) → Dynamic Thinking.
- Difference from **Gemini 2.5 Pro**: Pro range is **128 to 32768** and thinking **cannot be disabled on Pro**; 2.5 Flash can run completely without thinking via budget 0. Pro is intended for highest intelligence/complex reasoning, Flash for price-performance on low-latency/high-volume tasks.
- Billing: Thinking tokens are counted in billing — "response pricing is the sum of output tokens and thinking tokens". Thought summaries are available in free and paid tiers.

## Prompting Style
- Moderately prescriptive, but structure- and context-sensitive: Google recommends **clear, specific instructions** with defined input type, constraints (length/scope boundaries), output format, and necessary context directly in the prompt.
- **System instructions** serve for role/persona, output format, tonality, and constraints; XML tags like `<role>`, `<constraints>`, `<task>` are recommended as structuring aids.
- **Few-shot examples**: "We recommend to always include few-shot examples in your prompts." Examples should be specific, varied, and consistently formatted; overloading with examples reduces effectiveness (risk of overfitting).
- Break down complex tasks via separate instructions, chaining (output → next step), or aggregation (parallel sub-operations).
- **Cost/latency focus**: For simple tasks (fact retrieval, classification), thinking is not needed — `thinkingBudget = 0` keeps cost and latency minimal. If long outputs are desired, thinking depth should be bounded via prompt to reserve more tokens for the response.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Best price-performance ratio for low-latency, high-volume, and agentic tasks with reasoning; 1,048,576 tokens context window (long context: place all context first, question at the end); structured output and function calling supported; thinking optionally toggleable.
- Weaknesses: For highest intelligence/complex reasoning, 2.5 Pro is superior. With active thinking, costs and latency increase (thinking tokens count towards billing). Community forum reports exist regarding unenforced `max_output_tokens` or token repetitions with structured output — (unbelegt).

## Output & Format Conventions
- Supported inputs: **text, images, video, audio** (context window 1,048,576 tokens). Output: **text** (max **65,536** output tokens).
- Format control: natural language format specifications, completion strategy (providing partial output), **structured output** (JSON Schema), and delimiters via XML tags / Markdown headers. Function calling is supported.
- Knowledge cutoff: **January 2025**.

## Migration Notes
- **Status caveat**: Since 2026-09-18, 2.5 models (including 2.5 Flash-Lite) are only accessible to existing users who previously used them actively; they are **not** deprecated, no shutdown date is announced. For new projects, Google specifies "3.5 Flash-Lite or 3.8 Flash".
- **Successor caveat (`gemini-3.8-flash`)**: No zero-thinking path — `thinkingBudget = 0` has no equivalent there, lower bound `thinking_level: low` (`minimal` throws an error); image segmentation (pixel masks) is not supported in Gemini 3.x according to Google — do not migrate segmentation workloads to the successor (Google continues to recommend 2.5 Flash with thinking disabled for this); `temperature`/`top_p`/`top_k` must be removed there.
- **MIGRATING FROM gemini-2.5-flash** (e.g. to 2.5 Pro or Gemini 3.x): On 2.5 Pro, thinking **can no longer be disabled** (minimum budget 128, range up to 32768); suitable for complex reasoning/coding/agentic workloads, but higher cost/latency. Re-verify output limits and behavior. On Gemini 3.x, Google recommends replacing CoT prompt engineering with `thinking_level` and simplified prompts, and removing an explicitly set low temperature.
- **MIGRATING TO gemini-2.5-flash**: Switch from older previews to the stable alias `gemini-2.5-flash` — only possible if the project belongs to existing users. When migrating from 2.0 Flash: thinking is new; for identical cost/latency as 2.0, set `thinkingBudget = 0` if needed. For pure cost reduction, 2.5 Flash-Lite is likewise only accessible to existing users; for new projects, Google specifies "3.5 Flash-Lite or 3.8 Flash", with `gemini-3.5-flash-lite` explicitly as a "Strong migration path from Gemini 2.5 Flash".

## Sources
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — `thinkingBudget` table: 2.5 Flash 0–24576, 0 disables thinking, -1 = Dynamic Thinking, default Dynamic; 2.5 Pro 128–32768 and cannot be disabled; "Gemini 2.5 series models don't support `thinkingLevel`; use `thinkingBudget` instead"; thinking tokens in billing; thought summaries in free and paid tier.
- https://ai.google.dev/gemini-api/docs/thinking — Interactions API thinking table: `gemini-2.5-flash` "On", `thinking_level` `low, medium, high`; `gemini-3.8-flash` without `minimal`.
- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash — Model ID, context window 1,048,576, output limit 65,536, inputs text/image/video/audio, knowledge cutoff January 2025, structured output and function calling supported; note on access restriction to existing users ("not deprecated", "For any new projects, use our latest models: 3.5 Flash-Lite or 3.8 Flash").
- https://ai.google.dev/gemini-api/docs/changelog — 2026-09-18: Access to 2.5 models restricted to users who previously used them actively; not deprecated.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — 3.5 Flash-Lite as "Strong migration path from Gemini 2.5 Flash"; sampling parameters from 3.6 Flash onwards "deprecated and ignored".
- https://ai.google.dev/gemini-api/docs/gemini-3 — Gemini 3 migration from 2.5: Replace CoT with `thinking_level`, remove explicit temperature, image segmentation "not supported in Gemini 3 Pro or Gemini 3 Flash" with recommendation to continue using 2.5 Flash with thinking disabled.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5 — "Image segmentation is not supported in Gemini 3.x. For segmentation workloads, continue using Gemini 2.5 Flash with thinking off."
- https://ai.google.dev/gemini-api/docs/prompting-strategies — Prompting style: clear/specific instructions, system instructions with XML tags, few-shot recommendation, task decomposition, output format control, long-context ordering.
- https://developers.googleblog.com/en/start-building-with-gemini-25-flash/ — Budget 0 for lowest cost/latency vs. 2.0 Flash; simple tasks without thinking; long outputs by bounding thinking depth.
- https://developers.googleblog.com/en/gemini-2-5-thinking-model-updates/ — GA status, new pricing structure (unified tier), migration path to `gemini-2.5-flash`/Flash-Lite, Pro for highest intelligence.

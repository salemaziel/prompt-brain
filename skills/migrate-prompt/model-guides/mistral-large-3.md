---
model: mistral-large-3
vendor: Mistral AI
family: Mistral
aliases: [mistral-large, mistral-large-latest, mistral-large-2512, large-3, large3, Mistral-Large-3-675B-Instruct-2512]
last_verified: 2026-10-13
status: current
---

# Mistral Large 3

## Reasoning / Thinking
- Type: **no reasoning mode**. The vendor card literally states under "Limitations": "Not a dedicated reasoning model"; the documentation model card lists neither a `reasoning_effort` nor a thinking parameter. The announcement of December 2, 2025, anticipated a reasoning version ("A reasoning version is coming soon!") — it is not included in this model. Since 2026-10-06, Mistral Large 4 (Public Preview) is available with `reasoning_effort`; Large 3 itself remains without reasoning features according to its model card.
- Depth therefore comes **exclusively from the prompt**: explicit step-by-step / Chain-of-Thought in the system or user prompt. There is no parameter slider to dial up.
- Risk of confusion within the same vendor: according to the reasoning documentation, **Mistral Medium 3.5** (`mistral-medium-3-5`), **Mistral Small 4** (`mistral-small-latest`), and **Mistral Large 4** (`mistral-large-4-0`) support "adjustable reasoning via the `reasoning_effort` parameter" — Large 3 does not. A prompt relying on `reasoning_effort` does not originate from Large 3; from the Large series, only Large 4 qualifies.
- Instead of a reasoning control, sampling is controlled: "Use a temperature below 0.1 for daily-driver and production environments"; higher temperatures only for creative cases.

## Prompting Style
- **System prompt is the primary control surface:** "Define a clear environment and use case, including guidance on how to effectively leverage tools in agentic systems."
- Role-first framing from official prompting docs: "You are a <role>, your task is to <task>." Structure instructions hierarchically into sections/subsections and write as if "you're writing for someone with no prior context".
- Structure via **Markdown and/or XML-like tags** (justified by "Readable", "Parsable", "Familiar"). Few-shot either as an "Examples" section or as artificial user/assistant turns. System = general context, User = context of current interaction; without a system role, concatenate both into the user turn.
- **Keep tools concise:** "limit their number to the minimum required for the use case", "Avoiding overloading the model with an excessive number of tools."
- Images: keep aspect ratio close to **1:1**, crop very narrow or very wide images beforehand.
- Documented anti-patterns: vague quantitative adjectives ("too long", "too short", "many", "few") and fuzzy words ("things", "stuff", "interesting", "better"), contradictory instructions (use decision trees instead), asking the model to count (provide character/token counts as input), unnecessary output tokens, numeric 1–5 scales (use worded scales like "Very Good", "Neutral" instead).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - "state-of-the-art, open-weight, general-purpose multimodal model" under Apache 2.0; according to the announcement of December 2, 2025, then "our most capable model to date" and "one of the best permissive open weight models in the world", with image understanding and "best-in-class performance on multilingual conversations" across "40+ native languages". The vendor-provided optimized checkpoint runs on a single 8×A100 or 8×H100 node via vLLM according to the announcement. Low-cost for its class: $0.5/M input, $1.5/M output.
  - Architecture: granular MoE with 675B total and 41B active parameters (673B/39B language model + 2.5B vision encoder).
- Weaknesses:
  - "Not a dedicated reasoning model" and "Behind vision-first models in multimodal tasks"; the very low recommended temperature (<0.1) forces recalibration of creative setups.
  - Upgrade path pitfall: Mistral's own legacy table directs **Mistral Large 2.1 (`mistral-large-2411`) to Mistral Medium 3.5**, not to Large 3 (deprecation 2/27/2026, retirement 5/31/2026). Only Large 2.0 (`mistral-large-2407`) and Large 1.0 (`mistral-large-2402`) point to Large 3.

## Output & Format Conventions
- **256k context window** (documentation model card and vendor card are consistent). A **maximum output token limit is not officially documented (unbelegt)**; the only value shown by the vendor is `max_tokens = 262144` (constant `MAX_TOK`) in the vendor card sample code.
- Supported features according to the model card: Function Calling, Structured Outputs, Chat Completions (`/v1/chat/completions`), Document QnA, Prefix (assistant prefill), Batching, Agents & Conversations, Built-In Tools.
- Multimodal input (text + image) is supported; enforce format adherence via Structured Outputs or prefix prefill rather than prose requests.
- Production API ID: `mistral-large-2512`; according to the model card, `mistral-large-latest` currently aliases to it (as of 2026-10-13) — even after the preview launch of Large 4. According to lifecycle documentation, `-latest` points to the "Latest version, across generations" and can change silently — pin `mistral-large-2512` for reproducible prompts.

## Migration Notes
- **MIGRATING FROM mistral-large-3**:
  - Remove image content parts for text-only targets; re-plan prompt budget if the target context is below 256k; recalibrate temperature upward (most targets assume defaults significantly above 0.1); replace Mistral specifics such as prefix prefill, built-in tools, and `/v1/conversations` with target equivalents; the Apache 2.0 self-hosting path no longer applies for closed-weight targets.
- **MIGRATING FROM mistral-large-3 to mistral-large-4** (Public Preview, `mistral-large-4-0`):
  - Explicitly set `reasoning_effort` — the default for Large 4 is not documented (unbelegt) — and inspect hand-written Chain-of-Thought when set to `"high"`; parse `message.content` as a list of `ThinkChunk`/`TextChunk` and replay `ThinkChunk` across all turns; context expands from 256k to 1M; the `temperature` < 0.1 rule is not documented for Large 4 (unbelegt). `mistral-large-latest` does not reach Large 4 — set the ID explicitly. Large 3 is not deprecated according to `/models`; the vendor documents no deprecation by Large 4.
- **MIGRATING TO mistral-large-3**:
  - Set model ID to `mistral-large-2512` (the vendor's designated upgrade path from `mistral-large-2407`/`mistral-large-2402`); context grows to 256k, chunking/RAG splitting can be relaxed accordingly; external OCR/vision preprocessing can be omitted, pass images directly as content parts with ~1:1 aspect ratio; lower temperature for production to <0.1; move environment, use-case, and tool instructions into the system prompt and reduce tool count; do **not** add thinking/reasoning parameters or "reasoning effort" phrasing — use explicit Chain-of-Thought prompting instead; remove legacy `[INST]` manual templating from the Large 2 era and use standard chat messages via the API (which chat template Large 3 expects when self-hosted is not documented here (unbelegt) — use the tokenizer/template from the official repo).

## Sources
- https://docs.mistral.ai/models/mistral-large-3-25-12 — Official model card: API names `mistral-large-2512` and `mistral-large-latest`, GA, v25.12, December 2, 2025, Apache 2.0, 256k context, 41B active / 675B total, $0.5/M in and $1.5/M out, feature list; no reasoning parameter, no max output specification.
- https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512 — Official vendor card: temperature <0.1, system prompt and tool count guidance, 1:1 image aspect ratio, 256k context, `max_tokens=262144` in sample code, MoE 673B/39B + 2.5B vision encoder, limitations "Not a dedicated reasoning model" / "Behind vision-first models in multimodal tasks".
- https://docs.mistral.ai/studio/conversations/chat-completion/prompting — Official prompting guidance: role framing, hierarchical structure, Markdown/XML tags, few-shot, system vs. user split, anti-pattern list.
- https://docs.mistral.ai/models — Current lineup (Large 3, Apache 2.0, v25.12, "open-weight, general-purpose multimodal"; Large 3 not in deprecated table, Large 4 as featured) and legacy table: 2407/2402 → Large 3, 2411 → Medium 3.5 (2/27/2026, 5/31/2026).
- https://docs.mistral.ai/resources/changelogs — Release entry "We released Mistral Large 3 (`mistral-large-2512`)" and the 2026-10-06 entry on Mistral Large 4 (`mistral-large-4`) in Public Preview.
- https://mistral.ai/news/mistral-3/ — Announcement of December 2, 2025: "most capable model to date", 40+ languages, image understanding, Apache 2.0, 8×A100/8×H100 via vLLM, "A reasoning version is coming soon!".
- https://docs.mistral.ai/studio/conversations/reasoning — Reasoning docs: `reasoning_effort` for `mistral-small-latest`, `mistral-medium-3-5`, and `mistral-large-4-0`; Large 3 not listed; `ThinkChunk`/`TextChunk` response structure and replay rule.
- https://docs.mistral.ai/models/mistral-large-4-0 — Model card Mistral Large 4: Public Preview since 2026-10-06, API names `mistral-large-4` / `mistral-large-4-0`, 1M context.
- https://docs.mistral.ai/inference/model-lifecycle — Alias levels (`-latest` = "Latest version, across generations") and warning about silent alias updates.

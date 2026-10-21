---
model: mistral-large-2
vendor: Mistral AI
family: Mistral
aliases: [mistral-large-2407, mistral-large-2.0]
last_verified: 2026-10-13
status: legacy
successor: mistral-large-3
---

# Mistral Large 2

## Reasoning / Thinking
- Type: **none** (no dedicated reasoning/thinking model). Mistral Large 2 (mistral-large-2407) is a classical instruct model without a separate "extended thinking" mode, without visible/hidden reasoning tokens, and without adaptive thinking budgets.
- Step-by-step thinking is triggered classically via prompt: explicitly request Chain-of-Thought (e.g., "Think step by step", "Justify first, answer at the end"). Mistral generally recommends clearly structuring instructions and, if appropriate, providing few-shot examples with the desired reasoning path.
- The model was specifically trained for **stronger mathematical and logical reasoning** as well as code — however, this is training quality, not a distinct reasoning mode.
- Hallucination behavior: The model was "fine-tuned to be more cautious and discerning" and trained to acknowledge "when it cannot find solutions or does not have sufficient information".

## Prompting Style
- **Prescriptiveness / System Prompt Adherence:** Mistral explicitly highlights "drastically improved instruction-following and conversational capabilities", with particular strength in "following precise instructions and handling long multi-turn conversations".
- **Recommended Prompt Structure (official):** Define the role first ("You are a <role>, your task is…"), structure instructions hierarchically into clear sections/subsections, formulate them completely ("as if the reader has no prior knowledge"). **Markdown or XML-like tags** are recommended as markup.
- **System vs. User Prompt:** The `system` prompt provides foundational context and behavioral rules, while the `user` prompt contains the task-specific instruction. If no system role is available, instructions can be concatenated directly into the user message.
- **Official Prompt Format / [INST] Convention:** Mistral Large 2 uses **Tokenizer V3**. The documented raw template is:
  `<s>[INST] user message[/INST] assistant message</s>[INST] new user message[/INST]`
  — with `<s>`/`</s>` as BOS/EOS, `[INST]`/`[/INST]` as control tokens, and a single space after each `[INST]` and `[/INST]`. The **system prompt is prepended to the last user message by default** (followed by two line breaks). Via the API / `mistral_common`, this format is generated automatically — manual templating is only necessary for self-hosting.
- **Known Quirks:** Mistral warns against using subjective terms without definition, introducing contradictions in long prompts (decision trees are better), having the model count tokens, or using purely numeric scales (worded scales perform better).
- **Tool Use / Function Calling:** Improved function calling, including **parallel and sequential** function calls. Via the API, `tools` and the `tool_choice` parameter are supported (`tool_choice="any"` forces a call); parallel calls may return in arbitrary order.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Very strong, precise **instruction following** and stable **long multi-turn conversations**.
  - **Code (80+ languages)** and **mathematics/reasoning** at a high level.
  - **Multilingual** (including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, Korean).
  - **Large context window: 128k tokens.**
  - **Reliable function calling** (parallel + sequential).
  - **Trained for conciseness** — follows brevity requirements well.
- Weaknesses:
  - No native reasoning mode — complex multi-step logic must be triggered via CoT / prompt structuring (unbelegt whether this matches current dedicated reasoning models).
  - Like all LLMs, prone to errors on counting/token-based tasks; Mistral explicitly advises against this.
  - Contradictory or long unstructured prompts degrade adherence — a clear hierarchy is necessary.

## Output & Format Conventions
- **Conciseness as a Design Goal:** Mistral emphasizes "conciseness is paramount". Outputs tend to be concise; explicitly request detailed answers if needed.
- **Structured Outputs / JSON:** For machine-readable outputs, Mistral recommends JSON output and provides a **Structured Outputs** feature to enforce consistent JSON schemas.
- **Formatting Standards:** Markdown or XML-like tags for structuring inputs and outputs are officially recommended.
- **Few-Shot:** Example dialogues (alternating user/assistant messages) improve formatting and behavioral adherence.
- Vision / Multimodality: **not** listed as a capability in the model card for mistral-large-2407 (text model).

## Migration Notes
- **MIGRATING FROM mistral-large-2 (2407)**:
  - The vendor replacement according to the model card and legacy table is **Mistral Large 3 (`mistral-large-2512`)**; `mistral-large-latest` no longer points to 2407. For reproducibility, pin `mistral-large-2512` instead of `-latest` (which, according to lifecycle documentation, can change silently across generations). The intermediate version Large 2.1 (`mistral-large-2411`) is itself superseded: deprecation 2026-02-27, retirement date 2026-05-31, replacement according to the model card is Mistral Medium 3.5. `mistral-large-2407` has been retired since **2025-03-30**; according to lifecycle documentation, requests to retired IDs fail with 404 — pinning to 2407 no longer works.
  - When switching to a **dedicated reasoning model**, remove explicit CoT instructions if necessary (unbelegt).
- **MIGRATING TO mistral-large-2**:
  - 2407 is no longer available via the Mistral API since 2025-03-30 (requests return 404); the model card continues to link the weights (MRL license).
  - Mind the **[INST] format / Tokenizer V3** if self-hosting: the system prompt is prepended to the last user message; when using the API, `mistral_common` handles this automatically.
  - Convert function calling to the Mistral schema (`tools` + `tool_choice`, parallel calls possible, order not guaranteed).
  - Since the model is trained for **conciseness**: if verbose responses were expected from the previous model, explicitly request output length if needed.
  - Restructure prompts to use **clear hierarchy + Markdown/XML tags**.
  - The 128k context allows simplifying RAG/chunking strategies.

## Sources
- https://mistral.ai/news/mistral-large-2407/ — Official announcement "Large Enough": 123B parameters, 128k context, natural and code languages, improved instruction following & multi-turn, function calling (parallel/sequential), conciseness design goal, hallucination reduction.
- https://docs.mistral.ai/models/mistral-large-2-0-24-07 — Official model card: API ID `mistral-large-2407`, 128k context, 123B parameters, retirement date 2025-03-30, replacement Mistral Large 3, weights linked under MRL, no vision capability.
- https://docs.mistral.ai/studio/conversations/chat-completion/prompting — Official prompting recommendations: role definition, hierarchy, system vs. user prompt, Markdown/XML tags, few-shot, JSON/structured outputs, anti-patterns.
- https://docs.mistral.ai/resources/cookbooks/concept-deep-dive-tokenization-chat_templates — Tokenizer V3 chat template: `[INST]/[/INST]` convention, `<s>`/`</s>`, system prompt placement.
- https://docs.mistral.ai/resources/changelogs — Changelog: release 2024-07-24, alias `mistral-large-latest`, successor `mistral-large-2411`.
- https://docs.mistral.ai/models — Legacy table: 2407 → Mistral Large 3 (deprecation 2024-11-30, retirement 2025-03-30), 2411 → Mistral Medium 3.5 (deprecation 2026-02-27, retirement 2026-05-31).
- https://docs.mistral.ai/models/mistral-large-2-1-24-11 — Model card Large 2.1: "Use Mistral Medium 3.5 for new integrations".
- https://docs.mistral.ai/inference/model-lifecycle — Retired IDs return 404; `-latest` points cross-generationally to the newest version and can change silently.
- https://docs.mistral.ai/resources/cookbooks/mistral-function_calling-function_calling — Function calling details: `tool_choice` (including `"any"`), parallel tool calls.

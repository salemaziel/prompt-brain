---
model: mistral-large-4
vendor: Mistral AI
family: Mistral
aliases: [mistral-large-4-0, large-4, large4, Mistral-Large-4-1T-A52B]
last_verified: 2026-10-13
status: current
---

# Mistral Large 4

## Reasoning / Thinking
- Type: **hybrid instruct-and-reasoning model**, according to the announcement "unifies instruction, reasoning, and agentic capabilities in a single model". Reasoning is controlled **per request** via `reasoning_effort`; the reasoning documentation lists `mistral-large-4-0` with "No extra configuration required — just add the parameter to any chat completion request."
- Semantics for Mistral models according to reasoning documentation: `"high"` produces a full thinking chunk before the response (more tokens), `"none"` thinks minimally and omits the thinking chunk. The usage example in the model card sets `reasoning_effort="high"`.
- **Default value for Large 4 is not documented (unbelegt)**, nor is it documented whether Large 4 accepts values other than `"none"`/`"high"` (unbelegt). Therefore, always set the parameter explicitly rather than relying on a default.
- Multi-turn requirement: replay the complete assistant message **including `ThinkChunk`** back into history. Documentation warning: "Do not strip ThinkChunk from assistant messages before replaying them. … Stripping them increases token efficiency but significantly degrades output quality."
- `reasoning_effort` also applies to the Agents and Conversations endpoints, located in the `completion_args` field.
- Mistral does not publish a sampling recommendation (temperature/top_p) for Large 4 (unbelegt).

## Prompting Style
- **Large 4-specific prompting guidance does not exist (unbelegt)**; Mistral's cross-model prompting documentation applies.
- Role-first framing: "You are a <role>, your task is to <task>." Structure instructions hierarchically into sections and subsections, fully formulated and as if the reader has no prior knowledge.
- Structure via **Markdown and/or XML-like tags** (documentation rationale: readable, parsable, familiar from training). Few-shot as an examples section in the prompt or as prepended user/assistant turns. System prompt = general context and behavior, user prompt = context of the current interaction; without control over the system prompt, prepend general instructions to the user message.
- Documented anti-patterns: imprecise quantifiers and vague words ("too long", "make it better"), contradictions in long system prompts (use decision trees instead), asking the model to count words/characters (pass counts as input), numeric rating scales (use worded scales instead), unnecessary output.
- Agentic prompts: according to the announcement, the model powers "general-purpose agents that gather information, use tools, and produce finished deliverables"; Mistral describes robustness against indirect prompt injection as saturated on internal benchmarks. A recommendation on tool count or image aspect ratio (such as ~1:1 for Large 3) does not exist for Large 4 (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Size: The model card states **52B active / 1.05T total parameters plus 1.6B vision encoder** (granular MoE); the announcement rounds to "1 trillion-parameter … with 52 billion active parameters". In case of discrepancies, the model card takes precedence.
- Strengths:
  - Strengths according to vendor: agentic coding (61.7% DeepSWE v1.1, 59.4% SWE-Atlas-QnA, 28.3% Terminal-Bench 4), cybersecurity, financial, legal, and scientific workflows; launch blurb "state-of-the-art among open weights on cybersecurity, finance, and manufacturing". Natively multimodal (text + image input).
  - Multilingual: training data from "more than 160 languages, including every official language of the European Union".
- Weaknesses:
  - Vendor-identified weakness: average refusal rate on cyber prompts (JailbreakBench, StrongREJECT, AgentHarm) "is higher than all OSS models". The extent to which this impacts legitimate security prompts is not quantified (unbelegt).
  - **Public Preview**: according to the announcement, the RL training run is still ongoing and the model "continues to improve rapidly"; according to lifecycle documentation, preview models receive silent updates and "may be retired before reaching" GA (deprecation notice period for preview: 1 month). Prompt behavior can therefore change without an ID change.
  - Open weights are announced ("Weights drop end of this month"); the model card links repository `Mistral-Large-4-1T-A52B` as "Coming soon" and lists no license (unbelegt).

## Output & Format Conventions
- **1M context window** (model card, changelog). Maximum output token limit and knowledge cutoff are not documented (unbelegt).
- Official API names according to model card: `mistral-large-4` and `mistral-large-4-0`. Under the lifecycle schema, `-major` represents the latest minor version of the generation and `-major-minor` is fixed. `mistral-large-latest` continues to point to `mistral-large-2512` (Large 3) according to the Large 3 model card, **not** to Large 4.
- Features according to model card: Structured Outputs, Function Calling, Document QnA, Prefix (assistant prefill), Chat Completions, Batching, Agents & Conversations, Built-In Tools — **without Predicted Outputs**.
- Response format depends on mode: with `"high"`, `message.content` is a list of `ThinkChunk` (`type: "thinking"`) and `TextChunk` (`type: "text"`), with `"none"` a plain string. In streaming, `delta.content` is initially a list (thinking), then a transition chunk with a closing `ThinkChunk` and first `TextChunk`, thereafter a plain string.
- For format adherence, Structured Outputs and prefix prefill are available according to the feature list.

## Migration Notes
- **MIGRATING TO mistral-large-4 (especially from Large 3)**:
  - Set model ID to `mistral-large-4-0`; `mistral-large-latest` does not reach Large 4. Set `reasoning_effort` **explicitly** (default unbelegt). With `"high"`, the `ThinkChunk` captures reasoning — handwritten Chain-of-Thought scaffolding from Large 3 prompts becomes redundant and consumes output tokens; whether it hurts performance is (unbelegt). Update response parsing to handle the chunk list and carry `ThinkChunk` forward across all turns. Context expands from 256k to 1M, allowing chunking/RAG splitting to be relaxed. The Large 3 rules (`temperature` < 0.1 and images ~1:1) are not documented for Large 4 (unbelegt) — recalibrate instead of adopting blindly. The Large 4 card does not list Predicted Outputs — adjust pipelines relying on this feature.
  - Recalculate costs: list price $1.36 input / $0.14 cached / $4.18 output per 1M tokens compared to $0.5 / $1.5 for Large 3, plus reasoning tokens with `"high"`. The launch discount ("50% off for 2 weeks" from 2026-10-06) is temporary.
  - **Preview Caveat**: Pinning to `mistral-large-4-0` protects against generational upgrades, but not against silent preview updates; re-evaluate prompts after updates. Large 3 is neither deprecated nor marked with a replacement according to `/models` — the vendor documents no replacement of Large 3 by Large 4.
- **MIGRATING FROM mistral-large-4**:
  - Remove `reasoning_effort` (including in `completion_args`) and all `ThinkChunk` handling; targets without a reasoning parameter will need explicit step-by-step scaffolding reintroduced in the prompt. Revert response parsing back to a plain string. Replace Mistral-specific features: prefix prefill, built-in tools, `/v1/conversations`. Re-plan context budgets for targets below 1M; remove image content parts for text-only targets.

## Sources
- https://docs.mistral.ai/models/mistral-large-4-0 — Official model card: October 6, 2026, Public Preview, v26.10, API names `mistral-large-4` / `mistral-large-4-0`, 52B active / 1.05T total + 1.6B vision encoder, 1M context, $1.36 / $0.14 / $4.18 (sale $0.68 / $0.07 / $2.09), feature list without Predicted Outputs, usage example with `reasoning_effort="high"`, weights link `Mistral-Large-4-1T-A52B` "Coming soon", no license specified.
- https://docs.mistral.ai/studio/conversations/reasoning — `mistral-large-4-0` with `reasoning_effort` without additional configuration, semantics of `"high"`/`"none"`, `ThinkChunk`/`TextChunk` response structure, streaming progression, multi-turn replay warning, `completion_args` on Agents/Conversations; no default value for Large 4.
- https://mistral.ai/news/mistral-large-4/ — Announcement (2026-10-06): Public Preview, "1 trillion-parameter … 52 billion active", hybrid instruct-and-reasoning, coding benchmarks, agentic capabilities, launch blurb (cybersecurity/finance/manufacturing), prompt injection robustness, cyber refusal rate, 160+ languages, weights by end of month, ongoing RL training, $1.36 / $4.18.
- https://docs.mistral.ai/resources/changelogs — Entry from 2026-10-06: "Mistral Large 4 (`mistral-large-4`) is now available in Public Preview", 1M context, "Open weights are coming soon", "50% off for 2 weeks".
- https://docs.mistral.ai/inference/model-lifecycle — Alias levels (`-latest`, `-major`, `-major-minor`), warning about silent alias updates, Public Preview with silent updates and possible retirement before GA, deprecation timelines.
- https://docs.mistral.ai/studio/conversations/chat-completion/prompting — Cross-model prompting guidance: role framing, hierarchy, Markdown/XML tags, few-shot, system vs. user split, anti-pattern list; mentions no specific model.
- https://docs.mistral.ai/models/mistral-large-3-25-12 — Cross-check: API names `mistral-large-2512` / `mistral-large-latest`, 256k context, $0.5 / $1.5, GA without deprecation note.
- https://docs.mistral.ai/models — Large 4 as Featured Generalist; Large 3 is not listed in the deprecated table.
- https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512 — Cross-check of Large 3 rules (`temperature` < 0.1, images ~1:1), which are not documented for Large 4.

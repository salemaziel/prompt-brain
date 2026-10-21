---
model: mistral-small-4
vendor: Mistral AI
family: Mistral
aliases: [mistral-small, mistral-small-latest, mistral-small-2603, small-4, small4, Mistral-Small-4-119B-2603]
last_verified: 2026-10-13
status: current
---

# Mistral Small 4

## Reasoning / Thinking
- Type: **hybrid, toggleable per request** via `reasoning_effort` — according to the vendor, a model unifying Instruct, Reasoning (formerly Magistral), and Devstral. The official chat template accepts exactly **two** values and otherwise aborts with `reasoning_effort must be either "none" or "high"`. No token budget, no `thinking` object.
- **Default is `"none"`**: if the field is missing, the template sets it to `none` itself. An imported prompt thus runs without reasoning unless the toggle is explicitly set.
- `"none"`: according to the vendor "equivalent to the same chat style of Mistral Small 3.2" — fast, lightweight responses. `"high"`: "Deep, step-by-step reasoning for complex problems, with equivalent verbosity to previous Magistral models"; vendor recommendation `high` for complex prompts.
- Sampling is **coupled to mode**: `temperature` 0.7 with `"high"`, 0.0–0.7 depending on task with `"none"` (official examples use 0.1).
- Multi-turn requirement: replay the complete assistant message **including `ThinkChunk`** back into history — "Do not strip ThinkChunk from assistant messages before replaying them. … significantly degrades output quality."
- `reasoning_effort` also applies on `/v1/agents` and `/v1/conversations`, located in the `completion_args` field.

## Prompting Style
- **System prompt as primary control surface:** vendor card lists "System Prompt: Strong adherence and support for system prompts", and all official usage examples load the included `SYSTEM_PROMPT.txt` as the system message (placeholders `{today}` / `{yesterday}` are inserted beforehand).
- Self-hosting pitfall: if a system message is missing, the official chat template **automatically inserts** a default system prompt (Le Chat persona, date, and tool rules). If neutral behavior is desired, provide an explicit custom system prompt. Whether the API behaves identically is not documented (unbelegt).
- Role-first framing from official prompting docs: "You are a <role>, your task is to <task>."; structure instructions hierarchically, use structure via Markdown and/or XML-like tags, few-shot as example turns in conversation history.
- Plan for literalness: "Mistral Small 4 can follow your instructions to the letter." Explicitly state scope, termination conditions, and output format.
- Documented anti-patterns from prompting docs: vague quantity descriptors and fuzzy words, contradictory rules (use decision trees instead), asking the model to count, requesting unnecessary output tokens, numeric rating scales instead of worded scales.

## Strengths & Weaknesses (prompt-relevant)
- Architecture: MoE with 128 experts, 4 active; 119B total parameters. Active parameters: model card and HF card state **6.5B**, while announcement states "6B active parameters per token (8B including embedding and output layers)" — the figures diverge.
- Strengths:
  - Text + image in, text out.
  - Multilingual: HF card mentions "dozens of languages" (including English, French, Spanish, German, Chinese, Japanese, Korean, Arabic).
  - Agentic workflows and coding are core capabilities: "native function calling and JSON output"; according to deprecated table, it serves as replacement for `magistral-small-*` and `devstral-small-2507`.
  - Concise reasoning outputs: according to vendor, Small 4 with reasoning matches or exceeds GPT-OSS 120B across all three reported benchmarks, "while generating significantly shorter outputs"; on LiveCodeBench with 20% fewer outputs. Prompts enforcing lengthy explanations counteract this.
  - Low cost: $0.15 input / $0.015 cached input / $0.6 output per 1M tokens — one-tenth the input and 8% of the output price of Mistral Medium 3.5.
- Weaknesses:
  - `"high"` increases output token volume and latency.
  - Knowledge cutoff: official system prompt states "Your knowledge base was last updated on Friday, November 1, 2024." Mistral does not publish a separate cutoff date (unbelegt).
  - Maximum output token limit: not documented (unbelegt).

## Output & Format Conventions
- Context window: 256k. API names according to model card: `mistral-small-2603` (fixed) and `mistral-small-latest` (according to lifecycle docs "Latest version, across generations"; "Using an alias may expose you to silent updates in model behavior and pricing"). Pin `mistral-small-2603` for reproducible prompts.
- Response format depends on mode: with `"high"`, `message.content` is a list of `ThinkChunk` and `TextChunk`, with `"none"` a plain `str`. In streaming, `delta.content` is initially a list (thinking), then a transition chunk with closing `ThinkChunk` plus first `TextChunk`, then a plain string.
- Features according to model card: Chat Completions, Function Calling, Agents & Conversations, Built-In Tools, Structured Outputs, **Predicted Outputs**, Document QnA, Prefix (assistant prefill), Batching.
- Self-hosting template markers: `[SYSTEM_PROMPT]`, `[INST]`, `[AVAILABLE_TOOLS]`, `[MODEL_SETTINGS]{"reasoning_effort": …}[/MODEL_SETTINGS]`, `[THINK]`, `[TOOL_CALLS]…[ARGS]`, `[TOOL_RESULTS]`, `[IMG]`. Supported roles are strictly `user`, `assistant`, `system`, `tool`; conversation must start with `user` or `system`.
- Image placement in template: images only in user and tool messages; system messages are pure text; assistant messages only text and thinking. If a user turn consists of exactly one text and one subsequent image block, the template reorders the image to the front.
- vLLM serving according to HF card: `--tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral`.

## Migration Notes
- **MIGRATING TO mistral-small-4**:
  - Mistral names Small 4 as the alternative for `mistral-small-2506`, `mistral-small-2503`, `mistral-small-2501`, `mistral-small-2409`, `mistral-small-2402`, `magistral-small-2509`, `magistral-small-2507`, `magistral-small-2506`, `devstral-small-2507`, `open-mixtral-8x7b`, `open-mixtral-8x22b`, `mistral-saba-2502`, and Mathstral 7B — set target ID accordingly.
  - Specifically **from magistral-small**: **explicitly set** `reasoning_effort: "high"`, otherwise the prompt runs silently on `none` and loses its reasoning. Replace hand-parsed `[THINK]` tags with `ThinkChunk` handling and set `temperature` to 0.7.
  - Specifically **from mistral-small-3.x** or `devstral-small-2507`: `"none"` corresponds to the Small 3.2 chat style according to the vendor; for complex or agentic tasks specifically set `"high"` and then update response parsing to handle chunk lists.
- **MIGRATING FROM mistral-small-4**:
  - Remove `reasoning_effort`, `ThinkChunk` parsing, and the replay rule; targets without a reasoning parameter will need explicit step-by-step scaffolding reintroduced in the prompt. Recalibrate mode-coupled sampling values. Replace Mistral specifics (prefix prefill, Predicted Outputs, built-in tools, `completion_args`). Re-plan context budgets for targets below 256k; remove image parts for text-only targets.
  - Within the family: Mistral Medium 3.5 and Mistral Large 4 (`mistral-large-4-0`) also accept `reasoning_effort` — a prompt with this field may originate from any of the three.

## Sources
- https://docs.mistral.ai/models/mistral-small-4-0-26-03 — Official model card: release March 16, 2026, GA, Apache 2.0, v26.03, "119B parameters with 6.5B active", 256k context, API names `mistral-small-2603` and `mistral-small-latest`, $0.15 / $0.6 per 1M, feature list including Predicted Outputs.
- https://docs.mistral.ai/models — Lineup (Small 4 as featured) and deprecated table with Mistral Small 4 as alternative for the aforementioned Small, Magistral Small, Devstral Small, Mixtral, Saba, and Mathstral models.
- https://docs.mistral.ai/capabilities/reasoning — `mistral-small-latest` and `mistral-large-4-0` with `reasoning_effort`, semantics of `none`/`high`, chunk response structure, streaming progression, multi-turn replay warning, `completion_args` on Agents/Conversations.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603 — Official vendor card: MoE 128/4, 119B / 6.5B active, text+image input, "Strong adherence and support for system prompts", "follow your instructions to the letter", recommended temperature per mode, mode comparison with Small 3.2 and Magistral, benchmarks against GPT-OSS 120B, vLLM flags.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603/raw/main/chat_template.jinja — Official chat template: default `reasoning_effort = 'none'`, validation check `none`/`high`, default system prompt when system message is absent, markers, role and ordering rules, image placement.
- https://huggingface.co/mistralai/Mistral-Small-4-119B-2603/raw/main/SYSTEM_PROMPT.txt — Official system prompt with knowledge base date November 1, 2024, and tool usage rules.
- https://mistral.ai/news/mistral-small-4/ — Announcement: unifies Magistral, Devstral, and Mistral Small, "6B active parameters per token (8B including embedding and output layers)", mode description, shorter outputs than GPT-OSS 120B, API name `mistral-small-latest`.
- https://docs.mistral.ai/inference/pricing — Standard tier: Small 4 $0.15 input / $0.015 cached / $0.6 output, Medium 3.5 $1.5 / $0.15 / $7.5 per 1M tokens.
- https://docs.mistral.ai/inference/model-lifecycle — Alias levels (`-latest` "Latest version, across generations") and warning about silent alias updates.
- https://docs.mistral.ai/inference/prompting — Cross-model prompting guidance: role framing, structure, Markdown/XML tags, few-shot, anti-patterns.

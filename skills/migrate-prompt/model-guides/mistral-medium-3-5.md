---
model: mistral-medium-3-5
vendor: Mistral AI
family: Mistral
aliases: [mistral-medium, mistral-medium-latest, mistral-medium-3, mistral-medium-3.5, medium-3.5]
last_verified: 2026-10-13
status: current
---

# Mistral Medium 3.5

## Reasoning / Thinking
- Type: **toggleable per request** via `reasoning_effort`. Officially documented are exactly **two** values, `"none"` and `"high"` — the official chat template aborts for any other value with `reasoning_effort must be either "none" or "high"`. No intermediate levels, no token budget, no `thinking` object.
- **Default is `"none"`**: if the field is missing, the template sets it to `none` itself. An unmodified prompt thus runs without reasoning — the toggle must be explicitly set.
- `"high"`: "The response includes a full thinking chunk before the final answer, at the cost of increased token usage." `"none"`: "The model thinks minimally and the thinking chunk is omitted from the response."
- Vendor recommendation: "For agentic and code use cases, `reasoning_effort="high"` is recommended" — as well as for complex prompts.
- Sampling is **coupled to mode**: with `"high"`, `temperature` 0.7 and `top_p` 0.95; with `"none"`, `temperature` 0.0–0.7 (official example code uses 0.1) and `top_p` set to `None` or 1.0.
- Multi-turn requirement with explicit warning: replay the complete assistant message **including `ThinkChunk`** back into history. "Do not strip ThinkChunk from assistant messages before replaying them. … Stripping them increases token efficiency but significantly degrades output quality."
- `reasoning_effort` also applies on `/v1/agents` and `/v1/conversations`, located in the `completion_args` field.

## Prompting Style
- **System prompt is the primary control surface:** the vendor card lists "System Prompt: Strong adherence and support for system prompts" as its own capability, and all official usage examples load the included `SYSTEM_PROMPT.txt` as the system message.
- Role-first framing from official prompting docs: "You are a <role>, your task is to <task>."; structure instructions hierarchically into sections and subsections, written as if "for someone with no prior context".
- Structure via **Markdown and/or XML-like tags** (documentation rationale: "Readable", "Parsable", "Familiar"). Few-shot either as an `# Examples` section or as artificial user/assistant turns. System = general context, user = context of the current interaction; without a system role, concatenate both into the user turn.
- Prompt agentically and schema-driven: the vendor positions the model for "long-horizon tasks, calling multiple tools reliably, and producing structured output that downstream code can consume" — pass tool definitions cleanly as a schema rather than explaining them in prose.
- Plan for literalness: "Mistral Medium 3.5 can follow your instructions to the letter." Explicitly state scope, termination conditions, and output format rather than relying on interpretation.
- Documented anti-patterns from prompting docs: imprecise quantitative adjectives ("too long", "many"), fuzzy words ("things", "interesting", "better"), contradictory rules (use decision trees instead), asking the model to count (provide character counts as input), generating unnecessary output tokens, numeric 1–5 scales (use worded scales like "Very Low" … "Very Good" instead).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - "Our first flagship merged model": instruction following, reasoning, and coding in a **single** weight set — dense 128B, 256k context, open weights under Modified MIT, self-hostable "on as few as four GPUs" according to announcement.
  - Agentic workflows and coding are proven strengths: 77.6% on SWE-Bench Verified and 91.4 on τ³-Telecom; "supersedes all our previous coding models, namely Devstral, across all benchmarks".
  - Vision: vision encoder trained "from scratch" for **variable image sizes and aspect ratios** — the ~1:1 cropping documented for Mistral Large 3 is not needed here. Text + image in, text out.
  - Multilingual: vendor card mentions "dozens of languages" in prose (example list includes English, French, Spanish, German, Chinese, Japanese, Arabic); the figure 24 originates from repository language tags, not running text.
- Weaknesses:
  - Cost is the main drawback: $1.5 input / $0.15 cached input / $7.5 output per 1M tokens — with an identical 256k window, three times the input and **five times** the output price of Mistral Large 3 ($0.5 / $0.05 / $1.5). `reasoning_effort: "high"` adds further output tokens.
  - Knowledge cutoff: official default system prompt states "Your knowledge base was last updated on Friday, November 1, 2024" and instructs the model to use tools for recent or specific data. Mistral does not publish a separate knowledge cutoff date (unbelegt).
  - Maximum output token limit: not officially documented (unbelegt).

## Output & Format Conventions
- Context window: 256k. Three official API strings: `mistral-medium-3-5` (fixed major.minor), `mistral-medium-3` (latest minor of this major generation), `mistral-medium-latest` (according to lifecycle docs "Latest version, across generations"). Documentation warning: "Using an alias may expose you to silent updates in model behavior and pricing. For precise control, pin your deployment to a specific major.minor version identifier." Whether an alias moves only upon reaching GA of a new model is not specified (unbelegt) — pin to `mistral-medium-3-5` for reproducible prompts.
- There is **no** date-stamped ID for this generation: predecessors were named `mistral-medium-2508` / `mistral-medium-2505`, but starting with 3.5 the `model-name-major-minor` schema applies. Aggregator IDs in the style of `mistral-medium-26xx` are not vendor IDs.
- Response format depends on mode: with `"high"`, `message.content` is **not a string**, but a list of `ThinkChunk` (`type: "thinking"`) and `TextChunk` (`type: "text"`); with `"none"`, a plain `str`. In streaming, `delta.content` is initially a list (thinking), then a transition chunk with closing `ThinkChunk` plus first `TextChunk`, then a plain string.
- Features according to model card: Structured Outputs, Function Calling, **Predicted Outputs**, Document QnA, Prefix (assistant prefill), Batching, Agents & Conversations, Chat Completions, Built-In Tools — Mistral Large 3 does not list Predicted Outputs.
- Self-hosting template markers: `[SYSTEM_PROMPT]…[/SYSTEM_PROMPT]`, `[INST]…[/INST]`, `[AVAILABLE_TOOLS]`, `[MODEL_SETTINGS]{"reasoning_effort": …}[/MODEL_SETTINGS]`, `[THINK]…[/THINK]`, `[TOOL_CALLS]<name>[ARGS]<json>`, `[TOOL_RESULTS]…[/TOOL_RESULTS]`, `[IMG]`. Supported roles are strictly `user`, `assistant`, `system`, `tool`; the conversation must start with `user` or `system`; images are permitted only in user and tool messages, not in system or assistant messages.
- vLLM serving according to vendor card: `--tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral`; via the OpenAI-compatible interface, the reasoning trace resides in `message.reasoning`.

## Migration Notes
- **MIGRATING FROM mistral-medium-3-5**:
  - Remove `reasoning_effort` and all thinking chunk handling — targets without a reasoning parameter require explicit step-by-step / Chain-of-Thought scaffolding reintroduced in the prompt. Recalibrate mode-coupled sampling parameters (0.7 / 0.95 or 0.1 / `None`), which are specific to this model. Revert response parsing back to a plain string and drop the replay rule for `ThinkChunk`. Replace Mistral specifics: prefix prefill, Predicted Outputs, built-in tools, `/v1/conversations`, and `completion_args`. Re-plan context budgets for targets below 256k; remove image content parts for text-only targets.
- **MIGRATING TO mistral-medium-3-5**:
  - This is Mistral's **designated replacement path** for `mistral-large-2411`, `pixtral-large-2411`, `mistral-medium-2508`, `mistral-medium-2505`, `devstral-2512`, `devstral-medium-2507`, and the entire `magistral-medium-*` series — set target ID accordingly.
  - **Explicitly set `reasoning_effort`**: without this field, the prompt defaults to `none`; a prompt migrated from Magistral (a native reasoner) would thus silently lose reasoning; set `"high"` for agentic workflows and code.
  - Specifically **from mistral-large-3**: no reasoning slider exists there; handwritten Chain-of-Thought required for Large 3 can be removed when using `"high"`, and the Large 3 recommendation `temperature` < 0.1 should be raised to 0.7 / `top_p` 0.95.
  - Update response parsing to handle chunk lists and carry `ThinkChunk` forward across all turns. Image preprocessing to ~1:1 is no longer needed. Replace manual parsing of `[THINK]` tags carried over from Magistral with `ThinkChunk`.
  - Recalculate costs: output costs five times as much as Large 3, in addition to reasoning tokens.
  - Verify origin: Mistral Large 4 (`mistral-large-4-0`) and Mistral Small 4 (`mistral-small-latest`) also take `reasoning_effort` — a prompt containing this field may also originate from them.

## Sources
- https://docs.mistral.ai/models/mistral-medium-3-5-26-04 — Official model card: release April 28, 2026, GA, Modified MIT, v26.04, 256k context, $1.5 / $7.5 per 1M, blurb "frontier-class multimodal model optimized for agentic and coding use cases", complete feature list (including Predicted Outputs). The card lists all three API names: `mistral-medium-3-5`, `mistral-medium-3`, `mistral-medium-latest`.
- https://docs.mistral.ai/capabilities/reasoning — `reasoning_effort` with exactly the values `none` and `high`, recommendation `high` for agentic/code, semantics of both modes, `ThinkChunk`/`TextChunk` response structure, streaming progression, multi-turn replay warning, availability via `completion_args` on Agents/Conversations; same page lists `reasoning_effort` also for `mistral-small-latest` and `mistral-large-4-0`.
- https://huggingface.co/mistralai/Mistral-Medium-3.5-128B — Official vendor card: "first flagship merged model", dense 128B, 256k, Modified MIT, vision encoder from scratch, "Strong adherence and support for system prompts", "follow your instructions to the letter", recommended temperature/top_p per mode, SWE-Bench Verified 77.6% and τ³-Telecom 91.4, "supersedes all our previous coding models, namely Devstral, across all benchmarks", vLLM flags. Language data: prose states "dozens of languages", the 24 languages are repository language tags.
- https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/raw/main/chat_template.jinja — Official chat template: `{%- set reasoning_effort = 'none' %}` as default, `raise_exception('reasoning_effort must be either "none" or "high"')`, markers `[SYSTEM_PROMPT]`/`[INST]`/`[AVAILABLE_TOOLS]`/`[MODEL_SETTINGS]`/`[THINK]`/`[TOOL_CALLS]`/`[ARGS]`/`[TOOL_RESULTS]`/`[IMG]`, the four roles, "Conversation must start with a user or system message", and image restriction in system and assistant messages.
- https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/raw/main/SYSTEM_PROMPT.txt — Official default system prompt: "Your knowledge base was last updated on Friday, November 1, 2024." with instructions to use tools for up-to-date or specific data.
- https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5 — Announcement: positioning for long-horizon tasks, reliable multi-tool calling, and machine-readable output, self-hosting "on as few as four GPUs", $1.5 / $7.5.
- https://docs.mistral.ai/inference/model-lifecycle — Naming schema `model-name-major-minor` with alias levels `-latest` ("Latest version, across generations") and `-major` ("Latest minor version of that major generation"); the page verifies all three API strings and uses `mistral-medium-3-5`, `mistral-medium-3`, and `mistral-medium-latest` as examples. Additionally warns "Using an alias may expose you to silent updates in model behavior and pricing", GA status, deprecation timelines.
- https://docs.mistral.ai/models — Current lineup (Medium 3.5 under Generalist models, v26.04, Modified MIT) and deprecated table: `mistral-large-2411`, `pixtral-large-2411`, `mistral-medium-2508`, `mistral-medium-2505`, `devstral-2512`, `devstral-medium-2507`, and all `magistral-medium-*` list Mistral Medium 3.5 as replacement.
- https://docs.mistral.ai/inference/pricing — Standard tier: Medium 3.5 $1.5 input / $0.15 cached / $7.5 output compared to Large 3 $0.5 / $0.05 / $1.5 per 1M tokens.
- https://docs.mistral.ai/inference/prompting — Official cross-model prompting guidance: role framing, hierarchical structure, Markdown/XML tags, few-shot patterns, system vs. user split, and anti-pattern list.
- https://docs.mistral.ai/models/mistral-large-3-25-12 — Cross-check for comparison statements: feature list of Mistral Large 3 **without** Predicted Outputs, 256k context, $0.5 / $1.5 per 1M.
- https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512 — Cross-check for migration direction: "Use a temperature below 0.1 for daily-driver and production environments" and image guidance "maintaining an aspect ratio close to 1:1 (width-to-height) for images".

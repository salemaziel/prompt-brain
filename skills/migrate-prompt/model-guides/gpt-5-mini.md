---
model: gpt-5-mini
vendor: OpenAI
family: GPT
aliases: [gpt5-mini, gpt-5mini, gpt-5-mini-2025-08-07, gpt5mini]
last_verified: 2026-06-13
status: legacy
successor: gpt-5.6-terra
---

# GPT-5 mini

## Reasoning / Thinking
- **Type: extended / adaptive reasoning (always reasoning-capable).** gpt-5-mini is a reasoning model with "reasoning token support" and uses — like gpt-5, gpt-5-mini, and gpt-5-nano — internal reasoning tokens before generating the visible response. The model reasons adaptively: fewer tokens on simple tasks, more on complex tasks.
- **Depth steering via `reasoning_effort`.** Supported values for gpt-5 / gpt-5-mini / gpt-5-nano (generation 2025-08; GPT-5.6 has a different ladder): `minimal`, `low`, `medium` (default), `high`. `minimal` produces very few to no reasoning tokens for minimal time-to-first-token, but according to OpenAI should be avoided for multi-step planning or tool-heavy workflows. Higher levels improve quality on complex multi-step tasks, but cost more tokens and latency. `reasoning_effort` is intended as a "tuning knob", not as a primary lever to fix quality.
- **`reasoning_effort: "none"` is not supported by gpt-5-mini** (according to community/test reports, the API only accepts `minimal`/`low`/`medium`/`high`) — (teilweise unbelegt: not explicitly confirmed in a primary OpenAI doc; the official model card lists only "Reasoning: High" as capability level).
- **Second control axis `verbosity`** (low | medium | high) influences the length of the *final response*, not the duration of thinking — thus it is independent of `reasoning_effort`.
- **Reasoning tokens are not retained in context between API calls.** For agentic multi-step workflows, OpenAI recommends returning reasoning items via the Responses API (`previous_response_id`) so the model can access earlier reasoning traces (more efficient, lower token consumption).

## Prompting Style
- **Highly prescriptively controllable / high instruction adherence.** GPT-5 (including mini) follows instructions with "surgical precision" and is "extraordinarily receptive" to instructions regarding verbosity, tone, and tool calling. For this exact reason, the model suffers more than older models from poorly structured prompts.
- **Contradictory instructions are the most costly source of error:** The model expends reasoning tokens trying to reconcile conflicts instead of deciding optimally. Explicitly resolve instruction hierarchy; audit prompts for contradictions (optionally use OpenAI Prompt Optimizer).
- **System / developer message adherence:** The reasoning documentation recommends giving the model "task, constraints, and desired output format" and **not** prescribing intermediate steps. Important: Do **not** use system *and* developer messages simultaneously in the same request (unbelegt).
- **Regulate eagerness deliberately.** Less eagerness: Lower `reasoning_effort`, clear exploration criteria, fixed tool call budgets (e.g., "maximum of 2 tool calls"), escape hatches. More eagerness: Higher `reasoning_effort`, persistence instructions ("keep going until the user's query is completely resolved").
- **Differences from full GPT-5:** gpt-5-mini is the smaller, cheaper, lower-latency variant and shines primarily on **well-defined tasks and precise prompts**; for vague, openly exploratory, or particularly complex multi-step tasks, full gpt-5 is more robust (abgeleitet, unbelegt). gpt-5-mini therefore tends to require more precise, unambiguous prompts. API shape is identical to gpt-5; the same new tools (custom tools, CFG) are supported.
- **With `minimal` reasoning**, gpt-5-mini requires stronger prompting: Request a short summary of the approach at the beginning, verbose tool preambles, explicit persistence reminders against premature termination, and decomposing tasks into all necessary sub-queries (closer to GPT-4.1 prompting).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: "Near-frontier intelligence" at low cost and latency; very high steerability via `reasoning_effort` + `verbosity` without rewriting prompts; strong instruction adherence; ideal for high-volume, well-defined, precisely formulated tasks; supports streaming, function calling, structured outputs, custom/freeform tools, and Context-Free Grammar (Lark/Regex).
- Weaknesses: Sensitive to contradictory/unclean prompts (waste of reasoning tokens); with `minimal` reasoning it is not a good planner for tool-heavy multi-step workflows; **no** fine-tuning, **no** predicted outputs; no audio/video; Markdown adherence can degrade in long conversations (refresh formatting instructions every 3–5 user messages).

## Output & Format Conventions
- **By default no Markdown** in the final response via the API. Selectively enable Markdown with semantic instructions, e.g.: "Use Markdown **only where semantically correct** (e.g., `inline code`, code fences, lists, tables)."
- **Control response length via `verbosity`** instead of prompt rewriting: low = terse UX / minimal prose, medium = balanced (default), high = verbose (good for audits / teaching / hand-offs). Prompts can contextually override the global verbosity default.
- **Tool preambles:** Trained to provide upfront plans and progress updates; frequency/style can be steered via prompt.
- **Modalities:** Text input + text output, image input; **no** audio, **no** video.
- **Limits:** Context window 400,000 tokens, max output 128,000 tokens. Structured outputs are supported.

## Migration Notes
- **Deprecation:** `gpt-5-mini-2025-08-07` will be shut down on December 11, 2026 according to the OpenAI deprecations page; official replacement is `gpt-5.6-terra`. The gpt-5-mini model page also recommends starting new low-latency / high-volume workloads with GPT-5.6 Terra.
- **MIGRATING FROM gpt-5-mini**:
  - Switch to **gpt-5.6-terra** (official successor) or for harder tasks to **gpt-5.6-sol**. A different effort ladder applies there: `none | low | medium (default) | high | xhigh | max`, no `minimal` — map the effort level to the target guide's ladder. (`gpt-5` itself is also deprecated.)
  - When migrating to smaller models (e.g., gpt-5-nano) or non-reasoning models: Make prompts more precise and explicit, as there is less reasoning leeway.
- **MIGRATING TO gpt-5-mini**:
  - From larger GPT-5 models: Sharpen prompts / make them more unambiguous, define tasks well; remove contradictory instructions.
  - From non-reasoning models (e.g., GPT-4.1/4o): Introduce `reasoning_effort` and `verbosity` as new control axes; with `minimal` reasoning retain GPT-4.1-style explicit prompting. Do not prescribe intermediate steps; provide task + constraints + output format instead.
  - For agentic workflows, switch to the **Responses API** (reasoning persistence via `previous_response_id`); do not send system and developer messages at the same time (unbelegt).

## Sources
- https://developers.openai.com/api/docs/models/gpt-5-mini — Model card: Context window (400k), max output (128k), reasoning support, modalities, supported features, positioning as affordable/low-latency variant for well-defined tasks; recommendation to start new low-latency / high-volume workloads with GPT-5.6 Terra.
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide — Prompting guide: `reasoning_effort` levels, eagerness control, `verbosity`, instruction adherence / "surgical precision", problem of contradictory instructions, tool preambles, Markdown default behavior, minimal reasoning guidance, Responses API recommendation.
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools — Exact values for `reasoning_effort` (minimal/medium default) and `verbosity` (low/medium/high), custom/freeform tools and CFG; supported models including gpt-5-mini.
- https://developers.openai.com/api/docs/guides/reasoning — Reasoning guide: Reasoning tokens not retained between calls, `previous_response_id`, effort as a tuning knob, task/constraints/output format instead of intermediate steps.
- https://openai.com/index/introducing-gpt-5-for-developers/ — Announcement: Three API sizes (gpt-5, gpt-5-mini, gpt-5-nano), gpt-5-mini as faster/cheaper variant, `reasoning_effort: minimal`, Responses API recommendation. (Page returned HTTP 403 upon fetch — content from OpenAI search index snippet; SOURCE PARTIALLY UNAVAILABLE.)
- https://developers.openai.com/api/docs/deprecations — Deprecations (announcement 2026-06-11): gpt-5-mini-2025-08-07 shutdown December 11, 2026, replacement gpt-5.6-terra; gpt-5-2025-08-07 → gpt-5.6-sol.
- https://developers.openai.com/api/docs/models/gpt-5.6-terra — Effort ladder of successor none/low/medium (default)/high/xhigh/max.
- https://developers.openai.com/api/docs/models/gpt-5.6-sol — "GPT-5.6 flagship model for complex professional work", identical effort ladder.

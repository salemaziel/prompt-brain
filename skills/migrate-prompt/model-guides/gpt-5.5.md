---
model: gpt-5.5
vendor: OpenAI
family: GPT
aliases: [gpt5.5, gpt-5.5-2026-04-23]
last_verified: 2026-10-13
status: current
---

# GPT-5.5

## Reasoning / Thinking
- Depth via `reasoning.effort`: `none | low | medium (default) | high | xhigh`. **`max` does not exist on GPT-5.5** — when migrating from or to a model with `max` (e.g. GPT-5.6 Sol), the level must be mapped intentionally.
- Official recommendation: "Treat `medium` as the recommended balanced starting point for quality, reliability, latency, and cost." Use `high`/`xhigh` only when evals demonstrate a measurable quality gain; according to the guide, higher levels can lead to overthinking, unnecessary searches, or quality regressions. For latency-critical cases, test `low` first; use `none` only for tasks without reasoning requirements.
- Interleaved thinking: GPT-5.5 can generate visible output before and between thinking phases, as well as thinking between tool calls.
- **`phase` field (Responses API)**: In long or tool-heavy flows, pass back the `phase` parameter on returned assistant items unchanged ("preserve the `phase` parameter on returned assistant output items and pass it back unchanged") — `commentary` for progress updates, `final_answer` for the finished response; never set on user messages. With `previous_response_id`, the API handles this automatically.
- `reasoning.context` defaults to `current_turn` on models prior to GPT-5.6; `all_turns` is reserved for GPT-5.6 and GPT-6.1 Sol. According to the reasoning guide, `reasoning.mode: "pro"` is documented only for GPT-5.6 and GPT-6 models.

## Prompting Style
- **Outcome-first instead of process choreography**: Describe expected results, success criteria, boundaries for side effects, evidence rules, and output format; cut heavy step-by-step instructions. Suggested concise sections: Role, Personality, Goal, Success criteria, Constraints, Output, Stop rules.
- **Use absolute words sparingly**: Reserve `ALWAYS`/`NEVER`/`must`/`only` for genuine invariants; formulate decision rules for matters of judgment.
- **Tool guidance belongs in the tool description**: "Put most tool-specific guidance in the tool descriptions themselves" — what the tool does, when to use it, required inputs, side effects, retry safety, typical errors. Use the system prompt only for cross-tool context; use Tool Search for large catalogs.
- **Autonomy**: Prioritize progress over questions; only ask clarifying questions when missing information materially alters the result. Explicitly set stop rules (documentation example: "Use the minimum evidence sufficient to answer correctly, cite it precisely, then stop.").
- **Preambles**: Short visible status message before tool calls, "Keep it to one or two sentences."
- **Default tone**: "GPT-5.5 tends to be efficient, direct, and task-oriented by default." For customer-facing products, define personality and collaboration style explicitly but concisely.
- Current date does not need to be in the prompt: "The model is already aware of the current UTC date."

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Positioned on the model page as "A new class of intelligence for coding and professional work". Named as production recommendation in the changelog of May 5, May 28, and June 24, 2026 ("We recommend leveraging GPT-5.5 for production API usage"); GPT-5.6 family has been available since July 9, 2026. Neither model page nor deprecations page lists a deprecation or successor — the model remains regularly available.
- Weaknesses: Higher effort is not a quality guarantee (see above); response length and reasoning quality must be steered separately. Not supported: Realtime, Assistants, Fine-tuning, Embeddings, image/video/audio generation, transcription/translation, Moderation, legacy completions.

## Output & Format Conventions
- Context window **1,050,000** tokens, max output **128,000**; knowledge cutoff **December 1, 2025**; input text + image, output text only. Endpoints: Chat Completions, Responses, Batch.
- **Length**: `text.verbosity` (`low | medium | high`, default `medium`); "`low` is often a better starting point for concise responses." Specify concrete lengths via word budgets, section counts, or JSON-only requirements in the prompt.
- **Formatting**: "Let formatting serve comprehension" — default to clean paragraphs, use headings/bolding/lists sparingly; respect user formatting preferences.
- **Structured outputs**: "Remove output schema definitions from the prompt where possible" — define schemas via Structured Outputs rather than prose in the prompt.
- **Prompt caching**: "Caching for GPT-5.5 only works with extended prompt caching" — `prompt_cache_retention` supports only `"24h"`; implicit breakpoints every 2,048 tokens, explicit breakpoints are not supported. Put static parts first, dynamic parts last; use a stable `prompt_cache_key` for shared prefixes.
- Pricing per 1M tokens: Input $5, Cached Input $0.50, Output $30; prompts over 272K input tokens cost 2x input and 1.5x output. Snapshot `gpt-5.5-2026-04-23`.

## Migration Notes
- **MIGRATING TO gpt-5.5**: According to the guide, "treat it as a new model family to tune for, not a drop-in replacement" — start with the smallest prompt that preserves the product contract; strip process choreography, embedded output schemas, and date statements; shift tool guidance into tool descriptions; pass `phase` through in Responses flows. Map `max` from source models to `xhigh` (or lower, verified by evals).
- **MIGRATING FROM gpt-5.5 to GPT-5.6 Sol/Terra**: Keep current effort level as baseline and additionally test **one level below**. "GPT-5.6 tends to be more concise by default than GPT-5.5" — check blanket "Be concise" statements, otherwise responses may become too terse. Persisted reasoning does not carry over: "reasoning does not carry between the GPT-5.6 and GPT-5.5 families."
- **MIGRATING FROM gpt-5.5 to the GPT-6 family** (`gpt-6-astra`, `gpt-6.1-sol`, `gpt-6-luna`): "When migrating from GPT-5.5 or earlier, replace `prompt_cache_retention` with `prompt_cache_options.ttl`" (only value `"30m"`). Preserve effective effort level where supported — GPT-6 Astra does not have `none`, GPT-6.1 Sol has neither `none` nor `minimal`.
- **MIGRATING FROM gpt-5.5 to other providers**: Recreate `reasoning.effort`, `text.verbosity`, `phase`, and Structured Outputs as prose or schema specifications of the target provider; re-add any stripped length and formatting instructions explicitly; verify the 1.05M token context assumption.

## Sources
- https://developers.openai.com/api/docs/models/gpt-5.5 — Positioning statement, snapshot `gpt-5.5-2026-04-23`, effort `none`–`xhigh` (default `medium`, no `max`), 1,050,000 context / 128,000 output, cutoff Dec 1, 2025, modalities, endpoints, unsupported features, pricing and 272K rule, no deprecation notice.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5 — "Using GPT-5.5": Effort recommendation, `text.verbosity`, tool descriptions, "Let formatting serve comprehension", outcome-first structure, ALWAYS/NEVER, autonomy, preambles, `phase`, caching order, UTC date, schemas via Structured Outputs, "not a drop-in replacement".
- https://developers.openai.com/api/docs/guides/reasoning — `gpt-5.5` default `medium`, "try `low`" before `none`, interleaved thinking, `phase` for GPT-5.5/5.4, `reasoning.context` default `current_turn` prior to GPT-5.6, `pro` mode only GPT-5.6/GPT-6, no reasoning transfer between GPT-5.6 and GPT-5.5 families; GPT-6 Astra without `none`, GPT-6.1 Sol without `none`/`minimal`.
- https://developers.openai.com/api/docs/guides/prompt-caching — GPT-5.5: Retention only `"24h"`, implicit breakpoints every 2,048 tokens, no explicit breakpoints; `prompt_cache_options.ttl` starting from GPT-5.6.
- https://developers.openai.com/api/docs/changelog — Release Apr 24, 2026, "Caching for GPT-5.5 only works with extended prompt caching", production recommendation (May 5, May 28, June 24, 2026), GPT-5.6 release July 9, 2026.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.6-sol — "GPT-5.6 tends to be more concise by default than GPT-5.5", effort baseline plus one level below when migrating from GPT-5.5; GPT-6 caching note.
- https://developers.openai.com/api/docs/guides/latest-model — GPT-6 migration: `prompt_cache_options.ttl` `"30m"` when moving from GPT-5.5 or earlier, preserve effective effort level.
- https://developers.openai.com/api/docs/deprecations — GPT-5.5 is neither deprecated nor listed as a replacement model.

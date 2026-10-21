---
model: claude-sonnet-5
vendor: Anthropic
family: Claude
aliases: [sonnet-5, claude-sonnet5, sonnet5]
last_verified: 2026-10-13
status: legacy
successor: claude-sonnet-5-5
---

# Claude Sonnet 5

## Reasoning / Thinking
- Type: **adaptive, on by default**. Requests without a `thinking` field engage in thinking — a change compared to Sonnet 4.6, where the same requests ran without thinking. Disable with `thinking: {type: "disabled"}` (without an effort cap, unlike Opus 5).
- `thinking: {type: "enabled", budget_tokens: N}` has been removed (400) — only deprecated on Sonnet 4.6, here no longer available as a transitional solution. Control depth via `output_config.effort`.
- Effort levels: `low | medium | high | xhigh | max`, default `high` (same as Sonnet 4.6); `xhigh` is newly introduced to the Sonnet family. Rough migration mapping: Sonnet 5 at `medium` ≈ Sonnet 4.6 at `high`; Sonnet 5 at `high` ≈ Sonnet 4.6 at `max`.
- Effort levels are strictly followed, especially at the lower end: at `low`/`medium`, the model addresses only what was requested. For shallow reasoning, increase effort rather than attempting to prompt around it.
- Sampling parameters `temperature`/`top_p`/`top_k` at non-default values → 400 (new for the Sonnet family).
- `max_tokens` caps thinking **plus** response text: with a tight budget, there is a risk of a truncated response consisting almost entirely of thinking ending with `stop_reason: "max_tokens"`.

## Prompting Style
- **Literal instruction following**, especially at low effort: no silent generalization, no derivation of unstated requirements. If a rule should apply broadly, spell out the scope ("apply to every section, not just the first").
- **Verbosity is task-calibrated** rather than fixed — concise answers for simple lookups, detailed for open analyses. Prompt explicitly for fixed product lengths; positive examples of desired brevity work better than negative constraints.
- **Omit progress scaffolding**: forced intermediate status reports ("summarize after every 3 tool calls") are unnecessary; if format does not fit, describe updates explicitly and provide examples.
- **Tool usage**: more agentic by default than Sonnet 4.6 (readier to use tools and self-verification loops). **With thinking disabled**, it calls tools less frequently — add an explicit nudge in the system prompt. `high`/`xhigh` increase tool usage significantly.
- **Adaptive thinking triggering is steerable**: for overly frequent thinking blocks (can occur with large/complex system prompts), steer via prompt and measure results.
- **Tone**: prose style shifts compared to 4.6; re-evaluate style prompts against the new baseline. Those previously using `temperature` for stylistic variance must switch to system prompt instructions.
- **Frontend / Design**: tends toward a fixed default style in open briefs. Generic prohibitions merely shift it; effective approaches are either concrete specifications (palette, typography, layout) or "propose 4 directions first, then implement one" — the latter is the recommended path to variance given the lack of `temperature`.
- **Interactive coding products**: `xhigh`/`high`, add autonomous modes and reduce necessary user interactions; specify task, intent, and constraints fully in the first turn.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: coding and agentic tasks (largest improvement over Sonnet 4.6); runs on existing Sonnet 4.6 prompts out of the box; high-resolution vision; Computer Use with `computer_20251124` up to 2576px / 3.75 MP (1080p as a good performance/cost compromise, 720p or 1366×768 for cost-sensitive cases).
- Weaknesses / quirks: severity filters in review prompts ("high-severity only", "be conservative") are followed more faithfully than before — precision increases, measured recall may drop even though bug-finding is improved. Countermeasure: instruct model to report everything (with confidence + severity) and filter in a separate step.
- Risk of under-thinking at `low` on moderately difficult tasks.

## Output & Format Conventions
- 1M context window, 128k output tokens; up to 300k output via Message Batches API with beta header `output-300k-2026-03-24`.
- **New tokenizer**: the same text yields roughly 30% more tokens than on Sonnet 4.6 (content-dependent). Limits tuned for 4.6 may truncate equivalent outputs; re-establish token counts and cost baselines.
- `thinking.display` defaults to `"omitted"` (Sonnet 4.6: `"summarized"`) — those streaming reasoning must set `display: "summarized"` explicitly.
- No assistant prefill — use Structured Outputs (`output_config.format`) or system prompt instructions.
- Pricing according to model table: $2 / MTok input, $10 / MTok output; reliable knowledge cutoff January 2026.
- Mid-conversation system messages (`role: "system"` within `messages`) are **not** supported on Sonnet 5 — the top-level `system` prompt remains the standard approach there. Likewise, per-message effort and mid-conversation tool changes are absent; changing effort is only possible via the top-level parameter and restarts the prompt cache.
- Minimum cacheable prompt: 1,024 tokens.

## Migration Notes
- **MIGRATING FROM claude-sonnet-5**: Scopes explicitly spelled out due to literalness can be more concise again on the target model; re-evaluate tone and variance instructions (potentially restore `temperature` instead of prompt); re-budget tokenizer-dependent `max_tokens` values; `xhigh` is often unavailable outside the current generation.
- **MIGRATING TO claude-sonnet-5**: Replace `budget_tokens` with adaptive thinking + `effort`; remove `temperature`/`top_p`/`top_k` and control tone/variance via prompt; replace assistant prefill; note that requests without a `thinking` field now think (check `max_tokens`, or explicitly set `disabled`); set `display: "summarized"` if displaying reasoning; re-establish token baselines due to ~30% more tokens; remove progress scaffolding; switch review harnesses from severity filters to "report everything, filter later"; for previously thinking-free setups, test thinking enabled with lower effort. On Amazon Bedrock, send forced `tool_choice` together with `thinking: {type: "disabled"}`. (unbelegt: Bedrock detail not confirmed on verified pages)
- **Lifecycle**: Sonnet 5 is *Legacy* (still available, status "Active (legacy)"); Anthropic recommends migrating to Claude Sonnet 5.5 (`claude-sonnet-5-5`; checklist in Sonnet 5.5 guide). Retirement not before June 30, 2027 (Anthropic platforms).

## Sources
- https://platform.claude.com/docs/en/models/sonnet-5/overview — covers id `claude-sonnet-5`, 1M context, 128k output, $2/$10, knowledge cutoff January 2026, adaptive thinking, default effort `high`, 300k output beta on Batches API, sampling parameters → 400; status Legacy ("Active (legacy)"), successor Claude Sonnet 5.5, retirement not before June 30, 2027.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 — adaptive thinking by default, `budget_tokens` → 400, sampling parameters → 400, ~30% more tokens due to new tokenizer, effort mapping to Sonnet 4.6, literalness, verbosity, tool triggering (including with thinking off), progress updates, tone, design defaults, code review recall, Computer Use `computer_20251124` up to 2576px.
- https://platform.claude.com/docs/en/build-with-claude/effort — effort levels including `xhigh`/`max` for Sonnet 5, default `high`, recommendations per tier, changing effort breaks prompt cache.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Sonnet 5 row in model table (adaptive thinking by default, `budget_tokens` → 400, `disabled` turns off thinking without effort cap), `display` default `"omitted"` (Sonnet 4.6: `"summarized"`), turning off thinking.
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — mid-conversation system messages not available on Sonnet 5; use top-level `system`.
- https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5 — section "Feature support": per-message effort, mid-conversation system messages, and mid-conversation tool changes not available on Sonnet 5, cache minimum 1,024 tokens.

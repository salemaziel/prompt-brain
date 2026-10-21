---
model: claude-opus-5
vendor: Anthropic
family: Claude
aliases: [opus-5, claude-opus5, opus5]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 5

## Reasoning / Thinking
- Type: **adaptive, on by default**. A request without a `thinking` field engages in thinking — unlike Opus 4.8/4.7, where the same request ran without thinking. `{type: "adaptive"}` is equivalent to omitting the field.
- Disabling via `thinking: {type: "disabled"}` is permitted **only up to effort `high`**; combined with `xhigh`/`max` → 400.
- `thinking: {type: "enabled", budget_tokens: N}` has been removed (400). Depth is controlled exclusively via `output_config.effort` (`low | medium | high | xhigh | max`, default `high`).
- Raw chain of thought is never returned; `display: "summarized"` provides a summary; default `"omitted"` returns empty thinking fields.
- Sampling parameters `temperature`/`top_p`/`top_k` at non-default values → 400.
- `max_tokens` is a hard limit across thinking **plus** response text — re-budget for previously thinking-free workloads. Start with ≥ 64k at `xhigh`/`max`.

## Prompting Style
- **Explicit rather than implicit**: Opus 5 interprets prompts literally, does not silently generalize an instruction to other cases, and does not infer unstated requirements. Spell out the scope.
- **Remove verification instructions**: The model verifies its work unprompted. Inherited "double-check your answer" / "include a final verification step" lines cause over-verification — pruning them reduces cost without sacrificing quality.
- **Specify length explicitly**: `effort` governs thinking volume, not visible response length — lowering it does not reliably shorten answers. Add concise instructions; in long system prompts, append a `<tone_preference>` reminder at the end.
- **Bound scope**: The model occasionally expands tasks with unprompted steps; tightly scoped tasks require an explicit scope rule.
- **Cap delegation**: Opus 5 delegates more readily to subagents than predecessors — specify delegation criteria or enforce a hard ceiling.
- **Omit progress scaffolding**: Status choreography ("summarize after every 3 tool calls") is unnecessary; instead, describe the cadence and format of updates.
- Long agentic runs: provide complete task specifications **upfront** in a single turn and allow the run to proceed.
- **Do not request reasoning in the response text**: prompts, skills, and tool descriptions that prompt the model to write out thinking/reasoning — verbatim or in a fixed format (`<thinking>`, `<reasoning>`, or scratchpad section before the answer, `reasoning`/`thinking`/`trace` field in JSON output or tool input, reasoning log, reasoning "verbatim"/"in full") — can be rejected with `stop_reason: "refusal"` and `stop_details.category: "reasoning_extraction"`. Instead, request a brief explanation, evidence, or a summary of executed steps; if reasoning itself is needed, keep thinking enabled and read thinking blocks with `display: "summarized"`. This category has no fallback model (modify the prompt rather than resending), and refusals occurring before any output are billed.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: challenging agentic coding tasks (multi-file features, large refactorings, end-to-end work) without stubs/placeholders; code review with high precision **and** recall, even at low effort; vision (charts, documents, diagrams, UI replication); office artifacts (multi-sheet spreadsheets with formulas, slide decks); multi-agent coordination with writer-verifier patterns; consistent instruction following across the entire 1M window.
- `low`/`medium` deliver high quality at a fraction of tokens and latency — primary cost lever; re-sweep effort defaults inherited from predecessor models.
- Weaknesses / quirks: longer visible responses and longer written deliverables than predecessors; pronounced narration in agentic sessions; narratively verbose self-corrections; severity filters in review prompts ("high-severity only") are followed literally, lowering measured recall.
- With thinking disabled, two artifacts can occur: tool calls occasionally land as **text** instead of a `tool_use` block (turn counts as successful, but the call never executes), and internal XML tags may leak into the visible response. Primary countermeasure according to docs: keep thinking enabled and reduce effort instead.

## Output & Format Conventions
- 1M context window as default **and** maximum (no beta header), 128k output tokens; up to 300k output via Message Batches API with beta header `output-300k-2026-03-24`.
- No assistant prefill — use Structured Outputs (`output_config.format`) or system prompt instructions.
- Tokenizer same as Opus 4.7/4.8: roughly 1×–1.35× as many tokens for the same text compared to models before Opus 4.7 (content-dependent).
- Safety classifiers can refuse: HTTP 200 with `stop_reason: "refusal"` and `stop_details` — inspect before reading `content`. Server-side fallbacks via `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`, Claude API only; the older header `server-side-fallback-2026-06-01` only accepts the explicit model list).
- Price $5 / MTok input, $25 / MTok output; reliable knowledge cutoff May 2026.
- Minimum cacheable prefix: **512 tokens** (Opus 4.8: 1024) — prompts previously considered too short to cache now cache without code changes. A cache eligibility review is worthwhile when migrating from 4.8.
- Top-level effort (output_config.effort on the request) is part of the rendered prompt — changing it between requests invalidates the prompt cache. A per-message effort change (beta header `mid-conversation-output-config-2026-07-01`, Claude API and Google Cloud only, not Amazon Bedrock) preserves the cache.
- Mid-conversation system messages (`role: "system"` in `messages` directly after a user turn) are supported on Opus 5 without a beta header (Claude API, Amazon Bedrock, Google Cloud) — modify instructions without rebuilding history.

## Migration Notes
- **Lifecycle**: Legacy according to vendor (status *Active (legacy)*, retirement not before July 24, 2027); Anthropic recommends migrating to Claude Opus 5.5 (`claude-opus-5-5`) — where `thinking: disabled` returns 400 at every level, forced tool use is discontinued, and default effort drops to `medium`.
- **MIGRATING FROM claude-opus-5**: Restore explicit verification and self-check steps if the target model does not self-verify; re-evaluate conciseness/scope/delegation cap instructions (they compensate for Opus 5 quirks); remove `fallbacks`, `refusal`, and effort specifics; for target models without adaptive thinking, restore step-by-step scaffolding or `budget_tokens`.
- **MIGRATING TO claude-opus-5**: Remove `budget_tokens` and all sampling parameters; replace assistant prefill with Structured Outputs; check whether any route combines `thinking: disabled` with `xhigh`/`max` (→ 400: keep thinking enabled or lower effort to `high`); increase `max_tokens` for previously thinking-free routes; **prune** verification and progress scaffolding; add conciseness and scope instructions; cap delegation; rerun effort sweep instead of inheriting old defaults; add `refusal` handling; replace instructions to write out reasoning in the response with a brief rationale (`reasoning_extraction`, see Prompting Style).

## Sources
- https://platform.claude.com/docs/en/models/opus-5/overview — covers id `claude-opus-5`, 1M context, 128k output, $5/$25, knowledge cutoff May 2026, default effort `high`, 300k output beta on Batches API, 512-token cache minimum, legacy status with Opus 5.5 as migration target, retirement not before July 24, 2027.
- https://platform.claude.com/docs/en/build-with-claude/thinking — Opus 5: thinking on by default, `disabled` only up to effort `high` (otherwise 400), `budget_tokens` → 400, sampling parameters rejected, `display` default `omitted`, tool calls as text / XML leaks when thinking is disabled.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide — for Opus 4.7 and later: `budget_tokens` removed, sampling parameters rejected, tokenizer roughly 1×–1.35×; differences Opus 5 → Opus 5.5.
- https://platform.claude.com/docs/en/build-with-claude/effort — all five effort levels for Opus 5, default `high`, recommendation to start at `high` with a fresh sweep, `max_tokens` ≥ 64k at `xhigh`/`max`, top-level effort change restarts cache, per-message effort (beta) preserves it (not on Amazon Bedrock).
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching — minimum cacheable prefix 512 tokens for Opus 5 compared to 1024 for Opus 4.8.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 — verbosity / deliverable length, over-verification, scope expansion, subagent cap, self-correction narration, literal instruction following, the two artifacts when thinking is disabled, code review severity filter, reasoning in the response (`reasoning_extraction`).
- https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback — category `reasoning_extraction` and section "Keep reasoning in thinking blocks": typical triggers, replacement with brief rationale or `display: "summarized"`, no fallback model, refusal before any output is billed; server-side fallback Claude API only, `2026-06-01` only explicit list.
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — no beta header, Opus 5 supported (Claude API, Amazon Bedrock, Google Cloud), placement rules.
- https://platform.claude.com/docs/en/build-with-claude/context-windows — 1M context as default without beta header for Opus 5, up to 128k output per request.

---
model: claude-sonnet-4-6
vendor: Anthropic
family: Claude
aliases: [sonnet-4.6, claude-sonnet-4.6, sonnet4.6, sonnet-4-6]
last_verified: 2026-10-13
status: legacy
successor: claude-sonnet-5-5
---

# Claude Sonnet 4.6

## Reasoning / Thinking
- Type: **adaptive, but off by default** — a request without a `thinking` field runs without thinking; enabled with `thinking: {type: "adaptive"}`. `{type: "enabled", budget_tokens: N}` is deprecated (do not use for new code; for legacy code use only as a transitional token ceiling); `{type: "disabled"}` disables thinking.
- Depth control via `output_config.effort`: `low | medium | high | max`, default `high`. `max` is supported, but `xhigh` is not (in the Sonnet family, only introduced with Sonnet 5). Doc recommendation: set effort **explicitly** (otherwise unexpected latency); `medium` is the recommended default for most applications including agentic coding; `low` for chat and high-volume/latency-critical workloads.
- For chat/classification: `thinking: {type: "disabled"}` + `effort: "low"` provides comparable or superior performance at low latency. (unbelegt)
- `thinking.display` default `"summarized"` (readable summary; Sonnet 5/5.5: `"omitted"`).
- Sampling: restrictions apply only when thinking is active — `temperature` and `top_k` are then incompatible, `top_p` only between 0.95 and 1; without thinking, non-default values are allowed (unlike Sonnet 5 onwards, where they always return 400).
- Per-message effort and mid-conversation system messages are not available on Sonnet 4.6; an effort change via the top-level parameter restarts the prompt cache.

## Prompting Style
- Claude 4.6 models are more proactive and can overtrigger on instructions that were necessary for older models — soften thoroughness and tool-pressure phrasing ("If in doubt, use [tool]", "CRITICAL: You MUST use this tool …"); if behavior remains too aggressive, lower effort.
- At release: best balance of speed and intelligence, well-suited for high-volume production workloads. (unbelegt)
- Always parse tool call `input` with a JSON parser (escaping can vary), never match raw strings.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: 1M context window; fast, cost-effective execution with strong instruction following. (unbelegt)
- Weaknesses / quirks: more exploration/tokens at higher `effort` — `medium` is the recommended default according to docs; excessive tool/skill activation with overly aggressive prompts.

## Output & Format Conventions
- Assistant prefill (final assistant turn) returns 400 — use Structured Outputs (`output_config.format`) or system prompt instructions.
- 1M context window, up to 128K output tokens (synchronous Messages API); Message Batches API up to 300K with beta header `output-300k-2026-03-24`; stream large outputs.
- `output_format` (top-level, deprecated) → `output_config.format`.
- Older tokenizer: Sonnet 5 and 5.5 produce approximately 30% more tokens for the same text. Images up to 1,568 px long edge or 1,568 tokens per image. Minimum cacheable prompt 1,024 tokens.
- Pricing per MTok: $3 input / $15 output, cache read $0.30. Reliable knowledge cutoff August 2025.

## Migration Notes
- **Lifecycle**: Sonnet 4.6 is *Legacy* (still available, status "Active (legacy)"); Anthropic recommends migrating to Claude Sonnet 5.5 (`claude-sonnet-5-5`). Retirement not before February 17, 2027 (Anthropic platforms).
- **MIGRATING FROM claude-sonnet-4-6**: Move to Opus for the hardest/longest tasks; move to Haiku for pure speed/cost — Haiku 4.5 lacks the `effort` parameter (remove there), Haiku 5.5 supports it. Migrating to successor Sonnet 5.5: thinking runs there without a `thinking` field, `budget_tokens` and non-default sampling return 400, `display` defaults to `"omitted"`, token counts increase by ~30% (details in the Sonnet 5.5 guide).
- **MIGRATING TO claude-sonnet-4-6**: From Sonnet 4.5, set `effort` **explicitly** (4.6 defaults to `high` → higher latency/costs otherwise). `budget_tokens` → adaptive. Remove `interleaved-thinking-2025-05-14` (adaptive interleaves automatically); replace `fine-grained-tool-streaming-2025-05-14` with `eager_input_streaming: true` per tool; remove `effort-2025-11-24` (unbelegt). Switch back from `client.beta.messages` to `client.messages` (unbelegt). Remove prefills. Soften aggressive tool language.

## Sources
- https://platform.claude.com/docs/en/models/sonnet-4-6/overview — Sonnet 4.6: 1M context, 128K output (batch beta 300K), adaptive thinking (extended deprecated), default effort `high`, $3/$15, cache read $0.30, knowledge cutoff Aug 2025, status legacy, migration recommendation to Sonnet 5.5, retirement not before February 17, 2027.
- https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide — section "Migrating from Claude Sonnet 4.5 or earlier": prefill → 400 (as on 4.6), parse tool input with JSON parser, set effort explicitly, remove `interleaved-thinking-2025-05-14`, replace `fine-grained-tool-streaming-2025-05-14` with `eager_input_streaming: true`, `output_format` → `output_config.format`; plus thinking table (4.6: off without field, default `display` `"summarized"`), cache minimum 1,024, ~30% more tokens, and 1,568 px image limits compared to Sonnet 5.5.
- https://platform.claude.com/docs/en/build-with-claude/effort — effort levels (max for Sonnet 4.6, no xhigh); section "Recommended effort levels for Claude Sonnet 4.6" (medium recommended, set effort explicitly); per-message effort not on Sonnet 4.6, top-level change breaks cache; model list with Haiku 5.5, without Haiku 4.5.
- https://platform.claude.com/docs/en/build-with-claude/thinking — configuration table (Sonnet 4.6: without field no thinking, `enabled` deprecated, `disabled` possible), `display` default `"summarized"`, sampling rules for older models, prefill → 400 starting in Claude 4.6.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — "Migration considerations" (Claude 4.6 models more proactive, overtriggering; prefill replacement) and tool overtriggering examples ("CRITICAL: You MUST …", "If in doubt …").
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — model list of mid-conversation system messages (Sonnet 4.6 not included).

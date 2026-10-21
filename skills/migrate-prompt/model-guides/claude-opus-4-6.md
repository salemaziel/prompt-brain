---
model: claude-opus-4-6
vendor: Anthropic
family: Claude
aliases: [opus-4.6, claude-opus-4.6, opus4.6]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.6

## Reasoning / Thinking
- Type: **adaptive (extended deprecated), off by default**. No thinking without a `thinking` field; recommended is `thinking: {type: "adaptive"}`. `thinking: {type: "enabled", budget_tokens: N}` still functions, but is deprecated; `{type: "disabled"}` is allowed. No `thinking.type` is rejected with 400.
- Depth control via `output_config.effort`: `low | medium | high | max`, default `high`. `xhigh` is not listed for Opus 4.6.
- `thinking.display` is `"summarized"` by default; the first lines of thinking output are more detailed (useful for prompt engineering).
- More preliminary exploration than predecessor, especially at high effort: sometimes gathers extensive context unprompted or pursues multiple research angles; can think extensively, inflating thinking tokens and latency. Countermeasures: constrain reasoning via prompt instructions or lower effort. A hard cost ceiling via `budget_tokens` still works, but is deprecated — lowering effort or using `max_tokens` as a hard limit is preferred.
- Interleaved thinking is automatic with adaptive thinking (no beta header).
- Sampling parameters: The 400 rule for non-default values only applies starting with Claude 4.7. On Opus 4.6, restrictions apply only when thinking is active: `temperature`/`top_k` are incompatible, `top_p` only between 0.95 and 1.

## Prompting Style
- **Soften aggressive language**: Opus 4.6 reacts more strongly to the system prompt than earlier models; prompts written against undertriggering lead to overtriggering. "CRITICAL: You MUST use this tool when…" → "Use this tool when…".
- **Targeted rather than blanket defaults**: replace "Default to using [tool]" with "Use [tool] when it would enhance your understanding of the problem"; remove over-prompting like "If in doubt, use [tool]".
- **Decision discipline**: to counter sprawling deliberation, instruct the model to commit to one approach and stick with it unless contradictory information emerges.
- **Cap sub-agents**: strong tendency to spawn sub-agents even where a direct method (e.g. a `grep`) suffices — state explicitly when delegation is appropriate and when it is not.
- **Reign in overengineering**: tendency toward extra files, unnecessary abstractions, and unrequested flexibility — add instructions to keep solutions minimal.
- **Safeguard high-risk actions**: without guidance, the model may execute hard-to-reverse actions (deleting files, force-pushing, posting to external services). Require confirmation for destructive, hard-to-reverse, or externally visible actions in the prompt.
- **No assistant prefill**: starting in Opus 4.6, a prefilled final assistant turn returns 400 — use Structured Outputs or system prompt instructions.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: improved vision, particularly in image processing and data extraction with multiple images in context; more reliable reading of screenshots and UI elements in computer use; builds complex web applications with strong frontend design.
- Weaknesses / quirks: without design guidelines, resorts to generic patterns ("AI slop" aesthetics); overtriggering on tools, over-use of sub-agents, overengineering, overthinking (see above).
- Reliable knowledge cutoff May 2025 (training data cutoff August 2025).

## Output & Format Conventions
- 1M context window, 128K output tokens synchronous; up to 300K via Message Batches API with beta header `output-300k-2026-03-24`. Input: text and images, output: text.
- Pre-Opus 4.7 generation tokenizer: 1M tokens correspond to roughly 750k words; the same text requires up to ~35% more tokens starting in Opus 4.7.
- No prefill; fixed formats via Structured Outputs (`output_config.format`) or system prompt.
- Tool call arguments may be escaped differently than in predecessors (Unicode, slashes) — always parse `input` via JSON parser, never match as a raw string.
- Forced tool use (`tool_choice` `any`/`tool`) works with adaptive thinking; with extended thinking, only `auto`/`none`.
- Bedrock via InvokeModel integration only (`anthropic.claude-opus-4-6-v1`).

## Migration Notes
- **Lifecycle**: Legacy, status Active; retirement not before February 5, 2027. Anthropic recommends migrating to Claude Opus 5.5.
- **MIGRATING FROM claude-opus-4-6 to Opus 4.7+/Opus 5.5**: `budget_tokens` returns 400 starting in 4.7 → switch to adaptive plus effort, perform effort sweep instead of budget conversion; remove `temperature`/`top_p`/`top_k`; `display` silently becomes `omitted` → set `display: "summarized"` for UI display; new tokenizer (up to ~1.35×): re-evaluate `max_tokens`, compaction triggers, and client-side token estimates; image tokens up to ~3× higher, remove coordinate scaling; remove forced progress scaffolding; anticipate cyber safeguards. For Opus 5.5 additionally: thinking always on, default effort `medium`, forced tool use rejected.
- **MIGRATING FROM claude-opus-4-6 to Opus 4.5**: `adaptive` → 400, only `budget_tokens`; context 200K, output 64K, no `max`/`xhigh`; prefill allowed again (only without active thinking).
- **MIGRATING TO claude-opus-4-6** (from 4.5 or older): Remove prefills; parse tool input via JSON parser; switch to adaptive thinking plus effort; tone down aggressive tool language and anti-laziness prompts; add minimalism, sub-agent, and confirmation rules.

## Sources
- https://platform.claude.com/docs/en/models/opus-4-6/overview — legacy status, model ID `claude-opus-4-6`, 1M context, 128K output (300K batch beta), thinking "Adaptive (extended deprecated)", default effort `high`, knowledge cutoff May 2025, retirement not before February 5, 2027, Bedrock InvokeModel ID, migration recommendation to Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-46 — breaking changes starting in Opus 4.7 (`budget_tokens`, sampling parameters, thinking display, tokenizer, prefill since 4.6), behavioral changes (progress updates, cyber safeguards, high-res images), tool parameter escaping since 4.6.
- https://platform.claude.com/docs/en/about-claude/model-deprecations — status Active, retirement "Not sooner than February 5, 2027"; sampling parameter 400 only starting with Claude 4.7.
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.6 in the list "Legacy models (still available)"; extended thinking deprecated on Opus 4.6; words per token prior to Opus 4.7 tokenizer.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — Opus 4.6 specific: system prompt responsiveness / overtriggering, overthinking and preliminary exploration, `budget_tokens` deprecated, sub-agent tendency, overengineering, risky actions, vision, frontend design.
- https://platform.claude.com/docs/en/build-with-claude/effort — effort levels (`max` yes, `xhigh` not for Opus 4.6), default `high`.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.6: adaptive plus extended (deprecated), default off, no rejected thinking types.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display` default `summarized` on Opus 4.6, sampling rules of older models, prefill starting in Claude 4.6 → 400, forced tool use only with adaptive thinking.

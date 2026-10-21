---
model: claude-opus-4-5
vendor: Anthropic
family: Claude
aliases: [opus-4.5, claude-opus-4.5, opus4.5, claude-opus-4-5-20251101]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.5

## Reasoning / Thinking
- Type: **extended thinking only, off by default**. Enabled manually with `thinking: {type: "enabled", budget_tokens: N}`; `thinking: {type: "adaptive"}` returns 400.
- Opus 4.5 is the only extended thinking model with an `effort` parameter: effort and `budget_tokens` work together — first select the effort level for the task, then set the thinking budget according to the required reasoning depth. Default `high`; `xhigh` and `max` are not listed for Opus 4.5.
- `thinking.display` provides summarized thinking by default (`"summarized"`).
- Interleaved thinking (thinking between tool calls) requires a beta header (`interleaved-thinking-2025-05-14`) in manual mode and alters budget accounting.
- When thinking is active: `temperature`/`top_k` incompatible, `top_p` only between 0.95 and 1; forced tool use (`tool_choice` `any`/`tool`) not possible, only `auto`/`none`; no assistant prefill.
- **Without extended thinking**, Opus 4.5 responds particularly sensitively to the word "think" and its variations — use alternatives such as "consider", "evaluate", or "reason through".

## Prompting Style
- **Soften aggressive language**: Opus 4.5 reacts more strongly to the system prompt than earlier models; tool/skill instructions written against undertriggering lead to overtriggering. "CRITICAL: You MUST use this tool when…" → "Use this tool when…".
- **Reign in overengineering**: tendency toward extra files, unnecessary abstractions, and unrequested flexibility — instruct the model to keep solutions minimal.
- **Word choice with thinking disabled**: replace "think" and its variants in prompts with "consider", "evaluate", or "reason through" (see above).
- **Prefill is allowed** as long as thinking is off — a pattern rejected with 400 starting in Opus 4.6.
- **Provide frontend specifications**: without design guidelines, the model resorts to generic patterns ("AI slop" aesthetics); specify typography, colors, and interactions explicitly.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: improved vision, particularly in image processing and data extraction with multiple images; more reliable reading of screenshots and UI elements in computer use; complex web applications with strong frontend design.
- Weaknesses / quirks: overtriggering with overly emphatic tool language, overengineering, sensitivity to "think" without thinking enabled; smaller context window than all subsequent Opus models.
- Reliable knowledge cutoff May 2025 (training data cutoff August 2025).

## Output & Format Conventions
- 200K context window (approx. 150k words), 64K output tokens; the 300K output beta of the Batches API is not available for Opus 4.5. Input: text and images, output: text.
- Dated model ID: `claude-opus-4-5-20251101`; `claude-opus-4-5` is a convenience alias pointing to the dated ID. Google Cloud: `claude-opus-4-5@20251101`; Bedrock via InvokeModel only (`anthropic.claude-opus-4-5-20251101-v1:0`).
- Tokenizer prior to Opus 4.7 generation: the same text requires up to ~35% more tokens starting with Opus 4.7.
- Structured Outputs via `output_config.format`; older `output_format` is deprecated and requires beta header `structured-outputs-2025-11-13`, otherwise 400.
- The `effort` parameter no longer requires a beta header (`effort-2025-11-24` can be omitted).

## Migration Notes
- **Lifecycle**: Legacy, status Active; retirement not before November 24, 2026 — the earliest date among currently available Opus models. Anthropic recommends migrating to Claude Opus 5.5.
- **MIGRATING FROM claude-opus-4-5 to Opus 4.6+/Opus 5.5**: Remove assistant prefills (starting in 4.6 → 400) and replace with Structured Outputs or system prompt instructions; parse tool call `input` via JSON parser (altered escaping starting in 4.6); migrate from `client.beta.messages.create()` to `client.messages.create()`; remove beta headers `effort-2025-11-24`, `fine-grained-tool-streaming-2025-05-14`, and `interleaved-thinking-2025-05-14`; update `output_format` → `output_config.format`; migrate `budget_tokens` → adaptive thinking plus effort (mandatory starting in 4.7). Then apply all steps from Opus 4.6 onwards (sampling parameters, thinking display, tokenizer, visual tokens) and for Opus 5.5: thinking always on, default effort `medium`, and prohibition of forced tool use.
- **MIGRATING TO claude-opus-4-5** (from newer models): Replace adaptive thinking with `thinking: {type: "enabled", budget_tokens: N}` and set effort to at most `high`; tailor prompts and outputs to 200K context / 64K output; with thinking active, avoid forced tool use, prefill, and non-default `temperature`/`top_k`; rephrase "think" in prompts when thinking is disabled.

## Sources
- https://platform.claude.com/docs/en/models/opus-4-5/overview — legacy status, model ID `claude-opus-4-5-20251101` with alias `claude-opus-4-5`, platform IDs, 200K context, 64K output, thinking "Extended", default effort `high`, knowledge cutoff May 2025, retirement not before November 24, 2026, migration recommendation to Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-45 — breaking changes starting in 4.5 (prefill, tool parameter escaping) and recommended steps (adaptive thinking, removing beta namespace and beta headers, `output_config.format`).
- https://platform.claude.com/docs/en/about-claude/model-deprecations — `claude-opus-4-5-20251101` status Active, retirement "Not sooner than November 24, 2026".
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.5 in the list "Legacy models (still available)"; alias before 4.6 generation as convenience pointer to dated ID; 200K tokens ≈ 150k words.
- https://platform.claude.com/docs/en/build-with-claude/effort — Opus 4.5 as the only extended thinking model with effort, interaction with `budget_tokens`, `xhigh`/`max` not listed for Opus 4.5, no beta header required.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.5: extended thinking only, default off, `adaptive` → 400.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display` default `summarized` on older models, interleaved thinking in manual mode via beta header, sampling / prefill / forced tool use limits when thinking is active, 64K output without batch extension.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — Opus 4.5 specific: "think" sensitivity without extended thinking, system prompt responsiveness / overtriggering, overengineering, vision, frontend design.

---
model: claude-haiku-5-5
vendor: Anthropic
family: Claude
aliases: [haiku, haiku-5.5, claude-haiku-5.5, haiku5.5]
last_verified: 2026-10-13
status: current
---

# Claude Haiku 5.5

## Reasoning / Thinking
- Type: **adaptive, on by default**. Requests without a `thinking` field engage in thinking (Haiku 4.5: without the field, no thinking occurs). Omit `thinking` or send `{type: "adaptive"}`.
- `thinking: {type: "enabled", budget_tokens: N}` → 400. Haiku 5.5 is the **first Haiku model with effort**: `output_config.effort` = `low | medium | high | xhigh | max`, default **`medium`** (an explicitly set default behaves the same as an omitted parameter).
- Disabling thinking: `thinking: {type: "disabled"}` works **only at `low`, `medium`, and `high`**; at `xhigh`/`max` → 400 (`output_config.effort 'xhigh' is not supported when thinking is disabled on this model.`). According to docs, lowering effort is a better lever than disabling it; a prompt instruction to "answer directly" did not suppress thinking in Anthropic's tests.
- Thinking tokens count against `max_tokens` (up to 128,000): limits set too tightly terminate with `stop_reason: "max_tokens"` after a `thinking` block, without any text.
- Thinking blocks from earlier assistant turns remain in context and are billed as input (Haiku 4.5 retained only those from the last turn).
- `thinking.display` default `"omitted"`: blocks arrive with an empty `thinking` field and only the `signature`; `display: "summarized"` returns the summary (Haiku 4.5: summarized by default).
- Forced `tool_choice` (`any` or a named tool) is accepted, but the response then begins directly with the tool call **without** a thinking block.
- Sampling: `temperature` only `1`, `top_p` only `0.99`; any other value, any `top_k`, and `temperature` combined with `top_p` → 400.
- Thinking blocks are bound to the generating account (or a linked account); replaying across another account silently discards them. A returned block is valid only as long as `system`, `tools`, and prior `messages` remain unchanged, otherwise 400 (for accounts created before August 31, 2026, only with `thinking.block_binding.prefix_mismatch_behavior` set).

## Prompting Style
- Anthropic: existing **Haiku 4.5 prompts should run well without changes** — make targeted adjustments based on observed behavior, not blanket changes.
- **effort instead of thinking budget**: compare two to three levels on your own evals. `low` for chat, short tool tasks, and simple bulk requests; `medium` (default) for most tasks including agentic coding; `high` for knowledge work, longer agent tasks, and strict instruction following; `xhigh`/`max` only with measurable gains, then benchmark against Sonnet 5.5.
- **Search**: for search tools, provide the current date in the system prompt or tool description; at `low` and with long system prompts, additionally include the doc guideline that training data is outdated and "latest" facts must be searched. Avoid blanket "always search" instructions (leads to more unnecessary searches without better answers).
- **Long agent prompts at `low`**: tendency toward premature termination and unverified code changes — add the doc building blocks "keep working until done, no unrequested extras" and "run a real test/build/typecheck before reporting done", or raise effort (costs more output tokens).
- **Chatbots**: add a sentence stating that system prompt rules apply throughout the entire conversation, even if users argue or insist; for critical instruction following, additionally use `high`.
- Never put **mid-turn user inputs** into `tool_result` blocks (the model may ignore them as untrusted); instead, place them as a text block after the last `tool_result` in the user turn; harness notices belong in a separate mid-conversation system message.
- Introduce new system prompt lines only in **new** conversations; ongoing conversations receive changes in the latest turn or as an appended system message (otherwise 400 due to modified prefix).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: built for high-volume, latency-critical tasks such as classification, routing, extraction, and sub-agents; lowest latency in the current lineup according to model overview ("Fastest") and lowest prices; adaptive thinking + effort, 1M context; browser use tool (`browser_toolset_20260801`) on Claude API and Google Cloud.
- Weaknesses / quirks: at `low`, more prone to skipped searches, premature stopping, and omitted checks; with thinking disabled **plus** JSON output via Structured Outputs, necessary tool calls are sometimes skipped (remedy: adaptive thinking, omit `output_config.format` when tools are required, force `tool_choice`, or add the doc line "JSON applies only to final response"); reasoning-like text in the visible response, more frequent with thinking disabled or at `low` (remedy: adaptive + `medium`); at `xhigh` in multi-turn chats, sometimes the entire answer appears in thinking with empty visible text.
- Safety classifiers can refuse: `stop_reason: "refusal"` with `stop_details.category` (`cyber`, `frontier_llm`, `bio`, `general_harms`) — new compared to Haiku 4.5; **no** server-side fallback, resending usually yields another refusal.

## Output & Format Conventions
- 1M context window, 128k output tokens; up to 300k via Message Batches API with beta header `output-300k-2026-03-24`. Input: text and images → text. Reliable knowledge cutoff Jun 2026.
- **New tokenizer** (same as Claude 4.7+): same text ≈ 30% more tokens than on Haiku 4.5 — re-evaluate `max_tokens`, token counts, and cost estimates.
- **High-resolution image tier**: downscaling only above 2,576 px long edge or 4,784 visual tokens (Haiku 4.5: 1,568 px / 1,568 tokens); a 2000×1500 image costs approximately 2.5× as many visual tokens.
- **No assistant prefill** (400, even with thinking disabled) — end `messages` with a user turn; control format via Structured Outputs or tools with enum fields; suppress preambles via system prompt.
- Structured Outputs (`output_config.format`) available on Claude API and others, **not on Amazon Bedrock** — describe format in prompt there or use a tool without `strict` and validate yourself.
- Responses may start with `thinking` blocks: select content blocks by `type`, not by position.
- Pricing per MTok, tiered by prompt length: up to 100k tokens $0.10 input / $0.50 output, above that $0.50 / $2.50; cache read $0.01 and $0.05 respectively; batch −50%. Minimum cacheable prompt: 512 tokens (Haiku 4.5: 4,096).
- Model IDs: Claude API, Google Cloud, Microsoft Foundry, Claude Platform on AWS `claude-haiku-5-5` (fixed ID without date suffix and without separate alias); Amazon Bedrock `anthropic.claude-haiku-5-5`. Status *Active (latest)*, release October 7, 2026, retirement not before October 7, 2027.

## Migration Notes
- **MIGRATING TO claude-haiku-5-5**:
  - Specifically **from claude-haiku-4-5**: Swap model ID; recount prompts and size `max_tokens` with headroom for thinking; replace `enabled` + `budget_tokens` with adaptive thinking + effort (choose a lower effort level where Haiku 4.5 ran without thinking or with a small budget); read blocks by `type` instead of position; remove `temperature`/`top_p`/`top_k` and steer behavior via prompt; replace prefill with a trailing user turn; replace `computer_20250124` (Claude API/Google Cloud: `computer_toolset_20260801`, Bedrock: `computer_20251124` + `computer-use-2025-11-24`); run replays across the generating account; keep conversations append-only; handle `stop_reason: "refusal"`; replace Structured Outputs on Bedrock with prompt formatting + custom validation. Priority Tier is not supported on Haiku 5.5 — plan capacity separately.
  - Specifically **from claude-3-5-haiku / claude-3-haiku or earlier**: Additionally replace `claude-3-5-haiku-20241022` / `claude-3-5-haiku-latest` / `claude-3-haiku-20240307` (both retired on Claude API); update `code_execution_20250522` → `code_execution_20250825` or newer; text editor to `text_editor_20250728`; handle `refusal` and `model_context_window_exceeded`; permit trailing newlines in tool string parameters; overhaul prompts — Claude 4+ models communicate more concisely and directly, requiring explicit instructions.
- **MIGRATING FROM claude-haiku-5-5 (to Haiku 4.5)**: No dedicated guide exists for this direction; based on Haiku 4.5 specifications: remove effort (unsupported there) and control thinking via `enabled` + `budget_tokens` (without a `thinking` field, Haiku 4.5 runs without thinking); sampling parameters and prefill (with thinking disabled) are permitted again there; limit context to 200K and output to 64K.
- Reasoning chain compatibility: Haiku 5.5 reads thinking blocks from Sonnet 5, Opus 4.8, Haiku 4.5, and older models, **not** from Opus 5, Opus 5.5, Sonnet 5.5, Fable, or Mythos (silently discarded).

## Sources
- https://platform.claude.com/docs/en/models/haiku-5-5/overview — id `claude-haiku-5-5` and platform IDs, 1M context / 128k output (300k batch beta), tiered pricing incl. cache write/read, thinking adaptive, default effort `medium`, latency "Fastest", knowledge cutoff Jun 2026, status *Active (latest)*, release October 7, 2026, retirement not before October 7, 2027, sampling notes, 512-token cache minimum, ~30% more tokens than Haiku 4.5.
- https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5 — change overview compared to Haiku 4.5 (new, breaking, changed), browser use tool, refusals without fallback, thinking blocks preserved in context, cache minimum 512 instead of 4,096.
- https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide — checklists "Every starting model" and "Claude Haiku 3.5 or earlier", model ID table, tokenizer and high-resolution image tier, thinking configuration, sampling and prefill 400, computer use toolset, account binding, append-only check, no Priority Tier, no Structured Outputs on Bedrock, readability of foreign thinking blocks.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5 — Haiku 4.5 prompts run without changes, effort recommendations per level, `disabled` only up to `high`, search date, JSON output with custom tools, early stopping, verification in coding agents, mid-turn user inputs, system prompt fidelity, reasoning in visible text, refusal categories.
- https://platform.claude.com/docs/en/build-with-claude/effort — Haiku 5.5 supports all five levels, default `medium`, default explicitly set = omitted, per-message effort (beta) and 400 on effort change with thinking disabled.
- https://platform.claude.com/docs/en/build-with-claude/thinking — configuration matrix (no field = adaptive, `enabled` 400, `disabled` up to `high`), `display` default `"omitted"`, preservation of earlier thinking blocks, sampling rules.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — exact error message for `disabled` at `xhigh`/`max`, no thinking block on forced `tool_choice`, prefix check errors.
- https://platform.claude.com/docs/en/models/haiku-4-5/overview — comparison values of predecessor (200K context, 64K output, extended thinking, effort "Not supported") for reverse direction.
- https://platform.claude.com/docs/en/models/overview — Haiku 5.5 in current lineup ("Fastest", "From $0.10 / input MTok"), Haiku 4.5 under "Legacy models (still available)".

---
model: claude-opus-4-8
vendor: Anthropic
family: Claude
aliases: [opus-4.8, claude-opus-4.8, opus4.8, opus-4-8]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.8

## Reasoning / Thinking
- Type: **adaptive, off by default**. Without a `thinking` field, the request runs without thinking; `thinking: {type: "adaptive"}` enables it; `{type: "disabled"}` is permitted (no thinking). `thinking: {type: "enabled", budget_tokens: N}` returns 400.
- Depth control via `output_config.effort`: `low | medium | high | xhigh | max`, default `high`. Start with `xhigh` for coding/agentic use cases, at least `high` for intelligence-critical tasks; move to `medium`/`low` only when evals confirm quality. `max` may lean toward overthinking. According to documentation, effort is more critical for this model than for any prior Opus.
- Adheres strictly to effort, especially at the lower end: at `low`/`medium`, it stays focused strictly on what is asked; risk of under-thinking on moderately difficult tasks at `low` → raise effort rather than over-prompting (use a targeted instruction pointing to multi-step reasoning only under latency constraints).
- Adaptive thinking triggering is steerable: with large, complex system prompts, the model may think more often than desired — add an instruction to deliberate only on multi-step problems and answer directly otherwise.
- `thinking.display` is `"omitted"` by default (empty thinking blocks). Set `display: "summarized"` for visible summaries.
- Non-default values for `temperature`/`top_p`/`top_k` return 400 on every request — steer via prompt + effort.
- At `xhigh`/`max`, set a large `max_tokens` (starting at 64k) so ample room remains for thinking across subagents and tool calls.

## Prompting Style
- Runs well on existing Opus 4.7 prompts without changes according to docs; on the API side, only 1M context as default and mid-conversation system messages were added since 4.7.
- Calibrates response length based on perceived task complexity (concise for simple lookups, detailed for open-ended analysis). Where a fixed length is required by the product, add a conciseness instruction; positive examples work better than prohibitions.
- Delivers more regular, higher-quality progress updates during long agentic runs. Remove existing "after every N tool calls" scaffolding; if needed, explicitly describe the desired length/content of updates and provide examples.
- Interprets prompts literally (especially at low effort), does not silently generalize instructions to other cases, and does not infer unstated requirements — state scope explicitly ("apply to every section, not just the first").
- Prefers reasoning over tool calls and launches fewer subagents by default. Higher effort (`high`/`xhigh`) increases tool usage; additionally explain in the prompt when and why a tool (e.g. web search) should be used, and define explicitly when subagents are appropriate.
- Interactive coding products: specify task, intent, and constraints fully in the first user turn — the model is more autonomous than predecessors and thinks more after every user turn; incrementally appended specifications consume tokens and sometimes degrade quality.
- Mid-conversation system messages (no beta header required): append `{"role":"system"}` directly after a user turn in `messages[]` instead of changing the top-level system prompt (preserves the prompt cache); Claude API, Amazon Bedrock, Google Cloud.
- Frontend: persistent default house style (cream background, serif display font, terracotta/amber accents). Generic counter-instructions merely shift the palette — specify a concrete alternative or request multiple distinct design directions upfront.

## Strengths & Weaknesses (prompt-relevant)
- Strengths according to docs: long agentic runs, knowledge work, vision, and memory tasks; superior bug-finding ability at release compared to prior models (higher recall and precision in internal evals).
- Prose: direct, opinionated style with minimal filler validation and sparse emoji usage — if the product requires a warmer tone, specify the persona explicitly.
- Weaknesses / quirks: adheres strictly to effort (under-thinking risk on moderately difficult tasks at `low`/`medium`); under-utilization of tools/subagents without explicit triggers; higher token consumption in interactive multi-turn sessions than in autonomous single-turn runs.
- Code review: follows "high severity only" / "be conservative" filters literally → measured recall may drop. Use an "everything reported (with confidence and severity), filtering in a separate step" pattern or define the threshold concretely.

## Output & Format Conventions
- Assistant prefill (final assistant turn) returns 400 — use Structured Outputs (`output_config.format`) or system prompt instructions instead.
- 1M context window by default (no beta header), up to 128K output tokens; up to 300K via Message Batches API with beta header `output-300k-2026-03-24`. The SDK requires streaming when `max_tokens` > 21,333 (`.stream()` / `get_final_message()`).
- Parse tool call `input` with a standard JSON parser, not raw string matching.
- Tokenizer same as Opus 4.7: roughly 1×–1.35× as many tokens for the same text compared to models before Opus 4.7.
- Pricing per MTok: input $5, output $25, 5m cache write $6.25, 1h cache write $10, cache read $0.50; batch 50% discount. Minimum cacheable prefix: **1024 tokens**. Reliable knowledge cutoff Jan 2026.
- Computer Use: `computer_toolset_20260801` (Claude API, Google Cloud) and the older `computer_20251124`; on Claude API and Google Cloud additionally the browser use tool. Images up to 2576px / 3.75 MP; 1080p is considered a good balance of performance and cost according to docs.
- Model IDs: `claude-opus-4-8` (Claude API, Google Cloud, Microsoft Foundry, Claude Platform on AWS), Bedrock `anthropic.claude-opus-4-8`.

## Migration Notes
- **Lifecycle**: Legacy according to vendor (status *Active (legacy)*, retirement not before May 28, 2027); Anthropic recommends migrating to Claude Opus 5.5 (`claude-opus-5-5`).
- **MIGRATING FROM claude-opus-4-8 (to Opus 5.5)**: Requests without a `thinking` field always think there — re-budget `max_tokens` (thinking plus text) and output costs; `thinking: {type: "disabled"}`, forced `tool_choice` (`any`/`tool`), and on Claude API/Google Cloud `computer_20251124` return 400; default effort drops to `medium` (set explicitly, re-sweep); cache minimum drops to 512 tokens; Priority Tier is discontinued; text between tool calls arrives as a `thinking` block instead of `text`.
- **MIGRATING FROM claude-opus-4-8 (to other/older models)**: Re-introduce more prescriptive scaffolding and explicit step-by-step instructions if needed; only restore prefill if permitted by the target guide; `effort`/`xhigh` may not be available → control depth via prompt.
- **MIGRATING TO claude-opus-4-8**: From Opus 4.7, swapping model ID plus prompt re-tuning is sufficient; instruction updates can be transitioned to mid-conversation system messages (Opus 4.7 rejects `role: "system"` in `messages` with 400), remove context beta headers. From 4.6 or older additionally: `budget_tokens` → adaptive thinking + effort, remove `temperature`/`top_p`/`top_k`, remove prefills, recalibrate costs and `max_tokens` for the new tokenizer and high-res images (up to ~3× image tokens). Then adjust behavior: conciseness instruction if fixed length needed, remove progress scaffolding, make tool/subagent triggers explicit, start effort at `xhigh`, review style prompts against the more direct tone.

## Sources
- https://platform.claude.com/docs/en/models/opus-4-8/overview — id `claude-opus-4-8` and platform IDs, 1M context, 128K output / 300K batch beta, $5/$25 plus cache pricing, thinking "Adaptive", default effort `high`, knowledge cutoff Jan 2026, status *Active (legacy)*, retirement not before May 28, 2027, recommendation to migrate to Opus 5.5.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 — runs on Opus 4.7 prompts, length calibration by complexity, effort recommendations and strict effort adherence (under-thinking at `low`), steerable thinking triggering, reasoning before tool calls, fewer subagents, more regular progress updates, literal instruction following, direct prose style, interactive coding products ("more autonomous than prior models"), code review severity filters, frontend house style, computer use.
- https://platform.claude.com/docs/en/build-with-claude/effort — effort levels including `xhigh`/`max`, default `high`, Opus 4.8 recommendation (start `xhigh` for coding/agentic), 64k `max_tokens` at `xhigh`/`max`.
- https://platform.claude.com/docs/en/build-with-claude/thinking — model table (no field = thinking off, `adaptive` on, `budget_tokens` 400, `disabled` off), `display` default `omitted`, sampling parameters → 400, prefill → 400 starting in Claude 4.6, streaming mandatory in SDK when `max_tokens` > 21,333.
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages — no beta header needed, Opus 4.8 supported (Claude API, Amazon Bedrock, Google Cloud), placement rules.
- https://platform.claude.com/docs/en/build-with-claude/context-windows — 1M as default without beta header for Opus 4.8.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-4-8 — path from Opus 4.8 to Opus 5.5 (thinking on requests without field, 512 instead of 1024 cache minimum, Priority Tier), sections on Opus 4.7 (mid-conversation system messages, context headers) and 4.6 and older (sampling, `budget_tokens`, prefill, tokenizer 1×–1,35×, high-res images, JSON parsing of tool inputs).

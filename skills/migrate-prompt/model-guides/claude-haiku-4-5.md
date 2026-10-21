---
model: claude-haiku-4-5
vendor: Anthropic
family: Claude
aliases: [haiku-4.5, claude-haiku-4.5, haiku4.5, haiku-4-5, claude-haiku-4-5-20251001]
last_verified: 2026-10-13
status: legacy
successor: claude-haiku-5-5
---

# Claude Haiku 4.5

## Reasoning / Thinking
- Type: **extended thinking (manual)** via `thinking: {type: "enabled", budget_tokens: N}`; `budget_tokens` at least 1,024 and less than `max_tokens`. Without the `thinking` field, no thinking occurs; `{type: "adaptive"}` → 400 (`adaptive thinking is not supported on this model`).
- The **`effort` parameter is not supported** (model page: default effort "Not supported") — unlike Haiku 5.5 as well as Opus models starting with 4.5, Sonnet models starting with 4.6, and Fable models. Depth is controlled solely via `budget_tokens`. The specific error behavior when sending `effort` is not described on verified pages (unbelegt).
- Budget tuning according to docs: start near 1,024 for simple tasks and increase incrementally; start from ~16,000 for complex tasks; run budgets over 32k via the Batch API. The budget is a target, not a hard upper limit; `max_tokens` remains the ceiling.
- **No interleaved thinking** (the beta header is accepted on the Claude API, but ignored). Forced `tool_choice` (`any`/`tool`) cannot be combined with extended thinking (error); only `auto` or `none`.
- Thinking blocks: only those from the last assistant turn are preserved; earlier blocks are automatically removed by the API. `thinking.display` default `"summarized"`.
- Sampling: `temperature`, `top_p`, `top_k` are accepted; **when thinking is active**, `temperature` and `top_k` are incompatible, and `top_p` is only allowed between 0.95 and 1.

## Prompting Style
- Clear, direct, explicit instructions: Claude 4 and later models communicate more concisely and directly, requiring explicit instructions rather than implied expectations.
- Keep prompts concise and simple; a larger model is better suited for complex multi-step reasoning. (unbelegt)
- Use Structured Outputs for fixed output formats; assistant prefill only works with thinking disabled.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: fast, cost-effective model of the 4.5 generation ($1 / $5 per MTok); according to the model overview, Haiku 5.5 now has the lowest latency ("Fastest") and lower list prices. Well-suited for high-volume, clearly bounded tasks. (unbelegt: Einsatzprofil)
- Weaknesses: no `effort`, no adaptive and no interleaved thinking; 200K context; reliable knowledge cutoff Feb 2025 (training data cutoff Jul 2025). Lower reasoning depth than Opus/Sonnet — structure complex logic explicitly in the prompt. (unbelegt)

## Output & Format Conventions
- 200K context window, up to 64K output tokens; no 300k batch output beta. Input: text and images → text; images at standard resolution tier (downscaling above 1,568 px long edge or 1,568 visual tokens).
- Structured Outputs are supported (`output_config.format`). On Amazon Bedrock, only via legacy integration (InvokeModel), not via "Claude in Amazon Bedrock".
- Assistant prefill is accepted when thinking is disabled; prefill is not possible when thinking is active.
- Computer Use via `computer_20250124` with beta header `computer-use-2025-01-24`; the browser use tool is not supported.
- Pricing per MTok: input $1, output $5, 5m cache write $1.25, 1h cache write $2, cache read $0.10; batch −50%. Minimum cacheable prompt: 4,096 tokens.
- Model IDs: Claude API `claude-haiku-4-5-20251001` (alias `claude-haiku-4-5`); Amazon Bedrock `anthropic.claude-haiku-4-5` (InvokeModel `anthropic.claude-haiku-4-5-20251001-v1:0`); Google Cloud `claude-haiku-4-5@20251001`; Microsoft Foundry and Claude Platform on AWS `claude-haiku-4-5`.

## Migration Notes
- **Lifecycle**: Model overview and model page classify Haiku 4.5 as **legacy** (status "Active (legacy)", successor Claude Haiku 5.5); the deprecations table lists `claude-haiku-4-5-20251001` as active with retirement not before October 15, 2026. Check the latest status on the deprecations page before migrating TO Haiku 4.5.
- **MIGRATING FROM claude-haiku-4-5**:
  - Specifically **from claude-haiku-4-5 (to Haiku 5.5)**: According to Anthropic, existing Haiku 4.5 prompts run well without changes; required changes are on the API side — `budget_tokens` → adaptive thinking + effort, remove sampling parameters and prefill, replace `computer_20250124`, account for ~30% more tokens and thinking within `max_tokens` (details in guide `claude-haiku-5-5`).
  - Specifically **from claude-haiku-4-5 (to Opus/Sonnet)**: `effort` and adaptive thinking become available — depth can be controlled more granularly; model-specific restrictions apply depending on the target model (sampling, prefill, `budget_tokens`).
- **MIGRATING TO claude-haiku-4-5**: Remove the `effort` parameter from requests; replace adaptive thinking with `enabled` + `budget_tokens` (otherwise 400); limit context to 200K and output to 64K; thinking text returns as summarized; simplify prompts and scope tasks narrowly. (unbelegt: letzter Punkt)

## Sources
- https://platform.claude.com/docs/en/models/haiku-4-5/overview — legacy status ("Active (legacy)"), successor Haiku 5.5, model IDs per platform incl. alias, 200K context, 64K output, $1/$5 plus cache pricing, thinking "Extended", default effort "Not supported", knowledge cutoff Feb 2025 / training Jul 2025, retirement not before October 15, 2026.
- https://platform.claude.com/docs/en/build-with-claude/thinking — configuration matrix (no field = no thinking, `adaptive` 400, `enabled` = extended thinking), `display` default `"summarized"` for older models, sampling and prefill rules when thinking is active, no interleaved thinking, only last turn preserved, `tool_choice` restriction in manual mode.
- https://platform.claude.com/docs/en/build-with-claude/extended-thinking — `budget_tokens` ≥ 1,024 and < `max_tokens`, budget tuning (1,024 / 16,000 / batch over 32k), interleaved header ignored on Haiku 4.5, migration to adaptive thinking.
- https://platform.claude.com/docs/en/build-with-claude/effort — `supportedModels` without Haiku 4.5 (includes Haiku 5.5, Opus starting at 4.5, Sonnet starting at 4.6, Fable).
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs — `claude-haiku-4-5-20251001` supported, `output_config.format`, on Bedrock only via legacy integration.
- https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide — Haiku 4.5 accepts sampling parameters and prefill with thinking disabled, `computer_20250124` + `computer-use-2025-01-24`, standard image tier, no browser use tool on Haiku 4.5, Haiku 4.5→5.5 checklist, Claude 4+ models require explicit instructions.
- https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5 — cache minimum 4,096 tokens on Haiku 4.5.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5 — existing Haiku 4.5 prompts run well on Haiku 5.5 without changes.
- https://platform.claude.com/docs/en/about-claude/model-deprecations — `claude-haiku-4-5-20251001` active, retirement not before October 15, 2026.
- https://platform.claude.com/docs/en/models/overview — Haiku 4.5 under "Legacy models (still available)", Haiku 5.5 "Fastest".

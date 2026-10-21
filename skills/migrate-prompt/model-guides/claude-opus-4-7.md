---
model: claude-opus-4-7
vendor: Anthropic
family: Claude
aliases: [opus-4.7, claude-opus-4.7, opus4.7]
last_verified: 2026-10-13
status: legacy
successor: claude-opus-5-5
---

# Claude Opus 4.7

## Reasoning / Thinking
- Type: **adaptive, off by default**. A request without a `thinking` field runs without thinking; enabled with `thinking: {type: "adaptive"}`. `{type: "disabled"}` is allowed. `thinking: {type: "enabled", budget_tokens: N}` has been removed and returns 400.
- Depth control via `output_config.effort`: `low | medium | high | xhigh | max`, default `high`. Vendor recommendation: start at `xhigh` for coding/agentic, `high` as minimum for most intelligence-critical workloads, `medium` for cost-sensitive routes, `max` only with measurable headroom (can lead to overthinking in Structured Output tasks).
- Opus 4.7 adheres more strictly to effort than Opus 4.6, particularly at `low`/`medium`: it confines work strictly to what is requested. For shallow reasoning, increase effort rather than compensating via prompt; if effort must remain low, add targeted instructions: "This task involves multistep reasoning. Think carefully before responding."
- `thinking.display` is `"omitted"` by default (empty thinking fields, only `signature`) — a silent change from Opus 4.6, where summarized thinking was default. For readable summaries, set `display: "summarized"`.
- Interleaved thinking is automatic with adaptive thinking (no beta header); reasoning between tool calls always appears in thinking blocks.
- Sampling parameters: non-default `temperature`/`top_p`/`top_k` return 400 on every request, even without thinking (`top_p: 1` as well, and `temperature` plus `top_p` together even at default values).
- At `xhigh`/`max`, set a large `max_tokens` (starting value 64k); it caps thinking plus response text combined.

## Prompting Style
- **effort before prompt tricks**: govern depth primarily via effort; use prompt instructions only complementarily if effort must stay low for latency reasons.
- **Omit progress scaffolding**: Opus 4.7 provides more regular, higher-quality progress updates on its own in long agentic traces. Remove forced status choreography ("After every 3 tool calls, summarize progress").
- **No assistant prefill** (400 since Opus 4.6) — use Structured Outputs or system prompt instructions instead.
- **Forced tool use** (`tool_choice` `any`/`tool`) is accepted, but the response then begins with the tool call without a thinking block. If the model should deliberate beforehand: `tool_choice: {type: "auto"}` and specify in the prompt when the tool should be used.
- **No mid-conversation system messages**: `role: "system"` in the `messages` array returns 400 on Opus 4.7. Instructions belong in the top-level `system` prompt or in a user turn.
- **Cyber safeguards**: Starting with Opus 4.7, requests concerning prohibited or high-risk security topics may be refused. For legitimate security work (pentesting, red-teaming), Anthropic points to the Cyber Verification Program.
- Anthropic does not publish a model-specific prompting guide for Opus 4.7; statements on verbosity or tool triggering specific to 4.7 are therefore (unbelegt). General best practices that explicitly cover Opus 4.7 apply.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: first Claude model with high-resolution images (max. 2,576 px long edge instead of 1,568 px) — gains in computer use, screenshot understanding, and document analysis; pointing/bounding box coordinates are 1:1 image pixels (no scaling conversion).
- Strict effort adherence: at `low`/`medium` strictly bounded to the prompt task (beneficial for latency/costs), but risk of shallow reasoning on complex tasks at low effort.
- Weaknesses: no Fast Mode (`speed: "fast"` → error); neither `computer_toolset_20260801` nor the browser use tool, though `computer_20251124` is supported. Reliable knowledge cutoff January 2026.

## Output & Format Conventions
- 1M context window, 128K output tokens synchronous; up to 300K via Message Batches API with beta header `output-300k-2026-03-24`. Input: text and images, output: text.
- **New tokenizer** (introduced with Opus 4.7): compared to older models, roughly 1×–1.35× as many tokens for the same text (content-dependent); 1M tokens correspond to roughly 555k words instead of roughly 750k.
- Full image resolution costs up to roughly 3× more image tokens (up to 4,784 instead of roughly 1,600 per image) — budget `max_tokens` and costs, or downscale beforehand.
- No prefill; fixed formats via Structured Outputs (`output_config.format`) or system prompt.
- Refusals arrive as `stop_reason: "refusal"` with a `stop_details` object (category); stop reason handling should inspect `stop_details`.

## Migration Notes
- **Lifecycle**: Legacy, status Active; retirement not before April 16, 2027. Anthropic recommends migrating to Claude Opus 5.5.
- **MIGRATING FROM claude-opus-4-7 to Opus 5.5**: Swap model ID; thinking is always on there (`disabled` and `budget_tokens` → 400), `max_tokens` covers thinking plus text — re-budget for previously thinking-free routes; default effort drops to `medium`, levels are recalibrated → run a fresh effort sweep; `tool_choice` `any`/`tool` is rejected → `auto` plus Strict Tool Use or Structured Outputs; remove context window beta headers; replace history rebuilds for instruction changes with mid-conversation system messages; text between tool calls appears in thinking blocks; expand `refusal` handling for additional categories (including `reasoning_extraction`).
- **MIGRATING FROM claude-opus-4-7 to older models** (4.6/4.5): On Opus 4.6, `budget_tokens` still functions but is deprecated; Opus 4.5 supports only extended thinking (`adaptive` → 400), has 200K context / 64K output and lacks `xhigh`. Prefill is only possible prior to Opus 4.6 (and only without active thinking).
- **MIGRATING TO claude-opus-4-7** (from 4.6 or older): `budget_tokens` → `thinking: {type: "adaptive"}` plus effort (effort sweep instead of budget conversion); remove `temperature`/`top_p`/`top_k`; for UI display of thinking, set `display: "summarized"`; adjust `max_tokens`, compaction triggers, and client-side token estimates for the new tokenizer; increase image token budgets, remove coordinate scaling; remove progress scaffolding. From 4.5 additionally: remove prefills, parse tool call `input` via JSON parser only.

## Sources
- https://platform.claude.com/docs/en/models/opus-4-7/overview — legacy status, model ID `claude-opus-4-7`, 1M context, 128K output (300K batch beta), thinking "Adaptive", default effort `high`, knowledge cutoff Jan 2026, retirement not before April 16, 2027, migration recommendation to Opus 5.5.
- https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-47 — what changes after Opus 4.7 (effort recalibration, 1M without beta header, mid-conversation system messages on 4.7 → 400, `stop_details`, no Fast Mode, no computer use toolset), plus breaking changes and behavioral changes starting with Opus 4.7 (thinking display, tokenizer 1×–1.35×, progress updates, cyber safeguards, high-res images).
- https://platform.claude.com/docs/en/about-claude/model-deprecations — status Active, retirement "Not sooner than April 16, 2027"; parameter table: `temperature`/`top_p`/`top_k` on Claude 4.7+ → 400.
- https://platform.claude.com/docs/en/about-claude/models/overview — Opus 4.7 in the list "Legacy models (still available)"; tokenizer since Opus 4.7 (555k vs. 750k words per 1M tokens).
- https://platform.claude.com/docs/en/build-with-claude/effort — effort levels including `xhigh`/`max` for Opus 4.7, default `high`, recommendation table, stricter effort adherence than 4.6, `max_tokens` ≥ 64k at `xhigh`/`max`.
- https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting — Opus 4.7: adaptive only, default off, `enabled` → 400.
- https://platform.claude.com/docs/en/build-with-claude/thinking — `display` default `omitted`, interleaved thinking automatic, sampling parameter rules, prefill / forced tool use behavior.

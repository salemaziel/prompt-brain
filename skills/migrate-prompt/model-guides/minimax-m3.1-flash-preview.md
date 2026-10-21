---
model: minimax-m3.1-flash-preview
vendor: MiniMax
family: MiniMax
aliases: [minimax-m3.1, minimax-m3.1-flash, m3.1-flash-preview, m3.1-flash, minimax-m3-1-flash-preview]
last_verified: 2026-10-13
status: current
---

# MiniMax-M3.1-Flash-Preview

## Reasoning / Thinking
- Type: **Thinking always on, depth controlled via effort ladder**. "Thinking is on by default and needs no configuration"; it cannot be disabled. `thinking: {"type": "disabled"}` or effort `none` returns HTTP 400 with `model "MiniMax-M3.1-Flash-Preview" requires adaptive thinking; thinking.type="disabled" (including reasoning.effort=none) is not allowed (2013)`. If `thinking` is sent, it must be `{"type": "adaptive"}`.
- Depth: `low`, `medium`, `high`, `xhigh`, `max` — higher levels reason more thoroughly, generate more output tokens, and increase latency. **Default without specification is `max`.** Field name per protocol: Anthropic-compatible `output_config.effort`, OpenAI-compatible `reasoning_effort`, OpenAI Responses `reasoning.effort`. According to the vendor, reduce latency/tokens via a lower effort level, not by attempting to turn thinking off.
- Returning thoughts: Anthropic path as `thinking` content block (with `signature`); OpenAI path **always** separate in `reasoning_content`, while `content` contains only the answer. `reasoning_split=false` (thinking as `<think>` inside `content`) is currently not supported for this model.
- Multi-turn: Return thinking blocks unchanged ("preserve them unchanged in later turns, especially in tool-use conversations"); on the OpenAI path, `reasoning_content` must remain fully preserved. The OpenAI SDK documentation refers to the M3 Tool Use guide for tool use and interleaved thinking on this model.

## Prompting Style
- **No model-specific prompting documentation.** The former "M-series Usage Tips" page has been removed (HTTP 404 as of 2026-10-13); recommendations such as "task at the end" or "label sections" are (unbelegt) for this model.
- The only official guidance available is the general "Better Prompts" advice from the MiniMax Code app, where the model debuted: describe the desired outcome, not just steps; for coding tasks, specify stack, constraints, and validation criteria; for research, state output format and source requirements. These are product guidelines, not model-specific prompting strategies.
- Depth steering belongs in the effort parameter, not in prompt text; whether additional "think carefully" instructions have any effect at high effort is (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: According to the vendor, the newest M-series language model "for agentic reasoning, tool use, coding, and long-context tasks"; "Frontier multimodal coding model with 1M context window and tunable thinking depth". Input: text, image, and video (like M3).
- Weaknesses: **Preview with restricted access**: "available only through M Plan and MiniMax Code for now"; called via Subscription Key, no pay-as-you-go pricing published. The M Plan FAQ recommends pay-as-you-go for production — where M3 is the stable counterpart. Cost/quota leverage: higher thinking depth results in more thinking content and higher M Plan consumption — the `max` default is the most expensive tier. Unpublished: parameter count, benchmarks, output speed, knowledge cutoff (unbelegt). Passive prompt caching is listed by MiniMax only for M3 and M2.x, not for this model (unbelegt); explicit `cache_control` is also only available for M2.x.

## Output & Format Conventions
- Model ID (API, exact casing): `MiniMax-M3.1-Flash-Preview`. Context window: 1,000,000 tokens. MiniMax's Claude Code instructions use `MiniMax-M3.1-Flash-Preview[1m]`.
- `max_tokens` (Anthropic) or `max_completion_tokens` (OpenAI; `max_tokens` deprecated there): recommended 131,072, maximum 524,288. Thinking tokens count toward this limit — setting it too small results in `stop_reason: "max_tokens"` with no text or `finish_reason: "length"` with empty `content`.
- `temperature` [0, 2], default 1; `top_p` default 0.95. Anthropic path: `stop_sequences` and `top_k` are ignored, `tool_choice` only `auto`/`none`. Structured Outputs / JSON Schema mode are not documented (unbelegt).
- Endpoints: `https://api.minimax.io/anthropic` (recommended) and `https://api.minimax.io/v1`. Images up to 10 MB, videos up to 50 MB via URL/base64, larger videos via Files API (`mm_file://{file_id}`); token counting via `POST /anthropic/v1/messages/count_tokens`.

## Migration Notes
- **MIGRATING FROM MiniMax-M3 here**: Remove `thinking: {"type": "disabled"}` (otherwise HTTP 400); set effort **explicitly** instead of inheriting the costly `max` default; replace prompt-based depth instructions with the effort parameter. On the OpenAI path, do not rely on `<think>` in `content` — thinking appears in `reasoning_content`, and `reasoning_split=false` is not supported. Replace API key with Subscription Key.
- **MIGRATING TO MiniMax-M3** (e.g. for pay-as-you-go / production): Remove effort fields — M3 silently ignores them; steer depth again via `thinking` on/off plus prompt text, setting `thinking` explicitly (M3 default varies across endpoints).
- **MIGRATING FROM other providers**: Disabled reasoning on the source cannot be mapped 1:1 — the closest equivalent is effort `low`; recalibrate latency and `max_tokens`. Remove visible CoT scaffolding ("think step by step"). Do not rely on Claude `cache_control` breakpoints.
- **MIGRATING FROM MiniMax-M3.1-Flash-Preview**: Map `output_config.effort`/`reasoning_effort` to the target ladder (level names are not standardized); adjust thinking block / `reasoning_content` handling for target; verify image/video input support.

## Sources
- https://platform.minimax.io/docs/guides/text-generation — Model table (1M context, "tunable thinking depth"), "latest M-series language model …", "available only through M Plan and MiniMax Code for now", thinking always on, effort levels with default `max` and protocol field names, `reasoning_content` on OpenAI path, 400 error on `disabled`/`none`.
- https://platform.minimax.io/docs/api-reference/text-chat-anthropic — Messages schema: model ID, `thinking` only `adaptive`, `output_config.effort` (default `max`, `none` → 400), `max_tokens` 131072/524288, `top_p` 0.95, `temperature` [0, 2], `tool_choice` only `auto`/`none`.
- https://platform.minimax.io/docs/api-reference/text-anthropic-api — Thinking control table, complete error message (2013), "preserve them unchanged in later turns", thinking tokens in `max_tokens`, ignored `stop_sequences`/`top_k`, media limits, `count_tokens`.
- https://platform.minimax.io/docs/api-reference/text-chat-openai — `reasoning_effort` ("Only `MiniMax-M3.1-Flash-Preview` supports real thinking-depth tuning"), `reasoning_split=false` not supported, `max_completion_tokens` 131072/524288, `max_tokens` deprecated.
- https://platform.minimax.io/docs/api-reference/text-openai-api — Full preservation of `reasoning_content`, thinking tokens in `max_tokens` (`finish_reason: "length"`), reference to Tool Use / Interleaved Thinking guide for M3.1.
- https://platform.minimax.io/docs/api-reference/text-prompt-caching — Cache comparison: passive caching for M3 and M2.x, explicit only for M2.x (M3.1 not listed).
- https://platform.minimax.io/docs/m-plan/faq — M3.1 Flash Preview in all M Plan tiers, higher thinking depth consumes more quota, "Pay-as-you-go is recommended for production use", Subscription Keys separate from pay-as-you-go keys.
- https://platform.minimax.io/docs/m-plan/claude-code — `MiniMax-M3.1-Flash-Preview[1m]`, "always enables thinking and cannot turn it off".
- https://platform.minimax.io/docs/guides/pricing-paygo — Pay-as-you-go table lists only M3 and M2.7 (no M3.1 price).
- https://agent.minimax.io/docs/code/get-started/first-task — "Better Prompts" guidance from MiniMax Code app.
- https://agent.minimax.io/docs/changelog — v3.0.74 (2026-09-28): M3.1-Flash-Preview debuts in MiniMax Code; CLI default model `MiniMax-M3.1-Flash-Preview`.

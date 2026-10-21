---
model: minimax-m2.7
vendor: MiniMax
family: MiniMax
aliases: [minimax-m2.7-highspeed, m2.7, minimax-m27, "MiniMaxAI/MiniMax-M2.7"]
last_verified: 2026-10-13
status: current
---

# MiniMax-M2.7 (incl. M2.7-highspeed)

## Reasoning / Thinking
- Type: **thinking always on, cannot be disabled**. Across both endpoints for M2.x: omitting `thinking` or setting `adaptive` → thinking is on; `{"type": "disabled"}` is "accepted but ignored; thinking remains on". No depth control: `output_config.effort` / `reasoning_effort` only take effect on M3.1-Flash-Preview; "Other models ignore this field".
- Return format: Anthropic endpoint returns reasoning as a `thinking` content block; OpenAI endpoint by default returns `<think>…</think>` inside the `content` field, or separated into `reasoning_content` when `reasoning_split=true`. Setting `reasoning_split` neither enables nor disables thinking.
- Multi-turn: the complete assistant message must be appended back into history ("must be append to the conversation history to maintain the continuity of the reasoning chain") — on the Anthropic endpoint, the complete `response.content` list; on the OpenAI endpoint, `content` including `<think>` tags unchanged.
- Self-hosting: reasoning is processed via SGLang's `--reasoning-parser minimax-append-think`, tool calls via `--tool-call-parser minimax-m2`; where the trace is placed in the response afterwards depends on the SGLang version according to vendor.

## Prompting Style
- **No model-specific prompting page exists anymore.** The former "Usage Tips" page under `token-plan/` redirects to the M-Plan overview; MiniMax's previous advice (task at the end, labeling sections, diverse few-shot examples) is therefore (unbelegt) for M2.7.
- Verified by the Hugging Face model card: sampling `temperature=1.0`, `top_p=0.95`, `top_k=40` and default system prompt "You are a helpful assistant. Your name is MiniMax-M2.7 and is built by MiniMax." Caution: the hosted API defaults `top_p` to 0.9 and ignores `top_k` on the Anthropic endpoint.
- Visible CoT scaffolding is superfluous since the model reasons regardless; whether it degrades quality is (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioned by vendor as a model "for agents, software engineering, and complex productivity tasks"; model card highlights Agent Teams, complex skills, and dynamic tool search, reporting SWE-Pro 56.22% and Terminal Bench 2 57.0% (vendor figures).
  - Context window: **204,800 tokens**. M2.7 achieves ~60 tps; M2.7-highspeed offers "Same performance, faster and more agile" at ~100 tps — same prompts, same guide.
  - Open weights (`MiniMaxAI/MiniMax-M2.7`, MiniMax-M2.7 License; commercial use entails attribution and prior approval requirements).
- Weaknesses:
  - **Text and tool calls only**: "The M2.7, M2.5, M2.1, and M2 series support text and tool-call content blocks only" — no image or video input.
  - Thinking cannot be disabled: for latency-critical chat or completion tasks without reasoning, M2.7 is at a structural disadvantage compared to M3 with `disabled`.
  - Not specified on official pages (unbelegt): parameter count and knowledge cutoff.
  - Structured Outputs / JSON Schema mode are not documented (unbelegt).

## Output & Format Conventions
- Model IDs (API, exact casing): `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`.
- `max_tokens` (Anthropic) or `max_completion_tokens` (OpenAI; `max_tokens` deprecated there): recommended 65,536, maximum 204,800. Thinking tokens count toward this limit — undersizing leads to `stop_reason: "max_tokens"` without text or `finish_reason: "length"` with empty `content`.
- `temperature` [0, 2], default 1; `top_p` default **0.9** (M2.x). Anthropic endpoint: `stop_sequences` and `top_k` are ignored, `tool_choice` supports only `auto`/`none`.
- Caching: passive prefix caching (starting at 512 input tokens, ordering: tool list → system prompts → user messages) **and** explicit `cache_control` on the Anthropic endpoint — 5-minute TTL with renewal on use, max 4 breakpoints, 20-block lookback, cache write is billed separately.
- Pay-as-you-go pricing per 1M tokens: M2.7 $0.30 input / $1.20 output / $0.06 cache read / $0.375 cache write; M2.7-highspeed $0.60 / $2.40 / $0.06 / $0.375.

## Migration Notes
- **MIGRATING FROM minimax-m2.7 to MiniMax-M3** (recommended by vendor for new projects requiring multimodal capabilities or 1M context):
  - **Explicitly** set `thinking` to `adaptive` — on the Anthropic endpoint it is otherwise off for M3, whereas it was always on for M2.7. Passing `disabled` (which was previously ignored) will genuinely disable thinking on M3.
  - `cache_control` breakpoints are no longer supported on M3 according to the support matrix — rely on passive caching instead.
  - Expand limits (context up to 1M, `max_tokens` up to 524,288); default `top_p` shifts from 0.9 to 0.95.
  - Image and video inputs become supported.
- Specifically **from minimax-m2.7 to minimax-m3.1-flash-preview**:
  - Explicitly configure effort (default `max`); `reasoning_split=false` is unsupported there — reasoning is emitted in `reasoning_content` rather than `<think>` inside `content`.
- **MIGRATING TO minimax-m2.7**:
  - Strip image/video content or convert to text beforehand; constrain context to ≤ 204,800 tokens and `max_tokens` to ≤ 204,800.
  - `thinking: disabled` and effort parameters have no effect — allocate latency budget for mandatory thinking.
  - For recurring prefixes, configure explicit `cache_control` breakpoints.
- **MIGRATING FROM minimax-m2.7 to other providers**:
  - Remove `<think>` parsing, `reasoning_split`, and `reasoning_details`; adjust conversation history handling to target specifications; `stop_sequences` and `top_k` (which were ignored here) become active again on target systems.

## Sources
- https://platform.minimax.io/docs/guides/text-generation — Supported Models: M2.7 and M2.7-highspeed (204,800 context, ~60 and 100 tps, "Same performance, faster and more agile"), "MiniMax-M3, MiniMax-M2.7, and MiniMax-M2.7-highspeed also remain available"; older models in legacy accordion.
- https://platform.minimax.io/docs/release-notes/models — Mar. 18, 2026: "Released MiniMax-M2.7 series (MiniMax-M2.7 / M2.7-highspeed)".
- https://platform.minimax.io/docs/faq/models — M2.7 and M2.7-highspeed listed under "Available Models" (not retired).
- https://platform.minimax.io/docs/api-reference/text-anthropic-api — Thinking control table (M2.x: "Accepted but ignored; thinking remains on"), text and tool-call content blocks only for M2.x, thinking tokens included in `max_tokens`, ignored `stop_sequences`/`top_k`, multi-turn replay rule.
- https://platform.minimax.io/docs/api-reference/text-chat-anthropic — `max_tokens` 65536/204800 for non-M3 models, `top_p` 0.9 for M2.x, `output_config.effort` "Other models ignore this field", `tool_choice` only `auto`/`none`.
- https://platform.minimax.io/docs/api-reference/text-chat-openai — `thinking` cannot be disabled for M2.x, `reasoning_effort` ignored, `reasoning_split` output switch (`<think>` in `content` vs. `reasoning_content`), `max_completion_tokens` 65536/204800.
- https://platform.minimax.io/docs/api-reference/text-openai-api — Retaining `<think>` content inside `content` completely; `finish_reason: "length"` with empty `content` on insufficient token limit.
- https://platform.minimax.io/docs/api-reference/text-prompt-caching — Passive caching including M2.7 series; Cache Comparison: explicit caching for M2.7/M2.5/M2.1/M2, 5-minute TTL.
- https://platform.minimax.io/docs/api-reference/anthropic-api-compatible-cache — `cache_control` mechanics (max 4 breakpoints, 20-block lookback), supported models including M2.7/M2.7-highspeed.
- https://platform.minimax.io/docs/guides/pricing-paygo — M2.7 $0.30/$1.20/$0.06/$0.375; M2.7-highspeed $0.60/$2.40/$0.06/$0.375.
- https://platform.minimax.io/docs/guides/local-deploy-m2-7 — "For a new project that needs native multimodal input or a 1M-token context, use MiniMax-M3", SGLang parsers `minimax-append-think` / `minimax-m2`, license information.
- https://huggingface.co/MiniMaxAI/MiniMax-M2.7 — Official model card: Agent Teams/Skills, SWE-Pro 56.22%, Terminal Bench 2 57.0%, sampling `temperature=1.0`/`top_p=0.95`/`top_k=40`, default system prompt.
- https://platform.minimax.io/docs/guides/text-m3-function-call — "must be append to the conversation history …", do not modify `<think>` content in `content` (guide oriented toward M3; verified applicable to M2.7 via SDK reference).

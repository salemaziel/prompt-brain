---
model: kimi-k2.7-code
vendor: Moonshot AI
family: Kimi
aliases: [kimi-k2.7-code-highspeed, kimi-k2.7, k2.7-code, kimi-k2-7-code]
last_verified: 2026-10-13
status: current
---

# Kimi K2.7 Code (also applies to kimi-k2.7-code-highspeed)

## Reasoning / Thinking
- Type: **thinking always on, cannot be disabled**. `thinking.type: "disabled"` returns an error; the parameter reference notes that one does not need to pass `thinking` at all — "just switch the `model`, and the model always emits `reasoning_content`". A non-thinking or instant mode does not exist.
- **Preserved Thinking is enforced**: `thinking.keep` is treated as `"all"`, whether omitted or explicitly set; any other value returns an error. Therefore, historical `reasoning_content` of every previous assistant message MUST remain unchanged in `messages` — not only within a tool loop, but across conversation turns.
- **No `reasoning_effort`** (only kimi-k3 supports this parameter). Thinking depth cannot be configured via parameters; Moonshot reports on average ~30% fewer thinking tokens and a 30% reduction in overthinking tendencies compared to K2.6.
- `reasoning_content` and `content` share `max_tokens` (default 32,768); for multi-step tool calls, the thinking guide recommends `max_tokens >= 16000` and streaming. In streaming, `reasoning_content` always precedes `content`.
- `kimi-k2.7-code-highspeed` is the identical model with identical parameter constraints and identical thinking behavior according to the parameter reference; only output generation speed differs.

## Prompting Style
- No K2.7-specific prompting guide; general platform recommendations apply: set role in system message, separate sections with delimiters (triple quotes, XML tags, headers), specify steps explicitly, few-shot examples for hard-to-describe styles, length constraints as paragraph or bullet counts rather than word counts ("The model can't read your mind").
- **No sampling controls**: temperature, top_p, n, and penalties are fixed (see below). Variance and format adherence must be achieved through prompt instructions, `response_format`, and tool schemas; Moonshot advises against passing defaults.
- **Tools**: `tool_choice` supports only `"auto"` (default) or `"none"` — `"required"` and forcing a specific tool return an error. To force tool usage, formulate the requirement in the prompt text. Retain `reasoning_content` of the active tool loop in context (omission is not an error, but degrades continuity and tool call quality according to the quickstart).
- Repeated identical tool calls are handled client-side platform-wide: verify message layout (append assistant message unchanged, exact `tool_call_id`), then issue `<system-reminder>` prompts starting at 3, strengthened at 5, and repeated at 8 identical retries — within the agent loop, not in the static system prompt.
- Agent framework: according to the model card, K2.7 Code works "best with Kimi Code CLI as its agent framework".

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Dedicated coding model; follows instructions in long contexts more reliably than K2.6 and achieves higher success rates in long-horizon coding (announcement: sequences with 4,000+ tool calls and 12+ hours continuous execution).
  - Multimodal input: image and video support (images png/jpeg/webp/gif, videos mp4/mov/avi, etc.), including within tool results.
  - Structured Output: most **stable** implementation across the platform according to Moonshot, supporting nested objects/arrays as well as `anyOf`/`oneOf`/`$ref`/`additionalProperties: true`; largely adheres to schema even without `strict`. Moonshot explicitly recommends `kimi-k2.7-code` over `kimi-k2.6` for structured output tasks.
- Weaknesses:
  - No `tool_choice: "required"`.
  - No public image URLs supported (only base64 or file upload, request body max 100 MB).
  - Caching limitations: no separately billable cache write and no TTL selection (exclusive to kimi-k3 according to Caching FAQ).
  - Video chat is experimental according to model card and available only via the official API.
  - `partial=true` with complex schemas may corrupt structural integrity.
  - Highspeed variant: currently resource-constrained according to quickstart; output speeds may fluctuate.

## Output & Format Conventions
- Context window: 262,144 tokens (256K); `max_tokens` default 32,768. Modalities text/image/video → text.
- **Fixed sampling parameters**: `temperature` 1.0, `top_p` 0.95, `n` 1, `presence_penalty` 0, `frequency_penalty` 0 — any other value is an error.
- `response_format`: `json_schema` with `strict: true` (Moonshot: "Always explicitly set strict: true"); parse only `choices[0].message.content`, never `reasoning_content` or the full response object.
- Interface: Chat Completions (OpenAI-compatible). The Responses API and the `model` enum of the Messages API reference list only `kimi-k3`; Moonshot's Claude Code guide nevertheless deploys `kimi-k2.7-code` via the Anthropic endpoint `https://api.moonshot.ai/anthropic` (as the HAIKU tier).
- Pricing per 1M tokens: `kimi-k2.7-code` $0.19 cache-hit / $0.95 cache-miss / $4.00 output; `kimi-k2.7-code-highspeed` $0.38 / $1.90 / $8.00. Highspeed delivers ~180 tokens/s, up to 260 tokens/s with short context.
- Open weights (`moonshotai/Kimi-K2.7-Code`, Modified MIT): 1T parameters total / 32B active, MoE with 384 experts (8 selected, 1 shared), MoonViT vision encoder, native INT4, same architecture as K2.5/K2.6. For vLLM/SGLang, the card recommends `temperature` 1.0 and `top_p` 0.95; instant mode is not supported.

## Migration Notes
- **MIGRATING TO kimi-k3**:
  - According to FAQ, swap `model` and continue replaying full assistant messages (including `reasoning_content`) unchanged; optionally set `reasoning_effort` (`low|high|max`, default `max` — select deliberately rather than inheriting the costliest default). On K3, `tool_choice: "required"` becomes available, cache writes are billed separately, and context window expands to 1M.
- Specifically **from kimi-k2.6**:
  - Remove `thinking` configuration (only `{"type":"enabled","keep":"all"}` is valid), drop the 0.6 temperature assumption of K2.6 non-thinking mode (non-thinking prompts have no equivalent here), and rebuild the pipeline to ensure historical `reasoning_content` is passed back in `messages` — which was optional on K2.6 without `keep: "all"`. Complex JSON schemas that had to be simplified or guarded with Markdown stripping on K2.6 can be formulated more strictly here.
- Specifically **to kimi-k2.6**:
  - `tool_choice: "required"` is unavailable on both models; simplify structured outputs on K2.6 (avoid `oneOf`/`$ref`) and introduce a secondary validation layer.
- **MIGRATING FROM other providers**:
  - Remove sampling and effort controls (temperature, top_p, reasoning budgets) entirely — they are fixed or unsupported; express tool enforcement within prompt instructions; express prefill as a trailing assistant message with `partial: true` (Partial Mode; usable on kimi-k2.7-code according to Structured Output docs, but may corrupt structure with complex schemas); convert image URLs to base64 or file uploads.
- **MIGRATING FROM kimi-k2.7-code**:
  - Explicitly request thinking in target prompts if the target does not reason by default; retain `reasoning_content` replay only if documented by the target; restore sampling parameters as active tuning levers.

## Sources
- https://platform.kimi.ai/docs/models.md — Roster: `kimi-k2.7-code` "dedicated coding model … Context 256k", `kimi-k2.7-code-highspeed` with ~180 to 260 tokens/s; neither in deprecation table.
- https://platform.kimi.ai/docs/api/models-overview.md — Parameter matrix: `thinking` only `{"type":"enabled","keep":"all"}`, no `reasoning_effort`, no `tool_choice: "required"`, fixed temperature/top_p/n/penalties; highspeed = identical model with identical constraints; FAQ on upgrading kimi-k2.7-code → kimi-k3; switching from kimi-k2.6 requires historical `reasoning_content` replay.
- https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart.md — Positioning (instruction adherence in long context, 30% less overthinking), no non-thinking mode, default `max_tokens` 32768, fixed sampling values, `tool_choice` only auto/none, retaining `reasoning_content` in tool loops, image/video formats, no image URLs, 100 MB request limit, highspeed resource notice.
- https://platform.kimi.ai/docs/guide/use-thinking-models.md — Thinking always on, Preserved Thinking enforced (`thinking.keep` defaults to `"all"`), historical `reasoning_content` MUST be retained, `reasoning_content` + `content` ≤ `max_tokens`, `max_tokens >= 16000` and streaming recommended.
- https://platform.kimi.ai/docs/guide/response_format.md — `kimi-k2.7-code` with most stable Structured Output support (`anyOf`/`oneOf`/`$ref`/`additionalProperties: true`), recommendation of kimi-k2.7-code for structured output, `strict: true`, parse only `content`, `partial=true` only for simple schemas.
- https://platform.kimi.ai/docs/guide/prompt-best-practice.md — General platform prompting best practices (role, delimiters, steps, few-shots, length controls).
- https://platform.kimi.ai/docs/guide/tool-call-repeat.md — Message layout check and reminder escalation at 3 / 5 / 8 identical tool calls.
- https://platform.kimi.ai/docs/pricing/chat-k3.md and https://platform.kimi.ai/docs/guide/context-caching.md — Pricing and 262,144-token context for both variants; cache write only for kimi-k3, not for K2.x models.
- https://platform.kimi.ai/docs/api/messages.md, https://platform.kimi.ai/docs/api/responses.md and https://platform.kimi.ai/docs/guide/claude-code-kimi.md — `model` enum of Messages API and Responses API only lists `kimi-k3`; Claude Code setup with `kimi-k2.7-code` as HAIKU tier via `https://api.moonshot.ai/anthropic`.
- https://platform.kimi.ai/docs/platform-changelog.md — June 2026: release of Kimi K2.7 Code via Open Platform API, followed by HighSpeed variant.
- https://huggingface.co/moonshotai/Kimi-K2.7-Code — Official model card: building on K2.6, ~30% fewer thinking tokens, 1T / 32B active, 384 experts, MoonViT, native INT4, Modified MIT; enforced thinking and preserve-thinking, experimental video, recommended temperature 1.0 / top_p 0.95, no instant mode, "works best with Kimi Code CLI as its agent framework".
- https://forum.moonshot.ai/t/here-comes-kimi-k2-7-code-better-coding-with-more-efficiency/441 — Official announcement of 2026-06-16: long-horizon coding with 4,000+ tool calls and 12+ hours, ~30% fewer thinking tokens than K2.6, HighSpeed ~180 / up to 260 tokens/s, fixed sampling parameters.

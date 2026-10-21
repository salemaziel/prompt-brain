---
model: kimi-k2.6
vendor: Moonshot AI
family: Kimi
aliases: [k2.6, kimi-k2-6, moonshotai/Kimi-K2.6]
last_verified: 2026-10-13
status: current
---

# Kimi K2.6

## Reasoning / Thinking
- Type: **toggleable**. `thinking.type`: `"enabled"` (default) | `"disabled"`; in the OpenAI SDK pass via `extra_body={"thinking": {"type": "disabled"}}`. K2.6 is currently the only active Kimi API model with a non-thinking mode (kimi-k3 and kimi-k2.7-code always reason).
- `thinking.keep`: `null` (default — historic `reasoning_content` from earlier turns is ignored, shorter context, lower costs) | `"all"` (Preserved Thinking). `keep` affects only earlier turns, not whether the current turn reasons; Moonshot recommends `keep: "all"` combined with `type: "enabled"`.
- **No `reasoning_effort`** — thinking depth is strictly on/off, not tiered.
- `reasoning_content` and `content` share `max_tokens` (default 32,768); for multi-step tool calls, the thinking guide recommends `max_tokens >= 16000` and streaming. In streaming, `reasoning_content` always precedes `content`.
- Within a tool loop, send all `reasoning_content`; omitting it is not an error, but degrades continuity and tool-call quality according to the quickstart.

## Prompting Style
- No K2.6-specific prompting guide; general platform recommendations apply: set role in system message, separate sections with delimiters (triple quotes, XML tags, headers), specify steps explicitly, few-shot examples for hard-to-describe styles, length constraints as paragraph or bullet counts rather than word counts ("The model can't read your mind").
- **No sampling controls**: temperature is fixed to the mode, top_p/n/penalties are fixed (see below). Variance and format adherence must be achieved through prompt instructions, `response_format`, and tool schemas; Moonshot advises against passing defaults.
- **Tools**: `tool_choice` supports only `"auto"` (default) or `"none"`; according to the parameter reference, `"required"` is not supported on kimi-k2.6 and returns an error; the quickstart attributes this restriction to active thinking. Tool enforcement must therefore be specified via prompt instructions.
- Repeated identical tool calls are handled client-side platform-wide: check message layout, then issue `<system-reminder>` prompts starting at 3, strengthened at 5, and repeated at 8 identical retries — within the agent loop, not in the static system prompt.
- Agent framework: according to the model card, K2.6 works "best with Kimi Code CLI as its agent framework".

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - General-purpose model for text, image, and video, dialogue, and agentic workflows.
  - Long-horizon coding across languages (Rust, Go, Python) and domains (frontend, DevOps, performance) (announcement: 4,000+ tool calls, over 12 hours of continuous execution).
  - Coding-driven design from prompts and visual mockups.
  - Agent swarm capability supporting up to 300 sub-agents × 4,000 steps.
- Weaknesses:
  - Structured Output instability with complex schemas: according to Moonshot, `content` can occasionally be wrapped in Markdown code blocks, `oneOf`/`$ref` are not strictly adhered to, with `strict=false` or `partial=true` extraneous fields may appear, and empty strings may be returned instead of `null`. Moonshot recommends simpler schemas, a second validation layer, or `kimi-k2.7-code` for structured output.
  - Image inputs: no public image URLs supported (only base64 or file upload, request body max 100 MB).
  - Caching: no separately billable cache write and no TTL selection (available only on kimi-k3 according to Caching FAQ).
  - Video chat: experimental according to model card and available only via the official API.
  - Built-in web search `$web_search` is deprecated platform-wide (sunset 2026-10-20); the K2.6 quickstart also notes temporary incompatibility with thinking mode. Replacements are REST APIs `/v1/tools/search`, `/v1/tools/search_pro`, `/v1/tools/fetch`.

## Output & Format Conventions
- Context window: 262,144 tokens (256K); `max_tokens` default 32,768. Modalities text/image/video → text.
- **Fixed sampling parameters**: `temperature` 1.0 (thinking) or 0.6 (non-thinking), `top_p` 0.95, `n` 1, `presence_penalty` 0, `frequency_penalty` 0 — any other value returns an error.
- `response_format`: `json_schema` with `strict: true` (Moonshot: "Always explicitly set strict: true"); parse only `choices[0].message.content` and strip Markdown markers prior to parsing on K2.6.
- Interface: Chat Completions (OpenAI-compatible). The Responses API and the `model` enum of the Messages API reference only support `kimi-k3`.
- Pricing per 1M tokens: $0.16 cache-hit / $0.95 cache-miss input, $4.00 output.
- Open weights (`moonshotai/Kimi-K2.6`, Modified MIT): 1T parameters total / 32B active, MoE with 384 experts (8 selected, 1 shared), MoonViT vision encoder, native INT4. For vLLM/SGLang, the card recommends `temperature` 1.0 (thinking) or 0.6 (instant) and `top_p` 0.95; instant mode is enabled via `chat_template_kwargs: {"thinking": False}`.

## Migration Notes
- **MIGRATING TO kimi-k3**:
  - According to FAQ, swap `model`, remove the K2.x `thinking` configuration, optionally set `reasoning_effort` (`low|high|max`, default `max`), and replay the full assistant message including `reasoning_content` unchanged across multi-turn and tool loops (mandatory on K3, optional on K2.6 without `keep: "all"`). Non-thinking prompts have no direct equivalent on K3 — K3 always reasons; the closest alternative is `reasoning_effort: "low"`.
- **MIGRATING TO kimi-k2.7-code**:
  - Remove `thinking` (only `{"type":"enabled","keep":"all"}` is valid), drop the 0.6 temperature assumption, and mandatory replay of historical `reasoning_content`; simplified JSON schemas may reintroduce `oneOf`/`$ref`.
- **MIGRATING FROM other providers**:
  - Remove sampling and effort parameters completely; map a fast non-reasoning target to `thinking.type: "disabled"`; tiered reasoning budgets do not exist; convert `tool_choice: "required"` or forced tools into prompt instructions; convert image URLs to base64 or file uploads; simplify complex schemas.
- **MIGRATING FROM kimi-k2.6**:
  - Map the thinking toggle to the target mechanism; keep Markdown stripping and secondary validation only if the target documents similar weaknesses; re-enable sampling parameters as active tuning controls.

## Sources
- https://platform.kimi.ai/docs/models.md — Roster: `kimi-k2.6` "Supports both visual and text input, thinking and non-thinking modes, and dialogue and Agent tasks. Context 256k"; not in deprecation table.
- https://platform.kimi.ai/docs/api/models-overview.md — Parameter matrix: `thinking` enabled/disabled/`keep: "all"`, no `reasoning_effort`, no `tool_choice: "required"`, fixed temperature 1.0/0.6, fixed top_p/n/penalties; FAQ "Switching from `kimi-k2.6` to `kimi-k3`"; `extra_body` example.
- https://platform.kimi.ai/docs/guide/kimi-k2-6-quickstart.md — Positioning as general-purpose model, long-horizon coding, default `max_tokens` 32768, default `thinking`, fixed sampling values, `tool_choice` only auto/none with active thinking, retaining `reasoning_content` in tool loops, `$web_search` incompatibility with thinking, no image URLs, 100 MB request limit.
- https://platform.kimi.ai/docs/guide/use-thinking-models.md — `thinking.type`/`thinking.keep` with defaults, Preserved Thinking, `reasoning_content` + `content` ≤ `max_tokens`, `max_tokens >= 16000` and streaming recommended.
- https://platform.kimi.ai/docs/guide/response_format.md — K2.6 instability with complex schemas (Markdown code block wrapping, `oneOf`/`$ref`, fields outside schema, empty strings), recommendation of kimi-k2.7-code for structured output, `strict: true`.
- https://platform.kimi.ai/docs/guide/prompt-best-practice.md — General platform prompting best practices (role, delimiters, steps, few-shots, length controls).
- https://platform.kimi.ai/docs/guide/tool-call-repeat.md — Message layout check and reminder escalation at 3 / 5 / 8 identical tool calls.
- https://platform.kimi.ai/docs/pricing/chat-k3.md and https://platform.kimi.ai/docs/guide/context-caching.md — $0.16 / $0.95 / $4.00 per 1M tokens, 262,144-token context; cache write only for kimi-k3, not for kimi-k2.6.
- https://platform.kimi.ai/docs/guide/use-web-search.md and https://platform.kimi.ai/docs/pricing/websearch.md — `$web_search` deprecated, sunset 2026-10-20; replacements `/v1/tools/search`, `/v1/tools/search_pro`, `/v1/tools/fetch`.
- https://platform.kimi.ai/docs/api/messages.md and https://platform.kimi.ai/docs/api/responses.md — `model` enum and supported model only `kimi-k3`.
- https://platform.kimi.ai/docs/platform-changelog.md — April 2026: release of Kimi K2.6 via Open Platform API.
- https://huggingface.co/moonshotai/Kimi-K2.6 — Official model card: key features (long-horizon coding, coding-driven design, agent swarm 300 × 4,000), 1T / 32B active, 384 experts, MoonViT, native INT4, Modified MIT; experimental video, recommended temperature 1.0 / 0.6 and top_p 0.95, preserve thinking off by default, "works best with Kimi Code CLI as its agent framework".
- https://forum.moonshot.ai/t/meet-kimi-k2-6-advancing-open-source-coding/369 — Official announcement of 2026-04-21: 4,000+ tool calls and over 12 hours continuous execution, agent swarm 300 × 4,000 steps.

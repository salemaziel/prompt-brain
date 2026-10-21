---
model: deepseek-v4.1-flash
vendor: DeepSeek
family: DeepSeek
aliases: [deepseek-flash, v4.1-flash, deepseek-v4-1-flash]
last_verified: 2026-10-13
status: current
---

# DeepSeek-V4.1-Flash

## Reasoning / Thinking
- **A single hybrid model behind `deepseek-flash`** (model version DeepSeek-V4.1-Flash): Non-thinking and thinking unified in one ID; thinking is **on by default** (default effort `high`). OpenAI format: `thinking: {"type": "enabled"|"disabled"}` (in OpenAI SDK under `extra_body`) plus `reasoning_effort` `none|low|high|max` (`none` = thinking off). Anthropic format: same `thinking` toggle (`budget_tokens` is ignored), effort via `output_config: {"effort": "low|high|max"}`. Responses API: `reasoning: {"effort": "none|low|high|max"}`.
- Effort mapping of requested levels: minimal → low, low → low, medium → high, high → high, **xhigh → high**, max → max, ultra → max. `/models` reports levels `low|high|max` for `deepseek-flash`, default `high`.
- At the model level, effort is a **numerical budget 1–100** (low = 50, high = 75, max = 100), rendered as a `<｜System｜>Reasoning Effort: {budget} (range 1-100, …)` prefix — in thinking mode only and only at the start of conversation. The API offers only low/high/max; intermediate values via API are undocumented ((unbelegt)).
- `reasoning_content` is returned alongside `content`. Without `tools`, it does not need to be passed back (the API ignores it); **with `tools`**, the `reasoning_content` of all preceding turns must be returned completely to the API — even for turns without a tool call —, otherwise returning HTTP 400.
- Sampling: In thinking mode, `temperature`, `presence_penalty`, and `frequency_penalty` are ineffective (no error). `top_p` takes effect **only** in thinking mode (effectively 0.95–1.0, lower values → 0.95); in non-thinking mode, it is fixed at 1.0.
- `tool_choice: required` or a named tool returns HTTP 400 in thinking mode — tool enforcement is valid only with `thinking: {"type": "disabled"}`.

## Prompting Style
- System prompt is placed directly after BOS: `<｜begin▁of▁sentence｜>{system}<｜User｜>{user}<｜Assistant｜>`; in thinking mode, the template prepends the effort prefix as a `<｜System｜>` block. **New compared to V4:** System messages mid-conversation (`<｜System｜>`). On the Anthropic Messages endpoint, `/models` reports `system_prompt_update: in-history` — the latest system message in history is the fully effective system prompt and replaces all earlier ones.
- **JSON requires three elements**: `response_format: {"type": "json_object"}`, the word "json" plus an example of the target format in the system or user prompt, and sufficient `max_tokens`. Without a JSON instruction in the prompt, the model can generate whitespace up to the token limit. No `json_schema`.
- Prefill via Chat Prefix Completion (Beta): last message `role: "assistant"` with `prefix: True` against `https://api.deepseek.com/beta`, combined with `stop` to prevent trailing prose.
- **Images (new compared to V4-Flash)**: `image_url` blocks (http(s) URL or base64 data URL) or `file` blocks (Files API `file_id` or `file_data`); `detail`: `low` (downscales to 512×512) | `high` | `original` | `auto`. Images allowed only in user messages — HTTP 400 in system or assistant messages. Anthropic endpoint: `image` block with `source.type` `base64|url|file`.
- Context caching runs automatically, matches only on exact full matches of a persisted cache unit, and operates on a best-effort basis; "static before variable" is inferred from examples ((unbelegt)).
- Tool-call markup (relevant only when hand-authoring examples or local inference): DSML **with leading whitespace** — `<｜DSML｜ calls>`, `<｜DSML｜ invoke name="…">`, `<｜DSML｜ parameter name="…" string="true|false">`. Recommended locally: `temperature` 1.0, `top_p` 0.95 or 1.0, 1M context, `max_tokens` ≥ 256K.

## Strengths & Weaknesses (prompt-relevant)
- Multimodal MoE with 552B backbone parameters in causal encoder-decoder architecture: 8B active during prefill, 16B during decode; KV cache reported by vendor as 1/4 HBM and 1/8 SSD of previous generation — designed for input-heavy agent workloads. Native text + images, output text only.
- Strengths (Max effort, vendor figures): Agentic coding — Terminal-Bench 2.1 90.6 (V4-Pro 87.9), DeepSWE v1.1 74.2 (V4-Pro 62.7); Codeforces 3471; GPQA Diamond 90.9. DeepSeek ranks V4.1-Flash ahead of V4-Pro ("ahead of V4-Pro on performance, cost, speed & total runtime").
- Weaknesses: Factual knowledge deficit: SimpleQA-Verified (Base) 42.3 vs. 55.2 on V4-Pro-Base; HLE 36.8 vs. 42.7 on V4-Pro. On heavy agent benchmarks, clearly behind Opus 5.0 (Terminal-Bench 3.0 30.0 vs. 43.3, Terminal-Bench 4.0 31.2 vs. 51.8). Knowledge-heavy prompts require dedicated grounding.
- JSON output occasionally returns empty `content` (adjust prompt); FIM completion available in non-thinking mode only.

## Output & Format Conventions
- **1M context, max 384K output** (`/models`: 1,048,576 / 393,216 tokens). `max_tokens` default: 8K (Non-Thinking) / 64K (Thinking) / 128K (`reasoning_effort: max`).
- Features: JSON Output, Tool Calls (`strict` mode as Beta via `/beta`), Responses API, Anthropic API, Chat Prefix Completion (Beta), FIM (Beta, non-thinking only), Vision. `response_format` supports only `text|json_object`; up to 16 `stop` sequences; `top_logprobs` 0–20; `frequency_penalty`/`presence_penalty` deprecated and ineffective.
- Vision limits: JPEG/PNG/GIF/WebP; max 1024 tokens per image; up to 600 images per request; request body 48 MiB; individual image 32 MiB (64 MiB via Files API `file_id`).
- Pricing per 1M tokens (Peak / Off-Peak): input cache hit $0.006 / $0.003, cache miss $0.30 / $0.15, output $1.20 / $0.60; concurrency limit 2500. Peak = Mon–Fri 01:00–04:00 and 06:00–10:00 UTC.
- Base URLs: `https://api.deepseek.com` (OpenAI SDK), `https://api.deepseek.com/anthropic` (Anthropic SDK; `claude-haiku*`/`claude-sonnet*` and unknown model names → `deepseek-flash`, `claude-opus*` → `deepseek-v4-pro`), `https://api.deepseek.com/beta` (Prefix Completion, `strict` tools). Legacy IDs `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` are temporarily routed to V4.1-Flash and billed at Flash pricing.
- Anthropic endpoint: `thinking` without `budget_tokens`, `output_config` effort only; `top_k`, `cache_control`, `container`, `mcp_servers` are ignored; `document`, `search_result`, `redacted_thinking`, and MCP blocks are not supported.

## Migration Notes
- **MIGRATING FROM deepseek-v4-flash TO deepseek-v4.1-flash**: Keep base_url, set `model` to `deepseek-flash` — the old ID runs only transitionally. Prompt deltas: update hand-authored DSML examples from `<｜DSML｜tool_calls>` to `<｜DSML｜ calls>`/`<｜DSML｜ invoke>`/`<｜DSML｜ parameter>`; image workarounds (injected OCR/alt text) can be replaced with real image blocks; system updates can be delivered as subsequent system messages.
- **MIGRATING FROM deepseek-v4-pro TO deepseek-v4.1-flash**: Identical API parameters, identical effort levels, identical 1M/384K limits, but different template (see above). Back up knowledge-heavy prompts with reference material (SimpleQA/HLE lower). Anthropic endpoint: `in-history` instead of `leading-only`.
- **MIGRATING FROM deepseek-chat / deepseek-reasoner** (V3/R1 era, decommissioned since 2026-07-24 15:59 UTC): The chat-vs-reasoner model split becomes a mode flag (`thinking: disabled` or `reasoning_effort: none` for former chat prompts); remove `frequency_penalty`/`presence_penalty`; R1 temperature advice (0.6) is ineffective in thinking mode; pass back `reasoning_content` in tool loops instead of stripping; remove chunking scaffolding designed for older context windows.
- **MIGRATING FROM deepseek-v4.1-flash**: Map `thinking`/`reasoning_effort`/`output_config.effort` to the target guide's effort ladder and adjust `reasoning_content` return behavior; if target supports `json_schema`, convert in-prompt JSON examples into genuine schemas; replace `prefix: True` with target's prefill equivalent; retain image blocks only if target guide documents vision (V4-Pro: no); consolidate subsequent system messages into the leading system message if target does not adopt them (V4-Pro: `leading-only`).
- Lifecycle: Routing of legacy IDs is designated as "temporarily"; a V4.1-Pro has been announced, release date (unbelegt).

## Sources
- https://api-docs.deepseek.com/news/news260910 — Release announcement 2026-09-10: 552B MoE, Causal Encoder-Decoder with 8B/16B active, KV cache 1/4 HBM / 1/8 SSD, model name `deepseek-flash`, retirement of V4-Flash/V4-Flash-Vision-Exp with temporary routing, "ahead of V4-Pro" statement, V4.1-Pro announced.
- https://api-docs.deepseek.com/updates — Change log 2026-09-10: Benchmarks (Terminal-Bench 2.1 90.6, DeepSWE v1.1 74.2, Codeforces 3471, GPQA Diamond 90.9, HLE 36.8), transition to `deepseek-flash`, continued operation of V4-Pro after 2026-09-14.
- https://api-docs.deepseek.com/quick_start/pricing — Model table: Version DeepSeek-V4.1-Flash, 1M / 384K, thinking default, feature matrix including vision and FIM non-thinking only, Peak/Off-Peak prices and hours, concurrency 2500, footnote on legacy IDs.
- https://api-docs.deepseek.com/api/list-models — `deepseek-flash`: 1,048,576 / 393,216 tokens, `input_modalities` text + image, effort `low|high|max` with default `high`, `system_prompt_update: in-history` (V4-Pro: `leading-only`).
- https://api-docs.deepseek.com/guides/thinking_mode — Toggle and effort in OpenAI, Anthropic (`output_config.effort`), and Responses formats, effort mapping including minimal/xhigh/ultra, `top_p` in thinking mode only, `reasoning_content` rules with/without `tools` including 400.
- https://api-docs.deepseek.com/api/create-chat-completion — Model values `deepseek-flash`/`deepseek-v4-pro`, `reasoning_effort` enum, `max_tokens` defaults and maximum, `response_format` text/json_object, 16 stops, `tool_choice` 400 error in thinking mode, image content parts with `detail`, deprecated penalties.
- https://api-docs.deepseek.com/guides/vision — Image formats, three input methods, `detail` levels, max 1024 tokens per image, limits (600 images, 48 MiB body, 32/64 MiB individual image), images in user messages only, Anthropic `image` block.
- https://api-docs.deepseek.com/guides/anthropic_api — Mapping haiku/sonnet/unknown → `deepseek-flash`, opus → `deepseek-v4-pro`; field support (`thinking` without `budget_tokens`, `output_config` effort only, ignored fields, unsupported blocks).
- https://api-docs.deepseek.com/guides/json_mode — `json_object`, mandatory literal "json", example in prompt, `max_tokens` note, occasionally empty `content`.
- https://api-docs.deepseek.com/guides/chat_prefix_completion — Prefill via assistant role with `prefix: True` on `/beta` base URL, combination with `stop`.
- https://api-docs.deepseek.com/guides/kv_cache — Automatic caching, hit only on exact full match of a cache unit, best-effort; ordering recommendation "static before variable" is not explicitly stated there.
- https://api-docs.deepseek.com/guides/tool_calls — `strict` mode (Beta) via `/beta`, in thinking and non-thinking modes.
- https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash — Model Card: 552B MoE, Causal Encoder-Decoder (8B/16B active), native image processing, effort 1–100, Base benchmarks (SimpleQA-Verified 42.3 vs. 55.2 V4-Pro-Base), Instruct comparison with Opus 5.0 and V4-Pro (HLE, Terminal-Bench 3.0/4.0), recommended local sampling parameters, MIT license.
- https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/encoding/README.md — Three template changes vs. V4 (DSML with leading whitespace, numerical effort low=50/high=75/max=100, `<｜System｜>` mid-conversation), BOS template, effort prefix only in thinking mode at conversation start.

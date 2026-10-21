---
model: kimi-k3
vendor: Moonshot AI
family: Kimi
aliases: [kimi, k3, kimi3, moonshot-kimi-k3]
last_verified: 2026-10-13
status: current
---

# Kimi K3

## Reasoning / Thinking
- Type: **permanently enabled, cannot be disabled**. The quickstart FAQ response to disabling Chain-of-Thought states: "You can't — K3 always thinks." The sole parameter to curb thinking time is `reasoning_effort: "low"`.
- Depth is controlled exclusively via the top-level field `reasoning_effort`: `low | high | max`, **default `max`** — which is the most expensive tier if unspecified. Moonshot maps them as: `low` is fastest, `high` balances speed and quality, `max` is intended for the hardest reasoning tasks.
- The K2.x `thinking` object (`type: "enabled"|"disabled"`, `keep`) is **not** supported by K3; migration documentation explicitly instructs users upgrading from K2.x to remove old `thinking` configurations and specify `reasoning_effort` instead.
- Reasoning text is delivered separately from final response text: non-streaming as `reasoning_content` in `choices[0].message`; streaming as separate deltas alongside `content` according to the quickstart — the quickstart streaming example reads it as `delta.reasoning_content` (while the Chat Completions reference schema lists only `role`/`content`/`tool_calls`).
- On the Anthropic-compatible Messages API, the parameter is named `output_config.effort` (`low|high|max`); reasoning appears as a thinking content block in the sequence thinking → text → tool_use and streams as `thinking_delta`. On the Responses API, it is named `reasoning.effort` (enum `low|high|max`, default `max`); no other values are documented.
- Determine `reasoning_effort` **prior** to starting a conversation — Moonshot justifies this for prefix cache reuse; `tool_choice`, by contrast, may change per request without invalidating prefix cache.
- `max_completion_tokens` caps reasoning **plus** response: default 131,072, maximum 1,048,576. Treat `finish_reason: "length"` as an error and increase the limit according to the Agent guide, rather than recording it as a completed answer.

## Prompting Style
- **Keep system prompt lean and role-focused**: "Keep the system prompt focused on the role, workflow, and quality boundaries. Leave argument details in the tool schema." Add requirements incrementally rather than dumping them monolithically upfront.
- **Draw boundaries explicitly**: Moonshot describes K3 as "proactive by nature — if you need tighter boundaries, set them explicitly in your system prompt or AGENTS.md". Tight tasks need an explicit written scope rule.
- **No sampling controls**: temperature, top_p, n, and penalties are fixed (see below). Determinism, variance, and format adherence must be achieved through prompt instructions, `response_format`, and tool schemas.
- **Declare tools sparingly**: "don't put every tool definition into the request — they eat up context and make the model more likely to pick the wrong tool". A single `search_tools` function plus a minimal set of core tools is recommended; remaining tools should be loaded dynamically via a `system` message with a `tools` field (identical schema format). Setting `tool_choice: "required"` in the first turn forces tool discovery, then revert to `"auto"`.
- Constrain tool schemas tightly: `additionalProperties: false` combined with a complete `required` list reduces invalid arguments according to documentation.
- General platform recommendations (not K3-specific): set role in system message, separate sections with delimiters (triple quotes, XML tags, headings), write out steps explicitly, few-shot examples for hard-to-describe styles, length constraints specified in paragraphs or bullet counts rather than word counts, actively demand brevity ("The model can't read your mind").

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Long, low-oversight engineering sessions ("sustain long engineering sessions with minimal oversight, navigate massive repositories").
  - Native image **and** video understanding in a single model; 1M context.
  - Reliable Structured Outputs according to documentation, including nested objects, arrays, and `anyOf`.
  - `tool_choice: "required"` is supported (unavailable in K2.7 Code and K2.6).
  - Cost leverage via caching: cache hit pricing is 10% of cache miss pricing, and Moonshot reports "90%+ cache hit rate" for coding workloads — maintaining stable prompt prefixes is the primary cost-saving mechanism.
- Weaknesses:
  - **Repeated identical tool calls** are a documented failure mode; Moonshot provides a client-side mitigation playbook (reminders starting at 3 identical retries, escalated at 5, repeated at 8) rather than a model parameter — inject these reminders into the agent loop, not the static system prompt.
  - History replay sensitivity: the full assistant turn must be replayed unchanged. "Copying only `content` and `tool_calls` drops any returned `reasoning_content` and breaks the context needed by later tool calls." Also: "don't switch to K3 mid-session from another model."
  - Built-in web search `$web_search` (`builtin_function`) is deprecated and sunsetting on 2026-10-20; replacements are REST APIs `POST /v1/tools/search`, `/v1/tools/search_pro`, and `/v1/tools/fetch` (independent Web Search QPS limits), or the server-side `{"type": "web_search"}` tool on Responses API.
  - Public image URLs are not supported (only base64 or `ms://<file-id>`, `content` as array of objects).
  - Block-based caching: residual tokens that do not fill a full block are not written and billed as cache misses.
  - Tier0 rate limits (from $1 deposit) are limited to 1 concurrency and 3 RPM, suitable only for testing.

## Output & Format Conventions
- Context window: 1,048,576 tokens; `max_completion_tokens` default 131,072, maximum 1,048,576. Modalities text/image/video → text.
- **Fixed sampling parameters**: "temperature=1.0, top_p=0.95, n=1, presence_penalty=0, and frequency_penalty=0 are fixed; omit them from requests." The Messages API does not document `temperature`/`top_p` at all.
- `response_format`: `text` (default) | `json_object` | `json_schema`. Documentation rule: "Always explicitly set strict: true." When parsing, read exclusively `choices[0].message.content` — "do not call json.loads on the entire response object", and never parse `reasoning_content`.
- Three interfaces for K3: Chat Completions, Responses (`POST /v1/responses`, currently supporting only `kimi-k3` according to reference), and Messages (Anthropic-compatible). On the Messages API, `max_tokens` is required and the thinking block must be replayed into subsequent turns unchanged.
- Prefill / Partial Mode: on Chat Completions, append a trailing assistant message with `partial: true`; the model continues the text (prepend prefix when rendering); on the Messages API, a trailing assistant message suffices. Thinking consumes `max_tokens` first — setting an insufficient limit results in empty `content` and `finish_reason: "length"`.
- Pricing per 1M tokens: input $0.30 (cache hit) / $3.00 (cache miss), output $15.00, cache write billed separately at $3.00 (TTL 5m) or $6.00 (TTL 1h) per 1M tokens — flat pricing, explicitly **no** tiered length scaling. Minimum deposit of $1 unlocks K3; rate limit tiers scale based on cumulative top-up from Tier0 (1 concurrency / 3 RPM / 500k TPM) to Tier5 (100 concurrency / 300 RPM / 5M TPM).
- Automatic prompt caching (without cache ID) with TTL `5m` (default) or `1h`: on Chat Completions and Responses via `prompt_cache_options: {"mode": "implicit", "ttl": "1h"}`; on Messages API exclusively via top-level `cache_control` (`{"type": "ephemeral", "ttl": …}`) — if omitted, defaults to `5m` read/write; `cache_control` markers within `messages` are ignored. The TTL of an entry is fixed upon initial write; `prompt_cache_key` exists on Chat Completions and should carry session or task ID for coding agents — pass the identical value when resuming an interrupted session.
- Open weights: `moonshotai` model card lists 2.8T parameters total / 104B active, 896 experts with 16 selected plus 2 shared per token, MoonViT-V2 vision encoder, MXFP4 weights, and the "Kimi K3 License". Evaluation settings (not explicit serving recommendations) specify `temperature 1.0` with `reasoning_effort: max`, and `top_p 0.95` for single-step or `top_p 1.0` for agentic tasks; sampling recommendations for self-hosting are (unbelegt).

## Migration Notes
- **MIGRATING FROM kimi-k3**:
  - Reintroduce explicit reasoning instructions if the target model does not reason unconditionally (step-by-step instructions, thinking toggles, or reasoning budgets depending on target).
  - Re-evaluate K3-specific scope guardrails ("proactive by nature") instead of carrying them forward blindly.
  - Review agent-loop tool retry reminders — they compensate specifically for a K3 behavioral pattern.
  - Remove `reasoning_effort`, `output_config.effort`, and `reasoning_content` handling.
  - Re-enable sampling controls (temperature/top_p/penalties) as active configuration options.
  - Retain Dynamic Tool Loading and `search_tools` indirection only if supported by the target.
- **MIGRATING TO kimi-k3**:
  - Completely remove `thinking` objects from K2.x as well as temperature, top_p, n, presence_penalty, and frequency_penalty.
  - Configure `reasoning_effort` explicitly rather than inheriting the expensive default `max`, and fix it prior to the first turn.
  - Recalculate `max_completion_tokens`, since reasoning tokens consume the same budget.
  - Refactor pipelines to ensure the complete assistant turn including `reasoning_content` is passed back unchanged (otherwise subsequent tool calls will break).
  - Transition format constraints from prose conventions to `json_schema` with `strict: true`, parsing only `content`.
  - Prune tool definitions or transition to Dynamic Tool Loading.
  - Convert image URLs to base64 or `ms://<file-id>`.
  - Remove `$web_search` declarations (sunset 2026-10-20) and connect search either as a custom function tool via `/v1/tools/search`/`search_pro`/`fetch` or via the server-side `web_search` tool on Responses API.
  - Keep prompt prefixes strictly stable to benefit from 10× cheaper cache-hit pricing.
  - Replace Claude-style `cache_control` breakpoints on content blocks with top-level `cache_control` (Messages API) or `prompt_cache_options.ttl` (Chat/Responses), choosing `1h` for request intervals exceeding 5 minutes.
  - Retain Claude-style prefill (trailing assistant message) on Messages API or express as `partial: true` on Chat Completions.
  - Avoid mid-session model switches.

## Sources
- https://platform.kimi.ai/docs/guide/kimi-k3-quickstart — Positioning (2.8T parameters, native vision, 1M context), FAQ "You can't — K3 always thinks", verbatim fixed sampling parameters, `reasoning_effort` low/high/max with default `max`, `max_completion_tokens` 131,072 to 1,048,576, rule on unmodified assistant turns, vision without public URLs, web search warning, flat pricing, TTL `5m`/`1h` and block-based caching, streaming example with `delta.reasoning_content`, Partial Mode, minimum top-up $1.
- https://platform.kimi.ai/docs/api/models-overview.md and https://platform.kimi.ai/docs/api/chat — Parameter matrix and Chat Completions reference: for kimi-k3 fixed temperature 1.0, top_p 0.95, n 1, penalties 0, `thinking` unsupported, `tool_choice` auto/none/required (k2.7-code and k2.6 cannot use `required`), `reasoning_effort` exclusive to K3, `response_format` text/json_object/json_schema, `prompt_cache_key`, default `max_completion_tokens` 131,072; `reasoning_content` in non-streaming `choices[0].message`, streaming delta with `role`/`content`/`tool_calls`.
- https://platform.kimi.ai/docs/guide/use-reasoning-effort.md — `reasoning_effort` as top-level field with `low`/`high`/`max` and default `max`; explicit instruction to remove legacy `thinking` configuration when upgrading from K2.x.
- https://platform.kimi.ai/docs/guide/kimi-k3-tool-calling-best-practice.md, https://platform.kimi.ai/docs/guide/use-kimi-k3-to-setup-agent.md and https://platform.kimi.ai/docs/guide/tool-call-repeat.md — Anti-pattern "don't put every tool definition into the request", `search_tools` pattern and Dynamic Tool Loading, `tool_choice: "required"` in initial turn (does not invalidate prefix cache), fixing effort prior to conversation start; system prompt rule "role, workflow, and quality boundaries", `additionalProperties: false` + `required`, warning on lost `reasoning_content`, `finish_reason: "length"` as error; reminder escalation at 3 / 5 / 8 identical tool calls.
- https://platform.kimi.ai/docs/guide/response_format.md — `json_object` vs. `json_schema`, "Always explicitly set strict: true", reliable K3 support for nested objects/arrays/`anyOf`, parse only `choices[0].message.content` and not entire response object.
- https://platform.kimi.ai/docs/guide/prompt-best-practice.md — General platform prompting best practices: role in system message, delimiters, explicit steps, few-shots for style, length control via paragraphs/bullets, "The model can't read your mind".
- https://platform.kimi.ai/docs/api/messages.md — Anthropic-compatible Messages API: `enum: ["kimi-k3"]`, required `max_tokens`, `output_config.effort` low/high/max, content block sequence thinking → text → tool_use, `thinking_delta` in streaming, unmodified thinking block replay in subsequent turns; no `temperature`/`top_p`; trailing assistant message = Partial Mode; top-level `cache_control` (markers in `messages` ignored).
- https://platform.kimi.ai/docs/api/responses.md — Responses API: `POST /v1/responses`, "This endpoint currently supports `kimi-k3`"; `reasoning.effort` low/high/max, default `max`; `prompt_cache_options`; server-side `web_search` tool.
- https://platform.kimi.ai/docs/pricing/chat-k3.md and https://platform.kimi.ai/docs/pricing/limits.md — $0.30 cache hit / $3.00 cache miss input, $15.00 output per 1M tokens, 1,048,576 context without length tiers; rate limit tiers based on cumulative top-up from Tier0 (1 concurrency, 3 RPM, 500k TPM) to Tier5 (100 concurrency, 300 RPM, 5M TPM); cache write $3.00 (TTL 5 min) / $6.00 (TTL 1 h); dedicated "Web Search QPS" column independent of RPM/TPM.
- https://platform.kimi.ai/docs/guide/context-caching.md and https://forum.moonshot.ai/t/context-caching-upgrade-5-min-1-hour-ttl-options/613 — Cache write billed separately since 2026-09-28, TTL `5m`/`1h`, `prompt_cache_options`, top-level `cache_control` on Messages API (omitted = default `5m`; markers in `messages` ignored), TTL fixed from initial write, block-based storage (remainder below block size = cache miss); cache write exclusive to kimi-k3.
- https://platform.kimi.ai/docs/guide/use-web-search.md, https://platform.kimi.ai/docs/guide/best-practices-for-web-search.md and https://platform.kimi.ai/docs/pricing/websearch.md — `$web_search` deprecated, sunset 2026-10-20; replacements `/v1/tools/search`, `/v1/tools/search_pro`, `/v1/tools/fetch`.
- https://platform.kimi.ai/docs/guide/use-partial-mode-feature-of-kimi-api.md — Partial Mode, thinking consumes `max_tokens` first.
- https://platform.kimi.ai/docs/models — Roster with kimi-k3 ("most capable model … 2.8 trillion parameters, native visual understanding, 1M-token context window"), kimi-k2.7-code and kimi-k2.6 (each 256k) as well as kimi-k2.7-code-highspeed (context not specified there); deprecation table: kimi-k2.5 and moonshot-v1 series sunset on 2026-08-31, kimi-k2 series on 2026-05-25 — migration target is kimi-k3 for each.
- https://huggingface.co/moonshotai/Kimi-K3 — Official model card: 2.8T parameters total / 104B active, 896 experts with 16 selected and 2 shared per token, MoonViT-V2 vision encoder, context 1,048,576, MXFP4 quantization, "Kimi K3 License", thinking always on with `reasoning_content`, evaluation setting temperature 1.0 / top_p 0.95 (single-step) or 1.0 (agentic).
- https://forum.moonshot.ai/t/kimi-k3-is-here-our-most-capable-model/480 — Announcement of 2026-07-22: positioning of three effort levels, "90%+ cache hit rate in coding", "pass the full assistant message back in multi-turn conversations", "don't switch to K3 mid-session from another model", "K3 is also proactive by nature — if you need tighter boundaries, set them explicitly in your system prompt or AGENTS.md".

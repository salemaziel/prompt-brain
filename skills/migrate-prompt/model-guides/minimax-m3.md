---
model: minimax-m3
vendor: MiniMax
family: MiniMax
aliases: [minimax, minimax-m3-mxfp8, "MiniMaxAI/MiniMax-M3"]
last_verified: 2026-10-13
status: current
---

# MiniMax-M3

## Reasoning / Thinking
- Type: **binary on/off** (hosted API) — `thinking: {"type": "adaptive"}` turns thinking on, `thinking: {"type": "disabled"}` turns it off. No effort ladder, no `budget_tokens`; reasoning depth is directed via prompt text, not via an API parameter. The MiniMax API now includes `output_config.effort` / `reasoning_effort` (low…max), but these are only functional for MiniMax-M3.1-Flash-Preview — M3 silently ignores these fields ("Other models ignore this field").
- The Hugging Face model card lists three modes for `thinking`: `enabled` (reasoning always on), `adaptive` ("M3 automatically determines when additional reasoning is beneficial"), and `disabled`. The hosted API documents only `adaptive`/`disabled`; `enabled` therefore pertains to self-hosting with the open weights.
- **The default depends on the endpoint** — the most common migration trap. Anthropic-compatible Messages path: "`MiniMax-M3`: thinking is off when `thinking` is omitted". OpenAI-compatible Chat Completions path: "`MiniMax-M3`: adaptive thinking is on by default". Therefore, **always set it explicitly**, never rely on inherited defaults.
- Vendor recommendation on mode selection: thinking on for complex reasoning, agentic tasks, and long-running collaboration; thinking off for latency-sensitive use cases such as conversational dialogue and code completion.
- **Interleaved Thinking**: M3 thinks between tool iterations — before each tool use, the model reflects on the environment and tool results before deciding on the next action.
- Strict multi-turn rule: the **complete** assistant message must be appended back into history unchanged ("preserve them unchanged in later turns, especially in tool-use conversations"). Anthropic path: complete `response.content` list (thinking/text/tool_use). OpenAI path: complete `response_message` including `tool_calls`, plus `reasoning_details` when `reasoning_split=true`. When using the native `<think>` format, do not alter the `content` field. Filtering out thinking blocks breaks the reasoning chain.
- Thinking blocks carry a `signature` field; in streaming, they arrive as `thinking_delta` chunks. `reasoning_split` is purely an output format toggle and "does not enable or disable thinking".

## Prompting Style
The former official page "M-series Usage Tips" (`token-plan/prompting-best-practices`) was removed (HTTP 404 as of 2026-10-13) with no successor in documentation; the following points are therefore soft heuristics:
- **Place task at the end**: source material first, question afterwards; index sources and demarcate them with date/label; have the model quote or summarize relevant passages before answering. (unbelegt)
- **Label sections** rather than using plain prose: Task, Context, Source, Constraints, Output format — short labels with colons or bold headings. (unbelegt)
- **Specify reasoning depth in prompt**: explicitly request deeper analysis for planning, debugging, trade-offs, and long-horizon tasks; conversely, request direct answers without explanation for extraction/classification; avoid asking for hidden chain-of-thought. (unbelegt)
- **Few-shot outperforms style abstraction**: 3–5 *diverse* examples for classification/extraction (relevant, edge cases included, concrete target format); repeating near-duplicate examples wastes tokens. (unbelegt)
- **Explicit output contracts**: specify section names, table columns, bullet caps, and scope boundaries rather than vague adjectives like "detailed" or "concise". (unbelegt)
- **Tool definitions** with purpose, inputs, return format, and failure behavior, plus a when-*not*-to-call rule; establish stopping criteria (e.g., abort after two failures and explain the blocker); use parallel calls only for independent read-only lookups, keeping stateful workflows sequential. (unbelegt)
- **Mitigate hallucinations**: explicitly grant permission to decline/refuse, require citations/sourcing, specify allowed sources, timeframe, and product versions **prior** to the task prompt. (unbelegt)
- **Include intent** where literal adherence might diverge from the underlying goal. (unbelegt)
- For long deliverables, explicitly authorize full context window utilization and maintain visible scratchpad plans, status, and open questions across long runs — dedicated context window per ongoing task. (unbelegt)
- Verified fact from Hugging Face model card: sampling defaults are `temperature=1.0`, `top_p=0.95`.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Agentic coding and tool use (SWE-Bench Pro 59.0%, Terminal-Bench 2.1 66.0%, MCP Atlas 74.2%).
  - 1M context powered by MiniMax Sparse Attention (at 1M context, ~1/20 compute per token compared to predecessor generation, >9x prefill speedup, >15x decode speedup).
  - Natively multimodal supporting image **and video** input.
  - High generation speed (~100+ tps).
  - Very cost-effective ($0.30 input / $1.20 output per 1M tokens in Standard tier).
- Weaknesses:
  - **Price cliff at 512k input tokens**: above 512k, input, output, and cache read rates double. Chunking strategy matters more than exhausting the window.
  - No documented effort gradation (only `disabled`/`adaptive`) and no token budget parameter — depth control relies entirely on prompt phrasing.
  - `stop_sequences` and `top_k` are ignored on the Anthropic-compatible endpoint.
  - Structured Outputs / JSON Schema mode are not documented for M3 (unbelegt) — format compliance must be enforced via prompt constraints.
  - Knowledge cutoff is not published (unbelegt).
  - Open weights (Hugging Face, minimax-community license): ~428B parameters, ~23B active (MoE); self-hosting labeled "Experimental" by vendor.
  - Vendor blog designates financial domain capabilities as only "initially usable" — avoid relying on autonomous execution there.

## Output & Format Conventions
- Context window: **up to 1,000,000 tokens**; via API, MiniMax guarantees "a guaranteed minimum of 512K tokens". Self-hosted, 1M is merely a model architectural ceiling (SGLang validates 1K–128K). `max_tokens` (Anthropic path) or `max_completion_tokens` (OpenAI path): recommended 131,072 (128K), maximum 524,288 (512K); `max_tokens` is deprecated on the OpenAI path. Thinking tokens count toward `max_tokens`; undersizing results in `stop_reason: "max_tokens"` without text (Anthropic) or `finish_reason: "length"` with empty `content` (OpenAI).
- Model ID (API, exact casing per documentation): `MiniMax-M3` — pass exactly this into `model`; `minimax-m3` is solely this repository's registry key.
- `temperature` default 1, range [0, 2]; `top_p` default **0.95** for M3 (0.9 for M2.x models).
- Two endpoints: Anthropic-compatible `https://api.minimax.io/anthropic` — recommended as default by MiniMax, "Supports thinking blocks, interleaved thinking, and other advanced features" — and OpenAI-compatible `https://api.minimax.io/v1`.
- Self-hosted: without `--reasoning-parser auto` / `--tool-call-parser auto`, raw `<mm:think>` or tool-call tokens appear in `content`.
- Prompt Caching is **automatic/passive** starting at 512 input tokens, with load-adaptive TTL; prefix order is `tool list → system prompts → user messages`. Place static content first, dynamic user data last. Explicit caching via `cache_control` (Anthropic path) is documented only for M2.x series; for M3, only passive caching is documented. The Messages schema accepts `cache_control` generically, but any effect on M3 is (unbelegt). Usage returns `cache_read_input_tokens`.
- Pricing per 1M tokens (Standard tier, documented as "Permanent 50% off"): ≤512k input $0.30 / output $1.20 / cache read $0.06; >512k $0.60 / $2.40 / $0.12. Priority tier (`service_tier: "priority"`) is 1.5x across the board.

## Migration Notes
- **MIGRATING FROM minimax-m3**:
  - Dismantle interleaved thinking assumptions — target models that do not reason between tool turns need explicit intermediate scaffolding reintroduced ("plan, call tool, evaluate result, decide next step").
  - Remove MiniMax-specific fields (`reasoning_split`, `reasoning_details`, `thinking: {"type": "adaptive"}`) and adapt history handling to target specs, as target models may not accept thinking blocks in history.
  - `top_p: 0.95` is an M3 default, not universal — adopt target provider defaults.
  - `stop_sequences` and `top_k` become functional again on other providers: parameters previously passed without consequence may now truncate responses.
  - If the target model has an effort / `budget_tokens` slider, replace prompt-based depth instructions with API parameters rather than duplicating them.
  - If the target context is smaller than 1M, replace task-at-the-end ordering (unbelegt) with robust retrieval/chunking.
  - When migrating to native Anthropic models, re-establish explicit `cache_control` breakpoints, as M3 only utilized passive caching.
- **MIGRATING TO minimax-m3**:
  - **Explicitly** set `thinking` — defaults differ between endpoints (off on Anthropic, adaptive on OpenAI).
  - Remove `budget_tokens`, `reasoning_effort`, `thinking_budget`, and similar depth parameters entirely (M3 silently ignores them rather than returning errors); if granular depth controls are required, use MiniMax-M3.1-Flash-Preview instead (preview, available only via M Plan/MiniMax Code).
  - Remove visible CoT scaffolding ("think step by step", "show intermediate steps") when thinking is enabled, and rely on prompt-based depth instructions instead.
  - Reconfigure multi-turn handling: replay full assistant messages including thinking blocks — keeping only text plus `tool_calls` as in other providers breaks the reasoning chain.
  - Rename `max_tokens` to `max_completion_tokens` on the OpenAI path and cap at ≤ 524,288 (recommended 131,072); size generously for thinking workloads.
  - Note that `stop_sequences` and `top_k` are ignored on the Anthropic-compatible path — enforce formatting through explicit prompt contracts (section headers, column specs, bullet limits), as a native schema mode is not documented (unbelegt); on the OpenAI path, behavior of `stop` is not documented here (unbelegt).
  - Restructure prompt layout: place source materials **before** the task prompt, label sections, and enrich tool definitions with failure behaviors and stop rules (unbelegt — source removed).
  - Verify caching layout (Tools → System → User, static content first) to maximize passive prefix caching hits.
  - Do not rely on `cache_control` breakpoints from Claude prompts — ground cost projections in passive prefix caching.
  - Keep requests below 512k input tokens — this marks both the guaranteed context limit and the threshold before pricing doubles.

## Sources
- https://platform.minimax.io/docs/api-reference/text-chat-anthropic — Anthropic-compatible Messages API: ID `MiniMax-M3`, `thinking` with `disabled`/`adaptive`, "`MiniMax-M3`: thinking is off when `thinking` is omitted", `output_config.effort` "Other models ignore this field", `service_tier` `standard`/`priority`, thinking blocks with `signature`, `thinking_delta` in streaming, `max_tokens` recommended 131072 / max 524288, `top_p` default 0.95 (M3) vs. 0.9 (M2.x), `cache_creation_input_tokens`/`cache_read_input_tokens`.
- https://platform.minimax.io/docs/api-reference/text-anthropic-api — Anthropic SDK page: content block types (text, image, video, tool use, tool result, thinking), `tools`/`tool_choice`, `temperature` [0, 2], `stop_sequences` and `top_k` ignored on this path, multi-turn rule "preserve them unchanged in later turns", thinking tokens counted against `max_tokens`.
- https://platform.minimax.io/docs/api-reference/text-chat-openai — OpenAI-compatible Chat Completions: "`MiniMax-M3`: adaptive thinking is on by default", `disabled` = "Skip thinking for `MiniMax-M3` and answer directly", "M2.x models: thinking cannot be disabled", `reasoning_effort` "other models ignore this field", `reasoning_split` output switch with `reasoning_content`/`reasoning_details`, `max_completion_tokens` 131072/524288, `max_tokens` deprecated, `temperature` default 1.
- https://platform.minimax.io/docs/api-reference/text-openai-api — OpenAI SDK page: thinking tokens count against `max_tokens` (`finish_reason: "length"` with empty `content`), `service_tier`, thinking control table.
- https://platform.minimax.io/docs/guides/text-m3-function-call — "Tool Use & Interleaved Thinking": reasoning between tool iterations, reflection prior to tool use, "the complete model response ... must be append to the conversation history to maintain the continuity of the reasoning chain", separate rules for Anthropic and OpenAI SDKs, and warning against modifying `content` field in `<think>` format.
- https://platform.minimax.io/docs/guides/text-generation — Model table (M3: 1M context, ~100+ tps), base URLs for both endpoints, recommendation of Anthropic path ("Supports thinking blocks, interleaved thinking, and other advanced features"); M3.1-Flash-Preview "available only through M Plan and MiniMax Code for now".
- https://www.minimax.io/models/text/m3 — "up to 1M tokens context window with a guaranteed minimum of 512K tokens".
- https://huggingface.co/MiniMaxAI/MiniMax-M3 — Official model card: ~428B parameters / ~23B active, minimax-community license, three `thinking` modes `enabled`/`adaptive`/`disabled`, sampling `temperature=1.0`, `top_p=0.95`.
- https://platform.minimax.io/docs/guides/local-deploy-m3 — Self-hosting: "Deployment status: Experimental", weights `MiniMaxAI/MiniMax-M3-MXFP8`, 1M context is model ceiling (SGLang validates 1K–128K), `--reasoning-parser auto` / `--tool-call-parser auto`, otherwise raw `<mm:think>` tokens in `content`.
- https://platform.minimax.io/docs/guides/pricing-paygo — Pricing table including 512k threshold: Standard $0.30/$1.20/$0.06 or $0.60/$2.40/$0.12, Priority 1.5x via `service_tier: priority`, note "Permanent 50% off".
- https://platform.minimax.io/docs/api-reference/text-prompt-caching — Automatic/passive caching from 512 input tokens, load-adaptive TTL, prefix sequence tool list → system prompts → user messages, recommendation static first / dynamic last; Cache Comparison: explicit prompt caching limited to M2.x series.
- https://platform.minimax.io/docs/api-reference/anthropic-api-compatible-cache — Supported Models and Pricing: only lists M2.7/M2.5/M2.1 (no M3 row).
- https://platform.minimax.io/docs/release-notes/models — Release date 2026-06-01 and categorization as "latest M-series language model for agentic reasoning, tool use, coding, multimodal chat input, and long-context tasks" (since M3.1-Flash-Preview, model overview lists this label for M3.1; M3 "also remain[s] available").
- https://www.minimax.io/blog/minimax-m3 — MiniMax Sparse Attention, 1/20 compute per token at 1M and 9x/15x prefill/decode speedup, "M3 supports toggling thinking on or off" with mode recommendations, SWE-Bench Pro 59.0%, Terminal-Bench 2.1 66.0%, MCP Atlas 74.2%, native multimodality including video, "initially usable in the financial domain".

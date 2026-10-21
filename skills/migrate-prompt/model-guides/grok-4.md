---
model: grok-4
vendor: xAI
family: Grok
aliases: [grok4, grok-4-latest, grok-4-0709, xai.grok-4]
last_verified: 2026-10-13
status: legacy
successor: grok-4.3
---

# Grok 4

## Reasoning / Thinking
- **Type: Reasoning model without a toggle.** xAI lists `grok-4-0709` in the retirement table under reasoning models (routing to `grok-4.3` with `low`, not with `none`), OCI states "Has Reasoning: Yes". No official source documents a toggle to disable it; beyond that, that there is no non-reasoning mode at all is (unbelegt — secondary source only; the xAI model pages for grok-4 are offline).
- **Depth control: not parameterizable.** The original `grok-4` supports **no** `reasoning_effort`. If the parameter is sent via the API, the model returns an error response. (Note: `reasoning_effort` is documented at xAI for other models — according to OCI for Grok 3 mini, according to the model page for `grok-4.3` (`none`…`xhigh`, default `low`), according to the reasoning page for `grok-4.5`/`grok-4.6`/`grok-4.7`; for `grok-4.20` no `reasoning_effort` is documented — not for `grok-4`.)
- **Practical depth control:** Since no effort toggle exists, reasoning depth is controlled indirectly via the output budget — for demanding reasoning tasks, increase the `max_tokens`/maximum output limit so that enough headroom remains for internal thinking tokens.
- **Thinking traces not retrievable:** that Grok 4 does not expose its internal thinking process and does not provide a separate `reasoning_content`/chain-of-thought field is (unbelegt — secondary source only; the xAI model pages for grok-4 are offline).

## Prompting Style
- **Tool-augmented reasoning is native.** Grok 4 was trained via reinforcement learning to use tools while thinking — including a code interpreter and web browsing — and autonomously formulate its own search queries. Prompts should therefore clearly tell the model *which* tools/sources it is allowed to use, rather than prescribing every intermediate step.
- **Live Search is opt-in, not automatic.** Web search runs via the tools parameter (e.g., `tools=[web_search()]` in the xAI SDK or `{"type": "web_search"}` in the Responses API). Without an activated search tool, Grok has no access to current events according to the model overview.
- **Feature scope:** Function calling and Structured Outputs are supported; multimodal input consisting of text and images (output: text).
- **System prompt characteristics:** Specific statements documented by xAI regarding system prompt adherence or instruction following *specifically for grok-4* are not available from primary sources (unbelegt). xAI explicitly highlights "strict prompt adherence" and the lowest hallucination rate only for Grok 4.20, and strong instruction following for Grok 4.3 — not retroactively for grok-4.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Strong multi-step reasoning, multimodal understanding, and access to up-to-date information (via tool/web integration); agentic use possible since the model autonomously employs code interpreter and browser. Trained on verifiable data across many domains.
- Weaknesses:
  - No fine-grained control over thinking depth (`reasoning_effort` not available) — less control over latency vs. thoroughness than with grok-4.3 and 4.5+ models.
  - No documented reasoning trace → harder to debug (unbelegt, see above).
  - `presence_penalty`, `frequency_penalty`, and `stop` cannot be used with xAI reasoning models — accordingly do not plan on using them for grok-4 output control.
  - Knowledge cutoff November 2024; for newer facts, the search tool is required.

## Output & Format Conventions
- Delivers the final response; request structured outputs via Structured Outputs (JSON Schema) instead of manually parsed free-text formats.
- Formatting requirements (table, JSON, length) belong explicitly in the prompt; use `max_tokens` to limit response length, as `stop` sequences are not available.
- **Context window:** According to the xAI announcement, the Grok 4 API provides **256,000 tokens** (text + images). On third-party platforms, the usable window is partly lower — Oracle OCI lists "128,000 tokens" for `xai.grok-4`; that is a platform-specific limit.

## Migration Notes
- **Retired (xAI API):** `grok-4-0709` was retired on May 15, 2026, at 12:00 PT; the slug continues to resolve, and xAI has since automatically served requests to it with `grok-4.3` at `reasoning_effort: low` (billed at grok-4.3 rates) — an unchanged grok-4 prompt therefore already runs on shallower reasoning. August 15, 2026 is only the retirement date on Oracle OCI (`xai.grok-4`).
- **MIGRATING FROM grok-4** (xAI recommendation: grok-4.3; alternatively Grok 4.20):
  - grok-4.3: `none`/`low`/`medium`/`high` (default `low` according to the model page); for grok-4.20 no `reasoning_effort` is documented. If deeper reasoning is required, explicitly set `medium`/`high` instead of accepting the routed `low`.
  - Significantly larger context window available (grok-4.3 and grok-4.20: 1,000,000 tokens).
  - xAI promotes strict prompt adherence and low hallucination rates for Grok 4.20 → existing, defensively phrased prompts can often be streamlined.
  - For code and chat, xAI now recommends grok-4.7 (500k context, no `none`, default `high`).
- **MIGRATING TO grok-4** (from a non-reasoning or older Grok model):
  - No longer possible on the xAI API — requests land on grok-4.3 (see above); also retired on OCI since August 15, 2026. The following points only apply to any remaining deployments on other platforms (unbelegt).
  - Model always thinks — do not assume an effort/thinking switch can be set; `reasoning_effort` causes an error and must be removed from requests.
  - Remove `presence_penalty`/`frequency_penalty`/`stop` from existing requests (not allowed on reasoning models).
  - Explicitly enable the search tool for live web access; do not rely on automatic browsing.
  - Prompts can become more concise/goal-oriented (goal instead of step-by-step micromanagement), as the model handles tool selection and search queries itself.

## Sources
- https://x.ai/news/grok-4 — official Grok 4 announcement (07/09/2025): RL training for tool use (code interpreter, web browsing, own search queries), verifiable training data across many domains, Grok 4 API with "a 256,000 context window" and multimodal understanding.
- https://docs.x.ai/developers/migration/may-15-retirement — Retirement of `grok-4-0709` on 05/15/2026 12:00 PT, slug continues to resolve, routing to `grok-4.3` with `low`, billing at grok-4.3 rates, recommendation of grok-4.3 for reasoning workloads.
- https://docs.x.ai/developers/model-capabilities/text/reasoning — `reasoning_effort` documented for grok-4.7/4.6/4.5 (not for grok-4); error with `presencePenalty`/`frequencyPenalty`/`stop` on reasoning models.
- https://docs.x.ai/developers/tools/web-search — Web search via the `web_search` tool (xAI SDK and Responses API).
- https://docs.x.ai/developers/models — Current roster without grok-4; no real-time knowledge without enabled search tools; recommendation of grok-4.7 for code and chat.
- https://docs.x.ai/developers/models/grok-4.3 — Efforts `none`–`xhigh`, default `low`, 1M context, "strong tool calling and instruction following".
- https://docs.x.ai/developers/models/grok-4.20-0309-reasoning — 1M context, no effort levels listed, "the lowest hallucination rate on the market with strict prompt adherence".
- https://docs.oracle.com/en-us/iaas/Content/generative-ai/xai-grok-4.htm — Oracle OCI docs: Reasoning yes, `reasoning_effort` not supported (error when passed; available for Grok 3 mini), increase output limit for reasoning, function calling + Structured Outputs, knowledge cutoff November 2024, platform-side 128k, deprecation 05/15/2026 / retirement 08/15/2026.

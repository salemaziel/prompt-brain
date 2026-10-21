---
model: gpt-6-luna
vendor: OpenAI
family: GPT
aliases: [luna, gpt6-luna, 6-luna]
last_verified: 2026-10-13
status: current
---

# GPT-6 Luna

## Reasoning / Thinking
- `reasoning.effort` accepts `none | low | medium (default) | high | xhigh | max`. Unlike GPT-6 Astra and GPT-6.1 Sol, **`none` is permitted** ("GPT-6 Sol and GPT-6 Luna support `none`"). Selection according to deployment checklist: `low` for extraction, routing, classification, or routine rephrasing; `medium`/`high` when the model must diagnose, trade off, or plan; `xhigh`/`max` only with eval-proven quality gain.
- `reasoning.mode` `standard` (default) | `pro`: The reasoning guide states this for "GPT-5.6 and GPT-6 models" (Responses API only); Luna is not cited individually there — for Luna (unbelegt), test prior to production use.
- `configuration_update` (changing effort mid-conversation without rewriting the prompt prefix) is documented for the "GPT-6 model family in standard, single-agent mode", with the same constraints as Astra (no adjacent updates, no automatic compaction/truncation). Luna is not cited individually (unbelegt).
- `reasoning.context`: The reasoning guide lists `all_turns` only for GPT-5.6 models and GPT-6.1 Sol; not documented for Luna (unbelegt) — set `auto` and check the response field `reasoning.context`. Persisted reasoning is reused only within the same model family; when changing families, the API discards incompatible reasoning items.
- Reasoning tokens are invisible, but consume context and are billed as output tokens; `max_output_tokens` caps reasoning + response together (initial reserve according to docs at least 25,000 tokens).

## Prompting Style
- There is no dedicated Luna prompting guidance. The GPT-6 prompts in the model guide are explicitly "a starting point across the GPT-6 model family", but address "behavior observed with GPT-6 Astra" — adopt autonomy components, skill precedence sentence, prose instruction, slop word ban, and test scope rules only after own evaluation; that Luna exhibits the same idiosyncrasies is not verified (unbelegt).
- Define task scopes suited for Luna: OpenAI recommends `gpt-6-luna` "for efficient, repeatable work" and advises against routing every request to the strongest model. Tailor prompts closely to a clearly bounded task, specify output format explicitly (Structured Outputs is supported).
- Detail level: The deployment checklist calls `text.verbosity` (`low`/`medium`/`high`) "the main lever for balancing brevity against completeness" alongside content/structure/length in the prompt; its example uses Astra, not individually documented for Luna (unbelegt).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Positioning: "Our most efficient model for focused, high-volume tasks." In the model guide "Fastest and most cost-effective" with "Strong performance for focused, high-volume tasks."; in the catalog for "cost-sensitive, high-volume workloads".
  - The Decisions API launched on Oct 6, 2026 as beta with `gpt-6-luna`: "Turn text and images into typed answers 10x faster than the Responses API." Consider as an alternative to the Responses API for prompts with fixed answer types.
  - Same Responses tool set as Astra (`web_search`, `file_search`, `image_generation`, `code_interpreter`, `hosted_shell`, `apply_patch`, `skills`, `computer_use`, `mcp`, `tool_search`). EU data residency with Standard, Fast, Flex, and Batch (Regional Processing +10%).
- Weaknesses: Not the tier for the hardest work — highest capability resides with `gpt-6-astra`, complex coding / professional work at lower cost with `gpt-6.1-sol`. Image comprehension was compromised prior to an encoding fix on Sep 25, 2026; OpenAI recommends re-running evals with image input thereafter.

## Output & Format Conventions
- Context window 1,050,000 tokens, max 922,000 input and 128,000 output; knowledge cutoff May 18, 2026. Input text + image, output text. Single snapshot: `gpt-6-luna`.
- Pricing per 1M tokens: Input $0.10, Cached Input $0.01, Cache Writes $0.125, Output $0.50. Above 272K input tokens, 2x input/cache and 1.5x output rates apply to the entire request; Batch/Flex 50%, Fast mode 2x.
- Endpoints: Chat Completions, Responses, Batch (no Realtime, Assistants, Fine-tuning, Embeddings, Audio, Moderation). Built-in tools and function calling via the Responses API; **Chat Completions supports function calling only with `reasoning_effort: "none"`**.
- If effort is not `none`, remove `temperature`, `top_p`, and `top_logprobs` (in Chat Completions also `logprobs`, in Responses remove `message.output_text.logprobs` from `include`).
- Prompt caching (GPT-5.6 and newer): Cache lifetime via `prompt_cache_options.ttl` (`"30m"`), explicit breakpoints supported, cache writes 1.25x input rate, minimum prefix 1,024 visible input tokens.

## Migration Notes
- **MIGRATING FROM gpt-6-luna**: `reasoning.*`, `configuration_update`, and Decisions API calls are OpenAI-specific and are omitted on external targets. Target `gpt-6-astra` or `gpt-6.1-sol`: `none` → `low`, shift function calling from Chat Completions to Responses, remove sampling parameters. Reasoning items from Luna conversations do not transfer to other families.
- **MIGRATING TO gpt-6-luna**: Official replacement for `gpt-5.4-nano` (deprecation Oct 1, 2026, shutdown April 1, 2027). (1) Set `model` to `gpt-6-luna`. (2) Preserve effective effort; `none` continues to work, map `minimal` → `low` and compare. (3) Tools: With effort ≠ `none`, move to Responses API. (4) With effort ≠ `none`, remove sampling/logprob parameters. (5) From GPT-5.5 or earlier: `prompt_cache_retention` → `prompt_cache_options.ttl: "30m"`. (6) Use Astra prompt components only as a starting point and evaluate. (7) Re-run image input evals. (8) Escalate to `gpt-6.1-sol` or `gpt-6-astra` upon measured quality gaps.
- From `gpt-5.6-luna`: No official successor mapping; GPT-6 Luna is cheaper ($0.10/$0.50 vs $0.20/$1.20). Do not carry over GPT-5.6 reasoning items or a familiar `all_turns` unexamined.

## Sources
- https://developers.openai.com/api/docs/models/gpt-6-luna — Model page: id `gpt-6-luna` (single snapshot), tagline, effort `none`–`max` (default `medium`), function calling in Chat Completions only with `none`, 1,050,000/922,000/128,000 tokens, cutoff May 18, 2026, pricing including cache writes, 272K rule, batch/flex/fast, EU residency, endpoint matrix, feature and tool list.
- https://developers.openai.com/api/docs/models.md — Catalog: Luna as Featured Model "for cost-sensitive, high-volume workloads" alongside Astra and GPT-6.1 Sol.
- https://developers.openai.com/api/docs/guides/latest-model.md — GPT-6 model guide (rolling page, as of 2026-10-13): "Fastest and most cost-effective", `none` for Sol/Luna, function calling and sampling rules, prompt caching migration, Fast mode EU residency, prompts as starting point across family based on Astra observations.
- https://developers.openai.com/api/docs/guides/reasoning — Luna default `medium`, `reasoning.mode` for "GPT-5.6 and GPT-6 models", `configuration_update` for GPT-6 family, `all_turns` only GPT-5.6/GPT-6.1 Sol, reasoning reuse only within a family, billing and 25,000-token reserve.
- https://developers.openai.com/api/docs/guides/deployment-checklist — Effort selection by task type, `gpt-6-luna` "for efficient, repeatable work", `text.verbosity`, configuration_update for GPT-6 in standard/single-agent mode.
- https://developers.openai.com/api/docs/guides/prompt-caching — Differences starting with GPT-5.6: `prompt_cache_options.ttl` `"30m"`, breakpoints, 1.25x cache writes, 1,024-token minimum prefix.
- https://developers.openai.com/api/docs/changelog.md — Release of `gpt-6-luna` on Sep 22, 2026, image encoding fix with eval recommendation on Sep 25, 2026, Decisions API (beta) with `gpt-6-luna` on Oct 6, 2026.
- https://developers.openai.com/api/docs/deprecations — Entry 2026-10-01: `gpt-5.4-nano` → `gpt-6-luna`, shutdown April 1, 2027.

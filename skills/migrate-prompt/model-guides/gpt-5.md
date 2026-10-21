---
model: gpt-5
vendor: OpenAI
family: GPT
aliases: [gpt5, openai-gpt-5, openai-gpt5, gpt-5-2025-08-07]
last_verified: 2026-06-13
status: legacy
successor: gpt-5.6-sol
---

# GPT-5

## Reasoning / Thinking
- Type: **adaptive / steerable**. GPT-5 is a reasoning model whose thinking depth is controlled via the `reasoning.effort` parameter (in the Responses API) or `reasoning_effort`. Supported values: `minimal`, `low`, `medium`, `high`; default is `medium` when unset. ([Model Docs](https://developers.openai.com/api/docs/models/gpt-5), [New Params & Tools](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools))
- `minimal` runs "with few or no reasoning tokens to minimize latency" and is suitable for deterministic, lightweight tasks such as extraction, formatting, short rewrites, and simple classification. Higher values maximize quality, lower values maximize speed. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide), [New Params & Tools](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools))
- Depth can additionally be steered via prompt: Explicit exploration criteria, fixed tool call budgets (e.g., "maximum 2 tool calls") against over-eagerness, or persistence instructions ("keep going until the user's query is completely resolved") against under-eagerness. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- In ChatGPT, GPT-5 is implemented as a unified system with a real-time router that chooses between a fast model and a deeper reasoning model (based on complexity, tool requirements, and explicit intent). ([System Card](https://openai.com/index/gpt-5-system-card/))

## Prompting Style
- Highly prescriptive and instruction-following: GPT-5 follows prompt instructions with "surgical precision" and is "extraordinarily receptive to prompt instructions surrounding verbosity, tone, and tool calling behavior". ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- Idiosyncrasy / risk: This very adherence makes contradictory or vague prompts more harmful than with other models — GPT-5 "consumes reasoning tokens to resolve the contradictions". Prompts should therefore be conflict-free and unambiguous. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- Recommendation: Start with `medium` reasoning effort and test `minimal`, `low`, or `high` against representative tasks; set `text.verbosity` deliberately and shift structured response contracts into Structured Outputs wherever possible. ([Prompt Guidance "Using GPT-5"](https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5), Section Migration quickstart) Experimentation and iteration rather than a one-size-fits-all prompt. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- Agentic steering: GPT-5 provides "tool preambles" (plan/progress updates) by default; frequency and style can be steered via prompt (e.g., "Always begin by rephrasing the user's goal … outline a structured plan"). "Escape hatches" (allowing action, "even if it might not be fully correct") reduce excessive clarifying questions. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Strong coding capabilities across large codebases and multi-file refactors; superior agentic performance and tool calling; improved long-context understanding (context window 400,000 tokens); high steerability via prompts; better instruction following than predecessors. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide), [Model Docs](https://developers.openai.com/api/docs/models/gpt-5))
- Reduced hallucinations, improved instruction following, and lower sycophancy compared to predecessor models; "safe completions" instead of hard refusals on sensitive topics. ([System Card](https://openai.com/index/gpt-5-system-card/))
- Weaknesses: Tendency toward verbose outputs (steerable via `verbosity`); inclination toward unnecessary over-exploring of the context; occasional excessive clarifying questions on longer tasks; performance variance at `minimal` reasoning depending on prompt quality. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))

## Output & Format Conventions
- `verbosity` (in the Responses API as `text={"verbosity": ...}`) controls the length of the final response (not the thinking duration). Values: `low` (terse UX, minimal prose), `medium` (default, balanced detail), `high` (verbose, for audits/teaching/hand-offs). Can be overridden contextually via natural language in the prompt (e.g., "Use high verbosity for writing code and code tools"). ([New Params & Tools](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools), [Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- By default, GPT-5 uses **no** Markdown in API responses ("for maximum compatibility"); Markdown must be explicitly requested (e.g., "Use backticks to format file, directory, function, and class names"). Markdown adherence can degrade over long conversations — refresh instructions every 3–5 messages. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- Supported: Streaming, Function Calling, Structured Outputs. Max output: 128,000 tokens; knowledge cutoff: September 30, 2024. ([Model Docs](https://developers.openai.com/api/docs/models/gpt-5))
- New tooling features: Custom Tools (`"type": "custom"`) for raw text payloads (Python, SQL, Shell) without JSON wrapping (no parallel calling); Context-Free Grammar (CFG) for output constraint via `"format": {"type": "grammar", "syntax": "lark"|"regex", "definition": "..."}`, so that only grammar-compliant strings are emitted. ([New Params & Tools](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools))

## Migration Notes
- **MIGRATING TO gpt-5**:
  - Recommended first step: Switch the model, leave the prompt functionally unchanged initially, then align `reasoning_effort` with the latency/depth profile of the predecessor model and test against the eval suite. ([Prompt Migration](https://developers.openai.com/cookbook/examples/prompt_migration_guide))
  - Coming from GPT-4.1: `minimal` reasoning is the best upgrade for latency-sensitive users; prompting patterns similar to GPT-4.1 work well (few-shot, high-quality/maximally unambiguous tool descriptions, explicit agentic persistence, upfront planning, short summary of the train of thought at the start of the response). ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
  - Clean up contradictory/vague legacy prompts before migration — GPT-5 is more sensitive to them than predecessors. ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
  - Responses API is recommended: Preserves reasoning context across tool calls (`previous_response_id`) and delivers measurably better results (e.g., Tau-Bench Retail 73.9% → 78.2%). ([Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide))
- **MIGRATING FROM gpt-5**: On models without `reasoning_effort`/`verbosity`, these controls must be replaced with prompt instructions (explicit length/format/depth directives); Custom Tools and CFG grammar constraints may not be available and must be replaced with standard JSON function calling plus post-validation. (unbelegt — no primary-source-based migration checklist found; derived from the GPT-5-specific parameters in [New Params & Tools](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools))
- **Deprecation / Lifecycle:** Snapshot `gpt-5-2025-08-07` will be shut down on December 11, 2026 according to the deprecations page; official replacement there is `gpt-5.6-sol`. The GPT-5 model page designates GPT-5 as a "previous model" and recommends "the latest GPT-6 Astra". ([Deprecations](https://developers.openai.com/api/docs/deprecations), [Model Docs](https://developers.openai.com/api/docs/models/gpt-5))

## Sources
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide — Official GPT-5 Prompting Guide: reasoning_effort (incl. minimal), verbosity overrides, instruction adherence / idiosyncrasies, over-/under-eagerness, tool preambles, Markdown behavior, strengths/weaknesses, GPT-4.1 migration, Responses API.
- https://developers.openai.com/api/docs/models/gpt-5 — GPT-5 model docs: reasoning.effort values, context window (400k), max output (128k), knowledge cutoff, streaming/function calling/structured outputs.
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_new_params_and_tools — New parameters & tools: verbosity values and default, minimal reasoning, custom tools, Context-Free Grammar (Lark/Regex).
- https://developers.openai.com/cookbook/examples/prompt_migration_guide — Prompt migration guide: Switch models first, align reasoning_effort, eval suite.
- https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5 — Prompt guidance "Using GPT-5" (model-scoped version; the page without model parameter now describes GPT-6): Migration quickstart — start with `medium` and test `minimal`/`low`/`high` against representative tasks, set `text.verbosity` deliberately, structured outputs.
- https://developers.openai.com/api/docs/deprecations — Deprecations (announcement 2026-06-11): gpt-5-2025-08-07 shutdown December 11, 2026, replacement gpt-5.6-sol.
- https://openai.com/index/gpt-5-system-card/ — GPT-5 System Card: Unified system with router, safe completions, reduced hallucinations/sycophancy, improved instruction following (direct fetch HTTP 403 — content from search index snippet; SOURCE PARTIALLY UNAVAILABLE).

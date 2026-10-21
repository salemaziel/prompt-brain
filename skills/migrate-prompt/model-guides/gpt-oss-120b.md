---
model: gpt-oss-120b
vendor: OpenAI
family: gpt-oss
aliases: [gpt-oss, gpt-oss-20b]
last_verified: 2026-10-13
status: current
---

# gpt-oss-120b (also applies to gpt-oss-20b)

## Reasoning / Thinking
- Effort levels `low | medium | high` (both sizes). The level is set **in the system message**, not via an API parameter: "To control the reasoning you can specify in the system message the reasoning level as low, medium, or high" — recommended line `Reasoning: high`. Default: "By default, the model will do medium level reasoning."
- The chain-of-thought arrives raw in the **`analysis` channel**. It is not subject to the same safety standards as the final answer: "You should not show the chain-of-thought to your users, as they might contain harmful content."
- Multi-turn rule: "In general, you should drop any previous CoT content on subsequent sampling" — once a turn has concluded with a `final` message. Tool calling exception: Previous CoT remains in history so the model can continue reasoning.
- No `none`/`minimal`, no `xhigh`/`max`, no token budget documented.

## Prompting Style
- **Harmony format is mandatory**: "gpt-oss should not be used without using the harmony format, as it will not work correctly." Through inference providers (e.g. Ollama) or an API, the format is rendered automatically; in your own stack use the `openai-harmony` renderer or the Transformers chat template instead of manually setting tokens.
- **Roles and precedence**: `system > developer > user > assistant > tool`.
- **System message = metadata, not the conventional system prompt**: Identity line ("You are ChatGPT, a large language model trained by OpenAI."), knowledge cutoff, current date, reasoning level, valid channels (`analysis`, `commentary`, `final`), and optionally built-in tools (`browser`, `python`).
- **Developer message = the actual instructions**: "It contains the instructions that are provided to the model and optionally a list of function tools available for use." Task instructions belong under `# Instructions`, function tools under `# Tools`, output schemas under `# Response Formats`.
- **Note on chat templates**: "Note that the `Developer` role in Harmony maps to the `system` prompt in the chat template." When working via the Transformers chat template (or a provider), instructions are written into the `system` message; they belong in the `developer` message only during raw Harmony rendering.
- **Function tools** are declared in a TypeScript-like `namespace functions { … }` block (comments as descriptions); the model addresses the call via `to=functions.<name>` and can specify the argument format (e.g. `json`) via `<|constrain|>`; tool results return as a `tool` message to the assistant in the `commentary` channel.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Open weights under **Apache 2.0**.
  - 120b: 117 B total / 5.1 B active, "Most powerful open-weight model, fits into an H100 GPU" (≥ 60 GB VRAM or multi-GPU according to Transformers guide).
  - 20b: 21 B total / 3.6 B active, "Medium-sized open-weight model for low latency", approx. 16 GB VRAM with MXFP4. Both share format, channels, effort controls, and limits — the prompt contract is identical.
- Weaknesses:
  - **Text only** input and output; no image or audio input. Knowledge cutoff **June 1, 2024** — supply time-critical facts in context.
  - `# Response Formats` "will, however, only influence the model's behavior but doesn't guarantee the full adherence to the schema" — enforce schema adherence in self-hosting via constrained sampling or validation.
  - Built-in tools `browser` (search/open/find) and `python` (stateful Jupyter, 120 s timeout) exist only if your own stack implements them.
  - Benchmark and quality comparisons against API models are not asserted here (unbelegt).

## Output & Format Conventions
- Three channels: **`final`** = intended solely for the end user; **`analysis`** = CoT, never display; **`commentary`** = function tool calls (usually built-in calls as well) and occasionally preambles describing the plan before multiple tool calls.
- Stop tokens: `<|return|>` = final response complete, `<|call|>` = tool call; `<|end|>` closes individual messages. When storing in conversation history, replace the concluding `<|return|>` with `<|end|>`.
- Context window **131,072** tokens, max output **131,072** (both sizes).
- OpenAI API page: Endpoints Responses and Batch (no Chat Completions), features Streaming, Structured Outputs, Function Calling; tools Function Calling, Code Interpreter, MCP, Web Search. Single snapshot `gpt-oss-120b` or `gpt-oss-20b`.

## Migration Notes
- **MIGRATING TO gpt-oss**: The central step is role reallocation — move task instructions, persona, and rules from the previous system prompt into the Developer role (`# Instructions`); use the system message only for metadata and `Reasoning: <level>`. When using chat templates / providers, the `system` message automatically lands in the Developer role. Place tool schemas into the `# Tools` section of the developer message, and output schemas under `# Response Formats` (plus validation). Replace API effort parameters (`reasoning.effort`, thinking budgets) with the `Reasoning:` line; map `xhigh`/`max` to `high`, `none`/`minimal` to `low`. Whether manual "think step by step" scaffolding alongside the analysis channel provides any benefit is not documented (unbelegt). Image/audio inputs and very long contexts (> 131K) must be handled differently.
- **Availability**: Primarily open weights (download via Hugging Face, linked on the model page). The OpenAI API rate limit table shows **0 RPM / 0 TPM** for Build, Launch, and Grow — do not assume production availability via the OpenAI API.
- **MIGRATING FROM gpt-oss**: Remove Harmony tokens, channel parsing, and CoT-stripping logic; pull developer instructions back into the system prompt or instruction role of the target provider; translate the `Reasoning:` line into the target's effort/thinking parameter; rewrite `namespace functions` declarations into JSON Schema tools; replace `# Response Formats` with native Structured Outputs; do not carry over the identity line "You are ChatGPT …".

## Sources
- https://developers.openai.com/api/docs/models/gpt-oss-120b — "Most powerful open-weight model, fits into an H100 GPU", Apache 2.0, 117 B / 5.1 B active, 131,072 context and output, cutoff June 1, 2024, effort low/medium/high, text→text, endpoints Responses + Batch, features/tools, rate limits 0 RPM / 0 TPM, snapshot, no deprecation notice, Hugging Face download.
- https://developers.openai.com/api/docs/models/gpt-oss-20b — "Medium-sized open-weight model for low latency", 21 B / 3.6 B active, same limits, effort levels, endpoints, and rate limits as 120b.
- https://developers.openai.com/cookbook/articles/openai-harmony — Harmony requirement, role hierarchy, contents of system and developer messages, `Reasoning: high`, default medium, channels final/analysis/commentary, do not display CoT and drop in subsequent turn (tool exception), `namespace functions`, `<|constrain|>`, response formats without guarantee, built-in tools, stop tokens.
- https://developers.openai.com/cookbook/articles/gpt-oss/run-transformers — Chat template renders Harmony, "`Developer` role in Harmony maps to the `system` prompt in the chat template", VRAM requirements (20b approx. 16 GB MXFP4, 120b ≥ 60 GB / single H100).

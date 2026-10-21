---
model: deepseek-v3
vendor: DeepSeek
family: DeepSeek
aliases: [deepseek-chat, v3, deepseek-v3-base, deepseek-v3-0324, deepseek-v3-chat]
last_verified: 2026-10-13
status: legacy
successor: deepseek-v4.1-flash
---

# DeepSeek-V3

## Reasoning / Thinking
- **Type: none** (non-reasoning chat model). DeepSeek-V3 is the instruction-tuned chat model of the V3 series and was historically accessed via the model ID `deepseek-chat`. It is **not** a dedicated reasoning model like DeepSeek-R1 and does not return a separate `reasoning_content` trace.
- V3 was trained via **knowledge distillation from DeepSeek-R1**, inheriting improved reasoning capabilities, but is not itself a reasoning model like R1 ((unbelegt)) — chain-of-thought is thus implicitly trained, but not exposed as an independent thinking mode.
- **Inducing step-by-step reasoning:** Because V3 has no built-in thinking mode, step-by-step thinking must be explicitly enforced via the prompt — e.g., "Think step by step", structured/hierarchical Markdown prompts, or providing an outline (problem → solution steps → result) ((unbelegt)). Unlike R1, the **system prompt** can and should be used to steer behavior on V3.
- **Differentiation from R1 (`deepseek-reasoner`):** R1 produces a separately delivered chain-of-thought (`reasoning_content`) and should be operated without a system prompt according to its Model Card; V3 behaves like a classic chat model and follows system prompts. (Note: The API IDs `deepseek-chat` and `deepseek-reasoner` were shut down on 2026-07-24 15:59 UTC, previously routed to `deepseek-v4-flash`. Alias semantics per change log: `deepseek-chat` = V3 (from 2024-12-26), V3-0324 (from 2025-03-24), non-thinking mode of V3.1/V3.1-Terminus/V3.2-Exp/V3.2 (from 2025-08-21), V4-Flash (from 2026-04-24) — the temperature mapping below is documented only for V3-0324. V3 weights remain available via open-weights releases.)

## Prompting Style
- **Prescriptiveness:** Medium-high. V3 behaves like a conventional chat model, responding well to system prompts and precise, structured instructions ((unbelegt)). Clear, hierarchically structured Markdown prompts are recommended ((unbelegt)).
- **System prompt fidelity / instruction following:** Good — unlike R1, the system prompt is actively used to anchor behavior. The official V3-0324 template for the system prompt is: `该助手为DeepSeek Chat，由深度求索公司创造。今天是{current date}。`. Inserting the current date into the system prompt is officially supported.
- **Temperature recommendations (official, by use case):**
  - Coding / Math: **0.0**
  - Data Cleaning / Data Analysis: **1.0**
  - General Conversation: **1.3**
  - Translation: **1.3**
  - Creative Writing / Poetry: **1.5**
  - API default: **1.0**.
- **Known quirk — API temperature mapping:** The DeepSeek API scales `temperature` internally. According to the V3-0324 Model Card: for API temperatures 0–1.0, `T_model = T_api × 0.3`; for 1.0–2.0, `T_model = T_api − 0.7`. Specifically: API `temperature=1.0` corresponds to model temperature **0.3**. Running open-weights locally bypasses this mapping, so users should work directly with lower raw temperatures (the reference `generate.py` uses `--temperature 0.7`, for example).

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Strong MoE model for math, code, and multilingual tasks; effective at structured outputs and adhering to complex system instructions. V3-0324 introduced measurable gains (AIME +19.8, GPQA +9.3, MMLU-Pro +5.3) as well as "improved function calling accuracy".
- Weaknesses: Reasoning is implicit rather than exposed: benefits from R1 distillation, but provides no separately inspectable reasoning trace — transparent step-by-step reasoning must be requested in the prompt (or R1 selected instead).
- Pitfall: The API's hidden temperature mapping can easily produce unexpectedly more creative or deterministic outputs than the configured value suggests — the effective model temperature is significantly lower than the API value.

## Output & Format Conventions
- **Feature set (historical endpoint `deepseek-chat`/V3):** Function Calling, JSON Mode / JSON Output, Prefix Completions (Beta), and Fill-in-the-Middle (FIM) for code editing.
- **Function Calling:** Officially supported; tool calls documentation describes Function Calling and `strict` mode, designated as **Beta**.
- **Chat template:** V3 uses a defined chat template; system, user, and assistant roles are supported.
- **Structured outputs:** Reliably controlled via JSON Mode and explicit formatting instructions in the prompt (Markdown outlines, tables, code blocks).
- **Specialized templates (V3-0324):** Dedicated prompt templates for file upload (`{file_name}`, `{file_content}`, `{question}`) and web search.

## Migration Notes
- **MIGRATING FROM deepseek-v3**:
  - To **R1 / `deepseek-reasoner`**: Reduce system prompt reliance and shift instructions to the user role; expect separate `reasoning_content`; remove explicit "think step by step" instructions since R1 reasons natively.
  - To **other vendors (OpenAI/Anthropic/Gemini)**: The implicit temperature mapping drops away — recalibrate temperature values (a V3 "API 1.0" corresponded to model 0.3).
- **MIGRATING TO deepseek-v3**:
  - Use system prompts actively to define behavior, optionally adding DeepSeek's date pattern to the system prompt.
  - **Align temperature with the official use-case table** and — on the historical `deepseek-chat` endpoint only — account for API mapping: for deterministic code use `temperature=0.0`, for creative writing up to `1.5`; when running open weights locally, use lower raw values.
  - Use hierarchical, structured Markdown prompts and clear step-by-step breakdowns to encourage multi-step reasoning, as V3 lacks an automatic thinking mode ((unbelegt)).

## Sources
- https://api-docs.deepseek.com/quick_start/parameter_settings — Official temperature recommendations by use case (Coding 0.0, Conversation/Translation 1.3, Creative 1.5; default 1.0).
- https://huggingface.co/deepseek-ai/DeepSeek-V3 — Model Card: MoE, 671B total / 37B activated, 128K context, chat vs. base variants, knowledge distillation from the R1 series in post-training.
- https://github.com/deepseek-ai/DeepSeek-V3 — Official repo: Architecture (MLA, DeepSeekMoE), chat/instruct characteristics, reference `generate.py` with temperature example (0.7).
- https://huggingface.co/deepseek-ai/DeepSeek-V3-0324 — System prompt template, recommended temperature 0.3, API temperature mapping, improvements over V3, file/web search templates.
- https://api-docs.deepseek.com/guides/tool_calls — Function Calling, `strict` mode (Beta); replaces the offline page `guides/function_calling`.
- https://api-docs.deepseek.com/news/news260424 — Decommissioning of `deepseek-chat`/`deepseek-reasoner` on 2026-07-24 15:59 UTC, routed to `deepseek-v4-flash` until then.
- https://api-docs.deepseek.com/updates — `deepseek-chat` alias history (V3, V3-0324 with improved Function Calling, V3.1 through V3.2 non-thinking, V4-Flash).

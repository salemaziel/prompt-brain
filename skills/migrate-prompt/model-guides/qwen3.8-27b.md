---
model: qwen3.8-27b
vendor: Alibaba
family: Qwen
aliases: ["Qwen/Qwen3.8-27B", "Qwen/Qwen3.8-27B-FP8", qwen38-27b]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-27B (Open Weights)

## Reasoning / Thinking
- Type: **hybrid, enabled by default**. The Deep Thinking documentation lists `qwen3.8-27b` under "Hybrid thinking mode, thinking mode enabled by default"; according to the model card, output begins with a `<think>` block.
- Disabling per request: when self-hosting, set `"enable_thinking": False` in `extra_body["chat_template_kwargs"]`; on Qwen Cloud, pass `enable_thinking` directly (not in `chat_template_kwargs`). In the OpenAI Python SDK, Qwen-specific fields belong in `extra_body`; in the Node.js SDK, they are top-level.
- Depth control according to the model card via `reasoning_effort`: `xhigh` (default), `medium`, `low` — as a **top-level argument** of the chat completions call. The card warns: lower effort does not necessarily shorten multi-step agentic tasks, but can lead to insufficient analysis, more failures, and retries. Model Studio documentation additionally mentions `thinking_budget` for the Qwen3.8 series without listing this model individually (model-specific behavior is unbelegt).
- `preserve_thinking` is **on by default** according to the model card (reasoning from all prior turns is preserved); `False` keeps only the reasoning of the last user turn. The Deep Thinking page does not list this model among `preserve_thinking`-capable models — behavior on the hosted API is (unbelegt).
- Reasoning length is consistently documented: Model Studio max CoT **262,144**, model card recommends up to 262,144 reasoning and 131,072 response tokens. Whether Model Studio permits only streaming for this model is not documented (unbelegt).

## Prompting Style
- **No model-specific prompting page.** Officially only Alibaba's generic prompt engineering guide: Context, Objective, Style, Tone, Audience, Response; few-shot examples; numbered step lists; rare delimiters (`###`, `===`, `>>>`). Everything beyond this is (unbelegt) for this model.
- **Two separate sampling parameter sets** according to model card:
  - Thinking mode: `temperature 1.0`, `top_p 0.95`, `top_k 20`, `min_p 0.0`, `presence_penalty 0.0`, `repetition_penalty 1.0`
  - Instruct / non-thinking mode: `temperature 0.7`, `top_p 0.80`, `top_k 20`, `min_p 0.0`, `presence_penalty 1.5`, `repetition_penalty 1.0`. `presence_penalty` is adjustable between 0 and 2; higher values may trigger language mixing. Parameter support varies by framework.
- In thinking mode, control depth via `reasoning_effort` rather than "think step by step" text; plan for generous output lengths for agentic tasks (card).

## Strengths & Weaknesses (prompt-relevant)
- Dense 27B model with vision encoder, 64 layers with interleaved Gated DeltaNet and Gated Attention blocks; according to Model Studio "native vision-language" (released 2026-08-17), compared to 3.6-27B focused on coding and office scenarios across text and image inputs, as well as more reliable end-to-end task execution.
- Strengths:
  - Multimodal input: text, image, and video (the card also notes multi-hour video processing); output text only.
  - License: Apache-2.0.
  - Enabled on Model Studio: Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache. Regions: Beijing and Singapore.
- Weaknesses:
  - **No batch inference or fine-tuning** on Model Studio.
  - Static YaRN may degrade performance on short texts — enable only when long context is genuinely required.
  - Tool call format and parser flags are not documented in the card (unbelegt).
  - Knowledge cutoff and language scope are not published (unbelegt).

## Output & Format Conventions
- Model Studio: context window 1,000,000; max input 991,808 or 983,616 in thinking mode; max output 131,072; max CoT 262,144. Documentation cautions that usable length may vary depending on parameter combinations.
- Self-hosting (model card): native context **262,144**, with YaRN up to 1,000,000 (`factor` matched to typical length, e.g., 2.0 for ~524,288). Serving via SGLang, vLLM, TokenSpeed; long context requires override flags (vLLM `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` + `--max-model-len` + `--hf-overrides`, SGLang `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` + `--context-length` + `--json-model-override-args`). FP8 variant: `Qwen/Qwen3.8-27B-FP8`.
- Structured Output on Model Studio: the "Qwen3.8 open-source series" is listed under `json_object` (the word "JSON" must appear in the prompt), **not** under `json_schema` — strict schema enforcement is not verified for this model.
- Prefix Completion: model page marks it as supported, but the Partial Mode page does not list the Qwen3.8 open-source series; interaction with thinking is (unbelegt) — for prefill routes, set `enable_thinking: false` as a precaution.

## Migration Notes
- **MIGRATING TO qwen3.8-27b**:
  - Thinking runs unless explicitly disabled — a prompt ported from a non-thinking model will unexpectedly reason; recalculate `max_tokens`, latency, and costs, or set `enable_thinking: false` (when self-hosting, in `chat_template_kwargs`; on Qwen Cloud, directly).
  - **Couple sampling parameters to the mode**: Thinking mode uses 1.0 / 0.95 / 20; Instruct mode uses 0.7 / 0.80 / 20 with `presence_penalty 1.5` — do not retain `temperature 0` from source prompts.
  - Drop manual CoT scaffolding and set `reasoning_effort`.
  - When migrating from a 1M context model to a self-hosted instance: without YaRN, context is capped at 262,144 tokens.
  - Strict `json_schema` mode is not verified — describe the schema in prompt prose and include "JSON" in the text (`json_object`).
- **MIGRATING FROM qwen3.8-27b**:
  - Remove `enable_thinking`, `reasoning_effort`, `preserve_thinking`, and `chat_template_kwargs`; if the target model lacks built-in reasoning, reinsert explicit reasoning steps into the prompt; video input is not supported by many target models.
- As a dense 27B model, it is not the flagship of the series: for maximum capability, the hosted **qwen3.8-max** or open **qwen3.8-2.4t-a95b** (thinking only, text only) serves as counterpart — this tier distinction is derived from model cards, not an official vendor ranking (unbelegt).

## Sources
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b — Model page (as of Oct 11, 2026): ID `qwen3.8-27b`, input image/text/video → text, 1M context, max input 991,808 / 983,616 (thinking), max output 131,072, max CoT 262,144, regions Beijing/Singapore, supported features (Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache) and unsupported features (Batch, Fine-Tuning), note on parameter-dependent context lengths.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — `qwen3.8-27b` listed as hybrid with thinking enabled by default; parameter placement `extra_body` (Python) vs. top-level (Node.js); `thinking_budget` for Qwen3.8 series; `preserve_thinking` list excludes this model.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Entry dated 2026-08-17: 27B native vision-language dense, coding/office focus compared to 3.6-27B.
- https://huggingface.co/Qwen/Qwen3.8-27B — Official model card: architecture, image/video input, thinking default and disabling via `chat_template_kwargs` or directly on Qwen Cloud, `reasoning_effort` xhigh/medium/low (top-level) with effort warning, `preserve_thinking`, both sampling parameter sets, output lengths, native context 262,144 / YaRN up to 1M with flags, YaRN caution, FP8 repo, Apache-2.0.
- https://huggingface.co/Qwen/Qwen3.8-27B-FP8 — Official FP8 quantization of Qwen/Qwen3.8-27B (Apache-2.0).
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — "Qwen3.8 open-source series" only under `json_object` (keyword "JSON" mandatory), not under `json_schema`.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Prefix continuation via last assistant message with `partial: true`; Qwen3.8 open-source series not listed.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — Generic, non-model-specific prompt framework, few-shot, step lists, delimiters.

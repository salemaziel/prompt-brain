---
model: qwen3.8-2.4t-a95b
vendor: Alibaba
family: Qwen
aliases: ["Qwen/Qwen3.8-2.4T-A95B", "Qwen/Qwen3.8-2.4T-A95B-FP8"]
last_verified: 2026-10-13
status: current
---

# Qwen3.8-2.4T-A95B (Open Weights)

## Reasoning / Thinking
- Type: **thinking only, cannot be disabled**. The Deep Thinking documentation lists `qwen3.8-2.4t-a95b` as the only Qwen3.8 open-source model under "Supports thinking mode only"; the model card states that thinking is required for all interactions, every response begins with a `<think>` block, and `enable_thinking` "should not be turned off".
- Depth control according to the model card via `reasoning_effort` with `xhigh` (default, complex tasks), `medium`, and `low` (speed/cost) — in example code as a **top-level argument** of the chat completions call, not in `chat_template_kwargs`. Model Studio documentation, however, mentions `thinking_budget` for the "Qwen3.8 … series" without listing this specific model individually; whether `thinking_budget` applies here is not model-specifically verified (unbelegt).
- `preserve_thinking` is **on by default** according to the model card (previous reasoning remains in history); when self-hosting, pass in `extra_body["chat_template_kwargs"]`, on Qwen Cloud directly in `extra_body`. The Deep Thinking page does **not** list this model under `preserve_thinking`-capable models — for the hosted API, this behavior is therefore (unbelegt).
- **Documented discrepancy regarding reasoning length:** Model Studio specifies a max Chain-of-Thought of **131,072** tokens, whereas the model card recommends (where the framework permits separate limits) **262,144** reasoning tokens plus 131,072 for the final response. Do not adopt a single figure blindly — set the appropriate ceiling depending on the runtime environment (Model Studio vs. self-hosting).
- Whether Qwen3.8 open-source models support only streaming on Model Studio is not stated in documentation (the streaming-only notice only mentions older open-source versions such as qwen3.5-27b) — (unbelegt).

## Prompting Style
- **No model-specific prompting page.** The only official source is Alibaba's generic, explicitly non-model-bound prompt engineering guide: Context, Objective, Style, Tone, Audience, Response; few-shot examples; numbered step lists for complex tasks; rare delimiters (`###`, `===`, `>>>`). Everything else is (unbelegt) for this model.
- Because the model always thinks, specify depth via `reasoning_effort` rather than prompt text; "think step by step" scaffolding merely duplicates built-in reasoning.
- Sampling according to model card: `temperature 1.0`, `top_p 0.95`, `top_k 20`, `min_p 0.0`, `presence_penalty 0.0`, `repetition_penalty 1.0`. `presence_penalty` may be increased to 0–2 against repetition, though higher values can trigger language mixing and slight performance degradation. Which parameters take effect depends on the inference framework.
- For agentic tasks, the model card explicitly recommends generous output lengths.

## Strengths & Weaknesses (prompt-relevant)
- Architecture: Sparse MoE with hybrid attention (Gated DeltaNet + Gated Attention), 2.4T parameters, ~95B active, 512 experts (10 routed + 1 shared per token). According to Model Studio, the open-source version of Qwen's current flagship (released 2026-08-12).
- Strengths:
  - Vendor-reported benchmarks (not independently verified; the card itself notes harness dependency, partially in-house): GPQA Diamond 92.6, PaperBench 93.0, OSWorld 86.1, CodeArena global #4.
  - Enabled on Model Studio: Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache. Regions: Beijing and Singapore.
- Weaknesses:
  - **Text-only** (the card excludes multimodal inputs).
  - **No non-thinking path** — every request generates reasoning output and incurs latency.
  - **No batch inference or fine-tuning** on Model Studio.
  - License tag on Hugging Face is "qwen3.8-max" (not an Apache license).
  - Knowledge cutoff, language scope, and hardware requirements are not published (unbelegt).

## Output & Format Conventions
- Model Studio: context window 1,000,000; max input 991,808 or 983,616 in thinking mode; max output 131,072; max CoT 131,072. Input/output text only.
- Self-hosting (model card): native context **262,144**, expandable to 1,010,000 tokens; the card documents no specific YaRN flags for this (unbelegt). Serving via SGLang, vLLM, TokenSpeed; sample commands (`vllm serve "Qwen/Qwen3.8-2.4T-A95B"`, SGLang `--model-path …`) list neither reasoning nor tool call parsers (unbelegt). Weights in BF16; `Qwen/Qwen3.8-2.4T-A95B-FP8` is the official FP8 variant (per-block FP8, block size 128, virtually identical performance according to card).
- Structured Output on Model Studio: the "Qwen3.8 open-source series" is listed under `json_object` (the word "JSON" must be present in prompt), **not** under `json_schema` — strict schema enforcement is not verified for this model.
- Prefix Completion is marked as supported on the model page, but the Partial Mode page does not list the Qwen3.8 open-source series; how prefill interacts with mandatory thinking is (unbelegt).

## Migration Notes
- **MIGRATING TO qwen3.8-2.4t-a95b**:
  - Major breaking change: **thinking cannot be disabled.** `enable_thinking: false`, non-thinking prefill workflows, and latency assumptions of a non-thinking source model will break; recalculate `max_tokens` for reasoning plus response (131,072 vs. 262,144 CoT depending on runtime, see discrepancy above).
  - Remove explicit CoT instructions and control depth via `reasoning_effort` (not `thinking_budget`).
  - Remove image/video inputs — the model is text-only.
  - Replace `temperature 0` / greedy settings with card values: 1.0 / 0.95 / 20.
  - If `json_schema` strict mode is required, there is no documented path here — describe the schema in the prompt and include "JSON" in prompt text (`json_object`).
- **MIGRATING FROM qwen3.8-2.4t-a95b**:
  - Remove `reasoning_effort`, `chat_template_kwargs`, and `preserve_thinking` configuration; if the target model lacks native reasoning, reintroduce reasoning/verification steps into the prompt text. Redesign chunking when switching to smaller context windows.
- Hosted counterpart is **qwen3.8-max**: according to the model card, this is the official hosted version based on this model with vision input, non-thinking support, 1M default context, and built-in tools. Those needing these features should migrate to `qwen3.8-max` instead of open weights; the two are **not** interchangeable.

## Sources
- https://www.alibabacloud.com/help/en/model-studio/qwen3-8-2-4t-a95b — Model page (as of Oct 11, 2026): ID `qwen3.8-2.4t-a95b`, text in/text out, 1M context, max input 991,808 / 983,616 (thinking), max output 131,072, max CoT 131,072, regions Beijing/Singapore, supported features (Function Calling, Structured Outputs, Web Search, Prefix Completion, Context Cache) and unsupported features (Batch, Fine-Tuning); no prompting guidance.
- https://www.alibabacloud.com/help/en/model-studio/deep-thinking — `qwen3.8-2.4t-a95b` under "Supports thinking mode only"; `thinking_budget` for Qwen3.8 series (not model-specifically detailed); `preserve_thinking` list excludes this model; streaming-only notice only references older open-source versions.
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models — Entry dated 2026-08-12: open-source version of current flagship, Sparse MoE 2.4T / ~95B active, hybrid attention, benchmarks.
- https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B — Official model card: architecture, text-only, thinking mandatory and cannot be disabled, `reasoning_effort` xhigh/medium/low (top-level), `preserve_thinking` on by default, sampling 1.0/0.95/20/0.0, 262,144 reasoning + 131,072 response, native context 262,144 (up to 1,010,000), SGLang/vLLM/TokenSpeed, relationship to Qwen3.8-Max, license tag, benchmark disclaimers.
- https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B-FP8 — Official FP8 variant (per-block FP8, block size 128, virtually identical performance, text-only, always thinking).
- https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output — "Qwen3.8 open-source series" only under `json_object` (keyword "JSON" mandatory), not under `json_schema`.
- https://www.alibabacloud.com/help/en/model-studio/partial-mode — Prefix continuation via last assistant message with `partial: true`; Qwen3.8 open-source series not listed.
- https://www.alibabacloud.com/help/en/model-studio/prompt-engineering-guide — Generic, non-model-specific prompt framework (Context, Objective, Style, Tone, Audience, Response), few-shot, step lists, delimiters.

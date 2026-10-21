---
model: llama-4-scout
vendor: Meta
family: Llama
aliases: [llama4-scout, llama-4-scout-17b-16e, llama-4-scout-17b-16e-instruct, meta-llama-4-scout]
last_verified: 2026-10-13
status: current
---

# Llama 4 Scout

## Reasoning / Thinking
- **Type: none (no dedicated reasoning/thinking model).** Official model cards and prompt formats list no extended/adaptive thinking mode and no thinking tokens; Llama 4 Scout is a natively multimodal, instruction-tuned standard model without a separate thinking mode.
- **Architecture: Mixture-of-Experts (MoE).** 17 billion active parameters, 109 billion total parameters, 16 experts. Only 17B parameters are active per token. Utilizes an `iRoPE` architecture and scaled softmax (inference-time temperature scaling) for length generalization.
- **Very long context:** Up to 10 million tokens context according to model card and prompt format page; according to Meta blog, Scout is "both pre-trained and post-trained with a 256K context length". This reach is well suited for multi-document analysis, very large codebases, and long conversation histories.
- **Triggering step-by-step thinking:** Since no native thinking mode exists, chain-of-thought is achieved via traditional prompting — explicitly instructing in the system or user prompt (e.g. "Think through the problem step by step before answering"). According to the model card (Instruct table), Scout achieves 74.3 MMLU Pro and 57.2 GPQA Diamond, among others.

## Prompting Style
- **Prescriptiveness: Medium to high via the system prompt.** Meta explicitly recommends a well-crafted system prompt to reduce false refusals and a preachy tone.
- **Official prompt format / chat template** with special tokens:
  - `<|begin_of_text|>` — Marks start of prompt.
  - `<|header_start|>{role}<|header_end|>` — Encloses the role (`system`, `user`, `assistant`, `ipython` for tool responses).
  - `<|eot|>` — End-of-turn, signals end of a message/response.
  - `<|end_of_text|>` — Concludes generation ("Model will cease to generate more tokens"); according to documentation, produced only by base models (pretrained) — instruct turns end with `<|eot|>`.
  - Example structure: `<|begin_of_text|><|header_start|>system<|header_end|>{system_prompt}<|eot|><|header_start|>user<|header_end|>{prompt}<|eot|><|header_start|>assistant<|header_end|>`
- **Official system prompt template (excerpt):** "You are an expert conversationalist who responds to the best of your ability…" The template advises avoiding phrases asserting moral superiority (e.g. "it's important to", "it's crucial to"), avoiding preachiness, and not refusing prompts on political/societal topics.
- **Instruction following:** Instruction-tuned via lightweight SFT → online RL → lightweight DPO. Good steerability of tone and format via the system prompt.
- **Known quirks:** Without a good system prompt, the model tends toward standardized/preachy language. Image understanding is validated only for English, although the model is multilingual.
- **Differences from Maverick:** Both share 17B active parameters and the same prompt format. Scout = 16 experts / 109B total / up to 10M context / runs on a single GPU (INT4 quantized on 1× H100); Maverick = 128 experts / 400B total / 1M context / higher reasoning performance, requires multiple GPUs. The Llama 4 prompt format page documents a unified format for Llama 4 models without distinguishing Scout and Maverick; Maverick tends to deliver stronger reasoning performance, while Scout excels with longer context and resource efficiency.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Extremely long context (up to 10M tokens, Instruct) — prompts can accommodate massive inputs.
  - Native multimodality (early fusion): Text + up to 5 images tested in input. "Best-in-class" at image grounding / visual localization.
  - Strongly multilingual (pre-training on 200 languages, >100 of which with >1 billion tokens each).
  - Efficient: runs on a single server GPU.
- Weaknesses:
  - Output is **text-only** (no image/audio output).
  - Vision understanding officially validated for **English** only.
  - No native reasoning mode — complex multi-step tasks require explicit CoT prompting; trails Maverick on pure reasoning benchmarks.
  - Knowledge cutoff up to **August 2024**.
  - Without system prompt tuning, risk of preachy tone / unnecessary refusals.

## Output & Format Conventions
- **Output modality:** Exclusively text. Responses end with `<|eot|>`.
- **Function/Tool Calling:** Two official formats: Python/list format (`[get_weather(city="San Francisco")]`) and JSON format. Tool results are returned via the role `ipython`.
- **Image input conventions:** Images are split into 336×336 pixel tiles; large images use tile separator tokens (`<|tile_x_separator|>`, `<|tile_y_separator|>`), while small images under 336×336 require no separators.
- **Structured outputs** (JSON, Markdown, tables) are controlled via system/user prompt (no documented schema mode; reliability unbelegt); specific recommended sampling parameters (e.g. temperature) are not prescribed by Meta in the model card (unbelegt for concrete temperature values). Code examples use `bfloat16` and `attn_implementation="flex_attention"`.

## Migration Notes
- **MIGRATING FROM llama-4-scout**:
  - To Maverick: Same prompt format and same active parameter count — no template modification needed; however, note the context limit drop from 10M to 1M and plan for increased hardware requirements. Reasoning-heavy prompts benefit.
  - To a dedicated reasoning model: Remove or adjust explicit CoT instructions in the prompt; prompt format/special tokens differ completely.
  - For >1M-token workflows, verify the target model's context window; otherwise implement chunking/retrieval.
- **MIGRATING TO llama-4-scout**:
  - From Llama 3: Convert prompt format to Llama 4 tokens (`<|header_start|>`/`<|header_end|>`/`<|eot|>`); context increases up to 10M (Llama 3 context length here unbelegt).
  - Shape system prompt according to Meta's template to prevent preachy tone / false refusals.
  - Multimodal inputs (up to 5 images) are supported; formulate image prompts in English whenever possible.
  - For multi-step reasoning, add explicit step-by-step instructions (no automatic thinking).
  - Account for August 2024 knowledge cutoff; feed current facts via tool/RAG context.

## Sources
- https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4 — Official prompt format, special tokens, roles including `ipython`, system prompt template, function calling formats, image tiling/separator tokens, knowledge cutoff August 2024, no reasoning mode.
- https://ai.meta.com/blog/llama-4-multimodal-intelligence/ — MoE architecture (17B active, 16 experts, 109B total for Scout), 10M-token context, pre- and post-training with 256K context length, iRoPE, early-fusion multimodality, multilingual support, image count, image grounding, training methodology, single-GPU capability.
- https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct — Official model card: no reasoning mode, system prompt recommendation, 10M context, MoE figures, supported languages, up to 5 images, knowledge cutoff August 2024, benchmark scores (Instruct: 74.3 MMLU Pro / 57.2 GPQA Diamond), code notes (`flex_attention`, `bfloat16`).

---
model: gemma-3
vendor: Google
family: Gemma
aliases: [gemma3, gemma-3-27b, gemma-3-27b-it, gemma-3-12b-it, gemma-3-4b-it, gemma-3-1b-it, gemma3-27b, gemma_3]
last_verified: 2026-10-13
status: legacy
successor: gemma-4
---

# Gemma 3

## Reasoning / Thinking
- Type: **none** (no dedicated "thinking" or reasoning mode). Gemma 3 is an open-weight model (freely available weights, pre-trained and instruction-tuned) and lacks a built-in chain-of-thought / thinking toggle like newer "thinking" models.
- Step-by-step reasoning must be induced classically via prompting: explicit instructions like "Think step by step" / "Explain your reasoning before the final answer" or few-shot examples. The official prompt formatting documentation explicitly mentions **neither** Chain-of-Thought **nor** zero-/few-shot techniques ((unbelegt), whether a specific CoT format is recommended).
- Available sizes: 270M (since 2025-08-14), 1B, 4B, 12B, 27B. The reference variant here is **gemma-3-27b-it** (largest instruction-tuned model); the prompt/turn format is identical across all sizes.

## Prompting Style
- **Moderately prescriptive, but format-bound.** The instruction-tuned model is fine-tuned on a fixed turn format; the control tokens are "reserved in and specific to our tokenizer" and must be used precisely.
- Official chat/prompt format (turn tokens):
  - `<start_of_turn>` initiates a turn, `<end_of_turn>` ends it.
  - Role marker immediately follows `<start_of_turn>`: `user` or `model`.
  - Structure:
    ```
    <start_of_turn>user
    [Content]<end_of_turn>
    <start_of_turn>model
    ```
  - The final turn ends with `<start_of_turn>model` **without** a closing tag, allowing the model to generate.
- **System prompt handling:** There is **no** dedicated `system` role / system turn — "the `system` role or a system turn is not supported." System/persona instructions are instead placed **at the beginning of the first user message** (official example: "Only reply like a pirate. What is the answer to life the universe and everything?"). Some Hugging Face chat templates technically accept a `system` field, but prepend it internally to the first user message; Google documentation remains authoritative.
- **Instruction following:** Strong enough that system-level instructions directly within the user prompt are reliably interpreted — a separate system role is therefore not necessary.
- **Known quirk (BOS token):** The tokenizer pipeline typically prepends a `<bos>` token at the beginning of the sequence; however, the official formatting page does **not** show `<bos>` explicitly in its examples. When performing raw inference (without `apply_chat_template`), ensure that the BOS token is not duplicated ((unbelegt) in detail).

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Multimodal: Processes text **and** images as input, produces text as output (images are normalized to 896×896 and encoded into 256 tokens each) — applies to 4B/12B/27B.
  - Multilingual: Support for over 140 languages → prompts do not strictly need to be in English.
  - Long context: 128K tokens (4B/12B/27B), 32K tokens for 1B and 270M; output shares this limit with input.
  - Strong performance on multilingual, STEM, and multimodal benchmarks.
- Weaknesses:
  - May struggle with subtle nuances, sarcasm, or figurative language → make these explicit in the prompt.
  - Can generate factually incorrect or outdated statements (hallucinations) → verify critical facts externally / require source grounding in the prompt.
  - No built-in reasoning → provide CoT/few-shot examples manually for complex tasks.
  - Training data cutoff according to Model Card is **August 2024** → provide time-sensitive facts in the prompt.

## Output & Format Conventions
- Pure text output; the model closes its turn with `<end_of_turn>`.
- Structured output (JSON, tables, Markdown) is reliably achievable via explicit formatting instructions in the user prompt (general instruction following; specific JSON Schema / Structured Output feature not documented in primary sources — (unbelegt)).
- Sampling / generation parameters: Numerical values for sampling are not specified in official documentation ((unbelegt)) — the Gemma 3 Model Card contains no recommendations for temperature, top_k, or top_p.

## Migration Notes
- **Lifecycle:** Google lists Gemma 3 on the Gemma overview under "Previous Gemma models", and Gemma 3 prompt documentation is marked as "Legacy" in navigation; Gemma 4 is the current generation. The release page announces no deprecation or end-of-support date for Gemma 3 — Gemma 3 remains usable as a target, but is no longer the current generation.
- **MIGRATING FROM gemma-3**:
  - To models with a dedicated `system` field (e.g. OpenAI/Anthropic): Extract system instructions embedded in the first user message back into a true system prompt field.
  - Remove Gemma-specific control tokens (`<start_of_turn>`, `<end_of_turn>`) — according to Google they are "reserved in and specific to our tokenizer"; other models use their own templates.
  - Do not carry over sampling parameters: Gemma values are Gemma-specific; whether and which sampling parameters the target accepts is determined by the target guide.
- **MIGRATING TO gemma-3**:
  - Disband separate `system` messages and move them to the **beginning of the first user message** (no system role available).
  - Switch to the exact turn token format or use `apply_chat_template()` from the Transformers library instead of inserting tokens manually (avoids duplicate `<bos>`, among other issues).
  - Do not expect a thinking mode — add explicit CoT / few-shot prompting for reasoning tasks.
  - Sampling: Official numerical values are unpublished ((unbelegt)) — do not enforce arbitrary values.
  - Image inputs are supported (4B/12B/27B), but 1B is text-only; for 270M, the Model Card lists no image input ((unbelegt)).

## Sources
- https://ai.google.dev/gemma/docs/core/prompt-structure — Official turn token structure (`<start_of_turn>`/`<end_of_turn>`, `user`/`model`), lack of `system` role, embedding system instructions into the first user message, tokenizer-specific control tokens.
- https://huggingface.co/google/gemma-3-27b-it — Model Card: Sizes 1B/4B/12B/27B, 128K context, multimodal (896×896 / 256 tokens), 140+ languages, no documented thinking mode, weaknesses (sarcasm/figurative language, factual errors), bfloat16/`device_map="auto"`.
- https://ai.google.dev/gemma/docs/core/model_card_3 — Official Model Card: Context 128K (4B/12B/27B) or 32K (1B/270M), output within the same limit, sizes including 270M, 896×896 images at 256 tokens, 140+ languages, training data cutoff August 2024, no numerical sampling values.
- https://ai.google.dev/gemma/docs/releases — Release dates (Gemma 3 1B/4B/12B/27B on 2025-03-10, 270M on 2025-08-14, Gemma 4 starting 2026-03-31); no deprecation or end-of-support announcement for Gemma 3.
- https://ai.google.dev/gemma/docs/core — Gemma overview (Gemma 4): Gemma 3 under "Previous Gemma models", navigation "Legacy Prompt and system instructions [Gemma 1, 2, and 3]".

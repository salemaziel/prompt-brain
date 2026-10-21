---
model: llama-4-maverick
vendor: Meta
family: Llama
aliases: [llama4-maverick, llama-4-maverick-17b, llama-4-maverick-17b-128e-instruct, llama4:maverick]
last_verified: 2026-10-13
status: current
---

# Llama 4 Maverick

## Reasoning / Thinking
- Type: **none** (no dedicated reasoning/thinking model). Official documentation and the model card describe Maverick as an instruction-tuned, natively multimodal model without extended thinking or a dedicated chain-of-thought mode. No thinking tokens or separate reasoning channel are documented.
- MoE architecture: **Mixture-of-Experts** with **17 billion active parameters**, **128 experts**, and **400 billion total parameters**. Only ~17B active parameters are computed per token, reducing inference/training latency. Context window: **1 million tokens**.
- Triggering step-by-step thinking: Since no native reasoning mode exists, chain-of-thought must be prompted traditionally (e.g. "Think step by step", requesting explicit intermediate steps/justifications). Exact best-practice phrasing is (unbelegt) — primary sources do not document a specific CoT triggering formulation.

## Prompting Style
- Prescriptiveness: Medium. Maverick is designed to be **steerable** — answers can be "easily adapted to specific developer goals" according to the model card. An effective system prompt reduces false refusals and "templated language".
- Official prompt format / chat template (header tokens):
  - `<|begin_of_text|>` — Start of prompt.
  - `<|header_start|>` … `<|header_end|>` — Enclose the role of a message.
  - `<|eot|>` — End of turn; signals that the model has concluded the turn.
  - `<|end_of_text|>` — Concludes generation ("Model will cease to generate more tokens"); according to documentation, produced only by base models (pretrained) — instruct turns end with `<|eot|>`.
  - Supported roles: `system`, `user`, `assistant`, `tool` (designated as `ipython` in the prompt).
  - Example turn structure (verbatim from docs):
    ```
    <|begin_of_text|><|header_start|>system<|header_end|>
    [system content]<|eot|><|header_start|>user<|header_end|>
    [user content]<|eot|><|header_start|>assistant<|header_end|>
    ```
- System prompt style: The recommended system prompt begins verbatim with "You are an expert conversationalist who responds to the best of your ability…" and concludes with "You are Llama 4. Your knowledge cutoff date is August 2024. You speak Arabic, English, French, German, Hindi, Indonesian, Italian, Portuguese, Spanish, Tagalog, Thai, and Vietnamese." Recommendation: customize this base prompt for specific use cases.
- Instruction following / traits: The system prompt explicitly advises against using "templated language" or phrases with moralistic authority ("it's important to", "it's crucial to"); the model should not refuse political prompts. This guidance demonstrably serves to reduce false refusals.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Natively multimodal (text + image as input, text-only output); according to Meta "best-in-class multimodal model".
  - Strong benchmark scores according to model card: MMLU Pro 80.5 (Instruct); MATH 61.2 and MBPP (Code) 77.6 (Pretrained table) — good for coding, math, and knowledge tasks.
  - Efficient MoE design (only 17B active) → lower latency with large total capacity; very large 1-million-token context window.
- Weaknesses:
  - Multilingual performance with gaps (e.g. TydiQA 31.7 vs. Llama 3.1 405B 34.3).
  - Vision understanding in English only; tested with only up to **5 images** per input — beyond that, risk mitigation is developer responsibility.
  - No native reasoning mode → complex multi-step logic must be structured via prompt.

## Output & Format Conventions
- Text-only output (no image output). Input can combine text + images.
- Image input: up to 5 images; dynamic tiling into 336×336 pixel tiles with separator tokens `<|tile_x_separator|>` and `<|tile_y_separator|>`.
- Tool/function calling formats (two variants):
  - Python style: `[get_weather(city="San Francisco"), get_weather(city="Seattle")]`
  - JSON style: `[{"name": "get_weather", "parameters": {"city": "San Francisco"}}]`
  - Tool outputs are returned via the `ipython` role.
  - Function definitions belong in the **system message**.
  - Strict rule (verbatim): **"NEVER combine text and function calls in the same response"** — either prose text or a function call, never both in a single response.
- Multilingual support (text): Arabic, English, French, German, Hindi, Indonesian, Italian, Portuguese, Spanish, Tagalog, Thai, Vietnamese.
- Knowledge cutoff: August 2024.

## Migration Notes
- **MIGRATING FROM llama-4-maverick**:
  - When switching to a reasoning model, manually enforced CoT instructions may no longer be needed; prompts may need to be streamlined.
  - Header token format (`<|header_start|>`/`<|eot|>`) is Llama-4-specific and must be converted to the target family's chat template.
  - The strict rule "no mixed text + function calls" might not apply to the target model — check tool handling logic.
- **MIGRATING TO llama-4-maverick**:
  - Convert from Llama 3 format to Llama 4 format (`<|header_start|>`/`<|header_end|>`/`<|eot|>`) — token names differ (Llama 3 token names are not verified in primary sources (unbelegt)).
  - Adopt/adapt the recommended "expert conversationalist" system prompt to minimize false refusals and boilerplate phrasing.
  - Move function definitions into the system message; ensure tool calls are never mixed with prose in the same response.
  - Structure multimodal inputs via `apply_chat_template` or `AutoProcessor`; ensure max 5 images and English-only vision understanding.

## Sources
- https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4 — Official prompt format: header tokens, roles including `ipython`, turn structure, function calling formats and rule "NEVER combine text and function calls", recommended system prompt, tiling separator tokens, languages, no reasoning mode.
- https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct — Official Meta model card: MoE architecture (17B active / 400B total / 128 experts), 1-million-token context, knowledge cutoff August 2024, steerability/system prompt, benchmark strengths and multilingual weaknesses, multimodal image input (up to 5 images), `apply_chat_template`/`AutoProcessor`.
- https://ai.meta.com/blog/llama-4-multimodal-intelligence/ — Meta announcement "The Llama 4 herd": positioning Maverick, MoE size specs, model family (Scout/Maverick).

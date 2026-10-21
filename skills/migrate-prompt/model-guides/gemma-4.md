---
model: gemma-4
vendor: Google
family: Gemma
aliases: [gemma, gemma4, gemma-4-12b, gemma-4-12b-it, gemma-4-31b, gemma-4-31b-it, gemma-4-26b-a4b, gemma-4-26b-a4b-it, gemma-4-e4b, gemma-4-e4b-it, gemma-4-e2b, gemma-4-e2b-it, gemma_4]
last_verified: 2026-10-13
status: current
---

# Gemma 4

## Reasoning / Thinking
- Type: **toggleable (on/off), in open-weights via the prompt rather than an API parameter** (exception: hosted Gemini API, see below). Google describes the family as "highly capable reasoners, with configurable thinking modes"; the Model Card cites a "Built-in reasoning mode that lets the model think step-by-step before answering".
- Toggled via the control token `<|think|>` **in the system turn**: `<|turn>system\n<|think|><turn|>` = thinking on, omitting the token = off. Equivalent in Transformers: `processor.apply_chat_template(…, enable_thinking=True)`.
- Thoughts are returned in a dedicated channel (`<|channel>thought … <channel|>`). To read thoughts, `skip_special_tokens=False` is strictly required according to documentation; `parse_response` splits the output into `thinking` and `answer`.
- On 12B, 26B A4B, and 31B, the chat template includes an **empty thinking token** when OFF (`<|turn>model\n<|channel>thought\n<channel|>`) — it stabilizes output by suppressing unwanted thought channels. Handcrafted prompt strings omitting this detail diverge from the trained format.
- **Multi-turn rule:** Thoughts from the previous turn must be stripped from history before the next request. Exception: within a model turn containing function calls, thoughts between calls must **not** be removed. Disabling thinking mid-conversation = remove `<|think|>` during stripping.
- No depth control (budget, effort levels): according to Gemini API documentation, Gemma 4 supports "strictly" only on/off. In the hosted Gemini API, this is switched via `thinking_level` — `"high"` = on, `"minimal"` = off; no other levels are listed in documentation.

## Prompting Style
- **Most important change from Gemma 3: genuine system role.** "Gemma 4 introduces built-in support for the system role." System instructions belong in a dedicated `<|turn>system` turn again, rather than at the beginning of the first user message.
- The turn format is also new: delimiters `<|turn>` / `<turn|>`, roles `system` / `user` / `model`. The Gemma 3 tokens `<start_of_turn>` / `<end_of_turn>` do not apply here. In practice, almost always use `apply_chat_template()` instead of inserting tokens manually.
- Multimodal: Placeholders `<|image|>` and `<|audio|>` mark insertion points, embeddings sit between `<|image>`/`<image|>` and `<|audio>`/`<audio|>`. The Model Card recommends placing **image content before text**.
- Tools are declared, not explained in prose: `<|tool>declaration:function_name{description:…,parameters:{…}}<tool|>`; the model responds with `<|tool_call>call:…<tool_call|>`, and the result is returned as `<|tool_response>response:…<tool_response|>`. For function calling, documentation explicitly recommends active thinking ("By utilizing an internal reasoning process, the model significantly enhances its function-calling accuracy").
- Manual CoT scaffolding ("Think step by step", few-shot reasoning examples) has become obsolete — choreography carried over from Gemma 3 can be removed and replaced by the thinking toggle.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Positioned by DeepMind as "Our most intelligent open models, built from Gemini 3 research and technology to maximize intelligence-per-parameter". Apache 2.0 license, weights available via Google AI Studio, Hugging Face, Kaggle, Ollama, Vertex AI, Cloud Run, as well as vLLM, llama.cpp, MLX, LM Studio, and Unsloth.
- Five variants with distinctly different profiles: E2B (2.3B effective) and E4B (4.5B effective) for edge/mobile/browser; 12B Unified (11.95B, encoder-free, multimodal); 26B A4B as MoE (25.2B total / 3.8B active, "designed for high-throughput, advanced reasoning"); 31B Dense (30.7B). The prompt contract is identical across all sizes; only the empty thinking token differentiates the larger models from E2B/E4B.
- Benchmarks according to DeepMind (31B IT Thinking): Arena AI Text 1452 Elo, MMLU Multilingual 85.2%, MMMU Pro 76.9%, AIME 2026 89.2%, LiveCodeBench 80.0%, GPQA Diamond 84.3%, τ2-bench 86.4%. Google positions 31B as #3 and 26B as #6 among open models on the Arena AI Text leaderboard.
- Languages: "out-of-the-box support for 35+ languages, pre-trained on 140+ languages" — prompts do not have to be English, though beyond the 35 supported languages quality is not guaranteed.
- Weaknesses: Can generate factually incorrect or outdated statements according to Model Card; "might struggle to grasp subtle nuances, sarcasm, or figurative language" → make these explicit in the prompt rather than assuming them implicitly. And according to function calling documentation: "A Gemma model cannot execute code on its own" — the application must validate and execute tool calls.
- Training data cutoff according to Model Card is **January 2025** — provide context for time-sensitive facts rather than relying on model knowledge.

## Output & Format Conventions
- Context window: 128K for E2B/E4B, 256K for 12B Unified, 26B A4B, and 31B. Maximum output length: unpublished ((unbelegt)).
- Input text + image across all variants (variable resolution and aspect ratio), audio native on E2B, E4B, and 12B; model overview additionally lists video. Output is text only.
- Structured Output: Google lists "structured JSON output" as a built-in capability. Server-side schema enforcement does not exist for open weights — format adherence comes from the prompt or the serving stack ((unbelegt), whether an official schema mode is documented).
- Recommended sampling configuration according to Model Card, explicitly "across all use cases": `temperature=1.0`, `top_p=0.95`, `top_k=64`.
- **IDs are variant-specific** — an artifact with the bare ID `gemma-4` does not exist; `gemma-4` here is only the family entry. Official repos: `google/gemma-4-E2B-it`, `google/gemma-4-E4B-it`, `google/gemma-4-12B-it`, `google/gemma-4-26B-A4B-it`, `google/gemma-4-31B-it`.
- Hosted Gemini API (free tier only according to pricing page; paid tier "Not available"): `gemma-4-31b-it`, `gemma-4-26b-a4b-it`. There, system instructions use the `system_instruction` / `systemInstruction` field, and thinking uses `thinking_level`.
- Additionally, MTP (Multi-Token Prediction) variants have existed since 2026-04-16 for E2B, E4B, 31B, and 26B A4B; any diverging prompt contract is undocumented ((unbelegt)).

## Migration Notes
- **MIGRATING FROM gemma-4**: Strip all Gemma 4 tokenizer tokens (`<|turn>`/`<turn|>`, `<|think|>`, `<|channel>`, `<|image|>`/`<|audio|>`, tool tokens); translate tool declarations from token syntax into the target provider's JSON Schema format; remove `enable_thinking`, `parse_response`, and thought-stripping logic; for target models without thinking, re-add explicit CoT / few-shot prompting; do not carry over Gemma sampling (temperature 1.0 / top_p 0.95 / top_k 64) — whether and which sampling parameters the target permits is determined solely by the target guide (some targets reject non-default values or require stripping them entirely); for target models lacking a system role — including Gemma 3 — move system instructions back to the beginning of the first user message.
- **MIGRATING TO gemma-4**: Coming from Gemma 3, replace the entire turn format (`<start_of_turn>`/`<end_of_turn>` → `<|turn>`/`<turn|>`), most reliably via `apply_chat_template()` rather than manual string construction; elevate embedded system instructions into a genuine `system` turn; replace manual "step-by-step" CoT with `<|think|>` or `enable_thinking=True`; implement thought stripping for multi-turn conversations (exception: tool sequences within a turn); set `skip_special_tokens=False` during decoding, otherwise the reasoning parser fails; on 12B/26B/31B in the OFF state, include the empty thinking token. Coming from API models: there is no effort/budget knob, only on/off (Gemini API: `thinking_level` `high`/`minimal`) — cost control is governed by variant choice and the thinking toggle. Place image content before text. Context expands from 128K on Gemma 3 to 256K (12B/26B/31B); on E2B/E4B it remains 128K.

## Sources
- https://ai.google.dev/gemma/docs/core — Model overview: five architectures (E2B/E4B, 12B encoder-free, 26B MoE "high-throughput, advanced reasoning", 31B dense), 128K/256K context, modalities including video, "built-in support for the system role", "configurable thinking modes", built-in function calling.
- https://ai.google.dev/gemma/docs/core/model_card_4 — Parameter counts (2.3B / 4.5B effective, 11.95B, 25.2B total with 3.8B active, 30.7B), context per size, audio only on E2B/E4B/12B, "35+ languages … pre-trained on 140+", training data cutoff January 2025, Apache 2.0, "Built-in reasoning mode", limitations (factual errors, sarcasm/figurative language).
- https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4 — Complete control token table: `<|turn>`/`<turn|>`, roles `system`/`user`/`model`, `<|image|>`/`<|audio|>`, `<|tool>`/`<|tool_call>`/`<|tool_response>`/`<|"|>`, `<|think|>`, `<|channel>`/`<channel|>`; multi-turn stripping rule and the tool call exception.
- https://ai.google.dev/gemma/docs/capabilities/thinking — `enable_thinking=True` in chat template, ON/OFF templates for E2B/E4B vs. 12B/26B/31B, empty thinking token for output stabilization, `parse_response` and `skip_special_tokens=False`, disabling thinking mid-conversation by removing `<|think|>`; strictly ON/OFF states, no depth control; repo IDs of all five `-it` checkpoints (`google/gemma-4-E2B-it` … `google/gemma-4-31B-it`).
- https://ai.google.dev/gemma/docs/capabilities/text/function-calling-gemma4 — Syntax for tool declaration, tool call, and tool response, recommendation for active thinking for improved function calling accuracy, "A Gemma model cannot execute code on its own".
- https://ai.google.dev/gemma/docs/releases — Release dates: E2B/E4B/31B/26B A4B on 2026-03-31, MTP variants on 2026-04-16, 12B Unified on 2026-06-03; "text, audio and image input and long up to 256K context window".
- https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/ — Size designations, 128K/256K, "natively trained on over 140 languages", Apache 2.0, "function-calling, structured JSON output, and native system instructions", Arena AI rankings #3/#6, distribution channels.
- https://deepmind.google/models/gemma/gemma-4/ — Positioning quote "Our most intelligent open models …", 140 languages, benchmark values for "Gemma 4 31B IT Thinking".
- https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api — Hosted Gemini API IDs `gemma-4-31b-it` / `gemma-4-26b-a4b-it`, `system_instruction`, thinking "strictly" on/off via `thinking_level` `high`/`minimal`.
- https://ai.google.dev/gemini-api/docs/pricing — Gemma 4: Free Tier "Free of charge", Paid Tier "Not available".
- https://huggingface.co/google/gemma-4-31B-it — Official repo ID scheme, best practices: `temperature=1.0`, `top_p=0.95`, `top_k=64` "across all use cases", `<|think|>` at the beginning of the system prompt, image content before text.
- https://ai.google.dev/gemma/docs/core/prompt-structure — Baseline Gemma 3 for migration notes: turn tokens `<start_of_turn>`/`<end_of_turn>`, roles `user`/`model` only, "the `system` role or a system turn is not supported" (system instruction placed at beginning of first user message).
- https://ai.google.dev/gemma/docs/core/model_card_3 — Baseline Gemma 3 for context change: "Total input context of 128K tokens for the 4B, 12B, and 27B sizes", 32K for 1B/270M.

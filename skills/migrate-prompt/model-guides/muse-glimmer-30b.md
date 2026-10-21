---
model: muse-glimmer-30b
vendor: Meta
family: Muse
aliases: [muse-glimmer, glimmer, muse_glimmer, "meta-models/Muse-Glimmer-30B", muse-glimmer-30b-gguf]
last_verified: 2026-10-13
status: current
---

# Muse Glimmer 30B

## Reasoning / Thinking
- Type: **always on, but separate channel**. Prior to the response, the model writes a private chain-of-thought as an `assistant to=self` turn; the user response follows in a separate `assistant to=user` turn.
- Depth via `reasoning_strength` (`xhigh | high | medium | low`, default `high`) — not a sampling parameter. Two officially documented approaches: (a) preferably as a chat template argument to `apply_chat_template` or in llama.cpp via `--chat-template-kwargs '{"reasoning_strength":"low"}'` (per-request `chat_template_kwargs`) — the template renders from this the line `Reasoning strength: <value>` into the system turn; (b) according to the HF model card directly as the line `Reasoning strength: <value>` in the system prompt — the prompt-side lever when template kwargs cannot be passed. What happens when both (a) and (b) are used simultaneously is not documented (unbelegt) — use only one approach. OpenAI's `reasoning_effort` is not implemented in llama.cpp and controls nothing.
- Feed previous traces back via the `reasoning_content` field on the assistant message — the template renders from this the `to=self` turn. On vLLM, set `--reasoning-parser muse_glimmer`, otherwise the thinking channel leaks into `content` instead of `message.reasoning`.
- Reasoning traces can become long (concrete token lengths are not quantified anywhere by Meta, unbelegt): plan for `"stream": true` (request timeouts) and allocate `max_tokens` generously — too small a value cuts off mid-reasoning before the final answer arrives.

## Prompting Style
- **Rule No. 1: Always `apply_chat_template()`** with `add_generation_prompt=True` (for images `AutoProcessor` instead of a bare tokenizer). Hand-crafted prompt strings degrade quality: the template sets the system metadata block, reasoning strength line, and `<|eom|>` vs. `<|eot|>` for consecutive identical roles. In llama.cpp additionally use `--jinja` — without it, tool calling and reasoning separation break.
- System prompt: concrete on the task, state constraints (format, length limits, tone) **upfront**. Explicitly avoid: "meta-instructions about how the model works internally" — do not include instructions on how the model should think internally.
- Sampling according to prompting guide and HF model card: `temperature 1.0`, `top_p 0.95`, `top_k 64`. Warning (vLLM recipe): "Don't run this model greedy. Sending `"temperature": 0` overrides the published settings."

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Agentic end-to-end tasks (DeepSearch QA, MCP-Atlas, τ-Bench, SWE-Bench), reliable tool use with precise schemas, multi-step reasoning across long workflows, error diagnosis/recovery, multimodal input, 100+ languages. 30B dense: 4-bit under 20 GB (24–32 GB GPUs), bf16 serving ~72 GB VRAM.
- Weaknesses: **Exactly one tool call per turn, no parallel calls** — each tool result must be returned before the next tool is selected. Text + image in, text-only out. There is no official limitations section beyond this (unbelegt).

## Output & Format Conventions
- Context: 128K default ("longer contexts supported"), native 131072 (llama.cpp: `-c 131072 -np 1 -a muse-glimmer --jinja`). **Max output tokens officially nowhere stated (unbelegt)** — only the instruction to set `max_tokens` with headroom for trace + answer.
- Control tokens: `<|begin_of_text|>`/`<|end_of_text|>`, `<|start|>` (opens turn: role + optional `to=`), `<|message|>` (separates header from content), `<|eot|>` (end of turn), `<|eom|>` (turn continues), `<|image|>` (image sentinel).
- Tool calls in native ATEM format, rendered from OpenAI-style schemas in the `tools` argument of the template: `<|start|>assistant to=<tool><|message|><atem:function_calls><atem:invoke name="…"><atem:parameter name="…">…</atem:parameter></atem:invoke></atem:function_calls><|eot|>`. Behind an OpenAI-compatible vLLM/llama.cpp server (parser `muse_glimmer`, with underscore), this arrives as normal `tool_calls` — never construct ATEM manually.
- Structured output / JSON schema mode and assistant prefill are not officially documented (unbelegt). No Meta Model API ID (the Model API hosts, as of 2026-10-13, `muse-wonder-1.0`, `muse-spark-*`, `muse-image-1.0`, `muse-voice-transcribe-1.0`, and `sam-3.1`, but no Glimmer; Meta names Fireworks AI, OpenRouter, and Together AI, among others, as launch partners, whose model IDs are not documented, unbelegt) — production identifier is the HF repo `meta-models/Muse-Glimmer-30B` (plus `-GGUF`, `-assistant` as DFlash draft, `-ExecuTorch-PTE`), Apache 2.0.

## Migration Notes
- **MIGRATING FROM muse-glimmer-30b**: Write explicit chain-of-thought instructions back into the prompt; translate ATEM blocks into the target's function call format; remove `reasoning_strength`/`reasoning_content` wiring; reactivate parallel tool calls where the target supports them.
- **MIGRATING TO muse-glimmer-30b** (typical source Llama 4): Turn syntax `<|header_start|>role<|header_end|>` → `<|start|>role<|message|>` (+ `<|eom|>` for continuing turns); `ipython` role and Python/JSON calls (`[get_weather(city="…")]`) → recipient-tagged turns `to=<tool>` with ATEM; convert batched tool requests into sequential turns (only 1 call/turn); remove "think step by step" scaffolding and set `reasoning_strength` instead (template argument, or in pure prompt migration the system prompt line `Reasoning strength: <value>`); image machinery (`<|image_start|>`/`<|patch|>`/`<|tile_x_separator|>`) → a single `<|image|>` + `AutoProcessor`; **context regression 10M (Scout) / 1M (Maverick) → ~131K** ⇒ chunking/retrieval required; remove `temperature 0`, use 1.0 / 0.95 / 64; no hand-crafted prompt strings.
- Note: Meta does not declare Llama 4 deprecated anywhere and documents no Llama→Muse migration path. Treat Glimmer (as of 2026-10-13) as a current open Meta model; for >131K context, keep Scout in mind.

## Sources
- https://dev.meta.ai/docs/muse-glimmer/prompting — Special token table, `to=user`/`to=self`/`to=<tool>`, ATEM format, "one tool call per turn", `reasoning_strength` + `reasoning_content`, `apply_chat_template` requirement, sampling 1.0/0.95/64, system prompt rules.
- https://dev.meta.ai/docs/muse-glimmer — Architecture (dense, decoder-only, multimodal with vision encoder), 30B, Apache 2.0, text+image in / text out, 128K default, launch partner list (including Fireworks AI, OpenRouter, Together AI).
- https://dev.meta.ai/docs/muse-glimmer/llama-cpp — Native context 131072, `--jinja`, `-a muse-glimmer`, `-c`/`-np`, `--chat-template-kwargs`, `reasoning_effort` not implemented.
- https://dev.meta.ai/docs/muse-glimmer/vllm — ~72 GB VRAM, tool call parser and `--reasoning-parser muse_glimmer`, greedy warning, streaming/`max_tokens` note.
- https://dev.meta.ai/resources/blog/build-with-muse-glimmer — `apply_chat_template`/`add_generation_prompt`, `to=self`/`to=user` flow, 128K, 4-bit under 20 GB for 24–32 GB GPUs, speculative decoding.
- https://dev.meta.ai/docs/muse-glimmer/get-the-model — The four official Hugging Face repos and GGUF filenames including vision projector and DFlash draft.
- https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model — Distillation lineage from Muse Spark, agentic strengths/benchmarks, 100+ languages, no limitations section.
- https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4 — Llama 4 page of all migration deltas: header tokens, `ipython` role, tool output format, image tokens, Scout 10M / Maverick 1M.
- https://dev.meta.ai/docs/overview — Model API hosts (as of 2026-10-13) `muse-wonder-1.0`, `muse-spark-1.3`/`1.2`/`1.1`, `muse-spark-1.3-contributor`/`1.2-contributor`, `muse-image-1.0`, `muse-voice-transcribe-1.0`, `sam-3.1`; Muse Glimmer runs only from open weights (no Model API ID).
- https://dev.meta.ai/llama/docs/deployment/versioning — Llama 4 Scout/Maverick not deprecated, no documented Llama→Muse migration path.
- https://huggingface.co/meta-models/Muse-Glimmer-30B — Official model card (Meta Superintelligence Lab): ~29.6B parameters including vision encoder, 131,072+ context, Apache 2.0, sampling 1.0/0.95/64, 100+ languages, best practice "Reasoning strength can be defined as part of the system prompt as `Reasoning strength: <value>`".

---
model: gemini-3.1-pro-preview
vendor: Google
family: Gemini
aliases: [gemini-3.1-pro, 3.1-pro, gemini-pro-3.1, gemini-3.1-pro-preview-customtools]
last_verified: 2026-10-13
status: current
---

# Gemini 3.1 Pro Preview

## Reasoning / Thinking
- Type: **always on, depth via `thinking_level`** (`low | medium | high`; default `high`, dynamic). No disabling documented. `high` = "Maximizes reasoning depth" — significantly longer time to first non-thinking token, but yielding more carefully reasoned output.
- `minimal` exists family-wide, but is explicitly marked as **"Not supported"** for Gemini 3.1 Pro in the per-model table of the thinking documentation (`generate-content/thinking`) → on Pro, **`low` is the lower bound** ("Minimizes latency and cost. Best for simple instruction following, chat, or high-throughput applications").
- `thinking_budget` is accepted only for backward compatibility; Google recommends migrating to `thinking_level`. The two parameters must not be set together, and the levels are "relative allowances for thinking rather than strict token guarantees" — no token guarantee.
- **Thought Signatures**: Strictly validated during function calling — "The 'Current Turn' includes all Model (functionCall) and User (functionResponse) steps that occurred since the last standard User text message"; missing signatures → 400. Not enforced for plain text/chat, but recommended to preserve reasoning quality across subsequent turns.

## Prompting Style
- **Concise and direct.** Gemini 3.x rewards "direct, clear instructions" rather than elaborate prompt engineering; verbose scaffolding tends to hurt performance.
- In large data contexts, place the actual question/instruction **at the end**, following the data block.
- Replace handcrafted Chain-of-Thought ("think step by step") with `thinking_level: "high"` — native reasoning instead of prompt scaffolding.
- **Keep `temperature` at default 1.0**: "For all Gemini 3 models, we strongly recommend keeping the temperature parameter at its default value of 1.0"; values < 1.0 can trigger loops or degraded performance on complex reasoning/math tasks. Regarding `top_p`/`top_k`, there is no recommendation on the Pro pages ((unbelegt)).
- The default tone is direct/matter-of-fact — request a conversational style explicitly if needed.
- Set `media_resolution` per content type: images → `media_resolution_high` (max 1120 tokens), PDFs → `media_resolution_medium` (560 tokens, higher rarely yields gains), video → `low`/`medium` (70 tokens/frame), `high` (280 tokens/frame) only for text-heavy video.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: According to the API model card: "optimized for software engineering behavior and usability, as well as agentic workflows requiring precise tool usage and reliable multi-step execution"; according to the DeepMind card, suitable for "agentic performance, advanced coding, long context and/or multimodal understanding, algorithmic development". Benchmarks: ARC-AGI-2 77.1%, LiveCodeBench Pro 2887 Elo, MMMLU 92.6%.
- Weaknesses: Preview, not GA (API model page and model list categorize `gemini-3.1-pro-preview` under "Preview") — no stable production contract; ID/behavior can change. For a stable Google target, GA models are the safer choice.
- Knowledge cutoff: Jan 2025 (model table in family guide).
- Not supported: Live API, image generation, audio generation. Regarding image segmentation, the family guide states: "Image segmentation capabilities (returning pixel-level masks for objects) are not supported in Gemini 3 Pro or Gemini 3 Flash" — 3.1 Pro is not explicitly named there, but according to the model card it is based on Gemini 3 Pro (transferability (unbelegt)) → do not migrate such workloads to Gemini 3.1 Pro (Gemini 2.5 is legacy here; verify segmentation support of the target in advance).
- Long context remains error-prone: MRCR v2 achieves 84.9% at 128k average according to the DeepMind card, but only 26.3% at 1M pointwise — 1M context does not mean 1M reliable recall.
- Detailed limitations: The DeepMind card references the Gemini 3 Pro card; none are listed inline.

## Output & Format Conventions
- Exact ID `gemini-3.1-pro-preview`; a GA/stable ID `gemini-3.1-pro` is not documented on ai.google.dev.
- Separate endpoint `gemini-3.1-pro-preview-customtools` (Public Preview, 2026-02-23; identical pricing, no provisioned throughput): "better at prioritizing your custom tools", but "quality fluctuations in some use cases which don't benefit from such tools" — choose only for agents mixing bash and custom tools (Google FAQ: when the model ignores custom tools in favor of bash).
- Context: **1,048,576 input tokens**, **65,536 output tokens** (DeepMind card: "up to 1M" / "64K token output").
- Input: text, image, video, audio, PDF. Output: text only.
- Supported: caching, code execution, function calling, structured outputs, thinking, Batch API, Search and Maps grounding. **Structured outputs can be combined with built-in tools** (Google Search, URL Context, Code Execution, Function Calling) — previously not possible.
- Pricing is context-length tiered (Paid Tier, per 1M tokens): input $2.00 (≤ 200k) / $4.00 (> 200k), output $12.00 (≤ 200k) / $18.00 (> 200k), context caching $0.20 / $0.40 plus $4.50 per 1M tokens/hour storage; Batch = 50% discount. The **200k threshold** is the relevant cost boundary in prompt design.
- Remove `candidate_count` — according to Google "unsupported in Gemini 3 and later" (https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6).

## Migration Notes
- **MIGRATING FROM gemini-3.1-pro-preview**: Re-add explicit reasoning instructions and set an explicit `temperature` (the 1.0 default assumption is Gemini-specific); map `thinking_level` to the target's effort/budget control; remove thought signature and `media_resolution` plumbing; drop the assumption of "Structured Outputs + Built-in Tools simultaneously" if the target cannot mix JSON mode with search/code execution.
- **MIGRATING TO gemini-3.1-pro-preview** (especially from `gemini-2.5-pro`): (1) delete handcrafted Chain-of-Thought scaffolding, use `thinking_level: "high"` instead (or `medium`/`low` as a cost trade-off); (2) remove explicit low-temperature settings — keep default 1.0, otherwise loop/degradation risk; (3) replace `thinking_budget` with `thinking_level` (relative allowance, no token guarantee, never use both together); (4) re-test dense document pipelines with `media_resolution_high` (images) / `media_resolution_medium` (PDFs); (5) pass thought signatures through **every** function calling turn — return all signatures accumulated since the last user text message, otherwise 400; (6) token consumption changes (PDFs more expensive, video cheaper) → re-baseline costs against the 200k pricing tier; (7) do **not** migrate image segmentation workloads; (8) factor preview status into target selection.

## Sources
- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview — Exact ID, preview versions `gemini-3.1-pro-preview` and `gemini-3.1-pro-preview-customtools` (including "better at prioritizing your custom tools" / "quality fluctuations"), preview status, 1,048,576 / 65,536 tokens, modalities, feature matrix (including not supported: Live API / image / audio), optimization quote on software engineering and agentic workflows.
- https://ai.google.dev/gemini-api/docs/generate-content/gemini-3 — `thinking_level` values and `high` default, thought signature validation ("Current Turn"), temperature 1.0 recommendation, `media_resolution` per modality with token counts, structured outputs with built-in tools, prompting rules (conciseness, instruction at end), 2.5→3 migration checklist.
- https://ai.google.dev/gemini-api/docs/gemini-3 — Default `high` (dynamic) for Gemini 3.1 Pro, `thinking_budget` backward compatibility and prohibition of combination, temperature warning, knowledge cutoff Jan 2025, "image segmentation … not supported".
- https://ai.google.dev/gemini-api/docs/generate-content/thinking — Per-model table: for Gemini 3.1 Pro `minimal` is "Not supported"; `low`/`medium`/`high` supported, default `high` (dynamic); thinking cannot be disabled on 3.1 Pro.
- https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6 — Migration checklist: `candidate_count` "unsupported in Gemini 3 and later".
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-pro — Vertex model page: `gemini-3.1-pro-preview` (Public Preview, 2026-02-19) and `gemini-3.1-pro-preview-customtools` (Public Preview, 2026-02-23, no provisioned throughput), purpose of custom tools endpoint.
- https://deepmind.google/models/model-cards/gemini-3-1-pro/ — Official model card (February 19, 2026): 1M input / 64K output, intended uses, ARC-AGI-2 77.1%, LiveCodeBench Pro 2887 Elo, MMMLU 92.6%, MRCR v2 84.9% (128k) / 26.3% (1M pointwise), "based on Gemini 3 Pro", reference to Gemini 3 Pro card for limitations.
- https://ai.google.dev/gemini-api/docs/pricing — Context-length tiered pricing with 200k threshold, caching rates including storage, 50% Batch discount; `gemini-3.1-pro-preview-customtools` identically priced.
- https://ai.google.dev/gemini-api/docs/models — Official model list; `gemini-3.1-pro-preview` is listed under preview models, no GA Pro ID of the 3.x series listed.

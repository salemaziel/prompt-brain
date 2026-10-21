---
model: glm-5.3-flash
vendor: Z.ai
family: GLM
aliases: [glm-flash, glm-5.3-flashx, glm53-flash, zai-glm-5.3-flash, zai-org/GLM-5.3-Flash]
last_verified: 2026-10-13
status: current
---

# GLM-5.3-Flash

## Reasoning / Thinking
- Type: **forced on**. GLM-5.3 and GLM-5.3-Flash "no longer support disabling thinking" — `thinking.type: "disabled"` triggers an error; `"enabled"` is the only allowed value.
- Depth exclusively via `reasoning_effort`: `low` | `high` | `max` (default and recommendation). On the standard API endpoint, any other value causes an error ("Any other input will result in an error"). On the Coding Plan endpoint, `none`/`minimal`/`low` are mapped to `low`, `medium`/`high` to `high`, and `xhigh`/`max` to `max`. In open weights, a missing or unrecognized value silently falls back to `max` ("defaults to max if not passed (or if set to any other value)").
- There is **no zero-thinking path**; `low` is the lower bound, not "off". Thinking consumes additional tokens — recalculate token budgets relative to thinking-free workloads.
- Reasoning output: Non-streaming as `reasoning_content` alongside `content`, in streams as `delta.reasoning_content` before `delta.content`.
- `clear_thinking`: Preserved Thinking is off by default on the standard API endpoint, on by default on the Coding Plan endpoint; in the open-weights chat template, `clear_thinking` is set to `false`. The model page recommends `clear_thinking: false` (agent/coding runs), while the model card explicitly recommends `clear_thinking=true` for pure chat scenarios. Under Preserved Thinking, return the historical `reasoning_content` completely and unchanged.

## Prompting Style
- Z.ai showcases Flash primarily in **visually closed loops**: Generate result → render/execute → compare against reference (screenshot, template, original app) → refine. Official example prompts (UI recreation from screenshots, office decks, financial analysis, video editing, Blender scenes, Godot prototype, computer use, CAD) prescribe this verification loop explicitly, sometimes with a minimum number of rounds ("build → fixed-camera render → inspect → refine → re-render").
- Prescribe testable deliverables and citation requirements: Name output formats concretely (e.g. PPTX + PDF, MP4 + SRT, STEP/STL), require uncertainties to be listed as assumptions; the office example verbatim demands "Do not fabricate any business data; cite the source for all referenced information."
- In UI work, first analyze the design system from reference images, then construct, then compare rendered pages against reference.
- Agent prompts follow the official four-block schema: **Goal**, **Context** (files, error messages, examples), **Constraints** (engineering rules), **Done when** (acceptance criteria); "put temporary instructions in the prompt, and put long-lived rules in project-level configuration files"; for complex tasks plan first, then implement; one session per task.
- A Flash-specific prompt engineering page does not exist; further stylistic assertions are unbelegt.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: First natively multimodal model in the GLM-5 series (video, image, text, file as input), according to Z.ai stronger than GLM-5.2 at very low cost; DeepSWE v1.1 63.4 (GLM-5.2: 46.2), AutomationBench 48.8 (26.2), Z.ai Code Bench v1.0 29.0 at max effort (Claude Opus 4.8: 29.5).
  - Architecture according to model card: 320B total parameters, 18B active, hybrid sparse/linear attention, **newly trained base model** (not the 5.2/5.3 base model); according to model page 3.01× lower attention compute and 4.44× smaller KV cache than GLM-5.3. Open weights under MIT license.
  - `glm-5.3-flashx` is the same model line with approx. 200 tokens/s, but more expensive and (not yet) in the GLM Coding Plan; `glm-5.3-flash` is available in the Coding Plan with triple the quota of GLM-5.3.
- Weaknesses: Narrow `reasoning_effort` enum lacking `medium`/`xhigh`; behavioral differences compared to glm-5.3 despite identical version numbering because the base model is different — how pronounced is stated by no source (unbelegt); no published knowledge cutoff (unbelegt).

## Output & Format Conventions
- 1M tokens context, `max_tokens` up to 128K; input video/image/text/file, output text. The open model card cites only image + text.
- Multimodal content as content blocks in `messages[].content[]`: `image_url` (URL recommended or base64 data URL; multiple blocks supported), `video_url`, `file` (`file_url`/`file_id`/`file_data`). A `file` block must not be combined with `image_url`/`video_url` in the same request. Limits according to API reference: images < 5 MB and ≤ 6000×6000 px (JPG/PNG/JPEG), videos ≤ 200 MB (MP4/MKV/MOV), files ≤ 50 MB, up to 50 file URLs.
- The vision request schema (models `glm-5.3-flashx` — default there — and `glm-5.3-flash`) recognizes only roles `user`, `system`, `assistant`, no `tool` role and no `tool_calls` on the assistant; `tools` only type `function` (max 128), `tool_choice` only `"auto"`; `stop` according to parameter description currently supports only one stop word.
- Contradiction in docs: The model page lists Structured Output (JSON) and recommends `stream: true` plus `tool_stream: true`, but the vision schema in the API reference contains neither `response_format` nor `tool_stream` — whether both take effect for Flash is unbelegt. How tool results are returned without a `tool` role is likewise unbelegt.
- Recommended parameters according to model page: `temperature` 1, `top_p` 0.95, `reasoning_effort: max`.
- Price per MTok: Flash $0.15 input / $0.03 cached input / $0.50 output; FlashX $0.37 / $0.075 / $1.25; cached input storage temporarily free (as of 2026-10-13). Release notes entry: 2026-08-26.

## Migration Notes
- **MIGRATING TO glm-5.3-flash**: Remove `thinking.type: "disabled"` (triggers error) and convert non-thinking paths to `enabled` + `reasoning_effort: low`; use only `low`/`high`/`max` — never carry over `none`/`minimal` as "off", because they fail on the standard API and run silently on `max` in self-hosting. Set `model` explicitly to `glm-5.3-flash` or `glm-5.3-flashx` (pricing/speed trade-off; FlashX is not in the Coding Plan). Pass images, videos, and documents as `image_url`/`video_url`/`file` blocks, separating file and image/video blocks into distinct requests. JSON mode (`response_format`) is not documented in the API schema for this model — shift format constraints into the prompt contract and validate the output. Reduce multiple stop sequences to one; remove `tool_choice` values other than `auto`. Augment visual tasks with an explicit render-and-compare loop.
- **Specifically from glm-5.3 / glm-5.2**: Thinking contract is identical to glm-5.3; nevertheless re-evaluate prompts, as Flash is based on a newly trained base model (whereas glm-5.3 uses the base model of GLM-5.2).
- **MIGRATING FROM glm-5.3-flash**: Image, video, and file inputs require a multimodal target — glm-5.3 and glm-5.2 are text-only. Target models without forced thinking require an explicit thinking setup; remove or map Z.ai-specific fields (`clear_thinking`, `tool_stream`, `reasoning_content` handling) to target conventions; retain the render-and-compare loop in the prompt if the target can inspect visually, otherwise replace it with textual test criteria; verify 1M context and 128K output assumptions against the target window.

## Sources
- https://docs.z.ai/guides/vlm/glm-5.3-flash — Model IDs `glm-5.3-flash`/`glm-5.3-flashx`, "the first native multimodal model in the GLM-5 series", 1M context, 128K output, input video/image/text/file, capabilities list including Structured Output, FlashX approx. 200 tokens/s and not in Coding Plan, Coding Plan quota 3× GLM-5.3, recommended parameters (`temperature` 1, `top_p` 0.95, `reasoning_effort: max`, `clear_thinking: false`, `stream` + `tool_stream`), `image_url` blocks with URL or base64, the eight best-practice examples including "Do not fabricate any business data; cite the source for all referenced information", DeepSWE/AutomationBench/Z.ai Code Bench figures, 3.01×/4.44× compared to GLM-5.3.
- https://docs.z.ai/guides/capabilities/thinking — Forced thinking for GLM-5.3/5.3-FLASH ("no longer support disabling thinking"), `reasoning_effort` `max`/`high`/`low` with "Any other input will result in an error", Coding Plan mapping, `reasoning_content` non-streaming and in stream.
- https://docs.z.ai/guides/capabilities/thinking-mode — Preserved Thinking: default off on standard API endpoint, on on Coding Plan endpoint, requirement of returning `reasoning_content` unchanged.
- https://docs.z.ai/api-reference/llm/chat-completion — Vision request schema: model enum `glm-5.3-flashx` (default) / `glm-5.3-flash`, roles without `tool`, content blocks `text`/`image_url`/`video_url`/`file`, file/image combination prohibition, size limits, `max_tokens` up to 128K, `tools` only `function`, `tool_choice` only `auto`, `stop` with "Currently, only one stop word is supported", no `response_format`/`tool_stream`.
- https://docs.z.ai/guides/overview/pricing — GLM-5.3-Flash $0.15/$0.03/$0.50, GLM-5.3-FlashX $0.37/$0.075/$1.25, cached input storage "Limited-time Free".
- https://docs.z.ai/release-notes/new-released — 2026-08-26 GLM-5.3-Flash, native visual capabilities ("observe interfaces, rendering results, and interaction feedback").
- https://huggingface.co/zai-org/GLM-5.3-Flash — Official model card: MIT license, 320B/18B active, hybrid sparse/linear attention, "starts from a newly trained base model", image + text, `reasoning_effort` low/high/max with fallback to `max`, `clear_thinking` default `false` in chat template and chat recommendation `clear_thinking=true`.
- https://docs.z.ai/devpack/resources/best-practice — Goal/Context/Constraints/Done when, three context tiers, rule on temporary vs. long-lived instructions, plan before implementation, session hygiene (phrased model-independently).

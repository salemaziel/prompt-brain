---
model: glm-5.2
vendor: Z.ai
family: GLM
aliases: [glm52, zhipu-glm-5.2, zai-glm-5.2, zai-org/GLM-5.2, zai-glm-5-2]
last_verified: 2026-10-13
status: legacy
successor: glm-5.3
---

# GLM-5.2

## Reasoning / Thinking
- Type: **toggleable, model decides autonomously**. `thinking: {"type": "enabled" | "disabled"}`, default `enabled`; GLM-5.2 belongs to the models that "auto-decide whether to think" — unlike GLM-5.3/5.3-Flash, which enforce thinking.
- Depth via `reasoning_effort` (supported starting with GLM-5.2), default `max`. The full enum is accepted and mapped: `none`/`minimal` → thinking disabled, `low`/`medium` → `high`, `xhigh` → `max`. Effectively there is only **off / `high` / `max`** — a ported `low` already runs on `high` here. The Coding Plan mapping for 5.2 is identical.
- Which effort levels and fallback apply in the open weights is not stated in the model card (only "multiple thinking effort levels") — unbelegt.
- Reasoning output: Non-streaming as `reasoning_content` alongside `content`, streaming as `delta.reasoning_content` before `delta.content`.
- Preserved Thinking (`clear_thinking: false`) is disabled by default on the standard API endpoint, enabled by default on the Coding Plan endpoint; if used, historical `reasoning_content` must be returned completely and unchanged ("All consecutive reasoning_content blocks must exactly match the original sequence").

## Prompting Style
- Z.ai positions 5.2 as a flagship "built for the era of long-horizon tasks"; the model page recommends an agentic workflow pattern:
  - **Codebase audit first**: Have the model read the project and generate an architectural map including API contracts, data flows, and technical debt.
  - **Require a plan before refactoring**: "the execution plan, impact scope, risk boundaries, and verification method" before every change.
  - **Place engineering standards in `CLAUDE.md`/`Agent.md`** (lint rules, build commands, test requirements) instead of individual prompts.
  - **State explicit constraints** (e.g. no new dependencies, do not alter API contracts, do not commit autonomously).
  - **Require verification**: Run build, lint, and tests, reporting results alongside uncovered risks.
- General Z.ai agent schema: **Goal**, **Context**, **Constraints**, **Done when**; temporary instructions belong in the prompt, long-lived rules belong in project configuration files; one session per task.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Long, multi-step tasks with "1M lossless context" — according to release notes, less drift and goal loss over long runs; Terminal-Bench 2.1 81.0 (GLM-5.1: 62.0), SWE-bench Pro 62.1 (GLM-5.1: 58.4); open weights (MIT license, 753B parameters).
  - Compared to successor: GLM-5.3 uses the same base model and improves solely through post-training — +50% on Z.ai Code Bench, Terminal-Bench 3.0 4.6 (5.2) → 28.3, CyberGym 77.2% → 84.5%, higher token efficiency at max effort (5.2: 23.4% at ~96K output tokens per task; 5.3: 34.5% at ~75K).
- Weaknesses: **Text-only** (input and output text); coarse effort resolution due to mapping (no genuine `low`/`medium`); no published knowledge cutoff (unbelegt).

## Output & Format Conventions
- 1M tokens context, 128K output (`max_tokens` up to 131072); input text, output text.
- API defaults: `temperature` 1 (0–1), `top_p` 0.95 (0.01–1), `do_sample` `true`. Code examples on the model page use `temperature` 1.0 (one streaming example 0.6) — the page provides no separate sampling recommendation.
- Structured Output via `response_format: {"type": "json_object"}`; `stop`: schema allows up to 4, but parameter description states currently only one stop word is supported; `tools` max 128 functions, `tool_choice` only `"auto"`; `tool_stream` supported for tool call streaming. Cache hits under `usage.prompt_tokens_details.cached_tokens`.
- Price per MTok: Input $1.40, cached input $0.26, output $4.40 (identical to GLM-5.3); cached input storage temporarily free (as of 2026-10-13). Release notes entry: 2026-06-16.
- Mistral hosts the model unmodified as `zai-glm-5-2`.

## Migration Notes
- **Lifecycle**: Z.ai continues to list GLM-5.2 under "Latest Models" in its pricing list without naming a retirement date; however, the official migration page "Migrate to GLM-5.3" explicitly covers moving from GLM-5.2, and the model card points to GLM-5.3 as a newer version. On Mistral, `zai-glm-5-2` has been deprecated since 09/29/2026, replaced by GLM 5.3.
- **MIGRATING FROM glm-5.2 to glm-5.3** (official checklist): (1) `thinking.type: "disabled"` → `enabled` + `reasoning_effort: low`, otherwise the request will fail. (2) Remove `none`/`minimal`/`medium`/`xhigh` — 5.3 supports only `low`/`high`/`max`; a 5.2 `low`/`medium` effectively ran on `high`, so set `high` if behavior should remain consistent. (3) Set `model` to `glm-5.3`, adapt `max_tokens` to 128K. (4) `temperature` 1.0 / `top_p` 0.95, then tune only one of the two values. (5) In streams, process `delta.reasoning_content` and `delta.content` separately; handle tool calls with `stream` + `tool_stream` and argument concatenation. (6) Verification: response quality, "excessive randomness or excessive conservatism", tool streaming, latency, and costs under long context and deep thinking. Prompt contents transfer directly (same base model), only the thinking contract changes — and there is no longer a zero-thinking path, so re-estimate token budgets.
- **MIGRATING FROM glm-5.2 to other providers**: Resolve the 5.2 mapping — `low`/`medium` meant `high` here, `xhigh` meant `max`, `none`/`minimal` meant thinking off; map to the target guide's effort ladder instead of copying raw values. Map `clear_thinking`, `tool_stream`, and `reasoning_content` handling to target conventions.
- **MIGRATING TO glm-5.2**: Map thinking controls to `thinking.type` plus `reasoning_effort` (fine-grained effort values collapse to off/`high`/`max`); image/multimodal inputs are not supported (use `glm-5.3-flash` for images); reduce multiple stop sequences to one; remove `tool_choice` values other than `auto`; convert JSON Schema specifications to `json_object` plus prompt contract. Prefer successor `glm-5.3` for new integrations.

## Sources
- https://docs.z.ai/guides/llm/glm-5.2 — id `glm-5.2`, "built for the era of long-horizon tasks", 1M context, 128K output, text-in/text-out, capabilities (thinking, streaming, function calling, context caching, structured output), code comment "disabled or enabled, default is enabled", best practices (codebase audit, plan with "the execution plan, impact scope, risk boundaries, and verification method", `CLAUDE.md`/`Agent.md`, explicit constraints, verification), benchmarks Terminal-Bench 2.1 and SWE-bench Pro, sampling in examples.
- https://docs.z.ai/guides/capabilities/thinking — GLM-5.2 "auto-decide whether to think", `reasoning_effort` starting from GLM-5.2, default `max`, 5.2 mapping (`none`/`minimal` off, `low`/`medium` → `high`, `xhigh` → `max`) for API and Coding Plan, `reasoning_content` non-streaming and in stream.
- https://docs.z.ai/guides/capabilities/thinking-mode — Preserved Thinking defaults per endpoint and "All consecutive reasoning_content blocks must exactly match the original sequence".
- https://docs.z.ai/api-reference/llm/chat-completion — Text schema with `glm-5.2` in model enum: `thinking.type` default `enabled`, `reasoning_effort` enum and 5.2 mapping, `temperature`/`top_p` defaults, `max_tokens` up to 131072, `stop` (max 4, "Currently, only one stop word is supported"), `tools` max 128, `tool_choice` only `auto`, `response_format` `json_object`, `tool_stream` for GLM-5.2, `usage.prompt_tokens_details.cached_tokens`.
- https://docs.z.ai/guides/overview/migrate-to-glm-new — "Migrate to GLM-5.3": transition from GLM-5.2 and older, checklist (model string, thinking, effort, sampling, streaming, tool streaming, limits, verification including "excessive randomness or excessive conservatism").
- https://docs.z.ai/guides/llm/glm-5.3 — Breaking change on `thinking.type: "disabled"`, "same base model as GLM-5.2", comparison figures 5.2 vs. 5.3 (Z.ai Code Bench, Terminal-Bench 3.0, CyberGym 77.2% → 84.5%, token efficiency).
- https://docs.z.ai/guides/overview/pricing — GLM-5.2 under "Latest Models": $1.4/$0.26/$4.4, cached input storage "Limited-time Free".
- https://docs.z.ai/release-notes/new-released — 2026-06-16 GLM-5.2, "Supports 1M lossless context", less drift and goal loss in long tasks.
- https://huggingface.co/zai-org/GLM-5.2 — Official model card: MIT license, 753B parameters, "multiple thinking effort levels" without values list, note "A newer version of this model is available" (GLM-5.3).
- https://docs.mistral.ai/models/zai-glm-5-2 — Mistral hosting `zai-glm-5-2` without modifications, "This model is deprecated. Use Z.ai GLM 5.3 for new integrations.", deprecation 09/29/2026, replacement Z.ai GLM 5.3.
- https://docs.z.ai/devpack/resources/best-practice — Goal/Context/Constraints/Done when, temporary vs. long-lived instructions, session hygiene (phrased model-independently).

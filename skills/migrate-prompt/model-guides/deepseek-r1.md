---
model: deepseek-r1
vendor: DeepSeek
family: DeepSeek
aliases: [deepseek-reasoner, r1]
last_verified: 2026-10-13
status: legacy
successor: deepseek-v4.1-flash
---

# DeepSeek-R1

## Reasoning / Thinking
- **Type: always on (reasoning model).** DeepSeek-R1 is a dedicated reasoning model that generates a Chain-of-Thought (CoT) inside a `<think>...</think>` block prior to the actual response. There is no toggle to completely disable thinking.
- **No system prompt.** Official recommendation: "Avoid adding a system prompt; all instructions should be contained within the user prompt." All instructions must therefore be placed in the user prompt, not in a system role.
- **No few-shot.** According to the paper, R1 is prompt-sensitive: "Few-shot prompting consistently degrades its performance." Recommendation: "We recommend users directly describe the problem and specify the output format using a zero-shot setting for optimal results."
- **Temperature recommendation: 0.5–0.7, recommended 0.6** ("to prevent endless repetitions or incoherent outputs"); during evaluation in the paper, `temperature = 0.6` and `top_p = 0.95` are used.
- **Enforce `<think>` start.** "To ensure that the model engages in thorough reasoning, we recommend enforcing the model to initiate its response with `<think>\n` at the beginning of every output." Background: The R1 series sometimes bypasses thinking by emitting an empty block (`<think>\n\n</think>`), degrading performance.
- **Math prompts.** For mathematical tasks, an explicit directive is recommended: "Please reason step by step, and put your final answer within `\boxed{}`."
- **API: `reasoning_content`.** Via the API (model name `deepseek-reasoner`), the model returns the CoT separately in the `reasoning_content` field (same structural level as `content`, which contains the final answer). In subsequent turns, the CoT from previous turns was NOT incorporated into context; according to earlier reasoning documentation, the `reasoning_content` field had to be removed from the message before the next request, otherwise returning a 400 error ((unbelegt) — the page is offline; current thinking mode documentation states that for requests without `tools`, passed-back `reasoning_content` is ignored).
- **Note on API identity:** The API ID `deepseek-reasoner` was shut down on 2026-07-24 15:59 UTC (previously routed to the thinking mode of `deepseek-v4-flash`); R1 is now only usable as an open-weights model. Alias semantics per change log: `deepseek-reasoner` = R1 (from 2025-01-20), R1-0528 (from 2025-05-28), thinking mode of V3.1/V3.1-Terminus/V3.2-Exp/V3.2 (from 2025-08-21), and V4-Flash (from 2026-04-24) — prompts sent after 2025-08-21 targeted a hybrid model with system prompt and tool support. The API details in this guide describe the historical endpoint. The original open-weights model "DeepSeek-R1" (arXiv 2501.12948, HF Model Card) is distinct from this; the reasoning recommendations above originate from its Model Card / paper.

## Prompting Style
- **Moderately prescriptive, but with clear rules.** DeepSeek provides few, but strict guidelines: no system prompt, no few-shot, temperature in a narrow band around 0.6, output format explicitly requested in the user prompt.
- **Recommended:** Describe the task directly and in simple language (zero-shot); explicitly state the desired output format; add the `\boxed{}` directive for math; prompt the model to begin its response with `<think>\n`.
- **Discouraged:** Few-shot examples ("consistently degrades performance"), system prompts, very high or very low temperature (outside 0.5–0.7).
- **Evaluation:** Run multiple passes and average results, as the model is prompt-sensitive.

## Strengths & Weaknesses (prompt-relevant)
- Strengths: Strong multi-step reasoning (mathematics, code, logic) thanks to RL training; benefits from lean, direct zero-shot instructions; provides transparent CoT, retrievable separately via `reasoning_content`.
- Weaknesses: Prompt-sensitive — few-shot examples and overloaded context tend to degrade performance; tends to bypass thinking on certain requests (empty `<think>` block); can slide into repetitions or incoherence at temperatures outside 0.5–0.7; system prompt should be avoided according to the Model Card.
- API limitations (historical, API `deepseek-reasoner`): Original R1 API: no Function Calling, no FIM, `logprobs` → error ((unbelegt) — former reasoning documentation is offline); according to change log, the R1-0528 upgrade brought "JSON Output & Function Calling Support".

## Output & Format Conventions
- **`<think>...</think>` + answer.** Raw output contains the CoT block, followed by the final answer. Via API, the CoT is delivered as `reasoning_content`, and the final answer as `content`.
- **`max_tokens`** (historical, API `deepseek-reasoner`) included the CoT. Default 32K tokens, maximum 64K tokens ((unbelegt) — former reasoning documentation is offline).
- **Context length** of the model: 128K tokens (HF Model Card).
- **Math output** in `\boxed{}` when requested via directive.
- **Ineffective sampling parameters via API (historical, API `deepseek-reasoner`; (unbelegt) — former reasoning documentation is offline):** `temperature`, `top_p`, `presence_penalty`, `frequency_penalty` trigger no error but have no effect; `logprobs`, `top_logprobs` trigger an error. (The temperature recommendation of 0.6 applies to local / open-weights usage and third-party inference.)

## Migration Notes
- **MIGRATING FROM deepseek-r1** (to non-reasoning/instruct models):
  - Reintroduce system prompt: For target models supporting a system role, move instructions from the user prompt into a system prompt.
  - Reactivate few-shot: For many instruct models, examples improve performance again.
  - Remove thinking specifics: Strip `<think>\n` enforcement, `\boxed{}` directives, and parsing logic for `reasoning_content`.
  - Re-adjust temperature: The narrow 0.6 band is R1-specific; configure the target model according to its own defaults.
- **MIGRATING TO deepseek-r1** (from instruct/chat models):
  - Disband system prompt: Move contents of the system prompt into the user prompt (Model Card: "Avoid adding a system prompt").
  - Remove few-shot: Strip example blocks, describe the task and output format directly (zero-shot) instead.
  - Set temperature to 0.5–0.7 (0.6), top_p ~0.95.
  - Enforce output starting with `<think>\n`; append `\boxed{}` directive for math.
  - Adjust multi-turn handling: Do not re-inject CoT from previous turns into context; for the historical `deepseek-reasoner` endpoint only: remove `reasoning_content` before the next API call (otherwise 400 — (unbelegt), documentation offline).
  - For original R1 only: Avoid Function Calling / FIM ((unbelegt), see above; R1-0528 received Function Calling according to change log); if used, replace with prompt formatting.

## Sources
- https://huggingface.co/deepseek-ai/DeepSeek-R1 — Official Model Card: Usage recommendations (no system prompt, temperature 0.5–0.7/0.6, `<think>\n` enforcement, empty think block note, `\boxed{}` directive), context length 128K.
- https://github.com/deepseek-ai/DeepSeek-R1/blob/main/README.md — Identical usage recommendations section in official repo.
- https://arxiv.org/html/2501.12948v1 — DeepSeek-R1 paper (§5): "it is sensitive to prompts", "Few-shot prompting consistently degrades its performance", zero-shot recommendation; evaluation setup: `temperature = 0.6`, `top_p = 0.95`.
- https://api-docs.deepseek.com/guides/thinking_mode — Successor page to offline reasoning documentation (`guides/reasoning_model`): `reasoning_content` alongside `content`, passed-back `reasoning_content` ignored without `tools`, ineffective sampling parameters in thinking mode. Does not substantiate R1-specific API figures (32K/64K, `logprobs` error, 400 on passed-back `reasoning_content`).
- https://api-docs.deepseek.com/news/news260424 — Decommissioning of `deepseek-reasoner` on 2026-07-24 15:59 UTC, routed to thinking mode of `deepseek-v4-flash` until then.
- https://api-docs.deepseek.com/updates — Alias history of `deepseek-reasoner` (R1, R1-0528, V3.1 through V3.2, V4-Flash), R1-0528 with "JSON Output & Function Calling Support".

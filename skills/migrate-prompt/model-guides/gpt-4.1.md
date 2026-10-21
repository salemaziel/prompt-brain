---
model: gpt-4.1
vendor: OpenAI
family: GPT
aliases: [gpt4.1, gpt-4-1, gpt41, gpt-4.1-2025-04-14]
last_verified: 2026-06-13
status: legacy
---

# GPT-4.1

## Reasoning / Thinking
- **Type: none.** GPT-4.1 is NOT a reasoning model — OpenAI explicitly designates it as the "smartest non-reasoning model" and recommends on the model page to start with GPT-5 for complex tasks ("we recommend starting with GPT-5 for complex tasks"). There is no internal thinking/scratchpad step prior to the response.
- Step-by-step thinking must therefore be **explicitly triggered via prompt** ("induced chain-of-thought"). This improves output quality, but costs additional tokens and latency.
- Concrete triggers from the OpenAI Prompting Guide:
  - Generic starter: "First, think carefully step by step about what documents are needed to answer the query."
  - Optional planning reminder for agentic workflows: "You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls."
- Recommended approach: Iteratively derive reasoning strategies from observed failures and firmly codify them in the prompt ("audit failures and codify effective reasoning strategies"). Typical sources of error mitigated by explicit reasoning: misunderstanding user intent, incomplete context gathering, flawed step-by-step deduction.

## Prompting Style
- **Highly prescriptive / literal.** GPT-4.1 "is trained to follow instructions more closely and more literally than its predecessors". Consequences:
  - Implicit rule deduction is reduced — everything must be **explicitly** specified; the model "reads" less between the lines than GPT-4o.
  - If behavior deviates, a single clear corrective sentence is almost always sufficient: "a single sentence firmly and unequivocally clarifying your desired behavior is almost always sufficient".
  - Overly strict absolute instructions can backfire: For example, saying "always call a tool" may lead the model to invent (hallucinate) tool calls when information is missing. Fix: Add an escalation clause, e.g., "If you don't have enough information, ask the user for what you need."
- **System message adherence:** The model adheres closely to both user *and* system prompts in agentic settings. In case of conflicting instructions, it tends to follow those **closer to the end** of the prompt.
- **Agentic prompting:** OpenAI recommends three fixed reminders in the agent system prompt; internally they improved the SWE-bench Verified score by ~20%:
  - *Persistence:* "You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user."
  - *Tool Calling:* "If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer."
  - *Planning (optional):* "You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls."
- **Always pass tools via the `tools` API field**, do not inject them as text descriptions into the prompt ("exclusively use the tools field"): keeps the model in-distribution and brought an internal +2% on SWE-bench Verified. Use clear names and detailed descriptions for tools and parameters.
- **Long contexts:** Effectively usable up to ~1M tokens. With long contexts, place instructions **at both the beginning AND the end** ("at both the beginning and end of the provided context") — this outperforms single placement. Performance drops with increasing retrieval complexity or graph-search-style reasoning over many scattered facts.

## Strengths & Weaknesses (prompt-relevant)
- Strengths:
  - Very strong, precise instruction-following capability — outputs can be tightly steered.
  - Coding/agentic: Significantly better than GPT-4o (according to OpenAI +21.4% on SWE-bench Verified compared to GPT-4o (unbelegt)); reliable adherence to diff formats, fewer redundant edits, consistent tool usage.
  - Very large context window (1,047,576 tokens) with strong understanding of long documents.
- Weaknesses:
  - Literalness is a double-edged sword: underspecified or contradictory prompts lead to undesired behavior more quickly than with more "interpretive" predecessors.
  - Hallucinated tool calls when given overly absolute instructions without an escalation path.
  - Repeated example phrases are adopted verbatim → potentially repetitive; fix: "instruct model to vary phrases as necessary".
  - Tendency toward verbose explanatory prose / excessive formatting if not explicitly instructed to remain concise.
  - No built-in reasoning → complex multi-step logic must be enforced via prompting.

## Output & Format Conventions
- Context window 1,047,576 tokens, **max output 32,768 tokens**; Knowledge cutoff June 1, 2024 (model page).
- **Delimiters / structuring** (recommended order to experiment with):
  - **Markdown** (starting point): Section titles, code in backticks.
  - **XML**: Works very well, allows precise wrapping/nesting of content.
  - **JSON**: Verbose and performed poorly in long-context tests → avoid for large document collections.
  - For document collections, **XML** and the format `ID|TITLE|CONTENT` outperformed the JSON format.
- **Recommended prompt structure** (add/remove sections as needed): Role and Objective → Instructions (with subcategories) → Reasoning Steps → Output Format → Examples → Context → final "think step by step" instruction.
- **Diff formats (coding):** The **V4A format** is recommended — context-based identification **without line numbers**, with clear before/after delimiters. Also good: **SEARCH/REPLACE** and pseudo-XML — both without line numbers and with clear old/new delimitation.

## Migration Notes
- **No `successor`**: OpenAI does not document a direct successor for gpt-4.1 — the deprecations page lists only `gpt-4.1-nano` (→ `gpt-5.6-luna`), not gpt-4.1 itself; the model page merely points to GPT-5 for complex tasks (which itself is deprecated).
- **MIGRATING FROM gpt-4.1**:
  - To a **reasoning model** (e.g., the GPT-5 family): Manually injected "think step by step" instructions and explicit planning reminders can be omitted or reduced since reasoning occurs internally; instead control reasoning effort / parameters if applicable (model-dependent).
  - Re-evaluate prompts heavily tuned to GPT-4.1's verbatim literalness (very tight absolute instructions) on the target model — other models interpret more freely.
- **MIGRATING TO gpt-4.1**:
  - Prompts optimized for prior models (e.g., GPT-4o) may require adjustment because GPT-4.1 follows instructions more literally: "prompts optimized for prior models may require migration."
  - Make implicit assumptions explicit; tighten vague behavior with a single clear corrective sentence.
  - Move tool descriptions from prompt text into the `tools` API field.
  - For long contexts, duplicate instructions at both the beginning AND the end.
  - Since there is no built-in reasoning: Add explicit step-by-step / planning instructions where a reasoning model previously handled logic internally.
- **General:** OpenAI emphasizes "AI engineering is inherently an empirical discipline" — establish informative evals and iterate on every migration; test parallel tool calls and disable them if issues arise.

## Sources
- https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide — Official GPT-4.1 Prompting Guide (OpenAI Cookbook): Literal instruction following, three agentic reminders (persistence/tool-calling/planning), `tools` field instead of prompt injection, long-context placement at beginning/end, induced chain-of-thought, recommended prompt structure, delimiters (Markdown/XML/JSON), diff formats (V4A/SEARCH-REPLACE/Pseudo-XML), failure modes & fixes.
- https://developers.openai.com/api/docs/models/gpt-4.1 — Official model specification: Context window 1,047,576 tokens, max output 32,768 tokens, knowledge cutoff June 1, 2024, classified as "smartest non-reasoning model", snapshot gpt-4.1-2025-04-14, "we recommend starting with GPT-5 for complex tasks", no deprecation notice.
- https://openai.com/index/gpt-4-1/ — Official announcement "Introducing GPT-4.1 in the API": Model family, coding/instruction-following/long-context strengths, +21.4% on SWE-bench Verified vs. GPT-4o. (Direct access HTTP 403; contents verified via OpenAI search snippets.)
- https://developers.openai.com/api/docs/deprecations — No entry for gpt-4.1 / gpt-4.1-2025-04-14 (only gpt-4.1-nano → gpt-5.6-luna, shutdown October 23, 2026); gpt-5-2025-08-07 shutdown December 11, 2026.

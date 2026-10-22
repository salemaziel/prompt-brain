# prompt-brain

A Claude Code plugin for working with prompts. **optimize-prompt** analyzes weaknesses, applies best practices, and reconstructs a prompt from scratch with a detailed changelog. **migrate-prompt** takes a prompt tuned for one model and re-tunes it for another, using per-model guides, and explains every change as a model-A → model-B changelog.

## Installation

```bash
# Recommended: add the marketplace, then install
claude plugin marketplace add tarekst/prompt-brain
claude plugin install prompt-brain@tarek-plugins

# Or in one step (Claude Code 2.1.292+):
claude plugin install prompt-brain --marketplace tarekst/prompt-brain
```

A plugin installed from your shell loads in your next session, or after `/reload-plugins` in one
that is already open.

Or from inside Claude Code:

```
/plugin marketplace add tarekst/prompt-brain
/plugin install prompt-brain@tarek-plugins
```

Inside a session, `/plugin install` opens the plugin's details rather than installing at once:
choose a scope there to install. On Claude Code 2.1.275+ you can do both steps in one:
`/plugin install prompt-brain --marketplace tarekst/prompt-brain` asks you to confirm adding the
marketplace, then opens the same details.

**Requirements:** Claude Code 2.1.280 or later. Both skills pin Claude Opus 5.5 through their
`model:` frontmatter, and Claude Code supports Opus 5.5 from 2.1.280
([model configuration](https://code.claude.com/docs/en/model-config)). The pin applies to the
turn that runs the skill; Claude Code keeps your session model instead when your organization's
`availableModels` excludes it, or in auto mode when auto mode does not support it
([frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)).

For local development:

```bash
# Load from a local checkout (run from the repo root)
claude --plugin-dir .
```

### Codex CLI Installation

Install into OpenAI Codex CLI using the local repository marketplace:

```bash
codex plugin marketplace add ./
codex plugin add prompt-brain
```

Or enable it directly in `~/.codex/config.toml`:

```toml
[plugins."prompt-brain@personal"]
enabled = true
```

## Updating

Auto-update is off by default for third-party marketplaces such as `tarek-plugins`, so a new
release -- new and re-verified model guides included -- reaches you only when you update. From
your shell:

```bash
claude plugin update prompt-brain@tarek-plugins
```

Or inside Claude Code: run `/plugin`, open `prompt-brain` on the **Installed** tab and choose
**Update now**. The running session keeps the version it loaded; the new one loads in your next
session, or after `/reload-plugins`. To receive updates automatically, select `tarek-plugins` on
the **Marketplaces** tab of `/plugin` and choose **Enable auto-update**. See
[Keep plugins updated](https://code.claude.com/docs/en/plugins/install#keep-plugins-updated).

## Usage

```
/prompt-brain:optimize-prompt [--mode direct|system|structured|agentic] [--target model] [--with-examples] [prompt to optimize]
```

Paste your prompt after the command (with optional flags). The plugin will:
1. Parse the prompt's intent, mode, and target model
2. Analyze it against 8 weakness categories
3. Match best practices for the prompt type or requested mode
4. Reconstruct it from scratch (avoiding artificial phases for direct tasks)
5. Generate a changelog explaining every change

### Advanced Options:
- `--mode direct`: Single-block layout (Task/Context/Output/Constraints) without artificial multi-phase overhead.
- `--mode system`: System prompt architecture (Role, Operating Rules, Tool Protocols, Output Contract).
- `--mode structured`: JSON/Schema extraction prompts with strict field constraints.
- `--target <model>`: Optimizes directly for a specific model (e.g. `gemini-3.8-flash`, `gpt-5`, `deepseek-v4-pro`) using its native guide.
- `--with-examples`: Synthesizes 2-3 realistic input/output few-shot exemplars inside `<examples>`.

### Example

```
/prompt-brain:optimize-prompt Analyze the codebase and create a migration plan for the new API
```

Output: An optimized prompt with proper phases, output specifications, constraints, and success criteria -- plus a changelog explaining what was improved and why.

### Migrating a prompt between models

```
/prompt-brain:migrate-prompt [current-model] [target-model] [prompt to migrate]
```

The first two tokens are the source and target models; everything after is the prompt. The
plugin resolves each model against its registry (canonical id or alias), reads **only** the
two matching model guides, then rewrites the prompt so it is idiomatic for the target model --
removing source-specific accommodations (e.g. `budget_tokens`, forced step-by-step, model
control tokens) and applying the target's conventions. Output: the migrated prompt plus a
migration changelog.

```
/prompt-brain:migrate-prompt deepseek-r1 opus <your R1-tuned prompt>
```

**Prompts that contain `${CLAUDE_*}` variables:** Claude Code replaces `${CLAUDE_SESSION_ID}`,
`${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}` and
`${CLAUDE_PLUGIN_DATA}` inside slash-command arguments with their values before either skill
runs, and a backslash does not escape them
([string substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions)).
To keep such a prompt verbatim, run `/prompt-brain:optimize-prompt` with no prompt, or
`/prompt-brain:migrate-prompt <current-model> <target-model>` with only the two models, and paste
the prompt when the skill asks for it.

Supported models (75 guides), current and legacy (superseded but still documented by the vendor):

| Vendor | Current | Legacy |
|--------|---------|--------|
| Anthropic | Claude Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 | Opus 5, Sonnet 5, Fable 5, Haiku 4.5, Opus 4.8, Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 4.6 |
| OpenAI | GPT-6.1 Sol, GPT-6 Sol, GPT-6 Astra, GPT-6 Luna, GPT-5.6 Sol/Terra/Luna, GPT-5.5, gpt-oss-120b (also covers gpt-oss-20b) | GPT-5, GPT-5 mini, o3, GPT-4.1 |
| Google | Gemini 3.8 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Pro (preview), Gemma 4 | Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 2.5 Pro/Flash, Gemma 3 |
| xAI | Grok 4.7, 4.6, 4.5, 4.3, 4.20, Grok Build 0.1 | Grok 4 |
| Mistral | Large 4 (preview), Large 3, Medium 3.5, Small 4 | Large 2 |
| DeepSeek | V4.1-Flash, V4-Pro | V4-Flash, R1, V3 |
| Meta | Muse Spark 1.3, Muse Glimmer 30B, Llama 4 Maverick/Scout | Muse Spark 1.2 |
| Alibaba | Qwen3.8-Max, Qwen3.8-Flash, Qwen3.7-Plus, Qwen3.8-2.4T-A95B, Qwen3.8-27B | -- |
| Moonshot | Kimi K3, K2.7 Code, K2.6 | -- |
| Z.ai | GLM-5.3, GLM-5.3-Flash | GLM-5.2 |
| MiniMax | M3, M3.1 Flash Preview, M2.7 | -- |
| ByteDance | Doubao Seed 2.1 Pro/Turbo/Lite | -- |
| Baidu | ERNIE 5.1 | -- |

Each lives as a guide in
[`skills/migrate-prompt/model-guides/`](skills/migrate-prompt/model-guides/); pass an unknown
model and the command lists what is available instead of guessing. Guide bodies are in English
and cite official vendor docs.

Bare family aliases (`opus`, `sonnet`, `mistral-large`) resolve to the newest guide of that
family; version-pinned aliases (`opus-4.8`, `grok-4-latest`) stay on their own. A model becomes
`status: legacy` once its vendor names a successor, lists it as legacy, or retires or auto-routes
it -- plus a `successor` wherever the vendor documents one. The migration changelog ends with a
`Guide-Stand` footer listing both guides' `last_verified` dates -- with a staleness warning when
a guide was last verified more than 180 days ago, and a successor hint when you migrate *to* a legacy model.

## How It Works

The optimization follows a 5-step algorithm:

| Step | What happens |
|------|-------------|
| 1. Parse & Intent Extraction | Decomposes the prompt into 6 dimensions: goal, phases, scope, agent pattern, expected outputs, implicit assumptions |
| 2. Weakness Analysis | Checks against 8 categories: context, output spec, sequencing, guardrails, success criteria, efficiency, subagent instructions, tool & schema quality |
| 3. Best-Practice Matching | Classifies prompt type and selects applicable patterns |
| 4. Prompt Reconstruction | Rebuilds from scratch with top-down structure and measurable criteria |
| 5. Changelog Generation | Explains every change as a what->why pair |

Both skills run on Claude Opus 5.5 (see Installation) and adapt their depth to the session's
effort level (`low`/`medium` run a condensed pass; `high`+ runs the full algorithm). Claude
Code's [default effort](https://code.claude.com/docs/en/model-config#adjust-effort-level)
depends on the model and your settings -- it is `medium` on Opus 5.5, Sonnet 5.5 and Haiku 5.5 --
so a default session gets the condensed pass. For the full algorithm, run `/effort high` (saved
as your default) or `/effort max` (current session only) before invoking. See
[`skills/optimize-prompt/examples.md`](skills/optimize-prompt/examples.md) and
[`skills/migrate-prompt/examples.md`](skills/migrate-prompt/examples.md) for worked examples,
and [`evals/`](evals/) for the test scenarios of both skills.

## Compatibility

Both skills use the [Agent Skills open standard](https://agentskills.io) fields `name`,
`description`, `license`, `compatibility` and `metadata`, alongside five Claude Code keys that
sit outside the spec. Grok Build documents that extra keys are ignored, so it loads the
`SKILL.md` files as-is; OpenCode's skills page does not say how keys outside its five fields are
handled, so treat it as untested; hosts that reject them (claude.ai upload, the Skills API) do
not take them without a stripped copy. Two Claude Code features the skills build on are specific
to it: the `$ARGUMENTS` and `${CLAUDE_EFFORT}`
[string substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions).

| Host | How to install | What works | What does not |
|------|----------------|------------|---------------|
| Claude Code | `/plugin install prompt-brain --marketplace tarekst/prompt-brain` (2.1.275+), or the two commands under [Installation](#installation) | Everything (Claude Code 2.1.280+) | -- |
| [OpenCode](https://opencode.ai/docs/skills/) | Copy or symlink `skills/optimize-prompt/` and `skills/migrate-prompt/` into `.opencode/skills/`, `.claude/skills/` or `.agents/skills/` (or their global equivalents) | Skill body and lazy guide loading; through `metadata`, `/optimize-prompt` and `/migrate-prompt` as TUI commands and no model auto-selection; untested whether the Claude Code-only frontmatter keys are ignored (its docs do not say) | Does not install the plugin (its docs do not mention `.claude-plugin/` marketplaces); documents no `$ARGUMENTS` or `${CLAUDE_EFFORT}` substitution |
| [Grok Build](https://docs.x.ai/build/features/skills-plugins-marketplaces) | Nothing extra once the plugin is installed in Claude Code -- Grok's docs say it reads Claude Code marketplaces and plugins with no setup (untested here); otherwise copy the skill directories into `.grok/skills/` or `~/.grok/skills/` | Honors `when-to-use`, `argument-hint`, `user-invocable`, `disable-model-invocation`; ignores extra keys | Accepts but ignores `model`, `effort`, `license`, `compatibility` |
| claude.ai upload / Skills API | Not shipped -- would need a stripped copy of each skill | Only the six [spec fields](https://agentskills.io/specification) are accepted | The Claude Code-only keys are a [hard error](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code), not ignored, so the skills do not upload as-is |

**Known limitation:** OpenCode documents no argument substitution for skills, so there you type
`/migrate-prompt` (or `/optimize-prompt`) and state the two models and the prompt in your
message instead of as slash-command arguments. Grok Build documents `argument-hint` support but
says nothing about substitution either way, so treat that as untested. Wherever `$ARGUMENTS` or
`${CLAUDE_EFFORT}` is not substituted, the skills detect it: they read the input from the message
that invoked them and fall back to full depth.

Note that adding an `AGENTS.md` to a project makes OpenCode stop reading `CLAUDE.md` -- only the
[first match per category](https://opencode.ai/docs/rules/) wins -- so this repo deliberately
ships no `AGENTS.md`.

## License

MIT

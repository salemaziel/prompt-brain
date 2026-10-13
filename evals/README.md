# evals

Machine-runnable eval suite for the two prompt-brain skills. Every scenario lives in its own
directory as a `case.yaml`, discovered by the Claude Code CLI as `evals/**/case.yaml`.

```
evals/
  optimize-prompt/<nn>-<slug>/case.yaml
  migrate-prompt/<nn>-<slug>/case.yaml
evals-effort/
  migrate-prompt/<nn>-<slug>/case.yaml   # run only with --eval-dir, see below
```

`evals/` is **out-of-band**: neither skill ever loads anything from this directory at runtime.
It exists purely for maintainer testing, the same way `scripts/` and `.github/` do.

## Running the suite

From the repo root:

```bash
claude plugin eval .
```

Useful flags:

| Flag | Effect |
|------|--------|
| `--case <glob>` | Run only the cases whose `name` (the case directory name) matches the glob (e.g. `--case '03-happy-*'`). Matching is on the name, not the path. To run one skill's cases, use `--tag migrate` or `--tag optimize`; every case carries one of the two. |
| `--tag <tag>` | Run only cases carrying that tag (e.g. `--tag degenerate`). |
| `--threshold <0..1>` | Exit 1 if **any single case** scores below the given fraction (default: `1.0`). Per case, not aggregate — one weak case fails the run. |
| `--ablation none` | Drop the no-plugin baseline arm. `with-without` is the **default** whenever a plugin resolves — by name, or from the target path — which `claude plugin eval .` does, so `none` is the flag you add, not `with-without`. |
| `--eval-dir <dir>` | Read cases from another directory below the plugin instead of `evals/` (used for `evals-effort/`, below). |

Flag behaviour above is quoted from `claude plugin eval --help` on CLI **2.1.288**; the command
requires CLI 2.1.269 or later, and CI pins 2.1.288 (`.github/workflows/validate.yml`), so
re-check the help text whenever either version changes.

`claude plugin eval` requires Claude Code 2.1.269 or later. If it prints "plugin eval is
currently in early access", your build predates general availability: run `claude update` and
retry in a fresh session (https://code.claude.com/docs/en/plugin-evals.md#troubleshooting). In
a non-interactive shell, or with `--json`, pass `--trust-plugin`, or the run is refused with
exit 1.

Every run writes `results/<timestamp>/` (`aggregate-result.json`, `report.html`) inside the
eval directory it ran from, e.g. `evals/results/`. Keep those directories out of git.

### Ablation arms

This is on by default: `claude plugin eval .` resolves this plugin from the target path, so
`with-without` is already active and you never pass it. Pass `--ablation none` to switch it off.

With `--ablation with-without`, each case runs `runs` times per arm (3 by default): one set of
runs with the plugin loaded and one without. Graders marked `arm: with-only` are
**plugin-fired indicators**, not part of the comparative score. The `skill-loaded` grader in
every case is one of these. Both skills set `disable-model-invocation: true`, and every case
prompt is a typed slash command that Claude Code expands before the run, so no `Skill` tool
call is expected to occur to count. The grader instead matches the skill's H1 heading
(`Prompt Optimization Algorithm` / `Prompt Migration Algorithm`) in the `trace`, which a
baseline arm without the plugin never contains. All other graders run in both arms so the
delta is meaningful.

Under `--ablation none` nothing is excluded, so with-only graders are scored too — including
`skill-loaded`.

**Confirm `skill-loaded` once before trusting it.** No eval has been run yet, so it is not
observed that the expanded skill body appears in the eval `trace` (local Claude Code session
transcripts record a typed `/prompt-brain:…` command as a user message carrying the skill
body, with no `Skill` tool call). Run
`claude plugin eval . --case 06-bare-invocation-no-argument --runs 1 --ablation none` and
check that `skill-loaded` passes. If it fails, re-run with `--keep-temp`, inspect the trace,
and fix the grader before reading any other result.

### Effort-differential cases

`case.yaml` cannot set the session effort, and a case's `env` accepts only `EVAL_*` keys, so the
low/max halves of `migrate-prompt/09-effort-adaptive-depth` live in a separate eval root,
`evals-effort/`, which a plain `claude plugin eval .` never discovers. Run them with the
documented `CLAUDE_CODE_EFFORT_LEVEL` variable, which takes precedence over `--effort` and
`/effort` (https://code.claude.com/docs/en/env-vars):

```bash
CLAUDE_CODE_EFFORT_LEVEL=low claude plugin eval . --eval-dir evals-effort --tag effort-low
CLAUDE_CODE_EFFORT_LEVEL=max claude plugin eval . --eval-dir evals-effort --tag effort-max
```

Eval runs inherit "most `ANTHROPIC_*` and `CLAUDE_CODE_*` configuration" from your shell;
whether this particular variable is on that allowlist is not documented (unbelegt). The
`effort-low-reached-skill` / `effort-max-reached-skill` graders check, on every run, that the
skill body really saw ``Current session effort: `low` `` / `` `max` ``. If one fails while the
skill was loaded, either the allowlist dropped the variable or the expanded body is not in the
`trace` — inspect the `--json` output before trusting the low/max verdicts. Record these runs
in the run record below, with the variable's value in Notes.

### Manual checks

These cannot run as plain cases:

1. **optimize-prompt's condensed pass.** Run
   `CLAUDE_CODE_EFFORT_LEVEL=low claude plugin eval . --case 05-filler-adjectives-no-scope --ablation none --runs 1`
   and check in the report that `examples.md` was never read (SKILL.md: `low` / `medium` must
   not read it). On first use, confirm the variable reached the run, as above.
2. **The non-substituting-host fallback.** `claude plugin eval` runs are Claude Code children
   that always substitute `${CLAUDE_EFFORT}`, so the fallback in both Depth Calibration blocks
   ("treat the effort as `high`") is never exercised here. Check it by loading
   `skills/*/SKILL.md` on a host that leaves the placeholder unexpanded (OpenCode documents no
   argument substitution for skills) and expect the full algorithm.

### Date-sensitive cases

Step 5 of migrate-prompt warns that a guide's model facts may be outdated when its
`last_verified` date is more than 6 months old. No grader expects that warning either way, so
a case starts emitting it silently once one of its guides ages past that line. As of
2026-10-13 the only guides the cases read with an old date are `gpt-5.md` and `gpt-4.1.md`
(`last_verified: 2026-06-13`; cases 06, 07, 18 and 19), which cross 180 days on 2026-12-10
(`check-registry-sync.mjs` WARNs from 150 days, 2026-11-10). Re-verify those guides first, or,
once the dates cross, add a `stale-guide-warning` contains-regex (`outdated|veraltet`,
`flags: 'i'`) to an affected case.

## Grader conventions used here

- **Lazy loading is the central contract of `migrate-prompt`.** Every migrate case pins it on
  `Read`, `Glob` and `Grep`: the number of `Read` calls against `model-guides/` is
  `min: 0, max: 0` for the cases that must stop before loading anything (both are required:
  `min` defaults to 1, so `max: 0` alone can never pass), and `min: 2, max: 2` for every happy
  path — plus per-file graders naming the two guides that must be read and, where it matters,
  the guides that must *not* be. Every migrate case also carries
  `no-guide-folder-enumeration` (no `Glob` over `model-guides/`) and `no-grep` (no `Grep` at
  all), both `min: 0, max: 0`.
- **Escape dots in `input_match`.** It is a regex over the JSON-encoded tool input, so
  `claude-opus-5\.md` is what reliably excludes `claude-opus-5-5.md`.
- **Mechanical over judgmental.** Structural assertions (a fenced code block is present, the
  changelog sits outside the fence, the outer fence is longer than an inner one, a
  `Guide-Stand` footer exists, umlauts survive as UTF-8) are `regex` graders. `llm` graders are
  reserved for genuinely judgment-based bullets — intent preserved, no invented requirements,
  an honest "few changes apply" verdict. The judge sees only its `focus` (`last_message` here),
  never the guides, so a rubric names the concrete reason to look for instead of asking the
  judge to compare guide content.
- **Renaming either SKILL.md H1 heading** (`# Prompt Optimization Algorithm` /
  `# Prompt Migration Algorithm`) requires updating the `skill-loaded` pattern in every case of
  that skill.
- **Cases pinned to registry state.** Cases 08, 12, 15, 16, 17, 18 and 19 name specific guides
  (bare-alias targets, successors, `status: current` targets). Re-check them whenever a guide is
  added, an alias moves, or a `status` / `successor` changes.
- **`expected_outcome`** carries the original human-readable rationale for each scenario. The
  graders encode it; `expected_outcome` explains it.

## Run record

| Date | Plugin version | CLI version | Model | Cases run | Result | Notes |
|------|----------------|-------------|-------|-----------|--------|-------|
| 2026-08-27 | 0.7.0 | 2.1.246 | `claude-opus-5` (skill-pinned) | 0 of 23 | not run | Suite authored and schema-validated against CLI 2.1.246. **Not executed**: `claude plugin eval` is early-access-gated and was unavailable on this account. No pass/fail data exists yet. |

Add a row per execution. Do not backfill a row for a run that did not happen.

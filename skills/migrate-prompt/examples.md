# Examples: migrate-prompt

One fully worked migration, showing the invocation, the migrated prompt (the skill outputs
this in a fenced code block) and the rendered migration changelog. It calibrates three
things: how far to strip source-specific accommodations, how to phrase **What -> Why** pairs
as source -> target, and how to stay honest about what the guides do *not* say. Quotes from
the guides stay in their original German; everything else is framing text.

**Contents**
- Example — `claude-opus-4-8` -> `claude-fable-5` (agent system prompt): invocation and source prompt
- The Migrated Prompt (section 1)
- The Migration Changelog (section 2): Reasoning & sampling config; Prefill & output contract; Scaffolding -> goal + behavior sections; Runtime & failure handling (new for the target); Left unchanged, deliberately; Guide gaps; Guide-Stand footer

---

## Example — `claude-opus-4-8` -> `claude-fable-5` (agent system prompt)

An agent spec that was carried forward onto Opus 4.8 from an older Claude and still drags
along legacy API config, an assistant prefill, and a rigid step list. The target is named
with the version-pinned alias `fable-5`; the bare `fable` would resolve to `claude-fable-5-1`
instead.

**Invocation**

```
/prompt-brain:migrate-prompt opus-4.8 fable-5 # Dependency Upgrade Agent

API config:
  model: claude-opus-4-8
  thinking: { type: "enabled", budget_tokens: 12000 }
  temperature: 0.2
  output_config: { effort: "xhigh" }
  messages[-1] (assistant prefill): "## Step 1 — Inventory\n"

You are an agent that upgrades the pinned dependencies of this monorepo.

Follow these steps exactly, in this order, and do not skip one:
1. Run `pnpm ls --depth 0` in every workspace package and write the result to
   `./upgrade/inventory.md`.
2. For each package, look up the current stable release and note the delta.
3. Group the upgrades into patch, minor and major groups.
4. Apply the groups one at a time, in that order.
5. Run the test suite after each applied group.
6. Write `./upgrade/report.md` when all groups are done.

After every 3 tool calls, print a one-line status so I can follow along; otherwise stay
silent — no narration between tool calls and no closing summary longer than 3 lines.

Decide small things yourself (naming, ordering, equivalent version choices) instead of
asking; only ask before scope changes or destructive actions.

Tools:
- `web_search` — call this when you need a package's current release notes.
- `run_tests` — call this when a version group has been applied.

Constraints:
- Never bump a major version without an explicit note in the report.
- Do not touch lockfiles outside `./packages`.
- If a group fails tests twice, revert that group and continue with the next.

Begin with Step 1.
```

**Resolution** (Step 1, before any file read): `opus-4.8` -> `claude-opus-4-8`,
`fable-5` -> `claude-fable-5`. Two guides loaded, nothing else.

---

### 1. The Migrated Prompt

```
# Dependency Upgrade Agent

API config:
  model: claude-fable-5
  output_config:
    effort: "xhigh"        # sweep medium/low for routine upgrade runs
  fallbacks: [{"model": "claude-opus-4-8"}]   # beta, Claude API only: server-side-fallback-2026-07-01
  # no `thinking` key — thinking is adaptive and always on
  # org needs 30-day retention: no ZDR without Anthropic's authorization (400 otherwise)
  # stream the run; single turns can take many minutes at this effort
  # check `stop_reason == "refusal"` before reading `content`

You are an agent that upgrades the pinned dependencies of this monorepo.

## Goal
Bring the pinned dependencies up to their current stable releases, applied in groups
(patch, then minor, then major), with the test suite green after each applied group.

## Deliverables
- `./upgrade/inventory.md` — the current pinned version of every workspace package. Start
  with this inventory.
- `./upgrade/report.md` — per group: what was upgraded, the test result, and every
  major-version bump called out explicitly.

## Behavior
- **Anti-overplanning**: when you have enough information to act, act. No plan of a plan,
  and no re-reading of an inventory you already wrote.
- **Boundaries**: do this upgrade and nothing else. Decide small things yourself (naming,
  ordering, equivalent version choices); ask only before scope changes or destructive
  actions.
- **No tidying**: do not refactor, reformat, or otherwise "improve" code you touch while
  upgrading.
- **Grounded progress**: every status claim must be backed by an actual tool result — never
  call a group green before `run_tests` has returned for it.
- **Communication**: one short status line per completed group; closing summary of at most
  3 lines. No narration in between.
- **Long sessions**: this run is long by design. Keep going until every group is applied or
  explicitly reverted; do not stop early because the session feels long.

## Tools
- `web_search` — call this when you need a package's current release notes.
- `run_tests` — call this when a version group has been applied.

## Constraints
- Never bump a major version without an explicit note in the report.
- Do not touch lockfiles outside `./packages`.
- If a group fails tests twice, revert that group and continue with the next.
```

---

### 2. The Migration Changelog

## Migration: claude-opus-4-8 -> claude-fable-5

### Reasoning & sampling config
- **Removed `thinking: {type: "enabled", budget_tokens: 12000}`** -> on Fable 5 thinking is
  adaptive and always on: „`thinking` weglassen oder `{type: "adaptive"}` senden;
  `{type: "disabled"}` und `{type: "enabled", budget_tokens: N}` liefern beide 400". The
  source guide already gives 400 for this form on Opus 4.8, so it was dead config before the
  migration too.
- **Removed `temperature: 0.2`** -> both guides return 400 for non-default
  `temperature`/`top_p`/`top_k`; depth and determinism are steered through the prompt plus
  `effort`.
- **Kept `effort: "xhigh"`, added a sweep note** -> both guides expose the same
  `low | medium | high | xhigh | max` scale, and the target guide reserves `xhigh` for „die
  kapazitätskritischsten Workloads" and asks for an „effort-Sweep inkl. `medium`/`low` für
  Routinearbeit" — routine upgrade runs likely do not need `xhigh`.

### Prefill & output contract
- **Dropped the assistant prefill `"## Step 1 — Inventory"`** -> Fable 5 does not support
  assistant prefill (400); the guide points to Structured Outputs (`output_config.format`) or
  a system-prompt instruction instead. Same story on Opus 4.8, where prefill returns 400.
- **Moved the prefill's job into the prompt** -> the target guide offers system-prompt
  instructions as the prefill replacement; the Deliverables section now states the expected
  outputs and that the inventory comes first, so no response-format constraint is added.

### Scaffolding -> goal + behavior sections
- **Collapsed the six numbered steps into Goal + Deliverables + Constraints** -> the target
  guide says migrated prompts should be slimmed down: „für frühere Modelle geschriebene
  Skills sind oft zu präskriptiv und können die Qualität senken", and its migration notes say
  „über-präskriptives Scaffolding entfernen". The ordering that actually matters (inventory
  first, patch -> minor -> major, test after each group) survives as stated goal and
  deliverables, not as a procedure.
- **Dropped "After every 3 tool calls, print a one-line status"** -> counting tool calls is a
  source-side cadence rule (the source guide says to remove existing „after every N tool
  calls"-Scaffolding). The same intent — keep me informed, stay brief — is now carried by the
  Grounded-progress and Communication sections, keyed to completed groups instead of a call
  counter.
- **Turned the silence default and the autonomy hint into named behavior sections** -> both
  are task intent, so they stay in effect. The target guide ships ready-made snippets for
  exactly these („Rückfragen nur bei destruktiven Aktionen/Scope-Änderung/fehlendem Input",
  „Ergebnis zuerst statt Ausschweifen") and notes that „ein knapper Satz eine ganze
  Verhaltensliste ersetzt", so each section stays one or two sentences.
- **Added Anti-overplanning, No-tidying and Grounded-progress sections** -> these are
  snippets the target guide lists for Fable 5 (Anti-Overplanning, „kein ungefragtes
  Refactoring/Tidying", „Fortschrittsaussagen gegen Tool-Ergebnisse prüfen"); they constrain
  *how* the existing task is executed and add no new work.

### Runtime & failure handling (new for the target)
- **Added a `stop_reason == "refusal"` check before reading `content`** -> Fable 5's safety
  classifiers return a refusal as HTTP 200 with `stop_reason: "refusal"`; the guide says to
  check it before reading `content` and discard partial output.
- **Added a server-side fallback to `claude-opus-4-8`** -> on Fable 5 „Fallbacks sind
  opt-in" (beta, Claude API only), and the migration notes say to configure them explicitly;
  the guide names Opus 4.8 as the documented fallback target.
- **Noted the 30-day retention requirement** -> without Anthropic's authorization there is no
  ZDR, and on the Claude API an organization without a matching retention configuration gets
  400 `invalid_request_error` — a deployment precondition the source model never had.
- **Added streaming + long-turn notes** -> „einzelne Requests auf schweren Aufgaben laufen bei
  höherem effort viele Minuten", so client timeouts and streaming have to be planned for.
- **Added the "do not stop early" line** -> the guide notes rare early stopping deep in long
  sessions and suggests countering it („Autonomie-Reminder gegensteuern") — relevant here
  because a full monorepo upgrade is exactly such a session.

### Left unchanged, deliberately
- **Kept the `web_search` / `run_tests` "call this when …" trigger descriptions** -> explicit
  tool triggers are an Opus 4.8 accommodation for its under-use of tools without explicit
  triggers, so they were candidates for removal. The Fable 5 guide gives no general
  tool-triggering advice, and dropping them would rest on a model fact neither guide
  supports — kept as the safer option.
- **Did not add a memory file, a `send_to_user` tool, or async sub-agents** -> the target
  guide offers snippets for a memory file and asynchronous parallel sub-agents, plus an
  optional `send_to_user` tool, but each would introduce an artifact or a workflow the
  original prompt never asked for. Flagged here instead of silently expanding the scope.
- **Carried the Constraints block over verbatim** -> pure task intent (major-version policy,
  lockfile boundary, revert rule), not a source-model accommodation.

### Guide gaps
- Neither guide covers tool-trigger phrasing for Fable 5, which is why the tool descriptions
  were left as-is rather than rewritten.

**Guide-Stand**: `claude-opus-4-8` last_verified 2026-10-13 · `claude-fable-5` last_verified
2026-10-13. Both are under six months old, so no staleness warning applies. The target
`claude-fable-5` is superseded (`status: legacy`): consider migrating to its successor
`claude-fable-5-1` instead. The target guide notes that Fable 5 stays available (retirement
not before 9 June 2027).

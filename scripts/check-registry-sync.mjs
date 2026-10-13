#!/usr/bin/env node
// Verifies the invariant CLAUDE.md declares for migrate-prompt: the model registry
// table in skills/migrate-prompt/SKILL.md (the resolver's source of truth) must be
// an exact mirror of the model-guides/*.md frontmatter, and every token must be
// resolvable under the skill's whitespace-tokenized, case-insensitive matching.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = join(root, 'skills', 'migrate-prompt', 'SKILL.md');
const guidesDir = join(root, 'skills', 'migrate-prompt', 'model-guides');

const errors = [];

// --- dates. A shape check alone accepts dates the calendar cannot represent (2026-02-31) and
// year typos (2026 -> 2062); the round-trip through Date rejects the former, and the
// future-dated check on last_verified below rejects the latter. Both matter because a guide
// whose age comes out negative silently drops out of the staleness report and out of
// --strict-age -- the exact guide the report exists to surface.
const isCalendarDate = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))).toISOString().slice(0, 10) === s;
const utcDay = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const todayEnv = process.env.PROMPT_BRAIN_TODAY;
if (todayEnv && !isCalendarDate(todayEnv)) {
  console.error(`FAIL: PROMPT_BRAIN_TODAY="${todayEnv}" is not a real YYYY-MM-DD calendar date`);
  process.exit(1);
}
// `today` is the UTC calendar day, so a local run and the UTC CI runner agree on it no matter
// the maintainer's timezone. The future-date check below still allows ONE day of slack: a
// guide stamped with the local date just after local midnight (ahead of UTC) is not "future".
const now = new Date();
const today = todayEnv ? utcDay(todayEnv) : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const todayIso = new Date(today).toISOString().slice(0, 10);
const DAY_MS = 86400000;

// --- registry table between the BEGIN/END markers
const skill = readFileSync(skillPath, 'utf8');
const block = skill.match(/<!-- BEGIN model-registry[\s\S]*?<!-- END model-registry -->/);
if (!block) {
  console.error('FAIL: model-registry BEGIN/END markers not found in ' + skillPath);
  process.exit(1);
}
const registry = new Map();
for (const line of block[0].split('\n')) {
  const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/);
  if (!m || m[1] === 'id' || /^-+$/.test(m[1])) continue;
  const id = m[1];
  const aliases = m[2].split(',').map((s) => s.trim()).filter(Boolean);
  if (registry.has(id)) errors.push(`registry: duplicate row for "${id}"`);
  registry.set(id, aliases);
}
if (registry.size === 0) errors.push('registry: no rows parsed from the table');

// --- guide frontmatter
const guides = new Map();
for (const f of readdirSync(guidesDir).filter((f) => f.endsWith('.md'))) {
  // A UTF-8 BOM is invisible in an editor; without stripping it the `^---` anchor misses and the
  // guide is reported as having no frontmatter (and its registry row as having no guide).
  const text = readFileSync(join(guidesDir, f), 'utf8').replace(/^\uFEFF/, '');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    errors.push(`${f}: missing YAML frontmatter`);
    continue;
  }
  // Frontmatter accessors. Both are deliberately line-local: `\s*` around the value would
  // match across newlines, so a key with an empty value would silently capture the next line.
  const fmLines = fm[1].split('\n').map((l) => l.replace(/\r$/, ''));
  // A duplicated top-level key is ambiguous: this reader would validate one value while a YAML
  // parser (or the skill) may read the other, so a status or alias guard could be bypassed.
  const keyCount = new Map();
  for (const l of fmLines) {
    const km = l.match(/^([A-Za-z_][A-Za-z0-9_-]*):/);
    if (km) keyCount.set(km[1], (keyCount.get(km[1]) || 0) + 1);
  }
  for (const [k, n] of keyCount) if (n > 1) errors.push(`${f}: duplicate frontmatter key "${k}" (${n} times) — keep exactly one`);
  const keyLine = (k) => fmLines.findIndex((l) => l.startsWith(`${k}:`));
  const unquote = (s) => s.trim().replace(/^["']|["']$/g, '').trim();
  // Read a plain or quoted YAML scalar the way YAML does: a quoted value ends at its closing
  // quote, and in a plain value " #" starts a comment.
  const scalar = (s) => {
    const v = s.trim();
    if (v[0] === '"' || v[0] === "'") {
      const end = v.indexOf(v[0], 1);
      if (end > 0) return v.slice(1, end).trim();
    }
    return v.replace(/[ \t]+#.*$/, '').trim();
  };
  const get = (k) => {
    const i = keyLine(k);
    if (i === -1) return undefined;
    const v = scalar(fmLines[i].slice(k.length + 1));
    return v === '' ? undefined : v;
  };
  // A list key may be written inline (`aliases: [a, b]`) or as a YAML block list (`aliases:`
  // followed by `- a` lines). Both are valid YAML and equally readable to the skill, which is
  // the guide's actual runtime consumer, so accept either form.
  const getList = (k) => {
    const i = keyLine(k);
    if (i === -1) return [];
    const inline = fmLines[i].slice(k.length + 1).trim().replace(/\][ \t]+#.*$/, ']');
    if (inline !== '')
      return inline.replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);
    const items = [];
    for (let j = i + 1; j < fmLines.length; j++) {
      const item = fmLines[j].match(/^[ \t]*-[ \t]+(.*)$/);
      if (!item) break;
      const v = unquote(item[1]);
      if (v) items.push(v);
    }
    return items;
  };
  const id = get('model');
  if (!id) {
    errors.push(`${f}: missing "model:" in frontmatter`);
    continue;
  }
  if (f !== `${id}.md`) errors.push(`${f}: filename does not match model id "${id}"`);
  const aliases = getList('aliases');
  // `family:` stays presence-checked as frontmatter documentation; no check keys on its value.
  for (const key of ['vendor', 'family']) {
    if (!get(key)) errors.push(`${f}: missing "${key}:" in frontmatter`);
  }
  const lastVerified = get('last_verified');
  if (!lastVerified || !isCalendarDate(lastVerified))
    errors.push(`${f}: missing or malformed last_verified (expected a real YYYY-MM-DD calendar date)`);
  else if (utcDay(lastVerified) > today + DAY_MS)
    errors.push(`${f}: last_verified ${lastVerified} is in the future (today is ${todayIso}) — a guide cannot have been verified in the future; a future date also hides the guide from the age report and from --strict-age`);
  const status = get('status');
  if (!status) errors.push(`${f}: missing "status:" (expected current|legacy)`);
  else if (status !== 'current' && status !== 'legacy')
    errors.push(`${f}: invalid status "${status}" (expected current|legacy)`);
  const successor = get('successor');
  if (successor && status !== 'legacy') errors.push(`${f}: successor set but status is not legacy`);

  // Body schema: the six sections, in order, exactly as CLAUDE.md documents them.
  const EXPECTED_SECTIONS = [
    '## Reasoning / Thinking',
    '## Prompting-Stil',
    '## Stärken & Schwächen (prompt-relevant)',
    '## Output- & Format-Konventionen',
    '## Migrations-Hinweise',
    '## Quellen',
  ];
  const sections = (text.match(/^## .+$/gm) || []).map((s) => s.trim());
  if (sections.join('\n') !== EXPECTED_SECTIONS.join('\n'))
    errors.push(`${f}: section headings do not match the schema exactly, in order\n    got:      ${sections.join(' | ')}\n    expected: ${EXPECTED_SECTIONS.join(' | ')}`);

  const quellen = text.split(/^## Quellen\s*$/m)[1];
  if (!quellen || !/https?:\/\//.test(quellen)) {
    errors.push(`${f}: missing "## Quellen" section with at least one URL`);
  } else {
    for (const line of quellen.split('\n')) {
      if (/^-\s*https?:\/\//.test(line) && !line.includes(' — '))
        errors.push(`${f}: Quellen entry lacks a " — " note: ${line.trim().slice(0, 70)}`);
    }
  }

  // "(unbelegt)" is the uncertainty marker the skill keys on; near-misses silently disable it.
  const nearMiss = text.match(/\((unbeleg[a-zä]*|unbelastet)\)/g)?.filter((m) => m !== '(unbelegt)');
  if (nearMiss?.length) errors.push(`${f}: near-miss uncertainty marker(s) ${[...new Set(nearMiss)].join(', ')} — use "(unbelegt)" or unambiguous wording`);

  guides.set(id, { aliases, successor, status, lastVerified });
}

// --- exact two-way sync registry <-> guides
for (const id of registry.keys()) {
  if (!guides.has(id)) errors.push(`registry row "${id}" has no guide file`);
}
for (const [id, g] of guides) {
  if (!registry.has(id)) {
    errors.push(`guide "${id}" has no registry row`);
    continue;
  }
  const reg = new Set(registry.get(id));
  const own = new Set(g.aliases);
  for (const a of reg) if (!own.has(a)) errors.push(`${id}: registry alias "${a}" missing from guide frontmatter`);
  for (const a of own) if (!reg.has(a)) errors.push(`${id}: guide alias "${a}" missing from registry`);
  if (g.successor) {
    if (!guides.has(g.successor)) errors.push(`${id}: successor "${g.successor}" has no guide`);
    else if (guides.get(g.successor).status === 'legacy')
      errors.push(`${id}: successor "${g.successor}" is itself marked legacy`);
  }
}

// --- bare family aliases must sit on the guide they name, and on its current generation
// SKILL.md's alias policy: a bare family alias (`opus`, `sonnet`, `mistral-large`) always
// resolves to the newest guide of that family. "Bare" is read conservatively here: the alias
// carries no version/generation token at all (no digits) AND is the guide's own id stripped of
// its version tokens (its "stem"), or a trailing or leading run of it -- `opus` for
// claude-opus-5, `mistral-large` for mistral-large-3, `doubao` for doubao-seed-2-1-pro. Ids
// that glue the family name to its version (`qwen3.8-max`, `o3`) would lose that name from a
// digit-free stem, so the id's head is recovered from its first token (`qwen`) and leads the
// stem: `qwen` and `qwen-max` are both bare for qwen3.8-max. A family-level `…-latest` that
// names no generation (`mistral-large-latest`) is a rolling pointer, so it is governed by the
// same rule; a `…-latest` that names a specific generation (`grok-4-latest`, `grok-4.3-latest`)
// carries digits, so the digit test below rejects it and it stays version-pinned. Aliases that
// name a variant the id does not (`deepseek-chat` on deepseek-v3, `wenxin` on ernie-5.1) are
// not stem runs; the legacy-guide rule further down still keeps them off superseded guides.
// `status` is the primary ordering signal; version numbers in ids only break a tie between two
// CURRENT guides of the same stem, and only where they are unambiguous (see newerThan).
const tokensOf = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const headOf = (id) => (tokensOf(id)[0] || '').replace(/\d.*$/, '');
const stemOf = (id) => {
  const stem = tokensOf(id).filter((t) => !/\d/.test(t));
  const head = headOf(id);
  return head && stem[0] !== head ? [head, ...stem] : stem;
};
const trails = (a, stem) => a.length <= stem.length && a.every((t, i) => t === stem[stem.length - a.length + i]);
const leads = (a, stem) => a.length < stem.length && a.every((t, i) => t === stem[i]);
const isBareFamilyAlias = (alias, id) => {
  const a = tokensOf(alias);
  if (!a.length || a.some((t) => /\d/.test(t))) return false;
  const stem = stemOf(id);
  return trails(a, stem) || trails(a, [...stem, 'latest']) || leads(a, stem);
};

// A bare alias must sit on a guide whose own stem it names. `family:` is a vendor-wide bucket
// (Claude covers opus, sonnet, haiku AND fable; GPT covers gpt-5, sol, terra), so the
// legacy-placement check below cannot tell an alias's rightful owner from its bucket-mates:
// on its own it would accept `opus` parked on claude-haiku-4-5, and `opus <target>` would then
// silently load the Haiku guide. Inverting the predicate over every guide closes that.
const stemOwners = (alias) => [...guides.keys()].filter((cand) => isBareFamilyAlias(alias, cand));
for (const [id, g] of guides) {
  for (const alias of g.aliases) {
    const owners = stemOwners(alias);
    if (!owners.length || owners.includes(id)) continue;
    const targets = owners.filter((o) => guides.get(o).status === 'current');
    errors.push(
      `${id}: bare family alias "${alias}" names another guide's stem, not its own\n` +
      `    "${alias}" is the family shorthand for ${owners.map((o) => `${o}.md`).join(', ')}, so on ${id}.md it silently\n` +
      `    resolves "${alias}" to the wrong model\n` +
      `    fix: delete "${alias}" from ${id}.md aliases AND its registry row, then add it to ` +
      (targets.length
        ? `${targets.map((t) => `${t}.md`).join(' or ')} and that guide's registry row`
        : `whichever of those guides is status: current (none is today) and that guide's registry row`)
    );
  }
}
// The other half of the rule: a bare family alias must follow its family's newest generation,
// so it may not sit on a superseded guide. This is keyed on the guides themselves, never on the
// free-text `family:` field -- a casing drift there (`Claude` -> `claude`) would split the bucket
// and silently disarm the guard for exactly the guide a new generation just superseded.
// `stemOwners` already derives an alias's rightful owners from the ids, so a legacy guide fails
// precisely when one of its own stem kin is status: current.
// An ALL-LEGACY family passes on purpose: a bare alias resolves to the newest guide of its
// family, so with no current stem kin it is already on the newest one and there is no valid
// target to move it to -- failing there would be an unfixable false positive.
for (const [id, g] of guides) {
  if (g.status !== 'legacy') continue;
  for (const alias of g.aliases) {
    if (!isBareFamilyAlias(alias, id)) continue;
    // Fall back to the alias's own stem kin, never to every current guide in the vendor
    // bucket: offering "claude-haiku-4-5.md or claude-opus-5.md" for `opus` would walk the
    // maintainer straight into the mis-placement the check above exists to catch.
    const kin = stemOwners(alias).filter((o) => guides.get(o).status === 'current');
    if (!kin.length) continue;
    const targets = guides.get(g.successor)?.status === 'current' ? [g.successor] : kin;
    errors.push(
      `${id}: bare family alias "${alias}" sits on a status: legacy guide\n` +
      `    fix: delete "${alias}" from ${id}.md aliases AND its registry row, then add it to ` +
      `${targets.map((t) => `${t}.md`).join(' or ')} and that guide's registry row\n` +
      `    (if the old generation still needs a name, leave a version-pinned alias on ${id})`
    );
  }
}

// A new generation added WITHOUT demoting the old guide leaves two current guides of one stem,
// and the legacy rule above cannot see a bare alias left on (or moved back to) the older one.
// So among CURRENT guides of the same stem (same tier: qwen3.8-max is not compared with
// qwen3.8-flash, nor doubao-seed-2-1-pro with a Lite or Turbo tier), the bare alias must sit on
// the newest. Two exceptions keep this free of false positives:
// - The vendor's rolling pointer decides. When the alias has a rolling `<alias>-latest` partner
//   (`mistral-large` / `mistral-large-latest`), both must sit on the same guide, and no version
//   comparison runs: under the alias policy (CLAUDE.md, SKILL.md) a preview-only new generation
//   keeps pinned aliases while the vendor still points `…-latest` at the previous one.
// - Version numbers are compared only when unambiguous: read as integers and as decimal
//   fractions, the two orderings must agree. grok-4.20 vs grok-4.7 disagree (20 > 7, but
//   .20 < .7), so that pair is never called "newer" either way.
const versionParts = (id) => id.match(/\d+/g) || [];
const compareParts = (a, b, minor) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    const d = i > 0 && minor ? Number(`0.${a[i]}`) - Number(`0.${b[i]}`) : Number(a[i]) - Number(b[i]);
    if (d) return Math.sign(d);
  }
  return 0;
};
// 1 when x is unambiguously newer than y, -1 when older, 0 when equal or ambiguous.
const newerThan = (x, y) => {
  const asInt = compareParts(versionParts(x), versionParts(y), false);
  const asDec = compareParts(versionParts(x), versionParts(y), true);
  return asInt === asDec ? asInt : 0;
};
const sameStem = (x, y) => stemOf(x).join('-') === stemOf(y).join('-');
const aliasHome = new Map();
for (const [gid, g] of guides) for (const a of g.aliases) aliasHome.set(tokensOf(a).join('-'), gid);
for (const [id, g] of guides) {
  if (g.status !== 'current') continue;
  for (const alias of g.aliases) {
    const toks = tokensOf(alias);
    if (toks[toks.length - 1] === 'latest' || !isBareFamilyAlias(alias, id)) continue;
    const pointer = [...toks, 'latest'].join('-');
    if (aliasHome.has(pointer)) {
      const home = aliasHome.get(pointer);
      if (home !== id)
        errors.push(
          `${id}: bare family alias "${alias}" and its rolling partner "${pointer}" sit on different guides (${id}.md, ${home}.md)\n` +
          `    the vendor's …-latest pointer decides where the family alias resolves: move "${alias}" to ${home}.md\n` +
          `    (or move both, if the vendor now points "${pointer}" at ${id}), in the guides AND the registry rows`
        );
      continue;
    }
    const newer = [...guides]
      .filter(([o, og]) => o !== id && og.status === 'current' && sameStem(o, id) && newerThan(o, id) > 0)
      .map(([o]) => o);
    if (newer.length)
      errors.push(
        `${id}: bare family alias "${alias}" sits on an older current guide; ${newer.map((o) => `${o}.md`).join(', ')} ` +
        `${newer.length > 1 ? 'are newer current guides' : 'is a newer current guide'} of the same stem\n` +
        `    fix: stamp ${id}.md "status: legacy" + "successor: ${newer[0]}" and move "${alias}" to the newest guide\n` +
        `    (guide AND registry row). Only exception (alias policy): the newer guide is preview-only and the vendor's\n` +
        `    rolling "${alias}-latest" still points at ${id} -- then list "${alias}-latest" next to "${alias}" on ${id}`
      );
  }
}

// Not every rolling family pointer is a stem run (`wenxin` on ernie-5.1, `meta-muse-spark` on
// muse-spark-1.3, `grok-code-fast` on grok-build-0.1), so the stem rules above cannot see one
// left behind when its guide is superseded. Rule of thumb that needs no stem heuristic: a
// digit-free alias names no generation, so it must not stay on a status: legacy guide -- unless
// it is a vendor API string pinned to exactly that old model, which is listed here on purpose.
const PINNED_DIGIT_FREE = new Set(['deepseek-chat', 'deepseek-reasoner']);
for (const [id, g] of guides) {
  if (g.status !== 'legacy') continue;
  for (const alias of g.aliases) {
    if (/\d/.test(alias) || isBareFamilyAlias(alias, id) || PINNED_DIGIT_FREE.has(alias.toLowerCase())) continue;
    errors.push(
      `${id}: digit-free alias "${alias}" sits on a status: legacy guide and is not a listed pinned vendor string\n` +
      `    a digit-free alias names no generation, so it follows the family: move it to ${g.successor ? `${g.successor}.md` : 'the current guide'} ` +
      `(guide AND registry row), or -- if it is a vendor id pinned to this exact model -- add it to PINNED_DIGIT_FREE in scripts/check-registry-sync.mjs`
    );
  }
}

// --- token invariants the resolver depends on
const claimedBy = new Map();
for (const [id, aliases] of registry) {
  if (/\s/.test(id)) errors.push(`registry id "${id}" contains whitespace (can never match)`);
  const row = new Set();
  for (const a of aliases) {
    if (/\s/.test(a)) errors.push(`${id}: alias "${a}" contains whitespace (can never match)`);
    const key = a.toLowerCase();
    if (key === id.toLowerCase()) errors.push(`${id}: alias "${a}" duplicates its own id`);
    if (row.has(key)) errors.push(`${id}: duplicate alias "${a}" within the row`);
    row.add(key);
  }
  for (const tok of [id.toLowerCase(), ...row]) {
    const owner = claimedBy.get(tok);
    if (owner && owner !== id) errors.push(`token "${tok}" is claimed by both "${owner}" and "${id}"`);
    claimedBy.set(tok, id);
  }
}

if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}

// --- guide-age report: advisory by default, a gate under --strict-age.
// The skill warns users once a guide is more than 180 days old; this gives the maintainer a head start.
const AGE_WARN_DAYS = 150;
const AGE_STALE_DAYS = 180;
// Dates, `today` included, are resolved and validated at the top of the file: every
// last_verified here is a real calendar date at or before today, so no age can be negative.
const strictAge = process.argv.slice(2).includes('--strict-age');
const ages = [...guides]
  .map(([id, g]) => ({ id, lastVerified: g.lastVerified, age: Math.floor((today - utcDay(g.lastVerified)) / 86400000) }))
  .sort((a, b) => b.age - a.age);
const aging = ages.filter((a) => a.age > AGE_WARN_DAYS);
const crossingSoon = aging.filter((a) => a.age < AGE_STALE_DAYS).length;
for (const a of aging) {
  const past = a.age >= AGE_STALE_DAYS ? ` — already past the ${AGE_STALE_DAYS}-day line the skill warns users at` : '';
  console.error(
    `${strictAge ? 'FAIL' : 'WARN'}: ${a.id}: last_verified ${a.lastVerified} is ${a.age} days old${past}; re-verify against the vendor docs and bump last_verified`
  );
}
const oldest = ages[0];
console.log(
  `AGE: ${ages.length} guides, oldest ${oldest.age} days (${oldest.id}, ${oldest.lastVerified}); ` +
  `${aging.length} over ${AGE_WARN_DAYS} days; ${crossingSoon} will cross ${AGE_STALE_DAYS} days within 30 days.`
);
if (strictAge && aging.length) {
  console.error(`\n${aging.length} guide(s) past the ${AGE_WARN_DAYS}-day age line (--strict-age).`);
  process.exit(1);
}

const aliasCount = [...registry.values()].reduce((n, a) => n + a.length, 0);
console.log(`OK: ${registry.size} models, ${aliasCount} aliases — registry and guides are in sync.`);

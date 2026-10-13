#!/usr/bin/env node
// Validates every skills/*/SKILL.md frontmatter block on three axes that
// `claude plugin validate` does not cover: (1) every key is a real Claude Code
// frontmatter key -- a typo'd key is silently ignored at runtime, so it must fail
// here; (2) the frontmatter POLICY CLAUDE.md declares for this repo (pinned model --
// the latest Opus, cross-checked against the migrate-prompt registry -- no effort, no
// allowed-tools/disallowed-tools, the OpenCode metadata keys, both skills in sync);
// (3) the Agent Skills open standard's constraints on the six portable fields.
// The YAML is parsed with deliberate line handling (top-level `key: value`, wrapped
// plain scalars, block scalars `|`/`>`, flow lists `[a, b]`) so the check stays
// dependency-free.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, 'skills');

const errors = [];
const notes = [];

// Every frontmatter key Claude Code recognises in a SKILL.md.
const KNOWN_KEYS = [
  'name',
  'description',
  'when_to_use',
  'argument-hint',
  'arguments',
  'disable-model-invocation',
  'user-invocable',
  'allowed-tools',
  'disallowed-tools',
  'model',
  'effort',
  'context',
  'agent',
  'background',
  'hooks',
  'paths',
  'shell',
  'metadata',
  'license',
  'compatibility',
];

// The Agent Skills open standard (agentskills.io/specification) defines exactly these
// six. Outside Claude Code -- a claude.ai upload, the Skills API -- any other key is a
// hard error rather than an ignored extra, which is what the NOTE below documents.
const SPEC_FIELDS = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];

const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_COMPATIBILITY = 500;
// Mirrors Claude Code's documented per-entry skill-listing cap: the combined
// `description` + `when_to_use` text is truncated at 1,536 characters in the skill
// listing (https://code.claude.com/docs/en/skills, frontmatter table). Both skills set
// disable-model-invocation, so their description never enters the model's listing --
// hence advisory only (reported via NOTE); it must never fail the build.
const MAX_LISTING = 1536;

// The pinned model (CLAUDE.md, Skill Frontmatter Policy: "Keep this current with the latest
// Opus on each release"). Change this constant, the policy text and BOTH skills in one commit.
// It is also cross-checked against the migrate-prompt registry below: the bare `opus` alias
// must resolve to this id and its guide must be status: current, so a new Opus generation
// landing in the registry flags a pin that was left behind, and a typo'd pin cannot pass.
const PINNED_MODEL = 'claude-opus-5-5';
// OpenCode's equivalents of user-invocable + disable-model-invocation
// (https://opencode.ai/docs/skills/), as quoted strings -- the portable form of metadata values.
const REQUIRED_METADATA = { 'opencode/slash': 'true', 'opencode/autoinvoke': 'false' };
const BOM = 0xfeff;

// Keys this check reads as plain strings. A flow list or an indented block here
// would either coerce silently (String(['optimize-prompt']) === 'optimize-prompt',
// so a bogus `name: [optimize-prompt]` would pass clean) or throw on a string
// method, so the shape itself is rejected before any value check runs.
const SCALAR_ONLY = [
  'name',
  'description',
  'when_to_use',
  'license',
  'compatibility',
  'model',
  'disable-model-invocation',
  'user-invocable',
];

function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function stripQuotes(s) {
  return /^"[\s\S]*"$/.test(s) || /^'[\s\S]*'$/.test(s) ? s.slice(1, -1) : s;
}

// Minimal YAML: enough for the shapes a SKILL.md frontmatter actually uses.
function parseFrontmatter(text) {
  const body = text.charCodeAt(0) === BOM ? text.slice(1) : text;
  const lines = body.split(/\r?\n/);
  // A delimiter may carry trailing whitespace ("--- ") and is still a delimiter.
  const isDelimiter = (line) => line !== undefined && line.trimEnd() === '---';
  if (!isDelimiter(lines[0])) return null;
  const end = lines.findIndex((line, i) => i > 0 && isDelimiter(line));
  if (end === -1) return null;
  const fields = new Map();
  const order = [];
  const malformed = [];
  // The key an indented continuation line belongs to. Block (`|`/`>`) and nested
  // bodies are swallowed by their own loops below, so the only thing that can still
  // reach the top of this loop indented is the wrapped tail of a plain scalar.
  let lastKey = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (line.trim() === '' || /^\s*#/.test(line)) continue;
    if (/^[ \t]/.test(line)) {
      // A plain scalar may wrap onto indented continuation lines; YAML folds them
      // into the value with a single space. Dropping them instead would truncate the
      // value to its first line, so every length cap and charset check downstream
      // would measure only that line -- a value well over the cap passing clean.
      const prev = lastKey === null ? undefined : fields.get(lastKey);
      if (prev && prev.kind === 'scalar') {
        prev.raw = `${prev.raw} ${line.trim()}`;
        prev.value = stripQuotes(prev.raw);
        prev.quoted = prev.raw !== prev.value;
      }
      continue;
    }
    const km = line.match(/^([A-Za-z_][A-Za-z0-9_.-]*):[ \t]*(.*)$/);
    if (!km) {
      malformed.push(line);
      lastKey = null; // an unparseable line owns no continuation
      continue;
    }
    const key = km[1];
    const raw = km[2].trim();
    const indented = () => i + 1 < end && (lines[i + 1].trim() === '' || /^[ \t]/.test(lines[i + 1]));
    let kind = 'scalar';
    let value = raw;
    const nested = []; // the raw lines (indentation intact) of a nested block
    if (/^[|>][+-]?\d*$/.test(raw)) {
      kind = 'block';
      const block = [];
      while (indented()) block.push(lines[++i].replace(/^[ \t]+/, ''));
      value = block.join('\n').trim();
    } else if (raw.startsWith('[')) {
      kind = 'flow';
      value = raw
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => stripQuotes(s.trim()))
        .filter(Boolean);
    } else if (raw === '') {
      kind = 'nested'; // key with an indented block beneath it (e.g. a metadata map)
      while (indented()) nested.push(lines[++i]);
      value = nested.join('\n').trim();
    } else {
      value = stripQuotes(raw);
    }
    if (fields.has(key)) malformed.push(`duplicate key "${key}"`);
    else order.push(key);
    fields.set(key, { raw, value, kind, quoted: raw !== stripQuotes(raw), nested });
    lastKey = key;
  }
  return { fields, order, malformed };
}

// --- collect the skills
const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
  .map((d) => d.name)
  .sort();

if (skillDirs.length === 0) {
  console.error('FAIL: no skills/*/SKILL.md found under ' + skillsDir);
  process.exit(1);
}

// An unexpected throw must be reported against the file that caused it -- a bare stack
// trace tells the maintainer nothing, and it would skip every skill still unchecked.
function reportThrow(rel, err) {
  errors.push(`${rel}: internal check error — ${err && err.message ? err.message : String(err)}`);
}

const parsed = new Map();
for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  try {
    const fm = parseFrontmatter(readFileSync(join(skillsDir, dir, 'SKILL.md'), 'utf8'));
    if (!fm) {
      errors.push(`${rel}: missing or malformed YAML frontmatter (expected a leading --- ... --- block)`);
      continue;
    }
    for (const bad of fm.malformed) errors.push(`${rel}: unparseable frontmatter line: ${bad}`);
    parsed.set(dir, { rel, ...fm });
  } catch (err) {
    reportThrow(rel, err);
  }
}

function checkSkill(dir, skill) {
  const { rel, fields, order } = skill;
  const has = (k) => fields.has(k);
  const val = (k) => (fields.get(k) || {}).value;

  // --- (0) value shape: a key read as a string must actually BE a string
  const badShape = new Set();
  for (const key of SCALAR_ONLY) {
    const f = fields.get(key);
    if (!f || f.kind === 'scalar' || f.kind === 'block') continue;
    badShape.add(key);
    if (f.kind === 'nested' && f.value === '') {
      errors.push(`${rel}: "${key}" has an empty value — it must be a plain string value`);
      continue;
    }
    const shape = f.kind === 'flow' ? `a flow sequence (${f.raw})` : 'an indented block';
    errors.push(`${rel}: "${key}" must be a plain string value, not ${shape}`);
  }

  // --- (0b) YAML 1.2.2 section 7.3.3: a plain scalar never contains ": " or " #".
  // ": " (or a value-ending ":") is a parse error -- the runtime then loads the skill with NO
  // frontmatter fields; " #" starts a comment -- the runtime silently truncates the value this
  // script measures. Checked on the FOLDED value, so wrapped continuation lines are covered.
  for (const [key, f] of fields) {
    if (f.kind !== 'scalar' || f.quoted) continue;
    if (/:([ \t]|$)/.test(f.raw))
      errors.push(`${rel}: "${key}" is an unquoted value containing ": " — YAML cannot parse it and the skill would load with no frontmatter; quote the value`);
    if (/[ \t]#/.test(f.raw))
      errors.push(`${rel}: "${key}" is an unquoted value containing " #" — YAML reads the rest as a comment; quote the value, or move the comment to its own line`);
  }

  // --- (1) unknown keys, with a "did you mean" when it is a near miss
  for (const key of order) {
    if (KNOWN_KEYS.includes(key)) continue;
    const near = KNOWN_KEYS.map((k) => [k, editDistance(key, k)])
      .filter(([, d]) => d <= 2)
      .sort((a, b) => a[1] - b[1])[0];
    errors.push(
      `${rel}: unknown frontmatter key "${key}"` +
        (near ? ` — did you mean "${near[0]}"?` : ' — not a Claude Code frontmatter key'),
    );
  }

  // --- (2) this repo's frontmatter policy, as declared in CLAUDE.md
  for (const [key, expected] of [
    ['disable-model-invocation', 'true'],
    ['user-invocable', 'true'],
  ]) {
    if (!has(key)) errors.push(`${rel}: policy requires "${key}: ${expected}" (key is missing)`);
    else if (!badShape.has(key) && String(val(key)) !== expected)
      errors.push(`${rel}: policy requires "${key}: ${expected}" (found "${val(key)}")`);
    // A quoted "true" is a YAML STRING, not the boolean; whether Claude Code honours it is
    // undocumented, so the policy key could silently stop doing its job.
    else if (!badShape.has(key) && fields.get(key).quoted)
      errors.push(`${rel}: "${key}" must be the YAML boolean ${expected}, not a quoted string (found ${fields.get(key).raw})`);
  }
  if (has('effort'))
    errors.push(`${rel}: policy forbids "effort" — the skills deliberately inherit the session effort level`);
  const TOOL_POLICY = {
    'allowed-tools': 'it pre-approves rather than restricts tools, so it documents nothing here',
    'disallowed-tools': 'it restricts tools only for the invoking turn (clears on the next message); omitted by policy, see CLAUDE.md',
  };
  for (const [key, why] of Object.entries(TOOL_POLICY)) {
    if (has(key)) errors.push(`${rel}: policy forbids "${key}" — ${why}`);
  }
  if (!has('model')) errors.push(`${rel}: policy requires a pinned "model"`);
  else if (!badShape.has('model') && val('model') !== PINNED_MODEL)
    errors.push(
      `${rel}: policy pins "model: ${PINNED_MODEL}" (found "${val('model')}") — change CLAUDE.md, PINNED_MODEL in this script and both skills together`,
    );
  if (!has('argument-hint')) errors.push(`${rel}: policy requires "argument-hint"`);
  else if (!fields.get('argument-hint').quoted)
    errors.push(
      `${rel}: "argument-hint" must be quoted in the YAML source so it parses as a string, not a flow sequence (found: ${fields.get('argument-hint').raw})`,
    );
  // license: present and non-empty (policy). compatibility: present (policy); its 1-500
  // character range is the spec's own rule and is checked in section (3).
  if (!has('license')) errors.push(`${rel}: policy requires "license"`);
  else if (!badShape.has('license') && !String(val('license')).trim())
    errors.push(`${rel}: policy requires a non-empty "license"`);
  if (!has('compatibility')) errors.push(`${rel}: policy requires "compatibility"`);
  // metadata: the OpenCode keys that carry the invocation policy on that host.
  const policyMeta = fields.get('metadata');
  if (!policyMeta) {
    errors.push(
      `${rel}: policy requires "metadata" with ${Object.entries(REQUIRED_METADATA).map(([k, v]) => `${k}: "${v}"`).join(' and ')} (block form)`,
    );
  } else if (policyMeta.kind === 'nested') {
    const entries = new Map();
    for (const line of policyMeta.nested) {
      const m = line.match(/^[ \t]+([^:#\s][^:]*?):[ \t]*(.*?)[ \t]*$/);
      if (m) entries.set(m[1], m[2]);
    }
    for (const [k, v] of Object.entries(REQUIRED_METADATA)) {
      const got = entries.get(k);
      if (got === undefined) errors.push(`${rel}: policy requires metadata entry '${k}: "${v}"' (missing)`);
      else if (!new RegExp(`^(["'])${v}\\1$`).test(got))
        errors.push(`${rel}: policy requires metadata entry '${k}: "${v}"' as a quoted string (found ${k}: ${got})`);
    }
  } // a non-map metadata value is reported by the spec check in section (3)

  // --- (3) Agent Skills spec constraints
  const name = val('name');
  if (badShape.has('name')) {
    // shape already reported; its value cannot be checked as a name
  } else if (!has('name') || !String(name).trim()) {
    errors.push(`${rel}: "name" is required`);
  } else {
    if (name.length > MAX_NAME) errors.push(`${rel}: name is ${name.length} chars (max ${MAX_NAME})`);
    if (!/^[a-z0-9-]+$/.test(name))
      errors.push(`${rel}: name "${name}" may contain only lowercase a-z, 0-9 and hyphens`);
    if (name.startsWith('-') || name.endsWith('-'))
      errors.push(`${rel}: name "${name}" must not start or end with a hyphen`);
    if (name.includes('--')) errors.push(`${rel}: name "${name}" must not contain consecutive hyphens`);
    if (name !== dir) errors.push(`${rel}: name "${name}" must equal the parent directory name "${dir}"`);
  }

  const readable = (k) => (has(k) && !badShape.has(k) ? String(val(k)) : '');

  const description = readable('description');
  if (badShape.has('description')) {
    // shape already reported
  } else if (!description.trim()) errors.push(`${rel}: "description" is required and must be non-empty`);
  else if (description.length > MAX_DESCRIPTION)
    errors.push(`${rel}: description is ${description.length} chars (max ${MAX_DESCRIPTION})`);

  const compatibility = readable('compatibility');
  if (has('compatibility') && !badShape.has('compatibility') && !compatibility.trim())
    errors.push(`${rel}: compatibility must be 1-${MAX_COMPATIBILITY} characters if provided (Agent Skills spec) — it is empty`);
  if (compatibility.length > MAX_COMPATIBILITY)
    errors.push(`${rel}: compatibility is ${compatibility.length} chars (max ${MAX_COMPATIBILITY})`);

  // metadata: the spec allows "a map from string keys to string values"; Claude Code drops a
  // value that is not a map. Unquoted plain strings pass (the spec's own `author: example-org`);
  // a YAML number, boolean or null, a nested map, a list or an empty value does not.
  const meta = fields.get('metadata');
  if (meta && meta.kind !== 'nested') {
    errors.push(`${rel}: "metadata" must be an indented map of string keys to string values (found: ${meta.raw})`);
  } else if (meta) {
    const entries = meta.nested.filter((l) => l.trim() !== '' && !/^\s*#/.test(l));
    if (!entries.length) errors.push(`${rel}: "metadata" is empty — it must be an indented map of string keys to string values`);
    const indentOf = (l) => l.match(/^[ \t]*/)[0].length;
    const base = Math.min(...entries.map(indentOf));
    const NON_STRING =
      /^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*(\.\d*)?|\.\d+)([eE][-+]?\d+)?|[-+]?\.(inf|nan)|0x[0-9a-f]+|0o[0-7]+)$/i;
    for (const line of entries) {
      const m = line.match(/^[ \t]*([^:#\s][^:]*?):(?:[ \t]+(.*?))?[ \t]*$/);
      const v = m && m[2] !== undefined ? m[2] : '';
      const quoted = /^"[\s\S]*"$/.test(v) || /^'[\s\S]*'$/.test(v);
      if (!m || indentOf(line) > base || v === '' || /^[[{|>&*!-]/.test(v) || (!quoted && NON_STRING.test(v)))
        errors.push(
          `${rel}: metadata entry "${line.trim()}" is not a string value — quote it (e.g. version: "1.0"); the spec allows string values only`,
        );
    }
  }

  // Advisory only: Claude Code's documented 1,536-char skill-listing cap (see MAX_LISTING).
  const whenToUse = readable('when_to_use');
  const listing = description.length + whenToUse.length;
  if (listing > MAX_LISTING)
    notes.push(
      `${rel}\n` +
        `    combined description + when_to_use is ${listing} chars (Claude Code truncates a skill-listing entry at ${MAX_LISTING} chars; keep the key use case first)`,
    );

  // --- informational portability note (a known limitation, not a defect)
  const usedSpec = SPEC_FIELDS.filter((k) => has(k));
  const ccOnly = order.filter((k) => KNOWN_KEYS.includes(k) && !SPEC_FIELDS.includes(k));
  notes.push(
    `${rel}\n` +
      `    Agent Skills spec fields used: ${usedSpec.length ? usedSpec.join(', ') : '(none)'}\n` +
      `    Claude-Code-only keys (a claude.ai upload or the Skills API hard-errors on these): ${ccOnly.length ? ccOnly.join(', ') : '(none)'}`,
  );
}

for (const [dir, skill] of parsed) {
  try {
    checkSkill(dir, skill);
  } catch (err) {
    reportThrow(skill.rel, err);
  }
}

// --- both skills must pin the SAME model
const models = new Map();
for (const [dir, skill] of parsed) {
  const m = (skill.fields.get('model') || {}).value;
  if (m) models.set(dir, m);
}
const distinct = new Set(models.values());
if (distinct.size > 1)
  errors.push(
    `model must be identical across all skills — found ${[...models].map(([d, m]) => `${d}=${m}`).join(', ')}`,
  );

// --- the pin must be the LATEST Opus: the migrate-prompt registry (the resolver's source of
// truth, kept in sync with the guides by check-registry-sync.mjs) resolves the bare `opus` alias
// to the newest Opus guide, and that guide must be status: current.
try {
  const registryPath = join(skillsDir, 'migrate-prompt', 'SKILL.md');
  const block = readFileSync(registryPath, 'utf8').match(/<!-- BEGIN model-registry[\s\S]*?<!-- END model-registry -->/);
  let opusId;
  for (const line of block ? block[0].split(/\r?\n/) : []) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/);
    if (m && m[2].split(',').some((a) => a.trim().toLowerCase() === 'opus')) opusId = m[1];
  }
  if (!block) errors.push('skills/migrate-prompt/SKILL.md: model-registry BEGIN/END markers not found — cannot verify the model pin is the latest Opus');
  else if (!opusId) errors.push('skills/migrate-prompt/SKILL.md: no registry row carries the bare alias "opus" — cannot verify the model pin is the latest Opus');
  else {
    if (opusId !== PINNED_MODEL)
      errors.push(
        `model pin "${PINNED_MODEL}" is not the latest Opus: the migrate-prompt registry resolves "opus" to "${opusId}"\n` +
          '    update the pin in both skills, PINNED_MODEL in this script and the CLAUDE.md policy line together',
      );
    const guide = join(skillsDir, 'migrate-prompt', 'model-guides', `${opusId}.md`);
    const status = existsSync(guide) ? (readFileSync(guide, 'utf8').match(/^status:[ \t]*["']?([a-z]+)/m) || [])[1] : undefined;
    if (status !== 'current')
      errors.push(
        `skills/migrate-prompt/model-guides/${opusId}.md: the guide the bare "opus" alias resolves to must be status: current (found ${status === undefined ? 'no guide/status' : `"${status}"`})`,
      );
  }
} catch (err) {
  reportThrow('skills/migrate-prompt/SKILL.md (model-pin cross-check)', err);
}

for (const n of notes) console.log('NOTE: ' + n);

if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(
  `OK: ${parsed.size} skill(s) — frontmatter keys, repo policy${distinct.size === 1 ? ` (model ${[...distinct][0]})` : ''}, and Agent Skills spec constraints all pass.`,
);

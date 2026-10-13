#!/usr/bin/env node
// Verifies the invariant CLAUDE.md declares under Portability: both skills/*/SKILL.md
// bodies carry two blocks that must stay WORD-FOR-WORD identical across the skills --
// (1) the `<user-input>` wrapper, i.e. the tags with $ARGUMENTS alone inside plus the
// paragraph naming the tags as the boundary of the user's raw input, and (2) the Depth
// Calibration effort fallback. Each SKILL.md has to stand alone on a host that loads only
// that one file, so the text is duplicated by hand -- and nothing but this check stops one
// copy from drifting when the other is edited.
//
// SCOPE, stated honestly: the comparison proves only that the copies AGREE -- a coordinated
// wrong edit to both files compares equal. On top of it, each skill is checked for the few
// textual invariants a coordinated edit could break without any reasoning being needed:
//   (a) `$ARGUMENTS` occurs exactly once in the body (every occurrence is substituted, and an
//       indexed form such as `$ARGUMENTS[0]` would carry only part of the input);
//   (b) the body holds the three lines `<user-input>`, `$ARGUMENTS`, `</user-input>` -- the
//       placeholder alone between the tags;
//   (c) exactly one line reads `Current session effort: ` + the backticked ${CLAUDE_EFFORT}
//       placeholder + `.` -- the "effort line above" the fallback refers to;
//   (d) the fallback names neither placeholder literally (a literal placeholder in the test
//       sentence would itself be substituted -- in a `low` session the rule would then read
//       "if the effort line is `low`, treat it as `high`") and names all five levels.
// Whether the fallback's reasoning is RIGHT stays a human review job.
//
// Anchoring is on the block text itself -- an opening `<user-input>` line, the phrase that
// opens the fallback sentence -- and never on line numbers: the blocks sit at different
// offsets in the two files and must survive either Depth Calibration list gaining a line.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, 'skills');

const errors = [];

// Each block is anchored by a start marker and runs through the end of its paragraph or list
// item: from the first `.` that closes a word (followed by whitespace or EOF) on, up to the next
// blank line, list bullet or heading. A sentence appended to one copy is therefore part of the
// compared block, and a literal end marker would report a reworded tail as "block missing"
// instead of showing it as the drift it is.
const BLOCKS = [
  {
    label: '<user-input> wrapper',
    // The opening tag on a line of its own -- the same string appears inside the sentence
    // below it in backticks, and that occurrence must not be mistaken for the block start.
    start: /^<user-input>$/gm,
    startLabel: 'a line reading exactly `<user-input>`',
  },
  {
    label: 'effort fallback',
    start: /If the effort line above reads/g,
    startLabel: 'the phrase "If the effort line above reads"',
  },
];

// The placeholders, assembled so that this file never contains them verbatim.
const ARGS = '$' + 'ARGUMENTS';
const EFFORT = '$' + '{CLAUDE_EFFORT}';
const EFFORT_LINE = 'Current session effort: `' + EFFORT + '`.';
const LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

// CRLF vs LF is a checkout artifact, not drift -- normalise it away. NOTHING else is
// normalised: the invariant is word-for-word, so indentation and spacing must still differ.
const readNormalised = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

function extract(text, block) {
  const starts = [...text.matchAll(block.start)].map((m) => m.index);
  if (starts.length === 0) return { missing: `${block.startLabel} is not present` };
  if (starts.length > 1)
    return { missing: `${block.startLabel} occurs ${starts.length} times, so the block is ambiguous` };
  const from = starts[0];
  let to = -1;
  for (let i = from; i < text.length; i++) {
    if (text[i] !== '.') continue;
    const next = text[i + 1];
    if (next === undefined || /\s/.test(next)) {
      to = i + 1;
      break;
    }
  }
  if (to === -1) return { missing: `${block.startLabel} is present but the sentence it opens never ends` };
  // Extend through the end of the paragraph / list item.
  const tail = text.slice(to).search(/\n(?:[ \t]*\n|[ \t]*[-*] |#)/);
  to = tail === -1 ? text.length : to + tail;
  return { text: text.slice(from, to), line: lineOf(text, from) };
}

// --- collect the skills (same discovery rule as check-frontmatter.mjs)
const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
  .map((d) => d.name)
  .sort();

if (skillDirs.length < 2) {
  console.error(
    `FAIL: found ${skillDirs.length} skills/*/SKILL.md under ${skillsDir} — this check compares copies across skills and needs at least 2`,
  );
  process.exit(1);
}

const skills = [];
for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  try {
    skills.push({ rel, text: readNormalised(join(skillsDir, dir, 'SKILL.md')) });
  } catch (err) {
    errors.push(`${rel}: cannot read — ${err && err.message ? err.message : String(err)}`);
  }
}

// The first skill is the reference every other one is compared against; with the two skills
// this repo ships that is a single pair, and it stays meaningful if a third skill is added.
const sizes = [];
for (const block of BLOCKS) {
  const found = new Map();
  for (const skill of skills) {
    const got = extract(skill.text, block);
    if (got.missing) {
      errors.push(
        `${skill.rel}: the "${block.label}" block is MISSING — ${got.missing}\n` +
          '    CLAUDE.md (Portability) requires this block in BOTH skills, word-for-word identical',
      );
      continue;
    }
    found.set(skill.rel, got);
  }
  if (found.size < 2) continue; // nothing left to compare against; the miss is already reported

  const [[refRel, ref], ...rest] = [...found];
  sizes.push(`${block.label} (${ref.text.split('\n').length} lines)`);
  for (const [rel, other] of rest) {
    if (other.text === ref.text) continue;
    const a = ref.text.split('\n');
    const b = other.text.split('\n');
    const i = Array.from({ length: Math.max(a.length, b.length) }, (_, k) => k).find((k) => a[k] !== b[k]);
    const show = (r, lines, start) =>
      lines[i] === undefined
        ? `    ${r}: block ends after ${lines.length} line(s) — it has no line ${i + 1}`
        : `    ${r}:${start + i}: ${JSON.stringify(lines[i])}`;
    let column = '';
    if (a[i] !== undefined && b[i] !== undefined) {
      let c = 0;
      while (c < a[i].length && c < b[i].length && a[i][c] === b[i][c]) c++;
      column = `, first differing character at column ${c + 1}`;
    }
    errors.push(
      `the "${block.label}" block differs between ${refRel} and ${rel}\n` +
        `    CLAUDE.md (Portability) requires these two copies to stay word-for-word identical\n` +
        `    first difference at block line ${i + 1}${column}:\n` +
        show(refRel, a, ref.line) +
        '\n' +
        show(rel, b, other.line),
    );
  }
}

// --- per-skill textual invariants (a)-(d); see the header comment
const count = (text, needle) => text.split(needle).length - 1;
for (const skill of skills) {
  const body = skill.text.replace(/^---\n[\s\S]*?\n---[ \t]*(?:\n|$)/, '');
  const n = count(body, ARGS);
  if (n !== 1)
    errors.push(
      `${skill.rel}: ${ARGS} occurs ${n} time(s) in the body — it must occur exactly once, alone between the <user-input> tags (every occurrence is substituted)`,
    );
  if (!/^<user-input>\n\$ARGUMENTS\n<\/user-input>$/m.test(body))
    errors.push(`${skill.rel}: ${ARGS} must sit alone between a <user-input> line and a </user-input> line`);
  const effortLines = body.split('\n').filter((l) => l === EFFORT_LINE).length;
  if (effortLines !== 1)
    errors.push(
      `${skill.rel}: expected exactly one line reading ${JSON.stringify(EFFORT_LINE)} (the effort line the fallback refers to), found ${effortLines}`,
    );
  const fallback = extract(skill.text, BLOCKS[1]);
  if (fallback.text) {
    if (fallback.text.includes(EFFORT) || fallback.text.includes(ARGS))
      errors.push(
        `${skill.rel}: the effort fallback names a substitution placeholder literally — it would itself be substituted; describe it instead (CLAUDE.md, Portability)`,
      );
    const absent = LEVELS.filter((lv) => !fallback.text.includes('`' + lv + '`'));
    if (absent.length)
      errors.push(`${skill.rel}: the effort fallback must name all five levels in backticks — missing ${absent.map((lv) => '`' + lv + '`').join(', ')}`);
  }
}

if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(
  `OK: ${skills.length} skills — ${sizes.join(' and ')} are word-for-word identical across ${skills.map((s) => s.rel).join(' and ')}; placeholder and effort-line invariants hold.`,
);

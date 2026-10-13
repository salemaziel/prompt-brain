#!/usr/bin/env node
// Verifies the facts a release depends on that are duplicated by hand across several
// files and can therefore drift silently: the version (plugin.json vs CHANGELOG.md), the
// plugin identity fields duplicated between plugin.json and the marketplace entry (the
// manifest's `version` overrides the entry's, so the entry must carry none of its own), the
// install commands the README documents, the README's assertions about the repo (the guide
// count it advertises, the relative links it points at), the relative links inside each
// SKILL.md, the SKILL.md size budget and the sizes CLAUDE.md records, and that every
// scripts/check-*.mjs is wired into CI and listed in CLAUDE.md.
// With git available it also reports skills/ content changed since the current version's
// release tag while plugin.json still carries that version -- users would never receive it.
// That is a WARN by default and a failure under --require-bump (CI passes it on push).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pluginPath = join(root, '.claude-plugin', 'plugin.json');
const marketplacePath = join(root, '.claude-plugin', 'marketplace.json');
const changelogPath = join(root, 'CHANGELOG.md');
const readmePath = join(root, 'README.md');
const claudeMdPath = join(root, 'CLAUDE.md');
const workflowPath = join(root, '.github', 'workflows', 'validate.yml');
const skillsDir = join(root, 'skills');
const guidesDir = join(skillsDir, 'migrate-prompt', 'model-guides');

const requireBump = process.argv.slice(2).includes('--require-bump');
const errors = [];
const warnings = [];
const notes = [];

// https://semver.org — the official recommended regex, minus the named groups.
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`FAIL: cannot read ${label}: ${e.message}`);
    process.exit(1);
  }
}
const readText = (path) => (existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null);

const plugin = readJson(pluginPath, '.claude-plugin/plugin.json');
const marketplace = readJson(marketplacePath, '.claude-plugin/marketplace.json');
const changelog = readText(changelogPath) ?? '';
const readme = readText(readmePath) ?? '';
const claudeMd = readText(claudeMdPath);
const workflow = readText(workflowPath);

// --- version: plugin.json vs the newest CHANGELOG heading
const version = plugin.version;
if (!version) errors.push('plugin.json has no "version"');
else if (!SEMVER.test(version)) errors.push(`plugin.json version "${version}" is not valid semver`);

const headings = [...changelog.matchAll(/^##\s*\[([^\]]+)\]/gm)].map((m) => m[1].trim());
const newest = headings.find((h) => h.toLowerCase() !== 'unreleased');
if (!newest) errors.push('CHANGELOG.md has no "## [x.y.z]" release heading');
else {
  if (!SEMVER.test(newest)) errors.push(`newest CHANGELOG heading "[${newest}]" is not valid semver`);
  if (version && newest !== version)
    errors.push(`version mismatch: plugin.json is "${version}", newest CHANGELOG heading is "[${newest}]"`);
}

// --- release drift: plugin content changed since this version's tag, version unchanged.
// Installed users only get a new copy when the version string changes
// (https://code.claude.com/docs/en/plugins/host-marketplace), so shipping changed skills/
// under an already-released version means existing users never receive them.
if (version && plugin.name) {
  const tag = `${plugin.name}--v${version}`;
  const git = (args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  let tagged = false;
  try {
    git(['rev-parse', '-q', '--verify', `refs/tags/${tag}`]);
    tagged = true;
  } catch {
    notes.push(`tag ${tag} not found (or git unavailable / shallow clone), skipping the release-drift check`);
  }
  if (tagged) {
    let changed = false;
    try {
      git(['diff', '--quiet', tag, '--', 'skills', '.claude-plugin/plugin.json']);
    } catch (e) {
      if (e.status === 1) changed = true;
      else notes.push(`git diff against ${tag} failed, skipping the release-drift check`);
    }
    let untracked = '';
    try {
      untracked = git(['ls-files', '--others', '--exclude-standard', '--', 'skills']).trim();
    } catch {
      // ignore: the diff above already covers tracked content
    }
    if (changed || untracked) {
      const msg =
        `skills/ changed since ${tag} but plugin.json version is still ${version}; bump "version" in ` +
        '.claude-plugin/plugin.json and add the matching CHANGELOG.md heading, or existing installs never receive the change';
      (requireBump ? errors : warnings).push(msg);
    }
  }
}

// --- the marketplace entry for this plugin
const entries = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
let entry = entries.find((p) => p && p.name === plugin.name);
if (!entry && entries.length === 1) entry = entries[0]; // single-entry catalog: report the name mismatch below
if (!entry) {
  errors.push(`marketplace.json has no entry for "${plugin.name}"`);
} else {
  if (entry.name !== plugin.name)
    errors.push(`name mismatch: plugin.json is "${plugin.name}", marketplace entry is "${entry.name}"`);
  if (Object.prototype.hasOwnProperty.call(entry, 'version'))
    errors.push(
      `marketplace entry carries "version": "${entry.version}" — plugin.json's version overrides it, so it is dead data that drifts unnoticed and would pin users if plugin.json ever dropped its own version`,
    );
  if (entry.description !== plugin.description)
    errors.push(
      'description differs between plugin.json and the marketplace entry\n' +
        `    plugin.json: ${JSON.stringify(plugin.description)}\n` +
        `    marketplace: ${JSON.stringify(entry.description)}`,
    );
  const a = JSON.stringify(plugin.keywords ?? null);
  const b = JSON.stringify(entry.keywords ?? null);
  if (a !== b)
    errors.push(
      'keywords differ between plugin.json and the marketplace entry\n' +
        `    plugin.json: ${a}\n    marketplace: ${b}`,
    );

  // --- install commands. The install id is the entry's `name`, an `@`, and the marketplace
  // `name` (https://code.claude.com/docs/en/plugin-marketplaces); the marketplace is added by
  // its GitHub owner/repo. A drift here surfaces only when a user tries to install.
  const repoSlug = (url) => {
    const m = String(url ?? '').match(/github\.com[/:]([^/\s]+\/[^/\s#?]+?)(?:\.git)?(?:[/#?].*)?$/);
    return m ? m[1] : null;
  };
  const pluginRepo = repoSlug(plugin.repository);
  const githubSource = entry.source && typeof entry.source === 'object' && entry.source.source === 'github';
  if (githubSource && pluginRepo && entry.source.repo !== pluginRepo)
    errors.push(`marketplace source.repo "${entry.source.repo}" does not match plugin.json repository "${plugin.repository}"`);
  // Whole-token match: "install x@tarek-plugins" must not satisfy a check for "x@tarek-plugin".
  const mentions = (text) => new RegExp(`${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`).test(readme);
  const installId = `${entry.name}@${marketplace.name}`;
  if (!mentions(`install ${installId}`))
    errors.push(`README.md: no install command for "${installId}" (expected the text "install ${installId}") — the install id is <entry name>@<marketplace name>`);
  const addSlug = githubSource ? entry.source.repo : pluginRepo;
  if (addSlug && !mentions(`marketplace add ${addSlug}`))
    errors.push(`README.md: no "marketplace add ${addSlug}" command — it must name the GitHub repository that hosts .claude-plugin/marketplace.json`);
}

// --- the guide count the README advertises
const guideCount = existsSync(guidesDir)
  ? readdirSync(guidesDir).filter((f) => f.endsWith('.md')).length
  : 0;
const claim = readme.match(/Supported\s+models\s*\(\s*(\d+)\s+guides?\s*\)/);
if (!claim) {
  errors.push(
    'README.md: could not find the "Supported models (N guides)" sentence — the guide-count assertion went missing, so nothing checks it any more',
  );
} else if (Number(claim[1]) !== guideCount) {
  errors.push(
    `README.md claims ${claim[1]} model guides, but skills/migrate-prompt/model-guides/ holds ${guideCount}`,
  );
}

// --- relative markdown links must resolve, with EXACT case: the Linux CI runner and GitHub's
// link rendering are case-sensitive even where the maintainer's filesystem is not.
function existsExactCase(baseDir, relPath) {
  let dir = baseDir;
  const parts = relPath.split('/').filter((p) => p !== '' && p !== '.');
  for (const part of parts) {
    if (part === '..') {
      dir = dirname(dir);
      continue;
    }
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      return false;
    }
    if (!names.includes(part)) return false;
    dir = join(dir, part);
  }
  return true;
}
function checkLinks(text, baseDir, label) {
  let count = 0;
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue; // absolute URL, protocol-relative, or anchor
    count++;
    let path;
    try {
      path = decodeURIComponent(target.split('#')[0].split('?')[0]);
    } catch {
      // decodeURIComponent throws URIError on a stray "%", a truncated escape, or a
      // syntactically valid escape that is not valid UTF-8. Report it like every other
      // finding instead of dying here, which would discard the errors already collected.
      errors.push(`${label}: link "${target}" is not valid percent-encoding`);
      continue;
    }
    if (!path) continue;
    if (!existsExactCase(baseDir, path))
      errors.push(`${label}: relative link "${target}" does not resolve to an existing path (exact case)`);
  }
  return count;
}
const linkCount = checkLinks(readme, root, 'README.md');

const skillDirs = existsSync(skillsDir)
  ? readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
      .map((d) => d.name)
      .sort()
  : [];
let skillLinkCount = 0;
const sizes = new Map();
for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  const text = readText(join(skillsDir, dir, 'SKILL.md'));
  skillLinkCount += checkLinks(text, join(skillsDir, dir), rel);
  // --- size budget (https://code.claude.com/docs/en/skills: keep SKILL.md under 500 lines;
  // CLAUDE.md adds the repo's own ~2000-word budget). Counted like `wc -lw`: newlines and
  // whitespace-separated words.
  const lines = (text.match(/\n/g) || []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  sizes.set(dir, { lines, words });
  if (lines >= 500) errors.push(`${rel}: ${lines} lines — keep SKILL.md under 500 lines (move on-demand material to a supporting file)`);
  if (words > 2000) warnings.push(`${rel}: ~${words} words — over the ~2000-word budget CLAUDE.md sets`);
}

// --- CLAUDE.md records each SKILL.md size by hand ("<skill> N lines / ~W words"); it must
// match the files. Lines are exact; words allow 1%, since `wc -w` and a whitespace split can
// differ by a word or two.
if (claudeMd === null) errors.push('CLAUDE.md not found — cannot check the recorded SKILL.md sizes or the validation list');
else {
  for (const [dir, actual] of sizes) {
    const m = claudeMd.match(new RegExp(`${dir} (\\d+) lines / ~(\\d+) words`));
    if (!m) {
      errors.push(`CLAUDE.md: no recorded size "${dir} N lines / ~W words" (Progressive Disclosure) — record ${actual.lines} lines / ~${actual.words} words`);
      continue;
    }
    const [lines, words] = [Number(m[1]), Number(m[2])];
    if (lines !== actual.lines || Math.abs(words - actual.words) > actual.words * 0.01)
      errors.push(
        `CLAUDE.md records ${dir} as ${lines} lines / ~${words} words, but skills/${dir}/SKILL.md has ${actual.lines} lines / ~${actual.words} words — re-measure with \`wc -lw skills/*/SKILL.md\` and correct CLAUDE.md`,
      );
  }
}

// --- every check script must actually gate something: run by CI and listed in CLAUDE.md.
const checkScripts = readdirSync(join(root, 'scripts')).filter((f) => /^check-.*\.mjs$/.test(f)).sort();
for (const name of checkScripts) {
  if (workflow === null || !workflow.includes(`node scripts/${name}`))
    errors.push(`scripts/${name} is not run by .github/workflows/validate.yml (expected "node scripts/${name}")`);
  if (claudeMd !== null && !claudeMd.includes(`node scripts/${name}`))
    errors.push(`scripts/${name} is missing from the CLAUDE.md validation list (expected "node scripts/${name}")`);
}

for (const n of notes) console.log('NOTE: ' + n);
for (const w of warnings) console.error('WARN: ' + w);
if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(
  `OK: v${version} — plugin.json, marketplace.json and CHANGELOG.md agree; README.md matches ${guideCount} guides, its install commands match the marketplace, ` +
    `${linkCount} README and ${skillLinkCount} SKILL.md relative link(s) resolve; SKILL.md sizes match CLAUDE.md; ` +
    `${checkScripts.length} check script(s) are wired into CI and CLAUDE.md.`,
);

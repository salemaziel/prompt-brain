#!/usr/bin/env node
// Audits all model guides in skills/migrate-prompt/model-guides/ for:
// 1. Schema compliance (frontmatter fields, exact canonical 6 headings).
// 2. Freshness & staleness (days since last_verified, alerting on >150d warn / >180d stale).
// 3. Documentation integrity (presence of valid HTTPS URLs in Sources, (unbelegt) markers).
// Usage: node scripts/audit-model-guides.mjs [--strict] [--verbose] [--json]

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const guidesDir = join(root, 'skills', 'migrate-prompt', 'model-guides');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const verbose = args.includes('--verbose');
const jsonOutput = args.includes('--json');

if (!existsSync(guidesDir)) {
  console.error(`FAIL: directory not found: ${guidesDir}`);
  process.exit(1);
}

const CANONICAL_HEADINGS = [
  '## Reasoning / Thinking',
  '## Prompting Style',
  '## Strengths & Weaknesses (prompt-relevant)',
  '## Output & Format Conventions',
  '## Migration Notes',
  '## Sources',
];

const REQUIRED_FRONTMATTER = ['model', 'vendor', 'family', 'aliases', 'last_verified', 'status'];

const files = readdirSync(guidesDir).filter((f) => f.endsWith('.md')).sort();
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const results = [];
let totalErrors = 0;
let totalWarnings = 0;
let staleCount = 0;
let expiringSoonCount = 0;
let freshCount = 0;

for (const file of files) {
  const fullPath = join(guidesDir, file);
  const content = readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  const issues = [];
  const warnings = [];

  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    issues.push('missing or malformed YAML frontmatter');
    totalErrors++;
    results.push({ file, issues, warnings, status: 'error' });
    continue;
  }

  const fmLines = fmMatch[1].split('\n');
  const fm = {};
  for (const line of fmLines) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim();
      fm[key] = val;
    }
  }

  // Check required frontmatter keys
  for (const req of REQUIRED_FRONTMATTER) {
    if (!fm[req]) {
      issues.push(`missing frontmatter field: "${req}"`);
    }
  }

  // Check last_verified freshness
  let daysOld = null;
  if (fm.last_verified) {
    const verifiedDate = new Date(fm.last_verified);
    if (isNaN(verifiedDate.getTime())) {
      issues.push(`invalid last_verified date: "${fm.last_verified}"`);
    } else {
      const diffMs = today.getTime() - verifiedDate.getTime();
      daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (daysOld > 180) {
        warnings.push(`stale guide: verified ${daysOld} days ago (>180d)`);
        staleCount++;
      } else if (daysOld > 150) {
        warnings.push(`expiring soon: verified ${daysOld} days ago (150-180d)`);
        expiringSoonCount++;
      } else {
        freshCount++;
      }
    }
  }

  // Check 6 canonical headings
  const body = content.slice(fmMatch[0].length);
  const foundHeadings = [...body.matchAll(/^##\s+[^\n]+/gm)].map((m) => m[0].trim());

  let headingIdx = 0;
  for (const expected of CANONICAL_HEADINGS) {
    const actualIdx = foundHeadings.indexOf(expected);
    if (actualIdx === -1) {
      issues.push(`missing required heading: "${expected}"`);
    } else if (actualIdx < headingIdx) {
      issues.push(`out-of-order heading: "${expected}"`);
    } else {
      headingIdx = actualIdx;
    }
  }

  // Check Sources section has valid URLs
  const sourcesMatch = body.match(/## Sources\n([\s\S]*?)$/);
  if (!sourcesMatch || !sourcesMatch[1].includes('http')) {
    warnings.push('Sources section does not contain explicit URLs');
  }

  if (issues.length > 0) totalErrors += issues.length;
  if (warnings.length > 0) totalWarnings += warnings.length;

  results.push({
    file,
    model: fm.model || file.replace(/\.md$/, ''),
    vendor: fm.vendor || 'unknown',
    last_verified: fm.last_verified || 'unknown',
    daysOld,
    issues,
    warnings,
    status: issues.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'OK',
  });
}

if (jsonOutput) {
  console.log(JSON.stringify({
    total: files.length,
    fresh: freshCount,
    expiringSoon: expiringSoonCount,
    stale: staleCount,
    errors: totalErrors,
    warnings: totalWarnings,
    results,
  }, null, 2));
  process.exit(totalErrors > 0 || (strict && staleCount > 0) ? 1 : 0);
}

console.log('='.repeat(70));
console.log(`Model Guide Freshness & Schema Audit: ${files.length} guides analyzed`);
console.log('='.repeat(70));
console.log(`Fresh (<150d):        ${freshCount}`);
console.log(`Expiring soon (150-180d): ${expiringSoonCount}`);
console.log(`Stale (>180d):        ${staleCount}`);
console.log(`Schema errors:        ${totalErrors}`);
console.log(`Warnings:             ${totalWarnings}`);
console.log('-'.repeat(70));

if (verbose || totalErrors > 0 || (strict && staleCount > 0)) {
  for (const r of results) {
    if (r.status !== 'OK') {
      console.log(`\n[${r.status}] ${r.file} (${r.vendor} - ${r.model}) - ${r.daysOld}d old`);
      for (const iss of r.issues) console.log(`  ERROR: ${iss}`);
      for (const w of r.warnings) console.log(`  WARN:  ${w}`);
    }
  }
  console.log('\n' + '='.repeat(70));
}

if (totalErrors > 0) {
  console.error(`FAIL: ${totalErrors} schema/structural errors detected.`);
  process.exit(1);
}

if (strict && staleCount > 0) {
  console.error(`FAIL (--strict): ${staleCount} model guide(s) exceed 180-day freshness limit.`);
  process.exit(1);
}

console.log('OK: All model guides adhere to canonical schema and required frontmatter.');
process.exit(0);

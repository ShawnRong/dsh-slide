#!/usr/bin/env node
/**
 * Migrate legacy dsh-slide credential record keys to the `<scope>/<id>` form
 * required by DSH >= 0.2.1.
 *
 * Before 0.2.1 the Host credential store addressed records by dotted keys such
 * as `dsh-slide.google.client`. 0.2.1 validates every record key against the
 * `<scope>/<id>` grammar while loading the store, so a single legacy key makes
 * the credentials plugin fail and the whole Host refuses to start — before any
 * plugin (including this one) can repair itself. Run this script once, with
 * DSH stopped, before launching the upgraded app.
 *
 * Usage:
 *   node scripts/migrate-credentials.mjs            # migrate ~/.dsh (or $DSH_HOME)
 *   node scripts/migrate-credentials.mjs --dry-run  # show what would change
 *   node scripts/migrate-credentials.mjs --file /path/to/.credentials.yaml
 */
import { constants } from 'node:fs';
import { access, chmod, copyFile, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const KEY_SEGMENT = /^[a-z][a-z0-9-]*$/;
const RECORD_LINE = /^(\s{2})(["']?)([^"'\s][^"']*)\2:\s*$/;
const LEGACY_SLIDE_LINE = /^(\s*)(["']?)dsh-slide\.([A-Za-z0-9._-]+)\2:\s*$/;

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const fileFlag = argv.indexOf('--file');
const file = fileFlag >= 0 ? argv[fileFlag + 1] : undefined;

if (fileFlag >= 0 && !file) {
  console.error('migrate-credentials: --file needs a path');
  process.exit(2);
}

const home = process.env.DSH_HOME || path.join(homedir(), '.dsh');
const target = file ? path.resolve(file) : path.join(home, '.credentials.yaml');

function migrateKey(name) {
  // `name` is the part after the leading `dsh-slide.`, e.g. `google.client`.
  const id = name.replace(/\./g, '-').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  if (!KEY_SEGMENT.test(id)) return undefined;
  return `dsh-slide/${id}`;
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(target))) {
  console.log(`migrate-credentials: ${target} does not exist; nothing to do.`);
  process.exit(0);
}

const original = await readFile(target, 'utf8');
const lines = original.split('\n');
const replacements = [];
const invalid = [];
let inRecords = false;
let changed = false;

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  if (/^records:\s*$/.test(line)) {
    inRecords = true;
    continue;
  }
  if (inRecords && /^\S/.test(line) && line.trim() !== '') inRecords = false;

  const legacy = LEGACY_SLIDE_LINE.exec(line);
  if (legacy) {
    const [, indent, quote, name] = legacy;
    const next = migrateKey(name);
    if (!next) {
      invalid.push({ line: index + 1, key: `dsh-slide.${name}`, why: 'cannot derive a valid id segment' });
      continue;
    }
    lines[index] = `${indent}${quote}${next}${quote}:`;
    replacements.push({ line: index + 1, from: `dsh-slide.${name}`, to: next });
    changed = true;
    continue;
  }

  if (!inRecords) continue;
  const record = RECORD_LINE.exec(line);
  if (!record) continue;
  const key = record[3];
  if (key === 'version') continue;
  const segments = key.split('/');
  if (segments.length !== 2 || !KEY_SEGMENT.test(segments[0]) || !KEY_SEGMENT.test(segments[1])) {
    invalid.push({ line: index + 1, key, why: 'not "<scope>/<id>" with lowercase-hyphenated segments' });
  }
}

if (replacements.length === 0 && invalid.length === 0) {
  console.log(`migrate-credentials: ${target} is already on the <scope>/<id> layout; nothing to do.`);
  process.exit(0);
}

for (const item of replacements) {
  console.log(`line ${item.line}: ${item.from} -> ${item.to}`);
}
if (invalid.length > 0) {
  for (const item of invalid) console.error(`line ${item.line}: invalid record key ${JSON.stringify(item.key)} (${item.why})`);
  if (replacements.length === 0) {
    console.error('migrate-credentials: no legacy dsh-slide keys to migrate; fix the keys above by hand.');
    process.exit(1);
  }
}

if (dryRun) {
  console.log(`migrate-credentials: dry run; ${target} not written.`);
  process.exit(invalid.length > 0 ? 1 : 0);
}

const next = lines.join('\n');
const backup = `${target}.bak-slide-${Math.floor(Date.now() / 1000)}`;
await copyFile(target, backup);
await chmod(backup, 0o600);
const temporary = `${target}.tmp-${process.pid}`;
await writeFile(temporary, next, { mode: 0o600 });
await rename(temporary, target);

console.log(`migrate-credentials: migrated ${replacements.length} record key(s) in ${target}`);
console.log(`migrate-credentials: backup kept at ${backup}`);
process.exit(invalid.length > 0 ? 1 : 0);
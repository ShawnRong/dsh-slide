/**
 * Durable list of Google Slides decks the agent has touched.
 *
 * The panel in the Web UI reads this list; the Host writes it whenever
 * `google_slides` imports, exports, or the user opens a deck from the panel.
 * It holds no tokens: only the Drive file id, its title, the session that
 * worked on it, and the workspace path it was exported into.
 *
 * One record per deck, hashed by file id, under
 * `<DSH_HOME>/dsh-slide/decks/<sha256(fileId)[0..24]>.json`.
 */
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RECORD_VERSION = 1;
const MAX_DECKS = 200;
const MAX_NAME = 200;
const MAX_PATH = 4096;
const FILE_ID = /^[A-Za-z0-9_-]{1,200}$/;
const SOURCES = new Set(['import', 'export', 'update', 'pdf', 'open']);
const WEB_VIEW = /^https:\/\/(?:docs|drive)\.google\.com\/[^\s]+$/i;

export function dshHome() {
  const configured = (process.env.DSH_HOME || '').trim();
  return configured || path.join(homedir(), '.dsh');
}

export function deckRecordId(fileId) {
  return createHash('sha256').update(String(fileId)).digest('hex').slice(0, 24);
}

export function createDeckStore(options = {}) {
  const dir = options.dir || path.join(dshHome(), 'dsh-slide', 'decks');
  let queue = Promise.resolve();

  const fileFor = (fileId) => path.join(dir, `${deckRecordId(fileId)}.json`);

  const serial = (operation) => {
    const next = queue.then(operation, operation);
    queue = next.then(() => undefined, () => undefined);
    return next;
  };

  const readOne = async (fileId) => {
    if (!FILE_ID.test(fileId)) return undefined;
    try {
      const raw = await readFile(fileFor(fileId), 'utf8');
      const record = normalize(JSON.parse(raw), undefined);
      return record?.fileId === fileId ? record : undefined;
    } catch {
      return undefined;
    }
  };

  const writeOne = async (record) => {
    await mkdir(dir, { recursive: true });
    const file = fileFor(record.fileId);
    const tmp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
    await writeFile(tmp, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    await rename(tmp, file);
    return record;
  };

  const prune = async () => {
    const records = await listUnlocked();
    if (records.length <= MAX_DECKS) return;
    const stale = records.slice(MAX_DECKS);
    await Promise.all(stale.map((record) => unlink(fileFor(record.fileId)).catch(() => undefined)));
  };

  const listUnlocked = async () => {
    let names;
    try {
      names = await readdir(dir);
    } catch {
      return [];
    }
    const records = [];
    for (const name of names) {
      if (!name.endsWith('.json')) continue;
      try {
        const raw = await readFile(path.join(dir, name), 'utf8');
        const record = normalize(JSON.parse(raw), undefined);
        if (record && name === `${deckRecordId(record.fileId)}.json`) records.push(record);
      } catch {
        // A half-written or hand-edited file is ignored, not fatal.
      }
    }
    return records.sort((a, b) => (a.openedAt < b.openedAt ? 1 : a.openedAt > b.openedAt ? -1 : 0));
  };

  return {
    dir,
    fileFor,

    list() {
      return serial(listUnlocked);
    },

    get(fileId) {
      return serial(() => readOne(String(fileId || '')));
    },

    /** Add or update a deck, and make it the most recently opened entry. */
    remember(input) {
      const fileId = String(input?.fileId || '');
      if (!FILE_ID.test(fileId)) return Promise.reject(new Error('A valid Google Drive file id is required.'));
      return serial(async () => {
        const previous = await readOne(fileId);
        const record = normalize({ ...input, fileId }, previous);
        if (!record) throw new Error('Could not build a deck record from that input.');
        await writeOne(record);
        await prune();
        return record;
      });
    },

    touch(fileId) {
      const id = String(fileId || '');
      return serial(async () => {
        const previous = await readOne(id);
        if (!previous) return undefined;
        const record = { ...previous, openedAt: new Date().toISOString() };
        await writeOne(record);
        return record;
      });
    },

    forget(fileId) {
      const id = String(fileId || '');
      if (!FILE_ID.test(id)) return Promise.resolve(false);
      return serial(async () => {
        try {
          await unlink(fileFor(id));
          return true;
        } catch (error) {
          if (error?.code === 'ENOENT') return false;
          throw error;
        }
      });
    },
  };
}

function normalize(input, previous) {
  if (!input || typeof input !== 'object') return undefined;
  const fileId = text(input.fileId, 200);
  if (!FILE_ID.test(fileId)) return undefined;

  const now = new Date().toISOString();
  const name = text(input.name, MAX_NAME) || previous?.name || `Slides ${fileId.slice(0, 8)}`;
  const webViewLink = safeWebViewLink(input.webViewLink) || previous?.webViewLink
    || `https://docs.google.com/presentation/d/${fileId}/edit`;
  const source = SOURCES.has(input.source) ? input.source : previous?.source || 'open';
  const localPath = text(input.localPath, MAX_PATH) || previous?.localPath || '';
  const workspace = text(input.workspace, MAX_PATH) || previous?.workspace || '';
  const sessionId = text(input.sessionId, 200) || previous?.sessionId || '';

  return {
    v: RECORD_VERSION,
    fileId,
    name: name.slice(0, MAX_NAME),
    webViewLink,
    mimeType: text(input.mimeType, 200) || previous?.mimeType || 'application/vnd.google-apps.presentation',
    source,
    sessionId,
    workspace,
    localPath,
    openedAt: iso(input.openedAt) || previous?.openedAt || now,
    firstOpenedAt: previous?.firstOpenedAt || iso(input.firstOpenedAt) || now,
  };
}

function text(value, max) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function safeWebViewLink(value) {
  const link = text(value, 2048);
  return WEB_VIEW.test(link) ? link : '';
}

function iso(value) {
  if (typeof value !== 'string' || !value) return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}
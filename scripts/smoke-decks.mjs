/**
 * Smoke test for the Decks panel's Host half.
 *
 * Runs without a DSH process: a stub Context captures the routes `apply()`
 * registers, and the deck store is pointed at a temporary DSH_HOME.
 *
 *   node scripts/smoke-decks.mjs
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { createDeckStore } = await import(new URL('../decks.js', import.meta.url));

const dir = await mkdtemp(path.join(tmpdir(), 'dsh-slide-decks-'));
const store = createDeckStore({ dir });
const A = '1AbCdEfGhIjKlMnOpQrStUvWxYz012345';
const B = '2AbCdEfGhIjKlMnOpQrStUvWxYz012345';
const C = '3AbCdEfGhIjKlMnOpQrStUvWxYz012345';

await store.remember({ fileId: A, name: 'Q3 review', source: 'import', sessionId: 's1', workspace: '/w', localPath: '/w/q3.pptx', openedAt: '2026-01-01T00:00:00Z' });
await store.remember({ fileId: B, name: 'Launch', source: 'export', sessionId: 's1', openedAt: '2026-02-01T00:00:00Z' });
await store.remember({ fileId: C, name: 'Board', source: 'pdf', openedAt: '2026-03-01T00:00:00Z' });

let list = await store.list();
assert.deepEqual(list.map((deck) => deck.fileId), [C, B, A]);
assert.equal(list[2].mimeType, 'application/vnd.google-apps.presentation');
assert.match(list[0].webViewLink, /^https:\/\/docs\.google\.com\/presentation\/d\/3Ab/);

assert.equal((await store.get(B)).name, 'Launch');
assert.ok(Date.parse((await store.touch(A)).openedAt) > Date.parse('2026-03-01T00:00:00Z'));
assert.equal((await store.list())[0].fileId, A);

await store.remember({ fileId: A, name: 'x\u0000y', webViewLink: 'javascript:alert(1)', localPath: '/a\u0001b' });
const safe = await store.get(A);
assert.equal(safe.name, 'x y');
assert.match(safe.webViewLink, /^https:\/\/docs\.google\.com\//);
assert.equal(safe.localPath, '/a b');

await assert.rejects(store.remember({ fileId: '../etc/passwd', name: 'x' }));
assert.equal(await store.get('../etc/passwd'), undefined);

await Promise.all(Array.from({ length: 20 }, (_, index) => store.remember({ fileId: `concurrent${index}`, name: `C${index}` })));
assert.equal((await store.list()).filter((deck) => deck.fileId.startsWith('concurrent')).length, 20);

assert.equal(await store.forget(C), true);
assert.equal(await store.forget(C), false);

for (let index = 0; index < 210; index += 1) {
  await store.remember({ fileId: `prune${index}`, name: `P${index}`, openedAt: new Date(2026, 0, 1, 0, index).toISOString() });
}
list = await store.list();
assert.equal(list.length, 200);
assert.ok(list.some((deck) => deck.fileId === 'prune209'));
assert.ok(!list.some((deck) => deck.fileId === 'prune0'));

process.env.DSH_HOME = await mkdtemp(path.join(tmpdir(), 'dsh-slide-home-'));
const { apply } = await import(new URL('../index.js', import.meta.url));

const routes = new Map();
const ctx = {
  logger: { info() {}, warn() {}, error() {} },
  effect(fn) { const dispose = fn(); return typeof dispose === 'function' ? dispose : () => {}; },
  skills: { register() { return () => {}; } },
  tools: { register() { return () => {}; } },
  commands: { register() { return () => {}; } },
  webServer: {
    register(route) { routes.set(route.path, route.handler); return () => {}; },
    getOrigin() { return 'http://127.0.0.1:50462'; },
  },
  credentials: { readRecord: async () => undefined, modifyRecord: async () => undefined, deleteRecord: async () => undefined },
  workingDirectory: { defaultDirectory: root, ensure: async () => root },
};
apply(ctx);

const seeded = createDeckStore({ dir: path.join(process.env.DSH_HOME, 'dsh-slide', 'decks') });
await seeded.remember({ fileId: A, name: 'Route deck', source: 'import', sessionId: 'sess-1', workspace: root });

function request(method, url, body, origin = 'http://127.0.0.1:50462') {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  return {
    method,
    url,
    headers: origin === null ? {} : { origin },
    async *[Symbol.asyncIterator]() { yield* chunks; },
  };
}

function response() {
  const output = { status: 0, body: '' };
  return {
    headersSent: false,
    writeHead(status) { output.status = status; this.headersSent = true; },
    end(body) { output.body = body ? String(body) : ''; },
    output,
  };
}

async function call(pathname, options = {}) {
  const handler = routes.get(pathname);
  assert.ok(handler, `route missing: ${pathname}`);
  const res = response();
  await handler(request(options.method || 'GET', pathname, options.body, options.origin), res);
  return { status: res.output.status, body: JSON.parse(res.output.body) };
}

const listed = await call('/dsh-slide/api/decks');
assert.equal(listed.status, 200);
assert.equal(listed.body.decks.length, 1);
assert.equal(listed.body.decks[0].sessionId, 'sess-1');

const opened = await call('/dsh-slide/api/decks/open', { method: 'POST', body: { fileId: A } });
assert.equal(opened.status, 200);
assert.ok(Date.parse(opened.body.deck.openedAt) > Date.parse('2026-01-01T00:00:00Z'));

assert.equal((await call('/dsh-slide/api/decks/open', { method: 'POST', body: { fileId: B } })).status, 404);
assert.equal((await call('/dsh-slide/api/decks/open', { method: 'POST', body: { fileId: A }, origin: 'https://evil.example' })).status, 403);

const forgotten = await call('/dsh-slide/api/decks/forget', { method: 'POST', body: { fileId: A } });
assert.equal(forgotten.body.removed, true);
assert.equal((await call('/dsh-slide/api/decks')).body.decks.length, 0);

await rm(dir, { recursive: true, force: true });
await rm(process.env.DSH_HOME, { recursive: true, force: true });

console.log('decks smoke: ok');

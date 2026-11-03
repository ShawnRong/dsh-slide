/**
 * Smoke test for the comment bridge: the pure thread shapes, the panel count
 * route, and the `comments` action of the tool.
 *
 * No DSH process and no network: a stub Context captures the routes and the
 * tool, and global `fetch` answers Drive with canned comment resources.
 *
 *   node scripts/smoke-comments.mjs
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const {
  commentDeepLink,
  formatCommentDate,
  normalizeCommentThread,
  summarizeThreads,
} = await import(new URL('../comments.js', import.meta.url));

/* --------------------------------------------------------------------------
 * Thread shapes
 * ------------------------------------------------------------------------ */

const resolvedByReply = normalizeCommentThread({
  id: 'c1',
  author: { displayName: 'Ana Costa' },
  content: '  Can we cite a\nsource here?  ',
  quotedFileContent: { value: '37 人换辖区' },
  createdTime: '2026-10-30T09:12:00.000Z',
  replies: [
    { id: 'r1', author: { displayName: 'João' }, content: 'Added a footnote.', createdTime: '2026-10-30T10:00:00.000Z' },
    { id: 'r2', author: { displayName: 'Ana Costa' }, content: '', action: 'resolve', createdTime: '2026-10-31T10:00:00.000Z' },
  ],
});
assert.equal(resolvedByReply.id, 'c1');
assert.equal(resolvedByReply.content, 'Can we cite a source here?');
assert.equal(resolvedByReply.quoted, '37 人换辖区');
assert.equal(resolvedByReply.resolved, true);
assert.equal(resolvedByReply.replies.length, 2);
assert.equal(resolvedByReply.replies[0].author, 'João');

const reopened = normalizeCommentThread({
  id: 'c2',
  content: 'Recheck this number',
  resolved: false,
  replies: [
    { id: 'r3', content: '', action: 'resolve' },
    { id: 'r4', content: 'Still wrong', action: 'reopen' },
  ],
});
assert.equal(reopened.resolved, false, 'the last action wins');

assert.equal(normalizeCommentThread({ content: 'no id' }), undefined);
assert.equal(normalizeCommentThread(null), undefined);

const anonymous = normalizeCommentThread({ id: 'c3', content: 'hi' });
assert.equal(anonymous.author, 'Google user');
assert.equal(anonymous.replies.length, 0);
assert.equal(normalizeCommentThread({ id: 'c4', content: 'x\u0000y\u0007 z' }).content, 'x y z');

const longQuoted = normalizeCommentThread({ id: 'c5', content: 'x', quotedFileContent: { value: 'q'.repeat(400) } });
assert.ok(longQuoted.quoted.length <= 300);
assert.ok(longQuoted.quoted.endsWith('…'));

const manyReplies = normalizeCommentThread({
  id: 'c6',
  content: 'thread',
  replies: Array.from({ length: 30 }, (_, index) => ({ id: `r${index}`, content: `reply ${index}` })),
});
assert.equal(manyReplies.replies.length, 20, 'replies are capped');
assert.equal(manyReplies.replies.at(-1).content, 'reply 29');

const summary = summarizeThreads([
  { resolved: false }, { resolved: true }, { resolved: false },
]);
assert.deepEqual(summary, { total: 3, unresolved: 2, resolved: 1 });
assert.deepEqual(summarizeThreads(undefined), { total: 0, unresolved: 0, resolved: 0 });

assert.equal(formatCommentDate('2026-10-30T09:12:00.000Z'), '2026-10-30');
assert.equal(formatCommentDate('not a date'), '');

/* --------------------------------------------------------------------------
 * Deep links
 * ------------------------------------------------------------------------ */

const link = commentDeepLink('https://docs.google.com/presentation/d/abc123/edit?usp=drivesdk', 'c1');
assert.equal(new URL(link).searchParams.get('disco'), 'c1');
assert.equal(new URL(link).searchParams.get('usp'), 'drivesdk', 'existing query survives');
assert.equal(commentDeepLink('javascript:alert(1)', 'c1'), '');
assert.equal(commentDeepLink('https://evil.example/presentation', 'c1'), '');
assert.equal(commentDeepLink('', 'c1'), '');
assert.equal(commentDeepLink('https://docs.google.com/presentation/d/abc', ''), 'https://docs.google.com/presentation/d/abc');

/* --------------------------------------------------------------------------
 * Host: the count route and the tool action, against a stubbed Drive
 * ------------------------------------------------------------------------ */

const home = await mkdtemp(path.join(tmpdir(), 'dsh-slide-comments-'));
process.env.DSH_HOME = home;
const { apply } = await import(new URL('../index.js', import.meta.url));
const { createDeckStore } = await import(new URL('../decks.js', import.meta.url));

const A = '1AbCdEfGhIjKlMnOpQrStUvWxYz012345';
const B = '2AbCdEfGhIjKlMnOpQrStUvWxYz012345';
const UNKNOWN = '9ZzYxWvUtSrQpOnMlKjIhGfEdCbA9876';

const routes = new Map();
const workspace = await mkdtemp(path.join(tmpdir(), 'dsh-slide-workspace-'));
await writeFile(path.join(workspace, 'final.pptx'), 'pptx-bytes');
let tool;
const ctx = {
  logger: { info() {}, warn() {}, error() {} },
  effect(fn) { const dispose = fn(); return typeof dispose === 'function' ? dispose : () => {}; },
  skills: { register() { return () => {}; } },
  tools: { register(definition) { tool = definition; return () => {}; } },
  commands: { register() { return () => {}; } },
  webServer: {
    register(route) { routes.set(route.path, route.handler); return () => {}; },
    getOrigin() { return 'http://127.0.0.1:50462'; },
  },
  credentials: {
    readRecord: async () => undefined,
    modifyRecord: async () => undefined,
    deleteRecord: async () => undefined,
  },
  workingDirectory: { defaultDirectory: workspace, ensure: async () => workspace },
};
apply(ctx);

const store = createDeckStore({ dir: path.join(home, 'dsh-slide', 'decks') });
await store.remember({ fileId: A, name: 'Route deck', source: 'import', sessionId: 's1', workspace: root });
await store.remember({ fileId: B, name: 'Quiet deck', source: 'export', sessionId: 's1', workspace: root });

const THREADS = [
  {
    id: 'thread-1',
    author: { displayName: 'Ana Costa' },
    content: 'Can we cite a source here?',
    quotedFileContent: { value: '37 人换辖区' },
    createdTime: '2026-10-30T09:12:00.000Z',
    replies: [{ id: 'reply-1', author: { displayName: 'João' }, content: 'Added a footnote.', createdTime: '2026-10-30T10:00:00.000Z' }],
  },
  {
    id: 'thread-2',
    author: { displayName: 'Ana Costa' },
    content: 'This slide is dense',
    createdTime: '2026-10-29T09:12:00.000Z',
    replies: [],
  },
  {
    id: 'thread-3',
    author: { displayName: 'Ana Costa' },
    content: 'Old point',
    resolved: true,
    createdTime: '2026-10-28T09:12:00.000Z',
    replies: [],
  },
];

const realFetch = globalThis.fetch;
const calls = [];
const uploads = [];
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url || String(input));
  calls.push(url.pathname + url.search);
  if (url.pathname.startsWith('/upload/drive/v3/files/')) {
    uploads.push({
      method: init.method,
      contentType: new Headers(init.headers || {}).get('content-type'),
      bytes: init.body ? init.body.length : 0,
      fileId: url.pathname.split('/').pop(),
    });
    return new Response(JSON.stringify({
      id: A,
      name: 'Route deck',
      webViewLink: `https://docs.google.com/presentation/d/${A}/edit`,
      modifiedTime: '2026-11-03T08:00:00.000Z',
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (url.pathname.includes('/comments')) {
    const fileId = url.pathname.split('/files/')[1]?.split('/')[0] || '';
    const threads = fileId === B ? [] : THREADS;
    const fields = url.searchParams.get('fields') || '';
    const comments = fields.includes('quotedFileContent')
      ? threads
      : threads.map(({ id, resolved }) => ({ id, resolved: resolved === true }));
    return new Response(JSON.stringify({ comments }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (/\/files\/[^/]+$/.test(url.pathname)) {
    return new Response(JSON.stringify({
      id: A,
      name: 'Route deck',
      mimeType: 'application/vnd.google-apps.presentation',
      webViewLink: `https://docs.google.com/presentation/d/${A}/edit`,
      capabilities: { canComment: true, canEdit: true },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return new Response('not found', { status: 404 });
};

function request(method, url) {
  return {
    method,
    url,
    headers: { origin: 'http://127.0.0.1:50462' },
    async *[Symbol.asyncIterator]() {},
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

async function call(target) {
  const pathname = target.split('?')[0];
  const handler = routes.get(pathname);
  assert.ok(handler, `route missing: ${pathname}`);
  const res = response();
  await handler(request('GET', target), res);
  return { status: res.output.status, body: JSON.parse(res.output.body) };
}

try {
  // Signed out: the route answers, but says so instead of failing the panel.
  const signedOut = await call(`/dsh-slide/api/decks/comments?fileIds=${A}`);
  assert.equal(signedOut.status, 200);
  assert.equal(signedOut.body.connected, false);
  assert.deepEqual(signedOut.body.counts, {});

  ctx.credentials.readRecord = async (key) => (key === 'dsh-slide/google-account'
    ? { kind: 'grant', payload: { accessToken: 'stub-token', refreshToken: 'stub-refresh', expiresAt: Date.now() + 3_600_000 } }
    : undefined);

  const signedIn = await call(`/dsh-slide/api/decks/comments?fileIds=${A},${B},${UNKNOWN}`);
  assert.equal(signedIn.body.connected, true);
  assert.equal(signedIn.body.counts[A].unresolved, 2);
  assert.equal(signedIn.body.counts[A].total, 3);
  assert.equal(signedIn.body.counts[B].unresolved, 0, 'each deck is read on its own');
  assert.equal(signedIn.body.counts[B].total, 0);
  assert.equal(signedIn.body.counts[UNKNOWN], undefined, 'unregistered ids are never sent to Drive');
  assert.ok(!calls.some((entry) => entry.includes(UNKNOWN)), 'no Drive call for an unregistered deck');

  // Cached: the second refresh within a minute must not hit Drive again.
  const before = calls.length;
  await call(`/dsh-slide/api/decks/comments?fileIds=${A}`);
  assert.equal(calls.length, before, 'counts are cached for a minute');

  // The tool action.
  const result = await tool.execute({ action: 'comments', file_id: A }, {});
  assert.equal(result.ok, true);
  assert.equal(result.action, 'comments');
  assert.equal(result.unresolved, 2);
  assert.equal(result.total, 3);
  assert.equal(result.resolvedHidden, 1);
  assert.equal(result.canComment, true);
  assert.equal(result.threads.length, 2);
  assert.equal(result.threads[0].quoted, '37 人换辖区');
  assert.equal(result.threads[0].replies.length, 1);
  assert.match(result.threads[0].link, /disco=thread-1/);
  assert.doesNotMatch(result.threads[0].content, /\n/);

  const withResolved = await tool.execute({ action: 'comments', file_id: A, include_resolved: true }, {});
  assert.equal(withResolved.threads.length, 3);
  assert.equal(withResolved.resolvedHidden, 0);

  const text = tool.output.render({ action: 'comments' }, result)[0].text;
  assert.match(text, /2 open comments on "Route deck" \(3 threads in all, 1 resolved hidden, editable\)/);
  assert.match(text, /Ana Costa, 2026-10-30 — on "37 人换辖区": Can we cite a source here\?/);
  assert.match(text, /reply João, 2026-10-30: Added a footnote\./);
  assert.match(text, /thread: https:\/\/docs\.google\.com\/presentation\/d\/.+\?disco=thread-1/);

  await assert.rejects(tool.execute({ action: 'comments' }, {}), /file_id is required/);

  // A quote too short to identify a page says so; a thread with no quote at all
  // says that instead of printing an empty pair of quotes.
  THREADS.push(
    { id: 'thread-4', author: { displayName: 'Ana Costa' }, content: 'Too dense', quotedFileContent: { value: '建' }, createdTime: '2026-11-03T01:00:00.000Z', replies: [] },
    { id: 'thread-5', author: { displayName: 'Ana Costa' }, content: 'Shape note', createdTime: '2026-11-03T02:00:00.000Z', replies: [] },
  );
  const mixed = await tool.execute({ action: 'comments', file_id: A }, {});
  const mixedText = tool.output.render({}, mixed)[0].text;
  assert.match(mixedText, /on "建" \(too short to locate; ask which slide\): Too dense/);
  assert.match(mixedText, /— no quoted text \(ask which slide\): Shape note/);

  // A deck with no comments still renders a sentence, not an empty body.
  THREADS.length = 0;
  const empty = await tool.execute({ action: 'comments', file_id: A }, {});
  assert.equal(empty.threads.length, 0);
  assert.equal(tool.output.render({}, empty)[0].text, 'No open comments on "Route deck".');

  // In-place update: one PATCH with the packed bytes, same file id, deck record
  // moves to source "update".
  const updated = await tool.execute({ action: 'update', file_id: A, path: 'final.pptx' }, {});
  assert.equal(updated.action, 'update');
  assert.equal(updated.fileId, A);
  assert.equal(updated.bytes, Buffer.byteLength('pptx-bytes'));
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].method, 'PATCH');
  assert.equal(uploads[0].contentType, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  assert.equal(uploads[0].fileId, A);
  assert.equal(uploads[0].bytes, Buffer.byteLength('pptx-bytes'));
  assert.match(tool.output.render({}, updated)[0].text, /Replaced the content of "Route deck"/);
  assert.equal((await store.get(A)).source, 'update');

  await assert.rejects(tool.execute({ action: 'update', file_id: A }, {}), /path is required/);
  await assert.rejects(tool.execute({ action: 'update', path: 'final.pptx' }, {}), /file_id is required/);
  await assert.rejects(tool.execute({ action: 'update', file_id: A, path: 'missing.pptx' }, {}), /missing or outside/);
} finally {
  globalThis.fetch = realFetch;
  await rm(home, { recursive: true, force: true });
  await rm(workspace, { recursive: true, force: true });
}

console.log('comments smoke: ok');
/**
 * Google Drive comment threads, reduced to what the panel and the agent need.
 *
 * Pure functions only: no network, no credentials, no disk. The Host fetches
 * from Drive and hands the raw resources here; the tool result, the panel count,
 * and the deep link are all built from these shapes.
 *
 * Drive sends far more than either caller wants — anchor blobs, photo links,
 * revision ids, per-reply HTML — and a comment thread can be tens of kilobytes.
 * Everything is bounded here, with an explicit marker when a field was cut.
 */

const MAX_ID = 200;
const MAX_AUTHOR = 120;
const MAX_CONTENT = 4000;
const MAX_QUOTED = 300;
const MAX_REPLIES = 20;

const LINK_HOSTS = /(^|\.)google\.com$/i;

/**
 * One Drive Comment resource -> the thread the UI and the tool render.
 * Resolved threads keep every reply: the panel hides them, the agent may need them.
 */
export function normalizeCommentThread(comment) {
  if (!comment || typeof comment !== 'object') return undefined;
  const id = clean(comment.id, MAX_ID);
  if (!id) return undefined;

  const replies = (Array.isArray(comment.replies) ? comment.replies : [])
    .map(normalizeReply)
    .filter(Boolean)
    .slice(-MAX_REPLIES);

  return {
    id,
    author: authorName(comment.author),
    content: clean(comment.content, MAX_CONTENT),
    quoted: clean(comment.quotedFileContent?.value, MAX_QUOTED),
    createdTime: iso(comment.createdTime),
    modifiedTime: iso(comment.modifiedTime),
    resolved: isResolved(comment, replies),
    replies,
  };
}

/** Splits a list of threads into the two numbers the panel and the tool report. */
export function summarizeThreads(threads) {
  const list = Array.isArray(threads) ? threads.filter(Boolean) : [];
  const unresolved = list.filter((thread) => !thread.resolved).length;
  return { total: list.length, unresolved, resolved: list.length - unresolved };
}

/**
 * A link that opens one comment thread in Google Slides. `disco` is the
 * discussion id parameter both Docs and Slides honour. Anything that is not a
 * Google URL collapses to an empty string rather than a javascript: link.
 */
export function commentDeepLink(webViewLink, commentId) {
  const id = clean(commentId, MAX_ID);
  const raw = clean(webViewLink, 2048);
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:' || !LINK_HOSTS.test(url.hostname)) return '';
  if (id) url.searchParams.set('disco', id);
  return url.toString();
}

/** `2026-11-02T09:36:43.830Z` -> `2026-11-02`; unparseable input -> ''. */
export function formatCommentDate(value) {
  const stamp = iso(value);
  return stamp ? stamp.slice(0, 10) : '';
}

function normalizeReply(reply) {
  if (!reply || typeof reply !== 'object') return undefined;
  const content = clean(reply.content, MAX_CONTENT);
  const action = clean(reply.action, 20);
  if (!content && !action) return undefined;
  return {
    id: clean(reply.id, MAX_ID),
    author: authorName(reply.author),
    content,
    createdTime: iso(reply.createdTime),
    ...(action ? { action } : {}),
  };
}

/**
 * `resolved` is a Drive field, but a thread can also be closed by a reply whose
 * action is `resolve` (and reopened by `reopen`). The last one wins.
 */
function isResolved(comment, replies) {
  if (typeof comment.resolved === 'boolean') return comment.resolved;
  let resolved = false;
  for (const reply of replies) {
    if (reply.action === 'resolve') resolved = true;
    else if (reply.action === 'reopen') resolved = false;
  }
  return resolved;
}

function authorName(author) {
  const name = clean(author?.displayName, MAX_AUTHOR);
  return name || 'Google user';
}

function clean(value, max) {
  if (value === undefined || value === null) return '';
  const flat = String(value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

function iso(value) {
  if (typeof value !== 'string' || !value) return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}
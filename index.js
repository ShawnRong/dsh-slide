/**
 * Host half of the `@local/dsh-slide` bundle.
 *
 * It contributes three things:
 *   1. the `pptx-deck-edit` skill from the bundled copy on disk;
 *   2. a Google OAuth loopback flow whose tokens live in `ctx.credentials`;
 *   3. a `google_slides` tool that performs Drive operations without ever
 *      exposing an access token to the model or to the browser.
 */
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDeckStore } from './decks.js';

const ROUTE = '/dsh-slide';
const ACCOUNT_KEY = 'dsh-slide/google-account';
const CLIENT_KEY = 'dsh-slide/google-client';
const SKILL_FILE = fileURLToPath(new URL('./pptx-deck-edit/SKILL.md', import.meta.url));
const SKILL_DIR = path.dirname(SKILL_FILE);
const DESIGN_SKILL_FILE = fileURLToPath(new URL('./deck-design/SKILL.md', import.meta.url));
const DESIGN_SKILL_DIR = path.dirname(DESIGN_SKILL_FILE);

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const DRIVE_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const SLIDES_MIME = 'application/vnd.google-apps.presentation';
const PDF_MIME = 'application/pdf';
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];
const DSH_SKILL_NOTE = `

## DSH extension integration

This Harness exposes Google Slides through the \`google_slides\` tool. Prefer it over \`gdrive.py\` for Google work:

- \`status\` checks whether the user has signed in.
- \`list\` finds Google Slides decks.
- \`export\` downloads a deck as .pptx; \`pdf\` downloads Google's own PDF rendering.
- \`import\` uploads a finished .pptx as a NEW Google Slides file.

Sign-in is user-only in **Settings → Google Slides**. The tool refreshes OAuth tokens automatically, and the model never receives one. Do not ask the user to paste tokens into chat or to set \`GOOGLE_ACCESS_TOKEN\` when the tool is available.

Keep the local round-trip described above for .pptx edits: export → unpack → plan → edit in batches → render and inspect → pack → import.

Before editing a Google Slides deck, export it again and work from that copy. The user may have changed the deck in Slides since your last export; importing a deck built from an older copy overwrites their edits.

After each batch of 2–3 slides, publish a 3-up grid in the conversation with the local path. Add a short summary and say what is next, then continue. Ask only if a decision blocks the next batch; pause only if the user asks for interactive review. Do not create a Google Slides file per batch: import once, after the final lint and visual pass, then share the link.

Keep the deck's existing brand assets, including the template's footer logo. Do not add decorative section tags such as "01 · 今天" or redraw a logo; use the supplied file at the template's position and size.

Every slide keeps a speaker note, and a text edit includes its note: change a number or a claim and rewrite that slide's note in the same batch (80–150 字, structure in \`../deck-design/references/SPEAKER-NOTES.md\`). Chinese copy follows \`../deck-design/references/ZH-COPY.md\`: verbs keep their objects, one term per object, half-width punctuation only inside Latin fragments, footnotes state source and basis.

For a new deck or a full redesign, load the \`deck-design\` skill first. It carries the copy standard, the layout system, and the speaker-note standard; run its \`scripts/deck_lint.py\` before delivering, with the notes gate on by default.
`;

const DSH_DESIGN_NOTE = `

## DSH extension integration

\`google_slides\` is available for Google work: \`export\` a deck as .pptx, \`pdf\` for Google's own rendering, and \`import\` a finished .pptx as a new Slides file. Never ask for OAuth tokens.

Use \`pptx-deck-edit\` when the task is a small edit inside an existing deck and the design must be preserved. Use this skill when the narrative, the copy, or the visual system is being created or rebuilt.

Build in batches of three. After each batch, render the slides, compose a 3-up grid, post it with a short summary and links, and continue. End the turn only if the user asked for interactive review or a decision blocks the next batch. The protocol is in \`references/REVIEW-CADENCE.md\`.

Chinese copy goes through \`references/ZH-COPY.md\` before the lint (verbs with objects, one term per object, complete parallel items, fixed Latin casing). Every slide carries a speaker note by default — \`references/SPEAKER-NOTES.md\`, 80–150 字 in three beats — and \`deck_lint.py\` fails a slide without one; pass \`--no-notes\` only when the user asked for no notes.
`;
const PENDING_TTL_MS = 10 * 60 * 1000;
let tokenRefresh;
const MAX_JSON_BYTES = 32 * 1024;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const inject = ['webServer', 'credentials', 'skills', 'tools', 'workingDirectory', 'commands'];

export function apply(ctx) {
  /** state -> { verifier, redirectUri, clientId, clientSecret, createdAt } */
  const pending = new Map();
  const deckStore = createDeckStore();

  registerSkills(ctx);
  registerTool(ctx, deckStore);
  registerCommand(ctx);
  registerRoutes(ctx, pending, deckStore);

  ctx.effect(() => () => pending.clear(), 'dsh-slide: clear pending OAuth states');
  ctx.logger.info('[dsh-slide] deck-design + pptx-deck-edit skills, /slide command, Google sign-in, and google_slides tool loaded');
}

/* ----------------------------------------------------------------------------
 * Skill
 * ------------------------------------------------------------------------- */

function registerSkills(ctx) {
  registerSkill(ctx, {
    name: 'pptx-deck-edit',
    file: SKILL_FILE,
    dir: SKILL_DIR,
    note: DSH_SKILL_NOTE,
    fallback: 'Edit an existing slide deck (.pptx or Google Slides) while preserving its design.',
  });
  registerSkill(ctx, {
    name: 'deck-design',
    file: DESIGN_SKILL_FILE,
    dir: DESIGN_SKILL_DIR,
    note: DSH_DESIGN_NOTE,
    fallback: 'Build or rebuild a slide deck with a clear argument, readable layout, and no AI-slop copy.',
  });
}

function registerSkill(ctx, { name, file, dir, note, fallback }) {
  try {
    const raw = readFileSync(file, 'utf8');
    const { body, fields } = parseFrontmatter(raw);
    const description = fields.description || fallback;
    ctx.effect(() => ctx.skills.register({
      name,
      description,
      content: `${body.trimEnd()}${note}`,
      source: 'bundled',
      provider: 'dsh-slide',
      path: file,
      resourceBase: { kind: 'directory', path: dir },
      invocation: { modelInvocable: true, userInvocable: true },
    }), `dsh-slide: register ${name}`);
  } catch (error) {
    ctx.logger.warn(`[dsh-slide] could not register ${name}: ${errorMessage(error)}`);
  }
}

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { body: raw, fields: {} };
  const fields = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const found = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!found) continue;
    const [, key, rest] = found;
    let value = rest.trim();
    if (value === '|' || value === '>') {
      const block = [];
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
        i += 1;
        block.push(lines[i].replace(/^\s{2}/, ''));
      }
      value = block.join(value === '|' ? '\n' : ' ').trim();
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return { body: raw.slice(match[0].length).trimStart(), fields };
}

/* ----------------------------------------------------------------------------
 * Slash command
 * ------------------------------------------------------------------------- */

const SLIDE_USAGE = '用法：/slide <主题或要求>，例如 /slide 给管理层做一份 10 页的 Q4 复盘。';

function registerCommand(ctx) {
  ctx.effect(() => ctx.commands.register({
    name: 'slide',
    description: 'Start a deck-building task with the deck-design skill',
    input: { hint: '<主题或要求>' },
    handler: startDeckTask,
  }), 'dsh-slide: register slide command');
}

/**
 * Hand the brief to the live agent as an ordinary user message, so the task
 * runs through the same inbox and session log as a typed prompt.
 */
function startDeckTask(invocation) {
  const brief = invocation.rawInput.trim();
  if (brief.length === 0) return { kind: 'error', text: SLIDE_USAGE };
  const agent = invocation.agent;
  if (typeof agent.followup !== 'function') {
    return { kind: 'error', text: '当前会话不支持继续发送消息，无法启动做 deck 的任务。' };
  }
  agent.followup(createUserTextMessage(composeSlideTask(brief)));
  return {
    kind: 'success',
    text: '已交给 deck-design 开始制作，接下来会在对话里按三页一批推进并贴出预览。',
  };
}

/** One identified user-role text message, the same shape the llm factories produce. */
function createUserTextMessage(text) {
  return {
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'user' },
  };
}

function composeSlideTask(brief) {
  return [
    '用 DSH 的演示文稿技能完成这个任务：',
    '',
    brief,
    '',
    '新 deck 用 deck-design 技能；修改已有 .pptx 用 pptx-deck-edit 技能。',
    '内容组织优先用结构图，不要用项目符号堆句子：先选 references/DIAGRAM-PATTERNS.md 里的结构（boundary / swimlane / tree / staircase / trunk + glue 等），再写标签；每页正文按技能预算（≤ 60 字），标签要短。',
    '中文措辞按 references/ZH-COPY.md：动词带宾语（不写“1 分钟发完”），同一对象全篇一个词，并列项补齐同调，中英文之间留空格、产品名固定大小写，脚注只写“来源和口径”。',
    '每一页都要写 speaker note（references/SPEAKER-NOTES.md，80–150 字：结论句 + 论据 + 过渡），文案定稿后再写；改了页面上的数字或结论，同一批里把备注一起改掉。',
    '按技能里的流程推进：需求足够明确就直接开始，确有阻塞再问我；每完成三页渲染并给出 3-up 预览、文件路径和一句说明后继续，不要停下来等我逐批确认。',
    '成品 .pptx 放在当前工作目录；交付前运行 deck_lint.py 并修掉硬失败（默认包含缺备注的检查）。Google Slides 只在最终交付时导入一次，不要每批/每版导入；一次请求只留一个 Slides 文件。',
  ].join('\n');
}

/* ----------------------------------------------------------------------------
 * Tool
 * ------------------------------------------------------------------------- */

function registerTool(ctx, deckStore) {
  ctx.effect(() => ctx.tools.register({
    name: 'google_slides',
    description:
      'Google Slides bridge for the pptx-deck-edit skill. action=status checks the Google connection; '
      + 'list finds Google Slides decks; export downloads a deck as .pptx into the workspace; '
      + 'import uploads a local .pptx as a NEW Google Slides file; pdf downloads Google\'s own PDF rendering. '
      + 'The user signs in through Settings → Google Slides. The Decks panel lists every deck the agent imported, exported, or opened. Never ask for, print, or handle OAuth tokens.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'list', 'export', 'import', 'pdf'],
          description: 'Operation to perform.',
        },
        file_id: { type: 'string', description: 'Google Drive file id for export or pdf.' },
        path: {
          type: 'string',
          description: 'Workspace-relative output path for export/pdf, or input path for import. '
            + 'Relative paths resolve against the current session directory.',
        },
        name: { type: 'string', description: 'Name for the new Google Slides file on import.' },
        parent_id: { type: 'string', description: 'Optional Drive folder id for import.' },
        query: {
          type: 'string',
          description: 'Optional Drive query for list. Defaults to presentation files owned by or shared with the user.',
        },
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Maximum list results (default 20).' },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          message: { type: 'string' },
        },
        additionalProperties: true,
      },
      render(_args, value) {
        return [{ type: 'text', text: renderToolValue(value) }];
      },
    },
    timeoutMs: 180_000,
    isConcurrencySafe(args) {
      return args && (args.action === 'status' || args.action === 'list');
    },
    async execute(args, exec) {
      if (!args || typeof args !== 'object') throw new Error('Invalid arguments');
      switch (args.action) {
        case 'status':
          return await getStatus(ctx);
        case 'list':
          return { ok: true, files: await listFiles(ctx, args.query, args.limit) };
        case 'export':
          return await exportFile(ctx, args.file_id, PPTX_MIME, args.path, '.pptx', exec, deckStore);
        case 'pdf':
          return await exportFile(ctx, args.file_id, PDF_MIME, args.path, '.pdf', exec, deckStore);
        case 'import':
          return await importFile(ctx, args.path, args.name, args.parent_id, exec, deckStore);
        default:
          throw new Error(`Unknown action "${String(args.action)}". Use status, list, export, import, or pdf.`);
      }
    },
  }), 'dsh-slide: register google_slides tool');
}

function renderToolValue(value) {
  if (!value || typeof value !== 'object') return String(value);
  if (value.files) {
    const files = value.files;
    if (files.length === 0) return 'No Google Slides files matched.';
    return files.map((file) => `- ${file.name} — ${file.id}${file.webViewLink ? ` (${file.webViewLink})` : ''}`).join('\n');
  }
  if (value.path) {
    return `Wrote ${value.path} (${value.bytes} bytes).${value.webViewLink ? `\nDeck: ${value.webViewLink}` : ''}`;
  }
  if (value.id) {
    return `Created Google Slides file "${value.name}" (${value.id})${value.webViewLink ? ` — ${value.webViewLink}` : ''}.`;
  }
  return JSON.stringify(value, null, 2);
}

/* ----------------------------------------------------------------------------
 * Google OAuth + Drive
 * ------------------------------------------------------------------------- */

async function getStatus(ctx) {
  const client = await resolveClient(ctx);
  const account = await readAccount(ctx);
  return {
    ok: true,
    configured: Boolean(client.clientId),
    clientId: client.clientId,
    clientSource: client.source,
    hasClientSecret: Boolean(client.clientSecret),
    redirectUri: googleRedirectUri(ctx),
    connected: Boolean(account?.accessToken),
    account: account
      ? {
          email: account.email || '',
          name: account.name || '',
          picture: account.picture || '',
          sub: account.sub || '',
        }
      : null,
    expiresAt: account?.expiresAt || null,
    hasRefreshToken: Boolean(account?.refreshToken),
    scope: account?.scope || '',
    skill: 'pptx-deck-edit',
    tool: 'google_slides',
  };
}

function googleRedirectUri(ctx) {
  return `${ctx.webServer.getOrigin()}${ROUTE}/oauth/google/callback`;
}

function recordPayload(record) {
  if (!record || record.kind !== 'grant' || !record.payload || typeof record.payload !== 'object') return undefined;
  return record.payload;
}

async function readAccount(ctx) {
  return recordPayload(await ctx.credentials.readRecord(ACCOUNT_KEY));
}

async function writeAccount(ctx, account) {
  await ctx.credentials.modifyRecord(ACCOUNT_KEY, async (current) => {
    const previous = recordPayload(current) || {};
    return { kind: 'grant', payload: { ...previous, ...account } };
  });
}

async function deleteAccount(ctx) {
  await ctx.credentials.deleteRecord(ACCOUNT_KEY);
}

async function replaceAccount(ctx, account) {
  await ctx.credentials.modifyRecord(ACCOUNT_KEY, async () => ({ kind: 'grant', payload: account }));
}

async function disconnectAccount(ctx) {
  const account = await readAccount(ctx);
  await deleteAccount(ctx);
  const token = account?.refreshToken || account?.accessToken;
  if (!token) return;
  try {
    const signal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(5000) : undefined;
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
      signal,
    });
  } catch {
    // Local sign-out already happened; best-effort revocation is enough.
  }
}

async function resolveClient(ctx) {
  const saved = recordPayload(await ctx.credentials.readRecord(CLIENT_KEY)) || {};
  const envId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const envSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const clientId = (saved.clientId || envId || '').trim();
  const clientSecret = (saved.clientSecret || envSecret || '').trim();
  return {
    clientId,
    clientSecret,
    source: saved.clientId ? 'saved' : envId ? 'env' : 'none',
  };
}

async function saveClient(ctx, body) {
  if (body.clear === true) {
    await ctx.credentials.deleteRecord(CLIENT_KEY);
    await deleteAccount(ctx);
    return;
  }
  const clientId = String(body.clientId || '').trim();
  const providedSecret = body.clientSecret === undefined || body.clientSecret === null
    ? undefined
    : String(body.clientSecret).trim();
  if (!clientId) throw httpError(400, 'Client ID is required.', 'missing_client_id');
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    throw httpError(400, 'That does not look like a Google OAuth client ID. It should end with ".apps.googleusercontent.com".', 'invalid_client_id');
  }
  await ctx.credentials.modifyRecord(CLIENT_KEY, async (current) => {
    const previous = recordPayload(current) || {};
    const keepPreviousSecret = previous.clientId === clientId ? previous.clientSecret : undefined;
    const clientSecret = providedSecret || keepPreviousSecret;
    return {
      kind: 'grant',
      payload: { clientId, ...(clientSecret ? { clientSecret } : {}) },
    };
  });
}

async function startOAuth(ctx, pending) {
  const client = await resolveClient(ctx);
  if (!client.clientId) throw httpError(400, 'Set a Google OAuth client ID in Settings → Google Slides first.', 'not_configured');
  const redirectUri = googleRedirectUri(ctx);
  const state = randomBytes(24).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const now = Date.now();
  for (const [key, entry] of pending) {
    if (now - entry.createdAt > PENDING_TTL_MS) pending.delete(key);
  }
  pending.set(state, {
    verifier,
    redirectUri,
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    createdAt: now,
  });
  const params = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent select_account',
    include_granted_scopes: 'true',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return { authUrl: `${AUTH_URL}?${params.toString()}`, redirectUri };
}

async function finishOAuth(ctx, pending, url) {
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state') || '';
  const entry = pending.get(state);
  pending.delete(state);
  if (error) {
    throw httpError(400, `Google sign-in was cancelled or refused (${error}).`, 'oauth_denied');
  }
  if (!entry || Date.now() - entry.createdAt > PENDING_TTL_MS) {
    throw httpError(400, 'This Google sign-in attempt expired. Start again from Settings → Google Slides.', 'oauth_state');
  }
  const code = url.searchParams.get('code');
  if (!code) throw httpError(400, 'Google did not return an authorization code.', 'oauth_code');

  const form = new URLSearchParams({
    client_id: entry.clientId,
    redirect_uri: entry.redirectUri,
    code,
    code_verifier: entry.verifier,
    grant_type: 'authorization_code',
  });
  if (entry.clientSecret) form.set('client_secret', entry.clientSecret);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok || !data?.access_token) {
    const detail = data?.error_description || data?.error || text.slice(0, 300) || `HTTP ${response.status}`;
    throw httpError(502, `Google token exchange failed: ${detail}`, 'oauth_exchange');
  }

  let profile = {};
  try {
    const info = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${data.access_token}` },
    });
    if (info.ok) {
      const body = await info.json();
      profile = {
        sub: typeof body.sub === 'string' ? body.sub : '',
        email: typeof body.email === 'string' ? body.email : '',
        name: typeof body.name === 'string' ? body.name : '',
        picture: typeof body.picture === 'string' ? body.picture : '',
      };
    }
  } catch {
    // The grant is still usable without profile details.
  }

  await replaceAccount(ctx, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || '',
    tokenType: data.token_type || 'Bearer',
    scope: data.scope || SCOPES.join(' '),
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    obtainedAt: Date.now(),
    ...profile,
  });
}

async function getAccessToken(ctx, force = false) {
  const account = await readAccount(ctx);
  if (!account?.accessToken && !account?.refreshToken) {
    throw httpError(401, 'Google account is not connected. Open Settings → Google Slides and sign in.', 'not_connected');
  }
  if (!force && account.accessToken && account.expiresAt && account.expiresAt > Date.now() + 60_000) {
    return account.accessToken;
  }
  if (!account.refreshToken) {
    if (account.accessToken) return account.accessToken;
    throw httpError(401, 'Google sign-in has expired. Reconnect in Settings → Google Slides.', 'google_reauth');
  }
  if (!tokenRefresh) {
    tokenRefresh = refreshAccount(ctx, account).finally(() => { tokenRefresh = undefined; });
  }
  return tokenRefresh;
}

async function refreshAccount(ctx, account) {
  const client = await resolveClient(ctx);
  if (!client.clientId) {
    throw httpError(401, 'Google OAuth client is not configured. Open Settings → Google Slides.', 'not_configured');
  }
  const form = new URLSearchParams({
    client_id: client.clientId,
    refresh_token: account.refreshToken,
    grant_type: 'refresh_token',
  });
  if (client.clientSecret) form.set('client_secret', client.clientSecret);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok || !data?.access_token) {
    const detail = data?.error_description || data?.error || text.slice(0, 300) || `HTTP ${response.status}`;
    if (data?.error === 'invalid_grant') {
      await deleteAccount(ctx);
      throw httpError(401, 'Google sign-in is no longer valid. Reconnect in Settings → Google Slides.', 'google_reauth');
    }
    throw httpError(502, `Google token refresh failed: ${detail}`, 'google_refresh');
  }
  const next = {
    accessToken: data.access_token,
    tokenType: data.token_type || account.tokenType || 'Bearer',
    scope: data.scope || account.scope || SCOPES.join(' '),
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
  };
  await writeAccount(ctx, next);
  return next.accessToken;
}

async function authorizedFetch(ctx, url, init = {}, retry = true) {
  const token = await getAccessToken(ctx);
  const headers = new Headers(init.headers || {});
  headers.set('authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });
  if (response.status === 401 && retry) {
    const refreshed = await getAccessToken(ctx, true);
    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set('authorization', `Bearer ${refreshed}`);
    return fetch(url, { ...init, headers: retryHeaders });
  }
  return response;
}

async function googleError(response) {
  const text = await response.text();
  const data = parseJson(text);
  const detail = data?.error?.message || data?.error_description || text.slice(0, 400) || `HTTP ${response.status}`;
  return httpError(response.status || 502, `Google API error: ${detail}`, 'google_api');
}

async function listFiles(ctx, query, limit) {
  const pageSize = Math.max(1, Math.min(Number(limit) || 20, 100));
  const url = new URL(`${DRIVE_URL}/files`);
  url.searchParams.set(
    'q',
    (query && String(query).trim()) || `mimeType='${SLIDES_MIME}' and trashed=false`,
  );
  url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size)');
  url.searchParams.set('orderBy', 'modifiedTime desc');
  url.searchParams.set('pageSize', String(pageSize));
  const response = await authorizedFetch(ctx, url);
  if (!response.ok) throw await googleError(response);
  const data = await response.json();
  return Array.isArray(data.files) ? data.files : [];
}

async function exportFile(ctx, fileId, mimeType, requestedPath, extension, exec, deckStore) {
  const id = String(fileId || '').trim();
  if (!id) throw new Error('file_id is required for export/pdf.');
  const target = await resolveWorkspacePath(ctx, exec, requestedPath, `google-slides-${safeFileId(id)}${extension}`);
  const metaPromise = fetchDeckMeta(ctx, id);
  const url = new URL(`${DRIVE_URL}/files/${encodeURIComponent(id)}/export`);
  url.searchParams.set('mimeType', mimeType);
  const response = await authorizedFetch(ctx, url);
  if (!response.ok) throw await googleError(response);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(target, bytes);
  const meta = await metaPromise;
  await rememberDeck(ctx, deckStore, exec, {
    fileId: id,
    name: meta.name || `Slides ${safeFileId(id)}`,
    webViewLink: meta.webViewLink,
    mimeType: meta.mimeType || SLIDES_MIME,
    source: extension === '.pdf' ? 'pdf' : 'export',
    localPath: target,
  });
  return {
    ok: true,
    fileId: id,
    name: meta.name,
    webViewLink: meta.webViewLink,
    path: target,
    bytes: bytes.length,
    mimeType,
  };
}

async function fetchDeckMeta(ctx, fileId) {
  try {
    const url = new URL(`${DRIVE_URL}/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('fields', 'id,name,mimeType,webViewLink,modifiedTime');
    const response = await authorizedFetch(ctx, url);
    if (!response.ok) return {};
    const data = await response.json();
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

async function rememberDeck(ctx, deckStore, exec, deck) {
  try {
    let workspace = '';
    if (exec?.agent) {
      workspace = await ctx.workingDirectory.ensure(exec.agent, exec.signal);
    } else {
      workspace = ctx.workingDirectory?.defaultDirectory || '';
    }
    return await deckStore.remember({
      ...deck,
      sessionId: exec?.agent?.id || '',
      workspace,
    });
  } catch (error) {
    ctx.logger.warn(`[dsh-slide] could not remember deck ${deck?.fileId || '?'}: ${errorMessage(error)}`);
    return undefined;
  }
}

async function importFile(ctx, inputPath, name, parentId, exec, deckStore) {
  if (!inputPath) throw new Error('path is required for import.');
  const source = await resolveWorkspacePath(ctx, exec, inputPath, undefined, { mustExist: true });
  const info = await lstat(source);
  if (!info.isFile()) throw new Error(`Not a regular file: ${source}`);
  if (info.size > MAX_UPLOAD_BYTES) throw new Error(`File is too large to upload (${info.size} bytes; limit ${MAX_UPLOAD_BYTES}).`);
  const bytes = await readFile(source);
  const boundary = `dsh-slide-${randomUUID()}`;
  const metadata = {
    name: String(name || path.basename(source, path.extname(source))).slice(0, 200),
    mimeType: SLIDES_MIME,
  };
  if (parentId) metadata.parents = [String(parentId)];
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
    + `${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${PPTX_MIME}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([head, bytes, tail]);
  const response = await authorizedFetch(
    ctx,
    `${UPLOAD_URL}?uploadType=multipart&fields=id,name,webViewLink`,
    {
      method: 'POST',
      headers: { 'content-type': `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  if (!response.ok) throw await googleError(response);
  const data = await response.json();
  await rememberDeck(ctx, deckStore, exec, {
    fileId: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
    mimeType: SLIDES_MIME,
    source: 'import',
    localPath: source,
  });
  return { ok: true, id: data.id, name: data.name, webViewLink: data.webViewLink };
}

function safeFileId(id) {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40) || 'deck';
}

async function resolveWorkspacePath(ctx, exec, requestedPath, defaultName, options = {}) {
  if (!defaultName && !requestedPath) throw new Error('A workspace path is required.');
  const cwd = exec.agent
    ? await ctx.workingDirectory.ensure(exec.agent, exec.signal)
    : ctx.workingDirectory.defaultDirectory;
  const root = await realpath(cwd);
  const target = path.resolve(root, String(requestedPath || defaultName));
  if (!isInside(root, target)) {
    throw new Error(`Path must stay inside the workspace: ${target}`);
  }
  const directory = path.dirname(target);
  if (options.mustExist) {
    const existing = await realpath(target).catch(() => undefined);
    if (!existing || !isInside(root, existing)) {
      throw new Error(`File is missing or outside the workspace: ${target}`);
    }
    return existing;
  }
  await mkdir(directory, { recursive: true });
  const realDirectory = await realpath(directory);
  if (!isInside(root, realDirectory)) throw new Error(`Path must stay inside the workspace: ${target}`);
  try {
    const info = await lstat(target);
    if (info.isSymbolicLink()) throw new Error(`Refusing to write through a symbolic link: ${target}`);
    if (info.isDirectory()) throw new Error(`Target is a directory: ${target}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return target;
}

function isInside(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

/* ----------------------------------------------------------------------------
 * HTTP routes
 * ------------------------------------------------------------------------- */

function registerRoutes(ctx, pending, deckStore) {
  const route = (path, handler) => ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path, handler }),
    `dsh-slide: route ${path}`,
  );
  const api = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendApiError(ctx, res, error);
    }
  };

  route(`${ROUTE}/api/status`, api(async (req, res) => {
    requireMethod(req, 'GET');
    sendJson(res, 200, await getStatus(ctx));
  }));

  route(`${ROUTE}/api/config`, api(async (req, res) => {
    if (req.method === 'GET') {
      const status = await getStatus(ctx);
      sendJson(res, 200, {
        configured: status.configured,
        clientId: status.clientId,
        clientSource: status.clientSource,
        hasClientSecret: status.hasClientSecret,
        redirectUri: status.redirectUri,
      });
      return;
    }
    requireMethod(req, 'POST');
    assertSameOrigin(ctx, req);
    const body = await readJson(req);
    await saveClient(ctx, body);
    sendJson(res, 200, { ok: true, ...(await getStatus(ctx)) });
  }));

  route(`${ROUTE}/api/google/start`, api(async (req, res) => {
    requireMethod(req, 'POST');
    assertSameOrigin(ctx, req);
    sendJson(res, 200, await startOAuth(ctx, pending));
  }));

  route(`${ROUTE}/api/google/disconnect`, api(async (req, res) => {
    requireMethod(req, 'POST');
    assertSameOrigin(ctx, req);
    await disconnectAccount(ctx);
    sendJson(res, 200, { ok: true, ...(await getStatus(ctx)) });
  }));

  route(`${ROUTE}/oauth/google/callback`, async (req, res) => {
    try {
      if (req.method !== 'GET') throw httpError(405, 'Method not allowed.', 'method');
      await finishOAuth(ctx, pending, new URL(req.url || '/', 'http://localhost'));
      sendHtml(res, 200, callbackPage(true, 'Google account connected. You can close this window.'));
    } catch (error) {
      const message = errorMessage(error);
      ctx.logger.warn(`[dsh-slide] Google callback failed: ${message}`);
      sendHtml(res, 200, callbackPage(false, message));
    }
  });

  route(`${ROUTE}/api/drive/files`, api(async (req, res) => {
    requireMethod(req, 'GET');
    const url = new URL(req.url || '/', 'http://localhost');
    sendJson(res, 200, {
      ok: true,
      files: await listFiles(ctx, url.searchParams.get('q'), url.searchParams.get('limit')),
    });
  }));

  route(`${ROUTE}/api/decks`, api(async (req, res) => {
    requireMethod(req, 'GET');
    sendJson(res, 200, { ok: true, decks: await deckStore.list() });
  }));

  route(`${ROUTE}/api/decks/open`, api(async (req, res) => {
    requireMethod(req, 'POST');
    assertSameOrigin(ctx, req);
    const body = await readJson(req);
    const fileId = String(body.fileId || '').trim();
    if (!fileId) throw httpError(400, 'fileId is required.', 'missing_file_id');
    const deck = await deckStore.touch(fileId);
    if (!deck) throw httpError(404, 'That deck is no longer in the list.', 'deck_missing');
    sendJson(res, 200, { ok: true, deck });
  }));

  route(`${ROUTE}/api/decks/forget`, api(async (req, res) => {
    requireMethod(req, 'POST');
    assertSameOrigin(ctx, req);
    const body = await readJson(req);
    const fileId = String(body.fileId || '').trim();
    if (!fileId) throw httpError(400, 'fileId is required.', 'missing_file_id');
    sendJson(res, 200, { ok: true, removed: await deckStore.forget(fileId) });
  }));
}

function requireMethod(req, method) {
  if (req.method !== method) throw httpError(405, `Use ${method}.`, 'method');
}

const DESKTOP_SHELL_ORIGIN = 'dsh-app://app';

function assertSameOrigin(ctx, req) {
  const origin = req.headers.origin;
  if (!origin) return;
  // The desktop shell serves the Web GUI from its private `dsh-app://app`
  // origin and proxies requests to this server. That origin is first-party,
  // so it is allowed alongside the bound Web origin.
  if (origin === DESKTOP_SHELL_ORIGIN) return;
  const expected = ctx.webServer.getOrigin();
  if (origin === expected) return;
  // A browser may reach the same loopback listener as localhost or 127.0.0.1.
  // Keep the comparison to loopback pairs so a rebinding host never matches.
  try {
    const actualUrl = new URL(origin);
    const expectedUrl = new URL(expected);
    const loopback = new Set(['127.0.0.1', 'localhost', '[::1]']);
    if (actualUrl.protocol === expectedUrl.protocol
      && actualUrl.port === expectedUrl.port
      && loopback.has(actualUrl.hostname)
      && loopback.has(expectedUrl.hostname)) return;
  } catch {
    // Fall through to the rejection below.
  }
  throw httpError(403, 'Cross-origin request refused.', 'origin');
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_JSON_BYTES) throw httpError(413, 'Request body is too large.', 'body');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object');
    return value;
  } catch {
    throw httpError(400, 'Request body must be a JSON object.', 'json');
  }
}

function sendJson(res, status, value) {
  if (res.headersSent) return;
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': body.length,
  });
  res.end(body);
}

function sendApiError(ctx, res, error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const code = typeof error?.code === 'string' ? error.code : 'internal_error';
  const message = status >= 500 && !error?.status
    ? 'The slide extension hit an unexpected error. Check the Host log for details.'
    : errorMessage(error);
  ctx.logger.warn(`[dsh-slide] ${code}: ${errorMessage(error)}`);
  sendJson(res, status, { ok: false, error: code, message });
}

function sendHtml(res, status, html) {
  if (res.headersSent) return;
  const body = Buffer.from(html);
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': body.length,
  });
  res.end(body);
}

function callbackPage(ok, message) {
  const safeMessage = escapeHtml(message);
  const title = ok ? 'Google account connected' : 'Google sign-in failed';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#f5f7fb; color:#172033; }
  main { width:min(420px, calc(100vw - 48px)); background:#fff; border:1px solid #dfe5ef; border-radius:16px; padding:28px; box-shadow:0 12px 40px rgba(23,32,51,.10); }
  .mark { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; font-size:22px; background:${ok ? '#e9f7ef' : '#fdecec'}; color:${ok ? '#157347' : '#b42318'}; }
  h1 { font-size:18px; margin:16px 0 8px; }
  p { margin:0; color:#5b6475; overflow-wrap:anywhere; }
  small { display:block; margin-top:16px; color:#8a93a5; }
  @media (prefers-color-scheme: dark) {
    body { background:#11151d; color:#eef2f8; }
    main { background:#1a202b; border-color:#2b3442; }
    p { color:#aab4c5; }
  }
</style>
</head>
<body>
<main>
  <div class="mark">${ok ? '✓' : '!'}</div>
  <h1>${title}</h1>
  <p>${safeMessage}</p>
  <small>${ok ? 'Returning to DeepSeek Harness…' : 'You can close this window and try again.'}</small>
</main>
<script>
  (function () {
    var ok = ${ok ? 'true' : 'false'};
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'dsh-slide:google-auth', ok: ok, message: ${JSON.stringify(message).replaceAll('<', '\\u003c')} }, window.location.origin);
      }
    } catch (error) {}
    if (ok) {
      if (window.opener) setTimeout(function () { window.close(); }, 700);
      else setTimeout(function () { window.location.replace('/'); }, 1200);
    }
  })();
</script>
</body>
</html>`;
}

/* ----------------------------------------------------------------------------
 * Small utilities
 * ------------------------------------------------------------------------- */

function httpError(status, message, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
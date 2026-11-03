# Development notes

Maintainer documentation for `dsh-plugin-google-slides`. User-facing docs live in
[`README.md`](../README.md) and [`README.zh.md`](../README.zh.md).

## Layout

| File | Role |
|---|---|
| `index.js` | Host plugin: skill registration, the `/slide` command, OAuth loopback flow, credential records, Drive API, `google_slides` tool, HTTP routes. |
| `decks.js` | Host: durable deck list, atomic JSON records, 200-record prune. |
| `comments.js` | Host: pure Drive comment-thread shapes — normalization, resolution state, reply cap, deep links. No network, no credentials. |
| `client.js` | Client plugin: `settings.section` page, **Decks** panel (`main` + `sidebar.panellist`), localized en/zh dictionaries, sign-in popup and status polling. |
| `cordis.patch.yml` | Inserts the Host row `dsh-slide`, whose module name is the package name. |
| `locale/{en,zh}.json` | Plugin Manager title and description. |
| `icon.svg` | Original deck/slide icon. |
| `pptx-deck-edit/` | The portable edit skill, with a DSH runtime note and two house rules added: a text edit includes its speaker note, and Chinese copy follows `ZH-COPY.md`. |
| `deck-design/` | The build/rebuild skill: copy standards, speaker notes, design system, space math, question protocol, 3-slide progress grid (`checkpoint.py`), `deck_lint.py`, and the python-pptx geometry kit (`diagram_kit.py`). |
| `scripts/` | `smoke-decks.mjs` (deck store tests), `smoke-comments.mjs` (comment shapes, the count route, and the `comments` tool action), and `migrate-credentials.mjs` (pre-0.2.1 credential keys). |
| `docs/` | This file, plus internal review notes that are not part of the published bundle. |

Two naming rules are load-bearing under DSH:

- the patch row `name` must equal the package name, so the loader can resolve it;
- the `window.__ModuleLoader__.load({ id })` in `client.js` must equal the package
  name (`references/ui-plugin.md` in the plugin-development skill states this).

Rename both together, or the client bundle stops attaching.

## Routes

- `GET  /dsh-slide/api/status`
- `GET/POST /dsh-slide/api/config`
- `POST /dsh-slide/api/google/start`
- `POST /dsh-slide/api/google/disconnect`
- `GET  /dsh-slide/oauth/google/callback`
- `GET  /dsh-slide/api/drive/files`
- `GET  /dsh-slide/api/decks`
- `GET  /dsh-slide/api/decks/comments?fileIds=<id>,<id>` — open-comment counts for
  decks this profile has registered; unregistered ids are dropped before Drive is
  called, and answers are cached for 60 s.
- `POST /dsh-slide/api/decks/open`
- `POST /dsh-slide/api/decks/forget`

## Credential records

- `dsh-slide/google-client` — saved OAuth client ID/secret.
- `dsh-slide/google-account` — access token, refresh token, expiry, scope, account profile.

DSH 0.2.1 changed credential records to the `<scope>/<id>` key grammar. The Host
validates the whole store while the `credentials` plugin loads, so one legacy
record such as `dsh-slide.google.client` makes startup fail before any plugin —
including this one — can repair it. If someone signed in with an older build,
migrate once with DSH stopped:

```bash
node scripts/migrate-credentials.mjs --dry-run   # show the planned renames
node scripts/migrate-credentials.mjs             # back up, then rewrite
```

The script reads `$DSH_HOME/.credentials.yaml` (default `~/.dsh/.credentials.yaml`),
renames legacy `dsh-slide.*` keys, keeps a timestamped `600` backup, and reports
any other key that still violates the grammar.

## Local checks

```bash
node --check index.js && node --check decks.js && node --check comments.js && node --check client.js
npm run smoke
python3 deck-design/scripts/deck_lint.py <deck>.pptx
python3 deck-design/scripts/checkpoint.py --help
```

`npm run smoke` runs both suites. `scripts/smoke-decks.mjs` covers `decks.js` list
order, touch, forget, invalid ids, hostile fields, 20 concurrent writers, and the
200-record prune. `scripts/smoke-comments.mjs` covers thread normalization
(control characters, reply cap, resolve/reopen order), `disco` deep links,
the signed-out and signed-in count route, the 60-second cache, unregistered ids
never reaching Drive, the `comments` tool action with and without
`include_resolved`, and the rendered text for zero and several threads.

## Release checklist

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. `npm pack --dry-run` and confirm the tarball holds both READMEs, `LICENSE`,
   the two skill directories, `scripts/`, `locale/`, `cordis.patch.yml`,
   `icon.svg`, and the referenced screenshots — and no `__pycache__`.
3. Install the packed tarball in a scratch profile and check: Settings section
   renders in both languages and both themes, the skill catalog lists both
   skills, `google_slides` answers `status`, a `comments` read returns the
   threads on a deck the test account can read, and the Decks panel lists a
   record with its comment chip.
4. `npm publish`.

## Verification log

Collected while building the plugin against DSH 0.2.1-rc.3 … 0.2.1-rc.5.

- Host and Client JavaScript pass `node --check`.
- A stub-Context test of `index.js` registers `/slide` with the brief hint; its
  handler queues exactly one user-role message carrying the brief, and an empty
  brief returns the usage error.
- The bundle deactivates and reactivates with `application: applied`; the Host
  command service is present, so registration runs in the live profile.
- `deck-design` registers alongside `pptx-deck-edit`; its lint runs against a
  real 22-slide deck and a 28-slide comparison deck.
- `checkpoint.py` composes a labelled 3-up grid from rendered PNGs
  (2400×608 for three 16:9 slides).
- `npm run smoke` passes: list order, touch, forget, invalid ids, hostile
  fields, 20 concurrent writers, and the 200-record prune.
- The three deck routes pass in the same stub Host: list, open (updates
  `openedAt`), 404 for an unknown deck, 403 for a foreign origin, and forget.
- Live slot inspection shows `dsh-slide.decks` active in both `main` and
  `sidebar.panellist`.
- `deck_lint.py` flags decorative tags such as `01 · 今天` as
  `copy.eyebrow-tag`, separately from hard copy failures.
- The notes gate fires on a deck with no notes (`notes.missing`, exit 1) and
  passes with `--no-notes`; the Chinese checks catch the two worked pages in
  `ZH-COPY.md` (`1 分钟发完`, `写完，`, `示例来自…`, `代码与资源类型实查`,
  `唯一写入者`, `之所以`) and stay quiet on the rest of that deck.
- `AI-Foundation-Proposal-2026-11.pptx` carries 16 speaker notes (94 字 average)
  and revised P05/P10 copy; it renders clean and lints at 82/100 with no new
  hard failures.
- Verified live on DSH 0.2.1-rc.3: Host boot, credential read/write/delete,
  `google_slides` schema, `pptx-deck-edit` catalog entry, Settings section, and
  a Drive `list` against a connected account.
- The bundle installed with `application: applied` and no warnings.
- `pptx-deck-edit` appears in the live skill catalog; loading it returns the
  bundled instructions and resource directory.
- `google_slides` appears in the live tool schema with `status`, `list`,
  `export`, `import`, and `pdf`.
- `GET /dsh-slide/api/status` returns the redirect URI and connection state.
- OAuth start returns a Google authorization URL with PKCE and `state`; the
  desktop shell hands it to the system browser, and the Web popup reaches
  Google's consent/error page.
- The same-origin guard accepts `dsh-app://app` and loopback aliases while
  rejecting foreign origins and foreign loopback protocols.
- The Settings page renders in Chinese/English and light/dark themes
  (screenshots in `screenshots/`).
- The comment bridge is covered by `scripts/smoke-comments.mjs` against a stubbed
  Drive: thread shapes, `disco` links, the count route (signed out, signed in,
  cached, unregistered ids dropped), the `comments` action (open, resolved, short
  quote, no quote), and `update` (one `PATCH`, the packed bytes, the deck record
  source, and the missing-path/missing-id errors).
- Live check, 2026-11-03, against the user's proposal deck: `comments` returned
  the thread with author, quoted text, and a `disco` link; the deck reported
  `editable`; the count route answered `{"unresolved":1,"total":1}`; an
  unregistered file id produced no counts and no Drive call.
- Live `update` against a throwaway deck ("dsh-slide update test"): imported a
  one-slide v1, `PATCH`ed v2 onto the same file id, re-exported, and read the
  exported slide back as `update test v2`. The file id and link did not change.
- The Host picks up new tool code by disabling and re-enabling the bundle; no app
  restart is needed for the Host half. The Client half (panel cards) still needs
  a page reload or a restart.

Not verified without user credentials: an actual Google consent round-trip and a
live Drive export/import. Those need a real OAuth client ID/secret and a Google
account.

The composer's `/` menu entry and a real `/slide` task turn were not exercised
from the session that built the command: the standalone Web page requires the
process launch token, and invoking the command would start a new deck turn. The
registration path and the queued message shape are covered by the stub-Context
test above.
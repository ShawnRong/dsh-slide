---
description: "Build and edit slide decks in DSH, with two bundled deck skills, a Google sign-in, a google_slides tool, and a Decks panel for recent decks."
kind: "package-bundle"
---

# dsh-plugin-google-slides

English | [中文](README.zh.md)

## Summary

A DSH plugin for making and editing decks. It ships two skills — `deck-design` (build or rebuild) and `pptx-deck-edit` (edit an existing `.pptx` without losing its design) — plus the machinery those skills need: a Google account sign-in, a `google_slides` agent tool that moves decks between Google Slides and local `.pptx` files, and a **Decks** panel that reopens whatever the agent touched.

No build step, no tokens in the model context, no credentials in the repository.

| You get | Where |
|---|---|
| `deck-design` and `pptx-deck-edit` skills | Skill catalog |
| `google_slides` tool (`status`, `list`, `export`, `import`, `pdf`, `comments`) | Agent tools |
| **Google Slides** account setup | Settings |
| **Decks** panel (中文「幻灯片」) | Left sidebar |
| `/slide <brief>` command | Composer |

## Table of Contents

- [Requirements](#requirements)
- [Install](#install)
- [Connect a Google account](#connect-a-google-account)
- [Use it](#use-it)
- [Privacy and security](#privacy-and-security)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [Development](#development)

## Requirements

- **DSH 0.2.1-rc.3 or newer.** `package.json` declares `engines.dsh`, so the plugin manager refuses an older Harness at install time instead of failing later.
- **Python 3.9+** on `PATH` with `python-pptx`, `lxml`, and `Pillow`. The DSH Desktop runtime bundles these; from a source or CLI install run `pip install python-pptx lxml pillow`.
- **LibreOffice (`soffice`) and poppler (`pdftoppm`)** for the visual pass (`pptx-deck-edit/scripts/render.sh`). Optional if you only lint decks or render through Google's own PDF export.
- **Your own Google Cloud OAuth client** — only if you want the Google Slides half. The plugin never ships credentials.

```bash
# macOS
brew install --cask libreoffice && brew install poppler
# Debian / Ubuntu
sudo apt install libreoffice-impress poppler-utils
```

## Install

From the Web or Desktop UI: **Plugins → Add plugin**, then paste one of these into the field:

```text
dsh-plugin-google-slides                                        # npm
https://github.com/ShawnRong/dsh-slide                          # GitHub
/absolute/path/to/dsh-slide                                     # local directory
```

The same operation from a shell:

```bash
dsh plugin add dsh-plugin-google-slides
```

The plugin installs into the **current profile**, so every session in that profile gets it. Turn it off or remove it from the same Plugins page; the Host rows and the Client panel disappear with it.

After installation, check that it landed:

- **Settings** shows a **Google Slides** section;
- the left sidebar shows **Decks**;
- the skill catalog lists `deck-design` and `pptx-deck-edit`;
- the agent can call `google_slides` with `action: "status"`.

## Connect a Google account

The plugin does not ship an OAuth client — a client ID identifies *your* Google Cloud project. Create one once:

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select a project and enable **Google Drive API** under **APIs & Services → Library**.
3. Configure the **OAuth consent screen**. While the app is in **Testing**, add your Google account under **Test users**.
4. Create an OAuth client ID:
   - **Desktop app** is the simplest choice, because Google accepts the loopback redirect on any port.
   - **Web application** works too, but the exact redirect URI must be registered.
5. In DSH, open **Settings → Google Slides**, paste the client ID and client secret, then click **Save client**.
6. Click **Sign in with Google**. The Web UI opens Google's consent page in a popup; the Desktop app hands it to your default browser and switches the page to the connected account when the callback arrives. Nothing needs to be copied back.

![Google Slides settings page](screenshots/settings-google-slides-final.png)

The page displays the exact redirect URI to register:

```text
http://127.0.0.1:<port>/dsh-slide/oauth/google/callback
```

`<port>` is the port the Web GUI currently runs on; read it off the settings page rather than assuming. A **Desktop app** client avoids the problem entirely, because the port may change between launches.

### Scopes

| Scope | Why |
|---|---|
| `openid`, `email`, `profile` | Show which account is connected. |
| `https://www.googleapis.com/auth/drive.file` | Import new Slides files and access files this app created. |
| `https://www.googleapis.com/auth/drive.readonly` | Export existing Slides decks the user can read. |

Google may require OAuth verification before sensitive scopes work for accounts outside your test users.

### Configure without the UI

Set these in the Host environment before starting DSH; saved UI values take priority.

```bash
export GOOGLE_CLIENT_ID="…apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="…"
```

## Use it

### The two skills

| Skill | Use it for | What it enforces |
|---|---|---|
| `deck-design` | A new deck, or a full redesign | One claim per slide, diagram-first layouts, per-slide text budgets, a Chinese wording standard, a speaker note on every slide, a 3-up preview every three slides, and `deck_lint.py` before delivery. |
| `pptx-deck-edit` | Targeted edits inside an existing deck | Offline OOXML round-trip: export → unpack → edit in batches → render and inspect → pack → re-import. Brand assets keep their position and size. |

`deck-design` carries its own reference library: `DIAGRAM-PATTERNS.md` (boundary, swimlane, tree, staircase, trunk + glue), `DESIGN-SYSTEM.md` (type scale, grid, density budget, layout archetypes), `SPATIAL.md` (PPTX vertical budget), `ANTI-SLOP.md` (AI tells and their rewrites), `ZH-COPY.md` (Chinese wording, with worked before/after pages), `SPEAKER-NOTES.md`, `QUESTIONS.md`, and `REVIEW-CADENCE.md`.

### `/slide <brief>`

Type `/slide 给管理层做一份 10 页的 Q4 复盘` in the composer. The command turns the brief into an ordinary user message queued with the live agent, so the task runs through the same inbox, session log, and turn lifecycle as a typed prompt. The composed message picks the right skill, sets the diagram-first and copy rules, requires speaker notes, asks for a 3-up preview every three slides, keeps the `.pptx` in the working directory, runs the lint before delivery, and imports to Google Slides once at the end.

`/slide` with no brief returns a usage error.

### `google_slides`

| action | purpose |
|---|---|
| `status` | Check whether a Google account is connected. |
| `list` | List Google Slides decks (optional Drive `query`, `limit`). |
| `export` | Download a deck as `.pptx` into the workspace. |
| `pdf` | Download Google's own PDF rendering into the workspace. |
| `import` | Upload a local `.pptx` as a **new** Google Slides file. |
| `update` | Replace an existing deck's content in place: same file id, link, sharing, and comments; the previous content stays in version history. |
| `comments` | List a deck's open comment threads: author, the text each one quotes, the replies, and a link that opens the thread in Google Slides. |

A typical round trip:

```text
google_slides export file_id=<deck-id> path=work/deck/original.pptx
# edit with pptx-deck-edit, or build with deck-design
python3 deck-design/scripts/deck_lint.py work/deck/final.pptx
google_slides update file_id=<deck-id> path=work/deck/final.pptx   # same file, same link
google_slides pdf file_id=<deck-id> path=work/deck/final-google.pdf
```

`update` writes the packed `.pptx` back into the deck the user is looking at, so its link, sharing, and comment threads survive; Google keeps the replaced content as a version revision. Use `import` when the user wants a separate copy instead.

`export`, `pdf`, `import`, and `update` accept paths inside the current session workspace only; symlink escapes are rejected.

### Comments

`comments` answers "what did the reviewers say". It returns the open threads on one deck — author, the text the thread quotes, any replies, whether it is resolved, and a `disco` link that opens that exact thread in Google Slides:

```text
google_slides comments file_id=<deck-id>
```

A thread quotes text rather than a slide number, so the agent finds the page by searching the exported slides (`inventory.py`). Reading is the whole bridge:

- comments are **read-only** here. The plugin never posts replies or resolves threads; after the edited deck is written back with `update`, the agent lists the threads that are now addressed so you can resolve them.
- `include_resolved: true` adds threads that are already closed; the default is open ones only.
- A thread on a deck you can only read still lists fine — reading needs `drive.readonly`, which sign-in already grants.

### Decks panel

The left sidebar gains **Decks** (中文「幻灯片」). It lists every deck the tool imported, exported, or rendered, newest first. Click a card to return to the conversation that worked on it and open the deck in the right sidebar, next to the chat. **Google Slides** opens the deck in a new tab; the trash button removes only the local record, never the Drive file.

Records hold the Drive file id, title, link, the session that touched it, the workspace path, the last local file, and timestamps — never a token. They live in `$DSH_HOME/dsh-slide/decks/` (default `~/.dsh/dsh-slide/decks/`), survive restarts, and are pruned to the 200 most recent. The panel refreshes on open, when the window becomes visible again, and every 15 seconds.

Cards carry an open-comment count in the top-left corner. Those counts are the panel's only Drive call: one batched request for the first twelve cards, cached in the Host for a minute, and skipped when the account is signed out. Comment text never enters the panel; a card tells you how many threads are waiting, and the agent reads the words.

### Deck quality gate

```bash
python3 deck-design/scripts/deck_lint.py deck.pptx
python3 deck-design/scripts/deck_lint.py deck.pptx --json
```

The lint reports a content and design score plus hard failures for: a slide with no speaker note (`--no-notes` opts out), AI tells such as “不是…而是…”, “一页看懂”, meta citations and invented section tags like `01 · 今天`, type below 9 pt, 9–11 pt runs outside the footer, body copy over the density budget, more than ~14 shapes per slide, fewer than four distinct body compositions in a deck of ten or more slides, low-contrast text, text outside the canvas, and Chinese wording defects (bare result complements, footnotes that explain how the writer checked, translated-Chinese constructions, inconsistent number spacing).

The score is a tripwire, not a grade. In the review that produced it, agent-built proposals scored in the low 30s and a human-written comparison in the high 70s; the visual pass still decides.

## Privacy and security

- The model and the browser never receive an access or refresh token. Tokens stay in the Host credential store (`ctx.credentials`) and are refreshed by the Host.
- OAuth uses PKCE (`S256`) and a single-use `state` with a 10-minute lifetime.
- Signing out deletes the credential record and best-effort revokes the Google grant.
- Client changes and disconnects require a same-origin request: the bound Web origin, a loopback alias, or the Desktop shell's `dsh-app://app` origin.
- The client secret and tokens live in the Host credential store, never in `cordis.patch.yml` or the repository.
- Deck records hold titles, Drive file ids, session ids, workspace paths, and last export paths — never a token.
- Comment reading reuses the `drive.readonly` grant; thread text is returned to the agent and is never written to the deck records.
- The plugin runs in-process with your permissions. Install it from a source you trust.

Credential record keys: `dsh-slide/google-client` (saved OAuth client) and `dsh-slide/google-account` (access token, refresh token, expiry, scope, profile).

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `status` says not connected, sign-in button disabled | No OAuth client saved. Paste the client ID and secret in **Settings → Google Slides**, or set `GOOGLE_CLIENT_ID` before starting DSH. |
| `redirect_uri_mismatch` from Google | Register the exact URI shown on the settings page, or switch to a **Desktop app** client. |
| `list` returns nothing although decks exist | Wrong Google account, or the deck is not shared with it. `drive.readonly` covers decks you can read. |
| Export fails with a size error | Google refuses to export presentations over 10 MB. Inline fewer images, or download from Google Slides directly. |
| `missing soffice` / `missing pdftoppm` | Install LibreOffice and poppler; the visual pass shells out to both. |
| `ModuleNotFoundError: pptx` | Install `python-pptx` into the Python that `python3` resolves to. |
| Sign-in opened a blank tab in the Desktop app | Expected: the shell hands consent to your system browser and polls the Host. Use **Open sign-in page** if the tab was closed. |
| Decks panel says the conversation is gone | The record outlives its session; the card falls back to a normal browser window. |

## Limitations

- No Google credentials are bundled; each user supplies their own OAuth client.
- A consent screen in **Testing** mode only lets added test users sign in.
- In a normal browser the flow needs popups; the Desktop app uses the system browser instead.
- Previews in the Decks panel are drawn locally — Drive thumbnails would need an extra proxy.
- The comment bridge reads only. Replying and resolving happen in Google Slides; the plugin asks for no write scope beyond `drive.file`.
- Comment counts reach Drive only for decks this profile has registered, so the panel cannot be used to probe arbitrary file ids.
- The `/slide` command's own status text is bilingual, but the deck skills' copy standards are Chinese-first. `deck-design` states the rules and `ZH-COPY.md` is the worked reference; decks in other languages follow the same structure and are checked less strictly by the lint.

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the architecture, HTTP routes, credential layout, local checks, and the verification log.

```bash
node --check index.js && node --check decks.js && node --check comments.js && node --check client.js
npm run smoke        # deck store + comment bridge
python3 deck-design/scripts/deck_lint.py <deck>.pptx
```

## License

[MIT](LICENSE)
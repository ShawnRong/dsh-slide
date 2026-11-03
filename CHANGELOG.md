# Changelog

## 1.1.0 — comment bridge and in-place update

Closes the loop the baoyu-design review called P1: read what reviewers said, fix
the deck, and put it back where they left the comment.

- `google_slides` gained `comments`: the open threads on one deck, with the
  author, the quoted text, the replies, a `disco` deep link per thread, and
  `include_resolved` to add closed ones. Read-only — the plugin never posts a
  reply or resolves a thread.
- `google_slides` gained `update`: `PATCH` a packed `.pptx` onto an existing
  deck's file id, so the link, sharing, and comment threads survive and Google
  keeps the replaced content as a version revision. `import` still creates a new
  file; the tool description and both skills say which to use.
- Comment results state whether the deck is editable or read-only for this
  account, and say when a quote is too short to identify a page instead of
  letting the agent guess.
- Deck records gained the `update` source ("就地更新" / "Updated in place").
- Decks panel: cards carry an open-comment count. Counts come from one batched
  `GET /dsh-slide/api/decks/comments` for the first twelve cards, cached in the
  Host for 60 s, skipped when signed out, and limited to registered decks so the
  route cannot probe arbitrary file ids.
- `comments.js` holds the thread shapes as pure functions — normalization,
  control-character stripping, a 20-reply cap, resolve/reopen order, `disco`
  links restricted to `https://*.google.com`. Exported for reuse.
- `scripts/smoke-comments.mjs` covers those shapes, the count route (signed out,
  signed in, cached, unregistered ids), the `comments` action, and `update`
  against a stubbed Drive: one `PATCH`, the packed bytes, and the deck record
  source.
- Docs: both READMEs describe the read-only boundary, the count path, and
  update-vs-import; the `pptx-deck-edit` skill explains how a quoted thread
  becomes a slide and when to write back instead of importing.

**Upgrading:** restart the app after updating. The Host loads the tool schema at
startup, so `comments` is missing until then; existing sign-ins, deck records, and
routes are unchanged.

## 1.0.0 — first public release

Renamed from `@local/dsh-slide` to `dsh-plugin-google-slides` for npm.

- Package renamed; the `cordis.patch.yml` row name and the `client.js` loader id
  now match the package name. The row **id** stays `dsh-slide`, so the HTTP
  routes (`/dsh-slide/…`), the credential keys (`dsh-slide/google-client`,
  `dsh-slide/google-account`), and the deck records (`$DSH_HOME/dsh-slide/decks/`)
  are unchanged and existing sign-ins keep working.
- Added `engines.dsh` (`>=0.2.1-rc.3`) and `engines.node`, so an incompatible
  Harness is refused at install time rather than failing at load.
- Added `license`, `repository`, `homepage`, `bugs`, `author`, `keywords`,
  `publishConfig.access: public`, and a `main` entry.
- `files` now ships `README.zh.md`, `CHANGELOG.md`, `LICENSE`, and the
  screenshots the README references, and excludes `__pycache__` / `*.pyc`.
- `exports` gained `./package.json`, `./cordis.patch.yml`, and `./decks`.
- README rewritten for people installing the plugin: requirements, three install
  paths, Google setup, tool reference, troubleshooting. The build log,
  architecture notes, routes, and verification record moved to
  [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md). Added a Chinese README.
- `/slide` accepts a brief in any language: the composed task now tells the
  agent to work in the user's language, and the usage/hint text is bilingual.

### Migrating from `@local/dsh-slide`

The package name changed, so a profile that installed the old name must
reinstall:

```bash
dsh plugin add dsh-plugin-google-slides
```

or remove the old entry in **Plugins** and add the new one. Nothing else needs
to change: credentials, deck records, routes, and settings survive, because the
row id and those keys did not move.

If you had signed in with a pre-0.2.1 DSH, run the credential key migration
once with DSH stopped:

```bash
node scripts/migrate-credentials.mjs --dry-run
node scripts/migrate-credentials.mjs
```
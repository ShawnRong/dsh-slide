# Google Slides Deck Studio for DSH

A DSH extension built around the [`pptx-deck-edit`](pptx-deck-edit/SKILL.md) skill. It adds:

- the bundled **`pptx-deck-edit`** skill to the agent catalog;
- a **Google account login** flow in **Settings → Google Slides**;
- a **`google_slides`** agent tool for listing, exporting, importing, and PDF-rendering Google Slides decks.

The model never receives an OAuth token. Tokens are stored in the Host credential store (`ctx.credentials`) and refreshed by the Host.

![Google Slides settings page](screenshots/settings-google-slides-final.png)

## Install

The bundle is already installed in the current `desktop` profile as `@local/dsh-slide`. To install it in another profile:

```text
plugin_manager install_bundle /Users/shawnr/Dev/dsh-slide
```

The package is a local directory bundle: `package.json` declares `dsh.bundle.patch`, and `cordis.patch.yml` inserts the `dsh-slide` Host row. The Client half registers a `settings.section` page.

## Upgrading from a pre-0.2.1 DSH

DSH 0.2.1 changed credential records to the `<scope>/<id>` key grammar. The Host validates the whole store while the `credentials` plugin loads, so one legacy record such as `dsh-slide.google.client` makes startup fail before any plugin — including this one — can repair it.

The code here already writes `dsh-slide/google-client` and `dsh-slide/google-account`. If you signed in with an older build, migrate the stored records once, with DSH stopped:

```bash
node scripts/migrate-credentials.mjs --dry-run   # show the planned renames
node scripts/migrate-credentials.mjs             # back up, then rewrite
```

The script reads `$DSH_HOME/.credentials.yaml` (default `~/.dsh/.credentials.yaml`), renames legacy `dsh-slide.*` record keys, keeps a timestamped `600` backup, and reports any other key that still violates the grammar. Start DSH again afterwards.

## Connect a Google account

The extension does not ship an OAuth client (a client ID identifies *your* Google Cloud project). Create one once:

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select a project and enable **Google Drive API** under **APIs & Services → Library**.
3. Configure the **OAuth consent screen**. While the app is in **Testing**, add your Google account under **Test users**.
4. Create an OAuth client ID:
   - **Desktop app** is the simplest choice for this local Harness. Google accepts the loopback redirect used below.
   - **Web application** works too, but you must add the exact redirect URI to **Authorized redirect URIs**.
5. Open **Settings → Google Slides** in DSH, paste the client ID and client secret, and click **Save client**.
6. Click **Sign in with Google**. The Web UI opens Google's consent page; in the desktop app it opens in your default browser, and the page switches to the connected account when the callback lands.

The page displays the exact redirect URI to register:

```text
http://127.0.0.1:50117/dsh-slide/oauth/google/callback
```

If the Web GUI runs on another port, use the URI shown on the page. For a **Web application** client, the registered URI must match exactly.

### Desktop app

The desktop shell serves the Web UI from `dsh-app://app` and denies in-app popups, so **Sign in with Google** hands the consent page to your default browser instead. The settings page shows the handoff notice, keeps an **Open sign-in page** link, and polls the Host; it switches to the connected account when the browser callback arrives. Nothing needs to be copied back.

A **Desktop app** OAuth client is the least brittle choice for this path: Google accepts the loopback redirect on any port, so a changing Web/desktop port does not require editing **Authorized redirect URIs**. The Host's same-origin guard accepts both the bound Web origin and the desktop `dsh-app://app` origin.

### Scopes

- `openid`, `email`, `profile` — show which account is connected.
- `https://www.googleapis.com/auth/drive.file` — import new Slides files and access files this app created.
- `https://www.googleapis.com/auth/drive.readonly` — export existing Slides decks the user can read.

Google may require OAuth verification before these sensitive scopes can be used by accounts outside your test users.

### Configuration alternatives

Instead of saving the client in the UI, set these in the Host environment before starting DSH:

```bash
export GOOGLE_CLIENT_ID="…apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="…"
```

Saved UI values take priority over environment values. The UI reports when it is using `GOOGLE_CLIENT_ID`.

## Agent usage

The skill is registered from the bundled `pptx-deck-edit` directory, with a short DSH-specific note appended at load time. The original skill files are not modified.

The `google_slides` tool supports:

| action | purpose |
|---|---|
| `status` | Check whether a Google account is connected. |
| `list` | List Google Slides decks (optional Drive `query`, `limit`). |
| `export` | Download a Google Slides deck as `.pptx` into the workspace. |
| `pdf` | Download Google's own PDF rendering into the workspace. |
| `import` | Upload a local `.pptx` as a **new** Google Slides file. |

Example agent flow:

```text
google_slides export file_id=<deck-id> path=work/deck/original.pptx
# edit with pptx-deck-edit
google_slides import path=work/deck/final.pptx name="Q4 review (edited)"
google_slides pdf file_id=<new-id> path=work/deck/final-google.pdf
```

`export`, `pdf`, and `import` only accept paths inside the current session workspace. Symlink escapes are rejected.

## How it is put together

| File | Role |
|---|---|
| `index.js` | Host plugin: skill registration, OAuth loopback flow, credential records, Drive API, `google_slides` tool, HTTP routes. |
| `client.js` | Client plugin: `settings.section` page, localized en/zh dictionaries, sign-in popup and status polling. |
| `cordis.patch.yml` | Inserts the Host row. |
| `locale/{en,zh}.json` | Plugin Manager title and description. |
| `icon.svg` | Original deck/slide icon. |
| `pptx-deck-edit/` | The upstream skill (unchanged), exposed with a runtime note. |

Credential records:

- `dsh-slide/google-client` — saved OAuth client ID/secret.
- `dsh-slide/google-account` — access token, refresh token, expiry, scope, and account profile.

Routes:

- `GET  /dsh-slide/api/status`
- `GET/POST /dsh-slide/api/config`
- `POST /dsh-slide/api/google/start`
- `POST /dsh-slide/api/google/disconnect`
- `GET  /dsh-slide/oauth/google/callback`
- `GET  /dsh-slide/api/drive/files`

## Security notes

- The browser never receives an access or refresh token; it only sees connection status and profile fields.
- OAuth uses PKCE (`S256`) and a single-use `state` with a 10-minute lifetime.
- Signing out deletes the credential record and best-effort revokes the Google grant.
- OAuth client changes and disconnects require a same-origin request: the bound Web origin, a loopback alias, or the desktop shell's `dsh-app://app` origin.
- Client secret and tokens live in the Host credential store, not in `cordis.patch.yml`.
- The Google Drive export endpoint enforces Google's own 10 MB presentation export limit.

## Verification

- Host and Client JavaScript pass `node --check`.
- Verified live on DSH 0.2.1-rc.3: Host boot, credential read/write/delete, `google_slides` schema, `pptx-deck-edit` catalog entry, Settings section, and a Drive `list` against a connected account.
- The bundle installed with `application: applied` and no warnings.
- `pptx-deck-edit` appears in the live skill catalog; loading it returns the bundled instructions and resource directory.
- `google_slides` appears in the live tool schema with `status`, `list`, `export`, `import`, and `pdf`.
- `GET /dsh-slide/api/status` returns the redirect URI and connection state.
- OAuth start returns a Google authorization URL with PKCE and `state`; the desktop shell hands it to the system browser, and the Web popup reaches Google's consent/error page.
- The same-origin guard accepts `dsh-app://app` and loopback aliases while rejecting foreign origins and foreign loopback protocols.
- The Settings page renders in Chinese/English and light/dark themes (screenshots in `screenshots/`).

Not verified without user credentials: an actual Google consent round-trip and a live Drive export/import. Those need a real OAuth client ID/secret and a Google account.

## Limitations

- This repository does not include Google OAuth credentials; each user supplies their own client.
- Google's testing-mode consent screen limits sign-in to added test users.
- In a normal browser, allow the popup for the inline flow. The desktop shell opens the system browser instead; the Web flow falls back to a full-page redirect only if the popup is unavailable.
- A Web application OAuth client must have the exact redirect URI registered; a Desktop app client is less brittle for local use.
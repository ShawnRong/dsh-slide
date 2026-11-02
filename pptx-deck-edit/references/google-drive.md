# Google Drive round-trip (optional)

`scripts/gdrive.py` reads an OAuth 2.0 access token from `GOOGLE_ACCESS_TOKEN` (or `--token`).
Scope needed: `https://www.googleapis.com/auth/drive.file` (files the app created) plus
`drive.readonly` to export a deck you did not create; or simply `https://www.googleapis.com/auth/drive`.

Ways to get a token:
- gcloud: `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/cloud-platform` then `export GOOGLE_ACCESS_TOKEN=$(gcloud auth application-default print-access-token)`
- OAuth Playground (https://developers.google.com/oauthplayground): pick Drive API v3 scope, exchange code, copy access token.
- Your own OAuth client / harness connector that can hand out a bearer token.
Tokens expire after ~1 hour.

Endpoints used:
- Export: `GET /drive/v3/files/{id}/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation` (Google files ≤10 MB export limit)
- Import: `POST /upload/drive/v3/files?uploadType=multipart` with metadata `mimeType: application/vnd.google-apps.presentation` → converts to Slides as a NEW file
- PDF: export with `mimeType=application/pdf`

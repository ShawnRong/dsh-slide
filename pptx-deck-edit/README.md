# pptx-deck-edit

Portable Agent Skill (SKILL.md + scripts) for editing existing .pptx / Google Slides decks via an offline OOXML round-trip with render-after-every-batch checks.

## Requirements
`python3` (3.9+), `pip install lxml pillow`, LibreOffice (`soffice`), poppler (`pdftoppm`).
macOS: `brew install --cask libreoffice && brew install poppler`. Debian/Ubuntu: `apt install libreoffice-impress poppler-utils`.
Google steps are optional: see `references/google-drive.md`.

## Install
pi (per pi docs, pi.dev/docs/latest/skills, checked 2026-10):
```bash
cp -r pptx-deck-edit ~/.pi/agent/skills/        # global
# or ~/.agents/skills/ (global), or project .pi/skills/ / .agents/skills/ (project must be trusted)
```
Force-load with `/skill:pptx-deck-edit <request>`, or pass `--skill path/to/pptx-deck-edit`.

Claude Code: `~/.claude/skills/pptx-deck-edit/` (or project `.claude/skills/`); one level deep only.
Codex CLI: `~/.codex/skills/pptx-deck-edit/` or `~/.agents/skills/` (check your Codex version's docs).
Any other harness: put the folder anywhere, add the `name` + `description` to the system prompt, and let the model read SKILL.md on demand; scripts are run with paths relative to the skill folder.

## Scripts
| script | purpose |
|---|---|
| unpack.py | pptx -> dir |
| inventory.py | shapes/text/positions/notes per slide (json/md), `--check` duplicate ids |
| clone_shape.py | duplicate a shape with fresh id, new text, position |
| pack.py | validate XML + zip ([Content_Types].xml first) |
| render.sh | pptx/pdf -> slide PNGs + grid.png |
| gdrive.py | Drive v3 export / import-as-new-Slides / PDF export |

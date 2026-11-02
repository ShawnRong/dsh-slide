---
name: pptx-deck-edit
description: Edit an existing slide deck (.pptx file or Google Slides deck) by unpacking its OOXML, editing slides in small batches, and rendering every batch to PNG for visual checks. Use when asked to revise, fix, restructure, or update content in an existing presentation while preserving its design. Not for building a deck from scratch.
---

# pptx-deck-edit

Offline round-trip: export -> unpack -> plan -> edit XML in batches -> render & inspect -> pack -> (optional) re-import to Google Slides.
All scripts live in `scripts/` relative to this file. Every script supports `--help`; exit 0 = ok, 1 = validation/usage problem, 2 = missing dependency or I/O error.

## Dependencies
- Python 3.9+, `lxml` (`pip install lxml`), `Pillow` (grid image)
- LibreOffice (`soffice`) and poppler (`pdftoppm`) for rendering
- Optional: Google Drive OAuth access token in `GOOGLE_ACCESS_TOKEN` (see `references/google-drive.md`)

## Quickstart
```bash
S=<this-skill-dir>/scripts
W=work/my-deck && mkdir -p $W
cp source.pptx $W/original.pptx            # or: python3 $S/gdrive.py export <FILE_ID> $W/original.pptx
python3 $S/unpack.py $W/original.pptx $W/x
python3 $S/inventory.py $W/x --format md > $W/inventory.md
# ...edit $W/x/ppt/slides/slideN.xml...
python3 $S/pack.py $W/x $W/preview-b1.pptx
bash $S/render.sh $W/preview-b1.pptx $W/renders/b1   # -> slide-*.png + grid.png
```

## Phases
1. **Source.** Copy the input to `original.pptx` in a fresh working dir. Never write to the original file or the original cloud file.
2. **Unpack & catalog.** Unpack, run `inventory.py`, render the original once (`renders/original/`). Create `NOTES.md` from `references/NOTES.template.md`: layout catalog (which slide uses which layout, recurring shapes, fonts).
3. **Plan.** Write a storyboard in `NOTES.md`: per slide — change / keep, and why. List open content questions (facts, numbers, scope, tone, conflicting slides). Ask the user and record answers under Decisions before editing affected slides. When a slide is a list or a table and the content is a relationship, a process, or a taxonomy, use `../deck-design/references/DIAGRAM-PATTERNS.md` to rebuild it in the deck's own palette; preserve the brand, not the bad layout.
4. **Edit in batches of 2–3 slides.**
   - Change text inside existing `<a:r><a:t>` runs; keep `<a:rPr>` so fonts survive. When merging runs, keep the first run's `rPr`.
   - To add an element, clone a similar shape: `clone_shape.py` gives it a fresh unique id and new text. Adjust `<a:off>`/`<a:ext>` (EMU, 914400 per inch) if needed.
   - Do not rename/reorder slide files or touch `_rels` unless you also fix `presentation.xml` and `[Content_Types].xml`.
   - Visible text is often split across runs (e.g. `Sep` + ` 2026`). Grep `<a:t>` before a find/replace; edit the run that holds each piece.
   - Escape `& < >` in text. Notes are in `ppt/notesSlides/notesSlideN.xml` (slide N ≠ notes N; follow the slide's `.rels`).
5. **Verify each batch.** `pack.py` (validates every XML part) -> `render.sh` -> look at every changed slide PNG and the grid. Check overflow, unwanted wrapping, overlaps, clipped text, font substitution. Fix or revert, then log the batch in `NOTES.md`.
6. **Finish.** Pack the final `.pptx`, render a final grid, diff text vs original (`inventory.py` on both). Optional Google: `gdrive.py import` creates a NEW Slides file; use it **once, after the final pack** — not per batch. Then `gdrive.py pdf <NEW_ID>` and render the PDF (`render.sh` accepts PDF); Google wraps text differently from LibreOffice, so check again and report differences.

## Rules
- Never modify the original; always output new files.
- Render after every batch; never claim a slide is fine without looking at its image.
- Ask before content decisions (meaning, numbers, scope); fix typos/formatting on your own and log them.
- Keep `NOTES.md` current so another agent can resume from it.
- Prefer smallest edit: shorten text before shrinking fonts; shrink before moving shapes.
- One request, one Slides file. Import the final deck once; never import every batch or every revision.

## Failure modes
- `pack.py` reports XML error -> fix the named part (usually unescaped `&` or unclosed tag).
- PowerPoint "repair" prompt -> duplicate shape ids on a slide or a missing rel; rerun `inventory.py --check`.
- Text renders in a fallback font -> missing font on the render host; LibreOffice preview only, note it as a caveat.
- Find/replace silently misses -> the text spans several runs; edit each run.
- Cloned shape overlaps others -> set `--x/--y` (EMU) and re-render.
- `soffice` hangs -> another instance holds the profile; `render.sh` uses a temp profile, kill stale `soffice` processes.
- Google import differs from local render -> trust the Google PDF for Google delivery; widen boxes or shorten text.
- Drive 401 -> token expired (they last ~1h); get a new one.

# Space and layout math for PPTX

PowerPoint does not reflow like a web page. A text box keeps the size you give it, so overflow and collisions are decided before the render. Do the arithmetic first; the visual pass only confirms it.

## The canvas and its bands

- 16:9, 13.333 × 7.5 in. 1 in = 72 pt.
- Margins: 0.6 in top and bottom, 0.65 in left and right.
- Content width: 13.333 − 1.3 = 12.03 in.
- With a footer, content stops at 6.4 in: 0.6 to 6.4 = **5.8 in** of content band. Without a footer, use 6.3 in and keep 0.6 in at the bottom.
- The title occupies the top of that band. Body starts at 1.7–1.9 in, so about 4.5–4.7 in remains for the body. Sum the title and body together when checking the 5.8 in.
- Footer band: 6.4 to 7.5 in, one row only. Page number and one of source or brand, 9–10 pt.
- Title zone: 0.6 to about 1.6 in, at the same height on every content slide.

A full-bleed image may cross a band; text may not.

## Vertical budget

Measure in inches, then convert:

- One text line ≈ `pt / 72 × line-height`.
- A block ≈ `pt / 72 × lines × line-height`.
- A table row ≈ `2.1 × pt / 72` for each line of text in a cell (cell padding, rules, and leading). A two-line cell counts twice.
- A card ≈ `lines × pt / 72 × line-height + 2 × padding` (padding 0.18–0.3 in).
- A gap between blocks: 0.3–0.5 in. Section gap: 0.5–0.7 in.

Line height: display 1.02–1.08, heading 1.1–1.15, body 1.3–1.45.

### Worked budget

A content slide with a two-line 30 pt heading, one 8-row table at 12 pt, and a footer:

```text
heading   30/72 × 2 × 1.12        = 0.93 in
gap                                = 0.40 in
table     8 × 2.1 × 12/72          = 2.80 in
gap above footer                   = 0.20 in
total                              = 4.33 in of the 5.8 in band
```

Twelve rows: `12 × 2.1 × 12/72 = 4.20`, total 5.73 in. That is the ceiling; a 13th row splits the slide. The title and body together fill 70–85% of 5.8 in, so 4.1–4.9 in is the comfortable range.

If the total is over 5.8 in, cut copy, reduce a table's columns, or split the slide. Do not reduce body text below 12 pt.

## Width discipline

- A sentence column is 7.5–9.5 in wide. Running body text across 12 in makes the eye lose the line.
- A display line can use up to 11 in.
- A box must be at least as wide as its longest unbreakable run plus padding. Latin ≈ `0.55–0.6 × pt/72` per character; CJK ≈ `1.0 × pt/72` per character; URLs, paths, and code identifiers are the usual offenders.
- Set table column widths explicitly. A narrow column wraps a two-character word and doubles the row height.
- PowerPoint wraps CJK at almost any character, so a clean CJK line is not evidence that the same box holds an English term or a URL.

## Heading stability

The title is a fixed landmark. On every content slide in a run:

- Same title y, same size, same left edge.
- Never vertically center a column that has a heading above its body. Centering makes the heading move 20–60 pt between slides as the body height changes.
- Center only a slide with no heading above its body: a statement, a quote, a closing line.
- Spread title and body to 70–85% of the 5.8 in band with `space-between`, a spacer shape, or a bottom-anchored block. A body that stops at 60% reads unfinished.
- Repeated elements keep their positions; a reader flipping through should see the title and the first row stay put.

## Footer band

- One row, 9–10 pt, aligned to the margins: page number plus one of source or brand.
- Baseline at 7.0–7.2 in; nothing else in 6.4–7.5 in.
- Do not stack source, page number, and logo as three competing elements. Pick two, or put the logo on the cover and close only.
- A full-bleed image is the only element allowed to cross the band, and it carries no body text there.

## Images

- Photos: crop to fill the frame (`cover`). Keep one aspect ratio across the deck; never stretch.
- Screenshots, charts, and diagrams: fit inside the frame (`contain`) on a contrasting fill. Do not crop labels or axes.
- One image per slide unless a grid is the point.
- Put labels and callouts as text outside the image. Text baked into an image cannot be edited, searched, or translated.
- A caption is 9–10 pt, directly under the image, left aligned; it does not get its own card.

## Type floor

- Body 12–16 pt; default 14–16. Small labels and table cells 11–12. Caption 9–10, only for source, footnote, and page number.
- At 13.333 in wide, 12 pt is the same readability bar as 24 px on a 1920 px canvas.
- If the copy does not fit at 12 pt, the slide has too much copy. Split it.

## The check

1. Sum the block heights before building.
2. Build with those boxes; do not let the renderer shrink text.
3. Render one slide and compare the sum with the actual: if the render disagrees, fix the boxes, not the type size.
4. After the visual pass, check overflow, collision, and whether the title still sits where the previous slide put it.

`deck_lint.py` warns about body-sized runs between 9 and 12 pt outside the footer band; that is a signal that the budget was exceeded.
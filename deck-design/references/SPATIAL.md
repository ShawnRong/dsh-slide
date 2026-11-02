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

### 10 × 5.625 in brand templates

Google Slides and the CI&T template use 10 × 5.625 in. The bands scale by 0.75: margins 0.5, title band 1.15, body 1.30–4.80, footer 4.80–5.625. The type scale is the template's 24/15/12/9. Use the same fractions and the same node counts; only the inches change. Do not add body copy because the canvas is smaller.

## Vertical budget

Measure in inches, then convert:

- One text line ≈ `pt / 72 × line-height`.
- A block ≈ `pt / 72 × lines × line-height`.
- A table row ≈ `2.1 × pt / 72` for each line of text in a cell (cell padding, rules, and leading). A two-line cell counts twice.
- A card ≈ `lines × pt / 72 × line-height + 2 × padding` (padding 0.18–0.3 in).
- A gap between blocks: 0.3–0.5 in. Section gap: 0.5–0.7 in.

Line height: display 1.02–1.08, heading 1.1–1.15, body 1.3–1.45.

### Worked budget

A content slide with a one-line 30 pt heading, a four-card tree, and a footer:

```text
heading   30/72 × 1 × 1.12        = 0.47 in
gap                                = 0.35 in
tree      root .42 + gap .33
          + sides .38 + gap .22
          + cards 1.72             = 3.07 in
gap above footer                   = 0.20 in
total                              = 4.09 in of the 5.8 in band
```

The title and body together fill 70–85% of 5.8 in, so 4.1–4.9 in is the comfortable range. The four-card tree is deliberately at the low end; that is what leaves room for a caption and the footer.

An appendix table is the exception: `8 × 2.1 × 12/72 = 2.80` for the body. Twelve rows total 5.73 in; that is the ceiling. If the total is over 5.8 in, cut a node, shorten a caption, or split the slide. Do not reduce body text below 12 pt.

## Diagram geometry

Work in fractions of the **body frame** (`x, y, w, h` under the title, above the footer), then multiply by the canvas. The figures below assume a 13.333 × 7.5 deck with a 12.03 × 4.65 in body frame.

| Structure | Geometry | Fit check |
|---|---|---|
| Boundary | two banks 0.40 w, seam 0.20 w; four rows 0.12 h each | 8 labels + 3 chips |
| Swimlane | three lanes 0.24 / 0.52 / 0.24 w; four nodes 0.18 w × 0.55 h; 0.12 w gaps | 3 edge labels + 4 gates |
| Tree | root 0.30 w at the top; two sides 0.17 w at 0.18 h; four cards 0.18 w × 0.40 h | 24 labels maximum |
| Staircase | four dots at x 0.04 / 0.32 / 0.58 / 0.82, y 0.72 / 0.52 / 0.32 / 0.12; baseline 0.88 | 4 captions ≤ 2 lines |
| Trunk + glue | cards 0.31 / 0.31 / 0.29 w; side rail 0.08 h | 3 + 3 lines |
| 2×2 | square 0.55 w, centred; axes labelled outside | 4 quadrant labels |
| Stat row | 3 columns of 0.30 w; number 40–54 pt | 3 labels + 1 line |

Rules:

- A node is at least 0.18 w and 0.40 h at 13.333 in; below that the label wraps and the shape reads as a card, not a node.
- Leave 0.10–0.15 w between a node and an arrow; leave 0.30–0.50 h between the diagram and the next block.
- The staircase's rise is 0.20 h per stage; four stages fit in 0.80 h and leave the upper-left for a callout.
- A tree's rail sits 0.10–0.15 h above the branch boxes; a smaller gap reads as a double border.

## Text budget math

At 12 pt, a CJK line in a 7.5 in column holds about 45 characters, and two lines hold about 90. The copy budget is 60, so a compliant slide has **one to two lines** of prose, not a paragraph.

- 60 characters at 12 pt ≈ 1.3 lines in a 7.5 in column; leave the rest for labels.
- 24 labels at ≤12 characters fill a four-card tree; a fifth card is a second slide.
- If a caption needs a third line, the node is too narrow or the copy is too long; widen the node or cut the caption.

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
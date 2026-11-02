# Deck design system

A small system beats a large template. These are the defaults. A supplied brand guide or template overrides colour, typefaces, type scale, and the footer logo; use its values and keep the density and hierarchy rules.

## Canvas and grid

- 16:9, 13.333 × 7.5 in (13.333 in = 33.87 cm).
- **Brand templates at 10 × 5.625 in** are the same 16:9 shape. Use the template's own margins and type scale (often 24/18/15/12/9); multiply the fractions, not the body text. A 12 pt floor still holds.
- Margins: 0.6 in top/bottom, 0.65 in left/right. Keep a 1.1 in bottom band for source, page number, and logo.
- Content band: 0.6–6.4 in = 5.8 in with a footer; 6.3 in without. The title and body together fill 70–85% of it.
- Space math — vertical budget, heading stability, footer band, width and image rules: `SPATIAL.md`.
- 12 columns, 0.16 in gutters. Column width = 0.94 in.
- One alignment axis per slide. Left-aligned titles and body; centre only for a single statement or a quote.
- Vertical rhythm in 0.12 in increments. Do not eyeball spacing.

## Type scale

| Role | Size (pt) | Weight | Line height | Notes |
|---|---|---|---|---|
| Display | 44–54 | Bold | 1.02–1.08 | Cover, one statement per deck |
| H1 | 28–32 | Bold | 1.12 | Slide title; one line, max two |
| H2 | 22–24 | Semibold | 1.2 | Section opener or big number |
| H3 | 17–18 | Semibold | 1.25 | Card heading |
| Body | 14–16 | Regular | 1.35–1.45 | Chinese; 1.2–1.3 Latin |
| Diagram label | 10–12 | Regular | 1.2–1.3 | Node caption, edge label, gate |
| Node title | 12–15 | Semibold | 1.2 | The name inside a box |
| Small | 11–12 | Regular | 1.3 | Labels, axis, table cells |
| Caption | 9–10 | Regular | 1.25 | Source, footnote, page number; never below 9 |

Rules:

- If the brand guide gives a scale, use it verbatim. A 24/18/15/12/9 scale (title/subtitle/highlight/body/caption) is a common corporate variant; do not inflate it to the default 14–16 body.
- Two weights only. Use size and colour for hierarchy before adding a third weight.
- Chinese and Latin in the same run: set the East Asian font explicitly; do not let the renderer substitute.
- Never set body below 12 pt; 14–16 pt is the default. 9–10 pt is only for source, footnote, and page number. If copy does not fit at 12, cut or split.
- Title case is not a hierarchy tool. Use sentence case consistently.
- Numbers in a stat block: 40–72 pt, one decimal unit at 12–14 pt below, description at 11–12 pt.

## Density budget

Per content slide:

- One claim, one structure. If the slide needs "and" or "also", it is two slides.
- **≤ 60 Chinese characters or ≤ 30 English words of prose** (title, labels, footnote excluded).
- **≤ 24 labels, each ≤ 12 characters**, and no text block over two lines. A label names a node; it does not explain it.
- ≤ 12 visible shapes for a card or statement slide. A diagram may exceed this, but ≤ 7 nodes and ≤ 24 labels.
- One number per stat; one stat row per deck section.
- **No table on a content slide.** Tables are appendix material. A comparison is a boundary, trunk + glue, or 2×2.
- If the copy does not fit, cut it or split the slide. Never shrink below the body floor.

## Layout archetypes

Use at least four different archetypes in a deck of ten or more slides. Do not run the same archetype three times in a row.

### 1. Cover

- Claim at 44–54 pt, left aligned, two lines maximum.
- One line of context (audience, date, version).
- One brand element, not three. No stock photo, no abstract gradient.
- No "Proposal", "Discussion Draft", "Confidential" unless it changes how the reader uses the deck.

### 2. Section opener

Only when the deck changes subject. The line is a question or a claim, not "01. 现状与目标".

- One sentence at 28–36 pt.
- Optional: one line of what the section answers.
- No decorative full-bleed colour field unless it carries the section's single number or question. A coloured page with "02. 方案怎么做" is a wasted slide.

### 3. Statement

- One sentence at 32–44 pt, 8–14 words.
- No cards, no icons, no bullets. One accent word or number.
- Use after a dense slide to let the argument land.

### 4. Evidence

- One chart or table occupying 55–65% of the width.
- Takeaway title states the reading, not the metric name.
- Annotate the one point that matters; mute the rest.
- Source line at 9 pt, bottom left.

### 5. Comparison

- Two or three columns, equal width, one shared baseline.
- The difference is stated in the column headers, not buried in bullets.
- Include a verdict line: which option, under what condition.

### 6. Diagram

The ten reusable structures are in `DIAGRAM-PATTERNS.md`: boundary, swimlane, tree, staircase, trunk + glue, layer stack, 2×2, stat row, payload, decision cards. Use one of them before inventing a layout.

- ≤ 7 nodes, one reading direction (left→right or top→bottom).
- Label the edges with verbs; an unlabelled arrow is decoration.
- One accent path; everything else in ink/grey.
- Put the explanation in the title, not in a paragraph under the diagram.
- Labels, not prose: a node holds a name and at most one line.
- Do not use shadows, 3D, or perspective. One corner radius if the brand uses it; otherwise square.

### 7. Scenario / timeline

- A named protagonist and a concrete situation ("华东大区经理问：上月各省 sell-in 达成率").
- 4–6 steps, each with an action and a result.
- Show the failure path or the "what if" in a quieter style; it proves the design.

### 8. Close

- The decision or ask, at 24–32 pt.
- Three bullets maximum: what you need, by when, from whom.
- "Thank you" alone is not a close.

## Colour

- Roles: ink (titles/body), paper (background), accent (one per deck), tint (accent at 8–12%), muted (secondary text).
- Use toned whites and blacks, not pure `#FFFFFF`/`#000000`; one dark, one light, plus 1–2 accents.
- Accent area ≤ 10% of any slide. If everything is accent, nothing is.
- Body contrast ≥ 4.5:1; large text ≥ 3:1. Check the actual pair, not the brand swatch.
- When two colors must be told apart, differ them in lightness as well as hue; blue/orange is safer than red/green.
- No gradients, no drop shadows, no glass effects. Flat fills and one hairline weight.
- No emoji as icons or decoration. Do not use a rounded card with a left accent bar as a default container.
- A dark slide is a deliberate break, not a section default. Use it once or twice per deck.
- Two background tones at most: the light content ground and one dark opening/closing, plus one accent statement slide.

## Brand marks and section labels

- **Footer logo:** if the template has one, keep it. That is a template element, not slop. Use the supplied asset at the template's exact position and size, with the light/dark variant the template specifies. Do not remove it or move it.
- **Size:** take the footer logo size and position from the template's master, not from a brand-guide display slide. A guide shows the lockup large; the footer is usually much smaller. If the tagline is unreadable at the template's footer size, use the template's compact mark; do not enlarge the lockup to make the tagline fit.
- **No new marks:** do not redraw, trace, recolour, or generate a logo, even if the result looks close. Do not add a logo where the template has none, and do not add a second mark.
- **No asset:** ask for the file. Do not recreate the mark.
- **Section label:** optional. If the deck has an agenda with named sections, the label uses the exact same name and number. If the agenda has no sections, the label goes.
- **No decorative metadata:** `01 · 今天` is not a section unless the agenda says "01 今天". A tag that repeats the title or the column header is noise.
- **Footer:** page number plus one of source or brand. Three competing footer elements is one too many.

## Charts

- Title = the conclusion ("华东缺口集中在两个省", not "各省达成率").
- Direct labels at the mark; drop the legend when there are three or fewer series.
- Highlight one series in accent; the rest in grey.
- No 3D, no horizontal gridlines beyond two, no axis ticks if labels are direct.
- Start bars at zero. For lines, label the last point and the relevant event.
- Round numbers to the precision the decision needs.

## Images

- One image per slide at most, and only if it carries meaning (product, place, person, artifact).
- Photos crop to fill the frame; screenshots and diagrams fit inside it on a contrasting fill. Keep labels as text outside the image.
- Full-bleed images need a contrast scrim for text; do not put 12 pt text on a busy photo.
- No generic handshake, skyline, or robot imagery. An empty diagram is better than a stock photo.

## Motion

Decks are read, not performed. If animation is required, use one build per slide to reveal a comparison; no flying, spinning, or bouncing.

## Review checklist

- Squint test: the focal point is obvious in three seconds.
- Title-only read: the argument survives.
- 12 pt test: every body line is readable at 100% zoom on a laptop.
- Collision test: no text touches a rule, card edge, or another text box.
- Contrast test: every text/background pair passes 4.5:1 (or 3:1 for ≥ 24 pt).
- Rhythm test: no three consecutive slides with the same composition.
- Footer test: source, page number, and brand do not compete with the content.
- Heading test: titles land at the same height on neighbouring content slides.
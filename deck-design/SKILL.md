---
description: Build or rebuild a slide deck from scratch, notes, or a source document: argument, anti-slop copy, diagram-first layouts, per-slide text budgets, a lint + visual gate, and a 3-up progress grid every three slides. Use for presentations, proposals, reports, 演示文稿, or deck redesigns. For small edits inside an existing deck, use pptx-deck-edit.
---

# deck-design

A deck is an argument with pictures, not a document with page breaks. The job is to make one claim easy to see, support it with evidence, and remove everything that does not help the audience decide.

Design for the back of the room. A deck is read in sequence, so the titles alone should carry the argument; a slide that can be removed without weakening it should be removed.

## Dependencies

- Python 3.9+, `python-pptx` for the lint and for programmatic builds, and Pillow for `checkpoint.py`.
- LibreOffice (`soffice`) or a Google Slides PDF export for the visual pass.

## The bar

- One thesis, stated on the cover and repeated in the close.
- Every content slide makes one claim. The title is the claim, not the topic.
- A reader who only reads titles gets the argument.
- **A content slide is a structure with labels.** Pick the structure before the copy. A bullet list or a table is not a structure.
- **Copy budget: ≤ 60 Chinese characters of prose per slide** (≤ 30 English words), ≤ 24 labels of ≤ 12 characters, and no text block over two lines. If it does not fit, cut or split; never shrink.
- Body text is readable at presentation size: body 12 pt minimum, 14–16 pt default; 9–10 pt only for source, footnote, and page number.
- No template autopilot: at least four distinct body compositions in a deck of ten or more slides.
- No AI tells: no "不是 A，而是 B", no "一页看懂", no "这才是真正的…", no meta-commentary about the document or the model.
- The user sees every third slide while the deck is being built. No silent 20-slide run.

## Rules

- Publish a rendered 3-up grid every three slides. No silent runs longer than three.
- A checkpoint is a progress post, not a stop. Continue unless the user asked for interactive review or a decision blocks the next batch.
- Do not describe a slide you have not rendered.
- Do not invent section labels or brand marks. A section tag must match the agenda; a logo must be the supplied asset, and a template footer logo stays.
- **One structure per slide.** Name it from `references/DIAGRAM-PATTERNS.md`: boundary, swimlane, tree, staircase, trunk + glue, layer stack, 2×2, stat row, payload, or decision cards. If no structure fits, the slide is a statement or an appendix table, not a bullet list.
- **Tables are appendix material.** A table on a content slide is a slide that has not been designed; rebuild it as a comparison diagram.
- Change only what was asked. When the user names a text, a number, or a colour, leave every other slide, box, and style alone; propose a broader change instead of applying it.
- Do not add slides, sections, stats, stock images, or decoration the brief did not ask for. Every element earns its place; ask before expanding the scope.
- When adding to an existing deck, match its type scale, palette, chart style, spacing, and copy voice before adding anything new.
- Rebuild an interface, chart, or brand element from its real source files and assets, not from an impression of it. Never redraw a supplied logo.
- Every title is a claim. Delete any slide whose title is a label.
- Run the lint before delivery; fix every hard failure.

## Workflow

1. **Brief.** Write five lines: audience, decision they must make, one-sentence thesis, three pieces of evidence, what is explicitly out of scope. Ask only where an answer changes the deck; the protocol is `references/QUESTIONS.md`. With no one to answer, decide and state the assumptions in one line. If the deck carries a brand, ask for the logo file and fonts, and keep the template's footer logo. If there is no asset, ask for it rather than recreate it. A missing number is a bracketed placeholder, not a question.
2. **Outline.** One line per slide: claim, structure, and label budget — `04 — 分工按谁理解数据模型切 — boundary — 8 labels + 1 statement`. No visual styling yet. Delete any slide whose claim is already implied by another; if no structure fits, the slide is a statement or it is cut.
3. **Storyboard.** Add the layout archetype, the structure, and the single key line. Sketch the structure as ASCII (nodes, edges, rail); count nodes (≤ 7) and labels (≤ 24). Check rhythm: no more than two consecutive slides with the same archetype; no table or bullet list; put a statement or visual break after every three content slides.
4. **Build and copy-pass in batches of three.** Use `python-pptx` or `pptx-deck-edit` on the supplied template. Build the geometry first — `scripts/diagram_kit.py` provides boxes, edges, dots, branches, staircase risers, chips, and a content frame — then place the labels. If you start with a text box, the slide will be a list. Keep one type scale, one grid, one accent colour. Run the rules in `references/ANTI-SLOP.md` before posting: read every title alone; if it is a label ("现状与目标", "方案设计"), rewrite it as a claim. Then run the checkpoint in `references/REVIEW-CADENCE.md`: render the three slides, compose a 3-up grid, post it with a one-line summary and the local path, and continue. Ask a question only if a decision blocks the next batch. End the turn only if the user asked for interactive review.
5. **Lint.** Run `python3 $S/deck_lint.py deck.pptx`, where `S` is this skill's `scripts/` directory. Fix hard failures and anything that pulls the score below 80. The layout checks (`layout.table`, `layout.list`, `layout.text-only`, `layout.labels`, `copy.prose-budget`) are the ones that catch a list or table dressed as a slide. Run it on the full deck before delivery; a partial deck can be linted at any checkpoint.
6. **Visual pass.** Render every slide (LibreOffice, or Google Slides PDF for a Google deck) and look at the images. Check overflow, collisions, contrast, and whether the focal point is obvious in three seconds. Log fixes.
7. **Ship.** Deliver the `.pptx`, a PDF render, and a short note on assumptions and open questions. Include the checkpoint images or a final contact sheet so the user can review without opening the file. Import to Google Slides **once, after the final lint and visual pass**: one request produces one Slides file, never one per batch.

## Diagram-first

Choose the structure before the sentences. The catalog in `references/DIAGRAM-PATTERNS.md` covers ten shapes and the copy budget for each:

- **Boundary** — two responsibility banks and the one object that crosses the seam.
- **Swimlane** — a request through layers, one judgement per node.
- **Tree** — one allocation point, two execution sides, four objects.
- **Staircase** — a process with stages that rise and a rail that anchors them.
- **Trunk + glue** — two big buy blocks, one thin self-built connector, a side rail.
- **Layer stack**, **2×2**, **stat row**, **payload + callouts**, **decision cards**.

Three rules make the pattern read as a diagram instead of decoration:

1. **Structure first.** Place nodes, edges, lanes, or axes before any text box.
2. **Labels, not prose.** A node gets a name and at most one line; the explanation belongs in the title or the footnote.
3. **One accent path.** The accent marks the main path, the exception, or the decision — not every node.

The geometry primitives are in `scripts/diagram_kit.py`. Run `python3 scripts/diagram_kit.py --demo work/diagram-kit-demo.pptx` to see a boundary, a tree, and a staircase built with them, then copy the calls. Read it before hand-placing twenty shapes; it is shorter than the layout you would otherwise rebuild.

## Content rules

- **Title = claim.** "P0 用 3–4 周跑通一条调用链", not "实施路线".
- **One title grammar.** Every title is a claim, in the same grammatical shape from slide 2 to the close: one verb phrase, or one full sentence. Do not mix.
- **No invented facts.** Never invent a statistic, a quote, a customer, or a date. Write `[€__]`, `[Q4 churn]`, or `[name]`, and list the placeholders in the reply.
- **One idea per slide.** If the slide needs "另外" or "同时", it is two slides.
- **Concrete over abstract.** Name the system, the role, the number, the date. Replace "公共底座" with "身份、网关、连接器".
- **Take a position.** Say what you would cut, what you would do first, and what you are not promising.
- **Evidence, not adjectives.** "1000 条约 2–5 分钟" beats "高效"; "37 人调整、0 个角色变化" beats "灵活".
- **No scaffolding.** Delete "一页看懂", "为什么是现在", "先说结论", "让我们", "接下来". The deck should already do this work.
- **No decorative metadata.** Remove `01 · 今天` tags, invented section codes, and labels that repeat the title or column header. A section tag is earned by the agenda, not added for texture.
- **No false candour.** "诚实标注", "坦白说", "需要说明的是" are performance, not transparency. State the fact; put sourcing in one footnote.
- **One hedging convention.** Mark estimates once in a footnote, not "(估算)" after every number.
- **Plain verbs.** 查、拒、记、改、发、回滚. Avoid 赋能、抓手、闭环、沉淀、对齐、复用、组合拳.
- **Speaker notes.** Add them only when asked. When asked, the notes carry the spoken script; take the paragraphs off the slide and leave a one-line headline plus one figure or image.
- **Cut 30%.** After drafting, delete one sentence per slide. If nothing is lost, delete two.

Details, banned patterns, and before/after rewrites: `references/ANTI-SLOP.md`.

## Design rules

- **One direction.** Decide the typefaces, palette, and layout idiom once, from the brief or the brand, and apply them to every slide. Do not mix directions.
- **Structure before style.** The first decision per slide is the structure; the type scale and colour come after it. A styled bullet list is still a bullet list.
- **Canvas.** 16:9, 13.333 × 7.5 in. Margins 0.6 in top/bottom, 0.65 in sides. Twelve columns, 0.16 in gutters. Align everything to the grid.
- **Brand templates at 10 × 5.625 in** (Google Slides/CI&T and similar) keep the same proportions and the template's 24/15/12/9 scale; scale margins by 0.75, not the body text below the template's floor.
- **Type scale (pt).** Display 44–54 · H1 28–32 · H2 22–24 · H3 17–18 · body 14–16 · small 11–12 · caption 9–10 (source, footnote, page number only). Body never below 12. Two weights only; no faux bold.
- **Density.** ≤ 7 nodes, ≤ 24 labels, ≤ 60 characters of prose. No bullet-list body; if it does not fit at 12 pt, cut copy; do not go below 12.
- **Tables.** Appendix only. A content-table means the slide has no structure yet; rebuild it as a boundary, trunk + glue, or 2×2.
- **Colour.** One ink, one paper, one accent, one tint, one muted grey. Accent ≤ 10% of the slide. Body contrast ≥ 4.5:1; large text ≥ 3:1.
- **Hierarchy.** One focal element per slide: a number, a claim, a diagram, or a chart. Everything else is support and should be quieter.
- **Space.** With a footer, the content band is 5.8 in from the top margin to the footer; after the title about 4.5 in remains for the body. Sum the heading, nodes, cards, and gaps before building; if the sum is over, split the slide. Fill 70–85% of the band. Formulas: `references/SPATIAL.md`.
- **Heading stability.** On every content slide the title lands at the same height. Do not center a column that has a heading above its body; center only a statement or quote with no heading above it.
- **Footer.** One 9–10 pt row at 6.4–7.5 in: page number plus one of source or brand. Nothing else in the band.
- **Backgrounds.** Two tones at most: one light content ground and one dark opening/closing, plus one accent statement slide. Set the background explicitly on every slide.
- **Images.** Photos crop to fill; screenshots and diagrams fit inside their frame on a contrasting fill. Keep labels as text outside the image.
- **Brand marks.** Keep the template's footer logo; that is a template element, not decoration. Use the supplied asset at the template's position and size, with the light/dark variant the template specifies. If the tagline is unreadable at the template's footer size, use the template's compact mark; do not enlarge the lockup. Never redraw, recolour, move, or remove it.
- **Rhythm.** Alternate dense and sparse. A section opener is a claim or question, not "01. 现状". The cover carries the thesis; the close carries the ask.
- **Charts.** Title states the takeaway. Direct labels; no legend for ≤ 3 series; highlight one series; no 3D, no gridline clutter.
- **Diagrams.** ≤ 7 nodes, one reading direction, labelled edges, one accent for the main path. If the diagram needs a paragraph to explain it, it is not a diagram.

Archetypes, proportions, and a worked page grid: `references/DESIGN-SYSTEM.md`.

## Review cadence

Build three, show three. The full protocol, message template, and question patterns are in `references/REVIEW-CADENCE.md`.

At every checkpoint (`$S` is this skill's `scripts/` directory):

1. Render the three new slides at 1600–1920 px wide.
2. Compose a 3-up grid with `$S/checkpoint.py` and post it inline with a one-line summary of the batch.
3. Add the local `.pptx` path and the Google Slides link when one exists.
4. Say what you are building next. Add a question only if a decision would change the next batch.
5. Continue. Do not wait in continuous mode; stop only in interactive mode.

If inline images do not render in the client, call `present` with the grid. If the user wants to read body copy, post the three individual PNGs as well. If the user asks for a change, edit those slides, re-render, and show the changed grid before continuing.

## Review gate

Run the lint on the full deck before delivery. A partial deck can be linted at any checkpoint.

```bash
S=<this-skill-dir>/scripts
python3 $S/deck_lint.py deck.pptx           # report, exit 1 on hard failures
python3 $S/deck_lint.py deck.pptx --json    # machine-readable
```

It checks banned phrasing, decorative section tags, type size (hard below 9 pt; a warning for 9–11 pt runs outside the footer), density, shape count, layout sameness, and contrast. It also flags tables on content slides, sentence-length prose over the budget, and slides with no visual structure. It does not judge whether the argument is good; that is the storyboard review.

Then look at every rendered slide. A clean lint with an unreadable slide is still a failure.

## Resources

- `references/ANTI-SLOP.md` — patterns, rewrites, brand/meta rules, and a copy checklist.
- `references/DIAGRAM-PATTERNS.md` — ten structures with geometry, copy budgets, ASCII sketches, and worked before/after transformations.
- `scripts/diagram_kit.py` — brand-neutral python-pptx primitives for boxes, edges, branches, dots, staircases, chips, and the content frame.
- `references/QUESTIONS.md` — when to ask, how to shape the options, and one worked example.
- `references/SPATIAL.md` — vertical budget, heading stability, footer band, width, and image rules for PPTX.
- `references/DESIGN-SYSTEM.md` — type scale, grid, layout archetypes, colour, chart rules.
- `references/REVIEW-CADENCE.md` — the 3-slide progress loop, message template, and feedback handling.
- `scripts/checkpoint.py` — compose a labelled 3-up grid from rendered slide PNGs.
- `scripts/deck_lint.py` — content and layout linter (`--json`, `--min-score`).
- `pptx-deck-edit` — OOXML editing workflow when preserving an existing deck.

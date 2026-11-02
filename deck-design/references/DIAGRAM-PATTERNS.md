# Diagram patterns

A content slide is one structure with labels. Choose the structure before writing the copy: if you write the bullets first, the slide will be a list with a title on top.

All geometry below is in fractions of the body frame (the area under the title, above the footer), so it survives a 13.333 × 7.5 canvas and a 10 × 5.625 brand template. The type scale and margins still come from the template.

## Storyboard line

Write one line per slide before any layout:

```text
04 — 分工按「谁理解数据模型」来切 — boundary — 8 labels + 1 statement + 3 chips
05 — 一次调用穿过四层 — swimlane — 4 nodes + 3 edges + 4 gates
09 — 改一次角色走四步 — staircase — 4 stages + 1 callout + 4 rail labels
```

The structure and the counts are the contract. A line without a structure is not ready to build.

## Choose in one line

| The content is | Structure | The one-line test |
|---|---|---|
| Who owns what, and where the hand-off is | **Boundary** | Two banks, one object crosses the seam |
| A request moving through layers | **Swimlane** | One direction, one judgement per node |
| A taxonomy, a role model, who defines/assigns/executes | **Tree** | One root, two sides, leaves that differ |
| A process with an operational promise | **Staircase** | Stages rise; a rail anchors them |
| Build vs buy, trunk vs glue | **Trunk + glue** | Two big blocks, one thin connector |
| An architecture stack | **Layer stack** | Each band does one job |
| A trade-off or prioritisation | **2×2** | Two axes, one highlighted quadrant |
| Outcomes or acceptance | **Stat row** | Three numbers, one takeaway |
| A concrete artifact (token, config, API) | **Payload** | Artifact plus three callouts |
| Open questions or asks | **Decision cards** | Four questions, no paragraphs |

If none of these fits, the slide is a **statement** (one sentence, no cards) or an **appendix table**. It is not a bullet list.

## Copy budget

The budget is per content slide, title and footer excluded.

- **Prose: ≤ 60 Chinese characters (or ≤ 30 English words).** Prose means full sentences and paragraphs. If you need more, split the slide or move the detail to a footnote.
- **Labels: ≤ 24, each ≤ 12 characters.** A label is a name, a verb, a number, or a row attached to a node. It is not a sentence.
- **No text block over two lines** at its own size. A three-line card body is prose in disguise.
- **One reading direction.** Left→right or top→bottom. Not both.
- **≤ 7 nodes** in a flow, tree, or matrix. A four-card row is already four nodes; do not add a fifth "and also".
- **Every edge is labelled with a verb** (`带 JWT`, `验签`, `发布`, `回写`). An unlabelled arrow is decoration.
- **The title carries the explanation.** If the diagram needs a paragraph underneath to be understood, the diagram is not finished.

The linter approximates the prose budget with sentence-length text; captions and labels attached to a node can push its number up. Treat the lint number as a smoke alarm, and the 60-character budget as the target.

## 1. Boundary — who owns what

Use for a responsibility split, a contract, or a hand-off between two teams or systems.

```text
┌──────────────────┐        ┌──────────────────┐
│ AI Foundation    │  ┌──┐  │ 业务系统          │
│ 01 ...           │─▶│JWT│─▶│ 01 ...           │
│ 02 ...           │  └──┘  │ 02 ...           │
│ 03 ...           │        │ 03 ...           │
│ 04 ...           │        │ 04 ...           │
└──────────────────┘        └──────────────────┘
        statement (≤ 24)
   [ chip ] [ chip ] [ chip ]
```

**Build.** Two banks at 0.40 W each, a seam at 0.20 W. Headers sit above a single hairline. Four rows per bank, numbered. The seam carries **one object that crosses** (a token, a ticket, a file) — not an arrow with no cargo. Close with one statement and three chips.

**Budget.** 4 + 4 labels (≤ 12), one statement (≤ 24), three chips (≤ 10). Zero prose.

**Avoid.** A plain two-column bullet list. If nothing crosses the seam, the slide is a comparison, not a boundary; use two banks under one shared header instead.

## 2. Swimlane — a request through layers

Use for a call path, a pipeline, or "who does what at each hop".

```text
用户侧        [01]──带 JWT──▶
AI Foundation        [02]──验签──▶[03]──带身份──▶
业务系统                                       [04]
              gate        gate        gate
```

**Build.** Three tinted lanes, full width. Four nodes: one in the first lane, two in the second, one in the third. Edges at the vertical centre of the nodes, labelled on the gap. Under each node, one gate line (`是谁在问`, `能不能调`, `认不认人`, `能不能看`). A single line below the lanes states the invariant.

**Budget.** Four names, four gate verbs (≤ 6), three edge labels (≤ 4), one line (≤ 24). No node bodies.

**Avoid.** Four equal cards in a row with a paragraph under each. If the lane colours do not change anything, remove the lanes.

## 3. Tree — one allocation point, two execution sides

Use for a role model, a taxonomy, an org chart, or "who defines / assigns / executes".

```text
                    ┌──────────────────┐
                    │ Portal 集中分配   │
                    └────────┬─────────┘
              ┌──────────────┴──────────────┐
        ┌─────┴─────┐                 ┌─────┴─────┐
        │ Foundation│                 │ 业务系统   │
        └──┬────┬───┘                 └──┬────┬───┘
      ┌────┴─┐┌─┴────┐             ┌────┴─┐┌─┴────┐
      │ card ││ card │             │ card ││ card │
      └──────┘└──────┘             └──────┘└──────┘
```

**Build.** One root box on the centre line; a rail; two branch boxes centred over their card pairs; four cards. Each card is one head, one lead question, and three rows (`定义 / 分配 / 执行`). Use the accent on the one card that is **not** a role (an attribute, an exception, a constraint).

**Budget.** Root ≤ 16; sides ≤ 10; each card head ≤ 8, lead ≤ 10, rows ≤ 6. Maximum 24 labels. No prose inside the cards.

**Avoid.** Four cards of equal weight when the deck's argument is that one of them is different. The different card earns the accent, not a fourth colour.

## 4. Staircase — a process with a promise

Use for a staged process, a maturity path, or a rollout where the **stage order** matters.

```text
                                          [04]
                                   [03]
                            [02]
                     [01]
   ┌─────────────┐   ·    ·    ·    ·
   │ 不停机说明   │   ·    ·    ·    ·
   └─────────────┘   ·    ·    ·    ·
   ─────────────────────────────────────  rail
   01 起草   02 预览   03 审批   04 发布/回退
```

**Build.** Four stages on a rising diagonal (x: 0.05, 0.32, 0.58, 0.82; y: 0.75, 0.55, 0.35, 0.15). A dotted riser drops from each dot to the baseline. The heading sits right of the dot; one short caption below. The upper-left negative space holds the operational promise in a bordered callout. The bottom rail repeats the four stage names and carries the accent line.

**Budget.** Four heads (≤ 6), four captions (≤ 22), one callout (≤ 3 lines), four rail labels. No other prose.

**Avoid.** Six equal cards in two rows. If the rise encodes nothing (time, confidence, irreversibility), use a horizontal rail instead.

## 5. Trunk + glue — build vs buy

Use for a component mix, a licence decision, or "two products carry the trunk".

```text
 [ authentik ]  [ agentgateway ]     [ Admin Portal ]
 └────────── 主干 ──────────┘       └──── 胶水 ────┘
 [ Langfuse · 旁路 · OTel / Trace .................. ]
```

**Build.** Two buy cards at 0.31 W each under a bracket labelled `主干`; one self-built card at 0.29 W under a bracket labelled `胶水`, in the accent tint. A full-width side rail below for the optional component. Each card: licence chip, name, one line of what it replaces, one line of gap.

**Budget.** Three names, three lines (≤ 22), three gaps (≤ 16), one side-rail line (≤ 24). No comparison table.

**Avoid.** A four-row table with `组件 / 许可证 / 作用 / 缺口`. That is this diagram with the structure removed.

## 6. Layer stack — each band does one job

Use for an architecture, a stack, or a security model.

```text
┌────────────────────────────────────────────┐
│ 01 身份        OIDC / roles / attributes    │
├────────────────────────────────────────────┤
│ 02 网关        verify · enforce · meter     │
├────────────────────────────────────────────┤
│ 03 连接器      user identity → system API   │
├────────────────────────────────────────────┤
│ 04 业务系统    row / document / classification│
└────────────────────────────────────────────┘
```

**Build.** Four full-width bands with a 0.03 gap; a left label column; a right job line; one accent band for the layer under discussion. Arrows run on one edge only.

**Budget.** Four layer names (≤ 8), four jobs (≤ 14), one caption. No paragraphs.

**Avoid.** A 3-D stack, a perspective drawing, or an arrow mesh. One plane, one direction.

## 7. 2×2 — a trade-off

Use for prioritisation, risk vs effort, or a build/buy call.

```text
        high impact
             │
   [ now ]   │   [ next ]
  ───────────┼───────────
   [ never ] │   [ later ]
             │
        low impact
```

**Build.** A square at 0.55 W; two axis labels outside it; four quadrant labels inside; one dot or one tinted quadrant for the recommendation. A verdict line below.

**Budget.** Two axes, four labels (≤ 10), one verdict (≤ 24). No explanation of the axes in prose; the labels do that.

**Avoid.** Four cards in a row with a fake "matrix" heading. If the axes are not real, use a comparison.

## 8. Stat row — outcomes

Use for acceptance criteria, a result, or three numbers the audience must remember.

```text
   ≥2                  100%                 ≤30 分
   个应用接入           模型调用经网关        角色变更生效
   AD 一次登录           按角色放行           取决于 token
```

**Build.** Three columns, one number at 40–54 pt, one label at 12–15 pt, one description at 11–12 pt. One takeaway line below the row. Keep the numbers on one baseline.

**Budget.** Three numbers, three labels (≤ 10), three descriptions (≤ 16), one line (≤ 24).

**Avoid.** Four or five stats; a stat with no comparison; a number whose source is not in the footnote.

## 9. Payload — a concrete artifact

Use for a token, a config, an API contract, or a manifest.

```text
┌────────────────────────────┐   ┌ 不带全表
│ {                          │   │ ...
│   "sub": "u_10293",        │   ├ 下次刷新就生效
│   "roles": ["viewer"],     │   │ ...
│   "channel": "MPD"         │   ├ 默认拒绝
│ }                          │   │ ...
└────────────────────────────┘   └
```

**Build.** Artifact on the left at 0.55 W, monospace, 10–11 pt, no syntax colour. Three callouts on the right, each a 6-character head and one line. A real payload is more persuasive than a screenshot of one.

**Budget.** ≤ 10 lines of artifact; three callouts (≤ 6 + 14). No paragraph.

**Avoid.** A code screenshot, a fake terminal chrome, or a payload longer than the slide's body.

## 10. Decision cards — asks

Use for open questions, approvals, or a decision the audience must make.

```text
 1  问题一                 2  问题二
    一句影响                 一句影响

 3  问题三                 4  问题四
    一句影响                 一句影响
```

**Build.** A 2×2 grid; each cell has a number, a question (≤ 16 characters), and one line of consequence. A hairline above the footer carries the "what this decides" line.

**Budget.** Four questions, four lines (≤ 20), one footer. No preamble.

**Avoid.** A bullet list of questions, or a question with three sub-clauses.

## Build order

1. **Frame.** Mark the body frame; do not place a text box first.
2. **Structure.** Place nodes, lanes, rails, or axes. Check the count and the reading direction.
3. **Labels.** Add the names, verbs, and numbers. Stop at the budget.
4. **Accent.** One element in the accent colour: the main path, the anomaly, or the decision.
5. **Title.** Write the claim the structure proves. If the title needs "和", it may be two slides.
6. **Footnote.** One line at 9–10 pt; no second paragraph.

## Structure audit

Before rendering, answer these six questions:

1. Can I name the structure in one word?
2. If I delete every body text block, does the structure still make the argument?
3. Does the title state the claim the structure proves?
4. Is the accent on the main path, not on decoration?
5. Are there ≤ 7 nodes, ≤ 24 labels, ≤ 60 characters of prose?
6. Is there a table? If yes, is it the appendix rather than the slide?

A "no" on 2 or 5 means the slide is not ready for styling.

## Worked transformations

| Before | After | What the structure adds |
|---|---|---|
| Two-column bullet list of responsibilities | Boundary with a JWT on the seam | The hand-off is visible; the reader sees what crosses |
| Four-column component table | Trunk + glue with a side rail | "Two products carry the trunk" is drawn, not asserted |
| Three stacked role rows | Tree with four object cards | The allocation point and the two execution sides are explicit |
| Six steps in two rows of cards | Staircase with a rail | Order, rise, and the operational promise read at a glance |
| Four equal cards of risks | 2×2 or a signal row with one accent | The reader knows which signal triggers the switch |
# Anti-slop standard

AI slop in decks is not bad grammar. It is writing that performs thought instead of doing it: balanced clauses, universal claims, meta-commentary, and paragraphs that survive any topic. It is also a decoration layer that performs structure: invented section tags, fake brand marks, and template chrome that carries no information. The fixes are mechanical once you can see the pattern.

## The nine tells

### 1. Binary profundity

`不是 A，而是 B` / `并非 A，而是 B` / `A 不重要，重要的是 B`

It sounds like a thesis while withholding the actual claim. State B, then say what A was.

| Slop | Rewrite |
|---|---|
| 目标不是做一个新系统，而是把已有的公共能力收口成一处。 | 不新建系统。把身份、网关、连接器收进现有平台团队。 |
| 原则不是口号：每一条都在方案里对应一个具体做法。 | （删除。下一句已经在做这件事。） |
| 这不是一次工具升级，而是一次组织能力升级。 | 这次要改的是角色发布流程，不是模型。 |

### 2. Slogan symmetry

Two balanced halves, often with a comma, that could be a poster: `底座的归底座，业务的归业务`; `数据不出域，模型不出场`.

It reads as a value, not an operating rule. Replace it with who does what.

| Slop | Rewrite |
|---|---|
| 底座的归底座，业务的归业务 | 底座管身份、网关、连接器。角色含义和数据权限留在业务系统。 |
| 一层身份、一个网关、一层连接器，用标准协议连起来 | OIDC 管身份，agentgateway 管调用，MCP 管工具。 |
| 先把问题说清楚 | 今天四个问题各自为政：身份、权限、模型接入、Agent 台账。 |

### 3. Universal-quantifier poetry

`让每个 X 的每一次 Y，都能 Z`; `每一条都…`; `每一次都…`.

The quantifier is doing the emotional work; the mechanism is missing.

| Slop | Rewrite |
|---|---|
| 让每个 Agent 的每一次调用，都能追溯到人、算得清成本 | 每次调用带用户 token。Portal 按人汇总调用次数与模型费用。 |
| 每张卡都标明谁实现、哪个阶段交付 | 卡片右下角是交付阶段。 |
| 每一条风险都写好回退条件 | 五条风险各有触发条件和回退动作（见右表）。 |

### 4. Meta-commentary

Writing about the document, the slide, or the writer's honesty instead of the subject: `诚实标注`, `坦白说`, `需要说明的是`, `本页`, `接下来我们`, `【一手：代码与资源类型实查】`.

The audience came for the content. Put sourcing in one footnote, once.

| Slop | Rewrite |
|---|---|
| 诚实标注 AgentRegistry 是自建的，agentgateway 本身没有 Agent 注册中心【一手：代码与资源类型实查】 | Agent 登记表由 Portal 自建。agentgateway 没有注册中心。 |
| 这正是今天各应用自己写 Key 做不到的 | 现在各应用自己写 Key，查不到调用人。 |
| 估算数字都标了「估算」；没有一手依据的结论标「未验证」 | （删除。统一在页脚写一次：数字为估算，来源见附录。） |

### 5. Consulting nouns

`赋能`, `抓手`, `闭环`, `沉淀`, `对齐`, `复用`, `组合拳`, `护城河`, `顶层设计`, `全景`, `一站式`.

These words hide the verb. Say what happens to what.

| Slop | Rewrite |
|---|---|
| 通过统一网关赋能业务 Agent | 业务 Agent 调模型时先过网关；网关验 token、记费用、限流。 |
| 形成角色治理闭环 | 起草、审批、发布、回滚四个动作都在 Portal 留记录。 |
| 沉淀为可复用的公共能力 | 新系统按同一模板接入，Connector 不用重写。 |

### 6. Signposting and throat-clearing

`一页看懂`, `为什么是现在`, `先说结论`, `让我们`, `想象一下`, `接下来`, `如图所示`.

If the slide is clear, the signpost is noise. If it is not, the signpost does not save it.

| Slop | Rewrite |
|---|---|
| 一页看懂：为什么是现在、做什么、多久见效 | P0 用 3–4 周跑通一条调用链 |
| 为什么是现在 | 三个应用已经在各自发 Key，回收权限靠人工 |
| 接下来我们看角色设计 | 三类角色，分别由平台、业务系统、网关执行 |

### 7. Fake completeness

Four pillars, three layers, six decisions, 100% coverage, `≥2`, `37–55 人周（估算）`. The numbers create authority without a source, and the symmetry makes every point equally important.

- Keep a number only if you can name its source or its assumption.
- Cut the fourth item if it is there to complete the set.
- Say what is excluded. A scope line is stronger than a completeness claim.
- One estimate footnote per deck, not one per number.

### 8. Invented metadata

A small outlined tag at the top: `01 · 今天`, `02 / 方案`, `03 · 落地`. A section code that does not exist in the agenda. A label that repeats the column header directly below it.

This is the decoration layer. It looks like information architecture but carries no information, and it breaks as soon as the page order or section names change.

| Slop | Rewrite |
|---|---|
| `01 · 今天` on page 03, with no section called "今天" in the agenda | Remove it. If the agenda has a section, use its exact name and number: `01 现状`. |
| `02 / 方案` | `方案`, or remove it. |
| `03 · 落地` | Use the same name and number as the agenda. |

Rules:

- A section tag must match the agenda's exact name and number. If the deck has no sections, no tag.
- Do not put a tag on a slide when the title or column header already says the same thing.
- No outlined chips, dot separators, slashes, or two-digit codes added for texture.

### 9. Fake brand marks

A logo is a supplied asset, not a design element. If the logo in the file was drawn by the model, it is a hallucination even when it looks close.

- Use the supplied SVG or PNG at its native aspect ratio and colour. Never trace, recreate, or approximate a logo.
- One position, one size. Cover and close, or the template's fixed footer. Do not improvise a new corner.
- Do not put a logo on every content page just to fill the corner. A page number and a logo in opposite corners is often one element too many.
- If no asset is supplied, use the company name in the body font. An empty corner is better than a fake mark.

## Banned list

Treat these as hard fails in client-facing copy unless the user explicitly asks for the phrase:

`一页看懂` · `一页说清` · `为什么是现在` · `先说结论` · `让我们` · `想象一下` · `不是…而是…` · `并非…而是…` · `这正是` · `这才是真正的` · `本质上` · `归根结底` · `核心在于` · `关键在于` · `值得一提的是` · `诚实标注` · `坦白说` · `需要说明的是` · `赋能` · `抓手` · `闭环` · `沉淀` · `对齐` · `组合拳` · `护城河` · `顶层设计` · `全景` · `一站式`

Also avoid:

- `——` used to append a revelation at the end of a sentence.
- `「」` around ordinary concepts; keep them for UI labels or quoted speech.
- Rhetorical question titles.
- Three-item lists where the third item is filler.
- `(估算)` repeated on every number.
- `100%` without a measurement definition.

## Rewrite pass

Do this on the outline before layout, and again on the built deck.

1. **Title alone test.** Read only the titles. They should form an argument. If a title is a label, rewrite it as a claim with a verb.
2. **Delete the subtitle test.** Remove the one-line subtitle under each title. If no information is lost, it was decoration.
3. **So-what test.** For every bullet, ask "so what?" and write the answer. If the answer is already the bullet, cut it.
4. **Name test.** Replace every abstraction with a named system, role, number, or date. If you cannot, the point is not ready.
5. **Read-aloud test.** If a sentence cannot be said in one breath, split it. If it sounds like a press release, rewrite it.
6. **Cut 30%.** Delete one sentence per slide. Then delete one more if the slide still works.
7. **Source test.** Every number gets a source, an assumption, or a range with the assumption stated once.

## Good writing sounds like this

From a human-written deck on the same topic:

> 37 人范围调整，0 个角色变化。
>
> 辖区调整只改属性，角色不动；全程可预览、可审批、可回退。

Why it works: a concrete number, a surprising second number, and the mechanism in plain verbs. No scaffolding, no metaphor, no balanced clause.

Another:

> 角色管「能做什么」，属性管「能看哪一块」。

One line, two concrete jobs, no filler. The quotes are earned because they name the two concepts the rest of the deck uses.
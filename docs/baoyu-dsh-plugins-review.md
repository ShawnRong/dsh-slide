# baoyu-design 的 DSH 插件：设计语言拆解与借鉴清单

对象：[JimLiu/baoyu-design · dsh-plugins](https://github.com/JimLiu/baoyu-design/tree/main/dsh-plugins)（2026-11 阅读，`dsh-claude-slides` 2.7.0）。本文面向本仓库 `dsh-slide`，回答一个问题：它值得学的是什么，哪些能搬，哪些不能。

---

## 一句话结论

它真正的设计语言不是配色或排版，而是三层约束叠在一起：

1. **产物是文件**——一份 deck 是一个文件夹，`project/deck.json` 做索引，每页一个 HTML，可 diff、可 git、可被 Agent 增量修改；
2. **协作有回路**——本地编辑器改同一批文件，评论带着“指哪打哪”的位置信息回到对话，Agent 改完再回复；
3. **写作有宪法**——固定画布、128 px 边距、24 px 字号地板、一套 4–5 级的字阶、页脚带、标题不跳动，加一份反 AI 腔的文案标准。

三者缺一，产品就退化成“又一个生成 PPT 的按钮”。我们已有第 3 层的一半和第 1 层的替代品（Google Slides），缺的是第 2 层和“产物入口”。

---

## 一、它做了什么

四个插件（slides / design / design-system / dashboard）共享同一套 runtime，每个包的结构完全一致：

```text
dsh-claude-slides/
  lib/index.js       Host：注册技能、解析 Node、跑脚本、监听评论
  lib/client.js      Client：Artifacts 面板、评论卡片、侧栏入口
  skills/claude-slides/
    SKILL.md         操作契约（218 行，约束密度极高）
    artifact-type/reference/*.md   按需加载的十余个参考页
    scripts/artifact.mjs          upload / list / check / open / share / archive
    scripts/editor/               预构建的编辑器页面
  locale/{en,zh}.json  icon.svg  docs/DETAIL*.md  cordis.patch.yml
```

一份 deck 的磁盘形态：

```text
designs/q3-review/
  project/deck.json          {"v":4,"title":"Q3","order":["cover","plan"],...}
  project/slides/cover.html  <section id="cover">…</section>
  project/slides/plan.html
  project/assets/            上传的图片、字体
  comments.json  history/  .artifact-server.json
```

编辑器是 `artifact.mjs open` 起的本地服务（`127.0.0.1:4710`，只读写这份 deck 的文件夹），支持放映、拖动、评论、导出 PDF / HTML / PPTX、局域网分享、版本历史。**Agent 和人在同一批文件上写作**，不是“生成完再下载”。

---

## 二、三层设计语言

### 2.1 产物层：文件即真相

- 索引与内容分离：`deck.json` 只放 `order`、`sections`、`cover`、`faces`、`designSystems`，一页一个文件。加一页 = 加一个文件 + 在 `order` 里加一个 id；删一页 = 删文件 + 从 `order` 移除。没有“重新生成整份 deck”这种操作。
- 格式是封闭子集：`<section>` + 内联样式，1920×1080，`padding:128px`，最小字号 24 px，最多 4 个字族，图片只能走 `/_blob/<id>`。**约束越窄，模型越不容易写出不可渲染的东西**，`check` 也才能给出精确到 `line:col` 的修法。
- 一切可迁移：`archive` 打 zip、`open` 解压即用、`.gitignore` 自动写好、历史存在 `history/`。产物属于用户，不属于插件。

对我们的启示：Google Slides 的 `fileId` 就是我们的“文件夹”，但**“登记 + 能回到做它的会话 + 侧栏打开”这层 UX 与存储无关**，可以照搬。

### 2.2 协作层：评论是一条真正的回路

这是整个项目最值得抄的工程。

```text
用户在编辑器里选中一段文字 → 写评论 → 勾 Send to Agent
        ↓  comments.json
插件 spawn  `artifact.mjs comments <root> --wait`
        ↓  退出并打印 JSON
Host 把线程包装成一条 user message（source.kind = baoyu-design-comment）
        ↓  agent.followup() / agent.inject()
对话里出现一张评论卡片 → Agent 改文件 → comment-reply → 编辑器里立刻看到回复
```

几个关键设计：

- **插件替 Agent 等待**。Agent 只管 `open`，`CommentWatcher` 监听 `tools/result`，从 bash 命令和 stdout 里认出 `open`，自己起 `comments --wait`；评论到了才把消息递进去，Agent 忙时用 `inject`，空闲时用 `followup`，上一批处理完再开始下一轮等待（`runWhenIdle`）。技能文本因此可以写“不要自己起 `--wait`”。
- **评论是一等消息**。不是工具结果、不是侧栏通知，而是一条带 `source` 元数据的 user message，客户端按 `kind` 注册专属卡片，卡片上“View thread”深链回编辑器（`?comment=<id>`）。
- **只在能送达时显示 Send to Agent**。没有后台等待，就不给这个勾选框，避免“发了没人接”的坏体验。
- **跨插件共享一个 Artifacts 页**。`globalThis[Symbol.for('baoyu-design/dsh-artifacts-page')]` 做 hub，四个插件各注册自己，版本号最高的那个挂载页面；`~/.dsh/baoyu-design/artifacts/<sha256(root) 前 24 位>.json` 记录 `{root, skill, sessionId, title, openedAt}`，列表按时间倒序。点卡片 = 回到原会话 + 右侧栏打开编辑器；会话没了就新窗口打开并明确告知。
- **对用户只说结果**。技能里那句 *"Tell the user what happens to the deck, never the mechanism."* 是整套 UX 文案的基调。

### 2.3 表达层：一份 deck 的设计宪法

`SKILL.md` 的 “Designing the deck” 加 `reference/{craft,styles,layout,format}.md`，把“好看”拆成可执行的数字：

| 约束 | 数值 | 用意 |
|---|---|---|
| 画布 | 1920×1080，`padding:128px` | 边距 6.67%，比常见模板宽，天然留白 |
| 字号地板 | 24 px（≈ 12 pt @13.333 in） | 后排可读；低于此说明字太多 |
| 字阶 | 4–5 级，最多 3 个字族 | 用字重/斜体/颜色强调，不靠新字号 |
| 颜色 | 1 深 + 1 浅 + 1–2 强调；两个背景色 + 一张强调页 | 不用纯黑纯白；正文 4.5:1 |
| 页脚带 | 底部 64 px 处一行 24 px，`padding-bottom:160px` | 内容止于 y=920，页脚不抢戏 |
| 标题位置 | 同类内容页标题永远同高；**有标题时不要整列居中** | 翻页时标题不“跳” |
| 填充 | 约 70%，或 `space-between` / `flex:1` 撑开 | 内容页不能只填到 60% 高 |
| 垂直预算 | 标题 ≈ 字号×行数×1.1；表行 ≈ 2.1×字号/行；卡片 = 行数×字号×行高+内边距 | 先算再写，绝不缩字 |
| 宽度 | 正文 800–1000 px；盒子 ≥ 最长单词（约 0.6×字号/字符） | 避免单词中间断行 |
| 图片 | 照片 `cover`，截图/图表 `contain` 配对比底色 | 不拉伸、不裁掉信息 |

文案宪法（`craft.md` + 共享的 `content-design` 段）：

- **One idea per slide**；statement 胜过 bullets；列表改成表格、卡片行、大数字或引言。
- **标题是引入，不是包袱**：*"A title INTRODUCES the slide. It is not the speaker's punchline."* 不做 “It's not X, it's Y.” 的假张力。
- **不编数据**：没有的数字写 `[€__]` 占位符并在回复里列出；绝不编统计或引语。
- **不填内容**：*"One thousand no's for every yes."* 不加占位段落、装饰性 section 标签、无意义图标。
- **改动要克制**：小改只改被点名的那一处，其余版式、间距、字号一律不动；想顺手优化，先建议，不要擅自做。
- **不做 AI 味**：渐变背景、emoji、圆角+左侧色条的卡片，都是点名要避开的套路。

`questions.md` 也很值得抄：只在“会改变产出”的分歧上问，一次最多 4 个，选项是**具体方向**（“The reorg (Recommended)”），不是“你决定”；问一次，不重复问；能默认的就默认，并在一行假设里说明。

### 2.4 视觉层：插件 UI 的设计语言

Artifacts 页的 CSS 只做两件事：**完全用宿主 token**，只给自己一个“类型色”。

- 全部颜色走 `--dsw-alias-*`、`--dsw-radius-*`、`--dsw-font-*`；深浅色主题自动正确。
- 每种产物一个 tint（`--bda-tint`），以 14% 混进背景、hover 22%，用于预览卡和 28 px 的 glyph 底。除此之外没有品牌色。
- 卡片 16:10、`repeat(auto-fill,minmax(220px,1fr))`、28 px 行距、12 px 圆角；预览不是截图，而是用 CSS 画的“纸片/幻灯片/画板/图表”缩略——**没有真图也不空**。
- 加载骨架、空状态（图标 + 一句“还没有作品”）、错误态（原因 + 重试）、`aria-pressed` 筛选、`focus-visible` 焦点环，全部齐备。
- 图标：64×64、圆角 14、单色底 + 白色幻灯片 glyph（Claude 的 `#D97757`），一个品牌色，没有渐变。
- **文档也按界面来设计**：README 按任务组织（安装 / 使用 / 更新 / 卸载 / 遇到问题），每一步写界面上真实存在的标签（**Plugins**、**Add plugin**、**Artifacts**），排障按症状开头（“输入 `/` 后找不到这个技能”），把限制摆在明面上（pnpm 新版本压 24 小时、测试模式只能加 test users）。这和第 2.2 节那句 “tell the user what happens” 是同一条原则：**用户要的是下一步，不是实现**。

我们的 `icon.svg` 是蓝色渐变 + 黄色播放角标，信息量偏多；如果要更“DSH 原生”，可以收敛成单色 + 一个 glyph。这是小事，但和面板卡片的语言一致。

---

## 三、和我们对照：抄什么、不抄什么

| baoyu 的做法 | dsh-slide 现状 | 结论 |
|---|---|---|
| deck 是本地文件夹，`deck.json` 索引 | Google Slides `fileId` + 本地 `.pptx` | **借概念**：做一份“幻灯片登记表”，不搬文件格式 |
| 本地 HTML 编辑器，实时写回 | 编辑器是 Google Slides 本身 | **不抄**。我们卖的是真协作、真评论、真分享；重做一个本地编辑器是负资产 |
| 评论 → Agent 的回路 | 无 | **换方式抄**：Google Drive Comments API 单向桥（见 P1） |
| Artifacts 侧栏 + 跨插件 hub | 只有 Settings 页 | **强烈建议抄**：这是我们最缺的一层 |
| `check` CLI 给“问题 + 修法” | `deck_lint.py` 有分数和硬失败 | **借输出形态**：每条问题带 slide 号、元素、修法 |
| 运行时注入“在 DSH 里怎么跑” | 已有 `DSH_SKILL_NOTE` | 已对齐，保持 |
| Node 解析（Host / 桌面 runtime / PATH / Electron） | Python 脚本，依赖系统 `python3` | 可借“运行时探测 + 明确报错”，优先级低 |
| 设计宪法（数字 + 反 AI 腔） | `DESIGN-SYSTEM.md` / `ANTI-SLOP.md` 已很强 | **互补**：我们的论证/文案更强，他们的空间数学更细 |
| Anthropic 的技能文本与编辑器 | — | **不能抄**，见第六节 |

一个反直觉的取舍值得说清楚：他们做“本地优先”，是因为不想碰云、不想管账号；我们做“Google 优先”，是因为用户要的正是云端协作和交付链接。**所以不要模仿它的产物形态，要模仿它的产品结构**：产物有登记、有入口、能回到上下文、有明确的“下一步”。

---

## 四、可落地的借鉴清单（按 ROI 排序）

### P0 · 幻灯片面板 + 侧栏打开（1 天，无新权限）

> 已实现：`decks.js`、`index.js` 的三条路由与 `client.js` 的 `main` + `sidebar.panellist` 注册；验证方式见仓库 README。

**做什么**：Agent 每次 `import` / `export` / 用户点开一份 deck，都登记一条记录；左侧栏多一个“幻灯片”入口，列出最近用过的 deck，点一下回到原会话并在右侧栏浏览器打开。

**Host**（`index.js`）：

```js
// ~/.dsh/dsh-slide/decks/<sha256(fileId).slice(0,24)>.json
{ v: 1, fileId, name, webViewLink, sessionId, workspace,
  source: 'import' | 'export' | 'open',
  openedAt, firstOpenedAt }
```

- `recordDeck()` 在 `importFile()` 返回后调用；`exportFile()` 需要顺带取一次 `files.get(fields=name,webViewLink)`。
- 路由：`GET /dsh-slide/api/decks`、`POST /dsh-slide/api/decks/open`（只接受已登记且 `fileId` 合法的记录）。
- 列表按 `openedAt` 倒序，过滤 `fileId` 不合法的记录；远程文件是否还在，不在列表时同步检查（打开失败再报错）。

**Client**（`client.js`）：

- `package.json` 的 `dsh.client.inject` 加 `@deepseek-ai/dsh-client-ui-sidebar-right`（以及 `-ui-sidebar`，按实际可用包名）；客户端里用 `ctx.get('uiWorkspace' | 'sessions' | 'sidebarRight' | 'sidebarRightTabs')` 取服务（这些不是 Cordis inject 项）。
- 两个注册，key 必须一致：
  - `ctx.slots.register('sidebar.panellist', { id: 'dsh-slide.decks', order: 30, label }, DeckIcon)`
  - `ctx.slots.register('main', { key: 'dsh-slide.decks' }, DecksPage)`
- 打开逻辑照 baoyu 的 `openInSidebar()`：`ctx.uiWorkspace.openSession(sessionId)` → `ctx.get('sidebarRight').openTabIn(sessionId, 'browser', { params: { url } })`；侧栏不可用则 `window.open`，会话不在则新窗口并提示。
- 面板：标题 + 搜索 + 全部/我创建的筛选；卡片 16:10，用 CSS 画的幻灯片缩略 + 标题 + “x 分钟前打开” + 本地导出路径；空态/错误态/重试齐全；只用 `--dsw-alias-*` token。

**验收**：装到 desktop profile，导入一份 deck → 面板出现 → 点卡片回到会话、右侧栏打开 Google Slides；重启 app 后记录仍在。

### P1 · Google 评论桥（2–3 天，需评估 scope）

Google Slides 没有可嵌入的评论层（编辑器是跨域 iframe），所以不做“选元素评论”，做**评论同步**：

- `google_slides` 增加 `action=comments file_id=…`：`drive.comments.list`（`fields=id,content,quotedFileContent,author,createdTime,resolved,replies`），返回未解决线程。现有 `drive.readonly` 足够读。
- 面板上每张卡显示未解决评论数；Agent 可以“拉取评论 → 改 pptx → import → 回复评论”。
- 回复需要写权限：`drive.file` 只覆盖本应用创建的文件；别人分享给我们的 deck 只能读。这一点要在 UI 里说清楚，不要假装能回。
- 如果要做“自动送达”，用 host 定时轮询（60 s）+ 去重（comment id + modifiedTime），并只在当前会话有对应 deck 时投递；默认关，用户显式开启。**不要**一上来就后台注入消息，容易变成噪音。
- 投递消息复用 baoyu 的形状：`source.kind = 'dsh-slide/google-comment'`，客户端注册 `conversation.chat.node` 卡片，带 “Open thread” 深链。

**验收**：在 Google Slides 里留一条评论 → 面板计数 +1 → Agent 收到一条带文件、引用文本、作者的消息 → 改完 import → 评论回复（限本应用创建的文件）。

### P1 · 技能改造（半天，零风险）

> 已实现：新增 `references/QUESTIONS.md`、`references/SPATIAL.md`，补了共享内容规则和 12 pt 正文地板；评论桥未做。

给 `deck-design` 补三个文件/段落，都是“借结构不借文本”：

1. `references/QUESTIONS.md`：只问改变产出的问题、一次 ≤4 个、选项是具体方向、推荐项在前、不重复问；空 brief 才问受众和长度。
2. `references/SPATIAL.md`：把他们的垂直预算翻成 PPTX 单位——
   - 13.333×7.5 in，0.6 in 边距，内容高 6.3 in（扣 1.1 in 页脚带后 5.2 in）；
   - 标题 ≈ `字号(pt)/72 × 行数 × 1.1` in；表格行 ≈ `2.1 × 字号/72` in；卡片 = 行数 × 字号/72 × 行高 + 内边距；
   - 有标题的内容页，标题基线固定，不要整列垂直居中；
   - 页脚带只放一行（页码 + 来源/品牌），不与其他元素争位置；
   - 文本框宽度 ≥ 最长单词（中文按最长不可断词组），宁拆页不缩字。
3. 在 `SKILL.md` 的 Rules 里加共享内容规则：不填内容、加内容前先问、小改只改被点名处、跟随既有视觉词汇、不用渐变/emoji/圆角左色条。

另外把 `pptx-deck-edit` 的 DSH note 补一句：**改之前重新 export 一次**，避免覆盖用户在 Google Slides 里的手改。这条对应他们的 “read right before you edit”。

字号地板建议从 9 pt 提到 12 pt（来源行可 9–10 pt），并按新地板重算密度预算。这是最便宜的一次“看起来更专业”。

### P2 · 视觉与设计令牌（可选）

- **缩略图**：`files.get` 加 `thumbnailLink`，由 Host 代理取图（需要 Authorization），面板卡片用它替掉 CSS 占位；取不到再回落到占位。
- **deck 级 tokens**：在 deck 旁放 `tokens.json`（颜色角色、字阶、间距、圆角），`deck_lint.py` 读它校验对比度和字号是否越界；未来可以从导出的 pptx 主题 XML 自动生成，或对接品牌设计系统。
- **图标收敛**：单色底 + 一个幻灯片 glyph，去掉渐变和播放角标，和面板卡片语言一致。

---

## 五、数字换算表（1920 px 画布 → 13.333 in PPTX）

按宽度等比换算：`1 px = 13.333/1920 in = 0.006944 in`；字号 `pt = px × 0.5`。

| baoyu（px） | PPTX 等效 | 我们的现状 |
|---|---|---|
| 边距 128 | 0.89 in | 0.6 in（偏窄） |
| 字号地板 24 | 12 pt | 9 pt（偏松） |
| 正文 28–32 | 14–16 pt | 14–16 pt（一致） |
| 页标题 72 | 36 pt | 28–32 pt（偏小） |
| Display 96 | 48 pt | 44–54 pt（一致） |
| 页脚 24 @ bottom 64 | 12 pt @ 0.44 in | 9–11 pt |
| 内容高 824 | 5.72 in | 5.8 in（接近） |

结论：我们的字号体系整体比他们“紧一档”。不是必须全盘对齐（PPTX 的渲染和观看距离不同），但 **12 pt 正文地板 + 0.75–0.85 in 边距 + 36 pt 的页标题** 会让 deck 立刻更像“演示稿”而不是“文档”。

---

## 六、边界与许可

- `dsh-claude-slides` 的技能文本、参考页、编辑器来自 Anthropic claude.ai 的 Slides artifact type，**不是 MIT**；插件代码（`lib/`、`locale/`、`cordis.patch.yml`、`docs/`、`icon.svg`）才是 MIT。仓库根的 `NOTICE.md` 写得很清楚。
- 所以：**可以学结构、学数字、学交互，不能复制 SKILL.md 的句子、参考页内容或编辑器资源**。本文所有引用只用于评论。
- 同样不要复制 “Claude” 品牌色和命名；我们的面板用 DSH token + 自己的蓝色即可。

---

## 七、建议的下一步

先做 P0，一周内能验证“产物入口”是否真的提升留存；同时做 P1 的技能改造（纯文档，随时可回滚）。评论桥等 P0 验证后再决定，因为它涉及 scope 和后台轮询的产品判断，不是纯工程问题。

如果要动手，顺序是：

1. Host：`recordDeck` + 两条路由 + `import/export` 埋点；
2. Client：`sidebar.panellist` + `main` 两个注册 + 面板；
3. 手工验收：导入 → 重启 → 点卡片 → 侧栏打开；
4. 再补 P1 的三个 reference 和字号地板。

---

### 参考

- 插件目录：<https://github.com/JimLiu/baoyu-design/tree/main/dsh-plugins>
- Slides 技能：<https://github.com/JimLiu/baoyu-design/blob/main/dsh-plugins/dsh-claude-slides/skills/claude-slides/SKILL.md>
- Host 集成（评论等待、Node 解析）：<https://github.com/JimLiu/baoyu-design/blob/main/dsh-plugins/dsh-claude-slides/lib/index.js>
- Client 集成（Artifacts 面板、评论卡片）：<https://github.com/JimLiu/baoyu-design/blob/main/dsh-plugins/dsh-claude-slides/lib/client.js>
- 版式与工艺：`artifact-type/reference/layout.md`、`craft.md`、`styles.md`
- 设计系统令牌示例：<https://github.com/JimLiu/baoyu-design/blob/main/dsh-plugins/dsh-claude-design-system/skills/claude-design-system/artifact-type/demo.json>
# Three-slide progress cadence

The user should see the deck while it is being built, not after. Publish the current result every three slides. A checkpoint is a progress post, not a gate: the default is to publish and keep building. Stop only when the user asks for batch-by-batch review, or when a decision blocks the next batch.

The default batch size is 3. Honor an explicit different cadence from the user. In the commands below, `$S` is this skill's `scripts/` directory.

## The loop

1. **Build three slides.** No more than three without publishing. If the deck ends mid-batch, the last batch can be one or two.
2. **Render the three slides to PNG.** 1600–1920 px wide is enough to read the body text. For a local `.pptx`, load the `office-render` skill and use its LibreOffice Kit CLI with `render --pages "1,2,3"`; `pptx-deck-edit/scripts/render.sh` also works. For a Google deck, use `google_slides pdf`.
3. **Compose a 3-up grid and publish it.** Run `python3 $S/checkpoint.py --out work/<deck>/checkpoints/b1/sheet.png --title "第 1–3 页" --start 1 <three PNGs>`. Post the grid inline with a one-line summary of what this batch contains. The grid is the progress view; the individual PNGs are for detailed copy review.
4. **Add the links.** The local `.pptx` path, and the Google Slides URL when the deck already exists there. If the link opens the whole deck, say which page range this batch covers. For a new deck, do not import a fresh Google Slides file at every checkpoint; import once when the deck is accepted.
5. **Say what is next.** One line: "接下来做第 4–6 页：现状痛点、边界、设计原则." Add a question only if a decision would change the next batch. Make clear you are continuing.
6. **Continue to the next three.** Do not wait for a reply in continuous mode. A checkpoint is not delivery, and it is not a permission request.
7. **Apply feedback when it arrives.** If the user interrupts, change the affected slides and any later slide that repeats the claim. Re-render the changed slides and show them. If you have already moved past that batch, say which later slides are affected.
8. **Log the decision.** Add one line to `NOTES.md` or the storyboard: what changed, why, and which slides were affected.

## Modes

- **Continuous (default).** Publish a 3-up grid every three slides and keep building. Use `present` with the grid after each batch for the in-conversation card. The user can interrupt or comment at any time; do not stop on your own.
- **Interactive.** Publish, flag the open decisions, end the turn, and wait. Use this only when the user asks for it ("每批停一下", "review each batch"), or when the next batch depends on an unresolved decision (a number, a scope call, a client-specific fact).

If the mode is unclear, default to continuous and say so once: "我按连续模式推进，每 3 页贴一次进度；你随时可以打断。"

## Progress block template

```text
第 1–3 页做好了：封面、执行摘要、议程。

![第 1–3 页](work/deck/checkpoints/b1/sheet.png)

本地文件：[batch-1.pptx](work/deck/batch-1.pptx)
Google Slides：[打开](https://docs.google.com/presentation/d/<id>/edit)（第 1–3 页）

接下来做第 4–6 页：现状痛点、边界、设计原则。有需要调整的直接按页号说，没有我就继续。
```

Adjust the language to the user's language. In continuous mode, do not end with "你回复后我再做" — say what you are doing next. Add a question only when the answer changes the next batch; do not turn every progress post into a review form.

## What counts as shown

- The image must be rendered from the current file. Do not describe a slide from memory or from the XML.
- Show the actual crop the audience will see. No placeholder screenshots.
- The 3-up grid is the default progress image. If the user wants to read body copy or comment line by line, also post the three individual PNGs or the full-size slide.
- `present` is the progress channel in a continuous run. Call it with the grid after each batch, not only at the end.
- If `present` is unavailable, include the grids in the final message and name the batch folders so the user can open them.
- If the batch is a Google Slides file, use the Google PDF render, not a local LibreOffice render, because Google wraps text differently.
- If the deck is a local `.pptx` and no renderer is available, import it once, export the Google PDF, and use that render. Do not guess from the XML.

## Good questions

Use these only when a real decision is open. Ask about something the user can change in one sentence:

- "封面这句主张是不是你要的？如果不是，你希望读者记住哪一句？"
- "第 2 页的四个数字，哪个需要换成客户口径？"
- "第 3 页的架构图，四个平面是否都要保留？"
- "这一页放在这里，还是挪到附录？"
- "这个版式密度可以接受吗？如果不行，我删掉哪一块？"

Avoid:

- "你觉得怎么样？"
- "这样可以吗？" with no object.
- "要不要再改改？"
- Asking five questions at once.

## Handling feedback

- **Content change:** update the claim and every downstream slide that repeats it. Tell the user which later slides will change.
- **Design change:** apply it to the current batch and decide whether earlier slides need the same change. If so, re-render them.
- **Scope change:** update the outline before building further; do not silently add or remove slides.
- **"Continue" / no objection:** keep building. No acknowledgement loop needed.
- **User asks to slow down:** switch to interactive mode and pause after each batch.
- **User goes quiet:** in continuous mode, keep building; in interactive mode, wait.

## Exceptions

- **Outline review:** for a new deck, you may show the one-line-per-slide outline before batch 1. It is cheaper to change than three built slides.
- **User says "build it all first":** this is continuous mode. Keep the three-slide progress posts; do not save them all for the end.
- **Small edit to an existing deck:** use `pptx-deck-edit` and show the changed slides, not the whole deck.

## Artifacts

Keep progress renders in a predictable place:

```text
work/<deck>/checkpoints/b1/slide-01.png
work/<deck>/checkpoints/b1/slide-02.png
work/<deck>/checkpoints/b1/slide-03.png
work/<deck>/checkpoints/b1/sheet.png      # the image posted in the conversation
```

Name the batch by its slide range (`b1` = slides 1–3, `b2` = 4–6). That makes the conversation links and the later review easy to follow.
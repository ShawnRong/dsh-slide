#!/usr/bin/env python3
"""Content and layout lint for a slide deck.

Usage:
    python3 deck_lint.py deck.pptx
    python3 deck_lint.py deck.pptx --json
    python3 deck_lint.py deck.pptx --min-score 80

Exit codes: 0 = clean enough, 1 = hard failures, 2 = cannot read the deck.

The linter is deliberately opinionated. It encodes the deck-design standard:
readable type, low density, varied composition, and copy without AI tells.
It does not judge whether the argument is right.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

try:
    from pptx import Presentation
    from pptx.enum.dml import MSO_FILL
except ImportError:
    print("deck_lint.py needs python-pptx: pip install python-pptx", file=sys.stderr)
    sys.exit(2)

EMU_IN = 914400
SLIDE_W = 13.333
SLIDE_H = 7.5

CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
LATIN_WORD = re.compile(r"[A-Za-z][A-Za-z'’-]*")
PAGE_NO = re.compile(r"^\s*\d{1,2}\s*/\s*\d{1,2}\s*$")
EYEBROW = re.compile(r"^\s*\d{1,2}\s*[·•/|]\s*[^\s].{0,24}$")
NUMBERED_LABEL = re.compile(r"^\s*\d{1,2}\s*[.、)]?\s*")

BANNED = [
    ("copy.binary", "binary-profundity", re.compile(r"不是[^。！？\n]{1,24}而是")),
    ("copy.binary", "binary-profundity", re.compile(r"并非[^。！？\n]{1,24}而是")),
    ("copy.binary", "binary-profundity", re.compile(r"不是[^。！？\n]{1,20}[，,]\s*是")),
    ("copy.slogan", "slogan-symmetry", re.compile(r"原则不是口号|不是口号")),
    ("copy.universal", "universal-quantifier", re.compile(r"让每[^。！？\n]{0,14}都")),
    ("copy.meta", "meta-commentary", re.compile(r"诚实标注|坦白说|客观地说|需要说明的是|必须说明")),
    ("copy.meta", "meta-commentary", re.compile(r"【[^】]{2,30}】")),
    ("copy.throat", "throat-clearing", re.compile(r"一页看懂|一页说清|一页讲清|为什么是现在|先说结论|让我们|想象一下")),
    ("copy.buzz", "consulting-noun", re.compile(r"赋能|抓手|闭环|沉淀|对齐|组合拳|护城河|顶层设计|全景|一站式")),
    ("copy.reveal", "em-dash-reveal", re.compile(r"——")),
]
HEDGE = re.compile(r"（估算）|\(估算\)")
QUOTE = re.compile(r"「[^」]{1,14}」")
PARALLEL = re.compile(r"[一二三四五六七八九十两]{1,2}(个|条|层|类|块|步|项|件|种|期)")
META_DOC = re.compile(r"本页|这份提案|本文|本方案在讲|接下来我们")

LABEL_TITLES = {
    "agenda", "executive summary", "executive-summary", "q&a", "thank you", "thanks",
    "现状与目标", "方案设计", "角色与流程", "落地路线", "背景与目标", "方案全貌",
    "角色细分方案", "落地计划", "实施路线", "风险与应对", "总结", "谢谢",
}


@dataclass
class TextItem:
    slide: int
    text: str
    size: float | None
    top: float
    left: float
    width: float
    height: float
    fill: tuple[int, int, int] | None
    color: tuple[int, int, int] | None
    bold: bool
    nested: bool = False


@dataclass
class SlideInfo:
    number: int
    texts: list[TextItem] = field(default_factory=list)
    shape_count: int = 0
    body_signatures: tuple = ()
    has_picture: bool = False
    title: str = ""
    density: int = 0
    dominant_ratio: float = 0.0


def emu_to_in(value) -> float:
    return float(value) / EMU_IN if value is not None else 0.0


def rgb_of(color) -> tuple[int, int, int] | None:
    try:
        rgb = color.rgb
        return (rgb[0], rgb[1], rgb[2])
    except Exception:
        return None


def solid_fill(shape) -> tuple[int, int, int] | None:
    try:
        if shape.fill.type == MSO_FILL.SOLID:
            return rgb_of(shape.fill.fore_color)
    except Exception:
        pass
    return None


def slide_background(slide) -> tuple[int, int, int] | None:
    try:
        if slide.background.fill.type == MSO_FILL.SOLID:
            return rgb_of(slide.background.fill.fore_color)
    except Exception:
        pass
    return None


def iter_shapes(shapes, depth=0):
    for shape in shapes:
        yield shape, depth
        if shape.shape_type == 6:  # group
            yield from iter_shapes(shape.shapes, depth + 1)


def shape_text_runs(shape):
    """Yield (text, size, color, bold) for visible text runs."""
    if getattr(shape, "has_text_frame", False):
        for paragraph in shape.text_frame.paragraphs:
            text = "".join(run.text for run in paragraph.runs).strip()
            if not text:
                continue
            size = None
            color = None
            bold = False
            for run in paragraph.runs:
                if not run.text.strip():
                    continue
                if run.font.size is not None:
                    size = run.font.size.pt
                if run.font.bold is not None:
                    bold = bool(run.font.bold)
                found = rgb_of(run.font.color)
                if found:
                    color = found
                break
            if size is None and paragraph.font.size is not None:
                size = paragraph.font.size.pt
            if color is None:
                color = rgb_of(paragraph.font.color)
            yield text, size, color, bold, False
    if getattr(shape, "has_table", False):
        for row in shape.table.rows:
            for cell in row.cells:
                for paragraph in cell.text_frame.paragraphs:
                    text = "".join(run.text for run in paragraph.runs).strip()
                    if not text:
                        continue
                    size = paragraph.font.size.pt if paragraph.font.size else None
                    yield text, size, rgb_of(paragraph.font.color), bool(paragraph.font.bold), True


def background_for(shape, slide, slide_shapes, bg_default):
    own = solid_fill(shape)
    if own:
        return own
    cx = shape.left + shape.width / 2
    cy = shape.top + shape.height / 2
    best = None
    best_area = 0
    for other in slide_shapes:
        if other is shape:
            continue
        if other.left <= cx <= other.left + other.width and other.top <= cy <= other.top + other.height:
            fill = solid_fill(other)
            area = float(other.width) * float(other.height)
            if fill and area > best_area:
                best, best_area = fill, area
    return best or slide_background(slide) or bg_default


def luminance(rgb: tuple[int, int, int]) -> float:
    channels = []
    for value in rgb:
        c = value / 255
        channels.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def units(text: str) -> int:
    return len(CJK.findall(text)) + len(LATIN_WORD.findall(text))


def read_deck(path: Path) -> tuple[list[SlideInfo], float, float]:
    prs = Presentation(str(path))
    width = emu_to_in(prs.slide_width) or SLIDE_W
    height = emu_to_in(prs.slide_height) or SLIDE_H
    slides: list[SlideInfo] = []

    for index, slide in enumerate(prs.slides, start=1):
        info = SlideInfo(number=index)
        top_shapes = list(slide.shapes)
        info.shape_count = sum(1 for _ in iter_shapes(top_shapes))
        info.has_picture = any(shape.shape_type == 13 for shape, _ in iter_shapes(top_shapes))
        bg = slide_background(slide) or (255, 255, 255)

        body = []
        for shape, depth in iter_shapes(top_shapes):
            if shape.shape_type == 13:
                continue
            for text, size, color, bold, is_table in shape_text_runs(shape):
                if PAGE_NO.match(text):
                    continue
                info.texts.append(TextItem(
                    slide=index,
                    text=text,
                    size=size,
                    top=emu_to_in(shape.top),
                    left=emu_to_in(shape.left),
                    width=emu_to_in(shape.width),
                    height=emu_to_in(shape.height),
                    fill=background_for(shape, slide, top_shapes, bg),
                    color=color,
                    bold=bold,
                    nested=depth > 0 or is_table,
                ))
            if shape.top is not None and shape.height is not None:
                t = emu_to_in(shape.top)
                h = emu_to_in(shape.height)
                w = emu_to_in(shape.width)
                l = emu_to_in(shape.left)
                info.dominant_ratio = max(info.dominant_ratio, (w * h) / (width * height))
                if t > 1.05 and t + h < height - 0.55 and w * h > 0.45:
                    body.append((round(l / 0.25), round(t / 0.25),
                                 round(w / 0.25), round(h / 0.25)))
        info.body_signatures = tuple(sorted(body))
        info.density = sum(units(item.text) for item in info.texts)

        # Title: a placeholder if present, else the largest top text.
        candidates = [item for item in info.texts if item.top < 1.75 and units(item.text) >= 3]
        if getattr(slide.shapes, "title", None) is not None and slide.shapes.title.text.strip():
            info.title = slide.shapes.title.text.strip()
        elif candidates:
            best = max(candidates, key=lambda item: ((item.size or 0), -item.top))
            info.title = best.text
        slides.append(info)
    return slides, width, height


def add(finding, severity, code, message, slides=()):
    finding.append({
        "severity": severity,
        "code": code,
        "message": message,
        "slides": sorted(set(slides))[:12],
    })


def lint(path: Path):
    slides, width, height = read_deck(path)
    findings: list[dict] = []
    scores = {"content": 100.0, "design": 100.0}
    stats = {"slides": len(slides)}

    all_text = "\n".join(item.text for slide in slides for item in slide.texts)
    total_units = units(all_text)
    stats["units"] = total_units

    # ---------------- content ----------------
    banned_hits = []
    for slide in slides:
        for item in slide.texts:
            for code, label, pattern in BANNED:
                for match in pattern.finditer(item.text):
                    banned_hits.append((code, label, slide.number, match.group(0)))

    binary_hits = [h for h in banned_hits if h[0] in {"copy.binary", "copy.slogan", "copy.universal"}]
    meta_hits = [h for h in banned_hits if h[0] == "copy.meta"]
    throat_hits = [h for h in banned_hits if h[0] == "copy.throat"]
    buzz_hits = [h for h in banned_hits if h[0] == "copy.buzz"]

    if binary_hits:
        examples = "; ".join(f"slide {s}: {m}" for _, _, s, m in binary_hits[:4])
        add(findings, "hard", "copy.binary",
            f"{len(binary_hits)} binary/slogan construction(s). State the positive claim. {examples}",
            [s for _, _, s, _ in binary_hits])
        scores["content"] -= min(24, 6 * len(binary_hits))

    if meta_hits:
        examples = "; ".join(f"slide {s}: {m}" for _, _, s, m in meta_hits[:4])
        add(findings, "hard", "copy.meta",
            f"{len(meta_hits)} meta/self-referential phrase(s). Remove the commentary, keep the fact. {examples}",
            [s for _, _, s, _ in meta_hits])
        scores["content"] -= min(18, 7 * len(meta_hits))

    if throat_hits:
        examples = "; ".join(f"slide {s}: {m}" for _, _, s, m in throat_hits[:4])
        add(findings, "hard", "copy.throat",
            f"{len(throat_hits)} signpost(s). Delete them; the deck should already do the work. {examples}",
            [s for _, _, s, _ in throat_hits])
        scores["content"] -= min(14, 5 * len(throat_hits))

    if buzz_hits:
        examples = "; ".join(f"slide {s}: {m}" for _, _, s, m in buzz_hits[:5])
        add(findings, "warn", "copy.buzz",
            f"{len(buzz_hits)} consulting noun(s). Replace with the action. {examples}",
            [s for _, _, s, _ in buzz_hits])
        scores["content"] -= min(12, 3 * len(buzz_hits))

    reveal_hits = [h for h in banned_hits if h[0] == "copy.reveal"]
    if reveal_hits:
        add(findings, "warn", "copy.reveal",
            f"{len(reveal_hits)} em-dash reveal(s). Split the sentence or delete the tail.",
            [s for _, _, s, _ in reveal_hits])
        scores["content"] -= min(6, 1.5 * len(reveal_hits))

    hedges = sum(len(HEDGE.findall(item.text)) for slide in slides for item in slide.texts)
    if hedges > 2:
        add(findings, "warn", "copy.hedge",
            f"{hedges} inline estimate markers. Put one convention in the footer.")
        scores["content"] -= min(6, hedges)

    quotes = sum(len(QUOTE.findall(item.text)) for slide in slides for item in slide.texts)
    if quotes > 2:
        add(findings, "warn", "copy.quotes",
            f"{quotes} bracketed concept(s). Keep quotes for UI labels or speech, not for emphasis.")
        scores["content"] -= min(5, quotes * 0.75)

    meta_doc = [(slide.number, m.group(0)) for slide in slides for item in slide.texts
                for m in META_DOC.finditer(item.text)]
    if meta_doc:
        add(findings, "warn", "copy.meta-doc",
            f"{len(meta_doc)} reference(s) to the document itself: "
            + "; ".join(f"slide {s}: {m}" for s, m in meta_doc[:4]),
            [s for s, _ in meta_doc])
        scores["content"] -= min(8, 4 * len(meta_doc))

    parallel_counts = [(slide.number, len(PARALLEL.findall(
        " ".join(item.text for item in slide.texts)))) for slide in slides]
    parallel_slides = [(s, c) for s, c in parallel_counts if c >= 5]
    if len(parallel_slides) >= 2:
        worst_slide, worst_count = max(parallel_slides, key=lambda item: item[1])
        add(findings, "warn", "copy.parallel",
            f"{len(parallel_slides)} slide(s) lean on numbered sets; slide {worst_slide} has "
            f"{worst_count}. Not every point needs a count.",
            [s for s, _ in parallel_slides])
        scores["content"] -= min(6, 2 * len(parallel_slides))

    long_paras = []
    for slide in slides:
        for item in slide.texts:
            n = units(item.text)
            if n > 55:
                long_paras.append((slide.number, n))
    if long_paras:
        hard = [p for p in long_paras if p[1] > 80]
        add(findings, "hard" if hard else "warn", "copy.long",
            f"{len(long_paras)} paragraph(s) over 55 units (body max is about 45). "
            f"Longest: slide {max(long_paras, key=lambda p: p[1])[0]} "
            f"({max(long_paras, key=lambda p: p[1])[1]} units).",
            [s for s, _ in long_paras])
        scores["content"] -= min(12, 3 * len(long_paras))

    labels = []
    for slide in slides:
        title = NUMBERED_LABEL.sub("", slide.title).strip().lower()
        if title in LABEL_TITLES or (title and title.rstrip("。.") in LABEL_TITLES):
            labels.append(slide.number)
    if len(labels) >= max(2, len(slides) // 4):
        add(findings, "warn", "copy.label-title",
            f"{len(labels)} label title(s). Rewrite as a claim with a verb.", labels)
        scores["content"] -= 8

    rhetorical = [slide.number for slide in slides if slide.title.rstrip().endswith(("？", "?"))]
    if rhetorical:
        add(findings, "warn", "copy.rhetorical-title",
            f"{len(rhetorical)} question title(s). Answer it in the title instead.", rhetorical)
        scores["content"] -= 4

    eyebrows = []
    for slide in slides:
        for item in slide.texts:
            if item.top <= 1.4 and (item.size is None or item.size <= 12) and EYEBROW.match(item.text):
                eyebrows.append((slide.number, item.text.strip()))
    if eyebrows:
        unique_slides = sorted({number for number, _ in eyebrows})
        examples = "; ".join(f"slide {number}: “{text}”" for number, text in eyebrows[:4])
        add(findings, "warn", "copy.eyebrow-tag",
            f"{len(eyebrows)} decorative section tag(s) at the top. A tag must match the "
            f"agenda's exact name and number; otherwise remove it. {examples}",
            unique_slides)
        scores["content"] -= min(8, 4 * len(unique_slides))

    # ---------------- design ----------------
    sizes = [(item.size, item.slide) for slide in slides for item in slide.texts
             if item.size is not None]
    explicit_sizes = [s for s, _ in sizes]
    stats["explicit_font_runs"] = len(explicit_sizes)
    if explicit_sizes:
        tiny = [(s, n) for s, n in sizes if s < 9]
        stats["min_font"] = min(explicit_sizes)
        stats["median_font"] = round(sorted(explicit_sizes)[len(explicit_sizes) // 2], 1)
        if tiny:
            examples = ", ".join(f"slide {n} ({s:g} pt)" for s, n in tiny[:6])
            add(findings, "hard", "type.min-size",
                f"{len(tiny)} run(s) below 9 pt; minimum is {min(s for s, _ in tiny):g} pt. "
                f"Cut copy instead of shrinking. {examples}",
                [n for _, n in tiny])
            scores["design"] -= 22
        if stats["median_font"] < 10.5:
            add(findings, "warn", "type.median",
                f"Median run size is {stats['median_font']} pt; body should be 14–16 pt.")
            scores["design"] -= 10
    else:
        add(findings, "warn", "type.inherited",
            "No explicit font sizes found. The linter cannot verify readability; set sizes in the file.")
        scores["design"] -= 5

    densities = [(slide.number, slide.density) for slide in slides]
    dense = [d for d in densities if d[1] > 240]
    very_dense = [d for d in densities if d[1] > 320]
    stats["median_density"] = sorted(d for _, d in densities)[len(densities) // 2] if densities else 0
    stats["max_density"] = max((d for _, d in densities), default=0)
    if very_dense:
        add(findings, "hard", "layout.density",
            f"{len(very_dense)} slide(s) over 320 units of text; median is "
            f"{stats['median_density']}. Split the slide or cut copy.",
            [n for n, _ in very_dense])
        scores["design"] -= 15
    elif dense:
        add(findings, "warn", "layout.density",
            f"{len(dense)} slide(s) over 240 units of text; median is {stats['median_density']}.",
            [n for n, _ in dense])
        scores["design"] -= 8

    shape_counts = [slide.shape_count for slide in slides]
    avg_shapes = sum(shape_counts) / max(1, len(shape_counts))
    stats["avg_shapes"] = round(avg_shapes, 1)
    if avg_shapes > 24:
        add(findings, "hard", "layout.shapes",
            f"Average {avg_shapes:.1f} shapes per slide; the ceiling is about 12. "
            "Remove decoration, merge cards, or simplify the diagram.")
        scores["design"] -= 15
    elif avg_shapes > 14:
        add(findings, "warn", "layout.shapes",
            f"Average {avg_shapes:.1f} shapes per slide; aim for 12 or fewer.")
        scores["design"] -= 8

    if len(slides) >= 10:
        signatures = {slide.body_signatures for slide in slides if len(slide.body_signatures) >= 2}
        unique = len(signatures)
        stats["unique_layouts"] = unique
        if unique <= 3:
            add(findings, "hard", "layout.sameness",
                f"Only {unique} distinct body composition(s) across {len(slides)} slides. "
                "Vary the archetype; do not run the template on every page.")
            scores["design"] -= 14
        elif unique / len(slides) < 0.35:
            add(findings, "warn", "layout.sameness",
                f"{unique} distinct body compositions across {len(slides)} slides "
                f"({unique / len(slides):.0%}). Add statement, comparison, or visual slides.")
            scores["design"] -= 8


    # Out of bounds (allow a 0.05 in tolerance).
    oob = []
    for slide in slides:
        for item in slide.texts:
            if item.nested:
                continue
            if (item.left < -0.05 or item.top < -0.05
                    or item.left + item.width > width + 0.05
                    or item.top + item.height > height + 0.05):
                oob.append(slide.number)
                break
    if oob:
        add(findings, "warn", "layout.bounds",
            f"{len(oob)} slide(s) with text outside the canvas.", oob)
        scores["design"] -= 5

    # Contrast, explicit colours only.
    bad_contrast = []
    for slide in slides:
        for item in slide.texts:
            if item.nested or not item.color or not item.fill or not item.size:
                continue
            threshold = 3.0 if item.size >= 24 or (item.size >= 18.66 and item.bold) else 4.5
            ratio = contrast(item.color, item.fill)
            if ratio < threshold - 0.15:
                bad_contrast.append((ratio, slide.number, item.size, item.text[:28]))
    if bad_contrast:
        worst = sorted(bad_contrast)[:5]
        add(findings, "warn", "color.contrast",
            f"{len(bad_contrast)} text/background pair(s) below the contrast target "
            f"(4.5:1 body, 3:1 large). Worst: "
            + "; ".join(f"slide {s} {r:.1f}:1 at {z:g} pt" for r, s, z, _ in worst),
            [s for _, s, _, _ in bad_contrast])
        scores["design"] -= min(12, 4 * len(bad_contrast))

    # Pictures: informational only.
    with_pictures = sum(1 for slide in slides if slide.has_picture)
    stats["slides_with_picture"] = with_pictures

    # Repeated bullet openings.
    openings = Counter()
    for slide in slides:
        for item in slide.texts:
            text = item.text.strip()
            if units(text) >= 6 and not text.startswith(("01", "02", "03", "04")):
                openings[text[:4]] += 1
    repeated = [(key, count) for key, count in openings.most_common(3) if count >= 4]
    if repeated:
        add(findings, "warn", "copy.repeated-openers",
            "Repeated bullet openings: "
            + "; ".join(f"“{key}…” ×{count}" for key, count in repeated))
        scores["content"] -= 4

    stats["banned_hits"] = len(banned_hits)
    stats["quotes"] = quotes
    stats["hedges"] = hedges

    for key in scores:
        scores[key] = max(0, min(100, round(scores[key])))
    scores["overall"] = round(scores["content"] * 0.55 + scores["design"] * 0.45)
    stats["words_per_slide"] = round(total_units / max(1, len(slides)), 1)
    return slides, findings, scores, stats


def render_text(path: Path, findings, scores, stats) -> str:
    hard = [f for f in findings if f["severity"] == "hard"]
    warn = [f for f in findings if f["severity"] == "warn"]
    lines = [
        f"deck_lint  ·  {path}",
        f"{stats['slides']} slides  ·  {stats.get('avg_shapes', 0)} shapes/slide  ·  "
        f"{stats.get('median_density', 0)} body units/slide  ·  "
        f"min {stats.get('min_font', '?')} pt  ·  median {stats.get('median_font', '?')} pt",
        f"Content {scores['content']}/100   Design {scores['design']}/100   "
        f"Overall {scores['overall']}/100",
        "",
    ]
    if not findings:
        lines.append("No findings. Still do the visual pass.")
    for label, group in (("HARD", hard), ("WARN", warn)):
        if not group:
            continue
        lines.append(f"{label}")
        for f in group:
            where = f"  [slides {', '.join(map(str, f['slides']))}]" if f["slides"] else ""
            lines.append(f"  {f['code']:<22} {f['message']}{where}")
        lines.append("")
    if hard:
        lines.append(f"Fix {len(hard)} hard failure(s) before presenting.")
    elif scores["overall"] < 80:
        lines.append("No hard failures, but the score is below 80. Tighten copy and density.")
    else:
        lines.append("Passes the automated gate. Do the visual pass next.")
    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Content and layout lint for a .pptx deck.")
    parser.add_argument("deck", type=Path, help="path to a .pptx file")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    parser.add_argument("--min-score", type=int, default=0,
                        help="exit 1 if the overall score is below this value")
    args = parser.parse_args(argv)

    if not args.deck.exists():
        print(f"deck_lint: no such file: {args.deck}", file=sys.stderr)
        return 2
    try:
        slides, findings, scores, stats = lint(args.deck)
    except Exception as error:
        print(f"deck_lint: cannot read {args.deck}: {error}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps({
            "file": str(args.deck),
            "scores": scores,
            "stats": stats,
            "findings": findings,
        }, ensure_ascii=False, indent=2))
    else:
        print(render_text(args.deck, findings, scores, stats))

    hard = any(f["severity"] == "hard" for f in findings)
    if hard or scores["overall"] < args.min_score:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
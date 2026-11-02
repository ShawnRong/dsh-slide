#!/usr/bin/env python3
"""Geometry for diagram-first slides.

A small, brand-neutral kit for the structures in references/DIAGRAM-PATTERNS.md.
All coordinates are inches. Pass the deck's own colours; this module has no palette.

    from diagram_kit import dbox, box_text, seg, dot, branch, chip, staircase, frame
    x, y, w, h = frame(prs)
    root = dbox(slide, x + w * .35, y, w * .30, .42, fill=NAVY, rounded=True)
    box_text(root, [{"runs": [("Portal 集中分配，按版本发布", 12, WHITE, True)]}])
    branch(slide, x + w * .50, y + .42, [x + w * .18, x + w * .82], y + .95, color=NAVY)
    ...

The demo builds three slides and saves them:

    python3 diagram_kit.py --demo work/diagram-kit-demo.pptx

It intentionally does not style a whole deck. The point is to remove the geometry
work that usually turns a diagram into a row of cards.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
from lxml import etree

EMU_IN = 914400


def _rgb(c):
    if isinstance(c, RGBColor):
        return c
    if isinstance(c, str):
        c = c.lstrip("#")
        return RGBColor(int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))
    return RGBColor(*c)


def _strip(shape):
    """Remove the theme style (it brings a shadow) and pin a flat effect list."""
    el = shape._element
    style = el.find(qn("p:style"))
    if style is not None:
        el.remove(style)
    spPr = el.spPr
    if spPr.find(qn("a:effectLst")) is None:
        etree.SubElement(spPr, qn("a:effectLst"))


def dbox(slide, x, y, w, h, fill=None, line=None, line_w=1.0,
         rounded=False, radius=0.08):
    """A rectangle or a slightly rounded box; flat by default."""
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    s = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = _rgb(fill)
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = _rgb(line)
        s.line.width = Pt(line_w)
    s.shadow.inherit = False
    _strip(s)
    tf = s.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if rounded:
        try:
            s.adjustments[0] = radius
        except Exception:
            pass
    return s


def box_text(shape, paras, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
             margins=(0.08, 0.08, 0.03, 0.03), latin="Arial", ea="Noto Sans SC"):
    """Fill a shape with paragraphs of runs: (text, size, color, bold)."""
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = (
        Inches(margins[0]), Inches(margins[1]), Inches(margins[2]), Inches(margins[3]))
    tf.vertical_anchor = anchor
    for i, spec in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spec.get("line", 1.2)
        p.space_before = Pt(spec.get("before", 0))
        p.space_after = Pt(spec.get("after", 0))
        for txt, size, color, bold in spec["runs"]:
            r = p.add_run()
            r.text = txt
            r.font.size = Pt(size)
            r.font.bold = bold
            r.font.name = latin
            r.font.color.rgb = _rgb(color)
            rPr = r._r.get_or_add_rPr()
            for tag in ("a:ea", "a:cs"):
                el = rPr.find(qn(tag))
                if el is None:
                    el = etree.SubElement(rPr, qn(tag))
                el.set("typeface", ea)
    return shape


def label(slide, x, y, w, h, text, size=12, color="#000050", bold=False,
          align=PP_ALIGN.LEFT, line=1.2, latin="Arial", ea="Noto Sans SC",
          anchor=MSO_ANCHOR.TOP):
    """A text box outside the shapes: titles, captions, statements."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    p.line_spacing = line
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.name = latin
    r.font.color.rgb = _rgb(color)
    rPr = r._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", ea)
    return tb


def seg(slide, x1, y1, x2, y2, color="#000050", weight=1.0, dash=None, arrow=False):
    """A straight line or connector between two points."""
    s = slide.shapes.add_connector(1, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    s.line.color.rgb = _rgb(color)
    s.line.width = Pt(weight)
    if dash is not None:
        s.line.dash_style = dash
    _strip(s)
    if arrow:
        ln = s.line._get_or_add_ln()
        tail = etree.SubElement(ln, qn("a:tailEnd"))
        tail.set("type", "triangle")
        tail.set("w", "med")
        tail.set("len", "med")
    return s


def dot(slide, cx, cy, d=0.18, fill="#B4DCFA", line=None, line_w=0.75):
    s = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(cx - d / 2), Inches(cy - d / 2),
                               Inches(d), Inches(d))
    s.fill.solid()
    s.fill.fore_color.rgb = _rgb(fill)
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = _rgb(line)
        s.line.width = Pt(line_w)
    s.shadow.inherit = False
    _strip(s)
    return s


def branch(slide, parent_x, parent_bottom, child_xs, child_top,
           color="#000050", weight=1.0, rail_y=None):
    """An org-chart elbow: stem, rail, and one drop per child centre."""
    rail_y = rail_y if rail_y is not None else parent_bottom + (child_top - parent_bottom) / 2
    span = [parent_x] + list(child_xs)
    seg(slide, parent_x, parent_bottom, parent_x, rail_y, color, weight)
    seg(slide, min(span), rail_y, max(span), rail_y, color, weight)
    for cx in child_xs:
        seg(slide, cx, rail_y, cx, child_top, color, weight)


def chip(slide, x, y, w, h, runs, fill="#F4F4F8", color="#000050",
         size=10, align=PP_ALIGN.LEFT, latin="Arial", ea="Noto Sans SC"):
    """A label chip; runs is a string or a list of (text, color, bold)."""
    s = dbox(slide, x, y, w, h, fill=fill)
    if isinstance(runs, str):
        runs = [(runs, color, False)]
    box_text(s, [{"runs": [(t, size, c, b) for t, c, b in runs]}],
             align=align, margins=(0.12, 0.06, 0.02, 0.02), latin=latin, ea=ea)
    return s


def staircase(slide, steps, baseline_y, dot_color="#B4DCFA", dot_line="#000050",
              riser_color="#C9C9D6", riser_weight=0.75):
    """Dots on a rising diagonal, dotted risers to the baseline.

    steps: [{"x": 1.0, "y": 4.2, "color": optional, "d": optional}]
    Put the headings and captions yourself: x + 0.22, y - 0.2 and y + 0.12.
    """
    for step in steps:
        seg(slide, step["x"], step["y"], step["x"], baseline_y,
            color=riser_color, weight=riser_weight,
            dash=MSO_LINE_DASH_STYLE.ROUND_DOT)
        dot(slide, step["x"], step["y"], step.get("d", 0.18),
            step.get("color", dot_color), dot_line, 0.5)


def frame(prs, margins=None, title_band=None, footer_band=None):
    """(x, y, w, h) of the body frame, below the title and above the footer.

    Defaults scale from a 13.333 x 7.5 reference, so a 10 x 5.625 brand
    template gets proportional margins and title band. Pass inches to override.
    footer_band is the distance from the frame bottom to the canvas bottom,
    so it includes the bottom margin.
    """
    w = prs.slide_width / EMU_IN
    h = prs.slide_height / EMU_IN
    scale = w / 13.333
    left, top, right, bottom = margins or (0.65 * scale, 0.6 * scale,
                                           0.65 * scale, 0.6 * scale)
    tb = 1.15 * scale if title_band is None else title_band
    fb = 1.10 * scale if footer_band is None else footer_band
    return (left, top + tb, w - left - right, h - fb - (top + tb))


def _demo(out: Path):
    NAVY, CORAL, MUTED, HAIR = "#000050", "#FA5A50", "#5D5D78", "#D2D2DC"
    WHITE, LIGHT, BLUE = "#FFFFFF", "#F6F6FA", "#B4DCFA"

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    def new(bg=WHITE):
        s = prs.slides.add_slide(blank)
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = _rgb(bg)
        return s

    def heading(s, text):
        tb = s.shapes.add_textbox(Inches(0.65), Inches(0.55), Inches(12.0), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = text
        r.font.size = Pt(28)
        r.font.bold = True
        r.font.name = "DM Sans"
        r.font.color.rgb = _rgb(NAVY)
        rPr = r._r.get_or_add_rPr()
        for tag in ("a:ea", "a:cs"):
            el = etree.SubElement(rPr, qn(tag))
            el.set("typeface", "Noto Sans SC")

    # 1. Boundary
    s = new()
    heading(s, "分工按「谁理解数据模型」来切")
    x, y, w, h = frame(prs)
    left, right = x, x + w * 0.58
    bw, gap = w * 0.42, w * 0.16
    for bx, title in ((left, "AI Foundation 负责"), (right, "业务系统负责")):
        t = s.shapes.add_textbox(Inches(bx), Inches(y), Inches(bw), Inches(0.35))
        p = t.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = title
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.name = "DM Sans"
        r.font.color.rgb = _rgb(NAVY)
        for i in range(4):
            seg(s, bx, y + 0.5 + i * 0.62, bx + bw, y + 0.5 + i * 0.62,
                color=HAIR, weight=0.75)
    seg(s, x + bw + gap / 2, y + 0.2, x + bw + gap / 2, y + h * 0.72,
        color=HAIR, dash=MSO_LINE_DASH_STYLE.DASH)
    token = dbox(s, x + bw + gap / 2 - 0.5, y + h * 0.28, 1.0, 0.55,
                 fill=WHITE, line=CORAL, rounded=True, radius=0.12)
    box_text(token, [{"runs": [("JWT", 11, CORAL, True)]}])

    # 2. Tree
    s = new()
    heading(s, "角色回答能做什么，属性回答能看哪一块")
    x, y, w, h = frame(prs)
    root = dbox(s, x + w * 0.35, y, w * 0.30, 0.42, fill=NAVY, rounded=True)
    box_text(root, [{"runs": [("Portal 集中分配，按版本发布", 12, WHITE, True)]}])
    side_w = w * 0.17
    left_c, right_c = x + w * 0.18, x + w * 0.82
    for cx, label in ((left_c, "AI Foundation 执行"), (right_c, "业务系统执行")):
        b = dbox(s, cx - side_w / 2, y + 0.75, side_w, 0.38, fill=WHITE,
                 line=NAVY, rounded=True)
        box_text(b, [{"runs": [(label, 10, NAVY, True)]}])
    branch(s, x + w * 0.5, y + 0.42, [left_c, right_c], y + 0.75, color=NAVY)
    for i, cx in enumerate((x + w * 0.02, x + w * 0.34, x + w * 0.58, x + w * 0.80)):
        c = dbox(s, cx, y + 1.35, w * 0.18, h * 0.40, fill=LIGHT, rounded=True)
        box_text(c, [
            {"runs": [(("Portal 角色", "AI Gateway 访问角色", "业务系统角色", "属性")[i], 11, NAVY, True)], "after": 4},
            {"runs": [("定义  平台团队", 9, MUTED, False)], "line": 1.3},
            {"runs": [("分配  Portal", 9, MUTED, False)], "line": 1.3},
            {"runs": [("执行  Portal", 9, MUTED, False)], "line": 1.3},
        ], align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, margins=(0.14, 0.06, 0.12, 0.03))
    branch(s, left_c, y + 1.13, [x + w * 0.11, x + w * 0.43], y + 1.35, color=NAVY)
    branch(s, right_c, y + 1.13, [x + w * 0.67, x + w * 0.89], y + 1.35, color=NAVY)

    # 3. Staircase
    s = new()
    heading(s, "改一次角色走四步，不停机、可回退")
    x, y, w, h = frame(prs)
    baseline = y + h * 0.88
    steps = [{"x": x + w * 0.04, "y": y + h * 0.72},
             {"x": x + w * 0.32, "y": y + h * 0.52},
             {"x": x + w * 0.58, "y": y + h * 0.32},
             {"x": x + w * 0.82, "y": y + h * 0.12, "color": CORAL}]
    staircase(s, steps, baseline)
    heads = ["起草", "预览变化", "审批", "发布 / 回退"]
    caps = ["建草稿：手工改、导入 Excel，或从 HR 拉差异。",
            "按人列出加减，标出高风险项。",
            "审批人不能是起草人；高风险会签。",
            "生成版本号；回退同样走审批。"]
    for i, step in enumerate(steps):
        for dy, txt, size, bold in ((-0.28, heads[i], 16, True), (0.04, caps[i], 9.5, False)):
            t = s.shapes.add_textbox(Inches(step["x"] + 0.22), Inches(step["y"] + dy),
                                     Inches(w * 0.15), Inches(0.55))
            tf = t.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            r = p.add_run()
            r.text = txt
            r.font.size = Pt(size)
            r.font.bold = bold
            r.font.name = "DM Sans"
            r.font.color.rgb = _rgb(NAVY if bold else MUTED)
    seg(s, x, baseline + 0.12, x + w, baseline + 0.12, color=CORAL, weight=1.5)
    for i, lab in enumerate(["01 起草", "02 预览变化", "03 审批", "04 发布 / 回退"]):
        t = s.shapes.add_textbox(Inches(x + i * w * 0.255), Inches(baseline - 0.16),
                                 Inches(w * 0.22), Inches(0.24))
        p = t.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = lab
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.name = "DM Sans"
        r.font.color.rgb = _rgb(CORAL if i == 3 else NAVY)

    out.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(out))
    print(f"wrote {out} ({len(prs.slides)} slides)")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--demo", type=Path, help="write a three-pattern demo deck")
    args = ap.parse_args()
    if args.demo:
        _demo(args.demo)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
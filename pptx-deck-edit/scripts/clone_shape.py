#!/usr/bin/env python3
"""Clone a shape on a slide XML, give it a fresh unique id (and name), optionally replace its text and move it.
Text replacement keeps the first run's formatting of each paragraph; pass --text multiple times for multiple paragraphs."""
import argparse, sys, copy
from lxml import etree
def first(el, leaf):
    # note: lxml elements without children are falsy, so never chain find() with `or`
    for path in ("./p:spPr/a:xfrm/", "./p:xfrm/", "./p:grpSpPr/a:xfrm/"):
        r = el.find(path + "a:" + leaf, NS)
        if r is not None: return r
NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
A = "{%s}" % NS["a"]
def set_text(sp, paras):
    body = sp.find(".//p:txBody", NS)
    if body is None: raise SystemExit("shape has no text body")
    ps = body.findall("a:p", NS)
    tmpl = ps[0] if ps else etree.SubElement(body, A + "p")
    for p in ps: body.remove(p)
    for line in paras:
        np = copy.deepcopy(tmpl); runs = np.findall("a:r", NS)
        for ch in list(np):
            if etree.QName(ch).localname in ("r", "br", "fld"): np.remove(ch)
        r = copy.deepcopy(runs[0]) if runs else etree.Element(A + "r")
        t = r.find("a:t", NS)
        if t is None: t = etree.SubElement(r, A + "t")
        t.text = line
        end = np.find("a:endParaRPr", NS)
        (end.addprevious(r) if end is not None else np.append(r))
        body.append(np)
def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("slide_xml"); p.add_argument("--id", type=int, required=True, help="source shape id")
    p.add_argument("--text", action="append", help="new paragraph text (repeatable)")
    p.add_argument("--dx", type=int, default=0, help="x offset EMU"); p.add_argument("--dy", type=int, default=0)
    p.add_argument("--x", type=int); p.add_argument("--y", type=int)
    p.add_argument("--name"); p.add_argument("--out", help="write here instead of in place")
    a = p.parse_args()
    tree = etree.parse(a.slide_xml); root = tree.getroot()
    ids = [int(e.get("id")) for e in root.iter("{%s}cNvPr" % NS["p"]) if e.get("id", "").isdigit()]
    src = [e for e in root.iter("{%s}cNvPr" % NS["p"]) if e.get("id") == str(a.id)]
    if not src: print(f"no shape id {a.id}", file=sys.stderr); return 1
    shape = src[0].getparent().getparent()
    new = copy.deepcopy(shape); nid = max(ids) + 1
    for i, c in enumerate(new.iter("{%s}cNvPr" % NS["p"])):  # groups: renumber all
        c.set("id", str(nid + i))
        if i == 0: c.set("name", a.name or f"{c.get('name')} copy")
    for c in new.iter():  # drop connection refs / creation ids that must be unique
        if isinstance(c.tag, str) and etree.QName(c).localname == "creationId": c.getparent().remove(c)
    off = first(new, "off")
    if off is not None:
        off.set("x", str(a.x if a.x is not None else int(off.get("x")) + a.dx))
        off.set("y", str(a.y if a.y is not None else int(off.get("y")) + a.dy))
    elif a.dx or a.dy or a.x is not None or a.y is not None:
        print("warning: shape inherits position from layout; add <a:xfrm> manually to move it", file=sys.stderr)
    if a.text: set_text(new, a.text)
    shape.addnext(new)
    tree.write(a.out or a.slide_xml, xml_declaration=True, encoding="UTF-8", standalone=True)
    print(nid); return 0
if __name__ == "__main__": sys.exit(main())

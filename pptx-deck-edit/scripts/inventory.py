#!/usr/bin/env python3
"""Dump per-slide shapes (id, name, kind, position/size in EMU+inches, text) from an unpacked pptx dir or a .pptx.
--check reports duplicate shape ids per slide (exit 1 if any)."""
import argparse, sys, os, re, json, zipfile
from lxml import etree
def first(el, leaf):
    # note: lxml elements without children are falsy, so never chain find() with `or`
    for path in ("./p:spPr/a:xfrm/", "./p:xfrm/", "./p:grpSpPr/a:xfrm/"):
        r = el.find(path + "a:" + leaf, NS)
        if r is not None: return r
NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
RELNS = "http://schemas.openxmlformats.org/package/2006/relationships"
def slide_order(read):
    pres = etree.fromstring(read("ppt/presentation.xml"))
    rels = etree.fromstring(read("ppt/_rels/presentation.xml.rels"))
    m = {r.get("Id"): r.get("Target") for r in rels.findall(f"{{{RELNS}}}Relationship")}
    return ["ppt/" + m[s.get(f"{{{NS['r']}}}id")].lstrip("/").replace("ppt/", "", 1)
            for s in pres.findall(".//p:sldIdLst/p:sldId", NS)]
def notes_for(read, names, slide):
    rp = slide.replace("slides/", "slides/_rels/") + ".rels"
    if rp not in names: return None
    for r in etree.fromstring(read(rp)).findall(f"{{{RELNS}}}Relationship"):
        if r.get("Type", "").endswith("/notesSlide"):
            t = "ppt/notesSlides/" + os.path.basename(r.get("Target"))
            x = etree.fromstring(read(t))
            body = [sp for sp in x.findall(".//p:sp", NS) if sp.find(".//p:ph[@type='body']", NS) is not None]
            return {"part": t, "text": "\n".join(para_text(sp) for sp in body)}
def para_text(el):
    return "\n".join("".join(t.text or "" for t in p.findall(".//a:t", NS)) for p in el.findall(".//a:p", NS)).strip()
def shapes(x):
    out = []
    for el in x.iter():
        if not isinstance(el.tag, str): continue
        tag = etree.QName(el).localname
        if tag not in ("sp", "pic", "graphicFrame", "grpSp", "cxnSp"): continue
        cnv = el.find("./*/p:cNvPr", NS)
        if cnv is None: continue
        off = first(el, "off")
        ext = first(el, "ext")
        ph = el.find(".//p:nvPr/p:ph", NS)
        d = {"id": int(cnv.get("id")), "name": cnv.get("name"), "kind": tag,
             "placeholder": ph.get("type", "body") if ph is not None else None}
        if off is not None and ext is not None:
            v = [int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy"))]
            d["emu"] = v; d["in"] = [round(n / 914400, 2) for n in v]
        if tag in ("sp", "graphicFrame"): d["text"] = para_text(el)
        out.append(d)
    return out
def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("src", help="unpacked dir or .pptx")
    p.add_argument("--format", choices=["json", "md"], default="json")
    p.add_argument("--slides", help="comma list of 1-based slide numbers (presentation order)")
    p.add_argument("--check", action="store_true")
    a = p.parse_args()
    if os.path.isdir(a.src):
        read = lambda n: open(os.path.join(a.src, n), "rb").read()
        names = set(os.path.relpath(os.path.join(r, f), a.src).replace(os.sep, "/") for r, _, fs in os.walk(a.src) for f in fs)
    elif zipfile.is_zipfile(a.src):
        z = zipfile.ZipFile(a.src); read = z.read; names = set(z.namelist())
    else: print("src must be dir or pptx", file=sys.stderr); return 2
    want = set(int(s) for s in a.slides.split(",")) if a.slides else None
    res, dup = [], False
    for i, part in enumerate(slide_order(read), 1):
        if want and i not in want: continue
        x = etree.fromstring(read(part)); sh = shapes(x)
        ids = [s["id"] for s in sh]; d = sorted({n for n in ids if ids.count(n) > 1})
        if d: dup = True
        lay = None
        rp = part.replace("slides/", "slides/_rels/") + ".rels"
        if rp in names:
            for r in etree.fromstring(read(rp)).findall(f"{{{RELNS}}}Relationship"):
                if r.get("Type", "").endswith("/slideLayout"): lay = os.path.basename(r.get("Target"))
        res.append({"slide": i, "part": part, "layout": lay, "duplicate_ids": d, "shapes": sh, "notes": notes_for(read, names, part)})
    if a.check:
        for s in res:
            if s["duplicate_ids"]: print(f"slide {s['slide']} ({s['part']}): duplicate ids {s['duplicate_ids']}")
        print("ok" if not dup else "duplicate ids found"); return 1 if dup else 0
    if a.format == "json": print(json.dumps(res, ensure_ascii=False, indent=1))
    else:
        for s in res:
            print(f"## Slide {s['slide']} — {s['part']} (layout {s['layout']})")
            for h in s["shapes"]:
                t = (h.get("text") or "").replace("\n", " ⏎ ")
                print(f"- id={h['id']} `{h['name']}` {h['kind']}{' ph='+h['placeholder'] if h['placeholder'] else ''} in={h.get('in')} : {t[:200]}")
            if s["notes"] and s["notes"]["text"]: print(f"- notes ({s['notes']['part']}): {s['notes']['text'][:300]}")
            print()
    return 0
if __name__ == "__main__": sys.exit(main())

#!/usr/bin/env python3
"""Pack an unpacked pptx dir into a .pptx: validates every XML/rels part parses, writes [Content_Types].xml first."""
import argparse, sys, os, zipfile
from lxml import etree
def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("srcdir"); p.add_argument("out")
    a = p.parse_args()
    ct = os.path.join(a.srcdir, "[Content_Types].xml")
    if not os.path.isfile(ct): print("missing [Content_Types].xml", file=sys.stderr); return 1
    files, bad = [], []
    for root, _, fs in os.walk(a.srcdir):
        for f in fs:
            full = os.path.join(root, f); rel = os.path.relpath(full, a.srcdir).replace(os.sep, "/")
            if rel.endswith((".xml", ".rels")):
                try: etree.parse(full)
                except etree.XMLSyntaxError as e: bad.append(f"{rel}: {e}")
            files.append(rel)
    if bad: print("XML errors:\n" + "\n".join(bad), file=sys.stderr); return 1
    order = lambda r: (r != "[Content_Types].xml", not r.startswith("_rels/"), r)
    with zipfile.ZipFile(a.out, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in sorted(files, key=order): z.write(os.path.join(a.srcdir, rel), rel)
    print(f"packed {len(files)} parts -> {a.out}"); return 0
if __name__ == "__main__": sys.exit(main())

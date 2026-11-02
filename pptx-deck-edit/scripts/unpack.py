#!/usr/bin/env python3
"""Unpack a .pptx into a directory (pretty-printing XML optional). Never modifies the input."""
import argparse, sys, zipfile, os
def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("pptx"); p.add_argument("outdir")
    p.add_argument("--force", action="store_true", help="allow non-empty outdir")
    a = p.parse_args()
    if not zipfile.is_zipfile(a.pptx): print(f"not a zip/pptx: {a.pptx}", file=sys.stderr); return 1
    if os.path.isdir(a.outdir) and os.listdir(a.outdir) and not a.force:
        print(f"{a.outdir} not empty (use --force)", file=sys.stderr); return 1
    with zipfile.ZipFile(a.pptx) as z:
        for n in z.namelist():
            if n.startswith("/") or ".." in n.split("/"): print(f"unsafe path {n}", file=sys.stderr); return 1
        z.extractall(a.outdir)
    slides = sorted(f for f in os.listdir(os.path.join(a.outdir, "ppt", "slides")) if f.endswith(".xml"))
    print(f"unpacked {len(slides)} slides to {a.outdir}"); return 0
if __name__ == "__main__": sys.exit(main())

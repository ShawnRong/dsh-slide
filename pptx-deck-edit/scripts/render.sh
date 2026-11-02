#!/usr/bin/env bash
# render.sh <deck.pptx|deck.pdf> <outdir> [dpi]
# pptx -> PDF (LibreOffice headless, temp profile) -> slide-N.png (pdftoppm) -> grid.png (Pillow)
# exit: 0 ok, 1 usage, 2 missing dependency / conversion failure
set -euo pipefail
if [[ $# -lt 2 || "$1" == "-h" || "$1" == "--help" ]]; then sed -n '2,4p' "$0" | sed 's/^# //'; [[ $# -ge 1 ]] && exit 0 || exit 1; fi
IN=$1; OUT=$2; DPI=${3:-80}
[[ -f "$IN" ]] || { echo "no such file $IN" >&2; exit 1; }
for b in pdftoppm python3; do command -v $b >/dev/null || { echo "missing $b" >&2; exit 2; }; done
mkdir -p "$OUT"; rm -f "$OUT"/slide-*.png
if [[ "$IN" == *.pdf ]]; then PDF=$IN; else
  SO=$(command -v soffice || command -v libreoffice) || { echo "missing soffice" >&2; exit 2; }
  PROF=$(mktemp -d)
  timeout 180 "$SO" -env:UserInstallation=file://$PROF --headless --convert-to pdf --outdir "$OUT" "$IN" >/dev/null 2>&1 || { rm -rf "$PROF"; echo "soffice failed" >&2; exit 2; }
  rm -rf "$PROF"; PDF="$OUT/$(basename "${IN%.*}").pdf"
  [[ -f "$PDF" ]] || { echo "no PDF produced" >&2; exit 2; }
fi
pdftoppm -r "$DPI" -png "$PDF" "$OUT/slide"
python3 - "$OUT" <<'PY'
import sys, glob, math, re
from PIL import Image, ImageDraw
d = sys.argv[1]
fs = sorted(glob.glob(f"{d}/slide-*.png"), key=lambda f: int(re.findall(r"(\d+)\.png$", f)[0]))
ims = [Image.open(f) for f in fs]; w = 400; h = int(ims[0].height * w / ims[0].width)
cols = min(4, len(ims)); rows = math.ceil(len(ims) / cols)
g = Image.new("RGB", (cols * (w + 10) + 10, rows * (h + 30) + 10), "white"); dr = ImageDraw.Draw(g)
for i, im in enumerate(ims):
    x, y = 10 + (i % cols) * (w + 10), 10 + (i // cols) * (h + 30)
    g.paste(im.convert("RGB").resize((w, h)), (x, y + 20)); dr.text((x, y + 4), str(i + 1), fill="black")
g.save(f"{d}/grid.png"); print(f"{len(ims)} slides -> {d}/grid.png")
PY

#!/usr/bin/env python3
"""Compose a progress grid from rendered slide images.

Usage:
    python3 checkpoint.py --out work/deck/checkpoints/b1/sheet.png \
        --title "第 1–3 页" --start 1 \
        work/deck/checkpoints/b1/slide-01.png \
        work/deck/checkpoints/b1/slide-02.png \
        work/deck/checkpoints/b1/slide-03.png

The grid is meant to be posted inline in the conversation. It is wide enough
to judge layout and hierarchy; for body-text review, post the individual PNGs
as well or open the .pptx.

Requires Pillow.
"""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("checkpoint.py needs Pillow: pip install Pillow", file=sys.stderr)
    sys.exit(2)

INK = (17, 24, 39)
MUTED = (107, 114, 128)
PAPER = (255, 255, 255)
CANVAS = (244, 245, 247)
BORDER = (226, 228, 232)

FONT_CANDIDATES = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "C:/Windows/Fonts/msyh.ttc",
]


def font(size: int, bold: bool = False):
    candidates = FONT_CANDIDATES if not bold else [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "C:/Windows/Fonts/msyhbd.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def fit(image: Image.Image, width: int, height: int) -> Image.Image:
    image = image.convert("RGB")
    ratio = min(width / image.width, height / image.height)
    resized = image.resize((max(1, int(image.width * ratio)), max(1, int(image.height * ratio))),
                           Image.LANCZOS)
    canvas = Image.new("RGB", (width, height), PAPER)
    canvas.paste(resized, ((width - resized.width) // 2, (height - resized.height) // 2))
    return canvas


def compose(images: list[Path], out: Path, title: str, start: int,
            columns: int, total_width: int) -> tuple[int, int]:
    count = len(images)
    columns = max(1, min(columns, count))
    rows = math.ceil(count / columns)

    pad = max(18, total_width // 100)
    header_h = 86 if title else pad
    label_h = 42
    cell_w = (total_width - pad * (columns + 1)) // columns
    cell_h = int(cell_w * 9 / 16)
    sheet_h = header_h + rows * (label_h + cell_h + pad) + pad

    sheet = Image.new("RGB", (total_width, sheet_h), CANVAS)
    draw = ImageDraw.Draw(sheet)

    if title:
        draw.text((pad, 26), title, font=font(38, bold=True), fill=INK)

    for index, path in enumerate(images):
        row, col = divmod(index, columns)
        x = pad + col * (cell_w + pad)
        y = header_h + row * (label_h + cell_h + pad)

        label = str(start + index)
        draw.text((x, y + 4), label, font=font(26, bold=True), fill=MUTED)

        image = Image.open(path)
        card = fit(image, cell_w, cell_h)
        sheet.paste(card, (x, y + label_h))
        draw.rectangle([x, y + label_h, x + cell_w - 1, y + label_h + cell_h - 1],
                       outline=BORDER, width=2)

    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, "PNG", optimize=True)
    return sheet.size


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Compose a 3-up progress grid from slide PNGs.")
    parser.add_argument("images", nargs="+", type=Path, help="rendered slide PNGs, in order")
    parser.add_argument("--out", type=Path, required=True, help="output sheet.png")
    parser.add_argument("--title", default="", help="header, e.g. '第 1–3 页'")
    parser.add_argument("--start", type=int, default=1, help="first slide number, for labels")
    parser.add_argument("--columns", type=int, default=3, help="grid columns (default 3)")
    parser.add_argument("--width", type=int, default=2400, help="output width in pixels")
    args = parser.parse_args(argv)

    missing = [str(path) for path in args.images if not path.exists()]
    if missing:
        print("checkpoint.py: missing image(s): " + ", ".join(missing), file=sys.stderr)
        return 2
    try:
        size = compose(args.images, args.out, args.title, args.start, args.columns, args.width)
    except Exception as error:
        print(f"checkpoint.py: {error}", file=sys.stderr)
        return 2

    print(f"{args.out} ({size[0]}×{size[1]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
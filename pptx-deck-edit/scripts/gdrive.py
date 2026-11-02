#!/usr/bin/env python3
"""Optional Google Drive v3 helper (stdlib only). Token from $GOOGLE_ACCESS_TOKEN or --token.
  export <file_id> <out.pptx>          Google Slides -> .pptx
  import <in.pptx> [--name N] [--parent FOLDER_ID]   upload as NEW Google Slides file, prints id + URL
  pdf    <file_id> <out.pdf>           Google's own PDF rendering
exit: 0 ok, 1 usage, 2 HTTP/auth error"""
import argparse, os, sys, json, uuid, urllib.request, urllib.parse, urllib.error
API = "https://www.googleapis.com"
PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
def req(url, tok, data=None, headers=None, method=None):
    h = {"Authorization": f"Bearer {tok}", **(headers or {})}
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h, method=method), timeout=300) as r: return r.read()
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode(errors='replace')[:500]}", file=sys.stderr); sys.exit(2)
def export(fid, mime, out, tok):
    b = req(f"{API}/drive/v3/files/{urllib.parse.quote(fid)}/export?" + urllib.parse.urlencode({"mimeType": mime}), tok)
    open(out, "wb").write(b); print(f"wrote {out} ({len(b)} bytes)")
def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--token", default=os.environ.get("GOOGLE_ACCESS_TOKEN"))
    s = p.add_subparsers(dest="cmd", required=True)
    e = s.add_parser("export"); e.add_argument("file_id"); e.add_argument("out")
    i = s.add_parser("import"); i.add_argument("pptx"); i.add_argument("--name"); i.add_argument("--parent")
    f = s.add_parser("pdf"); f.add_argument("file_id"); f.add_argument("out")
    a = p.parse_args()
    if not a.token: print("no token: set GOOGLE_ACCESS_TOKEN (see references/google-drive.md)", file=sys.stderr); return 1
    if a.cmd == "export": export(a.file_id, PPTX, a.out, a.token)
    elif a.cmd == "pdf": export(a.file_id, "application/pdf", a.out, a.token)
    else:
        if not os.path.isfile(a.pptx): print("no such file", file=sys.stderr); return 1
        meta = {"name": a.name or os.path.splitext(os.path.basename(a.pptx))[0], "mimeType": "application/vnd.google-apps.presentation"}
        if a.parent: meta["parents"] = [a.parent]
        bd = uuid.uuid4().hex
        body = (f"--{bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(meta)}\r\n--{bd}\r\nContent-Type: {PPTX}\r\n\r\n").encode() \
               + open(a.pptx, "rb").read() + f"\r\n--{bd}--\r\n".encode()
        r = json.loads(req(f"{API}/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", a.token, body,
                           {"Content-Type": f"multipart/related; boundary={bd}"}, "POST"))
        print(json.dumps(r, ensure_ascii=False))
    return 0
if __name__ == "__main__": sys.exit(main())

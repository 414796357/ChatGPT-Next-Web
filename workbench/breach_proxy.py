#!/usr/bin/env python3
"""Local snapshot proxy on 5199. Does not log into company mail or IA."""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5199
DATA = os.path.join(ROOT, "data")


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        raw = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/", "/health"):
            self._send(200, json.dumps({"ok": True, "mode": "snapshot"}, ensure_ascii=False))
            return
        name = path.lstrip("/")
        if name in ("jush_data.json", "cash_raw.json", "liquid_raw.json"):
            with open(os.path.join(DATA, name), "rb") as fh:
                self._send(200, fh.read())
            return
        self._send(404, json.dumps({"ok": False, "error": "not found"}))

    def log_message(self, fmt, *args):
        sys.stderr.write("5199 " + (fmt % args) + "\n")


def main():
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"取数代理(快照模式): http://127.0.0.1:{PORT}/health")
    httpd.serve_forever()


if __name__ == "__main__":
    main()

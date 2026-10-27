#!/usr/bin/env python3
"""Static server for the 投监工作台 prototype. Default port 5175."""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5175


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("5175 " + (fmt % args) + "\n")


def main():
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        url = f"http://127.0.0.1:{PORT}/#/home"
        print(f"投监工作台: {url}")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()


if __name__ == "__main__":
    main()

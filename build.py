#!/usr/bin/env python3
"""Builds www/index.html (Android app + web/iPhone version) from src/app.html.
src/app.html is the single source; it also runs unchanged as the claude.ai artifact."""
import hashlib, json, pathlib, re
root = pathlib.Path(__file__).parent
src = (root / "src/app.html").read_text(encoding="utf-8")
ver = hashlib.sha1(src.encode()).hexdigest()[:10]
head = f'''<!doctype html>
<html lang="hu"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Piac Büfé">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" href="icon-192.png">
<script src="firebase-app-compat.js"></script>
<script src="firebase-auth-compat.js"></script>
<script src="firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
<script>window.APP_VERSION = "{ver}";
if ("serviceWorker" in navigator && location.protocol === "https:" && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()))
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js?v={ver}").catch(() => {{}}));
</script>
</head><body>
'''
# celebration music lives in Firestore (assets/audio_*) in the app build, not in the public code
src_app = src
for f in ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"]:
    (root / "www" / f).write_bytes((root / "node_modules/firebase" / f).read_bytes())
out = head + src_app + "\n</body></html>\n"
(root / "www/index.html").write_text(out, encoding="utf-8")
sw = (root / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", ver)
(root / "www/sw.js").write_text(sw, encoding="utf-8")
print("built www/index.html", ver, len(out)//1024, "KB")

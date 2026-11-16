"""Helyi gyorsteszthez: a www/index.html-ből elkészíti a test/mockyr.html-t (álFirebase + rögzített dátum).
Használat: python3 build.py && python3 test/make-mock.py && PW=$(npm root -g)/playwright node test/tNN.js"""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
s = (root / "www/index.html").read_text(encoding="utf-8")
m = (root / "test/mockrend.html").read_text(encoding="utf-8")
date_line = [l for l in m.split("\n") if l.startswith("<script>(()=>{const T=new Date(2026")][0]
tag = '<link rel="icon" href="icon-192.png">'
j = s.index(tag) + len(tag)
(root / "test/mockyr.html").write_text(s[:j] + "\n" + date_line + '\n<script src="mockfb.js"></script>' + s[j:], encoding="utf-8")
print("test/mockyr.html kész")

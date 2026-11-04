const { chromium } = require(process.env.PW||'playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const srv = http.createServer((q,r)=>{ const u = q.url.split('?')[0]; const f = u==='/version.json' ? '/tmp/claude-0/version.json' : path.join(__dirname, u);
  fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); return r.end(); } r.writeHead(200,{'Content-Type': f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json':'application/javascript'}); r.end(d); }); }).listen(8765);
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('http://localhost:8765/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm(); document.activeElement && document.activeElement.blur(); });
await p.waitForTimeout(5500);
console.log('banner:', await p.evaluate(()=>!!document.getElementById('updbar')), 'url:', p.url());
await p.screenshot({path:'/tmp/claude-0/t64.png'});
// idle > 3 min -> auto reload
await p.evaluate(()=>{ UPD.lastTouch = Date.now() - 4*60000; return updCheck(); }); await p.waitForTimeout(800);
console.log('after idle url:', p.url());
// after reload the version still old -> must not loop
await p.waitForTimeout(500);
await p.evaluate(()=>{ UPD.lastTouch = Date.now() - 4*60000; }); await p.evaluate(()=>updCheck()); await p.waitForTimeout(800);
console.log('no loop url:', p.url(), 'banner:', await p.evaluate(()=>!!document.getElementById('updbar')));
await b.close(); srv.close(); })();

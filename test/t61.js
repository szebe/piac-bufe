const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>document.body.innerText.slice(0,200).replace(/\n/g,' | ')));
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
const txt = await p.evaluate(()=>document.body.innerText.slice(0,300).replace(/\n/g,' | ')); console.log(txt);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm(); S.tab='more'; S.sub=null; render(); });
await p.click('[data-act=goSub][data-sub=pw]'); await p.waitForTimeout(200);
await p.screenshot({path:'/tmp/claude-0/t61a.png'});
const tryIt = async (o,a,c)=>{ if(await p.$('#pwOld')) await p.fill('#pwOld',o); await p.fill('#pwNew',a); await p.fill('#pwNew2',c); await p.click('[data-act=pwChange]'); await p.waitForTimeout(400); return p.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.innerText).pop()); };
console.log('wrong old:', await tryIt('9999','2222','2222'));
console.log('mismatch:', await tryIt('1111','2222','3333'));
console.log('ok:', await tryIt('1111','2222','2222'));
const ok = await p.evaluate(async()=>{ const s=S.cfg.staff.find(x=>x.id==='b'); return s.pinHash === await pinHash('b','2222'); }); console.log('hash updated:', ok);
await b.close(); })();

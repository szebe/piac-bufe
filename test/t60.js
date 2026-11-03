const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm(); S.tab='home'; render(); });
await p.click('[data-act=homeWd]'); await p.waitForTimeout(200);
console.log('title:', await p.evaluate(()=>document.body.innerText.includes('Új pénzkivét')));
await p.fill('#cpVal','5000'); await p.fill('#cpNote','tulaj'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>[...document.querySelectorAll('section.card')].map(x=>x.innerText).find(t=>t.includes('pénzkivét'))));
await p.screenshot({path:'/tmp/claude-0/t60.png'});
await b.close(); })();

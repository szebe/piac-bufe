const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(async()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm();
  await bakeMerge(today(), {arrived:{kifli:40,zsemle:30,kenyer:5}, ordered:{kifli:50,zsemle:20,kenyer:4}, remaining:{kifli:3,zsemle:2,kenyer:0}}); S.tab='home'; render(); });
const t = await p.evaluate(()=>[...document.querySelectorAll('.bakebar')].map(x=>x.innerText.replace(/\n/g,' ')).join(' | ')); console.log(t);
await p.screenshot({path:'/tmp/claude-0/t66.png'});
await b.close(); })();

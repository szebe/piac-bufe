const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
// yesterday ordered nothing -> no arrival doc today
await p.evaluate(async()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm(); await bakeMerge(ymd(addDays(new Date(),-1)), {ordered:{kifli:0,zsemle:0,kenyer:0}}); S.tab='home'; render(); });
console.log('today doc before:', await p.evaluate(()=>JSON.stringify(bakeDoc(today())||null)));
await p.click('[data-act=bakeOrdToggle]'); await p.waitForTimeout(200);
for(const id of await p.$$eval('select[id^=bo_]', a=>a.map(x=>x.id))) { await p.selectOption('#'+id, '5'); await p.waitForTimeout(150); }
await p.waitForTimeout(500);
console.log('notice gone:', !(await p.evaluate(()=>document.body.innerText.includes('Holnapra rendelt pékáru: még nincs beírva'))));
console.log('ordered:', await p.evaluate(()=>JSON.stringify((bakeDoc(today())||{}).ordered)));
await b.close(); })();

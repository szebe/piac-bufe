const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
const ids = await p.evaluate(()=>S.cfg.staff.map(s=>s.id+':'+s.name+':'+roleOf(s))); console.log(ids.join(' '));
const own = await p.evaluate(()=>S.cfg.staff.find(s=>roleOf(s)==='owner').id);
await p.click(`[data-act=pickMe][data-id=${own}]`); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
else if(await p.$('#pinIn2')){ await p.evaluate(async(id)=>{ const h=await pinHash(id,'1111'); await saveCfg({staff:S.cfg.staff.map(x=>x.id===id?{...x,pinHash:h}:x)}); },own); await p.fill('#pinIn2','1111'); await p.click('[data-act=pinEnter]'); await p.waitForTimeout(400); }
// prev day closed 20000, today close 50000 with 1000 exp
await p.evaluate(async()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm();
  const y = ymd(addDays(new Date(),-1)); S.cashDate=y; S.cashDraft={close:"20000",card:"0",exp:[],wd:[]}; await saveCashDraft();
  S.cashDate=today(); S.cashDraft={close:"50000",card:"10000",exp:[{name:"tej",amt:1000}],wd:[]}; await saveCashDraft(); S.tab='home'; S.sub=null; render(); });
console.log('owner card visible:', !!await p.$('[data-act=homeWdAfter]'), 'exp card hidden:', !await p.$('[data-act=homeExp]'));
await p.click('[data-act=homeWdAfter]'); await p.waitForTimeout(200);
await p.fill('#cpVal','30000'); await p.fill('#cpNote','bankba'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/claude-0/t62.png'});
console.log(await p.evaluate(async()=>{ const t=S.cash.find(x=>x.date===today()); const r=cashCalc(t, prevCash(t.date));
  // next day: till counted 25000 at close (20000 left after withdrawal + 5000 cash sales)
  const n = {date: ymd(addDays(new Date(),1)), close:25000, card:0, exp:[], wd:[]}; const rn = cashCalc(n, t);
  return JSON.stringify({wdAfter:t.wdAfter, todayCashT:r.cashT, nextCashT:rn.cashT, row: driveRow(t).wdList}); }));
// staff should not see it
await p.evaluate(()=>{ A.switchMe(); });
await p.waitForTimeout(200);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(()=>{ S.alarmFor=null; renderAlarm(); S.tab='home'; S.sub=null; render(); });
console.log('staff sees card:', !!await p.$('[data-act=homeWdAfter]'));
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch();
for(const cs of ['light','dark']){ const p = await b.newPage({viewport:{width:380,height:760}, colorScheme:cs});
  p.on('pageerror', e=>console.log('PAGEERR', e.message));
  await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(100);
  await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
  await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
  if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
  await p.evaluate(()=>{ S.alarmFor=null; renderAlarm(); S.dbOk=null; render(); }); await p.waitForTimeout(700);
  console.log(cs, await p.evaluate(()=>{ const i=document.querySelector('.bootload img'); return i && i.complete && i.naturalWidth+' '+getComputedStyle(i).animationName; }));
  await p.screenshot({path:'/home/claude/load-'+cs+'.png'}); await p.close(); }
await b.close(); })();

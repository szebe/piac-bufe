const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:380,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(300);
// yesterday ordered 50/20/4
await p.evaluate(()=>{ const y=ymd(addDays(new Date(),-1)); window.__store.set("bakery/"+y,{date:y, arrived:{kifli:30,zsemle:10,kenyer:2}, ordered:{kifli:50,zsemle:20,kenyer:4}, remaining:{kifli:5,zsemle:1,kenyer:0}}); });
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
if(await p.$('#pinA')){ await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400); }
await p.evaluate(()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; renderAlarm(); S.tab='home'; render(); alarmTick(); });
await p.waitForTimeout(600);
console.log('today doc:', await p.evaluate(()=>JSON.stringify(bakeDoc(today()))));
console.log('home arrival card:', await p.evaluate(()=>document.body.innerText.includes('Ma érkezett pékáru: még nincs beírva')));
console.log('stock:', await p.evaluate(()=>JSON.stringify(bakeStock(today()))));
await p.evaluate(()=>{ S.alarmFor=null; renderAlarm(); S.tab='stock'; S.invTab='leltar'; render(); });
console.log('fix card:', await p.evaluate(()=>[...document.querySelectorAll('section.card')].map(x=>x.innerText).find(t=>t.includes('Ma érkezett'))?.replace(/\n/g,' | ')));
await p.click('[data-act=bakeEdit]'); await p.waitForTimeout(200);
await p.selectOption('#bke_kifli','45'); await p.waitForTimeout(150);
await p.screenshot({path:'shot68.png', fullPage:true});
await p.click('[data-act=bakeEditSave]'); await p.waitForTimeout(500);
console.log('after fix:', await p.evaluate(()=>JSON.stringify({a:bakeDoc(today()).arrived, e:bakeDoc(today()).edits, st:bakeStock(today())})));
console.log('card:', await p.evaluate(()=>[...document.querySelectorAll('section.card')].map(x=>x.innerText).find(t=>t.includes('Ma érkezett'))?.replace(/\n/g,' | ')));
// a second auto run must not overwrite the correction
await p.evaluate(()=>{ autoArrDay=null; autoArrive(); }); await p.waitForTimeout(400);
console.log('after re-auto:', await p.evaluate(()=>JSON.stringify(bakeDoc(today()).arrived)));
await b.close(); })();

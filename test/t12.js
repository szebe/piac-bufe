const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
// staff Böbe adds expense from home
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
await p.evaluate(()=>alarmTick()); console.log('staff gets cash offer:', await p.evaluate(()=>!!document.querySelector('#overlay').innerText.trim()));
await p.click('[data-act=homeExp]'); await p.waitForTimeout(200);
await p.fill('#cpVal','1800'); await p.fill('#cpNote','kenyér Spar'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(400);
await p.click('[data-act=homeExp]'); await p.waitForTimeout(200);
await p.fill('#cpVal','700'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(400);
console.log('home row:', await p.evaluate(()=>[...document.querySelectorAll('.card')].find(c=>/Mai kiadások/.test(c.innerText)).innerText.replace(/\s+/g,' ')));
console.log('cash doc:', JSON.stringify(await p.evaluate(()=>__store.get('cash/'+today()))));
// admin Tamás: offer at 11:05
await p.evaluate(()=>A.switchMe()); await p.click('[data-act=pickMe][data-id=tamas]'); await p.fill('#pinA','1234'); await p.fill('#pinB','1234'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400);
await p.evaluate(()=>alarmTick()); await p.waitForTimeout(200);
console.log('offer:', await p.evaluate(()=>document.querySelector('#overlay').innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'cashoffer.png'});
await p.click('[data-act=cashOfferGo]'); await p.waitForTimeout(300);
console.log('in cash view:', await p.evaluate(()=>S.sub), await p.evaluate(()=>document.querySelector('.cashtbl').innerText.replace(/\s+/g,' ')));
await p.click('[data-act=cashPop][data-k=close]'); await p.fill('#cpVal','90000'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(400);
console.log('doc after close:', JSON.stringify(await p.evaluate(()=>{const d=__store.get('cash/'+today()); return [d.close, d.exp.length];})));
await p.evaluate(()=>{ A.nav({tab:'home'}); S.snooze={}; alarmTick(); }); console.log('offer gone after close:', await p.evaluate(()=>!document.querySelector('#overlay').innerText.trim()));
await b.close(); })();

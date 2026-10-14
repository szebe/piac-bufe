const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:400,height:1600}}); const p = await ctx.newPage();
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(500);
await p.click('[data-act=pickMe][data-id=tamas]'); await p.waitForTimeout(200);
await p.fill('#pinA','1234'); await p.fill('#pinB','1234'); await p.check('#pinTrust'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(500);
console.log('unlocked:', await p.evaluate(()=>unlocked()), 'trust:', await p.evaluate(()=>Object.keys(trustMap())));
await p.evaluate(()=>A.switchMe()); await p.waitForTimeout(200);
await p.click('[data-act=pickMe][data-id=tamas]'); await p.waitForTimeout(300);
console.log('re-pick no pin:', await p.evaluate(()=>S.me==='tamas' && !S.pinFor && isAdmin()));
// simulate app restart: unlockedId lost
await p.evaluate(()=>{ S.unlockedId=''; render(); }); console.log('after restart admin:', await p.evaluate(()=>isAdmin()));
// Admin account without trust
await p.evaluate(()=>A.switchMe()); await p.waitForTimeout(200);
await p.click('[data-act=pickMe][data-id=admin]'); await p.fill('#pinA','9999'); await p.fill('#pinB','9999'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400);
await p.evaluate(()=>{ S.unlockedId=''; render(); }); console.log('admin untrusted after restart -> pin screen:', await p.evaluate(()=>!!document.querySelector('#pinIn2')));
await p.fill('#pinIn2','9999'); await p.click('[data-act=pinEnter]'); await p.waitForTimeout(300);
await p.evaluate(()=>{ S.tab='stock'; S.sub=null; render(); }); await p.waitForTimeout(300);
console.log('krém pill:', await p.evaluate(()=>document.body.innerText.includes('Melegszendvics')));
await p.evaluate(()=>document.querySelector('.newitem').scrollIntoView()); await p.screenshot({path:'newitem.png'});
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
const SP='/tmp/claude-0/-home-claude/e9bfa389-a662-5a2b-a20d-7977b9feea75/scratchpad/';
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror', e=>console.log('PAGEERR', e.message)); p.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE', m.text()); });
await p.goto('file://'+__dirname+'/mockrend.html'); await p.waitForTimeout(500);
await p.screenshot({path:SP+'r1.png', fullPage:true});
// hot dog: sauce required
await p.click('[data-act=open][data-id=hd]'); await p.waitForTimeout(100);
console.log('add disabled w/o sauce:', await p.$eval('[data-act=add]', e=>e.disabled));
await p.click('[data-act=sauce][data-k=Ketchup]'); await p.click('[data-act=sauce][data-k="Mustár"]');
await p.click('[data-act=cheese][data-k=sajt]'); await p.click('[data-act=extra][data-k=phagyma]');
await p.click('[data-act=hot]'); await p.click('[data-act=hot]'); await p.click('[data-act=hot]');
await p.screenshot({path:SP+'r2.png', fullPage:true});
console.log('line:', await p.$eval('[data-act=add]', e=>e.innerText.replace(/\s+/g,' ')));
await p.click('[data-act=add]'); await p.waitForTimeout(100);
// hamburger sajtos, without onion, note
await p.click('[data-act=open][data-id=hb]'); await p.click('[data-act=var][data-k=sajtos]'); await p.click('[data-act=without][data-k="Lila hagyma"]'); await p.fill('#note','kevés mustár'); await p.click('[data-act=add]');
// soda
await p.click('[data-act=open][data-id=ud]'); await p.click('[data-act=var][data-k=ccz]'); await p.click('[data-act=add]');
await p.click('[data-act=cart]'); await p.waitForTimeout(100);
console.log('submit disabled before eat:', await p.$eval('[data-act=submit]', e=>e.disabled));
await p.click('[data-act=eat][data-k=helyben]');
await p.fill('#name','Teszt Elek'); await p.fill('#phone','06 30 123 4567');
await p.screenshot({path:SP+'r3.png', fullPage:true});
await p.click('[data-act=submit]'); await p.waitForTimeout(400);
const docs = await p.evaluate(()=>[...window.__store.entries()].filter(([k])=>k.startsWith('weborders/')).map(([k,v])=>v));
console.log(JSON.stringify(docs, null, 1));
await p.screenshot({path:SP+'r4.png', fullPage:true});
// staff accepts → customer sees
const id = await p.evaluate(()=>[...window.__store.keys()].find(k=>k.startsWith('weborders/')).split('/')[1]);
await p.evaluate(async id=>{ await firebase.firestore().doc('weborders/'+id).update('status','accepted','mins',15,'readyAt','8:20'); }, id);
await p.waitForTimeout(200); console.log('status text:', (await p.evaluate(()=>document.body.innerText)).split('\n').slice(0,8).join(' | '));
await p.reload(); await p.waitForTimeout(500); console.log('after reload screen:', await p.evaluate(()=>S.screen));
// sold out + paused
await p.evaluate(async()=>{ await firebase.firestore().doc('public/menu').set({soldOut:{mg:true}, paused:true, closed:[]}); }); await p.waitForTimeout(200);
await p.evaluate(()=>{ A.newOrder(); });
console.log('menu note:', await p.evaluate(()=>document.querySelector('.note.w') && document.querySelector('.note.w').innerText));
console.log('gombas off:', await p.evaluate(()=>document.querySelector('[data-id=mg]').className));
await b.close(); })();

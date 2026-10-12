const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:800}});
p.on('pageerror', e=>console.log('PAGEERR', e.message)); p.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE', m.text().slice(0,200)); });
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(500);
await p.screenshot({path:'login.png'});
console.log('login visible:', await p.isVisible('#lgPw'));
await p.fill('#lgPw','rossz'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(300);
console.log('err:', await p.textContent('.note.d'));
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(600);
console.log('after login text:', (await p.innerText('body')).slice(0,120).replace(/\s+/g,' '));
await p.click('[data-act=pickMe][data-id=tamas]'); await p.waitForTimeout(600);
console.log('home:', (await p.innerText('body')).slice(0,200).replace(/\s+/g,' '));
// open messages to trigger markRead
await p.evaluate(()=>{ S.sub='msgs'; render(); markRead(); }); await p.waitForTimeout(400);
console.log('readBy:', JSON.stringify(await p.evaluate(()=>__store.get('messages/m1').readBy)));
// selejt on item
await p.evaluate(()=>{ S.sub=null; S.tab='stock'; S.openItem='i1'; render(); }); await p.waitForTimeout(300);
await p.selectOption('#ws_i1','1'); await p.waitForTimeout(600);
console.log('item:', JSON.stringify(await p.evaluate(()=>__store.get('items/i1'))));
console.log('moves:', JSON.stringify(await p.evaluate(()=>[...__store.entries()].filter(([k])=>k.startsWith('moves/')).map(x=>x[1]))));
console.log('wasteLog len:', await p.evaluate(()=>S.wasteLog.length), 'isAdmin:', await p.evaluate(()=>isAdmin()));
console.log('updates:', JSON.stringify(await p.evaluate(()=>__updates)).slice(0,500));
await p.screenshot({path:'after.png'}); await b.close(); })();

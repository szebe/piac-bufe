const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:1500}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ const fs=firebase.firestore();
 await fs.doc('items/a1').set({id:'a1',name:'Kóla',unit:'db',perCarton:24,stock:30,partial:true,monday:true});
 await fs.doc('items/a2').set({id:'a2',name:'Ásványvíz',unit:'db',perCarton:12,stock:20,partial:true,monday:true});
 await fs.doc('items/a3').set({id:'a3',name:'Margarin',unit:'karton',perCarton:0,stock:5,partial:true,monday:true});
 await fs.doc('items/a4').set({id:'a4',name:'Zsemle',unit:'db',perCarton:0,stock:7,partial:true,monday:true}); });
await p.click('[data-act=pickMe][data-id=tamas]'); await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400);
await p.evaluate(()=>{ S.alarmFor=null; S.snooze[INV_ID()]=Date.now()+1e7; S.snooze[CASH_ID()]=Date.now()+1e7; render(); A.invStart(); });
const st=()=>p.evaluate(()=>S.items.filter(i=>/^a/.test(i.id)).map(i=>i.name+':'+i.stock+(i.lastCountDate?'✓':'')).join(' '));
console.log(await p.evaluate(()=>S.inv.ids));
await p.click('[data-act=invOk]'); await p.waitForTimeout(200); // Ásványvíz ok
await p.selectOption('#invq_a1','33'); await p.waitForTimeout(300); // Kóla 33
console.log('1:', await st());
await p.click('[data-act=invClose]'); await p.waitForTimeout(200);
await p.evaluate(()=>{S.tab='stock'; S.invTab='stock'; render();});
await p.click('[data-act=niToggle]'); await p.fill('#niName','Fanta'); await p.fill('#niPc','24'); await p.check('#niPart');
await p.click('[data-act=itemAdd]'); await p.waitForTimeout(400);
console.log('2:', await st());
await p.evaluate(()=>A.invStart()); await p.waitForTimeout(200);
console.log(await p.evaluate(()=>S.inv.ids));
await p.click('[data-act=invOk]'); await p.waitForTimeout(200);
await p.click('[data-act=invOk]'); await p.waitForTimeout(200);
await p.selectOption('#invq_a4','0'); await p.waitForTimeout(200); console.log('zero note:', await p.evaluate(()=>!!document.querySelector('[data-act=invZeroOk]'))); await p.click('[data-act=invZeroNo]'); await p.click('[data-act=invOk]'); await p.waitForTimeout(400);
console.log('3:', await st(), await p.evaluate(()=>JSON.stringify(window.__updates.filter(u=>u.path.startsWith('items')))));
await b.close(); })();

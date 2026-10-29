const { chromium } = require(process.env.PW||'playwright');
const SP='/tmp/claude-0/-home-claude/e9bfa389-a662-5a2b-a20d-7977b9feea75/scratchpad/';
(async()=>{ const b = await chromium.launch();
const c = await b.newPage({viewport:{width:390,height:900}}); c.on('pageerror', e=>console.log('PAGEERR c', e.message));
await c.goto('file://'+__dirname+'/mockrend.html'); await c.waitForTimeout(500);
await c.click('[data-act=card]'); await c.fill('#lphone','30 123 4567'); await c.click('[data-act=loyJoin]'); await c.waitForTimeout(200);
console.log('need consent:', await c.evaluate(()=>!!document.querySelector('.need')));
await c.check('input[data-f=lcons]'); await c.click('[data-act=loyJoin]'); await c.waitForTimeout(400);
console.log('qr svg:', await c.evaluate(()=>!!document.querySelector('#qr svg')));
await c.screenshot({path:SP+'l1.png', fullPage:true});
// tablet
const p = await b.newPage({viewport:{width:1280,height:900}}); p.on('pageerror', e=>console.log('PAGEERR t', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=tamas]'); await p.fill('#pinA','1111'); await p.fill('#pinB','1111'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(400);
await p.evaluate(()=>{ S.snooze[INV_ID()]=Date.now()+1e7; S.snooze[CASH_ID()]=Date.now()+1e7; S.alarmFor=null; renderAlarm(); A.loyOpen(); });
await p.fill('#loyPh','06301234567'); await p.click('[data-act=loyFind]'); await p.waitForTimeout(300);
await p.click('[data-act=loyPick][data-k=hb-sajtos]'); await p.click('[data-act=loyCofPick][data-k=kv-cap]'); await p.click('[data-act=loyGive]'); await p.waitForTimeout(300);
const key = await p.evaluate(async()=>await loyKey('+36301234567'));
console.log('doc after stamp:', JSON.stringify(await p.evaluate(k=>window.__store.get('loyalty/'+k), key)));
console.log('give disabled same day:', await p.evaluate(()=>document.querySelector('[data-act=loyGive]').disabled));
// seed 10 food stamps (various days) then redeem
await p.evaluate(async k=>{ const f=[]; for(let i=0;i<10;i++) f.push({d:'2026-10-'+String(10+i).padStart(2,'0'), it:[i%2?{k:'ms',n:'Sajtos melegszendvics',p:850}:{k:'hd',n:'Hot dog',p:1200}]}); await firebase.firestore().doc('loyalty/'+k).set({f, c:[], last:Date.now()}); }, key);
await p.click('[data-act=loyReset]'); await p.fill('#loyPh','+36301234567'); await p.click('[data-act=loyFind]'); await p.waitForTimeout(300);
console.log('reward options:', await p.evaluate(()=>[...document.querySelectorAll('[data-act=loyRedeem]')].map(b=>b.innerText)));
await p.screenshot({path:SP+'l2.png', fullPage:true});
await p.click('[data-act=loyRedeem][data-k=hd]'); await p.click('[data-act=loyRedeem][data-k=hd]'); await p.waitForTimeout(300);
console.log('after redeem f:', await p.evaluate(k=>window.__store.get('loyalty/'+k).f.length, key));
// expiry
await p.evaluate(async k=>{ await firebase.firestore().doc('loyalty/'+k).set({f:[{d:'2026-01-01',it:[{k:'hd',n:'Hot dog',p:1200}]}], c:[], last:Date.parse('2026-03-01')}); }, key);
await p.click('[data-act=loyReset]'); await p.fill('#loyPh','+36301234567'); await p.click('[data-act=loyFind]'); await p.waitForTimeout(300);
console.log('expired shows:', await p.evaluate(()=>S.loy.L.f.length));
// online done with loyal
await p.evaluate(async()=>{ await firebase.firestore().doc('weborders/o1').set({no:'111',at:Date.now(),name:'Vevő',phone:'+36209998877',eat:'elvitel',when:'asap',items:[{id:'hd',name:'Hot dog',opts:['szósz: ketchup'],unit:1200,qty:1},{id:'kv',name:'Cappuccino',opts:[],unit:400,qty:1}],total:1600,qtyTotal:2,status:'ready',loyal:true}); });
await p.waitForTimeout(300); await p.evaluate(()=>{ S.sub='web'; render(); }); await p.click('[data-act=webDone][data-id=o1]'); await p.waitForTimeout(500);
const k2 = await p.evaluate(async()=>await loyKey('+36209998877'));
console.log('online stamp:', JSON.stringify(await p.evaluate(k=>window.__store.get('loyalty/'+k), k2)));
await b.close(); })();

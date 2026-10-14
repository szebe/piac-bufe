const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:400,height:900}}); const p = await ctx.newPage();
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(600);
const names = await p.evaluate(()=>[...document.querySelectorAll('[data-act=pickMe]')].map(b=>b.innerText.replace(/\s+/g,' ')));
console.log('names:', names.join(' | '));
// Böbe (staff): no cash menu
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
await p.click('[data-act=nav][data-tab=more]'); await p.waitForTimeout(200);
console.log('Böbe cash menu:', await p.evaluate(()=>!!document.querySelector('[data-sub=cash]')));
await p.evaluate(()=>A.switchMe()); await p.waitForTimeout(200);
// Admin owner: set password
await p.click('[data-act=pickMe][data-id=admin]'); await p.waitForTimeout(300);
console.log('pin screen:', await p.evaluate(()=>document.querySelector('.card').innerText.replace(/\s+/g,' ').slice(0,90)));
await p.fill('#pinA','1234'); await p.fill('#pinB','1234'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(500);
console.log('admin isOwnerish:', await p.evaluate(()=>isOwnerish()), 'hash saved:', await p.evaluate(()=>!!__store.get('config/main').staff.find(x=>x.id==='admin').pinHash));
// make Viki readonly via settings select
await p.evaluate(async()=>{ const fs=firebase.firestore(); const c=__store.get('config/main'); c.staff.push({id:'v',name:'Könyvelő',active:true}); await fs.doc('config/main').set(c); }); await p.waitForTimeout(300);
await p.evaluate(()=>{ S.tab='more'; S.sub='settings'; render(); }); await p.waitForTimeout(200);
await p.selectOption('#role_v','readonly'); await p.waitForTimeout(400);
console.log('v role:', await p.evaluate(()=>__store.get('config/main').staff.find(x=>x.id==='v').role));
// cash popup as admin
await p.evaluate(()=>{ S.sub='cash'; S.cashDraft=null; render(); }); await p.waitForTimeout(200);
await p.click('[data-act=cashPop][data-k=close]'); await p.waitForTimeout(200);
await p.fill('#cpVal','113850'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(500);
await p.click('[data-act=cashPop][data-k=exp]'); await p.waitForTimeout(200);
await p.fill('#cpVal','2500'); await p.fill('#cpNote','tej'); await p.click('[data-act=cashPopOk]'); await p.waitForTimeout(500);
await p.click('[data-act=cashPop][data-k=card]'); await p.waitForTimeout(200);
await p.fill('#cpVal','999'); await p.click('[data-act=cashPopClose]'); await p.waitForTimeout(300);
console.log('cash doc:', JSON.stringify(await p.evaluate(()=>__store.get('cash/'+today()))));
console.log('table:', await p.evaluate(()=>document.querySelector('.cashtbl').innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'cash.png'});
await p.click('[data-act=cashPop][data-k=exp]'); await p.waitForTimeout(200); await p.screenshot({path:'cashpop.png'}); await p.click('[data-act=cashPopClose]');
// readonly user
await p.evaluate(()=>A.switchMe()); await p.waitForTimeout(200);
await p.click('[data-act=pickMe][data-id=v]'); await p.waitForTimeout(200);
await p.fill('#pinA','5555'); await p.fill('#pinB','5555'); await p.click('[data-act=pinCreate]'); await p.waitForTimeout(500);
await p.click('[data-act=nav][data-tab=more]'); await p.waitForTimeout(200);
console.log('RO cash menu:', await p.evaluate(()=>!!document.querySelector('[data-sub=cash]')), 'badge:', await p.evaluate(()=>document.querySelector('.hright').innerText));
await p.click('[data-sub=cash]'); await p.waitForTimeout(200);
console.log('RO tap rows:', await p.evaluate(()=>document.querySelectorAll('[data-act=cashPop]').length));
await p.click('[data-act=nav][data-tab=stock]'); await p.waitForTimeout(200);
await p.click('.item[data-iid=i1]'); await p.waitForTimeout(200);
await p.selectOption('#qs_i1','9'); await p.waitForTimeout(400);
console.log('RO stock unchanged:', await p.evaluate(()=>__store.get('items/i1').stock), 'toast:', await p.evaluate(()=>document.querySelector('.toast')?.innerText));
// wrong password
await p.evaluate(()=>A.switchMe()); await p.waitForTimeout(200);
await p.click('[data-act=pickMe][data-id=admin]'); await p.waitForTimeout(200);
await p.fill('#pinIn2','0000'); await p.click('[data-act=pinEnter]'); await p.waitForTimeout(300);
console.log('wrong pw toast:', await p.evaluate(()=>document.querySelector('.toast')?.innerText), 'me:', await p.evaluate(()=>S.me));
await p.fill('#pinIn2','1234'); await p.click('[data-act=pinEnter]'); await p.waitForTimeout(300);
console.log('right pw me:', await p.evaluate(()=>S.me), isO = await p.evaluate(()=>isOwnerish()));
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:1000}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.click('[data-act=pickMe][data-id=tamas]'); await p.waitForTimeout(300);
await p.evaluate(async()=>{ const fs=firebase.firestore(); const n=Date.now(); for(const [id,name,t] of [['a','Ásványvíz',n-5000],['b','Bors',n-1000],['c','Cukor',n-9000],['d','Dió',n-3000]]) await fs.doc('items/'+id).set({id,name,stock:5,min:0,changedAt:t}); });
await p.evaluate(()=>{ S.tab='stock'; S.sortMode='recent'; render(); }); await p.waitForTimeout(400);
const order = ()=>p.evaluate(()=>[...document.querySelectorAll('#itemList .item')].map(e=>e.innerText.split('\n')[0]).join(' | '));
console.log('seg:', await p.evaluate(()=>document.querySelector('.sortseg').innerText.replace(/\s+/g,' ')));
console.log('recent before:', await order());
for(const id of ['c','a']){ await p.click(`.item[data-iid="${id}"]`); await p.waitForTimeout(200); await p.click(`[data-act=pinToggle][data-id="${id}"]`); await p.waitForTimeout(400); }
console.log('recent pinned c,a:', await order());
console.log('cfg.pinned:', JSON.stringify(await p.evaluate(()=>__store.get('config/main').pinned)));
await p.click('[data-act=sortMode][data-m=abc]'); await p.waitForTimeout(300); console.log('abc:', await order());
await p.click('[data-act=sortMode][data-m=recent]'); await p.waitForTimeout(300);
await p.click('.item[data-iid="b"]'); await p.waitForTimeout(200); console.log('btn:', await p.textContent('[data-act=pinToggle]'));
await p.screenshot({path:'pin.png'}); await b.close(); })();

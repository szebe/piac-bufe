const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:1400}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockrend.html'); await p.waitForTimeout(300);
console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-id=ud],[data-id=av]')].map(e=>e.innerText.replace(/\s+/g,' ')).join(' | ')));
await p.click('[data-act=open][data-id=av]'); await p.click('[data-act=var][data-k=sm]'); await p.click('[data-act=add]');
console.log('cart:', JSON.stringify(await p.evaluate(()=>S.cart)));
await b.close(); })();

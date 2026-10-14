const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:1100}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ const fs=firebase.firestore(); await fs.doc('bakery/'+today()).set({date:today(),arrived:{kenyer:4,kifli:5,zsemle:10},ordered:{kenyer:1,kifli:1,zsemle:1},remaining:{kenyer:1,kifli:0,zsemle:2},sold:{kenyer:3,kifli:5,zsemle:8}}); await fs.doc('freezer/main').set({kenyer:6,kifli:5,zsemle:4}); });
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>[...document.querySelector('.stack').children].map(e=>e.innerText.split('\n')[0].slice(0,30)).join(' | ')));
await p.screenshot({path:'home14.png'}); await b.close(); })();

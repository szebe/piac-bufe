const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://'+__dirname+'/mockrend.html'); await p.waitForTimeout(300);
console.log('14:40 not live:', JSON.stringify(await p.evaluate(()=>openState())));
await p.evaluate(async()=>{ await firebase.firestore().doc('public/menu').set({live:true}); }); await p.waitForTimeout(200);
console.log('14:40 live:', JSON.stringify(await p.evaluate(()=>openState())));
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}});
await p.goto('file://'+__dirname+'/mockrend.html'); await p.waitForTimeout(300);
console.log('10:50:', JSON.stringify(await p.evaluate(()=>openState())));
await p.evaluate(async()=>{ await firebase.firestore().doc('public/menu').set({test:true}); }); await p.waitForTimeout(200);
await p.screenshot({path:'/tmp/claude-0/-home-claude/e9bfa389-a662-5a2b-a20d-7977b9feea75/scratchpad/tb.png'});
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
for (const ord of [{kifli:0,zsemle:0,kenyer:0},{kifli:5,zsemle:0,kenyer:0},null]) {
 const ctx = await b.newContext({timezoneId:'Europe/Budapest'}); const p = await ctx.newPage({viewport:{width:400,height:1200}});
 p.on('pageerror', e=>console.log('PAGEERR', e.message));
 await p.addInitScript(()=>{ const T=new Date('2026-10-15T07:00:00+02:00').getTime(); const D=Date; class F extends D{ constructor(...a){ super(...(a.length?a:[T])); } static now(){ return T; } } window.Date=F; });
 await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
 await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
 const keys = await p.evaluate(()=>BAKERY.map(x=>x[0]));
 await p.evaluate(async([o,keys])=>{ if(o){ const od={}; keys.forEach((k,i)=>od[k]=Object.values(o)[i]); await firebase.firestore().doc('bakery/2026-10-14').set({date:'2026-10-14', ordered:od}); } },[ord,keys]);
 await p.click('[data-act=pickMe][data-id=b]').catch(()=>{}); await p.fill('#pinA','2222').catch(()=>{}); await p.fill('#pinB','2222').catch(()=>{}); await p.click('[data-act=pinCreate]').catch(()=>{}); await p.waitForTimeout(500);
 const t = await p.evaluate(()=>[...document.querySelectorAll('.bake, .bakebar')].map(e=>e.innerText.replace(/\s+/g,' ')).join(' || '));
 console.log(JSON.stringify(ord), '=>', t);
 await p.screenshot({path:'/tmp/claude-0/-home-claude/332e60b2-bafa-5de9-9e8d-7d856920e213/scratchpad/bake_'+(ord?Object.values(ord).join(''):'none')+'.png'});
 await ctx.close(); }
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
const SP='/tmp/claude-0/-home-claude/e9bfa389-a662-5a2b-a20d-7977b9feea75/scratchpad/';
(async()=>{ const b = await chromium.launch();
for(const n of [1,5,8,9,10]){
  const p = await b.newPage({viewport:{width:390,height:844}}); p.on('pageerror', e=>console.log('PAGEERR', e.message));
  await p.addInitScript(()=>{ localStorage.setItem('pb.phone','+36301234567'); localStorage.setItem('pb.loyal','1'); localStorage.setItem('pb.active','o1'); });
  await p.goto('file://'+__dirname+'/mockrend.html'); await p.waitForTimeout(200);
  await p.evaluate(async n=>{ const fs=firebase.firestore(); const k=await sha('pl:+36301234567');
    const f=[]; for(let i=0;i<n;i++) f.push({d: i===n-1 ? ymd(new Date()) : '2026-10-'+String(10+i).padStart(2,'0'), it:[{k:'hd',n:'Hot dog',p:1200}]});
    await fs.doc('loyalty/'+k).set({f, c:[], last:Date.now()});
    await fs.doc('weborders/o1').set({no:'427',at:Date.now(),name:'Kovács Anna',phone:'+36301234567',eat:'elvitel',when:'asap',items:[{id:'hd',name:'Hot dog',opts:['szósz: ketchup'],unit:1200,qty:1}],total:1200,qtyTotal:1,status:'done',loyal:true});
    S.orderId='o1'; watchOrder('o1'); await watchLoy(); S.screen='status'; render(); }, n);
  await p.waitForTimeout(1300);
  const el = await p.$('.thanks'); await el.screenshot({path:SP+`thx${n}.png`}); await p.close(); }
await b.close(); })();

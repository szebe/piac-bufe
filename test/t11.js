const { chromium } = require(process.env.PW||'playwright');
const fs = require('fs');
const src = fs.readFileSync('/home/claude/bufe-app/src/app.html','utf8');
function page(dateArgs){ const i = src.indexOf('<script>'); const fake=`<script>(()=>{const T=new Date(${dateArgs}).getTime(), D=Date, off=T-D.now(); class FD extends D{constructor(...a){ if(a.length) super(...a); else super(D.now()+off);} static now(){return D.now()+off;}} window.Date=FD;})();</script>\n`; return '<!doctype html><html><head><meta charset=utf-8></head><body>'+src.slice(0,i)+fake+'<script src="mockfb.js"></script>\n'+src.slice(i); }
(async()=>{ const b = await chromium.launch();
 async function run(dateArgs, seed, act){ fs.writeFileSync(__dirname+'/mockyr.html', page(dateArgs)); const p = await b.newPage(); p.on('pageerror', e=>console.log('PAGEERR', e.message));
  await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(300); await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
  await p.evaluate(async(seed)=>{ const fs=firebase.firestore(); const c=__store.get('config/main'); Object.assign(c, seed.cfg||{}); c.staff=[{id:'tamas',name:'Tamás',active:true}]; await fs.doc('config/main').set(c); for(const x of seed.cash||[]) await fs.doc('cash/'+x.date).set(x); window.__cel=[]; }, seed);
  await p.waitForTimeout(300); await p.click('[data-act=pickMe][data-id=tamas]'); await p.waitForTimeout(200);
  const r = await p.evaluate(async(act)=>{ celebrate = (l,t)=>window.__cel.push(l+':'+t); S.cashDate=act.date; S.cashDraft={close:String(act.close),card:"",exp:[],wd:[]}; await saveCashDraft(); return {cel:window.__cel, yt:__store.get('config/main').yearTop}; }, act);
  await p.close(); return r; }
 const prev = {date:'2026-10-13', close:0, card:0, exp:[], wd:[]};
 console.log('Oct 250k:', JSON.stringify(await run('2026,9,14,12,0', {cfg:{allTime:{amount:240000}}, cash:[prev]}, {date:'2026-10-14', close:250000})));
 console.log('Oct 235k (below 240k ATH, no yearTop):', JSON.stringify(await run('2026,9,14,12,0', {cfg:{allTime:{amount:240000}}, cash:[prev]}, {date:'2026-10-14', close:235000})));
 const jprev = {date:'2027-01-09', close:0, card:0, exp:[], wd:[]};
 console.log('Jan 2027 50k:', JSON.stringify(await run('2027,0,10,12,0', {cfg:{allTime:{amount:250000}, yearTop:{year:'2026',amount:250000}}, cash:[jprev]}, {date:'2027-01-10', close:50000})));
 const fprev = {date:'2027-02-02', close:0, card:0, exp:[], wd:[]};
 console.log('Feb 2027 60k after Jan 50k:', JSON.stringify(await run('2027,1,3,12,0', {cfg:{allTime:{amount:250000}, yearTop:{year:'2027',amount:50000,date:'2027-01-10'}}, cash:[jprev,{date:'2027-01-10',close:50000,card:0,exp:[],wd:[]},fprev]}, {date:'2027-02-03', close:60000})));
 await b.close(); })();

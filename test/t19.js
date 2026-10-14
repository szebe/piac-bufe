const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:1300}});
p.on('pageerror', e=>console.log('PAGEERR', e.message));
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ const fs=firebase.firestore(); const c=__store.get('config/main'); c.staff.push({id:'vk',name:'Viki',active:true}); await fs.doc('config/main').set(c); await fs.doc('shifts/2026-10-16').set({date:'2026-10-16',entries:[{staffId:'b',start:'06:00',end:'11:00'}]}); });
await p.waitForTimeout(300);
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(300);
await p.click('[data-act=nav][data-tab=more]'); await p.click('[data-sub=reqs]'); await p.waitForTimeout(200);
await p.click('[data-act=unToggle][data-date="2026-10-16"]'); await p.waitForTimeout(300);
console.log('toast:', await p.evaluate(()=>document.querySelector('.toast')?.innerText));
await p.click('[data-act=unToggle][data-date="2026-10-17"]'); await p.waitForTimeout(300);
console.log('store:', JSON.stringify(await p.evaluate(()=>__store.get('unavail/main'))));
await p.screenshot({path:'unav.png', fullPage:true});
// Viki marks 17 too
await p.evaluate(()=>A.switchMe()); await p.click('[data-act=pickMe][data-id=vk]'); await p.waitForTimeout(200);
await p.evaluate(()=>{ S.tab='more'; S.sub='reqs'; render(); }); await p.click('[data-act=unToggle][data-date="2026-10-17"]'); await p.waitForTimeout(300);
console.log('cal 17 chips (Viki view):', await p.evaluate(()=>document.querySelector('[data-date="2026-10-17"]').innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'unav2.png', fullPage:true});
// Shift view
await p.evaluate(()=>{ A.nav({tab:'shift'}); }); await p.waitForTimeout(200);
console.log('warn 16:', await p.evaluate(()=>[...document.querySelectorAll('.unwarn')].map(e=>e.innerText)));
await p.click('[data-act=shiftAdd][data-date="2026-10-17"]'); await p.waitForTimeout(200);
console.log('options 17:', await p.evaluate(()=>[...document.querySelectorAll('#sfStaff option')].map(o=>o.textContent).join(', ')));
await b.close(); })();

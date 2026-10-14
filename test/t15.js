const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:900}, deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/mockyr.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ await firebase.firestore().doc('freezer/main').set({kenyer:6,kifli:5,zsemle:4}); });
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(400);
await p.addStyleTag({content:`
.vB .fzhead{background:linear-gradient(#fff,var(--ice-bg));color:#2f6f9f;text-shadow:none;border-bottom:2px solid var(--ice-line);position:relative;margin-bottom:14px}
.vB .fzhead .fzflake{color:var(--ice-line)}
.vB .fzhead::after{content:"";position:absolute;left:0;right:0;bottom:-9px;height:9px;background:radial-gradient(circle at 6px 0,var(--ice-line) 4px,transparent 4.5px) 0 0/16px 9px repeat-x}
.vC.fzbox{background:transparent;border:none;padding:0;overflow:visible}
.vC .fzhead{display:inline-flex;margin:0 0 -2px 10px;border:2px solid var(--ice-line);border-bottom:none;border-radius:12px 12px 0 0;background:var(--ice-bg);color:#2f6f9f;text-shadow:none;letter-spacing:.12em;padding:5px 14px;font-size:.9rem}
.vC .fzhead .fzflake{color:var(--ice-line)}
.vC .freezer{border:2px solid var(--ice-line);border-radius:14px;background:var(--ice-bg);padding:8px}
`});
const shots=[]; for(const v of ['','vB','vC']){ await p.evaluate(v=>{ const el=document.querySelector('.fzbox'); el.classList.remove('vB','vC'); if(v) el.classList.add(v); }, v); await p.waitForTimeout(150); const el = await p.$('.fzbox'); await el.screenshot({path:`fz_${v||'vA'}.png`}); }
await b.close(); })();

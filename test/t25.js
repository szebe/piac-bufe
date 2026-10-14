const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:230}, deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ await firebase.firestore().doc('freezer/main').set({kenyer:6,kifli:5,zsemle:4}); });
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(400);
await p.addStyleTag({content:`
.i1 .big{font:800 1.5rem var(--display);line-height:1}.i1 .big span{font-size:.8rem;color:var(--muted);margin-right:4px;vertical-align:4px}.i1 .sm{font-size:.78rem;color:var(--muted);margin-top:3px;white-space:nowrap}
.i2{font:600 .78rem ui-monospace,Menlo,Consolas,monospace;color:var(--muted);letter-spacing:.06em;line-height:1.5}.i2 b{color:var(--fg);font-weight:700}
.i3 .big{font:700 1.15rem var(--display);color:var(--muted);line-height:1.1}.i3 .sm{font-size:.72rem;color:#9aa59c;white-space:nowrap}
`});
const variants = {
 i1:`<div class="i1"><div class="big"><span>S</span>168</div><div class="sm">K 143 · H 151</div></div>`,
 i2:`<div class="i2"><b>S168</b> K143<br>H151 · <span style="opacity:.6">v2.6</span></div>`,
 i3:`<div class="i3"><div class="big">168</div><div class="sm">S · K143 · H151</div></div>`};
for(const [k,html] of Object.entries(variants)){
  await p.evaluate(([html])=>{ document.querySelector('.top .brand').innerHTML = html; document.querySelector(".who").textContent="Tamás ▾"; }, [html]);
  await p.waitForTimeout(100); await p.screenshot({path:`hdr_${k}.png`, clip:{x:0,y:0,width:400,height:150}});
}
await b.close(); })();

const { chromium } = require(process.env.PW||'playwright');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:330}, deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/mock.html'); await p.waitForTimeout(400);
await p.fill('#lgPw','titok'); await p.click('[data-act=fbLogin]'); await p.waitForTimeout(400);
await p.evaluate(async()=>{ await firebase.firestore().doc('freezer/main').set({kenyer:6,kifli:5,zsemle:4}); });
await p.click('[data-act=pickMe][data-id=b]'); await p.waitForTimeout(400);
await p.addStyleTag({content:`
.v1{display:flex;flex-direction:column;gap:1px;font-variant-numeric:tabular-nums}
.v1 .r{display:flex;gap:8px;font-size:.78rem;line-height:1.25}.v1 .r span{width:30px;color:var(--muted);font-weight:700}.v1 .r b{font-size:.86rem}.v1 .r:first-child b{font-size:1rem;color:var(--accent)}
.v2{display:flex;gap:5px}.v2 .t{border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:4px 7px;text-align:center;min-width:46px}.v2 .t span{display:block;font-size:.66rem;color:var(--muted);font-weight:700}.v2 .t b{font-size:.92rem}.v2 .t:first-child{border-color:var(--accent);background:var(--accent-soft,#dcefe2)}
.v3 .big{font:800 1.25rem var(--display);line-height:1.1}.v3 .big small{display:block;font:600 .7rem system-ui;color:var(--muted);letter-spacing:.02em}.v3 .sm{white-space:nowrap;font-size:.72rem;color:var(--muted);margin-top:2px}
.fzhead.v{justify-content:space-between}.fzhead .dt{font:700 .78rem system-ui;letter-spacing:0;opacity:.95}
`});
const variants = {
 v1:`<div class="v1"><div class="r"><span>Sze</span><b>168 400 Ft</b></div><div class="r"><span>Ked</span><b>142 900 Ft</b></div><div class="r"><span>Hét</span><b>151 300 Ft</b></div></div>`,
 v2:`<div class="v2"><div class="t"><span>Sze</span><b>168e</b></div><div class="t"><span>Ked</span><b>143e</b></div><div class="t"><span>Hét</span><b>151e</b></div></div>`,
 v3:`<div class="v3"><div class="big"><small>SZERDA · OKT. 14.</small>168 400 Ft</div><div class="sm">Ked 142 900 · Hét 151 300</div></div>`};
for(const [k,html] of Object.entries(variants)){
  await p.evaluate(([html])=>{ document.querySelector('.top .brand').innerHTML = html; const fh=document.querySelector('.fzhead'); fh.classList.add('v'); document.querySelector(".who").textContent="Tamás ▾"; fh.innerHTML = '<span><span class="fzflake">'+FLAKE+'</span> FAGYASZTÓ</span><span class="dt">okt. 14., szerda</span>'; }, [html]);
  await p.waitForTimeout(100); await p.screenshot({path:`hdr_${k}.png`, clip:{x:0,y:0,width:400,height:300}});
}
await b.close(); })();

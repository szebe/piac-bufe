// End-to-end test against the real Firestore + Auth emulators (runs in GitHub Actions).
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const PROJECT = "demo-bufe", FS = "http://127.0.0.1:8080", AUTH = "http://127.0.0.1:9099";
const EMAIL = (fs.readFileSync(path.join(__dirname, "../firestore.rules"), "utf8").match(/token\.email == "([^"]+)"/) || [])[1];
const PASS = "teszt-jelszo-123";
let failed = 0; const ok = (c, m) => { console.log((c ? "✔ " : "✘ ") + m); if (!c){ failed++; if(process.env.CI) console.log("::error::" + String(m).replace(/\n/g," ").slice(0,400)); } };
const toFs = v => v === null ? {nullValue: null} : typeof v === "boolean" ? {booleanValue: v} : typeof v === "number" ? (Number.isInteger(v) ? {integerValue: String(v)} : {doubleValue: v}) : typeof v === "string" ? {stringValue: v} : Array.isArray(v) ? {arrayValue: {values: v.map(toFs)}} : {mapValue: {fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFs(x)]))}};
const fromFs = f => "nullValue" in f ? null : "booleanValue" in f ? f.booleanValue : "integerValue" in f ? +f.integerValue : "doubleValue" in f ? f.doubleValue : "stringValue" in f ? f.stringValue : "arrayValue" in f ? (f.arrayValue.values || []).map(fromFs) : Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)]));
const docUrl = p => `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${p}`;
const admin = {Authorization: "Bearer owner", "Content-Type": "application/json"};
async function put(p, obj){ const r = await fetch(docUrl(p), {method: "PATCH", headers: admin, body: JSON.stringify({fields: toFs(obj).mapValue.fields})}); if(!r.ok) throw new Error(await r.text()); }
async function get(p){ const r = await fetch(docUrl(p), {headers: admin}); if(r.status === 404) return null; const j = await r.json(); return fromFs({mapValue: {fields: j.fields || {}}}); }
async function list(c){ const r = await fetch(docUrl(c) + "?pageSize=300", {headers: admin}); const j = await r.json(); return (j.documents || []).map(d => fromFs({mapValue: {fields: d.fields || {}}})); }
async function signIn(email, password){ const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email, password, returnSecureToken: true})}); return r.json(); }
async function oob(){ const r = await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/oobCodes`); return (await r.json()).oobCodes || []; }
const usedOob = new Set();
async function verifyAll(){ for(const o of await oob()){ if(o.requestType === "VERIFY_EMAIL" && !usedOob.has(o.oobCode)){ usedOob.add(o.oobCode); await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({oobCode: o.oobCode})}); } } }
async function signUp(email, password){ const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email, password, returnSecureToken: true})}); return r.json(); }

(async () => {
  ok(!!EMAIL, "rules email: " + EMAIL);
  // static server for www/
  const www = path.join(__dirname, "../www");
  const srv = http.createServer((q, s) => { let f = path.join(www, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html"; fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, {"Content-Type": f.endsWith(".html") ? "text/html; charset=utf-8" : f.endsWith(".js") ? "text/javascript" : "application/octet-stream"}); s.end(d); }); }).listen(5173);
  await signUp(EMAIL, PASS);
  const intruder = await signUp("idegen@example.com", "idegen-123456");
  await put("config/main", {staff: [{id: "tamas", name: "Tamás", active: true, admin: true, role: "owner", email: "tamas@example.com"}, {id: "b", name: "Böbe", active: true, admin: false, email: "bobe@example.com"}, {id: "c", name: "Cili", active: true, admin: false}], emails: ["tamas@example.com", "bobe@example.com"], adminPin: "", allTime: {amount: 242500, date: null}, closedDays: [], openDays: [], fridges: [], itemOrder: []});
  await put("items/i1", {id: "i1", name: "Szalvéta", unit: "karton", stock: 4, min: 2, wasteable: true});
  await put("messages/m1", {text: "Teszt üzenet", by: "b", at: Date.now(), readBy: {b: 1}});

  // security rules
  const anon = await fetch(docUrl("config/main"));
  ok(anon.status === 403, "rules: unauthenticated read denied (" + anon.status + ")");
  const intr = await fetch(docUrl("config/main"), {headers: {Authorization: "Bearer " + intruder.idToken}});
  ok(intr.status === 403, "rules: other account denied (" + intr.status + ")");
  const unv = await signUp("tamas@example.com", "tamas-123456");
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=fake`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({requestType: "VERIFY_EMAIL", idToken: unv.idToken})});
  const unvR = await fetch(docUrl("config/main"), {headers: {Authorization: "Bearer " + unv.idToken}});
  ok(unvR.status === 403, "rules: listed but unverified email denied (" + unvR.status + ")");
  await verifyAll();
  const ver = await signIn("tamas@example.com", "tamas-123456");
  const verR = await fetch(docUrl("config/main"), {headers: {Authorization: "Bearer " + ver.idToken}});
  ok(verR.status === 200, "rules: listed + verified email allowed (" + verR.status + ")");

  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 400, height: 850}});
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  const cfgJs = `window.FB_CONFIG={apiKey:"fake",authDomain:"${PROJECT}.firebaseapp.com",projectId:"${PROJECT}"};window.FB_EMAIL=${JSON.stringify(EMAIL)};window.FB_EMULATOR=true;`;
  await p.route("**/firebase-config.js", r => r.fulfill({contentType: "text/javascript", body: cfgJs}));
  await p.goto("http://127.0.0.1:5173/"); await p.waitForSelector("#lgPw", {timeout: 15000});
  ok(true, "login screen shown");
  await p.fill("#lgEm", EMAIL); await p.fill("#lgPw", "rossz-jelszo"); await p.click("[data-act=fbLogin]"); await p.waitForSelector(".note.d", {timeout: 10000});
  ok(/Hibás/.test(await p.textContent(".note.d")), "wrong password rejected");
  await p.fill("#lgPw", PASS); await p.click("[data-act=fbLogin]");
  await p.waitForFunction(() => S.dbOk && S.me === "tamas", null, {timeout: 15000}); ok(true, "shop account maps to the owner (Tamás)");
  ok(await p.evaluate(() => isAdmin() && canCash()), "Tamás is admin");
  // owner gives Cili an email address
  await p.evaluate(() => { S.tab = "more"; S.sub = "settings"; render(); }); await p.waitForSelector("#em_c", {timeout: 5000});
  await p.fill("#em_c", "Cili@Example.com"); await p.click("[data-act=staffEmail][data-id=c]"); await p.waitForTimeout(1200);
  const cfg = await get("config/main"); ok(cfg.staff.some(x => x.id === "c" && x.email === "cili@example.com") && cfg.emails.includes("cili@example.com") && cfg.emails.length === 3, "staff email saved + emails list: " + JSON.stringify(cfg.emails));
  await p.evaluate(() => { S.sub = null; S.tab = "home"; render(); });
  // nested update merge (readBy)
  await p.evaluate(() => { S.sub = "msgs"; render(); return markRead(); }); await p.waitForTimeout(1500);
  const m1 = await get("messages/m1"); ok(m1 && m1.readBy && m1.readBy.b === 1 && m1.readBy.tamas > 0, "nested update merges readBy: " + JSON.stringify(m1 && m1.readBy));
  // waste (selejt) flow
  await p.evaluate(() => { S.sub = null; S.tab = "stock"; S.openItem = "i1"; render(); }); await p.waitForTimeout(500);
  await p.selectOption("#ws_i1", "1"); await p.waitForTimeout(2000);
  const i1 = await get("items/i1"); ok(i1 && i1.stock === 3 && i1.wasteSince === 1 && i1.unit === "karton", "selejt updated item: " + JSON.stringify(i1));
  const mv = (await list("moves")).filter(x => x.type === "selejt"); ok(mv.length === 1 && mv[0].ym && mv[0].by === "tamas", "selejt move logged with ym");
  ok(await p.evaluate(() => S.wasteLog.length === 1), "waste log listener sees it");
  // order create via app state + write()
  await p.evaluate(async () => { const id = uid(); const o = {id, date: ymd(addDays(new Date(), 1)), time: "11:30", name: "Teszt Elek", items: "5 kifli", remindMin: 30, status: "nyitott", by: S.me, at: Date.now(), extra: undefined}; S.orders = [...S.orders, o]; await write("orders/" + id, r => r.set(o)); });
  await p.waitForTimeout(1500);
  const os = await list("orders"); ok(os.length === 1 && os[0].name === "Teszt Elek" && !("extra" in os[0]), "order written (undefined fields ignored)");
  ok(await p.evaluate(() => S.orders.length === 1), "orders listener (where date>= orderBy date) works");
  // import
  const imp = {collections: {cash: {"2026-10-01": {date: "2026-10-01", total: 100000}}, assets: {audio_week: {d: "data:audio/mpeg;base64,AAAA"}}}};
  await p.evaluate(async j => { await importData(new File([JSON.stringify(j)], "x.json")); }, imp); await p.waitForTimeout(1500);
  ok((await get("cash/2026-10-01")) !== null, "import wrote cash doc");
  ok(await p.evaluate(() => CELEB_AUDIO.week === "data:audio/mpeg;base64,AAAA"), "celebration audio loaded from Firestore");
  // second device sees same data (realtime)
  const p2 = await (await b.newContext()).newPage({viewport: {width: 400, height: 850}});
  await p2.route("**/firebase-config.js", r => r.fulfill({contentType: "text/javascript", body: cfgJs}));
  await p2.goto("http://127.0.0.1:5173/"); await p2.waitForSelector("#lgPw");
  await p2.click("[data-act=lgMode][data-m=reg]"); await p2.fill("#lgEm", "bobe@example.com"); await p2.fill("#lgPw", "bobe-123456"); await p2.fill("#lgPw2", "bobe-123456"); await p2.click("[data-act=fbRegister]");
  await p2.waitForSelector("[data-act=fbVerified]", {timeout: 10000}); ok(true, "registration → verify screen");
  await p2.click("[data-act=fbVerified]"); await p2.waitForSelector(".note.d", {timeout: 5000}); ok(/Még nincs/.test(await p2.textContent(".note.d")), "unverified cannot continue");
  ok((await oob()).some(o => o.email === "bobe@example.com" && o.requestType === "VERIFY_EMAIL"), "verification email sent");
  await verifyAll(); await p2.click("[data-act=fbVerified]");
  await p2.waitForFunction(() => S.dbOk && S.me === "b", null, {timeout: 15000}); ok(true, "Böbe logged in with own account after verifying");
  // forgot password
  const p3 = await (await b.newContext()).newPage({viewport: {width: 400, height: 850}});
  await p3.route("**/firebase-config.js", r => r.fulfill({contentType: "text/javascript", body: cfgJs}));
  await p3.goto("http://127.0.0.1:5173/"); await p3.waitForSelector("#lgPw");
  await p3.click("[data-act=lgMode][data-m=forgot]"); await p3.fill("#lgEm", "bobe@example.com"); await p3.click("[data-act=fbReset]"); await p3.waitForSelector(".note.ok", {timeout: 10000});
  ok((await oob()).some(o => o.email === "bobe@example.com" && o.requestType === "PASSWORD_RESET"), "password reset email sent");
  // verified but not listed → no access
  await p3.click("[data-act=lgMode][data-m=in]"); await p3.click("[data-act=lgMode][data-m=reg]"); await p3.fill("#lgEm", "kulso@example.com"); await p3.fill("#lgPw", "kulso-123456"); await p3.fill("#lgPw2", "kulso-123456"); await p3.click("[data-act=fbRegister]");
  await p3.waitForSelector("[data-act=fbVerified]", {timeout: 10000}); await verifyAll(); await p3.click("[data-act=fbVerified]");
  await p3.waitForSelector("[data-act=fbRetry]", {timeout: 15000}); ok(true, "unlisted account sees 'no access'");
  ok(await p2.evaluate(() => !isAdmin()), "Böbe is not admin");
  await p.evaluate(async () => { const it = S.items.find(i => i.id === "i1"); await write("items/i1", r => r.update({stock: 9})); });
  await p2.waitForTimeout(1500); ok(await p2.evaluate(() => S.items.find(i => i.id === "i1").stock === 9), "realtime sync to second device");
  await p.screenshot({path: path.join(__dirname, "e2e.png")});
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close();
  console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED"); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); if(process.env.CI) console.log("::error::CRASH " + String(e && (e.stack||e.message) || e).replace(/\n/g," | ").slice(0,900)); process.exit(1); });

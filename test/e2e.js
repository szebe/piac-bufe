// End-to-end test against the real Firestore + Auth emulators (runs in GitHub Actions).
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const PROJECT = "demo-bufe", FS = "http://127.0.0.1:8080", AUTH = "http://127.0.0.1:9099";
const EMAIL = (fs.readFileSync(path.join(__dirname, "../firestore.rules"), "utf8").match(/token\.email == "([^"]+)"/) || [])[1];
const PASS = "teszt-jelszo-123";
let failed = 0; const ok = (c, m) => { console.log((c ? "✔ " : "✘ ") + m); if (!c) failed++; };
const toFs = v => v === null ? {nullValue: null} : typeof v === "boolean" ? {booleanValue: v} : typeof v === "number" ? (Number.isInteger(v) ? {integerValue: String(v)} : {doubleValue: v}) : typeof v === "string" ? {stringValue: v} : Array.isArray(v) ? {arrayValue: {values: v.map(toFs)}} : {mapValue: {fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFs(x)]))}};
const fromFs = f => "nullValue" in f ? null : "booleanValue" in f ? f.booleanValue : "integerValue" in f ? +f.integerValue : "doubleValue" in f ? f.doubleValue : "stringValue" in f ? f.stringValue : "arrayValue" in f ? (f.arrayValue.values || []).map(fromFs) : Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)]));
const docUrl = p => `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${p}`;
const admin = {Authorization: "Bearer owner", "Content-Type": "application/json"};
async function put(p, obj){ const r = await fetch(docUrl(p), {method: "PATCH", headers: admin, body: JSON.stringify({fields: toFs(obj).mapValue.fields})}); if(!r.ok) throw new Error(await r.text()); }
async function get(p){ const r = await fetch(docUrl(p), {headers: admin}); if(r.status === 404) return null; const j = await r.json(); return fromFs({mapValue: {fields: j.fields || {}}}); }
async function list(c){ const r = await fetch(docUrl(c) + "?pageSize=300", {headers: admin}); const j = await r.json(); return (j.documents || []).map(d => fromFs({mapValue: {fields: d.fields || {}}})); }
async function signUp(email, password){ const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email, password, returnSecureToken: true})}); return r.json(); }

(async () => {
  ok(!!EMAIL, "rules email: " + EMAIL);
  // static server for www/
  const www = path.join(__dirname, "../www");
  const srv = http.createServer((q, s) => { let f = path.join(www, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html"; fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, {"Content-Type": f.endsWith(".html") ? "text/html; charset=utf-8" : f.endsWith(".js") ? "text/javascript" : "application/octet-stream"}); s.end(d); }); }).listen(5173);
  await signUp(EMAIL, PASS);
  const intruder = await signUp("idegen@example.com", "idegen-123456");
  await put("config/main", {staff: [{id: "tamas", name: "Tamás", active: true, admin: true}, {id: "b", name: "Böbe", active: true, admin: false}], adminPin: "", allTime: {amount: 242500, date: null}, closedDays: [], openDays: [], fridges: [], itemOrder: []});
  await put("items/i1", {id: "i1", name: "Szalvéta", unit: "karton", stock: 4, min: 2, wasteable: true});
  await put("messages/m1", {text: "Teszt üzenet", by: "b", at: Date.now(), readBy: {b: 1}});

  // security rules
  const anon = await fetch(docUrl("config/main"));
  ok(anon.status === 403, "rules: unauthenticated read denied (" + anon.status + ")");
  const intr = await fetch(docUrl("config/main"), {headers: {Authorization: "Bearer " + intruder.idToken}});
  ok(intr.status === 403, "rules: other account denied (" + intr.status + ")");

  // public ordering page rules
  const order = {no: "123", at: Date.now(), name: "Vevő Vera", phone: "+36301234567", eat: "elvitel", when: "asap", items: [{id: "hd", name: "Hot dog", opts: ["szósz: ketchup"], unit: 1200, qty: 1}], total: 1200, qtyTotal: 1, status: "new"};
  const mkOrder = async (id, o, auth) => fetch(docUrl("weborders") + "?documentId=" + id, {method: "POST", headers: Object.assign({"Content-Type": "application/json"}, auth ? {Authorization: "Bearer " + auth} : {}), body: JSON.stringify({fields: toFs(o).mapValue.fields})});
  ok((await mkOrder("w_ok", order)).status === 200, "rules: anonymous valid web order allowed");
  ok((await fetch(docUrl("weborders/w_ok"))).status === 200, "rules: anonymous can read own order by id");
  ok((await mkOrder("w_bad1", Object.assign({}, order, {status: "accepted"}))).status === 403, "rules: web order with non-new status denied");
  ok((await mkOrder("w_bad2", Object.assign({}, order, {phone: "+3611234567"}))).status === 403, "rules: web order with landline denied");
  ok((await mkOrder("w_bad3", Object.assign({}, order, {qtyTotal: 11}))).status === 403, "rules: web order over 10 items denied");
  ok((await mkOrder("w_bad4", Object.assign({}, order, {hack: 1}))).status === 403, "rules: web order with extra field denied");
  ok((await fetch(docUrl("weborders"))).status === 403, "rules: anonymous cannot list web orders");
  const patchAnon = (id, fields, mask) => fetch(docUrl("weborders/" + id) + "?" + mask.map(m => "updateMask.fieldPaths=" + m).join("&"), {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fields: toFs(fields).mapValue.fields})});
  await mkOrder("w_c1", order); await mkOrder("w_c2", order);
  ok((await patchAnon("w_c1", {status: "cancelled", cancelledAt: Date.now()}, ["status", "cancelledAt"])).status === 200, "rules: customer can cancel a new order");
  ok((await patchAnon("w_c2", {status: "cancelled", total: 1}, ["status", "total"])).status === 403, "rules: cancel that changes other fields denied");
  await put("weborders/w_c2", Object.assign({}, order, {status: "accepted"}));
  ok((await patchAnon("w_c2", {status: "cancelled"}, ["status"])).status === 403, "rules: accepted order cannot be cancelled by customer");
  await put("weborders/w_c2", Object.assign({}, order, {status: "done"}));
  ok((await fetch(docUrl("weborders/w_ok") + "?updateMask.fieldPaths=status", {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fields: {status: {stringValue: "done"}}})})).status === 403, "rules: anonymous cannot update web order");
  ok((await mkOrder("w_add", Object.assign({}, order, {parent: "w_ok", total: 400}))).status === 200, "rules: add-on to open order allowed");
  ok((await mkOrder("w_add2", Object.assign({}, order, {parent: "w_ok", phone: "+36309999999"}))).status === 403, "rules: add-on with other phone denied");
  ok((await mkOrder("w_add3", Object.assign({}, order, {parent: "w_add"}))).status === 403, "rules: add-on to an add-on denied");
  ok((await mkOrder("w_add4", Object.assign({}, order, {parent: "nincs"}))).status === 403, "rules: add-on to missing order denied");
  await put("weborders/w_ok", Object.assign({}, order, {status: "done"}));
  await put("weborders/w_add", Object.assign({}, order, {parent: "w_ok", status: "done"}));
  ok((await mkOrder("w_add5", Object.assign({}, order, {parent: "w_ok"}))).status === 403, "rules: add-on to finished order denied"); // web order closed for UI tests (no alarm)
  ok((await mkOrder("w_loy", Object.assign({}, order, {loyal: true}))).status === 200, "rules: order with loyalty flag allowed");
  ok((await mkOrder("w_loy2", Object.assign({}, order, {loyal: "igen"}))).status === 403, "rules: non-bool loyalty flag denied");
  await put("weborders/w_loy", Object.assign({}, order, {status: "done"}));
  await put("loyalty/abc", {f: [], c: [], last: 1});
  ok((await fetch(docUrl("loyalty/abc"))).status === 200, "rules: loyalty card readable by id");
  ok((await fetch(docUrl("loyalty"))).status === 403, "rules: loyalty cards cannot be listed");
  ok((await fetch(docUrl("loyalty/abc") + "?updateMask.fieldPaths=last", {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fields: {last: {integerValue: "5"}}})})).status === 403, "rules: customer cannot change loyalty card");
  await put("public/menu", {soldOut: {mg: true}, paused: false, closed: []});
  ok((await fetch(docUrl("public/menu"))).status === 200, "rules: public menu readable");
  ok((await fetch(docUrl("public/menu") + "?updateMask.fieldPaths=paused", {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fields: {paused: {booleanValue: true}}})})).status === 403, "rules: anonymous cannot change public menu");

  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 400, height: 850}});
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  const NOALARM = pg => pg.addInitScript(() => { const iv = setInterval(() => { if(window.alarmTick && !window.__na){ window.__na = 1; window.alarmTick = () => {}; } if(window.S){ S.alarmFor = null; const o = document.getElementById("overlay"); if(o && !S.close) o.innerHTML = ""; } }, 100); });
  await NOALARM(p);
  await p.route("**/firebase-config.js", r => r.fulfill({contentType: "text/javascript", body: `window.FB_CONFIG={apiKey:"fake",authDomain:"${PROJECT}.firebaseapp.com",projectId:"${PROJECT}"};window.FB_EMAIL=${JSON.stringify(EMAIL)};window.FB_EMULATOR=true;`}));
  await p.goto("http://127.0.0.1:5173/"); await p.waitForSelector("#lgPw", {timeout: 15000});
  ok(true, "login screen shown");
  await p.fill("#lgPw", "rossz-jelszo"); await p.click("[data-act=fbLogin]"); await p.waitForSelector(".note.d", {timeout: 10000});
  ok(/Hibás/.test(await p.textContent(".note.d")), "wrong password rejected");
  await p.fill("#lgPw", PASS); await p.click("[data-act=fbLogin]");
  await p.waitForSelector("[data-act=pickMe][data-id=tamas]", {timeout: 15000}); ok(true, "logged in, staff list loaded from Firestore");
  await p.click("[data-act=pickMe][data-id=tamas]"); await p.waitForSelector("#pinA", {timeout: 5000});
  ok(true, "admin account asks for a password");
  await p.fill("#pinA", "4321"); await p.fill("#pinB", "4321"); await p.click("[data-act=pinCreate]"); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => isAdmin() && canCash()), "Tamás is admin after setting password");
  const cfg = await get("config/main"); ok(cfg.staff.some(x => x.id === "tamas" && x.pinHash && x.pinHash.length === 64), "password stored as hash");
  ok(cfg.staff.some(x => x.id === "admin" && x.role === "owner"), "Admin (owner) account auto-created");
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
  const p2 = await b.newPage({viewport: {width: 400, height: 850}}); await NOALARM(p2);
  await p2.route("**/firebase-config.js", r => r.fulfill({contentType: "text/javascript", body: `window.FB_CONFIG={apiKey:"fake",authDomain:"${PROJECT}.firebaseapp.com",projectId:"${PROJECT}"};window.FB_EMAIL=${JSON.stringify(EMAIL)};window.FB_EMULATOR=true;`}));
  await p2.goto("http://127.0.0.1:5173/"); await p2.waitForSelector("#lgPw"); await p2.fill("#lgPw", PASS); await p2.click("[data-act=fbLogin]");
  await p2.waitForSelector("[data-act=pickMe][data-id=b]", {timeout: 15000}); await p2.click("[data-act=pickMe][data-id=b]"); await p2.waitForSelector("#pinA", {timeout: 5000}); ok(true, "staff account also asks for a password"); await p2.fill("#pinA", "1111"); await p2.fill("#pinB", "1111"); await p2.click("[data-act=pinCreate]"); await p2.waitForTimeout(1200);
  ok(await p2.evaluate(() => !isAdmin()), "Böbe is not admin");
  await p.evaluate(async () => { const it = S.items.find(i => i.id === "i1"); await write("items/i1", r => r.update({stock: 9})); });
  await p2.waitForTimeout(1500); ok(await p2.evaluate(() => S.items.find(i => i.id === "i1").stock === 9), "realtime sync to second device");
  await p.screenshot({path: path.join(__dirname, "e2e.png")});
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close();
  console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED"); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

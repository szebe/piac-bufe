// Minimal in-memory mock of the Firebase compat API subset used by the app
(function(){
  const store = new Map(); const listeners = new Set(); window.__store = store; window.__updates = [];
  const clone = o => JSON.parse(JSON.stringify(o));
  class FieldPath { constructor(...s){ this.s = s; } }
  const notify = () => setTimeout(()=>listeners.forEach(l=>l()), 0);
  const snapDoc = (path) => { const d = store.get(path); return { id: path.split("/").pop(), exists: !!d, data: () => d ? clone(d) : undefined }; };
  function docRef(path){ return {
    id: path.split("/").pop(), path,
    get: async () => snapDoc(path),
    set: async d => { store.set(path, clone(JSON.parse(JSON.stringify(d)))); notify(); },
    delete: async () => { store.delete(path); notify(); },
    update: async (...a) => { if(!store.has(path)) { const e = new Error("nf"); e.code="not-found"; throw e; } window.__updates.push({path, a: a.map(x=> x instanceof FieldPath ? x.s.join("|") : x)}); const d = store.get(path);
      for(let i=0;i<a.length;i+=2){ const segs = a[i] instanceof FieldPath ? a[i].s : String(a[i]).split("."); let o = d; segs.slice(0,-1).forEach(k=>{ if(typeof o[k]!=="object"||o[k]===null) o[k]={}; o=o[k]; }); o[segs[segs.length-1]] = clone(a[i+1]===undefined?null:a[i+1]); } notify(); },
    onSnapshot: (cb) => { const l = () => cb(snapDoc(path)); listeners.add(l); l(); return () => listeners.delete(l); }
  }; }
  function query(coll, f=[], ob=null, lim=null){
    const run = () => { let docs = [...store.entries()].filter(([p]) => p.startsWith(coll+"/") && p.split("/").length === coll.split("/").length+1).map(([p,d])=>({p,d}));
      f.forEach(([k,op,v]) => docs = docs.filter(x => { const y = x.d[k]; return op==="=="?y===v: op===">="? y>=v : op==="<="? y<=v : true; }));
      if(ob) docs.sort((a,b)=> (a.d[ob[0]]<b.d[ob[0]]?-1:a.d[ob[0]]>b.d[ob[0]]?1:0) * (ob[1]==="desc"?-1:1));
      if(lim) docs = docs.slice(0, lim);
      return docs.map(x => ({ id: x.p.split("/").pop(), exists: true, data: () => clone(x.d) })); };
    return {
      where: (k,op,v) => query(coll, [...f,[k,op,v]], ob, lim), orderBy: (k,dir="asc") => query(coll, f, [k,dir], lim), limit: n => query(coll, f, ob, n),
      get: async () => ({ docs: run() }),
      add: async d => { const id = Math.random().toString(36).slice(2); store.set(coll+"/"+id, clone(d)); notify(); return docRef(coll+"/"+id); },
      onSnapshot: (cb) => { let prev = new Map(); const l = () => { const docs = run(); const ch = docs.filter(x=>JSON.stringify(x.data())!==prev.get(x.id)).map(x=>({type: prev.has(x.id)?"modified":"added", doc:x})); prev = new Map(docs.map(x=>[x.id, JSON.stringify(x.data())])); cb({ docs, docChanges: () => ch }); }; listeners.add(l); l(); return () => listeners.delete(l); }
    };
  }
  const fs = { settings(){}, enablePersistence: async()=>{}, collection: c => query(c), doc: p => docRef(p) };
  let user = null, authCb = null;
  const auth = { onAuthStateChanged(cb){ authCb = cb; setTimeout(()=>cb(user), 10); }, async signInWithEmailAndPassword(e,p){ if(p!=="titok"){ const er=new Error("x"); er.code="auth/invalid-credential"; throw er; } user={email:e}; authCb(user); } };
  const firestore = () => fs; firestore.FieldPath = FieldPath;
  window.firebase = { initializeApp(){}, firestore, auth: () => auth };
  window.FB_CONFIG = {projectId:"mock"}; window.FB_EMAIL = "piacbufe@szebe.hu";
  store.set("config/main", {staff:[{id:"tamas",name:"Tamás",active:true,admin:true},{id:"b",name:"Böbe",active:true}], adminPin:"", allTime:{amount:242500}});
  store.set("items/i1", {id:"i1", name:"Szalvéta", unit:"karton", stock:4, min:2});
  store.set("messages/m1", {text:"Teszt", by:"b", at:Date.now(), readBy:{b:1}});
})();

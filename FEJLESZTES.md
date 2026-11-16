# Piac Büfé app – fejlesztési leírás (átadás új sessionnek)

Utoljára frissítve: 2026-11-16. Ezt a fájlt **minden új fejlesztési session elején el kell olvasni.**
Megrendelő: Szebeni Tamás (Szebe Kft., Cegléd, Piac Büfé). A kommunikáció **magyarul** folyik, közérthetően (nem programozó).

---

## 1. Munkarend – KÖTELEZŐ

- **Semmit nem adunk ki (nem kerül a `main` ágra), amíg Tamás nem írja: „mehet” / „mehet a frissítés”.**
  „Még ne add ki, csak jegyezd meg” = csak feljegyezni vagy előkészíteni.
- Minden változtatás külön ágon készül (pl. `muszak-szinkron`). A teszt workflow (`.github/workflows/test.yml`) minden nem-main ágon lefut.
- A kész, de még ki nem adott változtatásokat a `kovetkezo-frissites` ágba is be kell olvasztani. Ezen az ágon van a félretett e-mailes belépés is.
- **Kiadás menete:**
  1. `git checkout -B kiadas-<dátum> origin/main`
  2. beolvasztod a kiadandó ágakat (az e-mailes belépést NEM!)
  3. push, megvárod a zöld tesztet
  4. `git checkout main && git merge --ff-only kiadas-<dátum> && git push`
  5. megvárod a build workflow-t: `gh run list -R szebe/piac-bufe -b main`
  6. utána a `main`-t beolvasztod a `kovetkezo-frissites`-be (ütközésnél mindkét oldalt meg kell tartani)
- CI-hiba részletei: check-run annotációk (`gh api repos/szebe/piac-bufe/check-runs/<job>/annotations`) vagy `gh run view <id> --log-failed`.
- Commit-üzenetek magyarul.

## 2. Felépítés

| Rész | Hol |
|---|---|
| Az app teljes forrása (egy fájl) | `src/app.html` |
| Vásárlói rendelőoldal | `src/rendeles.html` |
| Build | `python3 build.py` → `www/index.html`, `www/rendeles.html`, `www/sw.js`, `www/version.json`, `www/offline.html` |
| Adatbázis-szabályok | `firestore.rules`. Kézzel kell bemásolni a Firebase konzolba (Firestore → Rules → Publish)! |
| Google Táblázat-export (kasszazárás) | `google-tablazat.gs` (Apps Script, dátum szerint frissíti a sort) |
| Android | `android/` (Capacitor), ikonok: `resources/` + `android/app/src/main/res/mipmap-*` |
| Build és kiadás | `.github/workflows/build.yml`: teszt, APK, GitHub Pages |

- **Firebase-projekt:** `bufe001-13dbb`. A közös bolti fiók: `szebekft@gmail.com`. Volt egy véletlenül létrehozott második projekt is, azt nem használjuk.
- **Domain:** `piacbufe83.hu` (Forpsi DNS: 4 A-rekord a GitHub Pages felé, www CNAME `szebe.github.io`).
  - `/` = rendelőoldal, `/app` = személyzeti app, `/letoltes` = APK letöltése.
- **Automatikus frissítés:** az androidos app a `https://piacbufe83.hu/app/` címről töltődik be (`capacitor.config.json` → `server.url`). Internet nélkül az `offline.html` jelenik meg.
  - Az app percenként lekéri a `version.json`-t. Új verziónál újratölt, ha senki nem használja (3 perc tétlenség vagy háttér), különben a „Frissítés” sávot mutatja. Végtelen ciklus ellen verziónként egyszer próbál.
  - **Új APK csak natív változásnál kell** (ikon, engedélyek, Capacitor-beállítás). Ilyenkor szólni kell Tamásnak, hogy telepítse a telefonokra.
- Az iPhone-os kolléga a webes változatot használja (`piacbufe83.hu/app`).

## 3. Tesztelés

- **E2E (CI-ben):** `test/e2e.js`, Firestore- és Auth-emulátorral (szabálytesztek, belépés, két eszköz szinkronja, műszak-ütközés).
- **Helyi gyorsteszt álFirebase-zel:**
  ```
  npm ci
  python3 build.py && python3 test/make-mock.py
  PW=$(npm root -g)/playwright node test/t68.js
  ```
  A mock rögzített dátuma: 2026-10-30, péntek. Belépés: `#lgPw` = `titok`, majd `pickMe`.
- Szintaxis-ellenőrzés: a `www/index.html` legnagyobb `<script>` blokkja → `node --check`.
- Playwright: az `aria-disabled` gombokra `{force:true}` kell.

## 4. Jogosultságok

`ROLES`: `staff` (Dolgozó), `admin` (Adminisztrátor), `readonly` (Csak olvasás / „Olvasó”), `owner` (Admin főfiók).

- Mindenkinek saját jelszava van, a `config/main` dokumentum `staff[].pinHash` mezőjében (SHA-256). Saját jelszót mindenki módosíthat: **Több → Jelszó módosítása**.
- Más jelszavát törölni csak az **Admin (főfiók)** tudja (Beállítások → Kollégák → „Jelszó törlése”).
- Ha az Admin jelszava veszik el: Firebase konzol → Firestore → `config/main` → `staff` → az Admin elemnél a `pinHash` törlése.

## 5. Funkciók és üzleti szabályok

- **Kassza:**
  - Kasszazárás oldal, kiadás és pénzkivét (a Főoldalon egymás mellett).
  - **Zárás után** csak az Admin (főfiók) vehet ki pénzt (`wdAfter`). Ez a következő napi nyitóból vonódik le, a mai forgalmat nem módosítja.
  - **Nincs** felugró vagy telefonos kasszazárás-emlékeztető.
- **Pékáru (hot dog kifli, hambi zsemle, kenyér):**
  - Az érkezést az app **automatikusan beírja az előző (nyitvatartási) napi rendelésből** (`autoArrive`). A Főoldalon nincs érkezés-kártya.
  - **Eltérés javítása:** Készlet → Leltár fül → „Ma érkezett pékáru” → „Eltért? Javítás”. Naplózva (`edits`), az automatikus beírás nem írja felül.
  - 11 órakor pékáru-leltár, utána a Főoldalon látszik a „Holnap érkezik” sáv.
  - A holnapi rendelés akkor is mentődik, ha aznap nem jött pékáru.
- **Műszak:**
  - Napi dokumentum: `shifts/<dátum>`.
  - Mentéskor **csak a változás** kerül a szerveren lévő listára (tranzakció, `shiftDiff`/`shiftApply`), így két telefon nem törli egymás beírását.
  - A fel nem töltött napnál ⏳ jelzés látszik.
- **Olvasó nézet, Főoldal:** heti forgalom hétfőtől vasárnapig, a mai nap kiemelt. Lapozás ujjkövető animációval és nyilakkal, pöttyjelző.
- **Online rendelés (`weborders`):**
  - Nyitvatartás 6:00–11:00, utolsó rendelés 10:45.
  - Helyben vagy elvitel kötelező. Csíp-fokozat, pótrendelés, visszavonás elfogadás előtt.
  - A tableten Új / Készül / Kész oszlopok.
  - Tesztüzem-felirat, amíg nincs élesítve (`public/menu.live`).
- **Törzsvásárlói program:**
  - 10 pecsét, egy jutalom. Naponta 1 étel-pecsét (500 Ft felett, kiegészítők nélkül), külön 1 kávé-pecsét.
  - Jutalomnak csak olyan étel választható, amit korábban fogyasztott, alapáron. A pecsétek 6 hónap után lejárnak.
  - QR: `PIACBUFE:<telefonszám>`, beolvasás a tableten.
  - Átvételkor 10 különböző köszönőüzenet jelenik meg.
- **Italok:**
  - Ásványvíz: szénsavas / szénsavmentes, „300 Ft + 50 Ft palack”.
  - Üdítő: „600 Ft + 50 Ft palack”.
- **Megjelenés:**
  - Ikon fekete háttérrel, nagy logóval (`resources/logo-hires.png`).
  - Betöltéskor lüktető logó (`www/logo.png`).

## 6. Függő vagy tervezett dolgok

- **E-mailes belépés** (saját fiók, megerősítés, elfelejtett jelszó): kész a `kovetkezo-frissites` ágon, de **félretéve**. Nem adható ki, amíg Tamás nem kéri. Új Firestore-szabályok kellenek hozzá.
- **Készlet-hiba:** Tamás szerint új termék felvételekor egyes régi tételek „bevitt adata” törlődik. Próbában nem jött elő, még várjuk a választ, melyik adat tűnik el és mikor.
- **Olvasó fiókoknál az üzenőfal elrejtése:** feljegyezve, nincs megépítve.
- **Konyhai bonnyomtató** pultos rendelésfelvételhez: két androidos tablet, egy nyomtató, ESC/POS.
  - Javasolt típus: **Equip 351004** (Wi-Fi, magyar bolt) vagy **MUNBYN 80 mm USB+LAN** (Amazon.de).
  - Papír: 80×80 mm.
  - A bonon felirat: „KONYHAI BON – NEM NYUGTA”.
  - Akkor építjük meg, ha a nyomtató megvan.
- **Adatvédelmi szöveg** (törzsvásárlói program): könyvelővel vagy jogásszal érdemes átnézetni.

## 7. Firestore-gyűjtemények (röviden)

- `config/main` (beállítások, kollégák)
- `items`, `moves` (készlet)
- `bakery/<dátum>`
- `cash/<dátum>`
- `shifts/<dátum>` + `shiftlog`
- `orders` (előrendelések)
- `weborders` (online rendelés, publikus létrehozás)
- `public/menu`
- `loyalty/<sha256("pl:"+telefon)>` (publikus get) + `loyaltylog`
- `messages`, `temps`, `freezer/main`
- `config/drive` (Táblázat-célok)

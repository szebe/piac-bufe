# Piac Büfé app

A büfé saját appja (rendelés, műszak, készlet, pékáru, kassza).

- `src/app.html`: az app teljes forrása, egyetlen fájl.
- `build.py`: ebből készíti a `www/index.html`-t (Firebase + PWA).
- `android/`: Capacitor Android-projekt.
- `firestore.rules`: adatbázis-szabályok. Csak a bolti fiók férhet hozzá.
- `.github/workflows/build.yml`: minden feltöltés után teszt (Firestore-emulátor), Android APK, webes változat (GitHub Pages).

Az adatok a Firebase-ben vannak, nem ebben a tárolóban.

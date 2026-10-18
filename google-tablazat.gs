// Piac Büfé – kasszazárás szinkron Google Táblázatba
// Bemásolandó: Google Táblázat → Bővítmények → Apps Script. A KULCS értékét írd be az appba is.
const KULCS = 'IDE_JON_A_KULCS';
const LAP = 'Kasszazárás';
const FEJ = ['Dátum', 'Nap', 'Kassza záró (Ft)', 'Kártya (Ft)', 'Kiadások (Ft)', 'Kiadások részletei', 'Kivét (Ft)', 'Kivét részletei', 'Készpénzes forgalom (Ft)', 'Teljes forgalom (Ft)', 'Rögzítette', 'Utolsó módosítás'];
const MEZO = ['date', 'nap', 'close', 'card', 'exp', 'expList', 'wd', 'wdList', 'cashT', 'total', 'by', 'at'];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return valasz({ ok: false, error: 'rossz kérés' }); }
  if (d.key !== KULCS) return valasz({ ok: false, error: 'hibás kulcs' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(LAP) || ss.insertSheet(LAP);
    if (sh.getLastRow() === 0) {
      sh.appendRow(FEJ);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, FEJ.length).setFontWeight('bold').setBackground('#e8f0ea');
    }
    sh.getRange('A:A').setNumberFormat('@');
    const n = sh.getLastRow();
    const datumok = n > 1 ? sh.getRange(2, 1, n - 1, 1).getDisplayValues().map(r => r[0]) : [];
    (d.rows || []).forEach(r => {
      const sor = MEZO.map(k => (r[k] === null || r[k] === undefined) ? '' : r[k]);
      const i = datumok.indexOf(r.date);
      if (i >= 0) sh.getRange(i + 2, 1, 1, sor.length).setValues([sor]);
      else { sh.getRange(sh.getLastRow() + 1, 1, 1, sor.length).setValues([sor]); datumok.push(r.date); }
    });
    const utolso = sh.getLastRow();
    if (utolso > 2) sh.getRange(2, 1, utolso - 1, FEJ.length).sort(1);
    [3, 4, 5, 7, 9, 10].forEach(c => sh.getRange(2, c, Math.max(1, utolso - 1), 1).setNumberFormat('#,##0 "Ft"'));
    return valasz({ ok: true, n: (d.rows || []).length });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return valasz({ ok: true, info: 'Piac Büfé kasszazárás szinkron működik' }); }

function valasz(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Teste v2.0.1 pentru Calm Waves: sesiuni ghidate de somn (curbă de relaxare, ghid de respirație, jurnal). Logică, nu sunet.
// Rulare: node tests/sleep-session-v2.test.mjs   (Playwright din /opt/node-tools, rețea blocată)
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); } }
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
async function open() {
  const ctx = await b.newContext({viewport: {width: 1000, height: 900}, acceptDownloads: true});
  let net = 0; await ctx.route(/^https?:/, (r) => { net++; r.abort(); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (/Content Security|Refused/i.test(m.text())) errs.push('csp ' + m.text().slice(0, 120)); });
  await p.goto(FILE); await p.waitForTimeout(1500); await p.evaluate(() => { document.getElementById('ssPanel').open = true; });
  return {ctx, p, errs, net: () => net};
}

console.log('Curba: formă, valori, normalizare');
{
  const {ctx, p, errs, net} = await open();
  const R = await p.evaluate(() => {
    const S = CW_SESSION, n = S.norm({shape: 'linear', vol0: 100, vol1: 20, pace1: 2, in0: 4, out0: 4, in1: 6, out1: 10});
    return {
      a0: S.at(n, 0), a5: S.at(n, 0.5), a1: S.at(n, 1), a2: S.at(n, 3),
      sm: [S.frac('smooth', 0), S.frac('smooth', 0.5), S.frac('smooth', 1)], fast: S.frac('fast', 0.5), slow: S.frac('slow', 0.5),
      bad: S.norm({shape: 'zzz', vol0: -5, vol1: 999, pace1: 50, in0: 0, out0: 'x'}),
      b0: S.breath(n, 0, 600), b2: S.breath(n, 2, 600), b5: S.breath(n, 5, 600), b8: S.breath(n, 8.5, 600),
      curve: Array.from(S.volCurve(n, 600)).filter((_, i) => i % 21 === 0).map((x) => +x.toFixed(3)),
      mono: (() => { let prev = 2, okm = true; const c = S.volCurve(S.norm({shape: 'smooth'}), 600); for (const v of c) { if (v > prev + 1e-9) okm = false; prev = v; } return okm; })()
    };
  });
  t('la început: volum 1, ritm ×1, 4/4 s', R.a0.vol === 1 && R.a0.pace === 1 && R.a0.inh === 4 && R.a0.exh === 4);
  t('la jumătate (liniar): volum 0,6, ritm ×1,5, 5/7 s', Math.abs(R.a5.vol - 0.6) < 1e-9 && R.a5.pace === 1.5 && R.a5.inh === 5 && R.a5.exh === 7, JSON.stringify(R.a5));
  t('la final și după: constant (0,2; ×2; 6/10)', R.a1.vol === 0.2 && R.a1.pace === 2 && R.a2.vol === 0.2 && R.a2.exh === 10);
  t('formă netedă 0 / 0,5 / 1', R.sm[0] === 0 && R.sm[1] === 0.5 && R.sm[2] === 1);
  t('rapidă > liniară > lentă la mijloc', R.fast > 0.5 && R.slow < 0.5, R.fast + ' ' + R.slow);
  t('valori în afara limitelor sunt fixate în interval', R.bad.shape === 'smooth' && R.bad.vol0 === 5 && R.bad.vol1 === 100 && R.bad.pace1 === 3 && R.bad.in0 === 2, JSON.stringify(R.bad));
  t('respirație: 0 s inspiră, 2 s inspiră (k=0,5), 5 s expiră, 8,5 s ciclul 2', R.b0.phase === 'in' && R.b2.phase === 'in' && Math.abs(R.b2.k - 0.5) < 0.02 && R.b5.phase === 'out' && R.b8.cycle >= 1, JSON.stringify([R.b0, R.b2, R.b5, R.b8]));
  t('curba de volum exportată coboară monoton', R.mono);
  t('0 erori / 0 rețea', errs.length === 0 && net() === 0, errs.join('|'));
  await ctx.close();
}

console.log('Compoziție: ritmul scade când sesiunea rărește muzica');
{
  const {ctx, p, errs} = await open();
  const R = await p.evaluate(() => {
    function count(pace) {
      const cfg = CW_SESSION.config();
      cfg.paceAt = pace ? () => pace : null;
      const oc = new OfflineAudioContext(2, 44100 * 10, 44100);
      return CW_SESSION.build(oc, cfg).allSources.length;
    }
    CW_SESSION.seed(12345);
    return {n1: count(0), n3: count(3), n1b: count(0)};
  });
  t('aceeași sămânță → același număr de surse (determinism)', R.n1 === R.n1b, R.n1 + ' vs ' + R.n1b);
  t('rărire ×3 → mai puține surse sonore', R.n3 < R.n1, R.n3 + ' < ' + R.n1);
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('UI: setări, previzualizare, config, persistență');
{
  const {ctx, p, errs} = await open();
  await p.check('#ssOn');
  await p.selectOption('#ssShape', 'linear');
  await p.fill('#ssVol1', '20'); await p.dispatchEvent('#ssVol1', 'change');
  await p.selectOption('#ssPace1', '3');
  const prev = await p.textContent('#ssPreview');
  t('previzualizare cu valori (10 min, 60%)', /10/.test(prev) && /60%/.test(prev) && /20%/.test(prev), prev);
  const cfg = await p.evaluate(() => { const c = CW_SESSION.config(), e = CW_SESSION.config(true); return {has: typeof c.paceAt === 'function', p0: c.paceAt(0), p1: c.paceAt(600), bake: !c.bakeVol && e.bakeVol.length}; });
  t('config: paceAt de la ×1 la ×3, curbă de volum pentru export', cfg.has && cfg.p0 === 1 && cfg.p1 === 3 && cfg.bake === 64, JSON.stringify(cfg));
  await p.uncheck('#ssOn');
  t('fără sesiune: config neschimbată (paceAt = null)', await p.evaluate(() => { const c = CW_SESSION.config(true); return c.paceAt === null && c.bakeVol === null; }));
  await p.check('#ssOn');
  await p.reload(); await p.waitForTimeout(1200); await p.evaluate(() => { document.getElementById('ssPanel').open = true; });
  t('setările se păstrează după reîncărcare', (await p.isChecked('#ssOn')) && (await p.inputValue('#ssShape')) === 'linear' && (await p.inputValue('#ssVol1')) === '20' && (await p.inputValue('#ssPace1')) === '3');
  await p.selectOption('#langSelect', 'en');
  t('i18n EN', /Guided sleep session/.test(await p.textContent('#ssPanel summary')) && /Over 10 min/.test(await p.textContent('#ssPreview')));
  t('avertisment „nu e dispozitiv medical” în panou', /not a medical device/i.test(await p.textContent('#ssPanel')));
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('Sesiune pornită: volum și pacer');
{
  const {ctx, p, errs} = await open();
  await p.evaluate(() => { document.getElementById('ssPanel').open = true; });
  await p.check('#ssOn'); await p.selectOption('#ssShape', 'linear'); await p.fill('#ssVol1', '0'); await p.dispatchEvent('#ssVol1', 'change');
  await p.click('#playBtn'); await p.waitForTimeout(1200);
  t('sesiunea e activă, ghidul de respirație apare', await p.evaluate(() => CW_SESSION.active() === true && !document.getElementById('ssPacer').hidden), String(await p.evaluate(() => CW_SESSION.active())));
  t('text de respirație (Inspiră/Expiră)', /Inspir|Expir|Breathe/i.test(await p.textContent('#ssBreathText')), await p.textContent('#ssBreathText'));
  const vm = await p.evaluate(() => CW_SESSION.volMult());
  t('multiplicator de volum ≤ 1 și > 0,95 la început', vm <= 1 && vm > 0.95, vm);
  await p.click('#resetBtn'); await p.waitForTimeout(600);
  t('oprit: pacer ascuns', await p.evaluate(() => document.getElementById('ssPacer').hidden));
  // sesiune scurtă < 60 s nu intră automat în jurnal
  t('sesiune < 60 s: fără intrare automată', await p.evaluate(() => CW_SESSION.journal().length === 0));
  await ctx.close();
}

console.log('Jurnal: adăugare, editare, ștergere, CSV, limită');
{
  const {ctx, p, errs} = await open();
  await p.evaluate(() => { document.getElementById('ssPanel').open = true; });
  await p.click('#ssJAdd');
  t('fără stare și notă: mesaj, nimic adăugat', (await p.textContent('#ssJStatus')).length > 3 && (await p.evaluate(() => CW_SESSION.journal().length)) === 0);
  await p.selectOption('#ssMood', '4'); await p.fill('#ssNote', 'Am adormit repede =cmd'); await p.click('#ssJAdd');
  t('intrare adăugată în listă și în localStorage', (await p.locator('#ssJList li select').count()) === 1 && await p.evaluate(() => JSON.parse(localStorage.getItem('calmwaves_sleep_journal'))[0].mood === 4));
  await p.selectOption('#ssJList li select', '2');
  t('starea se editează', await p.evaluate(() => CW_SESSION.journal()[0].mood === 2));
  const csv = await p.evaluate(() => CW_SESSION.csv([{ts: '2026-10-26T22:00', planned: 20, actual: 18, shape: 'smooth', vol0: 100, vol1: 30, pace1: 2, mood: 3, note: '=1+1 "x"'}]));
  t('CSV: antet, ghilimele duble, neutralizare formule', /^date,planned_min/.test(csv) && /"'=1\+1 ""x"""/.test(csv), csv);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#ssJCsv')]);
  t('export CSV declanșează descărcare', /\.csv$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  await p.evaluate(() => { for (let i = 0; i < 70; i++) CW_SESSION.journalAdd({mood: 1, note: 'n' + i}); });
  t('limita de 60 de intrări', await p.evaluate(() => CW_SESSION.journal().length === 60));
  await p.click('#ssJList li button >> nth=0');
  t('ștergere', await p.evaluate(() => CW_SESSION.journal().length === 59));
  await p.evaluate(() => localStorage.setItem('calmwaves_sleep_journal', '{"x":'));
  t('jurnal corupt nu blochează aplicația', await p.evaluate(() => { try { return CW_SESSION.journal().length === 0; } catch (e) { return false; } }));
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('Ecran stins');
{
  const {ctx, p, errs} = await open();
  await p.evaluate(() => { document.getElementById('ssPanel').open = true; });
  await p.click('#ssDarkBtn');
  t('stratul negru e vizibil', await p.isVisible('#ssDark'));
  await p.keyboard.press('Escape');
  t('Esc revine', !(await p.isVisible('#ssDark')));
  await p.click('#ssDarkBtn'); await p.click('#ssDark');
  t('atingerea revine', !(await p.isVisible('#ssDark')));
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}
await b.close();
console.log(`\n${ok} reușite, ${bad} eșuate`); process.exit(bad ? 1 : 0);

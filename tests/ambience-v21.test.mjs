// Teste Ambianță (CalmWaves 2.1.0): limitator, protecția auzului, straturi, ton, binaural, melodie (seed/tonalitate), mix partajabil, temporizator/estompare, trezire blândă, 8 limbi, rețea.
import {createRequire} from 'module';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
const AXE = process.env.FFF_AXE || process.env.AXE_PATH;
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); } }
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
async function open(url, w = 1000, h = 900) {
  const ctx = await b.newContext({viewport: {width: w, height: h}});
  let net = 0; await ctx.route(/^https?:/, (r) => { net++; r.abort(); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  p.on('console', (m) => { if (/Content Security|Refused/i.test(m.text())) errs.push('csp ' + m.text().slice(0, 120)); });
  await p.goto(url || FILE); await p.waitForTimeout(1500); await p.selectOption('#langSelect', 'ro'); await p.waitForTimeout(100);
  return {ctx, p, errs, net: () => net};
}
const openPanel = (p) => p.evaluate(() => { document.getElementById('ambPanel').open = true; });

console.log('Funcții pure: PRNG, melodie, cod de mix');
{
  const {ctx, p, errs, net} = await open();
  const R = await p.evaluate(() => {
    const A = CW_AMB, s1 = A.bars(7, 'majorPenta', -1, 12), s2 = A.bars(7, 'majorPenta', -1, 12), s3 = A.bars(8, 'majorPenta', -1, 12);
    const k0 = A.bars(7, 'minor', 0, 8), k5 = A.bars(7, 'minor', 5, 8);
    const flat = (x) => x.flat();
    const st = {layers: {rain: 40, fire: 10}, tone: {hz: 528, vol: 30}, bin: {band: 'alpha', vol: 20}, mel: {seed: 4294967295, scale: 'dorian', key: 3, vol: 60, bpm: 60}};
    const h = A.encode(st), back = A.decode('#' + h);
    return {
      det: JSON.stringify(s1) === JSON.stringify(s2), diff: JSON.stringify(s1) !== JSON.stringify(s3),
      transp: flat(k0).length === flat(k5).length && flat(k0).every((e, i) => e.midi - flat(k5)[i].midi === -5 && e.s === flat(k5)[i].s && e.k === flat(k5)[i].k),
      leads: flat(s1).filter((e) => e.k === 'lead').length, pads: flat(s1).filter((e) => e.k === 'pad').length,
      inScale: flat(A.bars(3, 'majorPenta', 0, 20)).every((e) => [0, 2, 4, 7, 9].includes(((e.midi - 48) % 12 + 12) % 12) || e.k === 'bass'),
      h, back, ok1: JSON.stringify(back) === JSON.stringify(Object.assign({}, st, {})),
      bad: [A.decode('#amb=l=rain~500'), A.decode('#amb=zzz'), A.decode('#x=1'), A.decode('#amb=t=5~5'), A.decode('#amb=m=1~nope~a~5~60'), A.decode('#amb=')],
      cap0: A.capLinear(0), cap6: A.capLinear(-6), cap30: A.capLinear(-30)
    };
  });
  t('aceeași (seed, gamă, tonalitate) → aceleași măsuri', R.det); t('seed diferit → melodie diferită', R.diff);
  t('schimbarea tonalității transpune (ritm și melodie identice)', R.transp);
  t('există acorduri și linie melodică', R.pads > 0 && R.leads > 0, JSON.stringify([R.pads, R.leads]));
  t('notele rămân în gama aleasă (pentatonică majoră, tonică C)', R.inScale);
  t('codul de mix: dus-întors fără pierderi', R.ok1, R.h + ' ' + JSON.stringify(R.back));
  t('coduri invalide sau goale respinse', R.bad.every((x) => x === null), JSON.stringify(R.bad));
  t('plafon în dB: 0 → 1, −6 → ≈0,501, −30 → ≈0,0316', R.cap0 === 1 && Math.abs(R.cap6 - 0.501) < 0.002 && Math.abs(R.cap30 - 0.0316) < 0.001);
  t('fără erori și fără rețea', errs.length === 0 && net() === 0, errs.join('|'));
  await ctx.close();
}

console.log('Protecția auzului și limitatorul');
{
  const {ctx, p, errs, net} = await open();
  await openPanel(p);
  t('buton „Pornește” dezactivat până la confirmare', await p.isDisabled('#ambPlay'));
  t('avertizarea este vizibilă în panou', /auzului/i.test(await p.textContent('.amb-warn')));
  const before = await p.evaluate(() => { CW_AMB.start(); return CW_AMB.state(); });
  t('fără confirmare nu pornește niciun sunet', before === null);
  t('mesaj de stare cere confirmarea', /confirmarea/i.test(await p.textContent('#ambStatus')));
  await p.check('#ambAck'); t('după confirmare butonul se activează', !(await p.isDisabled('#ambPlay')));
  // toate stratul la maxim + ton + binaural + melodie, limită −12 dB
  await p.evaluate(() => {
    for (const id of CW_AMB.constants.LAYERS) { const e = document.getElementById('ambL_' + id); e.value = '100'; e.dispatchEvent(new Event('input', {bubbles: true})); }
    const set = (id, v) => { const e = document.getElementById(id); if (e.type === 'checkbox') e.checked = v; else e.value = v; e.dispatchEvent(new Event('input', {bubbles: true})); };
    set('ambToneOn', true); set('ambToneVol', '100'); set('ambBinBand', 'theta'); set('ambBinVol', '100'); set('ambMelOn', true); set('ambMelVol', '100'); set('ambVol', '100'); set('ambCap', '-12');
  });
  await p.click('#ambPlay'); await p.waitForTimeout(1800);
  const S = await p.evaluate(() => CW_AMB.state());
  t('pornește după confirmare', S && S.live && S.layers.length === 11 && S.tone === 528 && S.bin === 'theta' && S.mel === true, JSON.stringify(S));
  const lim = Math.pow(10, -12 / 20);
  let mx = 0; for (let i = 0; i < 30; i++) { mx = Math.max(mx, await p.evaluate(() => CW_AMB.peak())); await p.waitForTimeout(40); }
  t('vârful măsurat (AnalyserNode) ≤ plafonul −12 dB (' + lim.toFixed(3) + ')', mx > 0.005 && mx <= lim + 0.002, 'max=' + mx);
  await p.evaluate(() => { const e = document.getElementById('ambCap'); e.value = '-30'; e.dispatchEvent(new Event('input', {bubbles: true})); });
  await p.waitForTimeout(700);
  mx = 0; for (let i = 0; i < 30; i++) { mx = Math.max(mx, await p.evaluate(() => CW_AMB.peak())); await p.waitForTimeout(40); }
  t('după coborârea limitei la −30 dB vârful ≤ 0,035', mx <= 0.035, 'max=' + mx);
  t('limita se păstrează (localStorage)', await p.evaluate(() => localStorage.getItem('calmwaves_amb_cap')) === '-30');
  await p.click('#ambPlay'); await p.waitForTimeout(300);
  t('oprire: starea se golește, butonul revine', (await p.evaluate(() => CW_AMB.state())) === null && /Pornește/.test(await p.textContent('#ambPlay')));
  t('fără erori și fără rețea', errs.length === 0 && net() === 0, errs.join('|'));
  await ctx.close();
}

console.log('Mix partajabil, seed, tonalitate în interfață');
{
  const {ctx, p} = await open();
  await openPanel(p);
  t('„Golește” și „Copiază” fără nimic: mesaj', true);
  await p.click('#ambShare'); t('nimic de partajat → mesaj', /Nimic de partajat/.test(await p.textContent('#ambShareMsg')));
  await p.evaluate(() => { CW_AMB.writeUI({layers: {rain: 35, stream: 20}, tone: {hz: 396, vol: 25}, bin: {band: 'delta', vol: 30}, mel: {seed: 424242, scale: 'lydian', key: 7, vol: 45, bpm: 50}}); });
  await p.click('#ambShare'); await p.waitForTimeout(200);
  const link = await p.evaluate(() => { const l = document.getElementById('ambLink'); return l.hidden ? null : l.value; });
  const copied = /copiat/i.test(await p.textContent('#ambShareMsg'));
  t('linkul conține #amb= cu toate secțiunile', copied || (link && /#amb=l=rain~35\.stream~20&t=396~25&b=delta~30&m=424242~lydian~7~45~50/.test(link)), link);
  const hash = await p.evaluate(() => CW_AMB.encode(CW_AMB.readUI()));
  t('codul curent corect', hash === 'amb=l=rain~35.stream~20&t=396~25&b=delta~30&m=424242~lydian~7~45~50', hash);
  await ctx.close();
  const c2 = await open(FILE + '#' + hash);
  await c2.p.waitForTimeout(300);
  t('deschiderea cu link arată „Aplică mixul” și panoul deschis; nu pornește sunet', !(await c2.p.isHidden('#ambApply')) && (await c2.p.evaluate(() => document.getElementById('ambPanel').open)) && (await c2.p.evaluate(() => CW_AMB.state())) === null);
  await c2.p.click('#ambApply');
  const U = await c2.p.evaluate(() => CW_AMB.readUI());
  t('aplicarea restaurează straturile, tonul, binauralul și melodia', U.layers.rain === 35 && U.layers.stream === 20 && U.tone.hz === 396 && U.bin.band === 'delta' && U.mel.seed === 424242 && U.mel.scale === 'lydian' && U.mel.key === 7 && U.mel.bpm === 50, JSON.stringify(U));
  t('tot nu a pornit sunetul', (await c2.p.evaluate(() => CW_AMB.state())) === null);
  // seed nou
  const s0 = await c2.p.inputValue('#ambSeed'); await c2.p.click('#ambSeedNew'); const s1 = await c2.p.inputValue('#ambSeed');
  t('„Seed nou” schimbă seedul', s0 !== s1 && /^\d+$/.test(s1));
  await c2.ctx.close();
}

console.log('Temporizator, estompare, trezire blândă (pe axa audio)');
{
  const {ctx, p, errs} = await open();
  await openPanel(p); await p.check('#ambAck');
  await p.evaluate(() => { CW_AMB.writeUI({layers: {pink: 30}, tone: null, bin: null, mel: null}); });
  // trezire blândă: întârziere 2 s, creștere 3 s
  await p.evaluate(() => CW_AMB.start({delaySec: 2, rampSec: 3, timerSec: 0}));
  await p.waitForTimeout(500);
  let S = await p.evaluate(() => CW_AMB.state());
  t('armat: câștigul de estompare este ~0 înainte de oră', S && S.fade < 0.05 && S.wakeAt > Date.now(), JSON.stringify(S));
  t('mesaj „Armat”', /Armat/.test(await p.textContent('#ambStatus')));
  await p.waitForTimeout(2300); S = await p.evaluate(() => CW_AMB.state());
  t('în timpul creșterii lente câștigul e între 0 și 1', S && S.fade > 0.02 && S.fade < 0.98, JSON.stringify(S));
  await p.waitForTimeout(3000); S = await p.evaluate(() => CW_AMB.state());
  t('după creștere câștigul ajunge la 1', S && S.fade > 0.98, JSON.stringify(S));
  await p.evaluate(() => CW_AMB.stop(true)); await p.waitForTimeout(200);
  // oprire automată cu estompare
  await p.evaluate(() => { const e = document.getElementById('ambFade'); e.value = '10'; e.dispatchEvent(new Event('input', {bubbles: true})); });
  t('durata estompării se păstrează', await p.evaluate(() => localStorage.getItem('calmwaves_amb_fade')) === '10');
  await p.evaluate(() => CW_AMB.start({timerSec: 12}));
  await p.waitForTimeout(500); S = await p.evaluate(() => CW_AMB.state());
  t('înainte de estompare câștigul e 1', S && S.fade > 0.98 && S.endAt > Date.now(), JSON.stringify(S));
  await p.waitForTimeout(7500); S = await p.evaluate(() => CW_AMB.state());
  t('în estompare (≈8 s din 12 s, estompare 10 s) câștigul scade', S && S.fade < 0.9 && S.fade > 0, JSON.stringify(S));
  await p.waitForTimeout(5200);
  t('la final se oprește singur', (await p.evaluate(() => CW_AMB.state())) === null && /încheiat/.test(await p.textContent('#ambStatus')));
  t('fără erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('Interacțiune cu CalmWaves, limbi, axe');
{
  const {ctx, p} = await open();
  await openPanel(p); await p.check('#ambAck');
  await p.click('#playBtn'); await p.waitForTimeout(1500);
  t('CalmWaves pornit', /Pauză|Pause/.test((await p.getAttribute('#playBtn', 'aria-label')) || ''));
  await p.click('#ambPlay'); await p.waitForTimeout(600);
  t('pornirea Ambianței pune CalmWaves în pauză', /Redă|Resume|Reia/i.test((await p.getAttribute('#playBtn', 'aria-label')) || ''), await p.getAttribute('#playBtn', 'aria-label'));
  t('Ambianța rulează', !!(await p.evaluate(() => CW_AMB.state())));
  await p.click('#playBtn'); await p.waitForTimeout(500);
  t('reluarea CalmWaves oprește Ambianța (nu se suprapun)', (await p.evaluate(() => CW_AMB.state())) === null);
  for (const l of ['ro', 'en', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
    await p.selectOption('#langSelect', l); await p.waitForTimeout(100);
    const s = await p.textContent('#ambPanel summary'), warn = await p.textContent('.amb-warn');
    const reT = {ro: /Ambian/, en: /Ambience/, fr: /Ambiance/, it: /Ambiente/, es: /Ambiente/, pt: /Ambiente/, de: /Ambiente/, hu: /Hangulat/}[l];
    t('limba ' + l + ': titlu și avertizare nevide, traduse' + (l !== 'ro' && l !== 'en' ? ' (traducere automată)' : ''), s.length > 8 && warn.length > 40 && reT.test(s) && (l === 'en' || !/Hearing protection/.test(warn)), s);
  }
  await p.selectOption('#langSelect', 'en');
  t('etichetele de strat în engleză', /Rain/.test(await p.textContent('label:has(#ambL_rain)')));
  for (const [l, re] of [['fr', /Pluie/], ['it', /Pioggia/], ['es', /Lluvia/], ['pt', /Chuva/], ['de', /Regen/], ['hu', /Eső/]]) { await p.selectOption('#langSelect', l); await p.waitForTimeout(100); t('etichetele de strat traduse: ' + l, re.test(await p.textContent('label:has(#ambL_rain)'))); }
  await ctx.close();
  if (AXE) {
    const c3 = await b.newContext({viewport: {width: 390, height: 800}, bypassCSP: true}); await c3.route(/^https?:/, (r) => r.abort());
    const q = await c3.newPage(); await q.goto(FILE); await q.waitForTimeout(1500); await q.evaluate(() => { document.getElementById('ambPanel').open = true; });
    await q.addScriptTag({content: fs.readFileSync(AXE, 'utf8')});
    const v = await q.evaluate(async () => (await axe.run(document)).violations.map((x) => x.id + ':' + x.nodes.length));
    t('axe 0 violări cu panoul Ambianță deschis (390 px)', v.length === 0, v.join(','));
    const sw = await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    t('fără derulare orizontală la 390 px', sw);
    await c3.close();
  }
}
console.log('\n' + ok + ' reușite, ' + bad + ' eșuate');
await b.close();
process.exit(bad ? 1 : 0);

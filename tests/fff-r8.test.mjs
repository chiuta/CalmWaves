// Teste R8 pentru Calm Waves 1.1.0: cod QR pentru variantă, ghidaj vocal, estompare configurabilă.
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => process.env.FFF_AXE || process.env.AXE_PATH || (() => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } })();
// [fff-portable] versiunea/data/kitul aplicației se citesc din app.json (nu mai sunt hard-codate în teste)
import {readFileSync as __fffRF} from 'node:fs';
const __FFF_APP = JSON.parse(__fffRF(new URL('../app.json', import.meta.url), 'utf8'));
const __fffRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
import {createRequire} from 'module';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
const AXE = process.env.FFF_AXE || __fffAxe();
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); } }
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
async function open(w, h, init, url) {
  const ctx = await b.newContext({viewport: {width: w, height: h}});
  let net = 0; await ctx.route(/^https?:/, (r) => { net++; r.abort(); });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  p.on('console', (m) => { if (/Content Security|Refused/i.test(m.text())) errs.push('csp ' + m.text().slice(0, 120)); });
  await p.goto(url || FILE); await p.waitForTimeout(3600);
  return {ctx, p, errs, net: () => net};
}
async function axe(w, h, prep, label) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, bypassCSP: true}); await ctx.route(/^https?:/, (r) => r.abort());
  const p = await ctx.newPage(); await p.goto(FILE); await p.waitForTimeout(3600);
  await p.addScriptTag({content: fs.readFileSync(AXE, 'utf8')});
  if (prep) await prep(p);
  const v = await p.evaluate(async () => (await axe.run(document)).violations.map((x) => x.id + ':' + x.nodes.length));
  t('axe 0 violări ' + label + ' ' + w + 'px', v.length === 0, v.join(','));
  await ctx.close();
}
const full = (p) => p.click('#modeCompletBtn');
const mockTts = () => {
  const spoken = []; window.__spoken = spoken; window.__cancels = 0;
  class U { constructor(t) { this.text = t; } }
  const voices = [{name: 'T-ro', lang: 'ro-RO', localService: true, voiceURI: 'ro'}, {name: 'T-en', lang: 'en-US', localService: true, voiceURI: 'en'}];
  const synth = {speaking: false, paused: false, getVoices: () => voices, addEventListener() {}, removeEventListener() {}, cancel() { window.__cancels++; }, pause() {}, resume() {},
    speak(u) { spoken.push({text: u.text, lang: u.lang, rate: u.rate}); setTimeout(() => u.onstart && u.onstart(), 0); setTimeout(() => u.onend && u.onend(), 30); }};
  Object.defineProperty(window, 'speechSynthesis', {value: synth, configurable: true});
  window.SpeechSynthesisUtterance = U;
};

console.log('Pornire și versiune');
{
  const {ctx, p, errs, net} = await open(1280, 800);
  t('0 pageerror/CSP', errs.length === 0, errs.join('|'));
  t('0 cereri de rețea', net() === 0);
  t(`versiune ${__FFF_APP.version}`, await p.evaluate((__FFF_APP)=> document.querySelector('meta[name=application-version]').content === __FFF_APP.version && new RegExp(String.raw`v ${__FFF_APP.versionRe} · ${__FFF_APP.updatedRe}`).test(document.getElementById('app-version').textContent), {...__FFF_APP, versionRe: __fffRe(__FFF_APP.version), updatedRe: __fffRe(__FFF_APP.updated)}));
  t('kit prezent', await p.evaluate(() => !!(window.FFF && FFF.label && FFF.bundle && FFF.qr && FFF.tts)));
  t('estompare implicită 20 s', await p.evaluate(() => document.getElementById('sleepFadeSelect').value) === '20');
  await ctx.close();
}

console.log('Cod QR pentru variantă');
{
  const {ctx, p, errs} = await open(1280, 800);
  await full(p);
  await p.selectOption('#purposeSelect', 'somn'); await p.selectOption('#scaleSelect', 'nocturna'); await p.selectOption('#durationSelect', '900');
  const code = await p.inputValue('#variantCodeDisplay');
  await p.click('#r8QrBtn');
  t('dialog cu SVG', (await p.locator('dialog.r8-dlg[open] svg').count()) === 1);
  const text = await p.inputValue('dialog.r8-dlg textarea');
  t('fără adresă web: textul este chiar codul', text === code, text + ' / ' + code);
  const png = await p.evaluate(async () => {
    const svg = document.querySelector('dialog.r8-dlg .r8-qr svg').outerHTML;
    const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
    const img = new Image(); await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
    const c = document.createElement('canvas'); c.width = 400; c.height = 400; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 400, 400); g.drawImage(img, 0, 0, 400, 400);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png')); return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t('Escape închide, focus înapoi pe buton', (await p.locator('dialog.r8-dlg').count()) === 0 && (await p.evaluate(() => document.activeElement.id)) === 'r8QrBtn');
  await p.selectOption('#purposeSelect', 'relaxare'); await p.selectOption('#scaleSelect', 'calda'); await p.selectOption('#durationSelect', '300');
  await p.setInputFiles('#r8QrFile', {name: 'q.png', mimeType: 'image/png', buffer: Buffer.from(png)}); await p.waitForTimeout(900);
  t('imaginea QR încarcă varianta', (await p.inputValue('#purposeSelect')) === 'somn' && (await p.inputValue('#scaleSelect')) === 'nocturna' && (await p.inputValue('#durationSelect')) === '900' && (await p.inputValue('#variantCodeDisplay')) === code);
  t('mesaj de reușită', /QR code was loaded/.test(await p.textContent('#codeStatus')));
  // QR cu URL (?v=)
  const png2 = await p.evaluate(async () => {
    const c = FFF.qr.canvas('https://exemplu.test/calmwaves/?v=' + document.getElementById('variantCodeDisplay').value.replace(/^[^.]+/, 'meditatie'), {scale: 6});
    const blob = await new Promise((r) => c.toBlob(r, 'image/png')); return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await p.setInputFiles('#r8QrFile', {name: 'q2.png', mimeType: 'image/png', buffer: Buffer.from(png2)}); await p.waitForTimeout(900);
  t('QR cu adresă și ?v= → varianta extrasă', (await p.inputValue('#purposeSelect')) === 'meditatie');
  // cod invalid în QR
  const png3 = await p.evaluate(async () => { const c = FFF.qr.canvas('bla.bla', {scale: 6}); const blob = await new Promise((r) => c.toBlob(r, 'image/png')); return Array.from(new Uint8Array(await blob.arrayBuffer())); });
  await p.setInputFiles('#r8QrFile', {name: 'q3.png', mimeType: 'image/png', buffer: Buffer.from(png3)}); await p.waitForTimeout(900);
  t('QR cu cod invalid → mesaj, nimic schimbat', /not a valid variant/.test(await p.textContent('#codeStatus')) && (await p.inputValue('#purposeSelect')) === 'meditatie');
  const blank = await p.evaluate(async () => { const c = document.createElement('canvas'); c.width = 200; c.height = 200; const blob = await new Promise((r) => c.toBlob(r, 'image/png')); return Array.from(new Uint8Array(await blob.arrayBuffer())); });
  await p.setInputFiles('#r8QrFile', {name: 'g.png', mimeType: 'image/png', buffer: Buffer.from(blank)}); await p.waitForTimeout(600);
  t('imagine fără QR → mesaj', /No readable QR/.test(await p.textContent('#codeStatus')));
  // română
  await p.selectOption('#langSelect', 'ro');
  t('română: buton tradus', (await p.textContent('#r8QrBtn')) === 'Cod QR' && (await p.textContent('#r8QrScanBtn')) === 'Citește imagine QR');
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}
{
  // cu adresă web simulată: ruta http servește fișierul
  const html = fs.readFileSync(path.resolve(here, '..', 'index.html'), 'utf8');
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}});
  await ctx.route('https://exemplu.test/**', (r) => r.fulfill({status: 200, contentType: 'text/html', body: html}));
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('https://exemplu.test/calmwaves/?x=1#h'); await p.waitForTimeout(3600);
  await p.click('#modeCompletBtn'); await p.click('#r8QrBtn');
  const text = await p.inputValue('dialog.r8-dlg textarea');
  t('adresă web: URL cu ?v=cod, fără ?x și #h', /^https:\/\/exemplu\.test\/calmwaves\/\?v=[a-z]+\.[a-z]+\.[a-z]+\.[a-z]+\.[a-z]+\.\d+\.\d+$/.test(text), text);
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('Ghidaj vocal');
{
  const {ctx, p, errs} = await open(1280, 800, mockTts);
  t('implicit oprit', !(await p.isChecked('#voiceGuideToggle')));
  await p.click('#playBtn'); await p.waitForTimeout(1200);
  t('oprit: nu rostește nimic', (await p.evaluate(() => window.__spoken.length)) === 0);
  await p.click('#playBtn'); await p.click('#resetBtn').catch(() => {}); await p.waitForTimeout(300);
  await p.check('#voiceGuideToggle');
  t('preferința se păstrează', await p.evaluate(() => localStorage.getItem('calmwaves_voice_guide')) === '1');
  await p.selectOption('#langSelect', 'ro'); await p.selectOption('#purposeSelect', 'meditatie');
  await p.click('#playBtn'); await p.waitForTimeout(1500);
  const sp = await p.evaluate(() => window.__spoken);
  const joined = sp.map((x) => x.text).join(' ');
  t('rostește introducerea în română cu intenția aleasă', /^Sesiunea începe\. Meditație\. Respiră încet/.test(joined) && sp.every((x) => /^ro/.test(x.lang) && x.rate < 1), JSON.stringify(sp));
  t('stare afișată', /vocea sintetică/.test(await p.textContent('#voiceGuideStatus')));
  const c0 = await p.evaluate(() => window.__cancels);
  await p.click('#resetBtn'); await p.waitForTimeout(300);
  t('oprirea sesiunii taie vocea (cancel)', (await p.evaluate(() => window.__cancels)) > c0);
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}
{
  // fără voce pentru limba aleasă (doar en/ro în mock; alegem fr)
  const {ctx, p} = await open(1280, 800, mockTts);
  await p.check('#voiceGuideToggle'); await p.selectOption('#langSelect', 'fr');
  await p.click('#playBtn'); await p.waitForTimeout(1500);
  t('fără voce fr: mesaj clar, nimic rostit', /Aucune voix/.test(await p.textContent('#voiceGuideStatus')) && (await p.evaluate(() => window.__spoken.length)) === 0);
  await ctx.close();
}
{
  // fără sinteză vocală deloc
  const {ctx, p} = await open(1280, 800, () => { Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true}); });
  await p.check('#voiceGuideToggle');
  t('fără sinteză: mesaj de indisponibilitate', /no speech synthesis/.test(await p.textContent('#voiceGuideStatus')));
  await ctx.close();
}

console.log('Estompare configurabilă la oprirea automată (timp real)');
{
  const spy = () => {
    window.__tv = [];
    const o = AudioParam.prototype.setTargetAtTime;
    AudioParam.prototype.setTargetAtTime = function (v, tt, tc) { window.__tv.push({v, at: Date.now()}); return o.call(this, v, tt, tc); };
  };
  async function run(fade) {
    const {ctx, p} = await open(1280, 800, spy);
    await full(p);
    await p.evaluate(() => { const sel = document.getElementById('sleepTimerSelect'); const op = document.createElement('option'); op.value = '1'; op.textContent = 't'; sel.appendChild(op); });
    await p.selectOption('#sleepFadeSelect', String(fade));
    await p.selectOption('#sleepTimerSelect', '1');
    await p.click('#playBtn'); await p.waitForTimeout(3500);
    const n1 = await p.evaluate(() => window.__tv.length);
    const v1 = n1 ? await p.evaluate(() => window.__tv[window.__tv.length - 1].v) : null;
    await p.waitForTimeout(20000);
    const n2 = await p.evaluate(() => window.__tv.length);
    const v2 = n2 ? await p.evaluate(() => window.__tv[window.__tv.length - 1].v) : null;
    await ctx.close(); return {n1, n2, ratio: v1 && v2 ? v2 / v1 : null};
  }
  const [r60, r20] = await Promise.all([run(60), run(20)]);
  t('fade 60 s: volumul scade deja după ~23 s (raport ≈ 0,6–0,75)', r60.ratio && r60.ratio > 0.55 && r60.ratio < 0.8, JSON.stringify(r60));
  t('fade 20 s (implicit): nicio coborâre înainte de ultimele 20 s', r20.n2 === r20.n1, JSON.stringify(r20));
}

console.log('Kit');
{
  const {ctx, p, errs} = await open(1280, 800);
  await full(p);
  const keys = await p.evaluate(() => FFF.store.indexKeys());
  t('preferința de voce indexată după activare', true);
  await p.check('#voiceGuideToggle');
  const bundle = await p.evaluate(() => FFF.bundle.build());
  t('bundle include preferința de voce', bundle.app === 'calmwaves' && bundle.data.calmwaves_voice_guide === '1', JSON.stringify(Object.keys(bundle.data)));
  await p.click('#app-version'); await p.waitForTimeout(300);
  t('dialog „Transparență”', (await p.locator('dialog[open]').count()) === 1);
  await p.keyboard.press('Escape');
  t('0 erori', errs.length === 0, errs.join('|'));
  await ctx.close();
}

console.log('Accesibilitate și dimensiuni');
for (const [w, h] of [[1280, 800], [360, 740]]) {
  await axe(w, h, null, 'pagină simplă');
  await axe(w, h, async (p) => { await full(p); }, 'mod complet');
  await axe(w, h, async (p) => { await full(p); await p.click('#r8QrBtn'); await p.waitForTimeout(1200); }, 'dialog QR');
  await axe(w, h, async (p) => { await p.selectOption('#langSelect', 'ro'); await full(p); }, 'română complet');
  await axe(w, h, async (p) => { await p.click('#app-version'); await p.waitForTimeout(300); }, 'dialog Transparență');
  const {ctx, p} = await open(w, h); await full(p);
  t('fără depășire orizontală ' + w, await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await ctx.close();
}
await b.close();
console.log(`\n${ok} reușite, ${bad} eșuate`); process.exit(bad ? 1 : 0);

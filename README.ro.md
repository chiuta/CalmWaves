# Calm Waves

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versiune:** 1.1.2 · **Ultima actualizare:** 2026-10-19

Compoziție ambientală generativă, personalizabilă, pentru relaxare, somn, concentrare și meditație.

**Live:** https://chiuta.github.io/CalmWaves/

![Captura de ecran](screenshot.png)

## Ce este

Calm Waves este o aplicație single-file (`index.html`) care generează algoritmic, în browser, piese ambientale calme (Web Audio API). Alegi intenția, paleta tonală, densitatea, durata, textura de fundal și ritmul, iar aplicația generează o „variantă” identificabilă printr-un cod pe care îl poți copia și reîncărca. Include vizualizări animate și export audio.

## Funcții

- Două moduri: **Simplu** și **Complet** (acesta din urmă afișează controalele avansate).
- Presetări rapide (Relaxare clasică, Somn adânc, Focus rapid, Meditație serală) și preseturi personalizate (maximum 12, salvate local).
- Parametri: intenție (Relaxare profundă, Somn, Concentrare calmă, Meditație), paletă tonală (Caldă, Nocturnă, Eterică, Adâncă), densitate (Minimală, Echilibrată, Bogată), durată (5–60 min), textură de fond (Neutră, Ploaie, Ocean, Vânt), ritm (Lent, Natural, Activ).
- Unde binaurale (necesită căști), voce sintetizată prin filtre formant (nu voce umană înregistrată) cu profiluri de voce, gong la început și scoică la final (și butoane manuale 🔔 / 🐚).
- Redare continuă (variante noi la nesfârșit) și oprire automată (15–90 min) cu timp rămas afișat și coborâre treptată a volumului în ultimele 20 s.
- Egalizator (grav/mediu/înalt) și lățime stereo; volum.
- Cod de variantă: copiere (📋), variantă nouă (🔀), „Încarcă” pentru a reda un cod; istoric al variantelor recente.
- Vizualizări: Elegantă, Cartoon, 3D, Undă, Mandala; ecran complet, resetare vizualizare, deplasare/zoom cu mouse sau atingere.
- Export: WAV, AIFF și „Exportă comprimat” (WebM/Ogg/M4A, în funcție de ce suportă browserul, prin MediaRecorder).
- Menține ecranul activ în timpul redării, dacă browserul suportă Wake Lock.
- Interfață în 7 limbi: English, Română, Français, Italiano, Español, Português, Deutsch.
- Secțiuni explicative: „Cum funcționează, tehnic” și „Ce spune cercetarea, de fapt”.

## Funcții noi (v1.1.0)

- **Cod QR pentru variantă**: din „Cod variantă” se generează un QR (cu adresă web și `?v=cod`, sau doar codul dacă nu există adresă); „Citește imagine QR” încarcă varianta; cod invalid sau imagine fără QR dau mesaj, fără modificări.
- **Ghidaj vocal scurt** (opt-in, oprit implicit, `FFF.tts`): rostește la început intenția aleasă și un mesaj scurt la final; oprirea sesiunii taie vocea; fără voce în limba interfeței sau fără sinteză apare un mesaj clar și nu se rostește nimic.
- **Estompare configurabilă la oprirea automată** (20 s implicit, 1 min, 5 min): volumul coboară doar în intervalul ales, verificat în timp real în teste.
- **Kit**: Transparență și copie `.fff.json` (preferința de voce este indexată), `core, label, bundle, qr, tts`.
- **Limbi și traduceri**: Textele noi sunt în cele 7 limbi ale aplicației (RO, EN, FR, IT, ES, PT, DE); aplicația nu are maghiară în selector. Traducerile FR/IT/ES/PT/DE sunt automate și **neverificate de vorbitori nativi**; dialogul kitului are 8 limbi.

## Manual de utilizare

1. Alege limba din selectorul de limbă din antet.
2. Alege modul **Simplu** sau **Complet**.
3. Alege un preset rapid sau setează manual intenția, paleta, densitatea, durata, textura și ritmul.
4. Apasă ▶ (Ascultă) pentru a porni. Taste: **Spațiu** = redare/pauză, **↑ / ↓** = volum (±5). Tastele nu acționează când focusul e pe un câmp, buton sau listă.
5. Schimbă vizualizarea (Elegantă / Cartoon / 3D / Undă / Mandala); trage pentru a muta, scroll sau pensare pentru zoom, dublu-clic pentru resetare.
6. Pentru a reface o piesă: copiază „Cod variantă” (📋), iar mai târziu lipește-l și apasă „Încarcă”. 🔀 generează o variantă nouă.
7. Pentru preset propriu (mod Complet): scrie un nume în „Nume preset nou” și apasă „+ Adaugă preset curent” (sau Enter).
8. Setează „Oprire automată” dacă asculți la culcare.
9. Export: „Exportă ca WAV”, „AIFF” sau „Exportă comprimat” (cu „Anulează” pentru oprire).

## Confidențialitate și rețea

- Kitul „fără frontiere” (`fff-kit`, modulele `core, label, bundle, qr, tts`) este lipit în `index.html`: nu face cereri de rețea. Dialogul „Transparență” (clic pe versiune) arată rețeaua declarată (0 cereri externe), cheile din `localStorage`, SHA-256 al fișierului și oferă copie de siguranță `.fff.json` (opțional criptată cu parolă, AES-GCM). Codurile QR se generează și se citesc local; citirea se face doar dintr-o imagine aleasă de utilizator, fără cameră.

- **Stocare locală:** doar presetările personalizate, în `localStorage` (cheia `calmWavesCustomPresets`). Nu am găsit în cod alte chei persistente.
- **Rețea:** codul nu face apeluri `fetch`/XHR și nu încarcă scripturi, fonturi sau resurse externe; audio și grafica sunt generate local. Singurele adrese externe sunt linkuri de navigare deschise la click: trade-free.org, Buy Me a Coffee (butonul ♥).
- Subsolul aplicației declară: MIT, trade-free, 100% offline, fără telemetrie.

## Limitări și disclaimer

Conținut informativ și de relaxare; nu este dispozitiv medical și nu înlocuiește sfatul medical sau tratamentul. Secțiunea „Ce spune cercetarea, de fapt” rezumă afirmații despre studii (ex. unde binaurale și anxietate) care nu au fost verificate independent (la 11.10.2026 verificarea prin căutare web a rămas neconcludentă; aplicația afișează acum o notă în acest sens, în toate cele 7 limbi) și nu trebuie luate ca promisiune terapeutică. Cine are epilepsie sau afecțiuni neurologice ar trebui să ceară sfatul unui medic înainte de a folosi unde binaurale. Pagina are acum un Content-Security-Policy strict (`default-src 'none'`, fără conexiuni externe).

O notă scurtă (RO/EN) este afișată sub subsolul aplicației.

## Rulare locală / offline

Descarcă `index.html` și deschide-l în browser; nu necesită internet. Unele funcții depind de browser (Wake Lock, MediaRecorder pentru exportul comprimat).

## Licență

MIT — vezi fișierul LICENSE

## Audit

Audit: 2026-10-10 — afirmațiile „fără rețea / fără telemetrie” corespund codului (fără `fetch`/XHR/CDN).

## Autor

Alexio — Alexandru-Ionuț Chiuță, contact: alexio@trom.tf.

## English summary

Calm Waves is a single-file generative ambient music app (Web Audio API) with intent, palette, density, duration, texture and pace controls, binaural tones, synthesized formant voices, shareable variant codes, five visualizations and WAV/AIFF/compressed export. 7 UI languages. Only custom presets are stored in localStorage; no network requests apart from optional outbound links. MIT license.

## Istoric / Changelog

- 1.1.1 — 2026-10-19: **corecție**: parametrul `?v=<cod variantă>` din adresă nu mai este suprascris de varianta implicită la încărcare (mesajul „Variantă încărcată” era fals); link informativ spre SEVA (somn, relaxare, meditație).
- 1.1.0 — 2026-10-14: cod QR pentru variantă, ghidaj vocal, estompare configurabilă, kit „fără frontiere”. Teste: `tests/fff-r8.test.mjs`.

### 12 octombrie 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: versiunea și data ultimei actualizări sunt afișate în aplicație

### 11 octombrie 2026
- Exportul afișează progresul (procent) în timpul randării; extensia din mesajul final corespunde formatului ales. Dacă audio nu pornește (context suspendat), apare o notă vizibilă (7 limbi) după ~2,5 s.
- Oprirea automată afișează timpul rămas (7 limbi) și reduce volumul treptat în ultimele 20 s, în loc să se oprească brusc. CSP: `script-src` pe hash SHA-256, fără `'unsafe-inline'` pentru scripturi.
- Adăugat Content-Security-Policy (meta) restrictiv; exportul WAV/AIFF și redarea verificate sub CSP.
- Secțiunea „Ce spune cercetarea” are o notă explicită (7 limbi) că rezumatul nu a fost reverificat independent.
- Verificări axe (1280 și 360 px): 0 violări; fără depășire orizontală.

Surse verificate la 11.10.2026: căutarea web pentru meta-analizele despre unde binaurale și pentru repelentele ultrasonice nu a dat confirmări concludente, de aceea afirmațiile rămân marcate ca neverificate

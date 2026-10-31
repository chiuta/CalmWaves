# Jurnal de modificări — CalmWaves

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH.

## 2.1.1 — 2026-10-31

Doar interfață (accesibilitate pe telefon, 360×740): casetele de bifare (13 px) → 24 px; textul „history-empty” 11,5 → 12 px. Fără alte schimbări de comportament.

## 2.1.0 — 2026-10-27 (anterior: v2.0.1)

Stare: stabil · Offline: complet

Aplicat în tura 2 a recenziei din 2026-10-27 (funcții noi → versiune minoră).

### Adăugat
- **Modul „Ambianță”** (panou nou, în ambele moduri Simplu/Complet): reunește în CalmWaves, prin copierea logicii necesare (nu prin legături către alte aplicații), funcții din:
  - **ASMR**: 11 straturi sonore sintetizate local (ploaie, ocean, foc, vânt, noapte, zgomot alb/roz/brun, pârâu, ventilator, tunet îndepărtat); mix partajabil prin link `#amb=…` (validat strict; nu pornește sunetul singur, doar oferă „Aplică mixul din link”); temporizator de oprire (15–90 min) cu estompare configurabilă (10 s / 30 s / 2 min / 5 min, păstrată în `calmwaves_amb_fade`).
  - **Aurora**: ton de frecvență (frecvențe uzuale sau 40–1200 Hz) și bătăi binaurale (delta/theta/alpha/beta).
  - **BorderlessMelodies**: melodie generată dintr-un seed (PRNG mulberry32), alegerea gamei (8 game) și a tonalității (automată din seed sau 12 tonici); schimbarea tonalității transpune aceeași melodie. Generatorul este SIMPLIFICAT (acorduri diatonice + linie melodică rară) și NU produce aceeași piesă ca BorderlessMelodies.
  - **Trezire blândă** (era „Neimplementat” în README): pornire întârziată (15 min–8 h) cu creștere lentă a volumului (1–15 min), programată pe axa de timp a contextului audio.
- **Protecția auzului** în Ambianță: limitator propriu (compresor + tăiere la ±1 + plafon în dB, −30…0, implicit −6 dB, păstrat în `calmwaves_amb_cap`) și bifă de confirmare înainte de primul sunet (sesiune: `calmwaves_amb_ack`). Vârful măsurat cu AnalyserNode rămâne sub plafon (test).
- Pornirea Ambianței pune CalmWaves în pauză, iar pornirea CalmWaves oprește Ambianța (sunetele nu se suprapun).
- Texte noi scrise în română și engleză; traduceri fr/it/es/pt/de/hu adăugate ulterior — traducere automată, nevalidată de vorbitori nativi.
- Test nou `tests/ambience-v21.test.mjs` (52 de verificări: determinism și transpunere, cod de mix, plafon, protecția auzului, temporizator/estompare, trezire blândă, 8 limbi, axe, fără rețea).
- README (8 limbi): secțiune „Modul Ambianță”, istoric, versiune.

### Neimplementat
- Aplicațiile NU au fost fuzionate sau retrase: ASMR, Aurora, BorderlessMelodies și generator-frecvente rămân funcționale la adresele lor.
- Melodia nu reproduce motorul complet BorderlessMelodies (genuri, instrumente, voce, export audio/MIDI).
- Din Aurora nu s-au copiat chakrele, respirația ghidată, jurnalul și sesiunile (doar partea de frecvență/ambianță).
- Pornirea întârziată nu poate trezi dispozitivul și nu e un ceas deșteptător de încredere (pagina trebuie să rămână deschisă; browserul poate suspenda sunetul).

## 2.0.1 — 2026-10-27 (anterior: v2.0.0)

Stare: stabil · Offline: complet

Aplicat după mini-recenzia din 2026-10-27.

### Adăugat / modificat
- Nota „vezi și” în README (8 limbi) cu diferența dintre CalmWaves (compoziție ambientală generativă cu cod de variantă), ASMR (mixer de peisaje și declanșatoare), BorderlessMelodies (muzică după gen/seed) și Aurora (chakre). Aplicațiile NU au fost fuzionate.
- README (8 limbi): linii „Stare: stabil”, „Offline: complet”; istoric.
- Nicio modificare de cod funcțional; versiune 2.0.1 (index.html, sw.js, app.json, README, teste; hash CSP + `data-fff-hash`/`sha256` recalculate).

### Neimplementat
- Recenzia sugera o singură aplicație „Ambianță” cu moduri (unificare CalmWaves + ASMR + Aurora + BorderlessMelodies): omisă intenționat, conform regulilor lotului (nu se șterge conținut, nu se fuzionează aplicații). Doar notă „vezi și”.

## 2.0.0
- Versiunea anterioară (vezi istoricul din README).

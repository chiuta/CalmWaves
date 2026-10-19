# Calm Waves

**English** · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Version:** 1.1.2 · **Last updated:** 2026-10-19

Customisable generative ambient composition for relaxation, sleep, focus and meditation.

**Live app:** https://chiuta.github.io/CalmWaves/

![Screenshot](screenshot.png)

## What it is

Calm Waves is a single-file application (`index.html`) that algorithmically generates calm ambient pieces in the browser (Web Audio API). You choose the intent, tonal palette, density, duration, background texture and pace, and the app generates a "variant" identifiable by a code that you can copy and reload. It includes animated visualisations and audio export.

## Features

- Two modes: **Simple** and **Full** (the latter shows the advanced controls).
- Quick presets (Classic relaxation, Deep sleep, Quick focus, Evening meditation) and custom presets (up to 12, saved locally).
- Parameters: intent (Deep relaxation, Sleep, Calm focus, Meditation), tonal palette (Warm, Nocturnal, Ethereal, Deep), density (Minimal, Balanced, Rich), duration (5–60 min), background texture (Neutral, Rain, Ocean, Wind), pace (Slow, Natural, Active).
- Binaural beats (headphones required), voice synthesised through formant filters (not a recorded human voice) with voice profiles, a gong at the start and a conch shell at the end (and manual 🔔 / 🐚 buttons).
- Continuous playback (new variants endlessly) and auto-stop (15–90 min) with the remaining time displayed and a gradual volume fade-out over the last 20 s.
- Equaliser (bass/mid/treble) and stereo width; volume.
- Variant code: copy (📋), new variant (🔀), "Load" to play a code; history of recent variants.
- Visualisations: Elegant, Cartoon, 3D, Wave, Mandala; full screen, reset view, pan/zoom with mouse or touch.
- Export: WAV, AIFF and "Export compressed" (WebM/Ogg/M4A, depending on what the browser supports, via MediaRecorder).
- Keeps the screen awake during playback, if the browser supports Wake Lock.
- Interface in 7 languages: English, Română, Français, Italiano, Español, Português, Deutsch.
- Explanatory sections: "How it works, technically" and "What the research actually says".

## New features (v1.1.0)

- **QR code for a variant**: from "Variant code" a QR is generated (with a web address and `?v=code`, or just the code if there is no address); "Read QR image" loads the variant; an invalid code or an image without a QR gives a message, with no changes.
- **Short voice guidance** (opt-in, off by default, `FFF.tts`): speaks the chosen intent at the start and a short message at the end; stopping the session cuts the voice; with no voice in the interface language or no speech synthesis, a clear message appears and nothing is spoken.
- **Configurable fade at auto-stop** (20 s default, 1 min, 5 min): the volume drops only within the chosen interval, verified in real time in the tests.
- **Kit**: Transparency and `.fff.json` backup (the voice preference is indexed), `core, label, bundle, qr, tts`.
- **Languages and translations**: The new texts are in the app's 7 languages (RO, EN, FR, IT, ES, PT, DE); the app does not have Hungarian in the selector. The FR/IT/ES/PT/DE translations are automatic and **not verified by native speakers**; the kit dialog has 8 languages.

## User guide

1. Choose the language from the language selector in the header.
2. Choose the **Simple** or **Full** mode.
3. Choose a quick preset or set the intent, palette, density, duration, texture and pace manually.
4. Press ▶ (Listen) to start. Keys: **Space** = play/pause, **↑ / ↓** = volume (±5). The keys do not act when focus is on a field, button or list.
5. Change the visualisation (Elegant / Cartoon / 3D / Wave / Mandala); drag to move, scroll or pinch to zoom, double-click to reset.
6. To recreate a piece: copy the "Variant code" (📋), and later paste it and press "Load". 🔀 generates a new variant.
7. For your own preset (Full mode): type a name in "New preset name" and press "+ Add current preset" (or Enter).
8. Set "Auto-stop" if you listen at bedtime.
9. Export: "Export as WAV", "AIFF" or "Export compressed" (with "Cancel" to stop).

## Privacy and network

- The "trade-free" kit (`fff-kit`, modules `core, label, bundle, qr, tts`) is embedded in `index.html`: it makes no network requests. The "Transparency" dialog (click on the version) shows the declared network (0 external requests), the `localStorage` keys, the file's SHA-256 and offers a `.fff.json` backup (optionally encrypted with a password, AES-GCM). QR codes are generated and read locally; reading is done only from an image chosen by the user, with no camera.

- **Local storage:** only custom presets, in `localStorage` (key `calmWavesCustomPresets`). I found no other persistent keys in the code.
- **Network:** the code makes no `fetch`/XHR calls and loads no external scripts, fonts or resources; audio and graphics are generated locally. The only external addresses are navigation links opened on click: trade-free.org, Buy Me a Coffee (the ♥ button).
- The app footer declares: MIT, trade-free, 100% offline, no telemetry.

## Limitations and disclaimer

Informational and relaxation content; it is not a medical device and does not replace medical advice or treatment. The "What the research actually says" section summarises claims about studies (e.g. binaural beats and anxiety) that have not been independently verified (on 11.10.2026 verification by web search remained inconclusive; the app now displays a note to that effect, in all 7 languages) and must not be taken as a therapeutic promise. People with epilepsy or neurological conditions should seek a doctor's advice before using binaural beats. The page now has a strict Content-Security-Policy (`default-src 'none'`, no external connections).

A short note (RO/EN) is displayed below the app footer.

## Local / offline use

Download `index.html` and open it in a browser; no internet required. Some features depend on the browser (Wake Lock, MediaRecorder for compressed export).

## Licence

MIT — see the LICENSE file.

## Audit

Audit: 2026-10-10 — the "no network / no telemetry" claims match the code (no `fetch`/XHR/CDN).

## Author

Alexio — Alexandru-Ionuț Chiuță, contact: alexio@trom.tf.

## English summary

Calm Waves is a single-file generative ambient music app (Web Audio API) with intent, palette, density, duration, texture and pace controls, binaural tones, synthesized formant voices, shareable variant codes, five visualizations and WAV/AIFF/compressed export. 7 UI languages. Only custom presets are stored in localStorage; no network requests apart from optional outbound links. MIT license.

## History / Changelog

- 1.1.1 — 2026-10-19: **fix**: the `?v=<variant code>` parameter in the address is no longer overwritten by the default variant on load (the "Variant loaded" message was false); informational link to SEVA (sleep, relaxation, meditation).
- 1.1.0 — 2026-10-14: QR code for a variant, voice guidance, configurable fade, "trade-free" kit. Tests: `tests/fff-r8.test.mjs`.

### 12 October 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: the version and the date of the last update are shown in the app

### 11 October 2026
- Export shows progress (percentage) during rendering; the extension in the final message matches the chosen format. If audio does not start (suspended context), a visible note appears (7 languages) after ~2.5 s.
- Auto-stop shows the remaining time (7 languages) and lowers the volume gradually over the last 20 s, instead of stopping abruptly. CSP: `script-src` on SHA-256 hash, without `'unsafe-inline'` for scripts.
- Added a restrictive Content-Security-Policy (meta); WAV/AIFF export and playback verified under CSP.
- The "What the research says" section has an explicit note (7 languages) that the summary has not been independently re-verified.
- axe checks (1280 and 360 px): 0 violations; no horizontal overflow.

Sources checked on 11.10.2026: the web search for meta-analyses on binaural beats and for ultrasonic repellents gave no conclusive confirmations, which is why the claims remain marked as unverified

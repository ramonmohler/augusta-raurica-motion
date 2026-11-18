# Augusta Raurica – Motion

Live-Demos der Animationen für alle Komponenten aus Figma (Status „Erstellt / Ready for Dev“).
Jede Komponente hat einen eigenen Link; die Startseite `index.html` listet alle auf.

## Struktur

```
index.html                    Übersicht aller Demos
shared/
  tokens.css                  Farben, Typo, Abstände, Easing + Dauer (aus Figma)
  base.css                    Reset, Buttons, Links, Bilder + Demo-Leiste
  demo.js                     GSAP-Setup, AR.ease / AR.dur, Helfer AR.lazy / AR.reveal, Demo-Leiste
  img/                        Bilder und Logos für die Demos
<section>/<komponente>/index.html   eine Demo pro Komponente, alles in einer Datei
```

Jede Demo ist in sich geschlossen: Markup, Komponenten-CSS im `<style>`, der ganze Animationscode im
`<script data-demo>`. Die Leiste unten in jeder Demo („Code & Notizen“) zeigt genau diesen Code und
eine Tabelle mit Auslöser, Dauer und Easing.

## Für die Umsetzung

- **GSAP 3.13** (seit 3.13 inkl. aller Plugins kostenlos, auch kommerziell). Geladen werden je nach Demo
  `gsap`, `ScrollTrigger`, `CustomEase`, teils `Flip`, `Draggable`, `InertiaPlugin`.
- **Easing**: Die drei Kurven sind als CustomEase registriert und identisch mit den CSS-Variablen.

  | GSAP | CSS | Einsatz |
  |---|---|---|
  | `AR.ease.out` (`'ar-out'`) | `--ease-out` · `cubic-bezier(0.23, 1, 0.32, 1)` | Ein-/Ausblenden, Reveals |
  | `AR.ease.inOut` (`'ar-in-out'`) | `--ease-in-out` · `cubic-bezier(0.77, 0, 0.175, 1)` | Bewegung auf dem Bildschirm |
  | `AR.ease.drawer` (`'ar-drawer'`) | `--ease-drawer` · `cubic-bezier(0.32, 0.72, 0, 1)` | Panels, Overlays, Menü |

- **Dauer**: `AR.dur.press` 0.16 s · `hover` 0.2 s · `ui` 0.3 s · `move` 0.6 s · `reveal` 0.9 s · `hero` 1.4 s.
- **Aufteilung**: Hover- und Klick-Zustände sind CSS-Transitions (kurz, unterbrechbar).
  Alles mit Ablauf – Intro, Scroll, Öffnen/Schliessen, Slider – ist GSAP.
- **Reduzierte Bewegung**: Jede Demo prüft `AR.reduced` (System-Einstellung `prefers-reduced-motion`).
  Dann nur Deckkraft, keine Bewegung, kein Parallax, kein Autoplay. In der Demo-Leiste lässt sich das testen.
- **Nur Transform und Opacity** animieren (Ausnahme: Höhe beim Akkordeon).
- `shared/demo.js` ist Demo-Infrastruktur. Fürs Projekt braucht es daraus nur die drei `CustomEase.create(...)`
  und die Werte von `AR.dur`.

## Demo-Leiste

„Nochmals“ spielt die Seite neu ab,
„Reduzierte Bewegung“ (`?reduced=1`), „Code & Notizen“. Die Leiste lässt sich mit dem Pfeil einklappen.

## Schrift

Cera Pro wird nur geladen, wenn sie lokal installiert ist (`local()`), sonst erscheint Outfit.
Mit Webfont-Lizenz die Dateien nach `shared/fonts/` legen und in `shared/tokens.css` als `url()` ergänzen.

## Veröffentlichen (GitHub Pages)

1. Repository anlegen, den Inhalt dieses Ordners hochladen (GitHub Desktop oder „Add file → Upload files“, ganzer Ordner per Drag & Drop).
2. Settings → Pages → „Deploy from a branch“ → `main` / `/ (root)`.
3. Nach ca. 1 Minute: `https://<account>.github.io/<repository>/` und pro Komponente `…/<section>/<komponente>/`.

Die Datei `.nojekyll` sorgt dafür, dass GitHub alle Dateien unverändert ausliefert.

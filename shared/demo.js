/* =====================================================================
   Augusta Raurica – gemeinsame Helfer für alle Motion-Demos
   Lädt nach GSAP (gsap, ScrollTrigger, CustomEase, …) und stellt bereit:

     AR.ease    Easing-Namen, identisch mit den CSS-Tokens in tokens.css
     AR.dur     Dauern in Sekunden
     AR.reduced true, wenn „Reduzierte Bewegung“ aktiv ist (System oder Demo-Schalter)
     AR.lazy()  Bilder weich einblenden, sobald sie geladen sind
     AR.reveal() Elemente beim Scrollen von unten einblenden
     AR.demo(fn) startet die Animation der Seite, wenn Schrift + DOM bereit sind

   Für die Umsetzung im Projekt braucht es nur AR.ease / AR.dur (oder die Werte direkt)
   und den Code im <script data-demo> der jeweiligen Demo. Die Demo-Leiste unten ist nur fürs Review.
   ===================================================================== */
(() => {
  const ME = document.currentScript;
  const params = new URLSearchParams(location.search);
  const sysReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- GSAP-Plugins registrieren (nur die, die geladen sind) ---------- */
  const plugins = ['ScrollTrigger', 'CustomEase', 'Flip', 'SplitText', 'Draggable', 'InertiaPlugin', 'Observer', 'ScrollToPlugin'];
  gsap.registerPlugin(...plugins.map(p => window[p]).filter(Boolean));

  /* ---------- Bewegungs-Tokens ---------- */
  CustomEase.create('ar-out', '0.23, 1, 0.32, 1');        // = --ease-out
  CustomEase.create('ar-in-out', '0.77, 0, 0.175, 1');    // = --ease-in-out
  CustomEase.create('ar-drawer', '0.32, 0.72, 0, 1');     // = --ease-drawer

  const AR = window.AR = {
    ease: { out: 'ar-out', inOut: 'ar-in-out', drawer: 'ar-drawer', hover: 'power1.out', linear: 'none' },
    dur: { press: .16, hover: .2, ui: .3, move: .6, reveal: .9, hero: 1.4 },
    stagger: .07,
    reduced: sysReduced || params.get('reduced') === '1',
  };
  gsap.defaults({ ease: AR.ease.out, duration: AR.dur.ui });

  /* Bilder: von 0 → 1 Deckkraft und leicht herangezoomt → 1, sobald geladen.
     Bei Reduced Motion nur Deckkraft. */
  AR.lazy = (scope = document) => {
    gsap.utils.toArray('.media img', scope).forEach(img => {
      if (img.dataset.arLazy) return;
      img.dataset.arLazy = '1';
      gsap.set(img, { autoAlpha: 0, scale: AR.reduced ? 1 : 1.04 });
      // transform danach entfernen, damit CSS-Hover-Zooms auf dem Bild wieder greifen
      const show = () => gsap.to(img, { autoAlpha: 1, scale: 1, duration: AR.dur.reveal, ease: AR.ease.out, clearProps: 'transform' });
      img.complete && img.naturalWidth ? show() : img.addEventListener('load', show, { once: true });
    });
  };

  /* Scroll-Reveal: Elemente gleiten 24 px von unten und blenden ein, gestaffelt pro Gruppe.
     opts: { y, stagger, start } */
  AR.reveal = (targets, opts = {}) => {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, { autoAlpha: 0, y: AR.reduced ? 0 : (opts.y ?? 24) });
    ScrollTrigger.batch(els, {
      start: opts.start || 'top 88%',
      once: true,
      onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: AR.dur.reveal, ease: AR.ease.out, stagger: opts.stagger ?? AR.stagger, overwrite: true }),
    });
  };

  AR.demo = fn => {
    const run = () => {
      history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      fn({ reduced: AR.reduced });
      ScrollTrigger.refresh();
    };
    const ready = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', ready) : ready();
  };

  /* ---------- Icons (gleiches Sprite wie im Prototyp) ---------- */
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M2 8h12M9 3l5 5-5 5"/></symbol>
    <symbol id="i-search" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5"/></symbol>
    <symbol id="i-hand" viewBox="0 0 16 16"><path d="M5.5 8.5V3.2a1 1 0 0 1 2 0V7m0-4.8a1 1 0 0 1 2 0V7m0-4a1 1 0 0 1 2 0V8m0-2.5a1 1 0 0 1 2 0V10a4.5 4.5 0 0 1-4.5 4.5H8.3a4 4 0 0 1-3.2-1.6L2.6 9.6a1 1 0 0 1 1.5-1.3l1.4 1.4"/></symbol>
    <symbol id="i-book" viewBox="0 0 16 16"><path d="M8 4.2C6.6 3.2 4.6 2.8 2 3v9.4c2.6-.2 4.6.2 6 1.2 1.4-1 3.4-1.4 6-1.2V3c-2.6-.2-4.6.2-6 1.2Zm0 0v9.4"/></symbol>
    <symbol id="i-plus" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12"/></symbol>
    <symbol id="i-minus" viewBox="0 0 16 16"><path d="M2 8h12"/></symbol>
    <symbol id="i-clock" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></symbol>
    <symbol id="i-close" viewBox="0 0 16 16"><path d="m3 3 10 10M13 3 3 13"/></symbol>
    <symbol id="i-access" viewBox="0 0 16 16"><circle cx="8" cy="2.5" r="1.2"/><path d="M3 5.5h10M8 5.5v4M8 9.5l-2.5 5M8 9.5l2.5 5"/></symbol>
    <symbol id="i-down" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></symbol>
    <symbol id="i-pin" viewBox="0 0 16 16"><path d="M8 14.5s4.5-4.2 4.5-8a4.5 4.5 0 0 0-9 0c0 3.8 4.5 8 4.5 8z"/><circle cx="8" cy="6.5" r="1.6"/></symbol>
    <symbol id="i-image" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="m2.5 11.5 3.5-3.5 3 3 2-2 2.5 2.5"/></symbol>
    <symbol id="i-check" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7"/></symbol>
    <symbol id="i-bank" viewBox="0 0 16 16"><path d="M2 6 8 2.5 14 6M3 6.5v6M6.3 6.5v6M9.7 6.5v6M13 6.5v6M2 13.5h12"/></symbol>
    <symbol id="i-eye" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/><path d="m2.5 13.5 11-11"/></symbol>
    <symbol id="i-grid" viewBox="0 0 16 16"><path d="M3 2.5v11M8 2.5v11M13 2.5v11"/></symbol>
    <symbol id="i-list" viewBox="0 0 16 16"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"/></symbol>
    <symbol id="i-phone" viewBox="0 0 16 16"><path d="M5.5 2.5 3 3c-.4 4.9 5.1 10.4 10 10l.5-2.5-2.7-1.2-1.3 1.3C7.8 9.8 6.2 8.2 5.4 6.5l1.3-1.3z"/></symbol>
    <symbol id="i-mail" viewBox="0 0 16 16"><rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="m2.5 4.5 5.5 4 5.5-4"/></symbol>
    <symbol id="i-route" viewBox="0 0 16 16"><circle cx="4" cy="12" r="1.8"/><circle cx="12" cy="4" r="1.8"/><path d="M5.8 12H10a2 2 0 0 0 0-4H6a2 2 0 0 1 0-4h4.2"/></symbol>
    <symbol id="i-ticket" viewBox="0 0 24 24"><path d="M2.6 5h18.8v4.5a2.5 2.5 0 0 0 0 5V19H2.6v-4.5a2.5 2.5 0 0 0 0-5z"/><path d="M15 5v1.6M15 11.2v1.6M15 17.4V19"/></symbol>
    <symbol id="i-s-instagram" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="3.2"/><circle cx="8" cy="8" r="2.6"/><path d="M11.4 4.6h.01"/></symbol>
    <symbol id="i-s-facebook" viewBox="0 0 16 16"><path d="M9.5 14V8.5h2l.3-2.2H9.5V5c0-.6.2-1.1 1.1-1.1h1.2V2a14 14 0 0 0-1.8-.1C8.3 1.9 7.3 2.9 7.3 4.6v1.7h-2v2.2h2V14"/></symbol>
    <symbol id="i-s-youtube" viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="2.5"/><path d="m6.8 6 3 2-3 2z"/></symbol>
    <symbol id="i-s-tripadvisor" viewBox="0 0 16 16"><circle cx="4.8" cy="9" r="2.4"/><circle cx="11.2" cy="9" r="2.4"/><path d="M2.4 6.2C4 4.8 6 4.2 8 4.2s4 .6 5.6 2M8 4.2 8 6.5"/></symbol>
    <symbol id="i-replay" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4M2.5 2.5V5H5"/></symbol>
    <symbol id="i-code" viewBox="0 0 16 16"><path d="m5.5 4-4 4 4 4M10.5 4l4 4-4 4"/></symbol>
    <symbol id="i-back" viewBox="0 0 16 16"><path d="M14 8H2M7 3 2 8l5 5"/></symbol>
  </svg>`;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', SPRITE);
    if (document.body.dataset.overview === undefined) bar();
  });

  /* ---------- Demo-Leiste + Code-Panel ---------- */
  function bar() {
    const home = new URL('../index.html', ME.src).href;
    const title = document.body.dataset.title || document.title;

    const ico = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
    const b = document.createElement('nav');
    b.className = 'demo-bar';
    b.setAttribute('aria-label', 'Demo-Steuerung');
    b.innerHTML = `
      <a href="${home}">${ico('back')}Übersicht</a>
      <span class="demo-bar__title">${document.body.dataset.section || ''} / ${title}</span>
      <span class="demo-bar__sep"></span>
      <button type="button" data-act="replay">${ico('replay')}Nochmals</button>
      <button type="button" data-act="reduced" aria-pressed="${AR.reduced}">Reduzierte Bewegung</button>
      <button type="button" data-act="code" aria-expanded="false">${ico('code')}Code &amp; Notizen</button>
      <button type="button" data-act="hide" aria-label="Leiste einklappen" title="Leiste einklappen">${ico('down')}</button>`;
    const tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'demo-tab'; tab.innerHTML = `${ico('code')}<span class="sr-only">Demo-Leiste zeigen</span>`;
    document.body.append(tab);
    const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
    const setHidden = h => { b.hidden = h; tab.hidden = !h; store.set('ar-demo-bar', h ? 'hidden' : ''); };
    setHidden(store.get('ar-demo-bar') === 'hidden');
    tab.addEventListener('click', () => setHidden(false));
    document.body.append(b);

    const go = (p) => { const u = new URL(location.href); Object.entries(p).forEach(([k, v]) => v == null ? u.searchParams.delete(k) : u.searchParams.set(k, v)); return u; };
    b.addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.act === 'replay') location.reload();
      if (t.dataset.act === 'reduced') location.href = go({ reduced: AR.reduced ? null : 1 });
      if (t.dataset.act === 'code') toggleSheet(t);
      if (t.dataset.act === 'hide') setHidden(true);
    });

    /* Panel mit Ablauf-Tabelle (aus <template id="demo-notes">) und dem Code aus <script data-demo> */
    let sheet, open = false;
    function toggleSheet(btn) {
      if (!sheet) sheet = makeSheet();
      open = !open;
      btn.setAttribute('aria-expanded', open);
      gsap.killTweensOf(sheet);
      if (open) gsap.fromTo(sheet, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, duration: .45, ease: AR.ease.drawer });
      else gsap.to(sheet, { yPercent: 100, duration: .3, ease: AR.ease.out, onComplete: () => gsap.set(sheet, { autoAlpha: 0 }) });
    }
    addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggleSheet(b.querySelector('[data-act="code"]')); });

    function makeSheet() {
      const notes = document.getElementById('demo-notes');
      // Inline-Code der Demo; <script data-demo src="…"> (z. B. shared/navbar.js) wird nachgeladen
      const parts = [...document.querySelectorAll('script[data-demo]')];
      let code = parts.filter(x => !x.src).map(x => dedent(x.textContent)).join('\n\n');
      const s = document.createElement('aside');
      s.className = 'demo-sheet';
      s.setAttribute('aria-label', 'Code und Notizen');
      s.innerHTML = `<h2>${title}</h2>
        <div class="demo-sheet__cols">
          <div>${notes ? notes.innerHTML : ''}</div>
          <div><h3>GSAP-Code</h3><button type="button" class="demo-sheet__copy">Kopieren</button><pre><code>${highlight(code)}</code></pre></div>
        </div>`;
      s.querySelector('.demo-sheet__copy').addEventListener('click', ev => {
        navigator.clipboard?.writeText(code).then(() => { ev.target.textContent = 'Kopiert'; setTimeout(() => ev.target.textContent = 'Kopieren', 1500); });
      });
      document.body.append(s);
      const ext = parts.filter(x => x.src);
      if (ext.length) Promise.all(ext.map(x => fetch(x.src).then(r => r.text()).then(t => `/* ${x.getAttribute('src').replace(/^(\.\.\/)+/, '')} */\n` + dedent(t)).catch(() => '')))
        .then(list => { code = [code, ...list].filter(Boolean).join('\n\n'); s.querySelector('pre code').innerHTML = highlight(code); });
      return s;
    }
  }

  function dedent(src) {
    const lines = src.replace(/^\n+|\s+$/g, '').split('\n');
    const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(pad)).join('\n');
  }
  function highlight(src) {
    const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|return|function|if|else|new|true|false|null|for|of|await|async|=&gt;)\b/gm,
      (m, c, s, k) => c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : `<span class="k">${k}</span>`);
  }
})();

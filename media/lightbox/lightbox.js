/* =====================================================================
   Augusta Raurica – Lightbox (Figma „Lightbox“ 3455:37885)
   Eine Quelle für alle Media-Komponenten: Image Gallery, Gallery slider, Single Image.

   Verwendung:
     ARLightbox(document.querySelectorAll('.g-item'));
   Jede Kachel ist ein <button class="g-item"> mit <img> und optional
     data-full="grosses Bild"  data-cap="Bildlegende"  data-credit="© …"

   Bewegung (GSAP):
     Öffnen    Bild wächst aus der Kachel (Flip: Ausschnitt „cover“ → ganzes Bild „contain“), 0.5 s AR.ease.inOut
               Hintergrund blendet ein 0.3 s, Zähler/Legende/Buttons folgen +0.2 s, 50 ms gestaffelt
     Wechseln  altes Bild 40 px weg + aus 0.18 s, neues kommt aus der Gegenrichtung 0.3 s AR.ease.out
               Pfeiltasten, Buttons oder Wischen/Ziehen (ab 60 px)
     Schliessen Bild schrumpft zurück in die Kachel 0.4 s (falls sichtbar), sonst ausblenden 0.2 s
     Reduzierte Bewegung: nur Überblenden, kein Morph, kein Verschieben.
   Barrierefreiheit: <dialog> mit showModal (Fokus bleibt im Dialog), Esc schliesst,
   Fokus geht zurück auf die Kachel, Zähler wird vorgelesen (aria-live).
   Benötigt: gsap, Draggable, shared/demo.js (AR.ease, AR.reduced)
   ===================================================================== */
(() => {
  let dlg, img, bg, chrome, countEl, textEl, creditEl, nav;
  let set = [], i = 0, busy = false, returnTo = null;
  const ico = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', 'Bildansicht');
    dlg.innerHTML = `
      <div class="lb__bg"></div>
      <div class="lb__stage">
        <div class="lb__top lb__chrome">
          <span class="lb__count" aria-live="polite"></span>
          <button type="button" class="round round--light lb__close" aria-label="Bildansicht schliessen" autofocus>${ico('close')}</button>
        </div>
        <figure class="lb__fig"><img class="lb__img" alt=""></figure>
        <div class="lb__bottom lb__chrome">
          <p class="lb__cap"><span class="lb__text"></span><span class="lb__credit"></span></p>
          <div class="lb__nav">
            <button type="button" class="round round--light round--prev lb__prev" aria-label="Vorheriges Bild">${ico('arrow')}</button>
            <button type="button" class="round round--light lb__next" aria-label="Nächstes Bild">${ico('arrow')}</button>
          </div>
        </div>
      </div>`;
    document.body.append(dlg);
    img = dlg.querySelector('.lb__img');
    bg = dlg.querySelector('.lb__bg');
    chrome = dlg.querySelectorAll('.lb__chrome');
    countEl = dlg.querySelector('.lb__count');
    textEl = dlg.querySelector('.lb__text');
    creditEl = dlg.querySelector('.lb__credit');
    nav = dlg.querySelector('.lb__nav');

    dlg.querySelector('.lb__close').addEventListener('click', close);
    dlg.querySelector('.lb__prev').addEventListener('click', () => go(-1));
    dlg.querySelector('.lb__next').addEventListener('click', () => go(1));
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });          // Esc
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    dlg.addEventListener('click', e => { if (e.target.matches('.lb__fig, .lb__stage')) close(); });

    // Wischen / Ziehen: ab 60 px zum nächsten Bild, sonst zurückfedern
    Draggable.create(img, {
      type: 'x', minimumMovement: 6,
      onDrag() { gsap.set(img, { autoAlpha: 1 - Math.min(Math.abs(this.x) / 400, .5) }); },
      onRelease() {
        if (set.length > 1 && Math.abs(this.x) > 60) go(this.x < 0 ? 1 : -1);
        else gsap.to(img, { x: 0, autoAlpha: 1, duration: .3, ease: AR.ease.out });
      },
    });
  }

  const it = () => set[i];
  function fill() {
    img.src = it().src;
    img.alt = it().alt;
    textEl.textContent = it().cap;
    creditEl.textContent = it().credit;
    countEl.textContent = `${i + 1} / ${set.length}`;
  }
  // auf das dekodierte Bild warten (für korrekte Masse), aber höchstens 250 ms
  const decoded = () => Promise.race([(img.decode ? img.decode() : Promise.resolve()).catch(() => {}), new Promise(r => setTimeout(r, 250))]);

  // Zustand, in dem das grosse Bild genau den sichtbaren Ausschnitt der Kachel deckt
  function fromThumb(thumbEl) {
    const t = thumbEl.getBoundingClientRect();
    gsap.set(img, { clearProps: 'transform,clipPath' });
    const f = img.getBoundingClientRect();
    const s = Math.max(t.width / f.width, t.height / f.height);
    const ix = (f.width - t.width / s) / 2, iy = (f.height - t.height / s) / 2;
    return {
      x: (t.left + t.width / 2) - (f.left + f.width / 2),
      y: (t.top + t.height / 2) - (f.top + f.height / 2),
      scale: s,
      clipPath: `inset(${iy}px ${ix}px ${iy}px ${ix}px)`,
    };
  }
  const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };

  async function open(items, index, from) {
    if (!dlg) build();
    set = items; i = index; busy = true; returnTo = from || null;
    nav.hidden = countEl.hidden = set.length < 2;
    fill();
    gsap.set([bg, img], { autoAlpha: 0 });
    gsap.set(chrome, { opacity: 0, y: AR.reduced ? 0 : 8 });   // nur opacity: Close-Button bleibt fokussierbar
    dlg.showModal();
    dlg.querySelector('.lb__close').focus();                     // Startfokus im Dialog
    document.documentElement.style.overflow = 'hidden';
    await decoded();

    const thumb = it().thumb;
    const tl = gsap.timeline({ onComplete: () => { busy = false; gsap.set(thumb, { autoAlpha: 1 }); } });
    tl.to(bg, { autoAlpha: 1, duration: .3, ease: AR.ease.out }, 0);
    if (AR.reduced || !onScreen(thumb) || !img.naturalWidth) {  // ohne Masse kein Morph, nur Einblenden
      tl.fromTo(img, { autoAlpha: 0, scale: AR.reduced ? 1 : .96 }, { autoAlpha: 1, scale: 1, duration: .3, ease: AR.ease.out }, 0);
    } else {
      gsap.set(thumb, { autoAlpha: 0 });                         // Kachel „wird“ zum grossen Bild
      tl.fromTo(img, { ...fromThumb(thumb), autoAlpha: 1 },
        { x: 0, y: 0, scale: 1, clipPath: 'inset(0px 0px 0px 0px)', duration: .5, ease: AR.ease.inOut }, 0);
    }
    tl.to(chrome, { opacity: 1, y: 0, duration: .3, stagger: .05, ease: AR.ease.out }, .2);
  }

  function go(dir) {
    if (set.length < 2) return;
    i = (i + dir + set.length) % set.length;
    gsap.killTweensOf(img);
    const out = AR.reduced ? 0 : -dir * 40;
    gsap.to(img, { x: `+=${out}`, autoAlpha: 0, duration: .18, ease: AR.ease.out, onComplete: async () => {
      fill();
      await decoded();
      gsap.fromTo(img, { x: AR.reduced ? 0 : dir * 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .3, ease: AR.ease.out });
    } });
    gsap.fromTo(dlg.querySelector('.lb__cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, delay: .15, ease: AR.ease.out });
  }

  function close() {
    if (!dlg.open) return;
    const { el, thumb } = it();
    gsap.killTweensOf([img, bg, chrome]);
    const done = () => {
      dlg.close();
      document.documentElement.style.overflow = '';
      gsap.set(thumb, { autoAlpha: 1 });
      gsap.set(img, { clearProps: 'transform,clipPath,opacity,visibility' });
      busy = false;
      (returnTo || el).focus({ preventScroll: true });            // Fokus zurück auf Kachel bzw. Auslöser
    };
    const tl = gsap.timeline({ onComplete: done });
    tl.to(chrome, { opacity: 0, duration: .15, ease: AR.ease.out }, 0)
      .to(bg, { autoAlpha: 0, duration: .3, ease: AR.ease.out }, .1);
    if (!AR.reduced && onScreen(thumb)) {
      const target = { ...fromThumb(thumb) };
      gsap.set(img, { x: 0, y: 0, scale: 1, clipPath: 'inset(0px 0px 0px 0px)' });
      tl.to(img, { ...target, duration: .4, ease: AR.ease.inOut }, 0)
        .set(thumb, { autoAlpha: 1 }, .4)
        .set(img, { autoAlpha: 0 }, .4);
    } else {
      tl.to(img, { autoAlpha: 0, scale: AR.reduced ? 1 : .96, duration: .2, ease: AR.ease.out }, 0);
    }
  }

  window.ARLightbox = triggers => {
    const items = [...triggers].map(el => {
      const thumb = el.querySelector('img');
      return { el, thumb, src: el.dataset.full || thumb.currentSrc || thumb.src, alt: thumb.alt, cap: el.dataset.cap || '', credit: el.dataset.credit || '' };
    });
    items.forEach((x, n) => x.el.addEventListener('click', e => {
      if (x.el.dataset.dragged) return;                           // Slider: Ziehen ist kein Klick
      open(items, n);
    }));
    return { open: (n, from) => open(items, n, from) };   // from: Element, das danach wieder den Fokus bekommt
  };
})();

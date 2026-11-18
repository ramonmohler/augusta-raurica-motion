/* =====================================================================
   Navbar – eine Komponente für alle Demos (Figma „Navigation Components / Navbar“)
   Lädt nach shared/demo.js. Aufruf im AR.demo-Callback:

     const nav = AR.navbar({
       tone: 'bright',          // 'bright' = weiss über Bild, 'dark' = Anthrazit auf hellem Grund
       solidAfter: '#hero',     // ab hier weiss mit Anthrazit + Schatten (sonst nach den ersten Pixeln)
       home: false,             // true: volles Logo in der Navbar erst, wenn das Hero-Logo dort ankommt
       delay: .1,               // Start des Intros
     });
     // nav.el (header), nav.logo (volles Logo, Desktop), nav.intro (Timeline)

   Verhalten
   · Intro: Elemente blenden von oben ein, 50 ms gestaffelt
   · Über dem Hero bleibt die Navbar stehen; danach Scroll nach unten = weg, nach oben = zurück
   · Barrierefreiheit-Panel, Sprachauswahl, Burger → Kreuz
   ===================================================================== */
(() => {
  const ROOT = new URL('../', document.currentScript.src).href;
  const ico = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const HTML = `
  <div class="nav__in wrap">
    <div class="nav__left">
      <a class="nav__btn" href="${ROOT}interactive/search-results/" aria-label="Suche">${ico('search')}</a>
      <button class="nav__btn" type="button" data-nav="a11y" aria-expanded="false" aria-controls="navA11y" aria-label="Barrierefreiheit">${ico('access')}</button>
      <div class="lang">
        <button class="nav__btn lang__current" type="button" aria-expanded="false" aria-controls="navLangs" aria-label="Sprache: Deutsch. Sprache wählen">DE</button>
        <ul class="lang__list" id="navLangs"></ul>
      </div>
    </div>
    <a class="nav__logo" href="${ROOT}hero/hero-1st-level/" aria-label="Augusta Raurica – Startseite"><span class="nav__full"></span><span class="nav__ar"></span></a>
    <div class="nav__right">
      <button class="nav__btn menu-btn" type="button" data-nav="menu" aria-pressed="false"><span class="menu-btn__label">Menü</span> <span class="burger" aria-hidden="true"><span></span><span></span><span></span></span></button>
    </div>
  </div>
  <section class="a11y" id="navA11y" aria-labelledby="navA11yTitle">
    <div class="a11y__in wrap">
      <div class="a11y__intro">
        <h2 id="navA11yTitle">Barrierefreiheit</h2>
        <p>Augusta Raurica soll für alle zugänglich sein. Hier passen Sie Kontrast und Schriftgrösse an oder wechseln zu Gebärdensprache und Leichter Sprache.</p>
        <a class="tlink" href="${ROOT}barrierefreiheit/accessibility-panel/"><span>Alle Informationen</span>${ico('arrow')}</a>
      </div>
      <div class="a11y__opts">
        <div class="a11y__grp"><p id="navCt">Kontrast</p>
          <div class="seg" role="group" aria-labelledby="navCt" data-set="contrast"><span class="seg__thumb"></span>
            <button type="button" aria-pressed="true" aria-label="Normaler Kontrast"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button>
            <button type="button" aria-pressed="false" aria-label="Hoher Kontrast"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="currentColor"/></svg></button>
          </div></div>
        <div class="a11y__grp"><p id="navFs">Schriftgrösse</p>
          <div class="seg" role="group" aria-labelledby="navFs" data-set="size"><span class="seg__thumb"></span>
            <button type="button" aria-pressed="true" aria-label="Normale Schrift">A</button>
            <button type="button" aria-pressed="false" aria-label="Grosse Schrift">A+</button>
          </div></div>
        <a class="btn btn--outline" href="#">${ico('hand')}Gebärdensprache</a>
        <a class="btn btn--outline" href="#">${ico('book')}Leichte Sprache</a>
      </div>
      <p class="a11y__note">Die Einstellungen werden in diesem Browser gespeichert.</p>
    </div>
  </section>`;

  AR.navbar = ({ tone = 'bright', solidAfter = null, home = false, delay = .1 } = {}) => {
    const reduced = AR.reduced;
    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.id = 'nav';
    nav.dataset.tone = tone;
    nav.innerHTML = HTML;
    const scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.prepend(nav, scrim);

    const $ = s => nav.querySelector(s);
    const a11yBtn = $('[data-nav="a11y"]'), panel = $('.a11y');
    const langBtn = $('.lang__current'), langList = $('.lang__list');
    const menuBtn = $('[data-nav="menu"]'), bars = menuBtn.querySelectorAll('.burger span');
    const full = $('.nav__full');
    const after = typeof solidAfter === 'string' ? document.querySelector(solidAfter) : solidAfter;

    // 1 · Intro
    if (home) gsap.set(full, { autoAlpha: 0 });   // kommt mit dem Hero-Logo
    const intro = gsap.timeline({ delay })
      .from(nav.querySelectorAll('.nav__left > *, .nav__ar, .nav__right > *' + (home ? '' : ', .nav__full')),
        { y: reduced ? 0 : -12, autoAlpha: 0, duration: AR.dur.move, stagger: .05, ease: AR.ease.out });

    // 2 · Über dem Hero stehen bleiben, danach: Scroll nach unten weg, nach oben zurück
    const freeFrom = () => after ? after.offsetTop + after.offsetHeight - nav.offsetHeight : nav.offsetHeight;
    let hidden = false;
    const locked = () => a11yBtn.getAttribute('aria-expanded') === 'true' || langBtn.getAttribute('aria-expanded') === 'true';
    function setHidden(h) {
      if (h === hidden || (h && locked())) return;
      hidden = h;
      gsap.to(nav, reduced
        ? { autoAlpha: h ? 0 : 1, duration: AR.dur.hover, overwrite: 'auto' }
        : { yPercent: h ? -100 : 0, duration: h ? .3 : .4, ease: AR.ease.out, overwrite: 'auto' });
    }
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => setHidden(self.scroll() > freeFrom() && self.direction === 1) });

    // 3 · Weiss mit Anthrazit + Schatten, sobald der Hero verlassen ist
    ScrollTrigger.create({ start: () => Math.max(1, freeFrom()), end: 'max',
      onEnter: () => nav.classList.add('is-solid'), onLeaveBack: () => nav.classList.remove('is-solid') });

    // 4 · Sprachauswahl
    const LANGS = { DE: 'Deutsch', FR: 'Français', IT: 'Italiano', EN: 'English' };
    let current = 'DE', langTl;
    const renderLangs = () => {
      langList.innerHTML = Object.keys(LANGS).filter(k => k !== current)
        .map(k => `<li><button class="nav__btn" type="button" lang="${k.toLowerCase()}" data-lang="${k}" aria-label="${LANGS[k]}">${k}</button></li>`).join('');
    };
    renderLangs();
    function setLang(open) {
      if ((langBtn.getAttribute('aria-expanded') === 'true') === open) return;
      langBtn.setAttribute('aria-expanded', open);
      langTl?.kill();
      const items = langList.querySelectorAll('button');
      langTl = open
        ? gsap.timeline().set(langList, { autoAlpha: 1 }).fromTo(items, { x: reduced ? 0 : -6, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: AR.dur.hover, stagger: .04 })
        : gsap.timeline().to(items, { autoAlpha: 0, duration: .15 }).set(langList, { autoAlpha: 0 });
    }
    langBtn.addEventListener('click', () => { closePanel(); setLang(langBtn.getAttribute('aria-expanded') !== 'true'); });
    langList.addEventListener('click', e => {
      const b = e.target.closest('[data-lang]');
      if (!b) return;
      current = b.dataset.lang;
      gsap.fromTo(langBtn, { y: reduced ? 0 : 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: AR.dur.hover });
      langBtn.textContent = current;
      langBtn.setAttribute('aria-label', `Sprache: ${LANGS[current]}. Sprache wählen`);
      setLang(false);
      setTimeout(renderLangs, 160);
      langBtn.focus();
    });
    document.addEventListener('click', e => { if (!e.target.closest('.lang')) setLang(false); });

    // 5 · Barrierefreiheit-Panel: öffnet von oben, Burger blendet aus, «Menü» rückt nach
    const label = menuBtn.querySelector('.menu-btn__label'), burger = menuBtn.querySelector('.burger');
    const panelTl = gsap.timeline({ paused: true, defaults: { ease: AR.ease.out },
        onReverseComplete: () => { nav.classList.remove('is-panel'); gsap.set([panel, scrim], { autoAlpha: 0 }); } })
      .set([panel, scrim], { autoAlpha: 1 })
      .fromTo(panel, { clipPath: reduced ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', opacity: reduced ? 0 : 1 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: .35 })
      .fromTo(panel.querySelectorAll('.a11y__in > *'), { y: reduced ? 0 : -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3, stagger: .04 }, .08)
      .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .25 }, 0)
      .to(burger, { autoAlpha: 0, scale: .6, duration: .2 }, 0)
      .to(label, { x: () => burger.offsetWidth + 8, duration: .25 }, 0);
    function openPanel() {
      setLang(false);
      nav.classList.add('is-panel');
      a11yBtn.setAttribute('aria-expanded', 'true');
      setHidden(false);
      panelTl.timeScale(1).play();
    }
    function closePanel() {
      if (a11yBtn.getAttribute('aria-expanded') !== 'true') return;
      a11yBtn.setAttribute('aria-expanded', 'false');
      panelTl.timeScale(1.6).reverse();          // schliessen schneller als öffnen
    }
    a11yBtn.addEventListener('click', () => a11yBtn.getAttribute('aria-expanded') === 'true' ? closePanel() : openPanel());
    scrim.addEventListener('click', closePanel);
    addEventListener('keydown', e => { if (e.key === 'Escape') { closePanel(); setLang(false); } });

    // Auswahl-Schalter: Hintergrund gleitet zur gewählten Option
    panel.querySelectorAll('.seg').forEach(seg => {
      const thumb = seg.querySelector('.seg__thumb'), opts = [...seg.querySelectorAll('button')];
      opts.forEach((b, i) => b.addEventListener('click', () => {
        opts.forEach(o => o.setAttribute('aria-pressed', o === b));
        gsap.to(thumb, { x: b.offsetLeft - 3, duration: .25, ease: AR.ease.inOut });
        const main = document.querySelector('main') || document.body;
        main.classList.toggle(seg.dataset.set === 'contrast' ? 'is-contrast' : 'is-large', i === 1);
      }));
    });

    // 6 · Menü: Burger → Kreuz (Overlay siehe Demo «Menü»)
    const toX = gsap.timeline({ paused: true, defaults: { duration: .3, ease: AR.ease.inOut } })
      .to(bars[0], { y: 5.5, rotation: 45 }, 0)
      .to(bars[1], { scaleX: 0, duration: .15 }, 0)
      .to(bars[2], { y: -5.5, rotation: -45 }, 0);
    menuBtn.addEventListener('click', () => {
      closePanel(); setLang(false);
      const on = menuBtn.getAttribute('aria-pressed') !== 'true';
      menuBtn.setAttribute('aria-pressed', on);
      on ? toX.play() : toX.reverse();
    });

    return { el: nav, logo: full, intro, show: () => setHidden(false) };
  };
})();

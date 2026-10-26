(() => {
  window.__cozyAnim = true;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Helpers de animación ---------- */
  // Titulares: cada línea (separada por <br>) dentro de una máscara
  const maskLines = el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(h => `<span class="ln"><span class="ln__i">${h.trim()}</span></span>`).join('');
  };
  // Palabras de la cita
  const splitWords = (el, step = 0.04, start = 0) => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = tok;
            inner.style.transitionDelay = (start + i++ * step).toFixed(2) + 's';
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return i;
  };
  // Sin IntersectionObserver se muestra todo
  const mkIO = opts => hasIO ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); e.target.__io.unobserve(e.target); if (e.target.__cb) e.target.__cb(); }
  }), opts) : null;
  const io = mkIO({ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }), io0 = mkIO({ threshold: 0 });
  const watch = (el, cb) => {
    if (!el) return;
    if (cb) el.__cb = cb;
    if (!hasIO) { el.classList.add('is-in'); if (cb) cb(); return; }
    const o = el.closest('.foot') ? io0 : io; el.__io = o; o.observe(el);
  };
  const rv = (el, delay = 0) => { if (!el) return; el.classList.add('rv'); el.style.transitionDelay = delay.toFixed(2) + 's'; };

  /* ---------- Portada (al cargar) ---------- */
  const hero = $('.hero');
  $$('.hero__title .ln__i').forEach((l, i) => l.style.transitionDelay = (0.3 + i * 0.12).toFixed(2) + 's');
  rv($('.hero__kicker'), 0.15);
  rv($('.hero__lead'), 0.6);
  $$('.hero__cta > *').forEach((b, i) => rv(b, 0.7 + i * 0.1));
  $$('.hero__bar > div').forEach((b, i) => rv(b, 0.8 + i * 0.08));

  /* ---------- Encabezados de sección ---------- */
  $$('.sec__head, .cta__head').forEach(head => {
    const h = $('.h2, .cta__title', head);
    if (h) { maskLines(h); $$('.ln__i', h).forEach((l, i) => l.style.transitionDelay = (0.1 + i * 0.1).toFixed(2) + 's'); }
    $$('.code, .lead, .hist__big', head).forEach((el, i) => rv(el, i ? 0.25 : 0));
    watch(head);
  });
  // Bloques escalonados
  const group = (sel, step = 0.1) => $$(sel).forEach(g => { [...g.children].forEach((k, i) => rv(k, i * step)); watch(g); });
  group('.about__text', 0.12);
  group('.stats', 0.1);
  group('.svc__list', 0.08);
  group('.steps', 0.12);
  group('.tl', 0.08);
  group('.people', 0.06);
  group('.cta__side', 0.08);
  group('.foot__grid', 0.08);
  // Disciplinas: los nombres y textos entran escalonados
  const dl = $('#dl');
  if (dl) { $$('.dl__it', dl).forEach((el, i) => rv(el, i * 0.07)); watch(dl); }
  ['.svc__fig', '.proc__media', '.quote__img', '.car__foot'].forEach(s => $$(s).forEach(el => { rv(el, 0.1); watch(el); }));

  /* ---------- Cifras: conteo al entrar ---------- */
  const fmt = n => n.toLocaleString('es-AR');
  const countUp = dd => {
    const end = +dd.dataset.count; if (!end || !root.classList.contains('anim')) return;
    const t0 = performance.now(), dur = 1400;
    const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); dd.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(step); };
    dd.textContent = '0'; requestAnimationFrame(step);
  };
  const stats = $('.stats');
  if (stats) stats.__cb = () => $$('dd[data-count]', stats).forEach(countUp);

  /* ---------- Cita: palabra por palabra ---------- */
  const quote = $('#quote');
  if (quote) {
    const n = splitWords($('.quote__p', quote), 0.04, 0.1);
    const f = $('footer', quote); rv(f, 0.1 + n * 0.04 + 0.15);
    watch(quote);
  }

  // Arranque: la portada se dispara al cargar
  requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.add('is-loaded'); hero.classList.add('is-in'); }));

  /* ---------- Header + menú ---------- */
  const head = $('#head'), t = $('.head__toggle'), nav = $('#menu');
  const setMenu = o => {
    t.setAttribute('aria-expanded', String(o));
    $('.sr', t).textContent = o ? 'Cerrar menú' : 'Abrir menú';
    nav.classList.toggle('is-open', o);
    document.body.classList.toggle('menu-open', o);
  };
  t.addEventListener('click', () => setMenu(t.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); t.focus(); } });
  matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Scroll: header + parallax suave ---------- */
  const figImg = $('.hero__fig img'), qimg = $('.quote__img img');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    head.classList.toggle('is-scrolled', y > 10);
    if (figImg && y < innerHeight * 1.3) figImg.style.setProperty('--py', (y * 0.12).toFixed(1) + 'px');
    if (qimg) {
      const r = qimg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) qimg.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px');
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Marquesinas (derecha → izquierda) ---------- */
  const marquees = $$('.marquee__track').map(el => ({ el, x: 0, w: 0 }));
  const measure = () => marquees.forEach(m => { m.w = m.el.firstElementChild.getBoundingClientRect().width; });
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(64, now - last); last = now;
    marquees.forEach(m => {
      if (!m.w) return;
      m.x -= dt * 0.045;
      if (-m.x >= m.w) m.x += m.w;
      m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* ---------- #TeamCozy: carrusel continuo (NO se pausa con hover) ---------- */
  const car = $('#car'), track = $('#track');
  if (car && track) {
    const orig = [...track.children], n = orig.length;
    const mk = li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.dataset.clone = '1'; return c; };
    orig.forEach(li => track.appendChild(mk(li)));
    orig.slice().reverse().forEach(li => track.prepend(mk(li)));
    const all = () => [...track.children];
    let idx = n, timer;
    const bio = $('.car__bio'), bi = $('#bio-i'), bn = $('#bio-n'), bs = $('#bio-s'), bt = $('#bio-t');
    const ci = $('#car-i'), bar = $('#car-bar');
    $('#car-n').textContent = String(n).padStart(2, '0');
    // Medidas reales (las variables con clamp() no se resuelven en getPropertyValue)
    const pos = () => { const w = orig[0].offsetWidth, gap = parseFloat(getComputedStyle(track).columnGap) || 0; return (car.clientWidth / 2 - (idx * (w + gap) + w / 2)).toFixed(1); };
    const place = (anim, swap = true) => {
      track.classList.toggle('is-moving', !!anim);
      track.style.transform = `translateX(${pos()}px)`;
      all().forEach((li, i) => li.classList.toggle('is-active', i === idx));
      const real = ((idx % n) + n) % n, src = orig[real], num = String(real + 1).padStart(2, '0');
      ci.textContent = num; bi.textContent = num;
      bar.style.width = ((real + 1) / n * 100) + '%';
      bn.textContent = $('h3', src).textContent;
      bs.textContent = $('.ath__s', src).textContent;
      bt.textContent = $('.ath__t', src).textContent;
      if (swap) { bio.classList.remove('is-swap'); void bio.offsetWidth; bio.classList.add('is-swap'); }
    };
    const settle = () => {
      if (idx >= 2 * n || idx < n) {
        idx = idx >= 2 * n ? idx - n : idx + n;
        track.classList.remove('is-moving');
        all().forEach(li => li.style.transition = 'none');
        track.style.transform = `translateX(${pos()}px)`;
        all().forEach((li, i) => li.classList.toggle('is-active', i === idx));
        void track.offsetWidth;
        all().forEach(li => li.style.transition = '');
      }
    };
    const go = d => { idx += d; place(true); setTimeout(settle, 560); };
    const start = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) go(1); }, 3000); };
    $('#car-next').addEventListener('click', () => { go(1); start(); });
    $('#car-prev').addEventListener('click', () => { go(-1); start(); });
    let x0 = null;
    car.addEventListener('pointerdown', e => { x0 = e.clientX; });
    addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); start(); } });
    let lastW = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; place(false, false); } });
    place(false); start();
  }

  /* ---------- Video de la mochila (carga diferida) ---------- */
  const v = $('#reel-video');
  const loadVideo = () => {
    if (v.dataset.loaded) return; v.dataset.loaded = 1;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => { const s = document.createElement('source'); s.src = v.dataset[k]; s.type = type; v.appendChild(s); });
    v.load();
  };
  if (v && !hasIO) { loadVideo(); v.play && v.play().catch(() => {}); }
  if (v && hasIO) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { loadVideo(); v.play().catch(() => {}); } else v.pause();
    }), { threshold: .35 }).observe(v);
  }
  /* ---------- Disciplinas: tira compacta; la activa muestra su texto real en el epígrafe ---------- */
  if (dl) {
    const its = $$('.dl__it', dl), cap = $('#dl-cap');
    const on = it => {
      its.forEach(x => x.classList.toggle('is-on', x === it));
      if (cap) { const t = $('.dl__t', it).textContent, p = $('.dl__p', it); cap.innerHTML = ''; const b = document.createElement('b'); b.textContent = t; cap.append(b, p ? ' ' + p.textContent : ''); }
    };
    its.forEach(it => { ['mouseenter', 'focus', 'click'].forEach(ev => it.addEventListener(ev, () => on(it))); });
  }
  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();

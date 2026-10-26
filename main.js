(() => {
  window.__cozyAnim = true;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Helpers de animación ---------- */
  // Titulares: cada línea dentro de una máscara (overflow hidden)
  const maskLines = el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((h, i) => `<span class="ln"><span class="ln__i" style="transition-delay:${(i * 0.1).toFixed(2)}s">${h.trim()}</span></span>`).join('');
  };
  // Palabras: envuelve cada palabra de los nodos de texto
  const splitWords = (el, step = 0.05, start = 0) => {
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
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return i;
  };
  // Fallback: sin IntersectionObserver se muestra todo
  const mkIO = opts => hasIO ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); e.target.__io.unobserve(e.target); }
  }), opts) : null;
  const io = mkIO({ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }), io0 = mkIO({ threshold: 0 });
  const watch = el => {
    if (!el) return;
    if (!hasIO) { el.classList.add('is-in'); return; }
    const o = el.closest('.foot') ? io0 : io; el.__io = o; o.observe(el);
  };
  const rv = (el, delay = 0) => { if (!el) return; el.classList.add('rv'); el.style.transitionDelay = delay.toFixed(2) + 's'; };

  /* ---------- Hero (secuencia al cargar) ---------- */
  const hero = $('.hero');
  const heroTitle = $('.hero__title');
  maskLines(heroTitle);
  $$('.ln__i', heroTitle).forEach((l, i) => l.style.transitionDelay = (0.35 + i * 0.12).toFixed(2) + 's');
  rv($('.hero .meta:not(.meta--plain)'), 0.2);
  $$('.hero .meta--plain span').forEach((sp, i) => {
    const inner = document.createElement('span'); inner.textContent = sp.textContent;
    inner.style.transitionDelay = (0.7 + i * 0.1).toFixed(2) + 's';
    sp.textContent = ''; sp.classList.add('mw'); sp.appendChild(inner);
  });
  rv($('.hero__lead'), 0.9);
  $$('.hero__cta .btn').forEach((b, i) => rv(b, 1.0 + i * 0.1));

  /* ---------- Secciones ---------- */
  $$('.sec .h2, .cta__title').forEach(h => {
    maskLines(h);
    const num = h.previousElementSibling && h.previousElementSibling.classList.contains('num') ? h.previousElementSibling : null;
    if (num) { num.classList.add('rv'); num.style.transitionDelay = '0s'; }
    $$('.ln__i', h).forEach((l, i) => l.style.transitionDelay = ((num ? 0.12 : 0) + i * 0.1).toFixed(2) + 's');
    if (num) { const wrap = document.createElement('div'); wrap.className = 'sec__title'; num.before(wrap); wrap.append(num, h); watch(wrap); wrap.style.position = 'relative'; }
    else watch(h);
  });
  // Párrafos, botones y bloques sueltos
  ['.sec__lead', '.about__text > p', '.svc__media', '.cta .label', '.tl__head', '.car__foot'].forEach(sel =>
    $$(sel).forEach((el, i) => { rv(el, sel === '.about__text > p' ? i * 0.1 : 0.15); watch(el); }));
  // Grupos escalonados (izquierda → derecha, filas 0.1s)
  const group = (sel, step = 0.1, centerFirst = false) => $$(sel).forEach(g => {
    const kids = [...g.children];
    let order = kids.map((k, i) => i);
    if (centerFirst) {
      const box = g.getBoundingClientRect(), cx = box.left + box.width / 2;
      const d = kids.map(k => { const r = k.getBoundingClientRect(); return Math.round(Math.abs(r.left + r.width / 2 - cx) / 40) + r.top / 4000; });
      const sorted = [...d].sort((a, b) => a - b);
      order = d.map(v => sorted.indexOf(v));
    }
    kids.forEach((k, i) => rv(k, order[i] * step));
    watch(g);
  });
  group('.stats', 0.1);
  group('.steps', 0.1);
  group('.tl ol', 0.1);
  group('.people', 0.08, true);
  group('.cta__side', 0.1);
  group('.foot__grid', 0.1);
  group('.foot__bar', 0.1);
  rv($('.acc'), 0.1); watch($('.acc'));

  /* ---------- Cita: palabra por palabra ---------- */
  const quote = $('#quote');
  if (quote) {
    const n = splitWords($('p', quote), 0.05, 0.1);
    const after = (0.1 + n * 0.05 + 0.2).toFixed(2) + 's';
    $('.quote__mark', quote).style.transitionDelay = after;
    $('footer', quote).style.transitionDelay = after;
    watch(quote);
  }

  // Arranque: el hero se dispara al cargar
  requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.add('is-loaded'); hero.classList.add('is-in'); }));

  /* ---------- Header + menú ---------- */
  const head = $('#head'), t = $('.head__toggle'), nav = $('#menu');
  const setMenu = o => { t.setAttribute('aria-expanded', String(o)); nav.classList.toggle('is-open', o); };
  t.addEventListener('click', () => setMenu(t.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Scroll: header + parallax ---------- */
  const fig = $('.hero__fig'), qimg = $('.quote__img img');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    head.classList.toggle('is-scrolled', y > 10);
    if (fig && y < innerHeight * 1.3) fig.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
    if (qimg) {
      const r = qimg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) qimg.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px');
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Marquesinas (requestAnimationFrame; dirección y velocidad por fila) ---------- */
  const marquees = $$('.marquee__track').map(el => {
    const row = el.parentElement;
    return { el, row, x: 0, w: 0, dir: +(row.dataset.dir || -1), v: +(row.dataset.speed || 0.045), init: false };
  });
  const measure = () => marquees.forEach(m => {
    const unit = m.el.firstElementChild;
    // Filas de logos: la unidad tiene que cubrir el ancho de la pantalla y se duplica una vez
    if (m.row.classList.contains('marquee--logo')) {
      [...m.el.children].slice(1).forEach(c => c.remove());
      const imgs = [...unit.children], first = imgs[0];
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(first).marginRight || 0);
      if (step > 0) {
        const need = Math.ceil(innerWidth / step) + 1;
        while (unit.children.length > need && unit.children.length > 1) unit.lastElementChild.remove();
        while (unit.children.length < need) unit.appendChild(first.cloneNode(true));
      }
      m.el.appendChild(unit.cloneNode(true));
    }
    m.w = unit.getBoundingClientRect().width;
    if (m.w && !m.init) { m.init = true; m.x = m.dir > 0 ? -m.w * 0.5 : -m.w * 0.25; }
  });
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  $$('.marquee--logo img').forEach(im => im.complete || im.addEventListener('load', measure, { once: true }));
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(64, now - last); last = now;
    marquees.forEach(m => {
      if (!m.w) return;
      m.x += m.dir * dt * m.v; // px por ms
      if (m.x <= -m.w) m.x += m.w;
      if (m.x > 0) m.x -= m.w;
      m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* ---------- Acordeón de disciplinas ---------- */
  const items = $$('.acc__item');
  const hoverable = matchMedia('(hover: hover) and (min-width: 981px)');
  const fit = it => { const p = $('.acc__panel', it); it.style.setProperty('--h', p.scrollHeight + 'px'); };
  const open = it => {
    if (it.classList.contains('is-on')) return;
    items.forEach(x => { const on = x === it; x.classList.toggle('is-on', on); $('.acc__tab', x).setAttribute('aria-expanded', String(on)); });
    fit(it);
  };
  items.forEach(it => {
    const tab = $('.acc__tab', it);
    tab.addEventListener('click', () => open(it));
    tab.addEventListener('focus', () => open(it));
    it.addEventListener('mouseenter', () => { if (hoverable.matches) open(it); });
  });
  const refit = () => { const on = $('.acc__item.is-on'); if (on) fit(on); };
  addEventListener('resize', refit); addEventListener('load', refit); refit();

  /* ---------- #TeamCozy: carrusel continuo (NO se pausa con hover) ---------- */
  const car = $('#car'), track = $('#track');
  if (car && track) {
    const orig = [...track.children], n = orig.length;
    const mk = li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.dataset.clone = '1'; return c; };
    orig.forEach(li => track.appendChild(mk(li)));
    orig.slice().reverse().forEach(li => track.prepend(mk(li)));
    const all = () => [...track.children];
    let idx = n, timer;
    const bio = $('.car__bio'), bn = $('#bio-n'), bs = $('#bio-s'), bt = $('#bio-t');
    const ci = $('#car-i'), bar = $('#car-bar');
    $('#car-n').textContent = String(n).padStart(2, '0');
    const px = v => parseFloat(getComputedStyle(car).getPropertyValue(v));
    const place = anim => {
      const w = px('--w'), gap = px('--gap');
      track.classList.toggle('is-moving', !!anim);
      track.style.transform = `translateX(${(car.clientWidth / 2 - (idx * (w + gap) + w / 2)).toFixed(1)}px)`;
      all().forEach((li, i) => li.classList.toggle('is-active', i === idx));
      const real = ((idx % n) + n) % n, src = orig[real];
      ci.textContent = String(real + 1).padStart(2, '0');
      bar.style.width = ((real + 1) / n * 100) + '%';
      bn.textContent = $('h3', src).textContent;
      bs.textContent = $('.ath__s', src).textContent;
      bt.textContent = $('.ath__t', src).textContent;
      bio.classList.remove('is-swap'); void bio.offsetWidth; bio.classList.add('is-swap');
    };
    const settle = () => {
      if (idx >= 2 * n || idx < n) {
        idx = idx >= 2 * n ? idx - n : idx + n;
        track.classList.remove('is-moving');
        all().forEach(li => li.style.transition = 'none');
        const w = px('--w'), gap = px('--gap');
        track.style.transform = `translateX(${(car.clientWidth / 2 - (idx * (w + gap) + w / 2)).toFixed(1)}px)`;
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
    addEventListener('resize', () => place(false));
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
    const vio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        loadVideo();
        v.play().catch(() => {});
      } else v.pause();
    }), { threshold: .35 });
    vio.observe(v);
  }
  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();

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
    $$('.code, .lead', head).forEach((el, i) => rv(el, i ? 0.25 : 0));
    watch(head);
  });
  // Bloques escalonados
  const group = (sel, step = 0.1) => $$(sel).forEach(g => { [...g.children].forEach((k, i) => rv(k, i * step)); watch(g); });
  group('.about__text', 0.12);
  group('.stats', 0.1);
  group('.svc__list', 0.08);
  group('.steps', 0.12);
  group('.pill', 0.07);
  group('.cta__side', 0.08);
  group('.foot__grid', 0.08);
  // Disciplinas: los nombres y textos entran escalonados
  const dl = $('#dl');
  if (dl) { $$('.dl__it', dl).forEach((el, i) => rv(el, i * 0.07)); watch(dl); }
  ['.svc__fig', '.proc__media', '.quote__img'].forEach(s => $$(s).forEach(el => { rv(el, 0.1); watch(el); }));

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

  /* ---------- #TeamCozy: franja continua (como los artistas/obras de BLUNT) ----------
     Track = deportistas + copia (aria-hidden). Se desplaza a velocidad constante en px/s con transform
     y vuelve a 0 al recorrer un tramo exacto, sin salto. NUNCA se pausa con hover. Se puede arrastrar. */
  const car = $('#car'), track = $('#track');
  if (car && track) {
    const orig = [...track.children];
    orig.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.dataset.clone = '1'; track.appendChild(c); });
    const SPEED = 32; // px por segundo (mismo valor que la franja de BLUNT)
    let L = 0, x = 0, last = performance.now(), drag = null;
    const measure = () => { L = track.children[orig.length].offsetLeft - orig[0].offsetLeft; };
    const wrap = v => L ? ((v % L) + L) % L : 0;
    const paint = () => { track.style.transform = `translate3d(${(-wrap(x)).toFixed(2)}px,0,0)`; };
    const tick = now => {
      const dt = Math.min(64, now - last); last = now;
      if (!drag) x += SPEED * dt / 1000;
      paint(); requestAnimationFrame(tick);
    };
    car.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s: x, on: e.pointerType === 'mouse' };
      if (drag.on) { car.setPointerCapture(e.pointerId); car.classList.add('is-drag'); }
    });
    car.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { drag.on = true; car.setPointerCapture(e.pointerId); car.classList.add('is-drag'); } else return; }
      x = drag.s - dx;
    });
    const end = e => { if (drag && e.pointerId === drag.id) { drag = null; car.classList.remove('is-drag'); } };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => car.addEventListener(ev, end));
    // Las fotos entran desde el costado: se cargan todas cuando la sección se acerca
    const eager = () => $$('img', track).forEach(i => { i.loading = 'eager'; });
    if (hasIO) { const o = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { eager(); o.disconnect(); } }, { rootMargin: '800px 0px' }); o.observe(car); } else eager();
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    requestAnimationFrame(tick);
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
    const its = $$('.dl__it', dl), caps = $$('#dl-cap .dl__c');
    const on = it => {
      const k = its.indexOf(it);
      its.forEach(x => x.classList.toggle('is-on', x === it));
      caps.forEach((c, i) => c.classList.toggle('is-on', i === k));
    };
    its.forEach(it => { ['mouseenter', 'focus', 'click'].forEach(ev => it.addEventListener(ev, () => on(it))); });
  }
  /* ---------- Historia: la línea verde se dibuja con el scroll y enciende cada hito ---------- */
  const tlWrap = $('.tl-wrap');
  if (tlWrap) {
    const tlList = $('.tl', tlWrap), fill = $('.tl__fill', tlWrap), tlItems = $$('.tl__item', tlWrap);
    const dots = tlItems.map(li => $('.tl__dot', li));
    tlList.classList.add('tl-on');
    let tlTick = false;
    const track = $('.tl__track', tlWrap), lastDot = dots[dots.length - 1];
    const wm = $('.hist__wm', tlWrap);
    // La línea termina en el último nodo ("Hoy"); sin JS llega hasta el final de su texto
    const fit = () => {
      const w = tlWrap.getBoundingClientRect(), d = lastDot.getBoundingClientRect();
      track.style.bottom = 'auto';
      track.style.height = Math.round(d.top + d.height / 2 - w.top) + 'px';
    };
    const draw = () => {
      tlTick = false;
      const r = track.getBoundingClientRect(), mark = innerHeight * 0.75;
      // Deriva sutil de la marca de agua (solo transform)
      if (wm) { const w = tlWrap.getBoundingClientRect(); wm.style.setProperty('--wy', ((w.top + w.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px'); }
      const p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      fill.style.setProperty('--p', p.toFixed(4));
      const reach = r.top + p * r.height;
      tlItems.forEach((li, i) => {
        const d = dots[i].getBoundingClientRect();
        li.classList.toggle('is-on', p > 0 && reach >= d.top + d.height / 2 - 1);
      });
    };
    const req = () => { if (!tlTick) { tlTick = true; requestAnimationFrame(draw); } };
    addEventListener('scroll', req, { passive: true });
    const refit = () => { fit(); req(); };
    addEventListener('resize', refit);
    addEventListener('load', refit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    fit(); draw();
  }
  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();

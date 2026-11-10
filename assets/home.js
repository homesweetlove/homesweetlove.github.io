// 홈 화면 동작: 테마·메뉴, 첫 화면 신호 그림, 스크롤 연출, 프로젝트 그림, 연락처 글자 효과
(() => {
  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- 테마 바꾸기 (누른 자리에서 번져 나감) ---------- */
  const themeToggle = $('#theme-toggle');
  let onTheme = () => {};
  themeToggle?.addEventListener('click', () => {
    const current = root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
      onTheme();
    };
    if (document.startViewTransition && !still.matches) {
      const r = themeToggle.getBoundingClientRect();
      root.style.setProperty('--vx', `${r.left + r.width / 2}px`);
      root.style.setProperty('--vy', `${r.top + r.height / 2}px`);
      document.startViewTransition(apply);
    } else apply();
  });
  darkQuery.addEventListener?.('change', () => onTheme());
  new MutationObserver(() => onTheme()).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-skin'] });

  /* ---------- 메뉴 ---------- */
  const nav = $('#nav');
  const navToggle = $('#nav-toggle');
  const mobile = $('#nav-links-mobile');
  const setMenu = open => {
    mobile?.classList.toggle('open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
  };
  navToggle?.addEventListener('click', () => setMenu(!mobile.classList.contains('open')));
  mobile?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 스크롤: 진행 막대, 메뉴 숨김, 단계 선 ---------- */
  const meter = $('#scroll-meter');
  const steps = $('#steps');
  const stepItems = $$('.step', steps || document);
  let lastY = window.scrollY, ticking = false, scrollKick = 0;
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    meter?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (nav) {
      nav.classList.toggle('is-raised', y > 10);
      const menuOpen = mobile?.classList.contains('open');
      if (y > lastY + 4 && y > 240 && !menuOpen) nav.classList.add('is-away');
      else if (y < lastY - 4 || y <= 240) nav.classList.remove('is-away');
    }
    scrollKick = Math.max(scrollKick, clamp(Math.abs(y - lastY) / 70, 0, 1));
    lastY = y;
    if (steps) {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
      steps.style.setProperty('--p', p.toFixed(4));
      stepItems.forEach((el, i) => el.classList.toggle('on', p >= (i * 2 + 1) / (stepItems.length * 2) - 0.12));
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 제목을 낱말 단위로 나눠 올리기 ---------- */
  $$('[data-words]').forEach(h => {
    const text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.textContent = '';
    text.split(/\s+/).forEach((word, i, all) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.append(inner);
      h.append(outer, i < all.length - 1 ? ' ' : '');
    });
  });
  $$('.range dd').forEach(dd => $$('span', dd).forEach((s, k) => s.style.setProperty('--k', k)));

  /* ---------- 화면에 들어올 때 나타나기 ---------- */
  const seen = $$('[data-words], [data-rv], #meter');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        if (entry.target.id === 'meter') countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    seen.forEach(el => io.observe(el));
  } else seen.forEach(el => el.classList.add('in'));

  function countUp(scope) {
    if (still.matches) return;
    $$('[data-count]', scope).forEach(el => {
      const end = Number(el.dataset.count);
      const t0 = performance.now();
      const run = now => {
        const k = clamp((now - t0) / 1300, 0, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(run);
      };
      el.textContent = '0';
      requestAnimationFrame(run);
    });
  }

  /* ---------- 카드: 마우스를 따라오는 빛, 그림 기울기 ---------- */
  if (fine) {
    $$('[data-glow]').forEach(card => {
      const fig = $('.card-fig', card);
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        if (fig && !still.matches) {
          fig.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
          fig.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
        }
      });
      card.addEventListener('pointerleave', () => {
        fig?.style.setProperty('--rx', '0deg');
        fig?.style.setProperty('--ry', '0deg');
      });
    });
    $$('[data-magnet]').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        if (still.matches) return;
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // 카드 그림은 화면에 보이는 동안만 움직입니다.
  if ('IntersectionObserver' in window) {
    const live = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('live', entry.isIntersecting));
    }, { threshold: 0.25 });
    $$('.card').forEach(c => live.observe(c));
  }

  /* ---------- sEMG 카드 그림: 힘을 줬다 푸는 신호 모양 ---------- */
  (function drawSemgCard() {
    const raw = $('#semg-raw'), env = $('#semg-env');
    if (!raw || !env) return;
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const x0 = 16, x1 = 304, mid = 85, n = 190;
    const level = t => 0.06 + 0.9 * Math.exp(-Math.pow((t - 0.3) / 0.11, 2)) + 0.62 * Math.exp(-Math.pow((t - 0.72) / 0.1, 2));
    let d = '', top = '', bottom = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, a = level(t) * 58;
      const y = mid + (rand() * 2 - 1) * a;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      if (i % 5 === 0) {
        top += `${top ? 'L' : 'M'}${x.toFixed(1)} ${(mid - a * 0.72).toFixed(1)}`;
        bottom = `L${x.toFixed(1)} ${(mid + a * 0.72).toFixed(1)}` + bottom;
      }
    }
    raw.setAttribute('d', d);
    env.setAttribute('d', `${top}${bottom}Z`);
  })();

  /* ---------- 연락처 이름: 마우스 가까운 글자가 굵어짐 ---------- */
  (function reachName() {
    const el = $('#reach-name');
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    const chars = [...text].map(ch => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      el.append(s);
      return s;
    });
    const fit = () => {
      el.style.fontSize = '';
      const box = el.parentElement.clientWidth;
      if (el.scrollWidth > box) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * box / el.scrollWidth * 0.98).toFixed(1)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit, { passive: true });
    if (still.matches) return;

    let px = null, visible = false, raf = 0, t0 = performance.now();
    const centers = () => chars.map(c => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; });
    let mids = centers();
    window.addEventListener('resize', () => { mids = centers(); }, { passive: true });
    const frame = now => {
      raf = 0;
      if (!visible) return;
      const width = el.getBoundingClientRect().width || 1;
      chars.forEach((c, i) => {
        let w;
        if (px !== null) {
          const dist = Math.abs(px - mids[i]) / (width * 0.22);
          w = 250 + 550 * Math.exp(-dist * dist);
        } else {
          w = 330 + 210 * (0.5 + 0.5 * Math.sin((now - t0) / 700 - i * 0.55));
        }
        c.style.setProperty('--wg', w.toFixed(0));
      });
      raf = requestAnimationFrame(frame);
    };
    const section = el.closest('section');
    section.addEventListener('pointermove', e => { px = e.clientX; mids = centers(); });
    section.addEventListener('pointerleave', () => { px = null; });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) { mids = centers(); raf = requestAnimationFrame(frame); }
    }).observe(el);
  })();

  /* ---------- 첫 화면: 손 움직임을 근육 신호처럼 그리는 선 ---------- */
  (function signal() {
    const canvas = $('#signal');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const ampText = $('#sig-amp'), ampBar = $('#sig-bar');
    const STEP = 2;            // 표본 하나가 차지하는 가로 길이(px)
    const RATE = 150;          // 1초에 그리는 표본 수
    let W = 0, H = 0, dpr = 1, raw = [], env = [];
    let energy = 0, envelope = 0, touched = false, onScreen = true, tabOpen = !document.hidden, raf = 0;
    let last = performance.now(), carry = 0, shift = 0, demoAt = last + 900, demoUntil = 0;
    let colors = {};

    const readColors = () => {
      const cs = getComputedStyle(document.body);
      colors = {
        trace: cs.getPropertyValue('--trace').trim() || '#ffb547',
        envelope: cs.getPropertyValue('--envelope').trim() || '#6fd6c4',
        grid: cs.getPropertyValue('--border').trim() || '#1e4656',
        bg: cs.getPropertyValue('--bg').trim() || '#08202b',
      };
    };
    onTheme = () => { readColors(); if (still.matches || !raf) draw(); };

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      const n = Math.ceil(W / STEP) + 2;
      while (raw.length < n) { raw.unshift((Math.random() * 2 - 1) * 0.03); env.unshift(0.04); }
      if (raw.length > n) { raw = raw.slice(-n); env = env.slice(-n); }
      if (still.matches) fillStill();
      draw();
    }

    function push() {
      const now = performance.now();
      if (!touched) {            // 아무도 건드리기 전에는 가끔 스스로 힘을 줘서 보여 줍니다.
        if (now > demoAt) { demoUntil = now + 520; demoAt = now + 3600 + Math.random() * 1600; }
        if (now < demoUntil) energy = Math.max(energy, 0.5);
      }
      energy = Math.max(energy, scrollKick);
      scrollKick *= 0.9;
      const noise = (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
      const v = noise * (0.035 + energy * 0.96);
      envelope += (Math.min(1, Math.abs(v) * 2.1) - envelope) * 0.05;
      raw.push(v); env.push(envelope);
      raw.shift(); env.shift();
      energy *= 0.955;
    }

    function fillStill() {       // 움직임을 줄인 환경: 멈춰 있는 한 장면
      let s = 11;
      const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const n = raw.length;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const a = 0.04 + 0.8 * Math.exp(-Math.pow((t - 0.42) / 0.09, 2)) + 0.5 * Math.exp(-Math.pow((t - 0.78) / 0.07, 2));
        raw[i] = (rand() * 2 - 1) * a; env[i] = a * 0.8;
      }
    }

    function draw() {
      const mid = H * 0.5, amp = H * 0.43, n = raw.length;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // 모눈
      ctx.lineWidth = 1; ctx.strokeStyle = colors.grid; ctx.globalAlpha = 0.5;
      ctx.beginPath();
      const gap = 96;
      for (let x = W - (shift % gap); x > 0; x -= gap) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
      for (let k = -2; k <= 2; k++) { const y = Math.round(mid + k * amp * 0.5) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      const xAt = i => W - (n - 1 - i) * STEP;
      // 포락선(신호의 세기를 부드럽게 이은 띠)
      ctx.globalAlpha = 0.16; ctx.fillStyle = colors.envelope;
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.lineTo(xAt(i), mid - env[i] * amp);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(xAt(i), mid + env[i] * amp);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.strokeStyle = colors.envelope; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.lineTo(xAt(i), mid - env[i] * amp);
      ctx.stroke();

      // 원래 신호
      ctx.globalAlpha = 1; ctx.strokeStyle = colors.trace; ctx.lineWidth = 1.25; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.lineTo(xAt(i), mid + raw[i] * amp);
      ctx.stroke();

      // 펜 끝
      const y = mid + raw[n - 1] * amp;
      ctx.fillStyle = colors.trace;
      ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.arc(W - 1, y, 12, 0, 6.3); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(W - 1, y, 3.5, 0, 6.3); ctx.fill();
    }

    let shown = -1;
    function loop(now) {
      raf = 0;
      if (!onScreen || !tabOpen || still.matches) return;
      const dt = Math.min(now - last, 80); last = now;
      carry += dt * RATE / 1000;
      let pushed = 0;
      while (carry >= 1 && pushed < 24) { push(); carry -= 1; pushed++; }
      shift += pushed * STEP;
      draw();
      const v = Math.round(envelope * 100);
      if (v !== shown) {
        shown = v;
        if (ampText) ampText.textContent = (v / 100).toFixed(2);
        ampBar?.style.setProperty('--v', (v / 100).toFixed(2));
      }
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!raf && onScreen && tabOpen && !still.matches) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    // 손 움직임 → 신호의 세기
    let px = 0, py = 0, pt = 0;
    window.addEventListener('pointermove', e => {
      const now = performance.now();
      if (pt) {
        const speed = Math.hypot(e.clientX - px, e.clientY - py) / Math.max(now - pt, 1); // px/ms
        if (speed > 0.05) touched = true;
        energy = Math.max(energy, clamp(speed / 2.4, 0, 1));
      }
      px = e.clientX; py = e.clientY; pt = now;
    }, { passive: true });
    window.addEventListener('pointerdown', () => { touched = true; energy = Math.max(energy, 0.7); }, { passive: true });

    readColors();
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; start(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { tabOpen = !document.hidden; start(); });
    still.addEventListener?.('change', () => { if (still.matches) { fillStill(); draw(); } else start(); });
    if (still.matches) {
      if (ampText) ampText.textContent = '0.64';
      ampBar?.style.setProperty('--v', '0.64');
    }
    start();
  })();
})();

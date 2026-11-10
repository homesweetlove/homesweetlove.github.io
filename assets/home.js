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

  /* ---------- 연락: 이메일 주소 복사 ---------- */
  (function copyMail() {
    const btn = $('#copy-mail');
    if (!btn) return;
    const label = $('span', btn), note = $('#copy-note');
    const idle = label.textContent;
    let timer = 0;
    btn.addEventListener('click', async () => {
      const mail = btn.dataset.mail;
      let ok = false;
      try { await navigator.clipboard.writeText(mail); ok = true; } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = mail; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
        document.body.append(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
      if (!ok) { location.href = `mailto:${mail}`; return; }
      label.textContent = btn.dataset.done;
      btn.classList.add('done');
      if (note) note.textContent = btn.dataset.done;
      clearTimeout(timer);
      timer = setTimeout(() => { label.textContent = idle; btn.classList.remove('done'); if (note) note.textContent = ''; }, 2000);
    });
  })();

  /* ---------- 첫 화면: 부드럽게 흐르는 선 다발 ---------- */
  (function flow() {
    const canvas = $('#flow');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const host = canvas.parentElement;
    const LINES = 40;
    let W = 0, H = 0, dpr = 1, raf = 0, onScreen = true, tabOpen = !document.hidden;
    let grad = null, dark = true, t = 0, last = performance.now();
    let px = 0, py = 0, tx = 0, ty = 0, near = 0, nearTo = 0, boost = 0;

    const paint = () => {
      const cs = getComputedStyle(document.body);
      const a = cs.getPropertyValue('--trace').trim() || '#ffb547';
      const b = cs.getPropertyValue('--envelope').trim() || '#6fd6c4';
      grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, a); grad.addColorStop(0.55, a); grad.addColorStop(1, b);
      const m = /^#?([0-9a-f]{6})$/i.exec(cs.getPropertyValue('--bg').trim());
      if (m) { const n = parseInt(m[1], 16); dark = ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 128; }
    };
    onTheme = () => { paint(); if (!raf) draw(); };

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      paint(); draw();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      ctx.strokeStyle = grad; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
      const narrow = W < 760;
      const cy = H * (narrow ? 0.86 : 0.74);
      const spread = H * (narrow ? 0.2 : 0.36);
      const swing = H * (narrow ? 0.05 : 0.085) * (1 + boost * 0.9);
      const reach = Math.max(140, W * 0.14);
      const stepX = narrow ? 6 : 8;
      for (let j = 0; j < LINES; j++) {
        const u = j / (LINES - 1), c = u - 0.5;
        ctx.globalAlpha = (dark ? 0.5 : 0.62) * (0.35 + 0.65 * (1 - Math.abs(c) * 1.6));
        ctx.beginPath();
        for (let x = -stepX; x <= W + stepX; x += stepX) {
          const k = clamp(x / W, 0, 1);
          const open = k * k * (3 - 2 * k);                       // 왼쪽은 모이고 오른쪽으로 갈수록 펼쳐짐
          let y = cy + c * spread * (0.12 + 0.88 * open)
            + swing * (0.3 + 0.7 * open) * (
                Math.sin(x * 0.0042 + t * 0.55 + u * 2.4) * 0.55 +
                Math.sin(x * 0.0019 - t * 0.34 + u * 4.2) * 0.45 +
                Math.sin(x * 0.0093 + t * 0.8 - u * 1.3) * 0.12);
          if (near > 0.01) {                                       // 마우스 근처에서 선이 벌어지며 따라옴
            const d = (x - px) / reach, g = Math.exp(-d * d) * near;
            y += g * ((py - y) * 0.22 + c * 150);
          }
          if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      raf = 0;
      if (!onScreen || !tabOpen || still.matches) return;
      const dt = Math.min(now - last, 60) / 1000; last = now;
      boost = Math.max(boost * 0.94, scrollKick); scrollKick *= 0.9;
      t += dt * (1 + boost * 2.2);
      px += (tx - px) * 0.08; py += (ty - py) * 0.08; near += (nearTo - near) * 0.06;
      draw();
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!raf && onScreen && tabOpen && !still.matches) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    if (fine) {
      host.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!nearTo) { px = tx; py = ty; }
        nearTo = 1;
      }, { passive: true });
      host.addEventListener('pointerleave', () => { nearTo = 0; });
    }

    t = 2.4;
    resize();
    window.addEventListener('resize', resize, { passive: true });
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; start(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { tabOpen = !document.hidden; start(); });
    still.addEventListener?.('change', () => { if (still.matches) draw(); else start(); });
    start();
  })();
})();

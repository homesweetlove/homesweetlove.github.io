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

  /* ---------- 스크롤: 첫 화면이 물러나고, 문장이 낱말씩 켜짐 ---------- */
  const top = $('.top');
  const say = $('#say');
  let sayWords = [];
  if (say) {
    const text = say.textContent.trim();
    say.setAttribute('aria-label', text);
    say.textContent = '';
    sayWords = text.split(/\s+/).map((word, i, all) => {
      const w = document.createElement('span');
      w.className = 'sw';
      w.setAttribute('aria-hidden', 'true');
      w.textContent = word;
      say.append(w, i < all.length - 1 ? ' ' : '');
      return w;
    });
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    nav?.classList.toggle('is-raised', y > 10);
    if (top && !still.matches) top.style.setProperty('--hs', clamp(y / (top.offsetHeight * 0.75), 0, 1).toFixed(3));
    if (sayWords.length) {
      const r = say.getBoundingClientRect();
      const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.4), 0, 1);
      const n = Math.round(p * sayWords.length * 1.06);
      sayWords.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 첫 화면 빛: 마우스를 살짝 따라옴 ---------- */
  if (top && fine && !still.matches) {
    top.addEventListener('pointermove', e => {
      const r = top.getBoundingClientRect();
      top.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width - 0.5) * 90).toFixed(1)}px`);
      top.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height - 0.5) * 60).toFixed(1)}px`);
    }, { passive: true });
  }

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
    }, { threshold: 0.04, rootMargin: '0px 0px -8% 0px' });
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
})();

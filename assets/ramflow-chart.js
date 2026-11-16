// RamFlow 실측 그래프: 사진 대신 페이지 안에서 직접 그립니다.
// 자료: homesweetlove/RamFlow docs/evidence/2026-11-10-real-apps (trials.csv, summary.json)
// 각 값은 30회 작업의 p95(밀리초), 배열 순서 = 세션(블록) 1~5. 중앙값·감소율은 summary.json 값 그대로.
(function () {
  const root = document.getElementById('rf-chart');
  if (!root) return;

  const L = window.i18n ? window.i18n.lang : 'ko';
  const T = (ko, en) => (L === 'en' ? en : ko);

  const DATA = [
    { name: T('Chrome 검색', 'Chrome search'), path: T('입력 → 화면 반영', 'Input to screen update'),
      off: [118.2, 79.1, 94.9, 88.1, 80.5], on: [50.4, 48.1, 45.9, 52.1, 47.8], offMed: 88.1, onMed: 48.1, drop: 45 },
    { name: T('Chrome 정렬', 'Chrome sort'), path: T('클릭 → 화면 반영', 'Click to screen update'),
      off: [101.3, 80.9, 90.6, 88.6, 78.6], on: [47.5, 50.8, 48.1, 53.4, 49.0], offMed: 88.6, onMed: 49.0, drop: 45 },
    { name: T('VS Code 코드 완성', 'VS Code completion'), path: T('편집 → 완성 목록', 'Edit to suggestions'),
      off: [98.6, 119.7, 111.4, 86.3, 99.4], on: [55.5, 50.5, 46.7, 47.1, 54.4], offMed: 99.4, onMed: 50.5, drop: 49 },
    { name: T('VS Code 저장', 'VS Code save'), path: T('편집 → 저장 완료', 'Edit to saved'),
      off: [62.5, 83.8, 49.2, 47.6, 63.9], on: [31.1, 30.4, 31.6, 32.3, 47.1], offMed: 62.5, onMed: 31.6, drop: 49 },
  ];

  const MAX = 125;            // 세로축 위 끝(ms)
  const TICKS = [0, 50, 100];
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = v => v.toFixed(1);
  const pct = (a, b) => Math.round((1 - b / a) * 100);

  const grid = root.querySelector('.rf-grid');
  const panels = DATA.map((d, i) => {
    const el = document.createElement('div');
    el.className = 'rf-panel';
    el.tabIndex = 0;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', T(
      `${d.name}: 끔 중앙값 ${fmt(d.offMed)}ms, 켬 중앙값 ${fmt(d.onMed)}ms, ${d.drop}% 감소. 화살표 키로 세션별 값을 볼 수 있습니다.`,
      `${d.name}: median ${fmt(d.offMed)} ms off, ${fmt(d.onMed)} ms on, ${d.drop}% lower. Use arrow keys to step through sessions.`));
    el.innerHTML =
      `<div class="rf-top"><p class="rf-name">${d.name}<small>${d.path}</small></p>` +
      `<p class="rf-drop"><em>−${d.drop}%</em></p></div>` +
      `<div class="rf-plot"><svg aria-hidden="true"></svg><div class="rf-tip" hidden></div></div>`;
    grid.append(el);
    return { el, d, i, svg: el.querySelector('svg'), tip: el.querySelector('.rf-tip'), active: -1 };
  });

  function node(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  }

  function draw(p) {
    const { svg, d, i } = p;
    const w = Math.max(120, Math.round(svg.parentNode.clientWidth));
    const h = w < 170 ? 170 : 200;
    const narrow = w < 190;            // 좁으면 세로축 숫자를 빼고 격자선만 남김
    const padT = 14, padB = 28, padL = narrow ? 4 : 26;
    const y = v => padT + (1 - v / MAX) * (h - padT - padB);
    const inner = w - padL;
    const xOff = padL + inner * (narrow ? 0.32 : 0.27), xOn = padL + inner * (narrow ? 0.66 : 0.73);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.textContent = '';
    p.geo = { xOff, xOn, y, w, h };

    const defs = node('defs', {}, svg);
    const g = node('linearGradient', { id: `rf-g${i}`, gradientUnits: 'userSpaceOnUse', x1: xOff, x2: xOn, y1: 0, y2: 0 }, defs);
    node('stop', { offset: '0', 'stop-color': '#8e8e93' }, g);
    node('stop', { offset: '1', 'stop-color': '#0a84ff' }, g);

    const axis = node('g', { class: 'rf-axis' }, svg);
    TICKS.forEach(t => {
      node('line', { x1: padL, x2: w, y1: y(t), y2: y(t), class: t ? 'rf-gl' : 'rf-base' }, axis);
      if (narrow) return;
      const tx = node('text', { x: padL - 6, y: y(t), dy: '0.32em', 'text-anchor': 'end' }, axis);
      tx.textContent = t;
    });
    [[xOff, T('끔', 'Off')], [xOn, T('켬', 'On')]].forEach(([x, s]) => {
      const tx = node('text', { x, y: h - 8, 'text-anchor': 'middle', class: 'rf-xl' }, axis);
      tx.textContent = s;
    });

    const pairs = node('g', { class: 'rf-pairs' }, svg);
    p.pairs = d.off.map((v, k) => {
      const gp = node('g', { class: 'rf-pair', style: `--k:${k}` }, pairs);
      node('line', { x1: xOff, y1: y(v), x2: xOn, y2: y(d.on[k]), stroke: `url(#rf-g${i})`, class: 'rf-link', pathLength: 1 }, gp);
      node('circle', { cx: xOff, cy: y(v), r: 4.5, class: 'rf-dot rf-off' }, gp);
      node('circle', { cx: xOn, cy: y(d.on[k]), r: 4.5, class: 'rf-dot rf-on' }, gp);
      return gp;
    });

    // 5회 중앙값: 굵은 가로 막대 + 숫자
    const med = node('g', { class: 'rf-med' }, svg);
    const bw = Math.min(26, inner * 0.16);
    node('line', { x1: xOff - bw / 2, x2: xOff + bw / 2, y1: y(d.offMed), y2: y(d.offMed) }, med);
    node('line', { x1: xOn - bw / 2, x2: xOn + bw / 2, y1: y(d.onMed), y2: y(d.onMed) }, med);
    const a = node('text', { x: xOff - bw / 2 - 5, y: y(d.offMed), dy: '0.32em', 'text-anchor': 'end' }, med);
    a.textContent = fmt(d.offMed);
    const b = node('text', { x: xOn + bw / 2 + 5, y: y(d.onMed), dy: '0.32em', 'text-anchor': 'start' }, med);
    b.textContent = fmt(d.onMed);

    if (p.active > -1) focus(p, p.active);
  }

  function focus(p, k) {
    p.active = k;
    p.el.classList.toggle('is-focus', k > -1);
    p.pairs.forEach((gp, j) => gp.classList.toggle('on', j === k));
    if (k < 0) { p.tip.hidden = true; return; }
    const { d, geo } = p;
    const off = d.off[k], on = d.on[k];
    p.tip.innerHTML =
      `<b>${T('세션', 'Session')} ${k + 1}</b>` +
      `<span>${T('끔', 'Off')} ${fmt(off)} → ${T('켬', 'On')} ${fmt(on)} ms</span>` +
      `<em>−${pct(off, on)}%</em>`;
    p.tip.hidden = false;
    const top = Math.min(geo.y(off), geo.y(on));
    p.tip.style.left = `${(geo.xOff + geo.xOn) / 2}px`;
    p.tip.style.top = `${Math.max(0, top - 4)}px`;
  }

  function nearest(p, ev) {
    const r = p.svg.getBoundingClientRect();
    const mx = ev.clientX - r.left, my = ev.clientY - r.top;
    const { xOff, xOn, y } = p.geo;
    const t = Math.min(1, Math.max(0, (mx - xOff) / (xOn - xOff)));
    let best = -1, dist = Infinity;
    p.d.off.forEach((v, k) => {
      const ly = y(v) + (y(p.d.on[k]) - y(v)) * t;
      const dd = Math.abs(ly - my);
      if (dd < dist) { dist = dd; best = k; }
    });
    return dist < 26 ? best : -1;
  }

  panels.forEach(p => {
    draw(p);
    p.svg.addEventListener('pointermove', ev => { const k = nearest(p, ev); if (k !== p.active) focus(p, k); });
    p.svg.addEventListener('pointerdown', ev => focus(p, nearest(p, ev)));
    p.el.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') focus(p, -1); });
    p.el.addEventListener('keydown', ev => {
      const n = p.d.off.length;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') focus(p, (p.active + 1) % n);
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') focus(p, (p.active - 1 + n) % n);
      else if (ev.key === 'Escape') focus(p, -1);
      else return;
      ev.preventDefault();
    });
    p.el.addEventListener('blur', () => focus(p, -1));
  });

  if ('ResizeObserver' in window) {
    let last = 0;
    new ResizeObserver(() => {
      const w = grid.clientWidth;
      if (w === last) return;
      last = w;
      panels.forEach(draw);
    }).observe(grid);
  } else window.addEventListener('resize', () => panels.forEach(draw));

  // 숫자 표 (그래프를 볼 수 없거나 숫자를 직접 확인하려는 사람용)
  const table = root.querySelector('.rf-table table');
  if (table) {
    const head = `<thead><tr><th scope="col">${T('작업', 'Task')}</th><th scope="col"><span class="rf-sr">${T('상태', 'State')}</span></th>` +
      [1, 2, 3, 4, 5].map(n => `<th scope="col">${T('세션', 'S')} ${n}</th>`).join('') +
      `<th scope="col">${T('중앙값', 'Median')}</th></tr></thead>`;
    const rows = DATA.map(d =>
      `<tr><th scope="row" rowspan="2">${d.name}</th><td class="rf-cond">${T('끔', 'Off')}</td>${d.off.map(v => `<td>${fmt(v)}</td>`).join('')}<td>${fmt(d.offMed)}</td></tr>` +
      `<tr class="rf-r-on"><td class="rf-cond">${T('켬', 'On')}</td>${d.on.map(v => `<td>${fmt(v)}</td>`).join('')}<td>${fmt(d.onMed)} <em>−${d.drop}%</em></td></tr>`).join('');
    table.innerHTML = head + `<tbody>${rows}</tbody>`;
  }

  // 화면에 들어오면 한 번만 선을 그립니다
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      root.classList.add('in');
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(root);
  } else root.classList.add('in');
})();

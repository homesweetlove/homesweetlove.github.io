// 퇴근 · 급여 카운터 — watches today's pay grow in real time and counts down to leaving work.
(function () {
  const $ = id => document.getElementById(id);
  const panel = $('tool-payday');
  if (!panel) return;

  const STORE_KEY = 'payday-settings';
  const MONTH_HOURS = 209; // 주 40시간 + 주휴 기준 월 소정근로시간
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const defaults = { type: 'monthly', amount: 3000000, start: '09:00', end: '18:00', lunchStart: '12:00', lunchMinutes: 60, days: [1, 2, 3, 4, 5] };

  const els = {
    status: $('pay-status'), earned: $('pay-earned'), remain: $('pay-remain'), remainLabel: $('pay-remain-label'),
    bar: $('pay-bar'), barLabel: $('pay-bar-label'), hourly: $('pay-hourly'), perMinute: $('pay-minute'),
    perSecond: $('pay-second'), dayTotal: $('pay-day-total'), type: $('pay-type'), amount: $('pay-amount'),
    start: $('pay-start'), end: $('pay-end'), lunchStart: $('pay-lunch-start'), lunch: $('pay-lunch'),
    days: $('pay-days'), amountHint: $('pay-amount-hint'),
  };

  function load() {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { return { ...defaults }; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch { /* private mode: keep in memory */ }
  }
  let settings = load();

  const won = (n, digits = 0) => `₩${n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  const toMinutes = hhmm => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const pad = n => String(n).padStart(2, '0');
  const clock = secs => { secs = Math.max(0, Math.floor(secs)); return `${pad(Math.floor(secs / 3600))}:${pad(Math.floor(secs % 3600 / 60))}:${pad(secs % 60)}`; };

  function hourlyRate() {
    const amount = Number(settings.amount) || 0;
    if (settings.type === 'hourly') return amount;
    if (settings.type === 'yearly') return amount / 12 / MONTH_HOURS;
    return amount / MONTH_HOURS;
  }

  // Work schedule for today, in seconds since midnight.
  function schedule() {
    const start = toMinutes(settings.start) * 60;
    let end = toMinutes(settings.end) * 60;
    if (end <= start) end += 24 * 3600; // overnight shift
    const lunchStart = toMinutes(settings.lunchStart) * 60;
    const lunchEnd = lunchStart + (Number(settings.lunchMinutes) || 0) * 60;
    const lunchInside = settings.lunchMinutes > 0 && lunchStart >= start && lunchEnd <= end;
    const workSeconds = (end - start) - (lunchInside ? lunchEnd - lunchStart : 0);
    return { start, end, lunchStart, lunchEnd, lunchInside, workSeconds };
  }

  function workedSeconds(now, s) {
    const t = Math.min(Math.max(now, s.start), s.end);
    let worked = t - s.start;
    if (s.lunchInside) worked -= Math.max(0, Math.min(t, s.lunchEnd) - s.lunchStart);
    return Math.max(0, worked);
  }

  const baseTitle = document.title;
  let celebratedOn = '';
  function tick() {
    const date = new Date();
    const now = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
    const s = schedule();
    const rate = hourlyRate();
    const perSecond = rate / 3600;
    const dayTotal = perSecond * s.workSeconds;
    const workday = settings.days.includes(date.getDay());

    els.hourly.textContent = won(Math.round(rate));
    els.perMinute.textContent = won(perSecond * 60, 1);
    els.perSecond.textContent = won(perSecond, 2);
    els.dayTotal.textContent = won(Math.round(dayTotal));

    let status, remain, remainLabel, progress, earned;
    if (!workday) {
      status = `오늘(${DAY_NAMES[date.getDay()]})은 쉬는 날 🛋️`;
      earned = 0; progress = 0; remainLabel = '출근까지'; remain = null;
    } else if (now < s.start) {
      status = '출근 전 ☕';
      earned = 0; progress = 0; remainLabel = '출근까지'; remain = s.start - now;
    } else if (now >= s.end) {
      status = '퇴근! 오늘도 수고했어요 🎉';
      earned = dayTotal; progress = 1; remainLabel = '퇴근까지'; remain = 0;
      const today = date.toDateString();
      if (celebratedOn !== today && panel.classList.contains('is-active')) { celebratedOn = today; confetti(); }
    } else {
      const worked = workedSeconds(now, s);
      earned = worked * perSecond;
      progress = s.workSeconds ? worked / s.workSeconds : 0;
      remainLabel = '퇴근까지'; remain = s.end - now;
      const inLunch = s.lunchInside && now >= s.lunchStart && now < s.lunchEnd;
      status = inLunch ? '점심시간 🍚 (돈은 잠깐 멈춤)' : progress > 0.85 ? '퇴근 임박 🏃' : progress > 0.5 ? '근무 중 · 반 넘었다 💪' : '근무 중 💼';
    }

    els.status.textContent = status;
    els.earned.textContent = won(earned, 2);
    els.remainLabel.textContent = remainLabel;
    els.remain.textContent = remain == null ? '—' : clock(remain);
    els.bar.style.width = `${(progress * 100).toFixed(2)}%`;
    els.barLabel.textContent = `${Math.floor(progress * 100)}%`;
    if (panel.classList.contains('is-active')) {
      document.title = remain ? `${won(Math.floor(earned))} · 퇴근까지 ${clock(remain).slice(0, 5)}` : `${won(Math.floor(earned))} · 업무 도구`;
    } else if (document.title.startsWith('₩')) {
      document.title = baseTitle;
    }
  }

  // ---- settings form ----
  function fillForm() {
    els.type.value = settings.type;
    els.amount.value = settings.amount;
    els.start.value = settings.start;
    els.end.value = settings.end;
    els.lunchStart.value = settings.lunchStart;
    els.lunch.value = String(settings.lunchMinutes);
    els.days.querySelectorAll('input').forEach(box => { box.checked = settings.days.includes(Number(box.value)); });
    updateHint();
  }
  function updateHint() {
    const labels = { hourly: '시급 (원)', monthly: '월급 (원, 세전)', yearly: '연봉 (원, 세전)' };
    els.amountHint.textContent = labels[settings.type];
  }
  function readForm() {
    settings = {
      type: els.type.value,
      amount: Math.max(0, Number(String(els.amount.value).replace(/[^\d.]/g, '')) || 0),
      start: els.start.value || defaults.start,
      end: els.end.value || defaults.end,
      lunchStart: els.lunchStart.value || defaults.lunchStart,
      lunchMinutes: Number(els.lunch.value) || 0,
      days: [...els.days.querySelectorAll('input:checked')].map(box => Number(box.value)),
    };
    updateHint();
    save();
    tick();
  }
  panel.querySelectorAll('.payday-settings input, .payday-settings select').forEach(el => el.addEventListener('input', readForm));
  $('pay-reset').addEventListener('click', () => { settings = { ...defaults }; save(); fillForm(); tick(); });

  // ---- tiny confetti ----
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'payday-confetti';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const W = canvas.width = innerWidth, H = canvas.height = innerHeight;
    const colors = ['#7b55d6', '#e87963', '#42a884', '#ffd166', '#00c2d1'];
    const bits = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 3, c: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * Math.PI }));
    let frame = 0;
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      bits.forEach(b => { b.vy += .35; b.x += b.vx; b.y += b.vy; b.a += .2; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.fillStyle = b.c; ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * .6); ctx.restore(); });
      if (++frame < 150) requestAnimationFrame(draw); else canvas.remove();
    })();
  }
  $('pay-celebrate').addEventListener('click', confetti);

  fillForm();
  tick();
  setInterval(tick, 100);

  // Expose for the portfolio terminal's `퇴근` command (same settings in localStorage).
  window.payday = { settings: () => settings, schedule, hourlyRate };
})();

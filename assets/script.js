// ---- i18n ----
const t = (ko, vars) => (window.i18n ? window.i18n.t(ko, vars) : ko);
const IS_EN = window.i18n && window.i18n.lang === 'en';
window.i18n && window.i18n.add({
  '오타쿠가 세상을 지배한다': 'Otaku will rule the world',
  '다시 누르면 새로 섞어요': 'Click again to reshuffle',
  '✨ 추천': '✨ Picks',
  '기타': 'Other',
  '실험적인': 'Experimental',
  '{lang} 프로젝트': '{lang} project',
  '{name} 저장소 업데이트': 'Updated {name}',
  '공개 저장소 <strong>{n}개</strong>를 언어별로 모두 볼 수 있어요. 원본은 <a href="{url}" target="_blank" rel="noopener">GitHub 프로필</a>에서도 확인할 수 있어요.':
    'Browse all <strong>{n}</strong> public repositories by language right here, or on my <a href="{url}" target="_blank" rel="noopener">GitHub profile</a>.',
  '{m}월': '{mon}',
  '기여 {n}회': '{n} contributions',
  '기여 없음': 'No contributions',
  '월': 'Mon', '수': 'Wed', '금': 'Fri',
  '{n}회': '{n}',
  '{n}일': '{n} days',
  '{date} · {n}회': '{date} · {n}',
});
// English descriptions for repos whose GitHub description is Korean or empty.
const REPO_EN = {
  'antigravity-korean-langpack': 'Korean language pack & UI translation patcher for Antigravity IDE',
  'ClaudeCodexUsageWidget': 'Desktop widget showing Claude Code / Codex usage',
  'open_web_mail': 'Webmail UI prototype in a Neo Kinpaku style',
  'payroll-manager': 'Payroll calculator from attendance logs, with pay slips',
  'paper-assistant': 'Offline writing checker for Korean papers and reports',
  'wading': 'Digital wedding invitation with a different experience per theme',
  'happyday': 'Mobile birthday greeting site with a surprise gift',
  'Daily_IT_News': 'Daily IT & security news briefings (in Korean)',
  'dcu_community_crawling': 'Notice-board crawler for a university website',
  'java_archive': 'Java desktop app that suggests random class timetables',
  'macos_dis': 'macOS-inspired Rainmeter desktop skin for Windows',
  'syspro': 'Systems programming course labs',
  'homesweetlove.github.io': 'This site — portfolio, work tools and an HWP editor',
};
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- theme toggle ----
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ---- mobile nav ----
const navToggle = document.getElementById('nav-toggle');
const navLinksMobile = document.getElementById('nav-links-mobile');
navToggle.addEventListener('click', () => {
  navLinksMobile.classList.toggle('open');
});
navLinksMobile.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinksMobile.classList.remove('open'))
);

// ---- typing effect ----
const roles = ['TypeScript Developer', 'Java', 'GitHub Explorer', t('오타쿠가 세상을 지배한다')];
const typeTarget = document.getElementById('type-target');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typeTarget.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typeTarget.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 40 : 80);
}
typeLoop();

// ---- count-up stats ----
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ---- footer year ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- nav background on scroll (subtle shadow) ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
});

// ---- scroll reveal ----
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function revealize(el) {
  if (prefersReducedMotion) return;
  el.classList.add('reveal');
  revealObserver.observe(el);
}

document.querySelectorAll(
  '.stat-card, .skill-group, .contrib-card, .news-card, .about-text, .bio-quote'
).forEach(revealize);

// ---- project card tilt ----
function addTilt(card) {
  if (prefersReducedMotion) return;
  const damp = 10;
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -damp;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * damp;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}

// ---- project filters ----
const PICK_COUNT = 6;
let pickedNames = new Set();

function applyFilter(key) {
  document.querySelectorAll('#project-grid .project-card').forEach(card => {
    const match = key === 'all'
      || (key === 'pick' ? card.dataset.pick === '1' : card.dataset.lang === key);
    card.classList.toggle('is-hidden', !match);
  });
  // picks are ordered by data-order; languages keep push order
  const grid = document.getElementById('project-grid');
  const cards = [...grid.querySelectorAll('.project-card')];
  cards.sort((x, y) => key === 'pick'
    ? Number(x.dataset.pickOrder || 999) - Number(y.dataset.pickOrder || 999)
    : Number(x.dataset.order) - Number(y.dataset.order));
  cards.forEach(card => grid.appendChild(card));
}

function initFilters(groups, totalCount) {
  const bar = document.getElementById('project-filters');
  bar.innerHTML = '';
  const addPill = (key, label, count, active = false) => {
    const btn = document.createElement('button');
    btn.className = `filter-pill${active ? ' is-active' : ''}`;
    btn.dataset.lang = key;
    btn.innerHTML = `${escapeHtml(label)}${count != null ? ` <span class="pill-count">${count}</span>` : ''}`;
    if (key === 'pick') btn.title = t('다시 누르면 새로 섞어요');
    bar.appendChild(btn);
  };
  addPill('pick', t('✨ 추천'), null, true);
  groups.forEach(g => addPill(g.key, g.label, g.count));

  bar.onclick = (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    const key = btn.dataset.lang;
    if (key === 'pick' && btn.classList.contains('is-active') && window.__projectRepos) {
      renderProjects(window.__projectRepos, true); // reshuffle the random part
      return;
    }
    bar.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    applyFilter(key);
  };
  const more = document.getElementById('projects-more');
  if (more) more.innerHTML = t('공개 저장소 <strong>{n}개</strong>를 언어별로 모두 볼 수 있어요. 원본은 <a href="{url}" target="_blank" rel="noopener">GitHub 프로필</a>에서도 확인할 수 있어요.', { n: totalCount, url: `https://github.com/${GH_USER}?tab=repositories` });
}

function pickRecommended(repos) {
  const hasDemo = r => demoLink(r) !== '';
  const self = r => r.name === `${GH_USER}.github.io`;
  const demos = repos.filter(r => hasDemo(r) && !self(r));
  const rest = repos.filter(r => !hasDemo(r) && !self(r));
  // prefer described repos, then shuffle
  const shuffled = rest.map(r => ({ r, k: Math.random() + (r.description ? 0 : 1) }))
    .sort((x, y) => x.k - y.k).map(x => x.r);
  return [...demos, ...shuffled].slice(0, Math.max(PICK_COUNT, demos.length));
}

function initProjectCards() {
  document.querySelectorAll('#project-grid .project-card').forEach((card, i) => {
    addTilt(card);
    card.style.transitionDelay = `${Math.min(i, 6) * 40}ms`;
    revealize(card);
  });
}
initProjectCards();

// ---- live GitHub data ----
const GH_USER = 'homesweetlove';
const LANG_META = {
  typescript: { emoji: '🧩', c1: '#3178c6', c2: '#00d4ff' },
  javascript: { emoji: '⚡', c1: '#f7df1e', c2: '#ffa66c' },
  java: { emoji: '☕', c1: '#ffd166', c2: '#ff7a7a' },
  python: { emoji: '🐍', c1: '#3776ab', c2: '#ffd43b' },
  html: { emoji: '📄', c1: '#e34f26', c2: '#f9a03c' },
  css: { emoji: '🎨', c1: '#1572b6', c2: '#8ec5fc' },
  default: { emoji: '📦', c1: '#7c6cff', c2: '#00d4ff' },
};

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// Repos whose Website field points at a deployment that is currently broken.
// Remove a name here once its demo works again.
const DEMO_HIDDEN = new Set(['payroll-manager', 'open_web_mail']);

function demoLink(repo) {
  if (DEMO_HIDDEN.has(repo.name)) return '';
  const url = (repo.homepage || '').trim();
  if (!/^https:\/\//i.test(url)) return '';
  if (repo.name === `${GH_USER}.github.io` || url.replace(/\/+$/, '') === location.origin) return ''; // this site itself
  return `<a class="demo-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Demo ↗</a>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderProjects(repos, reshuffle = false) {
  window.__projectRepos = repos;
  const grid = document.getElementById('project-grid');
  const picks = pickRecommended(repos);
  const pickOrder = new Map(picks.map((r, i) => [r.name, i]));
  grid.innerHTML = repos.map((repo, order) => {
    const langKey = repo.language ? repo.language.toLowerCase() : 'etc';
    const meta = LANG_META[langKey] || LANG_META.default;
    const desc = (IS_EN && REPO_EN[repo.name]) || repo.description || t('{lang} 프로젝트', { lang: repo.language || t('실험적인') });
    const picked = pickOrder.has(repo.name);
    return `
      <article class="project-card${picked ? '' : ' is-hidden'}" data-lang="${langKey}" data-order="${order}"${picked ? ` data-pick="1" data-pick-order="${pickOrder.get(repo.name)}"` : ''}>
        <div class="project-thumb" style="--c1:${meta.c1};--c2:${meta.c2};">${meta.emoji}</div>
        <div class="project-body">
          <h3>${escapeHtml(repo.name)}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="tags">
            <span>${escapeHtml(repo.language || t('기타'))}</span>
            ${demoLink(repo) ? '<span class="tag-demo">Live</span>' : ''}
            ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
          </div>
          <div class="project-links">
            ${demoLink(repo)}<a href="${repo.html_url}" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>`;
  }).join('');
  applyFilter('pick');

  if (!reshuffle) {
    const counts = new Map();
    repos.forEach(r => {
      const key = r.language ? r.language.toLowerCase() : 'etc';
      const label = r.language || t('기타');
      const g = counts.get(key) || { key, label, count: 0 };
      g.count++;
      counts.set(key, g);
    });
    const groups = [...counts.values()].sort((x, y) => (x.key === 'etc') - (y.key === 'etc') || y.count - x.count || x.label.localeCompare(y.label));
    initFilters(groups, repos.length);
  }
  initProjectCards();
}

function renderActivity(repos) {
  const list = document.getElementById('activity-list');
  const recent = repos.slice(0, 5);
  list.innerHTML = recent.map(repo => `
    <a href="${repo.html_url}" class="blog-item" target="_blank" rel="noopener">
      <span class="blog-date">${fmtDate(repo.pushed_at)}</span>
      <span class="blog-title">${escapeHtml(t('{name} 저장소 업데이트', { name: repo.name }))}</span>
      <span class="blog-arrow">→</span>
    </a>`).join('');
  list.querySelectorAll('.blog-item').forEach(revealize);
}

function renderSkills(repos) {
  const pills = document.getElementById('lang-pills');
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
  if (languages.length === 0) return;
  pills.innerHTML = languages.map(l => `<span>${l}</span>`).join('');
}

function renderStats(user, repos) {
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  const years = Math.max(
    1,
    Math.floor((Date.now() - new Date(user.created_at)) / (365.25 * 24 * 60 * 60 * 1000))
  );
  const repoEl = document.getElementById('stat-repos');
  const langEl = document.getElementById('stat-langs');
  const yearEl = document.getElementById('stat-years');
  if (repoEl) repoEl.dataset.count = repos.length;
  if (langEl) langEl.dataset.count = languages.size;
  if (yearEl) yearEl.dataset.count = years;
}

async function loadGitHubData() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed`),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API request failed');
    const user = await userRes.json();
    const repos = (await reposRes.json()).filter(r => !r.fork && !r.archived);

    renderProjects(repos);
    renderActivity(repos);
    renderSkills(repos);
    renderStats(user, repos);

    const badge = document.getElementById('live-badge');
    if (badge) badge.classList.add('is-live');
  } catch (err) {
    console.warn('[homesweetlove.dev] GitHub live data unavailable, showing static fallback.', err);
  }
}
loadGitHubData();

// ---- daily IT news (from homesweetlove/Daily_IT_News) ----
const NEWS_REPO = 'homesweetlove/Daily_IT_News';
const NEWS_RAW = `https://raw.githubusercontent.com/${NEWS_REPO}/main/news`;

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function extractSummary(md) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex(line => /^##\s+.*핵심\s*요약/.test(line));
  const from = start >= 0 ? start + 1 : 0;
  const bullets = [];
  for (let i = from; i < lines.length; i++) {
    const line = lines[i];
    if (start >= 0 && /^##\s/.test(line)) break;
    const m = line.match(/^\s*[-*]\s+(.+)/);
    if (m) bullets.push(m[1].trim());
    if (start < 0 && bullets.length >= 5) break;
  }
  return bullets;
}

async function latestNewsFile() {
  try {
    const res = await fetch(`https://api.github.com/repos/${NEWS_REPO}/contents/news`);
    if (res.ok) {
      const names = (await res.json()).map(f => f.name).filter(n => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)).sort();
      if (names.length) return names[names.length - 1];
    }
  } catch { /* fall through to probing */ }
  // API unavailable (rate limit etc.): probe the last 10 days directly.
  const today = new Date(Date.now() + 9 * 3600 * 1000); // KST
  for (let back = 0; back < 10; back++) {
    const d = new Date(today.getTime() - back * 86400000).toISOString().slice(0, 10);
    try {
      const res = await fetch(`${NEWS_RAW}/${d}.md`, { method: 'HEAD' });
      if (res.ok) return `${d}.md`;
    } catch { /* keep probing */ }
  }
  return null;
}

async function loadNews() {
  const list = document.getElementById('news-list');
  if (!list) return;
  try {
    const file = await latestNewsFile();
    if (!file) throw new Error('no news file');
    const md = await fetch(`${NEWS_RAW}/${file}`).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
    const bullets = extractSummary(md).slice(0, 5);
    if (!bullets.length) throw new Error('empty summary');
    const date = file.replace('.md', '');
    document.getElementById('news-date').textContent = date.replace(/-/g, '.');
    document.getElementById('news-link').href = `https://github.com/${NEWS_REPO}/blob/main/news/${file}`;
    list.innerHTML = bullets.map(b => `<li>${inlineMarkdown(b)}</li>`).join('');
    document.getElementById('news-badge')?.classList.add('is-live');
  } catch (err) {
    console.warn('[homesweetlove.dev] news unavailable, showing static fallback.', err);
  }
}
loadNews();

// ---- contribution graph (own renderer, data: github-contributions-api.jogruber.de) ----
function contribStats(days) {
  const total = days.reduce((sum, d) => sum + d.count, 0);
  let longest = 0, run = 0;
  days.forEach(d => { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); });
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i === days.length - 1) continue; // today may be empty so far
    else break;
  }
  const best = days.reduce((a, d) => (d.count > a.count ? d : a), { count: 0, date: '' });
  return { total, longest, current, best };
}

function renderContribGraph(days) {
  const grid = document.getElementById('contrib-grid');
  const CELL = 11, GAP = 3, STEP = CELL + GAP, LEFT = 26, TOP = 18;
  const first = new Date(days[0].date + 'T00:00:00');
  const offset = first.getDay(); // Sunday = 0 (GitHub layout)
  const weeks = Math.ceil((days.length + offset) / 7);
  const width = LEFT + weeks * STEP;
  const height = TOP + 7 * STEP;
  const cells = [];
  const months = [];
  let lastMonth = -1;
  days.forEach((d, i) => {
    const idx = i + offset;
    const w = Math.floor(idx / 7), dow = idx % 7;
    const x = LEFT + w * STEP, y = TOP + dow * STEP;
    const date = new Date(d.date + 'T00:00:00');
    if (dow === 0 || i === 0) {
      const m = date.getMonth();
      if (m !== lastMonth && (date.getDate() <= 7 || i === 0)) {
        months.push({ x, text: IS_EN ? MONTHS_EN[m] : `${m + 1}월` });
        lastMonth = m;
      }
    }
    const label = `${d.date} · ${d.count ? t('기여 {n}회', { n: d.count }) : t('기여 없음')}`;
    cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" class="lv${Math.min(4, d.level)}"><title>${label}</title></rect>`);
  });
  const monthLabels = months
    .filter((mo, i) => !months[i + 1] || months[i + 1].x - mo.x >= STEP * 3)
    .map(mo => `<text x="${mo.x}" y="11" class="contrib-label">${mo.text}</text>`);
  const dows = [[1, '월'], [3, '수'], [5, '금']].map(([r, day]) => `<text x="0" y="${TOP + r * STEP + 9}" class="contrib-label">${t(day)}</text>`);
  grid.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${monthLabels.join('')}${dows.join('')}${cells.join('')}</svg>`;
  const scroller = document.getElementById('contrib-scroll');
  if (scroller) scroller.scrollLeft = scroller.scrollWidth; // show the most recent weeks first on small screens
}

async function loadContributions() {
  const grid = document.getElementById('contrib-grid');
  if (!grid) return;
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const days = (data.contributions || []).filter(d => d && d.date).sort((a, b) => a.date.localeCompare(b.date));
    if (!days.length) throw new Error('no data');
    renderContribGraph(days);
    const s = contribStats(days);
    const total = data.total?.lastYear ?? s.total;
    document.getElementById('contrib-total').textContent = t('{n}회', { n: total.toLocaleString(IS_EN ? 'en-US' : 'ko-KR') });
    document.getElementById('contrib-current').textContent = t('{n}일', { n: s.current });
    document.getElementById('contrib-longest').textContent = t('{n}일', { n: s.longest });
    document.getElementById('contrib-best').textContent = s.best.count ? t('{date} · {n}회', { date: IS_EN ? `${MONTHS_EN[Number(s.best.date.slice(5, 7)) - 1]} ${Number(s.best.date.slice(8))}` : s.best.date.slice(5).replace('-', '.'), n: s.best.count }) : '—';
  } catch (err) {
    console.warn('[homesweetlove.dev] contribution data unavailable.', err);
    grid.closest('.contrib-card')?.querySelectorAll('.contrib-stats, .contrib-scroll, .contrib-legend').forEach(el => { el.hidden = true; });
    document.getElementById('contrib-fallback').hidden = false;
  }
}
loadContributions();

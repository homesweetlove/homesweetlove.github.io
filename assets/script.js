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
const roles = ['TypeScript Developer', 'Java', 'GitHub Explorer', '오타쿠가 세상을 지배한다'];
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
function initFilters(languages) {
  const bar = document.getElementById('project-filters');
  bar.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-pill is-active';
  allBtn.dataset.lang = 'all';
  allBtn.textContent = 'All';
  bar.appendChild(allBtn);
  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.lang = lang.toLowerCase();
    btn.textContent = lang;
    bar.appendChild(btn);
  });

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    bar.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const lang = btn.dataset.lang;
    document.querySelectorAll('#project-grid .project-card').forEach(card => {
      const match = lang === 'all' || card.dataset.lang === lang;
      card.classList.toggle('is-hidden', !match);
    });
  });
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

function demoLink(repo) {
  const url = (repo.homepage || '').trim();
  if (!/^https:\/\//i.test(url)) return '';
  if (repo.name === `${GH_USER}.github.io` || url.replace(/\/+$/, '') === location.origin) return ''; // this site itself
  return `<a class="demo-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Demo ↗</a>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderProjects(repos) {
  const grid = document.getElementById('project-grid');
  const top = repos.slice(0, 8);
  grid.innerHTML = top.map(repo => {
    const langKey = (repo.language || 'default').toLowerCase();
    const meta = LANG_META[langKey] || LANG_META.default;
    const desc = repo.description || `${repo.language || '실험적인'} 프로젝트`;
    return `
      <article class="project-card" data-lang="${repo.language ? langKey : 'public'}">
        <div class="project-thumb" style="--c1:${meta.c1};--c2:${meta.c2};">${meta.emoji}</div>
        <div class="project-body">
          <h3>${repo.name}</h3>
          <p>${desc}</p>
          <div class="tags">
            <span>${repo.language || 'Public'}</span>
            ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
          </div>
          <div class="project-links">
            ${demoLink(repo)}<a href="${repo.html_url}" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>`;
  }).join('');

  const languages = [...new Set(top.map(r => r.language).filter(Boolean))];
  initFilters(languages);
  initProjectCards();
}

function renderActivity(repos) {
  const list = document.getElementById('activity-list');
  const recent = repos.slice(0, 5);
  list.innerHTML = recent.map(repo => `
    <a href="${repo.html_url}" class="blog-item" target="_blank" rel="noopener">
      <span class="blog-date">${fmtDate(repo.pushed_at)}</span>
      <span class="blog-title">${repo.name} 저장소 업데이트</span>
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
        months.push({ x, text: `${m + 1}월` });
        lastMonth = m;
      }
    }
    const label = `${d.date} · ${d.count ? `기여 ${d.count}회` : '기여 없음'}`;
    cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" class="lv${Math.min(4, d.level)}"><title>${label}</title></rect>`);
  });
  const monthLabels = months
    .filter((mo, i) => !months[i + 1] || months[i + 1].x - mo.x >= STEP * 3)
    .map(mo => `<text x="${mo.x}" y="11" class="contrib-label">${mo.text}</text>`);
  const dows = [[1, '월'], [3, '수'], [5, '금']].map(([r, t]) => `<text x="0" y="${TOP + r * STEP + 9}" class="contrib-label">${t}</text>`);
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
    document.getElementById('contrib-total').textContent = `${total.toLocaleString('ko-KR')}회`;
    document.getElementById('contrib-current').textContent = `${s.current}일`;
    document.getElementById('contrib-longest').textContent = `${s.longest}일`;
    document.getElementById('contrib-best').textContent = s.best.count ? `${s.best.date.slice(5).replace('-', '.')} · ${s.best.count}회` : '—';
  } catch (err) {
    console.warn('[homesweetlove.dev] contribution data unavailable.', err);
    grid.closest('.contrib-card')?.querySelectorAll('.contrib-stats, .contrib-scroll, .contrib-legend').forEach(el => { el.hidden = true; });
    document.getElementById('contrib-fallback').hidden = false;
  }
}
loadContributions();

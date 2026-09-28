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
  '.stat-card, .skill-group, .contrib-card, .about-text, .bio-quote'
).forEach(revealize);

// ---- contribution graph fallback (also covers a slow/hanging third-party service) ----
const contribImg = document.getElementById('contrib-graph');
const contribFallback = document.getElementById('contrib-fallback');
if (contribImg && contribFallback) {
  let contribSettled = false;
  const showContribFallback = () => {
    if (contribSettled) return;
    contribSettled = true;
    contribImg.hidden = true;
    contribFallback.hidden = false;
  };
  contribImg.addEventListener('error', showContribFallback, { once: true });
  contribImg.addEventListener('load', () => { contribSettled = true; }, { once: true });
  setTimeout(() => { if (!contribImg.complete) showContribFallback(); }, 6000);
}

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
            <a href="${repo.html_url}" target="_blank" rel="noopener">GitHub ↗</a>
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

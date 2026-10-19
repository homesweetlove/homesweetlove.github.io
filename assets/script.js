// Focused portfolio behavior. Featured projects are editorially curated in index.html.
(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  } catch (_) { /* local storage may be disabled */ }

  themeToggle?.addEventListener('click', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = root.dataset.theme || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  const navToggle = document.getElementById('nav-toggle');
  const navLinksMobile = document.getElementById('nav-links-mobile');
  navToggle?.addEventListener('click', () => navLinksMobile?.classList.toggle('open'));
  navLinksMobile?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinksMobile.classList.remove('open'));
  });

  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  }, { passive: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isEnglish = window.i18n?.lang === 'en';
  const roles = isEnglish
    ? ['Systems Engineering', 'Resource-Aware Software', 'Human-Centered Products']
    : ['시스템 설계', '자원 효율 최적화', '사용자 중심 소프트웨어'];
  const label = document.getElementById('type-target');
  const cursor = document.querySelector('.cursor');
  if (label) {
    if (reducedMotion) {
      label.textContent = roles[0];
      if (cursor) cursor.style.display = 'none';
    } else {
      let role = 0, length = 0, removing = false;
      function advance() {
        const current = roles[role];
        length += removing ? -1 : 1;
        label.textContent = current.slice(0, length);
        if (!removing && length === current.length) {
          removing = true;
          setTimeout(advance, 1600);
        } else if (removing && length === 0) {
          removing = false;
          role = (role + 1) % roles.length;
          setTimeout(advance, 250);
        } else setTimeout(advance, removing ? 50 : 95);
      }
      advance();
    }
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.project-card, .skill-group, .section-intro, .about-text').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();

// Tiny i18n: Korean browsers see Korean, everyone else sees English. A KO/EN toggle overrides it.
// Static HTML: Korean is written in the page; English lives next to it in data-en / data-en-<attr>.
// Scripts: i18n.t('한국어 원문 {name}', { name }) returns the English string registered with i18n.add().
(function () {
  const KEY = 'lang';
  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) { /* storage blocked */ }
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    return langs.some(l => /^ko\b/i.test(l)) ? 'ko' : 'en';
  }

  const lang = detect();
  const root = document.documentElement;
  root.lang = lang;
  root.dataset.lang = lang;
  const en = {};

  function t(ko, vars) {
    let s = lang === 'en' && Object.prototype.hasOwnProperty.call(en, ko) ? en[ko] : ko;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return s;
  }

  function apply(scope) {
    const base = scope || document;
    if (lang === 'en') {
      base.querySelectorAll('[data-en]').forEach(el => { el.innerHTML = el.getAttribute('data-en'); });
      base.querySelectorAll('*').forEach(el => {
        for (const attr of el.attributes) {
          if (attr.name.startsWith('data-en-')) el.setAttribute(attr.name.slice(8), attr.value);
        }
      });
    }
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.textContent = lang === 'ko' ? 'EN' : 'KO';
      btn.title = lang === 'ko' ? 'Switch to English' : '한국어로 보기';
      btn.setAttribute('aria-label', btn.title);
    });
  }

  function set(next) {
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    location.reload();
  }

  document.addEventListener('click', event => {
    const btn = event.target.closest && event.target.closest('.lang-toggle');
    if (!btn) return;
    event.preventDefault();
    set(lang === 'ko' ? 'en' : 'ko');
  });

  window.i18n = { lang, t, apply, set, add(map) { Object.assign(en, map); } };
})();

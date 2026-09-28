// Easter egg: press ` (backtick) anywhere on the portfolio to open a tiny terminal.
(function () {
  const USER = 'homesweetlove';
  const HOST = 'homesweetlove.dev';
  const PROMPT = `${USER}@${HOST}:~$`;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const link = (href, text, external = true) => `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${esc(text)}</a>`;

  // ---- DOM ----
  const wrap = document.createElement('div');
  wrap.className = 'term-overlay';
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="term" role="dialog" aria-modal="true" aria-label="터미널">
      <div class="term-bar">
        <span class="term-dots"><i></i><i></i><i></i></span>
        <span class="term-title">${USER}@${HOST} — zsh</span>
        <button class="term-close" type="button" aria-label="터미널 닫기">×</button>
      </div>
      <div class="term-body" tabindex="-1">
        <div class="term-out" aria-live="polite"></div>
        <form class="term-line" autocomplete="off">
          <span class="term-prompt">${PROMPT}</span>
          <input class="term-input" type="text" spellcheck="false" autocapitalize="off" aria-label="명령어 입력">
        </form>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  const out = wrap.querySelector('.term-out');
  const form = wrap.querySelector('.term-line');
  const input = wrap.querySelector('.term-input');
  const body = wrap.querySelector('.term-body');

  const print = (html = '', cls = '') => {
    const line = document.createElement('div');
    line.className = `term-row ${cls}`.trim();
    line.innerHTML = html;
    out.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };
  const echoCommand = cmd => print(`<span class="term-prompt">${PROMPT}</span> ${esc(cmd)}`);

  // ---- data from the page ----
  const repos = () => {
    if (Array.isArray(window.__projectRepos)) return window.__projectRepos;
    return [...document.querySelectorAll('#project-grid .project-card')].map(card => ({
      name: card.querySelector('h3')?.textContent.trim(),
      language: card.querySelector('.tags span')?.textContent.trim(),
      description: card.querySelector('p')?.textContent.trim(),
      html_url: card.querySelector('.project-links a:last-child')?.href,
      homepage: card.querySelector('.demo-link')?.href || '',
    }));
  };
  const demoOf = name => {
    const card = [...document.querySelectorAll('#project-grid .project-card')].find(c => c.querySelector('h3')?.textContent.trim() === name);
    return card?.querySelector('.demo-link')?.href || '';
  };
  const text = sel => document.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim() || '';

  // ---- 퇴근 (reads the payday counter's saved settings) ----
  function leaveWork() {
    let s;
    try { s = JSON.parse(localStorage.getItem('payday-settings') || 'null'); } catch { s = null; }
    const end = (s && s.end) || '18:00';
    const days = (s && s.days) || [1, 2, 3, 4, 5];
    const now = new Date();
    if (!days.includes(now.getDay())) return print('오늘은 쉬는 날이에요. 터미널 끄고 쉬세요 🛋️', 'term-ok');
    const [h, m] = end.split(':').map(Number);
    const target = new Date(now); target.setHours(h, m, 0, 0);
    const diff = Math.floor((target - now) / 1000);
    if (diff <= 0) return print('이미 퇴근 시간이 지났어요. 왜 아직 여기 있어요? 🏃💨', 'term-ok');
    const hh = Math.floor(diff / 3600), mm = Math.floor(diff % 3600 / 60), ss = diff % 60;
    print(`퇴근(${esc(end)})까지 <b>${hh}시간 ${mm}분 ${ss}초</b> 남았어요.`);
    print(`실시간 급여는 ${link('tools.html#payday', '퇴근 · 급여 카운터', false)}에서 확인하세요${s ? '' : ' (기본 설정 09:00~18:00 기준)'}.`, 'term-dim');
  }

  // ---- commands ----
  const history = [];
  let historyIndex = 0;

  const commands = {
    help() {
      const rows = [
        ['whoami', '나는 누구인가'], ['neofetch', '시스템 정보 (자랑용)'], ['ls [projects]', '둘러보기 · 프로젝트 목록'],
        ['cat about', '자기소개'], ['open <이름>', '프로젝트·페이지 열기 (예: open wading, open tools)'],
        ['news', '오늘의 IT·보안 뉴스'], ['퇴근', '퇴근까지 남은 시간'], ['theme [dark|light]', '테마 바꾸기'],
        ['history · clear · exit', '기록 · 화면 지우기 · 닫기'],
      ];
      print('사용할 수 있는 명령어:', 'term-head');
      rows.forEach(([c, d]) => print(`  <span class="term-cmd">${esc(c.padEnd(22, ' '))}</span><span class="term-dim">${esc(d)}</span>`));
      print('Tab 자동완성 · ↑↓ 이전 명령 · Esc 닫기', 'term-dim');
    },
    whoami() {
      print('i_so_free (@homesweetlove)', 'term-head');
      print('GitHub에 이것저것 만들고 실험하는 사람. 집에 빨리 가는 방법을 연구 중.');
      print('“오타쿠가 세상을 지배한다!”', 'term-dim');
    },
    neofetch() {
      const list = repos();
      const langs = [...new Set(list.map(r => r.language).filter(Boolean))];
      const contrib = text('#contrib-total') || '?';
      const logo = [
        '██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝',
      ];
      const info = [
        `<b class="term-accent">${USER}</b>@${HOST}`,
        '─'.repeat(24),
        `<b>OS</b>: GitHub Pages (static, 서버 없음)`,
        `<b>Repos</b>: ${list.length}개 공개`,
        `<b>Langs</b>: ${esc(langs.join(', ') || '—')}`,
        `<b>Commits</b>: 지난 1년 ${esc(contrib)}`,
        `<b>Shell</b>: homesweet-sh 0.1`,
        `<b>Uptime</b>: 퇴근 전까지`,
      ];
      const n = Math.max(logo.length, info.length);
      for (let i = 0; i < n; i++) print(`<span class="term-logo">${esc((logo[i] || '').padEnd(10, ' '))}</span>${info[i] || ''}`);
    },
    ls(args) {
      if (args[0] === 'projects' || args[0] === 'projects/') {
        const list = repos();
        if (!list.length) return print('프로젝트 목록을 아직 불러오는 중이에요.', 'term-dim');
        list.forEach(r => {
          const demo = demoOf(r.name) ? ' <span class="term-ok">[demo]</span>' : '';
          print(`  <span class="term-cmd">${esc((r.name || '').padEnd(30, ' '))}</span><span class="term-dim">${esc(r.language || '기타')}</span>${demo}`);
        });
        return print(`총 ${list.length}개 · <span class="term-dim">open &lt;이름&gt; 으로 열기</span>`);
      }
      print('<span class="term-cmd">about</span>  <span class="term-accent">projects/</span>  <span class="term-cmd">news</span>  <span class="term-cmd">tools</span>  <span class="term-cmd">editor</span>  <span class="term-cmd">contact</span>  <span class="term-dim">.secret</span>');
    },
    cat(args) {
      const what = (args[0] || '').replace(/^\.\//, '');
      if (what === 'about') return print(esc(text('#about .about-text') || text('#about')));
      if (what === '.secret') return print('🤫 비밀: 사실 이 사이트의 절반은 퇴근하고 싶어서 만들어졌다.', 'term-ok');
      if (what === 'news') return commands.news();
      if (!what) return print('cat: 파일 이름을 적어주세요 (예: cat about)', 'term-err');
      print(`cat: ${esc(what)}: 그런 파일이 없어요`, 'term-err');
    },
    news() {
      const items = [...document.querySelectorAll('#news-list li')].map(li => li.textContent.trim());
      if (!items.length) return print('뉴스를 아직 불러오지 못했어요.', 'term-dim');
      print(`📰 ${esc(text('#news-date'))} 핵심 요약`, 'term-head');
      items.forEach((t, i) => print(`  ${String(i + 1).padStart(2, '0')}. ${esc(t)}`));
    },
    open(args) {
      const target = args.join(' ').trim();
      const pages = { tools: 'tools.html', editor: 'hwp-editor.html', github: `https://github.com/${USER}`, news: '#news', contact: '#contact', about: '#about', projects: '#projects' };
      if (!target) return print('open: 무엇을 열까요? (예: open wading, open tools)', 'term-err');
      if (pages[target]) {
        const href = pages[target];
        print(`→ ${esc(href)} 여는 중…`, 'term-ok');
        if (href.startsWith('#')) { close(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); }
        else if (href.startsWith('http')) window.open(href, '_blank', 'noopener');
        else location.href = href;
        return;
      }
      const repo = repos().find(r => (r.name || '').toLowerCase() === target.toLowerCase())
        || repos().find(r => (r.name || '').toLowerCase().includes(target.toLowerCase()));
      if (!repo) return print(`open: '${esc(target)}' 를 찾을 수 없어요. ls projects 로 목록을 보세요.`, 'term-err');
      const url = demoOf(repo.name) || repo.html_url;
      print(`→ ${esc(repo.name)} ${url === repo.html_url ? '(GitHub)' : '(demo)'} 여는 중…`, 'term-ok');
      window.open(url, '_blank', 'noopener');
    },
    퇴근: leaveWork,
    theme(args) {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = args[0] === 'dark' || args[0] === 'light' ? args[0] : current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch { /* ignore */ }
      print(`테마를 ${next === 'dark' ? '다크' : '라이트'} 모드로 바꿨어요.`, 'term-ok');
    },
    date() { print(new Date().toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'medium' })); },
    echo(args) { print(esc(args.join(' '))); },
    history() { history.forEach((h, i) => print(`  ${String(i + 1).padStart(3, ' ')}  ${esc(h)}`)); },
    clear() { out.innerHTML = ''; },
    exit() { close(); },
    sudo(args) {
      const what = args.join(' ');
      if (/퇴근/.test(what)) return print('sudo: 퇴근 권한이 없습니다. 팀장님께 결재를 올려주세요. 📝', 'term-err');
      if (/rm\s+-rf/.test(what)) return print('😏 좋은 시도였어요.', 'term-err');
      print(`${USER} is not in the sudoers file. This incident will be reported to 팀장님.`, 'term-err');
    },
    rm(args) { if (args.join(' ').includes('-rf')) return print('😏 좋은 시도였어요.', 'term-err'); print('rm: 읽기 전용 포트폴리오예요.', 'term-err'); },
    coffee() { print('☕ 커피 내리는 중… 완료. 생산성 +10%, 퇴근 시간 변화 없음.', 'term-ok'); },
    hello() { print('안녕하세요! 👋 help 를 입력하면 할 수 있는 걸 알려드려요.'); },
    cd() { print('여긴 한 층짜리 집이에요. 갈 데가 없어요 🏠', 'term-dim'); },
    pwd() { print(`/home/${USER}/sweet/home`); },
    vim() { print('vim에 들어왔어요. 나가는 법은… 행운을 빌어요. (:q! 는 여기선 안 돼요 😇)', 'term-dim'); },
  };
  const aliases = { '?': 'help', 'ㅎ': 'help', '도움말': 'help', '안녕': 'hello', hi: 'hello', cls: 'clear', q: 'exit', quit: 'exit', 집에가고싶다: '퇴근', 퇴근언제: '퇴근', dir: 'ls', 'ls -la': 'ls', 'git': 'open' };

  function run(raw) {
    const line = raw.trim();
    echoCommand(raw);
    if (!line) return;
    history.push(line);
    historyIndex = history.length;
    const [first, ...rest] = line.split(/\s+/);
    const name = aliases[line] || aliases[first] || first;
    const args = aliases[first] === 'open' ? ['github', ...rest] : rest;
    const fn = commands[name] || commands[name.toLowerCase()];
    if (fn) fn(args);
    else print(`zsh: command not found: ${esc(first)} — <span class="term-cmd">help</span> 를 입력해 보세요`, 'term-err');
  }

  // ---- open / close ----
  let lastFocus = null;
  function open() {
    if (!wrap.hidden) return;
    lastFocus = document.activeElement;
    wrap.hidden = false;
    document.documentElement.classList.add('term-open');
    if (!out.childElementCount) {
      print(`Last login: ${new Date().toLocaleString('ko-KR')} on ttys000`, 'term-dim');
      print('homesweetlove.dev 터미널에 오신 걸 환영해요. <span class="term-cmd">help</span> 를 입력해 보세요.');
    }
    setTimeout(() => input.focus(), 0);
  }
  function close() {
    wrap.hidden = true;
    document.documentElement.classList.remove('term-open');
    lastFocus?.focus?.();
  }

  form.addEventListener('submit', event => { event.preventDefault(); const v = input.value; input.value = ''; run(v); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') { event.preventDefault(); if (historyIndex > 0) input.value = history[--historyIndex] || ''; }
    else if (event.key === 'ArrowDown') { event.preventDefault(); historyIndex = Math.min(history.length, historyIndex + 1); input.value = history[historyIndex] || ''; }
    else if (event.key === 'Tab') {
      event.preventDefault();
      const v = input.value;
      const parts = v.split(/\s+/);
      const pool = parts.length > 1 && (parts[0] === 'open' || parts[0] === 'cat')
        ? (parts[0] === 'open' ? [...repos().map(r => r.name), 'tools', 'editor', 'github', 'news', 'contact'] : ['about', 'news', '.secret'])
        : Object.keys(commands);
      const last = parts[parts.length - 1];
      const matches = pool.filter(c => c && c.toLowerCase().startsWith(last.toLowerCase()));
      if (matches.length === 1) { parts[parts.length - 1] = matches[0]; input.value = parts.join(' ') + ' '; }
      else if (matches.length > 1) { echoCommand(v); print(matches.map(esc).join('   '), 'term-dim'); }
    } else if (event.key === 'Escape') { close(); }
    else if (event.key.toLowerCase() === 'l' && event.ctrlKey) { event.preventDefault(); commands.clear(); }
  });
  wrap.addEventListener('mousedown', event => { if (event.target === wrap) close(); });
  wrap.querySelector('.term-close').addEventListener('click', close);
  body.addEventListener('click', () => { if (!getSelection().toString()) input.focus(); });

  document.addEventListener('keydown', event => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((event.key === '`' || event.key === '₩' || event.code === 'Backquote') && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (!wrap.hidden) { if (event.target === input) { event.preventDefault(); close(); } return; }
      if (typing) return;
      event.preventDefault();
      open();
    }
  });
  document.querySelectorAll('[data-open-terminal]').forEach(el => el.addEventListener('click', event => { event.preventDefault(); open(); }));
  window.terminal = { open, close, run };
})();

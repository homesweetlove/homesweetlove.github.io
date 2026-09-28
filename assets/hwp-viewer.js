// HWP / HWPX viewer powered by rhwp (https://github.com/edwardkim/rhwp, MIT).
// Everything runs in the browser: the file never leaves this page.

const RHWP_RANGE = '0.8';
const CDN = `https://cdn.jsdelivr.net/npm/@rhwp/core@${RHWP_RANGE}`;
const DEFAULT_PAGE = { width: 794, height: 1123 }; // A4 @ 96dpi
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;

const $ = id => document.getElementById(id);
const els = {
  panel: $('tool-hwp'),
  dropzone: $('hwp-dropzone'),
  input: $('hwp-file-input'),
  pick: $('hwp-load'),
  shell: $('hwp-viewer-shell'),
  scroller: $('hwp-viewer'),
  pages: $('hwp-pages'),
  fileName: $('hwp-file-name'),
  meta: $('hwp-meta'),
  pageInput: $('hwp-page-input'),
  pageTotal: $('hwp-page-total'),
  prev: $('hwp-prev'),
  next: $('hwp-next'),
  zoomOut: $('hwp-zoom-out'),
  zoomIn: $('hwp-zoom-in'),
  zoomLabel: $('hwp-zoom-label'),
  fit: $('hwp-fit'),
  textToggle: $('hwp-text-toggle'),
  textPane: $('hwp-text-pane'),
  textOut: $('hwp-text'),
  copyText: $('hwp-copy-text'),
  saveTxt: $('hwp-save-txt'),
  toStudio: $('hwp-to-studio'),
  saveHwp: $('hwp-save-hwp'),
  saveHwpx: $('hwp-save-hwpx'),
  print: $('hwp-print'),
  close: $('close-hwp'),
  message: $('hwp-message'),
};

const state = {
  doc: null,
  name: '',
  pageCount: 0,
  sizes: [],
  svgCache: new Map(),
  zoom: 1,
  observer: null,
  text: null,
  current: 0,
};

let enginePromise = null;

function say(text, isError = false) {
  els.message.textContent = text;
  els.message.classList.toggle('error', isError);
}

function installMeasureTextWidth() {
  if (globalThis.measureTextWidth) return;
  let ctx = null;
  let lastFont = '';
  globalThis.measureTextWidth = (font, text) => {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    if (font !== lastFont) { ctx.font = font; lastFont = font; }
    return ctx.measureText(text).width;
  };
}

function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      installMeasureTextWidth();
      const mod = await import(`${CDN}/rhwp.js`);
      await mod.default({ module_or_path: `${CDN}/rhwp_bg.wasm` });
      return mod;
    })();
    enginePromise.catch(() => { enginePromise = null; });
  }
  return enginePromise;
}

function parseJson(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function baseName(name) {
  return name.replace(/\.(hwpx?|hml)$/i, '') || 'document';
}

function download(filename, data, type) {
  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

function pageSize(index) {
  const info = parseJson(safe(() => state.doc.getPageInfo(index)), {});
  const width = Number(info?.width);
  const height = Number(info?.height);
  return width > 0 && height > 0 ? { width, height } : { ...DEFAULT_PAGE };
}

function safe(fn, fallback = null) {
  try { return fn(); } catch { return fallback; }
}

function renderSvg(index) {
  if (state.svgCache.has(index)) return state.svgCache.get(index);
  const raw = state.doc.renderPageSvg(index);
  const holder = document.createElement('div');
  holder.innerHTML = raw;
  const svg = holder.querySelector('svg');
  if (svg) {
    if (!svg.getAttribute('viewBox')) {
      const w = parseFloat(svg.getAttribute('width')) || state.sizes[index].width;
      const h = parseFloat(svg.getAttribute('height')) || state.sizes[index].height;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
  const html = holder.innerHTML;
  state.svgCache.set(index, html);
  return html;
}

function paintPage(el) {
  if (el.dataset.rendered) return;
  const index = Number(el.dataset.index);
  try {
    el.innerHTML = renderSvg(index);
    el.dataset.rendered = '1';
  } catch (error) {
    el.innerHTML = `<span class="hwp-page-error">${index + 1}쪽을 그리지 못했습니다</span>`;
    el.dataset.rendered = '1';
    console.warn('[hwp] page render failed', index, error);
  }
}

function applyZoom() {
  els.pages.querySelectorAll('.hwp-page').forEach(el => {
    const { width, height } = state.sizes[Number(el.dataset.index)];
    el.style.width = `${width * state.zoom}px`;
    el.style.height = `${height * state.zoom}px`;
  });
  els.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function setZoom(zoom, keepPage = true) {
  const page = state.current;
  state.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
  applyZoom();
  if (keepPage) goToPage(page, 'auto');
}

function fitWidth() {
  const widest = Math.max(...state.sizes.map(s => s.width));
  const available = els.scroller.clientWidth - 48;
  setZoom(available > 0 ? available / widest : 1);
}

function goToPage(index, behavior = 'smooth') {
  const clamped = Math.min(state.pageCount - 1, Math.max(0, index));
  const el = els.pages.children[clamped];
  if (!el) return;
  els.scroller.scrollTo({ top: el.offsetTop - 16, behavior });
  setCurrent(clamped);
}

function setCurrent(index) {
  state.current = index;
  els.pageInput.value = String(index + 1);
  els.prev.disabled = index <= 0;
  els.next.disabled = index >= state.pageCount - 1;
}

function trackCurrentPage() {
  const top = els.scroller.scrollTop + els.scroller.clientHeight * 0.35;
  const children = els.pages.children;
  let found = 0;
  for (let i = 0; i < children.length; i++) {
    if (children[i].offsetTop <= top) found = i; else break;
  }
  if (found !== state.current) setCurrent(found);
}

function buildPages() {
  state.observer?.disconnect();
  els.pages.replaceChildren();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < state.pageCount; i++) {
    const el = document.createElement('div');
    el.className = 'hwp-page';
    el.dataset.index = String(i);
    el.innerHTML = `<span class="hwp-page-placeholder">${i + 1}</span>`;
    frag.appendChild(el);
  }
  els.pages.appendChild(frag);
  state.observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) paintPage(entry.target); });
  }, { root: els.scroller, rootMargin: '800px 0px' });
  els.pages.querySelectorAll('.hwp-page').forEach(el => state.observer.observe(el));
}

function documentText() {
  if (state.text !== null) return state.text;
  let text = '';
  const raw = safe(() => state.doc.getTextFileUnicode?.()) ?? safe(() => state.doc.getTextFileText?.());
  if (typeof raw === 'string') {
    const parsed = parseJson(raw, raw);
    text = typeof parsed === 'string' ? parsed : raw;
  }
  if (!text.trim()) {
    // Fallback: read the text drawn into each page.
    const parts = [];
    for (let i = 0; i < state.pageCount; i++) {
      const holder = document.createElement('div');
      holder.innerHTML = safe(() => renderSvg(i), '');
      parts.push([...holder.querySelectorAll('text')].map(t => t.textContent).join(''));
    }
    text = parts.join('\n\n');
  }
  state.text = text.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return state.text;
}

function freeDoc() {
  state.observer?.disconnect();
  state.observer = null;
  safe(() => state.doc?.free());
  state.doc = null;
  state.svgCache.clear();
  state.text = null;
  state.sizes = [];
  state.pageCount = 0;
  state.current = 0;
}

function closeViewer() {
  freeDoc();
  els.pages.replaceChildren();
  els.shell.hidden = true;
  els.dropzone.hidden = false;
  els.textPane.hidden = true;
  els.textToggle.setAttribute('aria-pressed', 'false');
  say('HWP·HWPX 파일을 선택하거나 이곳에 끌어다 놓으세요.');
}

async function open(file) {
  if (!file) return;
  if (!/\.(hwpx?|hml)$/i.test(file.name)) {
    say('HWP, HWPX 파일만 열 수 있습니다.', true);
    return;
  }
  window.openTool?.('hwp');
  say('문서 엔진을 불러오는 중입니다… 파일은 외부로 전송되지 않습니다.');
  els.panel.classList.add('is-loading');
  try {
    const mod = await loadEngine();
    const bytes = new Uint8Array(await file.arrayBuffer());
    freeDoc();
    say('문서를 해석하는 중입니다…');
    await new Promise(resolve => setTimeout(resolve, 0));
    const doc = new mod.HwpDocument(bytes);
    const info = parseJson(safe(() => doc.getDocumentInfo()), {}) || {};
    if (info.encrypted) {
      safe(() => doc.free());
      say('암호가 걸린 문서는 열 수 없습니다.', true);
      return;
    }
    state.doc = doc;
    state.name = file.name;
    state.pageCount = doc.pageCount();
    state.sizes = Array.from({ length: state.pageCount }, (_, i) => pageSize(i));

    els.fileName.textContent = file.name;
    const bits = [];
    if (info.version) bits.push(`v${info.version}`);
    bits.push(`${state.pageCount}쪽`);
    bits.push(`${(file.size / 1024).toFixed(file.size > 1024 * 100 ? 0 : 1)}KB`);
    els.meta.textContent = bits.join(' · ');
    els.pageTotal.textContent = String(state.pageCount);
    els.pageInput.max = String(state.pageCount);
    els.saveHwp.hidden = typeof doc.exportHwp !== 'function';
    els.saveHwpx.hidden = typeof doc.exportHwpx !== 'function';
    els.textPane.hidden = true;
    els.textToggle.setAttribute('aria-pressed', 'false');

    els.dropzone.hidden = true;
    els.shell.hidden = false;
    buildPages();
    fitWidth();
    els.scroller.scrollTop = 0;
    setCurrent(0);
    const engine = safe(() => mod.version?.());
    say(`${file.name}을(를) 열었습니다.${engine ? ` (rhwp ${engine})` : ''}`);
  } catch (error) {
    console.error('[hwp] open failed', error);
    const offline = String(error?.message || error).match(/import|fetch|network|Failed to fetch/i);
    say(offline
      ? '문서 엔진을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해주세요.'
      : '이 파일을 열지 못했습니다. 손상되었거나 아직 지원하지 않는 형식일 수 있습니다.', true);
  } finally {
    els.panel.classList.remove('is-loading');
  }
}

function printDocument() {
  if (!state.doc) return;
  say('인쇄용 페이지를 준비하는 중입니다…');
  const pages = [];
  for (let i = 0; i < state.pageCount; i++) {
    const { width, height } = state.sizes[i];
    pages.push(`<section style="width:${width}px;height:${height}px">${safe(() => renderSvg(i), '')}</section>`);
  }
  const first = state.sizes[0] || DEFAULT_PAGE;
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${baseName(state.name)}</title><style>
    @page{size:${first.width}px ${first.height}px;margin:0}
    html,body{margin:0;padding:0;background:#fff}
    section{page-break-after:always;break-after:page;overflow:hidden}
    section:last-child{page-break-after:auto;break-after:auto}
    svg{display:block;width:100%;height:100%}
  </style></head><body>${pages.join('')}</body></html>`;
  frame.onload = () => {
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      say('인쇄 창에서 "PDF로 저장"을 고르면 PDF로 저장됩니다.');
      setTimeout(() => frame.remove(), 60000);
    }, 200);
  };
  document.body.appendChild(frame);
}

function exportAs(kind) {
  if (!state.doc) return;
  try {
    const bytes = kind === 'hwpx' ? state.doc.exportHwpx() : state.doc.exportHwp();
    const type = kind === 'hwpx' ? 'application/hwp+zip' : 'application/x-hwp';
    download(`${baseName(state.name)}.${kind}`, bytes, type);
    say(`${kind.toUpperCase()} 파일로 저장했습니다.`);
  } catch (error) {
    console.error('[hwp] export failed', error);
    say(`${kind.toUpperCase()}로 변환하지 못했습니다.`, true);
  }
}

// ---- wiring ----
els.pick.addEventListener('click', () => els.input.click());
els.input.addEventListener('change', event => {
  open(event.target.files[0]);
  event.target.value = '';
});

['dragenter', 'dragover'].forEach(type => els.panel.addEventListener(type, event => {
  if (![...(event.dataTransfer?.types || [])].includes('Files')) return;
  event.preventDefault();
  els.panel.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach(type => els.panel.addEventListener(type, event => {
  if (type === 'dragleave' && els.panel.contains(event.relatedTarget)) return;
  els.panel.classList.remove('is-dragging');
}));
els.panel.addEventListener('drop', event => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  event.preventDefault();
  open(file);
});

els.prev.addEventListener('click', () => goToPage(state.current - 1));
els.next.addEventListener('click', () => goToPage(state.current + 1));
els.pageInput.addEventListener('change', () => goToPage(Number(els.pageInput.value) - 1));
els.zoomOut.addEventListener('click', () => setZoom(state.zoom / 1.2));
els.zoomIn.addEventListener('click', () => setZoom(state.zoom * 1.2));
els.fit.addEventListener('click', fitWidth);

let scrollTick = false;
els.scroller.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => { trackCurrentPage(); scrollTick = false; });
}, { passive: true });

els.scroller.addEventListener('keydown', event => {
  if (event.target === els.pageInput) return;
  if (event.key === 'PageDown' || (event.key === 'ArrowRight' && !event.shiftKey)) { event.preventDefault(); goToPage(state.current + 1); }
  if (event.key === 'PageUp' || event.key === 'ArrowLeft') { event.preventDefault(); goToPage(state.current - 1); }
});
els.scroller.addEventListener('wheel', event => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  setZoom(state.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1));
}, { passive: false });

els.textToggle.addEventListener('click', () => {
  const show = els.textPane.hidden;
  if (show) els.textOut.value = documentText() || '(추출할 텍스트가 없습니다)';
  els.textPane.hidden = !show;
  els.textToggle.setAttribute('aria-pressed', String(show));
});
els.copyText.addEventListener('click', () => {
  navigator.clipboard.writeText(documentText())
    .then(() => say('문서 텍스트를 클립보드에 복사했습니다.'))
    .catch(() => say('복사하지 못했습니다. 텍스트 보기에서 직접 선택해주세요.', true));
});
els.saveTxt.addEventListener('click', () => {
  download(`${baseName(state.name)}.txt`, documentText(), 'text/plain;charset=utf-8');
  say('TXT 파일로 저장했습니다.');
});
els.toStudio.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('hwp:to-studio', {
    detail: { title: baseName(state.name), text: documentText() },
  }));
});
els.saveHwp.addEventListener('click', () => exportAs('hwp'));
els.saveHwpx.addEventListener('click', () => exportAs('hwpx'));
els.print.addEventListener('click', printDocument);
els.close.addEventListener('click', closeViewer);

window.hwpViewer = { open, close: closeViewer, preload: loadEngine };

// Warm up the engine when the user shows interest in the HWP tool.
document.querySelector('.tool-tab[data-tool="hwp"]')?.addEventListener('pointerenter', () => { loadEngine().catch(() => {}); }, { once: true });
if (location.hash === '#hwp') loadEngine().catch(() => {});

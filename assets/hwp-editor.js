// HWP editor page: embeds rhwp-studio (https://github.com/edwardkim/rhwp, MIT) through @rhwp/editor.
import { takeDocument } from './hwp-handoff.js';

const SDK = 'https://cdn.jsdelivr.net/npm/@rhwp/editor@0.8/index.js';

const $ = id => document.getElementById(id);
const els = {
  stage: $('stage'),
  overlay: $('overlay'),
  loading: $('overlay-loading'),
  error: $('overlay-error'),
  errorText: $('overlay-error-text'),
  name: $('doc-name'),
  status: $('status'),
  open: $('open-file'),
  input: $('file-input'),
  saveHwp: $('save-hwp'),
  saveHwpx: $('save-hwpx'),
};

let editor = null;
let docName = '';
let busy = false;

function say(text, isError = false) {
  els.status.textContent = text;
  els.status.classList.toggle('error', isError);
}

function baseName(name) {
  return (name || '').replace(/\.(hwpx?|hml)$/i, '') || '문서';
}

function download(filename, bytes, type) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setReady(ready) {
  els.open.disabled = !ready;
  els.saveHwp.disabled = !ready;
  els.saveHwpx.disabled = !ready;
}

async function loadBytes(bytes, name) {
  if (!editor || busy) return;
  if (!/\.(hwpx?|hml)$/i.test(name)) {
    say('HWP, HWPX 파일만 열 수 있습니다.', true);
    return;
  }
  busy = true;
  say(`${name} 여는 중…`);
  try {
    await editor.loadFile(bytes, name, { skipUnsavedGuard: true });
    docName = name;
    els.name.textContent = name;
    document.title = `${baseName(name)} · HWP 편집기`;
    say(`${name}을(를) 열었습니다. 편집한 뒤 저장 버튼을 누르세요.`);
  } catch (error) {
    console.error('[hwp-editor] load failed', error);
    say('이 파일을 열지 못했습니다. 손상되었거나 지원하지 않는 형식일 수 있습니다.', true);
  } finally {
    busy = false;
  }
}

async function openFile(file) {
  if (!file) return;
  await loadBytes(new Uint8Array(await file.arrayBuffer()), file.name);
}

async function save(kind) {
  if (!editor || busy) return;
  busy = true;
  say(`${kind.toUpperCase()}로 저장하는 중…`);
  try {
    const bytes = kind === 'hwpx' ? await editor.exportHwpx() : await editor.exportHwp();
    const name = `${baseName(docName)}.${kind}`;
    download(name, bytes, kind === 'hwpx' ? 'application/hwp+zip' : 'application/x-hwp');
    try { await editor.notifySaved?.(name); } catch { /* older studio: ignore */ }
    say(`${name} 파일로 저장했습니다.`);
  } catch (error) {
    console.error('[hwp-editor] export failed', error);
    say(`${kind.toUpperCase()}로 저장하지 못했습니다.`, true);
  } finally {
    busy = false;
  }
}

function showError(message) {
  els.loading.hidden = true;
  els.error.hidden = false;
  if (message) els.errorText.textContent = message;
  els.overlay.hidden = false;
}

async function boot() {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    showError('이 편집기는 https 주소에서만 동작합니다.');
    return;
  }
  try {
    const { createEditor } = await import(SDK);
    editor = await createEditor('#editor', { requestTimeoutMs: 20000 });
  } catch (error) {
    console.error('[hwp-editor] editor failed to start', error);
    showError();
    return;
  }
  els.overlay.hidden = true;
  setReady(true);

  const handoff = await takeDocument();
  if (handoff) {
    await loadBytes(handoff.bytes, handoff.name);
  } else {
    say('편집기가 준비됐어요. "파일 열기"를 누르거나 문서를 끌어다 놓으세요. 새 문서는 바로 작성하면 됩니다.');
  }
}

// ---- wiring ----
els.open.addEventListener('click', () => els.input.click());
els.input.addEventListener('change', event => {
  openFile(event.target.files[0]);
  event.target.value = '';
});
els.saveHwp.addEventListener('click', () => save('hwp'));
els.saveHwpx.addEventListener('click', () => save('hwpx'));

// Files dropped on the page (the editor iframe swallows drops over itself, so the
// bar and the page edges act as drop targets).
['dragenter', 'dragover'].forEach(type => document.addEventListener(type, event => {
  if (![...(event.dataTransfer?.types || [])].includes('Files')) return;
  event.preventDefault();
  els.stage.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach(type => document.addEventListener(type, event => {
  if (type === 'dragleave' && event.relatedTarget) return;
  els.stage.classList.remove('is-dragging');
}));
document.addEventListener('drop', event => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  event.preventDefault();
  openFile(file);
});

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    save('hwp');
  }
});

boot();

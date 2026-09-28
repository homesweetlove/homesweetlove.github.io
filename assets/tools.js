const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
});

const tabs = document.querySelectorAll('.tool-tab[data-tool]');
const panels = document.querySelectorAll('.tool-panel');
function openTool(name) {
  tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.tool === name));
  panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === name));
  history.replaceState(null, '', `#${name}`);
}
tabs.forEach(tab => tab.addEventListener('click', () => openTool(tab.dataset.tool)));
const initialTool = window.location.hash.slice(1);
if ([...panels].some(panel => panel.dataset.panel === initialTool)) openTool(initialTool);

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function copyText(value, messageElement) {
  navigator.clipboard.writeText(value).then(() => {
    messageElement.textContent = '클립보드에 복사했습니다.';
    messageElement.classList.remove('error');
  }).catch(() => {
    messageElement.textContent = '복사하지 못했습니다. 결과를 직접 선택해주세요.';
    messageElement.classList.add('error');
  });
}

const documentEditor = document.getElementById('document-editor');
const documentTitle = document.getElementById('document-title');
const documentMessage = document.getElementById('document-message');
const saveState = document.getElementById('save-state');
const documentStats = document.getElementById('document-stats');
const documentStorageKey = 'my-dev-document';
function updateDocumentStats() {
  const text = documentEditor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  documentStats.textContent = `${text.length}자 · ${words}단어`;
}
function saveDocument() {
  localStorage.setItem(documentStorageKey, JSON.stringify({ title: documentTitle.value, content: documentEditor.innerHTML }));
  saveState.textContent = '자동 저장됨';
  updateDocumentStats();
}
const savedDocument = localStorage.getItem(documentStorageKey);
if (savedDocument) {
  try {
    const parsed = JSON.parse(savedDocument);
    documentTitle.value = parsed.title || documentTitle.value;
    documentEditor.innerHTML = parsed.content || documentEditor.innerHTML;
  } catch (error) { localStorage.removeItem(documentStorageKey); }
}
documentEditor.addEventListener('input', saveDocument);
documentTitle.addEventListener('input', saveDocument);

document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('mousedown', event => {
  event.preventDefault();
  document.execCommand(button.dataset.command, false, null);
  documentEditor.focus();
  saveDocument();
}));
document.getElementById('block-format').addEventListener('change', event => {
  document.execCommand('formatBlock', false, event.target.value);
  documentEditor.focus();
  saveDocument();
});
document.getElementById('font-size').addEventListener('change', event => {
  document.execCommand('fontSize', false, event.target.value);
  documentEditor.focus();
  saveDocument();
});
document.getElementById('clear-document').addEventListener('click', () => {
  if (!confirm('현재 문서를 비우고 새 문서를 만들까요?')) return;
  documentTitle.value = '새 문서';
  documentEditor.innerHTML = '<h1>새 문서</h1><p>여기에 내용을 작성하세요.</p>';
  saveDocument();
  documentMessage.textContent = '새 문서를 만들었습니다.';
});
document.getElementById('load-document').addEventListener('click', () => document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  if (/\.(hwpx?|hml)$/i.test(file.name)) {
    // HWP files open in the HWP editor page (keeps the original layout).
    const tab = window.open('hwp-editor.html', '_blank');
    file.arrayBuffer()
      .then(buffer => import(new URL('assets/hwp-handoff.js', location.href).href).then(m => m.stashDocument(file.name, new Uint8Array(buffer))))
      .then(() => { documentMessage.textContent = tab ? 'HWP 문서는 새 탭의 HWP 편집기에서 열립니다.' : '팝업이 막혔어요. 팝업을 허용한 뒤 다시 시도해주세요.'; })
      .catch(() => { documentMessage.textContent = 'HWP 편집기로 문서를 넘기지 못했습니다. 편집기에서 직접 열어주세요.'; });
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const wrapper = document.createElement('div');
    const lowerName = file.name.toLowerCase();
    wrapper.innerHTML = lowerName.endsWith('.txt') || lowerName.endsWith('.md') ? `<p>${String(reader.result).replace(/\n/g, '<br>')}</p>` : reader.result;
    documentTitle.value = file.name.replace(/\.(html?|txt|md|markdown)$/i, '');
    documentEditor.innerHTML = wrapper.innerHTML;
    saveDocument();
    documentMessage.textContent = `${file.name}을(를) 불러왔습니다.`;
  };
  reader.readAsText(file);
  event.target.value = '';
});
function documentHtml() {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${documentTitle.value}</title><style>body{font-family:Arial,sans-serif;line-height:1.7;max-width:760px;margin:50px auto;padding:0 24px}h1{font-size:28px}h2{border-bottom:1px solid #ddd;padding-bottom:5px}</style></head><body>${documentEditor.innerHTML}</body></html>`;
}
function documentBaseName() { return documentTitle.value.trim().replace(/[\\/:*?"<>|]/g, '') || '문서'; }
document.getElementById('download-doc').addEventListener('click', () => { downloadFile(`${documentBaseName()}.doc`, '\ufeff' + documentHtml(), 'application/msword'); documentMessage.textContent = '한글·Word에서 열 수 있는 호환 문서를 저장했습니다.'; });
document.getElementById('download-html').addEventListener('click', () => { downloadFile(`${documentBaseName()}.html`, documentHtml(), 'text/html;charset=utf-8'); documentMessage.textContent = 'HTML 문서를 저장했습니다.'; });
document.getElementById('download-md').addEventListener('click', () => { downloadFile(`${documentBaseName()}.md`, htmlToMarkdown(documentEditor), 'text/markdown;charset=utf-8'); documentMessage.textContent = 'Markdown 문서를 저장했습니다.'; });
document.getElementById('download-txt').addEventListener('click', () => { downloadFile(`${documentBaseName()}.txt`, documentEditor.innerText, 'text/plain;charset=utf-8'); documentMessage.textContent = '텍스트 문서를 저장했습니다.'; });
document.getElementById('print-pdf').addEventListener('click', () => { saveDocument(); window.print(); documentMessage.textContent = '인쇄 대화상자에서 "PDF로 저장"을 선택하세요.'; });
function htmlToMarkdown(editor) {
  let result = editor.innerHTML.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n').replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n').replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n').replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**').replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*').replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  const temporary = document.createElement('textarea'); temporary.innerHTML = result; return temporary.value.replace(/\n{3,}/g, '\n\n').trim();
}
updateDocumentStats();

const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const jsonMessage = document.getElementById('json-message');
function transformJson(compact) {
  try {
    const value = JSON.parse(jsonInput.value);
    jsonOutput.textContent = JSON.stringify(value, null, compact ? 0 : 2);
    jsonMessage.textContent = compact ? '한 줄 JSON으로 변환했습니다.' : '유효한 JSON입니다.';
    jsonMessage.classList.remove('error');
  } catch (error) { jsonOutput.textContent = ''; jsonMessage.textContent = `JSON 오류: ${error.message}`; jsonMessage.classList.add('error'); }
}
document.getElementById('json-format').addEventListener('click', () => transformJson(false));
document.getElementById('json-minify').addEventListener('click', () => transformJson(true));
document.getElementById('json-copy').addEventListener('click', () => copyText(jsonOutput.textContent, jsonMessage));
jsonInput.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') transformJson(false); });
transformJson(false);

const textInput = document.getElementById('text-input');
const textMessage = document.getElementById('text-message');
function updateTextStats() { const value = textInput.value; document.getElementById('char-count').textContent = value.length; document.getElementById('word-count').textContent = value.trim() ? value.trim().split(/\s+/).length : 0; document.getElementById('line-count').textContent = value ? value.split(/\r?\n/).length : 0; }
function setText(value, message) { textInput.value = value; updateTextStats(); textMessage.textContent = message; textMessage.classList.remove('error'); }
textInput.addEventListener('input', updateTextStats);
document.getElementById('text-clean').addEventListener('click', () => setText(textInput.value.split(/\r?\n/).map(line => line.trim().replace(/[ \t]+/g, ' ')).join('\n'), '줄 앞뒤와 연속 공백을 정리했습니다.'));
document.getElementById('text-lines').addEventListener('click', () => setText(textInput.value.split(/\r?\n/).filter(line => line.trim()).join('\n'), '빈 줄을 제거했습니다.'));
document.getElementById('text-copy').addEventListener('click', () => copyText(textInput.value, textMessage));
updateTextStats();

const timestampInput = document.getElementById('timestamp-input');
const dateInput = document.getElementById('date-input');
const timestampResult = document.getElementById('timestamp-result');
function showConversion(value) { timestampResult.textContent = value; }
document.getElementById('timestamp-to-date').addEventListener('click', () => { const raw = timestampInput.value.trim(); const number = Number(raw); if (!raw || !Number.isFinite(number)) return showConversion('올바른 timestamp를 입력해주세요.'); const date = new Date(raw.length <= 10 ? number * 1000 : number); if (Number.isNaN(date.getTime())) return showConversion('변환할 수 없는 시간입니다.'); showConversion(`${date.toLocaleString('ko-KR')}  ·  ISO ${date.toISOString()}`); });
document.getElementById('date-to-timestamp').addEventListener('click', () => { if (!dateInput.value) return showConversion('날짜와 시간을 선택해주세요.'); const milliseconds = new Date(dateInput.value).getTime(); showConversion(`초: ${Math.floor(milliseconds / 1000)}  ·  밀리초: ${milliseconds}`); });

let timerSeconds = 25 * 60; let timerTotal = timerSeconds; let timerId = null;
const timerDisplay = document.getElementById('timer-display'); const timerLabel = document.getElementById('timer-label'); const timerProgress = document.getElementById('timer-progress'); const timerStart = document.getElementById('timer-start');
function renderTimer() { const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0'); const seconds = String(timerSeconds % 60).padStart(2, '0'); timerDisplay.textContent = `${minutes}:${seconds}`; timerProgress.style.width = `${((timerTotal - timerSeconds) / timerTotal) * 100}%`; if (document.querySelector('[data-panel="focus"].is-active')) document.title = `${minutes}:${seconds} · 업무 도구`; }
function stopTimer() { clearInterval(timerId); timerId = null; timerStart.textContent = '시작'; }
timerStart.addEventListener('click', () => { if (timerId) return stopTimer(); timerStart.textContent = '일시정지'; timerId = setInterval(() => { timerSeconds -= 1; if (timerSeconds <= 0) { timerSeconds = 0; stopTimer(); timerLabel.textContent = '완료했습니다'; } renderTimer(); }, 1000); });
document.getElementById('timer-reset').addEventListener('click', () => { stopTimer(); timerSeconds = timerTotal; timerLabel.textContent = '집중할 시간'; renderTimer(); });
document.querySelectorAll('.preset').forEach(preset => preset.addEventListener('click', () => { stopTimer(); timerTotal = Number(preset.dataset.minutes) * 60; timerSeconds = timerTotal; timerLabel.textContent = preset.dataset.minutes === '25' ? '집중할 시간' : '잠깐 쉬어갈 시간'; document.querySelectorAll('.preset').forEach(item => item.classList.toggle('is-active', item === preset)); renderTimer(); }));
renderTimer();

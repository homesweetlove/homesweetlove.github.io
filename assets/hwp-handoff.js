// Hands a document from the HWP viewer to the HWP editor page.
// The bytes stay in this browser (IndexedDB, same origin) and are removed once picked up.

const DB_NAME = 'hsl-hwp-handoff';
const STORE = 'files';
const KEY = 'pending';
const MAX_AGE_MS = 10 * 60 * 1000;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(result.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  }));
}

export async function stashDocument(name, bytes) {
  const copy = bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes);
  await run('readwrite', store => store.put({ name, bytes: copy, at: Date.now() }, KEY));
}

export async function takeDocument() {
  try {
    const item = await run('readonly', store => store.get(KEY));
    if (!item) return null;
    await run('readwrite', store => store.delete(KEY));
    if (Date.now() - item.at > MAX_AGE_MS) return null;
    return item;
  } catch {
    return null;
  }
}

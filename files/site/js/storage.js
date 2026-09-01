// Funções utilitárias de armazenamento local (equivalente a src/services/storage.ts)
function ler(chave, fallback) {
  try {
    const raw = window.localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* ignora quota */
  }
}

function apagar(chave) {
  window.localStorage.removeItem(chave);
}

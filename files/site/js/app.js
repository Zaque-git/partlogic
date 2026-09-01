// Estado central do app (equivalente a src/hooks/use-app.tsx + use-preferencias.tsx)
// Os dados de usuário, veículos, histórico e manutenções são carregados do backend (Flask + PostgreSQL)
// por meio de js/api.js. Apenas preferências de sessão/UI (usuário logado, tema, idioma) ficam no localStorage.

const K_USER = "partlogic.usuario";
const K_TEMA = "partlogic.tema";
const K_IDIOMA = "partlogic.idioma";

const idiomas = [
  { valor: "pt-BR", label: "Português (Brasil)" },
  { valor: "en", label: "English" },
  { valor: "es", label: "Español" },
  { valor: "fr", label: "Français" },
  { valor: "de", label: "Deutsch" },
  { valor: "zh", label: "中文" },
  { valor: "ja", label: "日本語" },
];

const dicionario = {
  "pt-BR": { dashboard: "Dashboard", consultar: "Consultar peças", veiculos: "Meus veículos", manutencao: "Manutenção preventiva", historico: "Histórico", perfil: "Perfil", configuracoes: "Configurações", sair: "Sair", preferencias: "Preferências", tema: "Tema", temaEscuro: "Tema escuro", temaClaro: "Tema claro", idioma: "Idioma", ajuda: "Ajuda", suporte: "Suporte" },
  en: { dashboard: "Dashboard", consultar: "Check parts", veiculos: "My vehicles", manutencao: "Preventive maintenance", historico: "History", perfil: "Profile", configuracoes: "Settings", sair: "Sign out", preferencias: "Preferences", tema: "Theme", temaEscuro: "Dark theme", temaClaro: "Light theme", idioma: "Language", ajuda: "Help", suporte: "Support" },
  es: { dashboard: "Panel", consultar: "Consultar piezas", veiculos: "Mis vehículos", manutencao: "Mantenimiento preventivo", historico: "Historial", perfil: "Perfil", configuracoes: "Configuración", sair: "Salir", preferencias: "Preferencias", tema: "Tema", temaEscuro: "Tema oscuro", temaClaro: "Tema claro", idioma: "Idioma", ajuda: "Ayuda", suporte: "Soporte" },
  fr: { dashboard: "Tableau de bord", consultar: "Vérifier les pièces", veiculos: "Mes véhicules", manutencao: "Entretien préventif", historico: "Historique", perfil: "Profil", configuracoes: "Paramètres", sair: "Se déconnecter", preferencias: "Préférences", tema: "Thème", temaEscuro: "Thème sombre", temaClaro: "Thème clair", idioma: "Langue", ajuda: "Aide", suporte: "Assistance" },
  de: { dashboard: "Übersicht", consultar: "Teile prüfen", veiculos: "Meine Fahrzeuge", manutencao: "Vorbeugende Wartung", historico: "Verlauf", perfil: "Profil", configuracoes: "Einstellungen", sair: "Abmelden", preferencias: "Präferenzen", tema: "Design", temaEscuro: "Dunkles Design", temaClaro: "Helles Design", idioma: "Sprache", ajuda: "Hilfe", suporte: "Support" },
  zh: { dashboard: "仪表盘", consultar: "查询配件", veiculos: "我的车辆", manutencao: "预防性保养", historico: "历史记录", perfil: "个人资料", configuracoes: "设置", sair: "退出", preferencias: "偏好设置", tema: "主题", temaEscuro: "深色主题", temaClaro: "浅色主题", idioma: "语言", ajuda: "帮助", suporte: "支持" },
  ja: { dashboard: "ダッシュボード", consultar: "部品を照会", veiculos: "車両一覧", manutencao: "予防メンテナンス", historico: "履歴", perfil: "プロフィール", configuracoes: "設定", sair: "ログアウト", preferencias: "環境設定", tema: "テーマ", temaEscuro: "ダークテーマ", temaClaro: "ライトテーマ", idioma: "言語", ajuda: "ヘルプ", suporte: "サポート" },
};

// ---------- Normalizadores (snake_case do backend -> camelCase usado nas páginas) ----------
function normalizarUsuario(u) {
  if (!u) return null;
  return {
    id: String(u.id),
    nome: u.name ?? u.nome,
    email: u.email,
    telefone: u.phone ?? u.telefone ?? "",
    criadoEm: u.created_at ?? u.criadoEm ?? new Date().toISOString(),
  };
}

function normalizarVeiculo(v) {
  return {
    id: String(v.id),
    tipo: v.veiculo_tipo ?? v.tipo,
    marca: v.marca,
    modelo: v.modelo,
    ano: Number(v.ano),
    versao: v.versao || "—",
    motor: v.motor || "",
    combustivel: v.combustivel || "",
    placa: v.placa || "",
    principal: !!v.principal,
    criadoEm: v.criado_em ?? v.criadoEm ?? new Date().toISOString(),
  };
}

function normalizarDiagnostico(h) {
  const veiculoId = h.veiculo_id ?? h.veiculoId;
  return {
    id: String(h.id),
    data: h.criado_em ?? h.data ?? new Date().toISOString(),
    veiculoId: veiculoId === null || veiculoId === undefined ? null : String(veiculoId),
    veiculoLabel: h.veiculo_label ?? h.veiculoLabel,
    veiculoTipo: h.veiculo_tipo ?? h.veiculoTipo,
    veiculoMarca: h.veiculo_marca ?? h.veiculoMarca,
    pecaNome: h.peca_nome ?? h.pecaNome,
    pecaCodigo: h.peca_codigo ?? h.pecaCodigo,
    categoria: h.categoria,
    resultado: h.resultado,
    motivo: h.motivo,
    grau: h.grau,
  };
}

function normalizarManutencao(m) {
  const dataPrevista = typeof m.data_prevista === "string" ? m.data_prevista.slice(0, 10) : (m.dataPrevista || "");
  let status = m.status;
  // Se a manutenção ainda está "Agendada" mas a data prevista já passou, exibimos como atrasada.
  if (status === "Agendada" && dataPrevista && dataPrevista < new Date().toISOString().slice(0, 10)) {
    status = "Atrasada";
  }
  return {
    id: String(m.id),
    veiculoId: String(m.veiculo_id ?? m.veiculoId),
    veiculoLabel: m.veiculo_label ?? m.veiculoLabel,
    tipo: m.tipo,
    dataPrevista,
    kmPrevisto: m.km_previsto ?? m.kmPrevisto ?? null,
    status,
    criadoEm: m.criado_em ?? m.criadoEm ?? new Date().toISOString(),
  };
}

const App = {
  usuario: null,
  veiculos: [],
  historico: [],
  manutencoes: [],
  tema: "escuro",
  idioma: "pt-BR",

  async init() {
    this.usuario = normalizarUsuario(ler(K_USER, null));
    this.tema = ler(K_TEMA, "escuro");
    this.idioma = ler(K_IDIOMA, "pt-BR");
    document.documentElement.classList.toggle("dark", this.tema === "escuro");
    document.documentElement.lang = this.idioma;

    if (this.usuario) {
      await this.recarregarDados();
    }
  },

  async recarregarDados() {
    if (!this.usuario) return;
    const [veiculos, historico, manutencoes] = await Promise.all([
      vehiclesApi.listar(this.usuario.id).catch(() => []),
      diagnoseApi.listar(this.usuario.id).catch(() => []),
      maintenanceApi.listar(this.usuario.id).catch(() => []),
    ]);
    this.veiculos = (veiculos || []).map(normalizarVeiculo);
    this.historico = (historico || []).map(normalizarDiagnostico);
    this.manutencoes = (manutencoes || []).map(normalizarManutencao);
  },

  t(chave) {
    return (dicionario[this.idioma] && dicionario[this.idioma][chave]) ?? dicionario["pt-BR"][chave];
  },

  definirTema(novo) {
    this.tema = novo;
    gravar(K_TEMA, novo);
    document.documentElement.classList.toggle("dark", novo === "escuro");
  },

  definirIdioma(novo) {
    this.idioma = novo;
    gravar(K_IDIOMA, novo);
    document.documentElement.lang = novo;
  },

  async entrar(email, senha) {
    const resposta = await authApi.login(email, senha);
    const usuario = normalizarUsuario(resposta.user);
    gravar(K_USER, usuario);
    this.usuario = usuario;
    await this.recarregarDados();
  },

  async cadastrar({ nome, email, telefone, senha }) {
    const resposta = await authApi.registrar({ nome, email, telefone, senha });
    const usuario = normalizarUsuario(resposta.user);
    gravar(K_USER, usuario);
    this.usuario = usuario;
    await this.recarregarDados();
  },

  sair() {
    apagar(K_USER);
    this.usuario = null;
    this.veiculos = [];
    this.historico = [];
    this.manutencoes = [];
  },

  async atualizarPerfil(dados) {
    if (!this.usuario) return;
    const resposta = await authApi.atualizarPerfil({ id: this.usuario.id, ...dados });
    this.usuario = normalizarUsuario(resposta.user);
    gravar(K_USER, this.usuario);
  },

  async salvarVeiculo(dados) {
    let veiculo;
    if (dados.id) {
      const resposta = await vehiclesApi.atualizar(dados.id, dados);
      veiculo = normalizarVeiculo(resposta.veiculo);
      this.veiculos = this.veiculos.map((v) => (v.id === veiculo.id ? veiculo : v));
    } else {
      const resposta = await vehiclesApi.criar(this.usuario.id, dados);
      veiculo = normalizarVeiculo(resposta.veiculo);
      this.veiculos = [...this.veiculos, veiculo];
    }
    return veiculo;
  },

  async excluirVeiculo(id) {
    await vehiclesApi.remover(id);
    this.veiculos = this.veiculos.filter((v) => v.id !== id);
  },

  async definirPrincipal(id) {
    await vehiclesApi.definirPrincipal(id, this.usuario.id);
    this.veiculos = this.veiculos.map((v) => ({ ...v, principal: v.id === id }));
  },

  async registrarVerificacao(dados) {
    const resposta = await diagnoseApi.registrar(this.usuario.id, dados);
    const item = normalizarDiagnostico(resposta.diagnostico);
    this.historico = [item, ...this.historico];
    return item;
  },

  async salvarManutencao(dados) {
    const resposta = await maintenanceApi.criar(this.usuario.id, dados);
    const item = normalizarManutencao(resposta.manutencao);
    this.manutencoes = [item, ...this.manutencoes];
    return item;
  },

  async excluirManutencao(id) {
    await maintenanceApi.remover(id);
    this.manutencoes = this.manutencoes.filter((m) => m.id !== id);
  },

  async atualizarStatusManutencao(id, status) {
    await maintenanceApi.atualizarStatus(id, status);
    this.manutencoes = this.manutencoes.map((m) => (m.id === id ? { ...m, status } : m));
  },

  async limparHistorico() {
    await diagnoseApi.limpar(this.usuario.id);
    this.historico = [];
  },
};

// ---------- Utilidades ----------
function formatarValor(valor) {
  if (valor === undefined || valor === null || Number.isNaN(valor)) return "Não informado";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const iconePorTipo = { Carro: "car", Moto: "bike", Caminhão: "truck", Ônibus: "bus", Van: "van", Outro: "tractor" };
const iconePorCategoria = { Filtros: "filter", Freios: "disc", "Suspensão": "settings2", Motor: "cog", "Elétrica": "zap", "Transmissão": "fuel" };

function resultadoCardClass(resultado) {
  return { COMPATIVEL: "card-ok", INCOMPATIVEL: "card-bad", VERIFICAR: "card-warn" }[resultado] || "";
}

// ---------- Toasts ----------
function ensureToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  return root;
}

const toast = {
  _show(msg, kind) {
    const root = ensureToastRoot();
    const el = document.createElement("div");
    el.className = `toast toast-${kind}`;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .2s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, 3200);
  },
  success(msg) { this._show(msg, "success"); },
  error(msg) { this._show(msg, "error"); },
  warning(msg) { this._show(msg, "warning"); },
  info(msg) { this._show(msg, "info"); },
};

// ---------- Navegação do app (sidebar / topbar / bottom nav) ----------
const NAVEGACAO = [
  { href: "dashboard.html", chave: "dashboard", label: "Dashboard", icone: "dashboard" },
  { href: "verificar.html", chave: "consultar", label: "Consultar peças", icone: "scan" },
  { href: "veiculos.html", chave: "veiculos", label: "Meus veículos", icone: "car" },
  { href: "manutencao.html", chave: "manutencao", label: "Manutenção preventiva", icone: "wrench" },
  { href: "historico.html", chave: "historico", label: "Histórico", icone: "clipboard" },
  { href: "perfil.html", chave: "perfil", label: "Perfil", icone: "user" },
  { href: "configuracoes.html", chave: "configuracoes", label: "Configurações", icone: "settings" },
];

function paginaAtual() {
  return location.pathname.split("/").pop() || "dashboard.html";
}

function iniciaisNome(nome) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

// Protege páginas do app: exige login. Chame no topo de cada página autenticada.
// Como App.init() busca dados no backend, protegerRota() agora é assíncrona:
// use `if (await protegerRota()) { ... }` dentro de uma função/IIFE async.
async function protegerRota() {
  await App.init();
  if (!App.usuario) {
    location.replace("login.html");
    return false;
  }
  montarShellApp();
  return true;
}

function montarShellApp() {
  const atual = paginaAtual();
  const iniciais = iniciaisNome(App.usuario.nome);

  const linksDesktop = NAVEGACAO.map((item) => `
    <a class="nav-item ${item.href === atual ? "active" : ""}" href="${item.href}">
      ${icon(item.icone)}<span>${App.t(item.chave)}</span>
    </a>`).join("");

  const linksMobileTop4 = NAVEGACAO.slice(0, 4).map((item) => `
    <a class="${item.href === atual ? "active" : ""}" href="${item.href}">
      ${icon(item.icone)}<span>${item.label.split(" ")[0]}</span>
    </a>`).join("");

  const linksMobileMenu = NAVEGACAO.map((item) => `
    <a class="nav-item ${item.href === atual ? "active" : ""}" href="${item.href}">
      ${icon(item.icone)}<span>${App.t(item.chave)}</span>
    </a>`).join("");

  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = `
    <aside class="sidebar">
      <a href="dashboard.html" class="sidebar-brand"><span class="logo">Part<span class="accent">Logic</span></span></a>
      <nav class="sidebar-nav">${linksDesktop}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <span class="avatar">${escapeHtml(iniciais)}</span>
          <div class="who">
            <p class="truncate">${escapeHtml(App.usuario.nome)}</p>
            <p class="truncate">${escapeHtml(App.usuario.email)}</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-block" style="justify-content:flex-start;margin-top:.25rem" id="btn-sair-desktop">
          ${icon("logout")} ${App.t("sair")}
        </button>
      </div>
    </aside>
    <div class="app-main">
      <header class="topbar">
        <a href="dashboard.html" class="logo">Part<span class="accent">Logic</span></a>
        <div class="flex gap-2" style="align-items:center">
          <span class="avatar">${escapeHtml(iniciais)}</span>
          <button class="btn btn-ghost btn-icon" id="btn-menu-mobile" aria-label="Abrir menu">${icon("menu")}</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobile-menu" style="display:none">
        ${linksMobileMenu}
        <button class="btn btn-ghost" style="justify-content:flex-start" id="btn-sair-mobile">${icon("logout")} ${App.t("sair")}</button>
      </nav>
      <main class="app-content" id="app-content"></main>
      <nav class="bottom-nav">${linksMobileTop4}</nav>
    </div>
  `;

  const placeholder = document.getElementById("app-root");
  placeholder.replaceWith(shell);

  // move a conteúdo estático da página (definido em <template id="page-content">) para dentro do shell
  const template = document.getElementById("page-content");
  if (template) {
    document.getElementById("app-content").appendChild(template.content.cloneNode(true));
  }

  function encerrar() {
    App.sair();
    location.replace("login.html");
  }
  document.getElementById("btn-sair-desktop").addEventListener("click", encerrar);
  document.getElementById("btn-sair-mobile").addEventListener("click", encerrar);
  document.getElementById("btn-menu-mobile").addEventListener("click", () => {
    const menu = document.getElementById("mobile-menu");
    const abrir = menu.style.display === "none";
    menu.style.display = abrir ? "flex" : "none";
    document.getElementById("btn-menu-mobile").innerHTML = abrir ? icon("x") : icon("menu");
  });

  // Adiado para depois do script síncrono da página, que ainda vai registrar
  // o listener de "shell-ready" nas linhas seguintes (protegerRota() é chamado
  // antes desse addEventListener em cada página).
  setTimeout(() => document.dispatchEvent(new CustomEvent("shell-ready")), 0);
}

// ---------- Helpers de UI reutilizáveis ----------
function emptyState({ icone, titulo, descricao, acaoHtml }) {
  return `
    <div class="empty-state">
      <div class="ic">${icon(icone)}</div>
      <h3>${escapeHtml(titulo)}</h3>
      <p>${escapeHtml(descricao)}</p>
      ${acaoHtml ? `<div class="action">${acaoHtml}</div>` : ""}
    </div>`;
}

function compatBadgeInfo(resultado) {
  const mapa = {
    COMPATIVEL: { label: "Peça compatível", curto: "Compatível", simbolo: "✓", icone: "checkcircle", classe: "badge-ok", forte: "card-ok", mensagem: "Esta peça pode ser utilizada no veículo selecionado." },
    INCOMPATIVEL: { label: "Peça não compatível", curto: "Não compatível", simbolo: "✕", icone: "xcircle", classe: "badge-bad", forte: "card-bad", mensagem: "Esta peça não é indicada para o veículo selecionado." },
    VERIFICAR: { label: "Compatibilidade não confirmada", curto: "Não confirmada", simbolo: "⚠", icone: "alerttriangle", classe: "badge-warn", forte: "card-warn", mensagem: "Os dados disponíveis não são suficientes para confirmar a compatibilidade." },
  };
  return mapa[resultado];
}

function compatBadge(resultado, { tamanho = "sm", curto = false } = {}) {
  const info = compatBadgeInfo(resultado);
  return `<span class="badge ${tamanho === "lg" ? "badge-lg" : ""} ${info.classe}">
    ${icon(info.icone)}<span aria-hidden="true">${info.simbolo}</span>${curto ? info.curto : info.label}
  </span>`;
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ---------- Modais genéricos ----------
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

// Fecha modal ao clicar fora ou pressionar Esc
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("open");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".modal-overlay.open").forEach((m) => m.classList.remove("open"));
});

// ---------- Select customizado (substitui o Select do shadcn) ----------
let _selectOutsideClickBound = false;
function initCustomSelects(scope = document) {
  scope.querySelectorAll(".select:not([data-init='1'])").forEach((sel) => {
    sel.dataset.init = "1";
    const trigger = sel.querySelector(".select-trigger");
    const menu = sel.querySelector(".select-menu");
    trigger.addEventListener("click", () => {
      if (trigger.disabled) return;
      document.querySelectorAll(".select.open").forEach((s) => { if (s !== sel) s.classList.remove("open"); });
      sel.classList.toggle("open");
    });
    menu.querySelectorAll(".select-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        sel.dispatchEvent(new CustomEvent("select-change", { detail: opt.dataset.value }));
      });
    });
  });
  if (!_selectOutsideClickBound) {
    _selectOutsideClickBound = true;
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".select.open").forEach((sel) => {
        if (!sel.contains(e.target)) sel.classList.remove("open");
      });
    });
  }
}

function setSelectValue(selectEl, value, label) {
  selectEl.dataset.value = value ?? "";
  const valueEl = selectEl.querySelector(".select-value");
  if (valueEl) valueEl.textContent = label ?? "";
  selectEl.querySelectorAll(".select-option").forEach((o) => o.classList.toggle("active", o.dataset.value === value));
  selectEl.classList.remove("open");
}

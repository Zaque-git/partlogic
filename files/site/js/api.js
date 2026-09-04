// Camada de integração com o backend Flask (equivalente a src/services/api.ts)
// IMPORTANTE: depois de publicar o backend (ex.: no Render), troque a linha abaixo
// pela URL pública do backend, por exemplo:
//   const API_BASE_URL = "https://partlogic-backend.onrender.com/api";
// Em localhost (http://127.0.0.1 ou http://localhost) ele usa automaticamente
// o backend local na porta 5000, sem precisar mexer em nada durante o desenvolvimento.
const API_BASE_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
  ? "http://localhost:5000/api"
  : "https://SEU-BACKEND-AQUI.onrender.com/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest(path, { method = "GET", body, params } = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    ).toString();
    if (query) url += `?${query}`;
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.", 0);
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const msg = (dados && (dados.error || dados.erro)) || "Ocorreu um erro ao falar com o servidor.";
    throw new ApiError(msg, resposta.status);
  }

  return dados;
}

// ---------- Autenticação ----------
const authApi = {
  login(email, senha) {
    return apiRequest("/auth/login", { method: "POST", body: { email, password: senha } });
  },
  registrar({ nome, email, telefone, senha }) {
    return apiRequest("/auth/register", { method: "POST", body: { name: nome, email, phone: telefone, password: senha } });
  },
  atualizarPerfil({ id, nome, email, telefone }) {
    return apiRequest("/auth/perfil", { method: "PUT", body: { user_id: id, name: nome, email, phone: telefone } });
  },
};

// ---------- Veículos ----------
const vehiclesApi = {
  listar(userId) {
    return apiRequest("/veiculos/", { params: { user_id: userId } });
  },
  criar(userId, dados) {
    return apiRequest("/veiculos/", {
      method: "POST",
      body: {
        user_id: userId,
        veiculo_tipo: dados.tipo,
        marca: dados.marca,
        modelo: dados.modelo,
        ano: dados.ano,
        versao: dados.versao,
        motor: dados.motor,
        combustivel: dados.combustivel,
        placa: dados.placa,
      },
    });
  },
  atualizar(id, dados) {
    return apiRequest(`/veiculos/${id}`, {
      method: "PUT",
      body: {
        veiculo_tipo: dados.tipo,
        marca: dados.marca,
        modelo: dados.modelo,
        ano: dados.ano,
        versao: dados.versao,
        motor: dados.motor,
        combustivel: dados.combustivel,
        placa: dados.placa,
      },
    });
  },
  definirPrincipal(id, userId) {
    return apiRequest(`/veiculos/${id}/principal`, { method: "PATCH", body: { user_id: userId } });
  },
  remover(id) {
    return apiRequest(`/veiculos/${id}`, { method: "DELETE" });
  },
};

// ---------- Histórico de verificações (diagnósticos) ----------
const diagnoseApi = {
  listar(userId) {
    return apiRequest("/diagnosticos/", { params: { user_id: userId } });
  },
  registrar(userId, dados) {
    return apiRequest("/diagnosticos/", {
      method: "POST",
      body: {
        user_id: userId,
        veiculo_id: dados.veiculoId,
        veiculo_label: dados.veiculoLabel,
        veiculo_tipo: dados.veiculoTipo,
        veiculo_marca: dados.veiculoMarca,
        peca_nome: dados.pecaNome,
        peca_codigo: dados.pecaCodigo,
        categoria: dados.categoria,
        resultado: dados.resultado,
        motivo: dados.motivo,
        grau: dados.grau,
        origem: dados.origem,
      },
    });
  },
  limpar(userId) {
    return apiRequest("/diagnosticos/", { method: "DELETE", params: { user_id: userId } });
  },
};

// ---------- Manutenção preventiva ----------
const maintenanceApi = {
  listar(userId) {
    return apiRequest("/manutencoes/", { params: { user_id: userId } });
  },
  criar(userId, dados) {
    return apiRequest("/manutencoes/", {
      method: "POST",
      body: {
        user_id: userId,
        veiculo_id: dados.veiculoId,
        veiculo_label: dados.veiculoLabel,
        tipo: dados.tipo,
        data_prevista: dados.dataPrevista,
        km_previsto: dados.kmPrevisto,
        status: dados.status,
      },
    });
  },
  atualizarStatus(id, status) {
    return apiRequest(`/manutencoes/${id}`, { method: "PUT", body: { status } });
  },
  remover(id) {
    return apiRequest(`/manutencoes/${id}`, { method: "DELETE" });
  },
};

// ---------- Verificação de compatibilidade (cache Postgres + IA Gemini) ----------
const compatApi = {
  verificar({ marca, modelo, ano, motor, nomePeca, codigoPeca }) {
    return apiRequest("/verificar-compatibilidade", {
      method: "POST",
      body: { marca, modelo, ano, motor, nome_peca: nomePeca, codigo_peca: codigoPeca },
    });
  },
};

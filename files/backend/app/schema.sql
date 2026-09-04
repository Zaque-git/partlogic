-- Usuários do sistema
CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garagem individual de cada usuário
CREATE TABLE IF NOT EXISTS veiculos(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    veiculo_tipo VARCHAR(30) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    versao VARCHAR(60),
    motor VARCHAR(40),
    combustivel VARCHAR(30),
    placa VARCHAR(10),
    kilometragem INT,
    peças_modificadas TEXT,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache global e coletivo das análises de compatibilidade feitas pela IA
CREATE TABLE IF NOT EXISTS peças_compartilhadas(
    id SERIAL PRIMARY KEY,
    modelo_veiculo VARCHAR(100) NOT NULL,
    ano_veiculo INT NOT NULL,
    codigo_peça VARCHAR(150) NOT NULL,
    compatibilidade BOOLEAN NOT NULL,
    preco_base NUMERIC(10,2),
    details TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cache_veiculo_peça
ON peças_compartilhadas(modelo_veiculo, codigo_peça);

-- Histórico pessoal de verificações de compatibilidade de cada usuário
CREATE TABLE IF NOT EXISTS diagnosticos(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    veiculo_id INT REFERENCES veiculos(id) ON DELETE SET NULL,
    veiculo_label VARCHAR(150),
    veiculo_tipo VARCHAR(30),
    veiculo_marca VARCHAR(50),
    peca_nome VARCHAR(120),
    peca_codigo VARCHAR(60),
    categoria VARCHAR(60),
    resultado VARCHAR(20) NOT NULL,
    motivo TEXT,
    grau INT,
    origem VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_user
ON diagnosticos(user_id);

-- Manutenções preventivas programadas para os veículos do usuário
CREATE TABLE IF NOT EXISTS manutencoes(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    veiculo_id INT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    veiculo_label VARCHAR(150),
    tipo VARCHAR(80) NOT NULL,
    data_prevista DATE NOT NULL,
    km_previsto INT,
    status VARCHAR(20) NOT NULL DEFAULT 'Agendada',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manutencoes_user
ON manutencoes(user_id);

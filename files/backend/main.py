from flask import Flask, request, jsonify
from flask_cors import CORS
from app.db import init_db, execute_query
from app.routes.auth import auth_bp
from app.routes.vehicles import vehicles_bp
from app.routes.diagnose import diagnose_bp
from app.routes.maintenance import maintenance_bp
from app.services.gemini_service import verificar_compatibilidade_gemini

app = Flask(__name__)
CORS(app)

# Registro de todas as rotas (Blueprints)
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(vehicles_bp, url_prefix='/api/veiculos')
app.register_blueprint(diagnose_bp, url_prefix='/api/diagnosticos')
app.register_blueprint(maintenance_bp, url_prefix='/api/manutencoes')

# Inicialização das tabelas no Banco de Dados
try:
    init_db()
except Exception as e:
    print(f"Aviso ao inicializar banco de dados: {e}")


# Rota Raiz (Health Check)
@app.route("/")
def index():
    return {"status": "Backend Flask rodando com SQL nativo!"}


# Rota de verificação de compatibilidade (usa cache no Postgres + IA Gemini como fallback)
@app.route("/api/verificar-compatibilidade", methods=["POST"])
def verificar_compatibilidade():
    dados = request.get_json(silent=True) or {}

    marca = dados.get('marca')
    modelo_veiculo = dados.get('modelo')
    ano = dados.get('ano')
    motor = dados.get('motor')
    nome_peca = dados.get('nome_peca')
    codigo_peca = dados.get('codigo_peca')

    if not modelo_veiculo or not codigo_peca:
        return jsonify({"erro": "Campos obrigatórios: modelo e codigo_peca"}), 400

    # Tenta buscar no Cache do Banco de Dados primeiro
    try:
        cache = execute_query(
            """
            SELECT compatibilidade, preco_base, details
            FROM peças_compartilhadas
            WHERE modelo_veiculo = %s AND codigo_peça = %s
            ORDER BY data_criacao DESC
            LIMIT 1;
            """,
            (modelo_veiculo, codigo_peca),
            fetch_one=True,
        )

        if cache:
            # Retorna direto do banco, economizando token!
            return jsonify({
                "origem": "cache_banco",
                "compativel": cache['compatibilidade'],
                "preco_base": str(cache['preco_base']) if cache['preco_base'] is not None else None,
                "justificativa": cache['details'],
            }), 200

    except Exception as e:
        print(f"Aviso no cache: {e}")

    # Se NÃO encontrou no cache, chama a IA (gasta token)
    resultado = verificar_compatibilidade_gemini(
        marca=marca,
        modelo=modelo_veiculo,
        ano=ano,
        motor=motor,
        nome_peca=nome_peca,
        codigo_peca=codigo_peca,
    )

    # Se a IA retornou erro (ex.: chave ausente, indisponibilidade), avisa o front sem quebrar
    if resultado.get('erro'):
        resultado['origem'] = 'indisponivel'
        return jsonify(resultado), 200

    # Salva a resposta da IA no banco para as próximas consultas
    try:
        execute_query(
            """
            INSERT INTO peças_compartilhadas
                (modelo_veiculo, ano_veiculo, codigo_peça, compatibilidade, details)
            VALUES (%s, %s, %s, %s, %s);
            """,
            (
                modelo_veiculo,
                ano,
                codigo_peca,
                resultado.get('compativel', False),
                resultado.get('justificativa', ''),
            ),
        )
    except Exception as e:
        print(f"Aviso ao salvar cache: {e}")

    resultado["origem"] = "ia_gemini"
    return jsonify(resultado), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)

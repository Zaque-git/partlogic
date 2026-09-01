from flask import Blueprint, request, jsonify
from app.db import execute_query

diagnose_bp = Blueprint('diagnose', __name__)


# 1. LISTAR HISTÓRICO PESSOAL DE VERIFICAÇÕES (GET /api/diagnosticos/?user_id=1)
@diagnose_bp.route('/', methods=['GET'])
def listar_historico():
    user_id = request.args.get('user_id')
    veiculo_id = request.args.get('veiculo_id')

    try:
        if user_id and veiculo_id:
            historico = execute_query(
                "SELECT * FROM diagnosticos WHERE user_id = %s AND veiculo_id = %s ORDER BY criado_em DESC;",
                (user_id, veiculo_id), fetch_all=True
            )
        elif user_id:
            historico = execute_query(
                "SELECT * FROM diagnosticos WHERE user_id = %s ORDER BY criado_em DESC;",
                (user_id,), fetch_all=True
            )
        else:
            historico = execute_query("SELECT * FROM diagnosticos ORDER BY criado_em DESC;", fetch_all=True)

        return jsonify(historico), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao buscar histórico de diagnósticos", "detalhes": str(e)}), 500


# 2. REGISTRAR UMA VERIFICAÇÃO NO HISTÓRICO PESSOAL (POST /api/diagnosticos/)
@diagnose_bp.route('/', methods=['POST'])
def salvar_verificacao():
    dados = request.get_json(silent=True) or {}

    user_id = dados.get('user_id')
    resultado = dados.get('resultado')

    if not user_id or not resultado:
        return jsonify({"erro": "Campos obrigatórios: user_id e resultado"}), 400

    try:
        novo = execute_query(
            """
            INSERT INTO diagnosticos
                (user_id, veiculo_id, veiculo_label, veiculo_tipo, veiculo_marca,
                 peca_nome, peca_codigo, categoria, resultado, motivo, grau, origem)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                user_id,
                dados.get('veiculo_id') or dados.get('veiculoId'),
                dados.get('veiculo_label') or dados.get('veiculoLabel'),
                dados.get('veiculo_tipo') or dados.get('veiculoTipo'),
                dados.get('veiculo_marca') or dados.get('veiculoMarca'),
                dados.get('peca_nome') or dados.get('pecaNome'),
                dados.get('peca_codigo') or dados.get('pecaCodigo'),
                dados.get('categoria'),
                resultado,
                dados.get('motivo'),
                dados.get('grau'),
                dados.get('origem'),
            ),
            fetch_one=True,
        )
        return jsonify({"mensagem": "Verificação registrada no histórico!", "diagnostico": novo}), 201
    except Exception as e:
        return jsonify({"erro": "Erro ao salvar no banco", "detalhes": str(e)}), 500


# 3. LIMPAR HISTÓRICO DE UM USUÁRIO (DELETE /api/diagnosticos/?user_id=1)
@diagnose_bp.route('/', methods=['DELETE'])
def limpar_historico():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"erro": "Campo obrigatório: user_id"}), 400

    try:
        execute_query("DELETE FROM diagnosticos WHERE user_id = %s;", (user_id,))
        return jsonify({"mensagem": "Histórico removido com sucesso."}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao limpar histórico", "detalhes": str(e)}), 500

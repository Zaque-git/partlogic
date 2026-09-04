from flask import Blueprint, request, jsonify
from app.db import execute_query

maintenance_bp = Blueprint('maintenance', __name__)


# 1. LISTAR MANUTENÇÕES (GET /api/manutencoes/?user_id=1)
@maintenance_bp.route('/', methods=['GET'])
def listar_manutencoes():
    user_id = request.args.get('user_id')
    try:
        if user_id:
            manutencoes = execute_query(
                "SELECT * FROM manutencoes WHERE user_id = %s ORDER BY data_prevista ASC;",
                (user_id,), fetch_all=True
            )
        else:
            manutencoes = execute_query("SELECT * FROM manutencoes ORDER BY data_prevista ASC;", fetch_all=True)
        return jsonify(manutencoes), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao buscar manutenções", "detalhes": str(e)}), 500


# 2. CADASTRAR MANUTENÇÃO (POST /api/manutencoes/)
@maintenance_bp.route('/', methods=['POST'])
def cadastrar_manutencao():
    dados = request.get_json(silent=True) or {}

    user_id = dados.get('user_id')
    veiculo_id = dados.get('veiculo_id') or dados.get('veiculoId')
    tipo = dados.get('tipo')
    data_prevista = dados.get('data_prevista') or dados.get('dataPrevista')

    if not user_id or not veiculo_id or not tipo or not data_prevista:
        return jsonify({"erro": "Campos obrigatórios: user_id, veiculo_id, tipo e data_prevista"}), 400

    try:
        nova = execute_query(
            """
            INSERT INTO manutencoes (user_id, veiculo_id, veiculo_label, tipo, data_prevista, km_previsto, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                user_id, veiculo_id,
                dados.get('veiculo_label') or dados.get('veiculoLabel'),
                tipo, data_prevista,
                dados.get('km_previsto') or dados.get('kmPrevisto'),
                dados.get('status') or 'Agendada',
            ),
            fetch_one=True,
        )
        return jsonify({"mensagem": "Manutenção cadastrada com sucesso!", "manutencao": nova}), 201
    except Exception as e:
        return jsonify({"erro": "Erro ao salvar manutenção", "detalhes": str(e)}), 500


# 3. ATUALIZAR STATUS (OU DADOS) DA MANUTENÇÃO (PUT /api/manutencoes/<id>)
@maintenance_bp.route('/<int:id>', methods=['PUT'])
def atualizar_manutencao(id):
    dados = request.get_json(silent=True) or {}
    status = dados.get('status')

    if not status:
        return jsonify({"erro": "Campo obrigatório: status"}), 400

    try:
        atualizada = execute_query(
            "UPDATE manutencoes SET status = %s WHERE id = %s RETURNING *;",
            (status, id), fetch_one=True,
        )
        if not atualizada:
            return jsonify({"erro": "Manutenção não encontrada"}), 404
        return jsonify({"mensagem": "Manutenção atualizada com sucesso!", "manutencao": atualizada}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao atualizar manutenção", "detalhes": str(e)}), 500


# 4. REMOVER MANUTENÇÃO (DELETE /api/manutencoes/<id>)
@maintenance_bp.route('/<int:id>', methods=['DELETE'])
def deletar_manutencao(id):
    try:
        removida = execute_query(
            "DELETE FROM manutencoes WHERE id = %s RETURNING id;", (id,), fetch_one=True
        )
        if not removida:
            return jsonify({"erro": "Manutenção não encontrada"}), 404
        return jsonify({"mensagem": f"Manutenção com ID {id} removida com sucesso."}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao remover manutenção", "detalhes": str(e)}), 500

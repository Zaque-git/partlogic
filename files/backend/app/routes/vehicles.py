from flask import Blueprint, request, jsonify
from app.db import execute_query

vehicles_bp = Blueprint('vehicles', __name__)


# 1. LISTAR VEÍCULOS (GET /api/veiculos/?user_id=1)
@vehicles_bp.route('/', methods=['GET'])
def listar_veiculos():
    user_id = request.args.get('user_id')

    try:
        if user_id:
            veiculos = execute_query(
                "SELECT * FROM veiculos WHERE user_id = %s ORDER BY principal DESC, id DESC;",
                (user_id,), fetch_all=True
            )
        else:
            veiculos = execute_query("SELECT * FROM veiculos ORDER BY id DESC;", fetch_all=True)

        return jsonify(veiculos), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao buscar veículos", "detalhes": str(e)}), 500


# 2. BUSCAR UM VEÍCULO (GET /api/veiculos/<id>)
@vehicles_bp.route('/<int:id>', methods=['GET'])
def obter_veiculo(id):
    try:
        veiculo = execute_query("SELECT * FROM veiculos WHERE id = %s;", (id,), fetch_one=True)
        if not veiculo:
            return jsonify({"erro": "Veículo não encontrado"}), 404
        return jsonify(veiculo), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao buscar veículo", "detalhes": str(e)}), 500


# 3. CADASTRAR VEÍCULO (POST /api/veiculos/)
@vehicles_bp.route('/', methods=['POST'])
def cadastrar_veiculo():
    dados = request.get_json(silent=True) or {}

    user_id = dados.get('user_id')
    veiculo_tipo = dados.get('veiculo_tipo') or dados.get('tipo')
    marca = dados.get('marca')
    modelo = dados.get('modelo')
    ano = dados.get('ano')
    versao = dados.get('versao')
    motor = dados.get('motor')
    combustivel = dados.get('combustivel')
    placa = dados.get('placa')
    kilometragem = dados.get('kilometragem')
    pecas_modificadas = dados.get('peças_modificadas') or dados.get('pecas_modificadas')

    if not user_id or not veiculo_tipo or not marca or not modelo or not ano:
        return jsonify({"erro": "Campos obrigatórios: user_id, veiculo_tipo, marca, modelo e ano"}), 400

    try:
        # Se for o primeiro veículo do usuário, ele já nasce como principal
        contagem = execute_query(
            "SELECT COUNT(*) AS total FROM veiculos WHERE user_id = %s;", (user_id,), fetch_one=True
        )
        principal = contagem['total'] == 0

        novo = execute_query(
            """
            INSERT INTO veiculos
                (user_id, veiculo_tipo, marca, modelo, ano, versao, motor, combustivel, placa, kilometragem, peças_modificadas, principal)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (user_id, veiculo_tipo, marca, modelo, ano, versao, motor, combustivel, placa,
             kilometragem, pecas_modificadas, principal),
            fetch_one=True,
        )

        return jsonify({"mensagem": "Veículo cadastrado com sucesso!", "veiculo": novo}), 201

    except Exception as e:
        return jsonify({"erro": "Erro ao salvar veículo no banco", "detalhes": str(e)}), 500


# 4. ATUALIZAR VEÍCULO (PUT /api/veiculos/<id>)
@vehicles_bp.route('/<int:id>', methods=['PUT'])
def atualizar_veiculo(id):
    dados = request.get_json(silent=True) or {}

    veiculo_tipo = dados.get('veiculo_tipo') or dados.get('tipo')
    marca = dados.get('marca')
    modelo = dados.get('modelo')
    ano = dados.get('ano')
    versao = dados.get('versao')
    motor = dados.get('motor')
    combustivel = dados.get('combustivel')
    placa = dados.get('placa')
    kilometragem = dados.get('kilometragem')

    if not veiculo_tipo or not marca or not modelo or not ano:
        return jsonify({"erro": "Campos obrigatórios: veiculo_tipo, marca, modelo e ano"}), 400

    try:
        atualizado = execute_query(
            """
            UPDATE veiculos
            SET veiculo_tipo = %s, marca = %s, modelo = %s, ano = %s, versao = %s,
                motor = %s, combustivel = %s, placa = %s, kilometragem = %s
            WHERE id = %s
            RETURNING *;
            """,
            (veiculo_tipo, marca, modelo, ano, versao, motor, combustivel, placa, kilometragem, id),
            fetch_one=True,
        )
        if not atualizado:
            return jsonify({"erro": "Veículo não encontrado"}), 404
        return jsonify({"mensagem": "Veículo atualizado com sucesso!", "veiculo": atualizado}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao atualizar veículo", "detalhes": str(e)}), 500


# 5. DEFINIR VEÍCULO PRINCIPAL (PATCH /api/veiculos/<id>/principal)
@vehicles_bp.route('/<int:id>/principal', methods=['PATCH'])
def definir_principal(id):
    dados = request.get_json(silent=True) or {}
    user_id = dados.get('user_id')
    if not user_id:
        return jsonify({"erro": "Campo obrigatório: user_id"}), 400

    try:
        execute_query("UPDATE veiculos SET principal = FALSE WHERE user_id = %s;", (user_id,))
        atualizado = execute_query(
            "UPDATE veiculos SET principal = TRUE WHERE id = %s AND user_id = %s RETURNING *;",
            (id, user_id), fetch_one=True,
        )
        if not atualizado:
            return jsonify({"erro": "Veículo não encontrado"}), 404
        return jsonify({"mensagem": "Veículo principal atualizado.", "veiculo": atualizado}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao definir veículo principal", "detalhes": str(e)}), 500


# 6. DELETAR VEÍCULO (DELETE /api/veiculos/<id>)
@vehicles_bp.route('/<int:id>', methods=['DELETE'])
def deletar_veiculo(id):
    try:
        removido = execute_query(
            "DELETE FROM veiculos WHERE id = %s RETURNING id;", (id,), fetch_one=True
        )
        if not removido:
            return jsonify({"erro": "Veículo não encontrado"}), 404
        return jsonify({"mensagem": f"Veículo com ID {id} removido com sucesso."}), 200
    except Exception as e:
        return jsonify({"erro": "Erro ao remover veículo", "detalhes": str(e)}), 500

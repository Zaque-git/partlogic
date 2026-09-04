from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import execute_query

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or data.get('nome') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or data.get('telefone') or '').strip()
    password = data.get('password') or data.get('senha')

    if not email or not name or not password:
        return jsonify({"error": "Preencha todos os campos obrigatorios"}), 400
    if len(password) < 6:
        return jsonify({"error": "A senha deve ter no mínimo 6 caracteres."}), 400

    hashed_password = generate_password_hash(password)

    try:
        sql = """
            INSERT INTO users (name, email, phone, password)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, email, phone, created_at;
        """
        user = execute_query(sql, params=(name, email, phone, hashed_password), fetch_one=True)
        return jsonify({"message": "Usuário cadastrado com sucesso!", "user": user}), 201

    except Exception as e:
        print(f"[REGISTER ERROR] {e}")
        return jsonify({"error": "E-mail já cadastrado ou erro no servidor."}), 400


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or data.get('senha')

    if not email or not password:
        return jsonify({"error": "E-mail e senha são obrigatórios."}), 400

    sql = "SELECT * FROM users WHERE email = %s;"
    user = execute_query(sql, params=(email,), fetch_one=True)

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "E-mail ou senha incorretos."}), 401

    user.pop('password', None)
    return jsonify({"message": "Login realizado com sucesso!", "user": user}), 200


@auth_bp.route('/perfil', methods=['PUT'])
def atualizar_perfil():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or data.get('id')
    name = (data.get('name') or data.get('nome') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or data.get('telefone') or '').strip()

    if not user_id or not name or not email:
        return jsonify({"error": "Campos obrigatórios: user_id, nome e e-mail."}), 400

    try:
        sql = """
            UPDATE users SET name = %s, email = %s, phone = %s
            WHERE id = %s
            RETURNING id, name, email, phone, created_at;
        """
        user = execute_query(sql, params=(name, email, phone, user_id), fetch_one=True)
        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404
        return jsonify({"message": "Perfil atualizado com sucesso!", "user": user}), 200
    except Exception:
        return jsonify({"error": "E-mail já em uso por outra conta ou erro no servidor."}), 400

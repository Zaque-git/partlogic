import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Carrega variáveis do arquivo .env (na raiz do projeto)
load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "auto_diagnostico_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
}


def get_db_connection():
    """Abre uma nova conexão com o PostgreSQL usando RealDictCursor por padrão,
    para que os resultados venham como dicionários (compatível com jsonify)."""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn


def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(query, params or ())

        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()

        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        cursor.execute(f.read())

    conn.commit()
    cursor.close()
    conn.close()
    print("Tabelas SQL criadas/verificadas com sucesso no PostgreSQL!")

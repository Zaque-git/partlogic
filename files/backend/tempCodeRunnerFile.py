flask import Flask, request, jsonify
from flask_cors import CORS
from app.db import init_db, execute_query
from app.routes.auth import auth_bp
from app.routes.vehicles import vehicles_bp
from app.routes.diagnose import diagnose_bp
from app.routes.maintenance import maintenance_bp
from app.services.gemini_service import verificar_compatibilidade_gemini
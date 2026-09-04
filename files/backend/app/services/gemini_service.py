import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Inicializa o cliente do Gemini usando a chave do arquivo .env
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def verificar_compatibilidade_gemini(marca, modelo, ano, motor, nome_peca, codigo_peca):
    system_instruction = """
    Você é um Especialista em Mecânica Automotiva e Compatibilidade de Peças (Fitment Expert).
    Sua tarefa é analisar se uma peça é compatível com um veículo específico.
    
    Responda ESTRITAMENTE em formato JSON com as chaves:
    {
        "compativel": true ou false,
        "certeza_percentual": número de 0 a 100,
        "justificativa": "Explicação técnica direta sobre a compatibilidade",
        "observacoes_tecnicas": "Observações sobre instalação ou especificações do motor"
    }
    """

    prompt = f"""
    Análise de Compatibilidade de Peça:
    - Veículo: {marca} {modelo} {ano} (Motor: {motor})
    - Peça: {nome_peca} (Código: {codigo_peca})
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"[gemini_service] Erro ao consultar o Gemini: {e}")
        return {
            "erro": "Erro ao consultar o Agente Gemini",
            "detalhes": str(e)
        }
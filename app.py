import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Configuración (Estos datos los sacas de Meta Developers)
TOKEN_VERIFICACION = "mi_clave_secreta_123" # Tú inventas esta clave
WHATSAPP_TOKEN = "TU_ACCESS_TOKEN_DE_META"
ID_TELEFONO = "TU_PHONE_NUMBER_ID"

def enviar_mensaje(telefono, texto):
    url = f"https://graph.facebook.com/v18.0/{ID_TELEFONO}/messages"
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}", "Content-Type": "application/json"}
    data = {
        "messaging_product": "whatsapp",
        "to": telefono,
        "type": "text",
        "text": {"body": texto}
    }
    requests.post(url, json=data, headers=headers)

@app.route('/webhook', methods=['GET'])
def verificar_webhook():
    # Meta usa esto para validar tu servidor la primera vez
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    if token == TOKEN_VERIFICACION:
        return challenge
    return "Error de token", 403

@app.route('/webhook', methods=['POST'])
def recibir_mensajes():
    try:
        body = request.get_json()
        entry = body['entry'][0]['changes'][0]['value']
        
        if 'messages' in entry:
            mensaje_recibido = entry['messages'][0]['text']['body'].lower()
            numero_cliente = entry['messages'][0]['from']

            # LÓGICA DE RESPUESTAS PARA TU ALQUILER
            if "precio" in mensaje_recibido:
                respuesta = "El alquiler está en $500 por noche. ¿Te interesa alguna fecha?"
            elif "ubicacion" in mensaje_recibido or "donde" in mensaje_recibido:
                respuesta = "Estamos ubicados en Calle Falsa 123. Aquí tienes el mapa: [Link]"
            elif "fotos" in mensaje_recibido:
                respuesta = "Puedes ver las fotos aquí: [Link a Drive o Web]"
            else:
                respuesta = "¡Hola! Soy tu asistente de alquileres. Escribe 'Precio', 'Ubicación' o 'Fotos' para ayudarte."

            enviar_mensaje(numero_cliente, respuesta)
            
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
"""
Módulo principal de la API de actividades.

Proporciona endpoints para listar actividades, consultar horarios e inscribir visitantes.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from src.clases import GestorActividades, Visitante

app = Flask(__name__)
CORS(app)

# Ruta del archivo CSV con las actividades
CSV_PATH = "data/actividades.csv"
gestor = GestorActividades(CSV_PATH)

# ----------------------------
# ENDPOINTS DE API
# ----------------------------


@app.route("/api/actividades", methods=["GET"])
def get_actividades():
    """
    Devuelve todas las actividades disponibles.
    """
    actividades = gestor.obtener_tipos_actividades()
    return jsonify(actividades)


@app.route("/api/actividades/<string:nombre>/horarios", methods=["GET"])
def get_horarios(nombre):
    """
    Devuelve los horarios disponibles para una actividad específica.
    """
    horarios = gestor.obtener_horarios_disponibles(nombre)
    return jsonify(horarios)


@app.route("/api/actividades/<string:nombre>/inscribir", methods=["POST"])
def inscribir_visitantes(nombre):
    """
    Registra visitantes en una actividad determinada.

    Espera un JSON con la siguiente estructura:
    {
        "dia": "YYYY-MM-DD",
        "horario": "HH:MM",
        "visitantes": [
            {"nombre": "Juan", "dni": "12345678", "edad": 25, "talle": "M"}
        ],
        "acepto_terminos": true
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Datos inválidos o JSON ausente"}), 400

    dia = data.get("dia")
    horario = data.get("horario")
    visitantes_data = data.get("visitantes", [])
    acepto_terminos = data.get("acepto_terminos", False)

    visitantes_list = [
        Visitante(
            v.get("nombre", ""),
            v.get("dni", ""),
            v.get("edad", 0),
            v.get("talle")
        )
        for v in visitantes_data
    ]

    exito = gestor.inscribir_visitantes(
        nombre, dia, horario, visitantes_list, acepto_terminos
    )

    if exito:
        gestor.guardar_actividades_csv()
        return jsonify({"mensaje": "Inscripción exitosa"}), 200

    return jsonify({"error": "Error en la inscripción o cupo lleno"}), 400


@app.route("/api/ping", methods=["GET"])
def ping():
    """
    Endpoint de prueba para verificar el estado de la API.
    """
    return jsonify({"mensaje": "API activa y funcionando correctamente"})


# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)

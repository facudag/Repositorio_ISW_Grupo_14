from flask import Flask, jsonify, request
from flask_cors import CORS
from src.clases import GestorActividades, Visitante

app = Flask(__name__)
CORS(app)

# Ruta del archivo CSV con las actividades
# CSV_PATH = "data/actividades.csv" <-- ELIMINADO
gestor = GestorActividades() # <-- MODIFICADO: Ya no necesita la ruta


# ----------------------------
# ENDPOINTS DE API
# ----------------------------

# 1️⃣ Obtener todas las actividades disponibles
@app.route("/api/actividades", methods=["GET"])
def get_actividades():
    actividades = gestor.obtener_tipos_actividades()
    return jsonify(actividades)


# 2️⃣ Obtener los horarios disponibles para una actividad
@app.route("/api/actividades/<nombre>/horarios", methods=["GET"])
def get_horarios(nombre):
    horarios = gestor.obtener_horarios_disponibles(nombre)
    return jsonify(horarios)


# 3️⃣ Registrar visitantes para una actividad
@app.route("/api/actividades/<nombre>/inscribir", methods=["POST"])
def inscribir_visitantes(nombre):
    data = request.get_json()

    dia = data.get("dia")
    horario = data.get("horario")
    visitantes_data = data.get("visitantes", [])
    acepto_terminos = data.get("acepto_terminos", False)

    visitantes_list = [
        Visitante(v["nombre"], v["dni"], v["edad"], v.get("talle"))
        for v in visitantes_data
    ]

    exito = gestor.inscribir_visitantes(nombre, dia, horario, visitantes_list, acepto_terminos)

    if exito:
        # gestor.guardar_actividades_csv() <-- ELIMINADO
        return jsonify({"mensaje": "Inscripción exitosa"}), 200
    else:
        return jsonify({"error": "Error en la inscripción o cupo lleno"}), 400


# 4️⃣ Endpoint de prueba (opcional)
@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"mensaje": "API activa y funcionando correctamente"})


# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
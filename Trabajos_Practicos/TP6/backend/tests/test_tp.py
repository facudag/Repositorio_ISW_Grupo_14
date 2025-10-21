import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from src.clases import Actividad, GestorActividades, Visitante

# Path al CSV de actividades
CSV_PATH = "data/actividades.csv"

@pytest.fixture
def gestor():
    gestor = GestorActividades(CSV_PATH)
    return gestor

def test_inscripcion_exitosa(gestor):
    actividad = gestor.buscar_actividad("Tirolesa")
    visitantes = [Visitante("Ana", "12345678", 25, "M")]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Tirolesa",
        dia="2025-10-20",
        horario="10:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is True
    # Verificar que se haya reducido el cupo
    assert actividad.horarios["2025-10-20"]["10:00"] == 4  # antes era 5

def test_inscripcion_sin_cupo(gestor):
    actividad = gestor.buscar_actividad("Tirolesa")
    # Forzamos cupo 0 para simular que no hay lugar
    actividad.horarios["2025-10-20"]["14:00"] = 0
    visitantes = [Visitante("Pedro", "87654321", 30, "L")]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Tirolesa",
        dia="2025-10-20",
        horario="14:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is False

def test_inscripcion_sin_talle_en_actividad_que_no_lo_requiere(gestor):
    visitantes = [Visitante("Laura", "23456789", 22)]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Safari",
        dia="2025-10-20",
        horario="11:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is True

def test_inscripcion_horario_inexistente(gestor):
    visitantes = [Visitante("Marcos", "98765432", 28)]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Palestra",
        dia="2025-10-20",
        horario="23:59",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is False

def test_inscripcion_sin_aceptar_terminos(gestor):
    visitantes = [Visitante("Julia", "11111111", 19, "S")]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Tirolesa",
        dia="2025-10-20",
        horario="10:00",
        visitantes=visitantes,
        acepto_terminos=False
    )
    assert resultado is False

def test_inscripcion_sin_talle_en_actividad_que_si_lo_requiere(gestor):
    visitantes = [Visitante("Carlos", "22222222", 35, None)]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Tirolesa",
        dia="2025-10-20",
        horario="10:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is False

def test_inscripcion_sin_aceptar_terminos(gestor):
    visitantes = [Visitante("Lucas", "33333333", 27, "M")]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Safari",
        dia="2025-10-20",
        horario="11:00",
        visitantes=visitantes,
        acepto_terminos=False
    )
    assert resultado is False

def test_inscripcion_excede_cupo(gestor):
    actividad = gestor.buscar_actividad("Tirolesa")
    # Forzamos cupo 1 para este horario
    actividad.horarios["2025-10-20"]["10:00"] = 1
    visitantes = [
        Visitante("Ana", "12345678", 25, "M"),
        Visitante("Pedro", "87654321", 30, "L")
    ]
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Tirolesa",
        dia="2025-10-20",
        horario="10:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is False
    # Verificamos que el cupo no haya cambiado
    assert actividad.horarios["2025-10-20"]["10:00"] == 1

def test_inscripcion_datos_incorrectos_visitante(gestor):
    visitantes = [Visitante("", "", -5, "M")]  # Datos inválidos
    resultado = gestor.inscribir_visitantes(
        actividad_nombre="Palestra",
        dia="2025-10-20",
        horario="09:00",
        visitantes=visitantes,
        acepto_terminos=True
    )
    assert resultado is False

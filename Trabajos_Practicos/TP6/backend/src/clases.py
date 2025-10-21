# src/clases.py
import csv
from typing import List, Dict, Optional


class Visitante:
    def __init__(self, nombre: str, dni: str, edad: int, talle: Optional[str] = None):
        self.nombre = nombre
        self.dni = dni
        self.edad = edad
        self.talle = talle

    def es_valido(self, requiere_talle: bool) -> bool:
        if not self.nombre or not self.dni:
            return False
        try:
            if int(self.edad) <= 0:
                return False
        except Exception:
            return False
        if requiere_talle and (self.talle is None or str(self.talle).strip() == ""):
            return False
        return True

    def to_dict(self) -> Dict:
        return {
            "nombre": self.nombre,
            "dni": self.dni,
            "edad": self.edad,
            "talle": self.talle
        }

    def __repr__(self):
        return f"Visitante({self.nombre},{self.dni},{self.edad},{self.talle})"



class Actividad:
    def __init__(self, nombre: str, requiere_talle: bool = False):
        self.nombre = nombre
        self.requiere_talle = requiere_talle
        self.horarios: Dict[str, Dict[str, int]] = {}
        self.inscriptos: Dict[str, Dict[str, List[Visitante]]] = {}

    def agregar_horario(self, fecha: str, hora: str, cupo: int):
        if fecha not in self.horarios:
            self.horarios[fecha] = {}
            self.inscriptos[fecha] = {}
        self.horarios[fecha][hora] = int(cupo)
        if hora not in self.inscriptos[fecha]:
            self.inscriptos[fecha][hora] = []

    def hay_cupo(self, fecha: str, hora: str, cantidad: int = 1) -> bool:
        return (
            fecha in self.horarios
            and hora in self.horarios[fecha]
            and self.horarios[fecha][hora] >= cantidad
        )

    def agregar_visitantes(self, fecha: str, hora: str, visitantes: List[Visitante]) -> bool:
        cantidad = len(visitantes)
        if not self.hay_cupo(fecha, hora, cantidad):
            return False

        for v in visitantes:
            if not v.es_valido(self.requiere_talle):
                return False

        self.horarios[fecha][hora] -= cantidad
        self.inscriptos[fecha][hora].extend(visitantes)
        return True

    def quitar_visitante(self, fecha: str, hora: str, dni: str) -> bool:
        if fecha not in self.inscriptos or hora not in self.inscriptos[fecha]:
            return False
        lista = self.inscriptos[fecha][hora]
        for i, v in enumerate(lista):
            if v.dni == dni:
                lista.pop(i)
                self.horarios[fecha][hora] += 1
                return True
        return False

    def to_csv_rows(self) -> List[Dict[str, str]]:
        rows = []
        for fecha, horarios in self.horarios.items():
            for hora, cupo in horarios.items():
                insc = self.inscriptos.get(fecha, {}).get(hora, [])
                visitantes_serial = ";".join([v.dni for v in insc]) if insc else ""
                rows.append({
                    "nombre": self.nombre,
                    "dia": fecha,
                    "horario": hora,
                    "cupo_disponible": str(cupo),
                    "requiere_talle": "True" if self.requiere_talle else "False",
                    "visitantes": visitantes_serial
                })
        return rows

    def to_dict(self) -> Dict:
        """Convierte la actividad completa a un diccionario JSON-friendly"""
        return {
            "nombre": self.nombre,
            "requiere_talle": self.requiere_talle,
            "horarios": self.horarios,
            "inscriptos": {
                fecha: {
                    hora: [v.to_dict() for v in visitantes]
                    for hora, visitantes in horarios.items()
                }
                for fecha, horarios in self.inscriptos.items()
            }
        }

    def __repr__(self):
        return f"Actividad({self.nombre}, requiere_talle={self.requiere_talle})"


class GestorActividades:
    def __init__(self, ruta_csv: str):
        self.ruta_csv = ruta_csv
        self.actividades: Dict[str, Actividad] = {}
        self._cargar_desde_csv(ruta_csv)

    def _cargar_desde_csv(self, ruta_csv: str):
        with open(ruta_csv, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                nombre = row.get("nombre") or row.get("actividad")
                fecha = row.get("dia") or row.get("fecha")
                hora = row.get("horario") or row.get("hora")
                cupo_str = row.get("cupo_disponible") or row.get("cupo") or "0"
                try:
                    cupo = int(cupo_str)
                except Exception:
                    cupo = 0
                requiere_talle = str(row.get("requiere_talle", "False")).strip().lower() == "true"
                visitantes_field = row.get("visitantes", "")

                if nombre not in self.actividades:
                    self.actividades[nombre] = Actividad(nombre, requiere_talle)

                actividad = self.actividades[nombre]
                actividad.agregar_horario(fecha, hora, cupo)

                if visitantes_field:
                    dnis = [s for s in visitantes_field.split(";") if s.strip()]
                    for dni in dnis:
                        v = Visitante(nombre="", dni=dni, edad=0, talle=None)
                        actividad.inscriptos[fecha][hora].append(v)

    def buscar_actividad(self, nombre: str) -> Optional[Actividad]:
        return self.actividades.get(nombre)

    def inscribir_visitantes(self, actividad_nombre: str, dia: str, horario: str,
                            visitantes: List[Visitante], acepto_terminos: bool) -> bool:
        actividad = self.buscar_actividad(actividad_nombre)
        if actividad is None or not acepto_terminos:
            return False

        # Revisar que haya cupo suficiente
        # if not actividad.hay_cupo(dia, horario, len(visitantes)):
        #     return False

        # Validar cada visitante usando su método es_valido, que ya maneja talle según la actividad
        # for v in visitantes:
        #     if not v.es_valido(actividad.requiere_talle):
        #         return False

        # Si todo está bien, agregamos los visitantes
        return actividad.agregar_visitantes(dia, horario, visitantes)


    def guardar_actividades_csv(self, ruta_salida: Optional[str] = None):
        path = ruta_salida or self.ruta_csv
        fieldnames = ["nombre", "dia", "horario", "cupo_disponible", "requiere_talle", "visitantes"]
        rows: List[Dict[str, str]] = []
        for actividad in self.actividades.values():
            rows.extend(actividad.to_csv_rows())

        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow(r)

    # ----------- Métodos nuevos para API -----------

    def obtener_tipos_actividades(self) -> List[Dict]:
        """Devuelve lista de actividades con info básica (para frontend)."""
        return [
            {"nombre": act.nombre, "requiere_talle": act.requiere_talle}
            for act in self.actividades.values()
        ]

    def obtener_horarios_disponibles(self, actividad_nombre: str) -> Dict[str, Dict[str, int]]:
        act = self.buscar_actividad(actividad_nombre)
        if act:
            return act.horarios
        return {}

    def obtener_actividad_completa(self, nombre: str) -> Optional[Dict]:
        """Devuelve toda la info de una actividad en formato JSON."""
        act = self.buscar_actividad(nombre)
        return act.to_dict() if act else None

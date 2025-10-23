"""
Módulo de clases principales para la gestión de visitantes y actividades.

Contiene:
- Visitante: Representa una persona que participa en una actividad.
- Actividad: Administra cupos, horarios e inscripciones.
- GestorActividades: Maneja las actividades desde y hacia archivos CSV.
"""

import csv
from typing import List, Dict, Optional


class Visitante:
    """Representa un visitante o participante de una actividad."""

    def __init__(self, nombre: str, dni: str, edad: int, talle: Optional[str] = None):
        self.nombre = nombre
        self.dni = dni
        self.edad = edad
        self.talle = talle

    def es_valido(self, requiere_talle: bool) -> bool:
        """
        Verifica si los datos del visitante son válidos.

        Args:
            requiere_talle (bool): Indica si la actividad requiere talle.

        Returns:
            bool: True si el visitante es válido, False en caso contrario.
        """
        if not self.nombre or not self.dni:
            return False
        try:
            if int(self.edad) <= 0:
                return False
        except ValueError:
            return False

        if requiere_talle and (self.talle is None or str(self.talle).strip() == ""):
            return False
        return True

    def to_dict(self) -> Dict[str, Optional[str]]:
        """Convierte el visitante a un diccionario."""
        return {
            "nombre": self.nombre,
            "dni": self.dni,
            "edad": self.edad,
            "talle": self.talle
        }

    def __repr__(self) -> str:
        """Representación legible del visitante."""
        return f"Visitante({self.nombre}, {self.dni}, {self.edad}, {self.talle})"


class Actividad:
    """Clase que representa una actividad con horarios, cupos e inscripciones."""

    def __init__(self, nombre: str, requiere_talle: bool = False):
        self.nombre = nombre
        self.requiere_talle = requiere_talle
        self.horarios: Dict[str, Dict[str, int]] = {}
        self.inscriptos: Dict[str, Dict[str, List[Visitante]]] = {}

    def agregar_horario(self, fecha: str, hora: str, cupo: int) -> None:
        """Agrega un horario con su cupo disponible."""
        if fecha not in self.horarios:
            self.horarios[fecha] = {}
            self.inscriptos[fecha] = {}
        self.horarios[fecha][hora] = int(cupo)
        if hora not in self.inscriptos[fecha]:
            self.inscriptos[fecha][hora] = []

    def hay_cupo(self, fecha: str, hora: str, cantidad: int = 1) -> bool:
        """Verifica si hay cupos disponibles para una fecha y hora determinada."""
        return (
            fecha in self.horarios
            and hora in self.horarios[fecha]
            and self.horarios[fecha][hora] >= cantidad
        )

    def agregar_visitantes(self, fecha: str, hora: str, visitantes: List[Visitante]) -> bool:
        """Agrega visitantes a una actividad si hay cupo disponible."""
        cantidad = len(visitantes)
        if not self.hay_cupo(fecha, hora, cantidad):
            return False

        for visitante in visitantes:
            if not visitante.es_valido(self.requiere_talle):
                return False

        self.horarios[fecha][hora] -= cantidad
        self.inscriptos[fecha][hora].extend(visitantes)
        return True

    def quitar_visitante(self, fecha: str, hora: str, dni: str) -> bool:
        """Elimina un visitante por su DNI y libera su cupo."""
        if fecha not in self.inscriptos or hora not in self.inscriptos[fecha]:
            return False

        lista = self.inscriptos[fecha][hora]
        for i, visitante in enumerate(lista):
            if visitante.dni == dni:
                lista.pop(i)
                self.horarios[fecha][hora] += 1
                return True
        return False

    def to_csv_rows(self) -> List[Dict[str, str]]:
        """Convierte los datos de la actividad en filas CSV."""
        rows = []
        for fecha, horarios in self.horarios.items():
            for hora, cupo in horarios.items():
                inscriptos = self.inscriptos.get(fecha, {}).get(hora, [])
                visitantes_serializados = ";".join([v.dni for v in inscriptos]) if inscriptos else ""
                rows.append({
                    "nombre": self.nombre,
                    "dia": fecha,
                    "horario": hora,
                    "cupo_disponible": str(cupo),
                    "requiere_talle": str(self.requiere_talle),
                    "visitantes": visitantes_serializados
                })
        return rows

    def to_dict(self) -> Dict:
        """Convierte la actividad completa a un diccionario apto para JSON."""
        return {
            "nombre": self.nombre,
            "requiere_talle": self.requiere_talle,
            "horarios": self.horarios,
            "inscriptos": {
                fecha: {
                    hora: [visitante.to_dict() for visitante in visitantes]
                    for hora, visitantes in horarios.items()
                }
                for fecha, horarios in self.inscriptos.items()
            }
        }

    def __repr__(self) -> str:
        """Representación legible de la actividad."""
        return f"Actividad({self.nombre}, requiere_talle={self.requiere_talle})"


class GestorActividades:
    """Clase que gestiona un conjunto de actividades, con carga y guardado en CSV."""

    def __init__(self, ruta_csv: str):
        self.ruta_csv = ruta_csv
        self.actividades: Dict[str, Actividad] = {}
        self._cargar_desde_csv(ruta_csv)

    def _cargar_desde_csv(self, ruta_csv: str) -> None:
        """Carga actividades y horarios desde un archivo CSV."""
        with open(ruta_csv, newline='', encoding='utf-8') as archivo:
            reader = csv.DictReader(archivo)
            for row in reader:
                nombre = row.get("nombre") or row.get("actividad")
                fecha = row.get("dia") or row.get("fecha")
                hora = row.get("horario") or row.get("hora")
                cupo_str = row.get("cupo_disponible") or row.get("cupo") or "0"

                try:
                    cupo = int(cupo_str)
                except ValueError:
                    cupo = 0

                requiere_talle = str(row.get("requiere_talle", "False")).strip().lower() == "true"
                visitantes_field = row.get("visitantes", "")

                if nombre not in self.actividades:
                    self.actividades[nombre] = Actividad(nombre, requiere_talle)

                actividad = self.actividades[nombre]
                actividad.agregar_horario(fecha, hora, cupo)

                if visitantes_field:
                    dnis = [dni for dni in visitantes_field.split(";") if dni.strip()]
                    for dni in dnis:
                        visitante = Visitante(nombre="", dni=dni, edad=0)
                        actividad.inscriptos[fecha][hora].append(visitante)

    def buscar_actividad(self, nombre: str) -> Optional[Actividad]:
        """Busca una actividad por su nombre."""
        return self.actividades.get(nombre)

    def inscribir_visitantes(
        self,
        actividad_nombre: str,
        dia: str,
        horario: str,
        visitantes: List[Visitante],
        acepto_terminos: bool
    ) -> bool:
        """Inscribe una lista de visitantes en una actividad."""
        actividad = self.buscar_actividad(actividad_nombre)
        if actividad is None or not acepto_terminos:
            return False

        return actividad.agregar_visitantes(dia, horario, visitantes)

    def guardar_actividades_csv(self, ruta_salida: Optional[str] = None) -> None:
        """Guarda las actividades actuales en un archivo CSV."""
        path = ruta_salida or self.ruta_csv
        fieldnames = ["nombre", "dia", "horario", "cupo_disponible", "requiere_talle", "visitantes"]
        rows: List[Dict[str, str]] = []

        for actividad in self.actividades.values():
            rows.extend(actividad.to_csv_rows())

        with open(path, "w", newline="", encoding="utf-8") as archivo:
            writer = csv.DictWriter(archivo, fieldnames=fieldnames)
            writer.writeheader()
            for row in rows:
                writer.writerow(row)

    def obtener_tipos_actividades(self) -> List[Dict[str, str]]:
        """Devuelve una lista con las actividades y su configuración básica."""
        return [
            {"nombre": act.nombre, "requiere_talle": act.requiere_talle}
            for act in self.actividades.values()
        ]

    def obtener_horarios_disponibles(self, actividad_nombre: str) -> Dict[str, Dict[str, int]]:
        """Obtiene los horarios disponibles de una actividad."""
        actividad = self.buscar_actividad(actividad_nombre)
        return actividad.horarios if actividad else {}

    def obtener_actividad_completa(self, nombre: str) -> Optional[Dict]:
        """Devuelve toda la información de una actividad en formato JSON."""
        actividad = self.buscar_actividad(nombre)
        return actividad.to_dict() if actividad else None

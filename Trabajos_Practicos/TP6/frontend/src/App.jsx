import React, { useState } from "react";
import Inicio from "./components/Inicio";
import Actividades from "./components/Actividades";
import Inscripcion from "./components/Inscripcion";
import InscribirVisitantes from "./components/InscribirVisitantes";

function App() {
  const [componente, setComponente] = useState("inicio");
  const [actividadSeleccionada, setActividadSeleccionada] = useState("");
  const [inscripcionData, setInscripcionData] = useState(null);

  // Función para volver al inicio reseteando todo
  const resetApp = () => {
    setActividadSeleccionada("");
    setInscripcionData(null);
    setComponente("inicio");
  };

  return (
    <div>
      {componente === "inicio" && (
        <Inicio onIniciar={() => setComponente("actividades")} />
      )}

      {componente === "actividades" && (
        <Actividades
          onSeleccionar={(act) => {
            setActividadSeleccionada(act);
            setComponente("inscripcion");
          }}
          onVolver={resetApp}
        />
      )}

      {componente === "inscripcion" && (
        <Inscripcion
          actividad={actividadSeleccionada}
          onVolver={() => setComponente("actividades")}
          onSiguiente={(data) => {
            setInscripcionData(data);
            setComponente("inscribirVisitantes");
          }}
        />
      )}

      {componente === "inscribirVisitantes" && (
        <InscribirVisitantes
          actividad={actividadSeleccionada}
          dia={inscripcionData.dia}
          horario={inscripcionData.horario}
          cantidad={inscripcionData.cantidad}
          onVolver={() => setComponente("inscripcion")}
          onExito={resetApp} // Aquí vamos a volver al inicio si la inscripción sale bien
        />
      )}
    </div>
  );
}

export default App;

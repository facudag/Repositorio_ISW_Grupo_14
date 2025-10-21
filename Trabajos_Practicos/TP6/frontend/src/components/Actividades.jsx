import React, { useEffect, useState } from "react";

function Actividades({ onSeleccionar, onVolver }) {
    const [actividades, setActividades] = useState([]);
    const [mensajeError, setMensajeError] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/actividades")
            .then(res => res.json())
            .then(data => setActividades(data))
            .catch(() => setMensajeError("Error al cargar actividades"));
    }, []);

    return (
        <div className="container min-vh-100 d-flex flex-column justify-content-center py-5">
            <div className="row w-100">
                <div className="col-12 col-md-6 mx-auto text-center">
                    <h1 className="mb-4">Selecciona actividad</h1>

                    {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}

                    {actividades.length > 0 ? (
                        <div className="d-grid gap-3 mb-4">
                            {actividades.map((act, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSeleccionar(act.nombre)}
                                    className="btn btn-outline-primary btn-lg"
                                >
                                    {act.nombre}
                                </button>
                            ))}
                        </div>
                    ) : (
                        !mensajeError && <p>Cargando actividades...</p>
                    )}

                    <button onClick={onVolver} className="btn btn-secondary">
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Actividades;

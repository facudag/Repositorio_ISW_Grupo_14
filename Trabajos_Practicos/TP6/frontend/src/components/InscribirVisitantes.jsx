import React, { useState } from "react";

function InscribirVisitantes({ actividad, dia, horario, cantidad, onVolver, onExito }) {
    const [visitantes, setVisitantes] = useState(
        Array.from({ length: cantidad }, () => ({ nombre: "", dni: "", edad: "", talle: "" }))
    );
    const [aceptoTerminos, setAceptoTerminos] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const handleChange = (index, field, value) => {
        const newVisitantes = [...visitantes];
        newVisitantes[index][field] = value;
        setVisitantes(newVisitantes);
    };

    const handleEnviar = async () => {
        if (!aceptoTerminos) {
            setMensaje("Debes aceptar los términos y condiciones.");
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/actividades/${actividad}/inscribir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dia, horario, visitantes, acepto_terminos: aceptoTerminos }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("¡Inscripción exitosa!");
                onExito();
            } else {
                setMensaje(data.error || "Error al inscribir.");
            }
        } catch (err) {
            console.error(err);
            setMensaje("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="container min-vh-100 d-flex flex-column justify-content-center py-5">
            <div className="row w-100">
                <div className="col-12 col-md-6 mx-auto">
                    <h2 className="text-center mb-4">{actividad}</h2>
                    <p className="text-center">Día: {dia} | Horario: {horario}</p>

                    {visitantes.map((v, i) => (
                        <div key={i} className="card mb-3 p-3">
                            <h5 className="card-title">Visitante {i + 1}</h5>
                            <div className="mb-2">
                                <input
                                    className="form-control mb-2"
                                    placeholder="Nombre"
                                    value={v.nombre}
                                    onChange={e => handleChange(i, "nombre", e.target.value)}
                                />
                                <input
                                    className="form-control mb-2"
                                    placeholder="DNI"
                                    value={v.dni}
                                    onChange={e => handleChange(i, "dni", e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    placeholder="Edad"
                                    value={v.edad}
                                    onChange={e => handleChange(i, "edad", e.target.value)}
                                />
                                <input
                                    className="form-control"
                                    placeholder="Talle (si aplica)"
                                    value={v.talle}
                                    onChange={e => handleChange(i, "talle", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="terminosCheck"
                            checked={aceptoTerminos}
                            onChange={e => setAceptoTerminos(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="terminosCheck">
                            Acepto términos y condiciones
                        </label>
                    </div>

                    {mensaje && <div className="alert alert-danger">{mensaje}</div>}

                    <div className="d-flex justify-content-between">
                        <button className="btn btn-secondary btn-lg" onClick={onVolver}>Volver</button>
                        <button className="btn btn-primary btn-lg" onClick={handleEnviar}>Aceptar inscripción</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InscribirVisitantes;

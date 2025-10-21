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

        // 🔹 Validación de edad según actividad
        let edadMinima = 0;
        if (actividad.toLowerCase() === "palestra") edadMinima = 12;
        if (actividad.toLowerCase() === "tirolesa") edadMinima = 8;

        for (let i = 0; i < visitantes.length; i++) {
            const { nombre, dni, edad } = visitantes[i];
            if (!nombre || !dni || !edad) {
                setMensaje(`Todos los campos son obligatorios para el visitante ${i + 1}.`);
                return;
            }
            if (isNaN(edad) || edad <= 0) {
                setMensaje(`La edad ingresada para el visitante ${i + 1} no es válida.`);
                return;
            }
            if (edad < edadMinima) {
                setMensaje(
                    `El visitante ${i + 1} no cumple con la edad mínima (${edadMinima} años) para ${actividad}.`
                );
                return;
            }
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

    // 🔹 Definir si la actividad requiere talle
    const requiereTalle = ["palestra", "tirolesa"].includes(actividad.toLowerCase());
    const talles = ["XS", "S", "M", "L", "XL", "XXL"];

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
                                    type="number"
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

                                {/* 🔹 Mostrar solo si la actividad requiere talle */}
                                {requiereTalle && (
                                    <select
                                        className="form-select"
                                        value={v.talle}
                                        onChange={e => handleChange(i, "talle", e.target.value)}
                                    >
                                        <option value="">Seleccionar talle</option>
                                        {talles.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                )}
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
                            Acepto<a href="..\..\public\TerminosYCondiciones.pdf"> términos y condiciones</a>
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

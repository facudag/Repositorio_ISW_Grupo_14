import { useEffect, useState } from "react";

function Inscripcion({ actividad, onVolver, onSiguiente }) {
    const [horarios, setHorarios] = useState({});
    const [dias, setDias] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [horarioSeleccionado, setHorarioSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/actividades/${actividad}/horarios`)
            .then(res => res.json())
            .then(data => {
                setHorarios(data);
                const diasDisponibles = Object.keys(data);
                setDias(diasDisponibles);

                const hoy = new Date();
                const hoyStr = hoy.getFullYear() + "-" +
                               String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
                               String(hoy.getDate()).padStart(2, "0");

                const diaDefault = diasDisponibles.includes(hoyStr) ? hoyStr : diasDisponibles[0] || "";
                setDiaSeleccionado(diaDefault);

                const primerHorario = Object.keys(data[diaDefault] || {})[0] || "";
                setHorarioSeleccionado(primerHorario);

                setCantidad(1);
            })
            .catch(err => console.error(err));
    }, [actividad]);

    const cupoDisponible = horarioSeleccionado && horarios[diaSeleccionado]
        ? horarios[diaSeleccionado][horarioSeleccionado]
        : 0;

    const handleAceptar = () => {
        if (cantidad < 1 || cantidad > cupoDisponible) {
            alert(`Cantidad inválida. Máximo disponible: ${cupoDisponible}`);
            return;
        }
        onSiguiente({ actividad, dia: diaSeleccionado, horario: horarioSeleccionado, cantidad });
    };

    return (
        <div className="container min-vh-100 d-flex flex-column justify-content-center py-5">
            <div className="row w-100">
                <div className="col-12 col-md-6 mx-auto">
                    <h2 className="text-center mb-4">{actividad}</h2>

                    <div className="mb-3">
                        <label className="form-label">Día:</label>
                        <select
                            className="form-select"
                            value={diaSeleccionado}
                            onChange={e => setDiaSeleccionado(e.target.value)}
                        >
                            {dias.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Horario:</label>
                        <select
                            className="form-select"
                            value={horarioSeleccionado}
                            onChange={e => setHorarioSeleccionado(e.target.value)}
                        >
                            {(horarios[diaSeleccionado] ? Object.entries(horarios[diaSeleccionado]) : []).map(
                                ([h, cupo]) => (
                                    <option key={h} value={h}>
                                        {h} (Cupos: {cupo})
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Cantidad de visitantes (máx {cupoDisponible}):</label>
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            max={cupoDisponible}
                            value={cantidad}
                            onChange={e => setCantidad(Math.min(Math.max(1, e.target.value), cupoDisponible))}
                        />
                    </div>

                    <div className="d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={onVolver}>Volver</button>
                        <button className="btn btn-primary" onClick={handleAceptar}>Aceptar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Inscripcion;

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

                // Obtenemos todos los días
                const diasDisponibles = Object.keys(data);

                // Día de hoy en formato YYYY-MM-DD
                const hoy = new Date();
                const hoyStr =
                    hoy.getFullYear() +
                    "-" +
                    String(hoy.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(hoy.getDate()).padStart(2, "0");

                // Filtramos solo los días que sean hoy o futuros
                const diasValidos = diasDisponibles.filter(d => d >= hoyStr);
                setDias(diasValidos);

                // Selección por defecto: hoy si está disponible, sino el primer día válido
                const diaDefault = diasValidos.includes(hoyStr)
                    ? hoyStr
                    : diasValidos[0] || "";
                setDiaSeleccionado(diaDefault);

                // Primer horario por defecto
                const primerHorario = Object.keys(data[diaDefault] || {})[0] || "";
                setHorarioSeleccionado(primerHorario);

                setCantidad(1);
            })
            .catch(err => console.error(err));
    }, [actividad]);

    const cupoDisponible =
        horarioSeleccionado && horarios[diaSeleccionado]
            ? horarios[diaSeleccionado][horarioSeleccionado]
            : 0;

    const handleAceptar = () => {
        const cant = Number(cantidad);
        if (cant < 1 || cant > cupoDisponible) {
            alert(`Cantidad inválida. Máximo disponible: ${cupoDisponible}`);
            return;
        }
        onSiguiente({
            actividad,
            dia: diaSeleccionado,
            horario: horarioSeleccionado,
            cantidad: cant,
        });
    };

    return (
        <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center py-5">
            <div className="row">
                <div className="col-12 col-md-6 col-lg-4 mx-auto">
                    <h2
                        className="text-center mb-4"
                        style={{ fontSize: "2.5rem", wordBreak: "break-word" }}
                    >
                        {actividad}
                    </h2>

                    <div className="mb-3">
                        <label className="form-label">Día:</label>
                        <select
                            className="form-select"
                            value={diaSeleccionado}
                            onChange={e => setDiaSeleccionado(e.target.value)}
                        >
                            {dias.map(d => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                        {dias.length === 0 && <small className="text-danger">No hay dias disponibles actualmente.</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Horario:</label>
                        <select
                            className="form-select"
                            value={horarioSeleccionado}
                            onChange={e => setHorarioSeleccionado(e.target.value)}
                        >
                            {(horarios[diaSeleccionado]
                                ? Object.entries(horarios[diaSeleccionado])
                                : []
                            ).map(([h, cupo]) => (
                                <option key={h} value={h}>
                                    {h} (Cupos: {cupo})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            Cantidad de visitantes (máx {cupoDisponible}):
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            max={cupoDisponible}
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                        />
                    </div>

                    <div className="d-flex justify-content-between">
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={onVolver}
                        >
                            Volver
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAceptar}
                            disabled={dias.length === 0} // deshabilitado si no hay días futuros
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Inscripcion;

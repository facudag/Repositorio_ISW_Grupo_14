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

                const hoy = new Date();
                const mañana = new Date(hoy);
                mañana.setDate(hoy.getDate() + 1);

                const hoyStr = hoy.toISOString().split("T")[0];
                const mañanaStr = mañana.toISOString().split("T")[0];

                // ✅ Mostrar solo hoy y mañana si existen en los datos
                const diasDisponibles = Object.keys(data).filter(
                    d => d === hoyStr || d === mañanaStr
                );

                setDias(diasDisponibles);

                // ✅ Día por defecto: hoy si está, sino mañana
                const diaDefault = diasDisponibles.includes(hoyStr)
                    ? hoyStr
                    : diasDisponibles[0] || "";
                setDiaSeleccionado(diaDefault);

                setCantidad(1);
            })
            .catch(err => console.error(err));
    }, [actividad]);

    // 🔹 Filtramos los horarios según la hora actual si el día es hoy
    const horariosFiltrados = (() => {
        if (!diaSeleccionado || !horarios[diaSeleccionado]) return [];

        const hoy = new Date();
        const hoyStr = hoy.toISOString().split("T")[0];

        // Si es mañana, mostrar todos los horarios
        if (diaSeleccionado !== hoyStr) {
            return Object.entries(horarios[diaSeleccionado]);
        }

        // Si es hoy, mostrar solo los horarios futuros
        return Object.entries(horarios[diaSeleccionado]).filter(([h]) => {
            const [hora, minuto] = h.split(":").map(Number);
            const horarioDate = new Date();
            horarioDate.setHours(hora, minuto, 0, 0);
            return horarioDate > hoy;
        });
    })();

    useEffect(() => {
        // ✅ Selecciona el primer horario disponible al cambiar de día
        if (horariosFiltrados.length > 0) {
            setHorarioSeleccionado(horariosFiltrados[0][0]);
        } else {
            setHorarioSeleccionado("");
        }
    }, [diaSeleccionado, horariosFiltrados]);

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

                    {/* Día */}
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
                        {dias.length === 0 && (
                            <small className="text-danger">
                                No hay días disponibles actualmente.
                            </small>
                        )}
                    </div>

                    {/* Horarios */}
                    <div className="mb-3">
                        <label className="form-label">Horario:</label>
                        <select
                            className="form-select"
                            value={horarioSeleccionado}
                            onChange={e => setHorarioSeleccionado(e.target.value)}
                        >
                            {horariosFiltrados.map(([h, cupo]) => (
                                <option key={h} value={h}>
                                    {h} (Cupos: {cupo})
                                </option>
                            ))}
                        </select>
                        {horariosFiltrados.length === 0 && (
                            <small className="text-danger">
                                No hay horarios disponibles para este día.
                            </small>
                        )}
                    </div>

                    {/* Cantidad */}
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

                    {/* Botones */}
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-secondary btn-lg" onClick={onVolver}>
                            Volver
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAceptar}
                            disabled={
                                dias.length === 0 || horariosFiltrados.length === 0
                            }
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

const URL = "http://127.0.0.1:5000/api";

export async function getActividades() {
    const res = await fetch(`${URL}/actividades`);
    return res.json();
}

export async function getHorarios(actividad) {
    const res = await fetch(`${URL}/actividades/${actividad}/horarios`);
    return res.json();
}

export async function inscribirVisitantes(actividad, data) {
    const res = await fetch(`${URL}/actividades/${actividad}/inscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

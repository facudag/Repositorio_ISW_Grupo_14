import React from "react";

function Inicio({ onIniciar }) {
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div style={{ width: "100%", maxWidth: "400px" }}>
                <h1 className="mb-4 text-center">Inscribirse a actividad</h1>
                <button 
                    onClick={onIniciar} 
                    className="btn btn-primary btn-lg w-100"
                >
                    Iniciar inscripción
                </button>
            </div>
        </div>
    );
}

export default Inicio;

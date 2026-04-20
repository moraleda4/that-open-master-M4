// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react";
import * as Router from "react-router-dom"
// @ts-ignore
import logo from "../../assets/company-logo.svg" // Se importa una imagen como módulo → TypeScript: "No entiendo archivos .svg" → ts-ignore → "Ignora el error"

// ======================================================
// COMPONENTE: Sidebar
// ======================================================
// function Sidebar() es un componente funcional de React. React lo usa así <Sidebar />
export function Sidebar () {
    // JSX (JavaScript XML) es la mezcla de HTML + JavaScript → Sintaxis que React transforma a JavaScript
    return (
        <aside id="sidebar">
            <img id="company-logo" src={logo} alt="Construction Company"/>
            <ul id="nav-buttons">
                {/* Navegación SPA (Single Page Application) */}
                {/* Sidebar.tsx: <Router.Link to="/"> y index.tsx: <Route path="/" element={<ProjectsPage />} /> */}
                {/* Link → cambia URL → Route decide qué renderizar : Una sola página HTML + cambios dinámicos con React */}
                 <Router.Link to="/">
                    <li><span className="material-icons-round">apartment</span>Projects</li>
                </Router.Link>
                <Router.Link to="/project">
                    <li><span className="material-icons-round">people</span>Users</li>
                </Router.Link>
            </ul>
        </aside>
    )
}
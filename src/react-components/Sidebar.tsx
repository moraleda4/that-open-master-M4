// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// Sidebar es un componente puramente visual.
//
// Responsabilidades:
// 1. Mostrar el logo de la aplicación.
// 2. Mostrar las opciones de navegación.
// 3. Permitir cambiar de página mediante React Router.
//
// IMPORTANTE:
    // No tiene estado.
    // No gestiona datos.
    // No accede a Firebase.
    // No accede a ProjectsManager.
// Solo renderiza navegación.

// ======================================================
// IMPORTACIONES
// ======================================================
// Aunque no se use en este archivo React.useState(...) o React.useEffect(...) sí estoy usando JSX: <aside>, <img>, <ul>, <Router.Link></Router.Link>
import * as React from "react"
// Importo React Router → navegación entre páginas sin recargar la aplicación
import * as Router from "react-router-dom"
// Logo corporativo utilizado en la barra lateral.
// @ts-ignore se utiliza porque TypeScript no interpreta archivos SVG como módulos sin configuración adicional
import logo from "../../assets/company-logo.svg" // Se importa una imagen como módulo → TypeScript: "No entiendo archivos .svg" → ts-ignore → "Ignora el error"
import { appIcons } from "../globals"

// ======================================================
// COMPONENTE: Sidebar
// ======================================================
// Barra lateral fija de la aplicación. Se muestra en todas las páginas.

// function Sidebar() es un componente funcional de React. React lo usa así <Sidebar />
export function Sidebar () {
    // JSX (JavaScript XML) es la mezcla de HTML + JavaScript → Sintaxis que React transforma a JavaScript
    return (
        // Contenedor principal de navegación
        <aside id="sidebar">
            {/* Logo de la aplicación */}
            <img id="company-logo" src={logo} alt="Construction Company"/>
            {/* ==================================================
                NAVEGACIÓN PRINCIPAL
                ================================================== */}
            <ul id="nav-buttons">
                {/* Navegación SPA (Single Page Application) */}
                {/* React Router: Link cambia la URL sin recargar la página. La nueva URL será interpretada por las rutas definidas en index.tsx */}
                {/* Sidebar.tsx: <Router.Link to="/"> y index.tsx: <Route path="/" element={<ProjectsPage />} /> */}
                {/* Link → cambia URL → Route decide qué renderizar : Una sola página HTML + cambios dinámicos con React */}

                {/* Página principal de proyectos */}
                 <Router.Link to="/">
                    <bim-button
                        icon={appIcons.PROJECT}
                        label="Projects"
                    ></bim-button>
                </Router.Link>
                {/* OJO: Ruta reservada para futura gestión de usuarios */}
                <Router.Link to="/project">
                    <bim-button
                        icon={appIcons.USER}
                        label="Users"
                    ></bim-button>
                </Router.Link>
            </ul>
        </aside>
    )
}

// FLUJO:
// Usuario
// ↓
// Click en Link
// ↓
// React Router
// ↓
// Cambio de URL
// ↓
// Route correspondiente
// ↓
// Nueva página
//
// Sin recargar la aplicación.
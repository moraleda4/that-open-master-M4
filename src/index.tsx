// ======================================================
// IMPORTACIONES
// ======================================================
// REACT
// React → para crear componentes
import * as React from "react"
// ReactDOM → para renderizar en el HTML
import * as ReactDOM from "react-dom/client"

//ROUTER
// Router permite navegar entre páginas
import * as Router from "react-router-dom"

// COMPONENTES → Las pantallas de la app y el sidebar que es fijo
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/projects-page/ProjectsPage"
import { ProjectDetailsPage } from "./react-components/project-details/ProjectDetailsPage"

// LÓGICA → Cerebro de la app
import { ProjectsManager } from "./classes/ProjectsManager"

// ESTILOS GLOBALES
import "../style.css"

// ======================================================
// INSTANCIA DE LA CLASE ProjectsManager
// ======================================================
// Se crea el cerebro/base de datos global de la app a partir de la clase ProjectsManager → Se instancia la clase ProjectsManager
// projectsManager = objeto real que contiene la lista de proyectos (con el proyecto por defecto) y sus métodos asociados (crear, borrar, etc.)
// Todos los componentes de la app (páginas de la app) van a utilizar el mismo cerebro
const projectsManager = new ProjectsManager()

// ======================================================
// ESTRUCTURA DE LA APP → RENDERIZADO
// ======================================================
// Busca en el HTML el elemento con id="app" → Este div es donde React va a renderizar TODA la aplicación
const rootElement = document.getElementById("app") as HTMLDivElement
// Crea la raíz de React → Es el punto desde donde React controla el DOM
const appRoot = ReactDOM.createRoot(rootElement)
// Aquí empieza el renderizado de React → Todo lo que pongas dentro se dibuja en el navegador
appRoot.render(
  // Fragmento de React (<> </>) → sirve para agrupar sin añadir divs extra al HTML
  <>
    {/* Activa el sistema de rutas (navegación por URL) */}
    <Router.BrowserRouter>
      {/* Sidebar → se renderiza SIEMPRE (no depende de la ruta) */}
      <Sidebar />
      {/* Contenedor de rutas */}
      <Router.Routes>
        {/* Ruta 1: Cuando la URL es "/" (home), se muestra la página de proyectos */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager}/>}></Router.Route>
        {/* Ruta 2: Cuando la URL es "/project/:id" ":id" es un parámetro dinámico */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager}/>}></Router.Route>
      </Router.Routes>
    </Router.BrowserRouter>
  </>
)
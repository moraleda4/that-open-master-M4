// ======================================================
// RESPONSABILIDADES
// ======================================================
// Punto de entrada de la aplicación React.

// Responsabilidades:
// ✔ Crear la instancia global de ProjectsManager
// ✔ Inicializar React
// ✔ Configurar React Router
// ✔ Definir las rutas principales de la aplicación
// ✔ Renderizar el árbol principal de componentes

// IMPORTANTE:
// Este archivo arranca la aplicación, pero NO contiene lógica de negocio.

// ======================================================
// IMPORTACIONES
// ======================================================
// React necesario para JSX
import * as React from "react"
// ReactDOM conecta React con el DOM real del navegador. Permite crear la raíz de React y renderizar la aplicación dentro del HTML.
import * as ReactDOM from "react-dom/client"
// React Router gestiona la navegación SPA (Single Page Application). Permite cambiar de pantalla sin recargar la página completa.
import * as Router from "react-router-dom"

// COMPONENTES → Las pantallas de la app y el sidebar que es fijo
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/projects-page/ProjectsPage"
import { ProjectDetailsPage } from "./react-components/project-details/ProjectDetailsPage"

// LÓGICA → Cerebro de la app
import { ProjectsManager } from "./classes/ProjectsManager"

// ESTILOS GLOBALES
import "../style.css"

// Importamos la librería UI de THAT OPEN ENGINE
import * as BUI from "@thatopen/ui"
// Se inicializa UNA SOLA VEZ el manager: cuando la app se inicializa el manager le dice "estos son los nuevos HTML tags que el usuario puede utilizar"
// Con esto la app no solo entiende que tiene disponibles nuevos HTML tags, sino que sabe lo que tiene que renderizar cuando se utilizan estos tags.
BUI.Manager.init()

// Para que los archivos .tsx interpreten bien los bim components que vienen de that open engine
// IntrinsicElements evita errores de TypeScript al escribir etiquetas personalizadas (custom components) en JSX.
declare global {
  namespace JSX{
    interface IntrinsicElements{
      "bim-label": any;
      "bim-button": any;
      "bim-text-input": any;
      "bim-grid": any;
    }
  }
}

// ======================================================
// INSTANCIA DE LA CLASE ProjectsManager
// ======================================================
// Se crea el cerebro/base de datos global de la app a partir de la clase ProjectsManager →  Se crea una única instancia global de ProjectsManager.
// projectsManager = objeto real que contiene la lista de proyectos (con el proyecto por defecto) y sus métodos asociados (crear, borrar, etc.)
// IMPORTANTE: Todos los componentes de la app (páginas de la app) van a utilizar el mismo cerebro. Es decir,  todos los componentes trabajan sobre el MISMO estado global.
// const projectsManager = new ProjectsManager() solo se ejecuta una vez cuando arranca la app
const projectsManager = new ProjectsManager()

// ======================================================
// ESTRUCTURA DE LA APP → RENDERIZADO
// ======================================================
// Busca en el HTML el elemento con id="app" → Este div es donde React va a renderizar TODA la aplicación
const rootElement = document.getElementById("app") as HTMLDivElement
// Crea la raíz de React → Es el punto desde donde React controla el DOM: Componentes React → React Root →  DOM real
const appRoot = ReactDOM.createRoot(rootElement)
// Aquí empieza el renderizado de React → Todo lo que pongas dentro se dibuja en el navegador. Todo lo que aparece dentro de render() será gestionado por React.
appRoot.render(
  // Fragmento de React (<> </>) → sirve para agrupar sin añadir divs extra al HTML
  <>
    {/* Activa el sistema de rutas (navegación por URL) */}
    <Router.BrowserRouter>
      {/* Sidebar → se renderiza SIEMPRE (no depende de la ruta) */}
      <Sidebar />
      {/* Contenedor que agrupa todas las rutas disponibles de la app */}
      <Router.Routes>
        {/* Ruta 1: Cuando la URL es "/" (home), React Router renderiza ProjectsPage y le inyecta la instancia global de ProjectsManager mediante props. */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        {/* element indica qué componente debe renderizarse cuando la ruta coincide, es decir: Cuando estés en "/", ejecuta ProjectsPage y pinta su JSX */}
        {/* projectsManager={projectsManager} significa propiedad llamada projectsManager → valor = variable projectsManager */}
        {/* projectsManager={projectsManager}: IZQUIERDA nombre de la prop. DERECHA variable que le asignas */}
        <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager}/>}></Router.Route>
        {/* Ruta 2: Cuando la URL es "/project/:id" ":id" es un parámetro dinámico. ProjectDetailsPage lo obtiene con useParams() */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager}/>}></Router.Route>
      </Router.Routes>
    </Router.BrowserRouter>
  </>
)

// FLUJO DE ARRANQUE DE LA APP:
  // index.html
  // ↓
  // index.tsx
  // ↓
  // ReactDOM.createRoot()
  // ↓
  // BrowserRouter
  // ↓
  // Routes
  // ↓
  // ProjectsPage / ProjectDetailsPage
  // ↓
  // ProjectsManager
  // ↓
  // FirebaseService
  // ↓
  // Firestore
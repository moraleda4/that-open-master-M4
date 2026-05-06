// RESPONSABILIDADES DE ESTE COMPONENTE:
// 1. Recibir el ProjectsManager (fuente de datos global)
// 2. Mantener sincronizado el estado de React con el manager, es decir guarda los proyectos en estado (useState) y escucha cambios (create / delete / update)
// 3. Renderizar la lista de proyectos
// 5. Gestionar la creación de nuevos proyectos (modal)
// 6. Delegar lógica al manager (crear / importar / exportar)

// ======================================================
// IMPORTACIONES
// ======================================================
// Para poder añadir hooks (useState, useEffect)
import * as React from 'react';
// Navegación
import * as Router from "react-router-dom";
// Clase Project
import { IProject, IProjectJSON, Project } from '../../classes/Project';
// Lógica global
import { ProjectsManager } from '../../classes/ProjectsManager';
// UI de cada proyecto
import { ProjectCard } from './ProjectCard';
// El formulario de creación/edición de proyecto
import { ProjectFormModal } from "./ProjectFormModal";
// El searchbox para filtrar proyectos
import { SearchBox } from "./SearchBox";

// ProjectsManager es una clase que representa el gestor de proyectos de la app
// interface Props representa lo que recibe el componente ProjectsPage → define qué datos y qué tipo tienen
interface Props {
  projectsManager: ProjectsManager
}

// ======================================================
// COMPONENTE: ProjectsPage (función + props)
// ======================================================
// ProjectsPage → Componente funcional que recibe props.projectsManager
// props = datos que recibe el componente
export function ProjectsPage(props: Props) {
  // ======================================================
  // ESTADOS de la componente ProjectsPage
  // ======================================================
  // ======================================================
  // ESTADO de DATOS: Guarda los proyectos que React debe pintar en pantalla. Se inicializa desde el manager, pero luego se actualiza vía setProjects
  // ======================================================
  // useState → Creación de estado
  // React.useState<Project[]> es un hook que define un estado interno del componente
  // <Project[]> es TypeScript y significa que "projects será un array de Project"
  // (props.projectsManager.list) → valor inicial → es el array que viene del manager
  // projects = copia inicial de projectsManager.list → valor actual del estado
  // setProjects → función que actualiza el estado → Cuando llamas a setProjects → React re-renderiza
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)

  // ======================================================
  // ESTADO de UI (interfaz): controla si el modal está abierto o cerrado
  // ======================================================
  // useState solo puede utilizarse dentro del componente y debe declararse antes del return)
  // Crea una variable que guarda un valor (estado) y una función para cambiarlo → [valor actual, funcionParaCambiarlo/Actualizarlo]
  // true → abrir modal (modo CREACIÓN) y false → cerrar modal
  // Valor inicial = false → Al principio → creatingProject = false, es decir, el modal está cerrado
  // Funcionamiento: Cuando haces click en "New project" → setCreatingProject(true) React re-renderiza → ProjectFormModal (projectToEdit) recibe null → useEffect → modo CREAR
  const [creatingProject, setCreatingProject] = React.useState(false)

  // ======================================================
  // SINCRONIZACIÓN DE ProjectsPage CON ProjectsManager
  // ======================================================
  // Escucha cambios en el manager y fuerza re-render en React
  // Se registran callbacks para que cualquier cambio en el manager (crear, borrar, actualizar) fuerce un re-render en React

  // Envuelvo todo en un React.useEffect para evitar reasignaciones innecesarias en cada render
  // props.projectsManager.onProjectCreated → estás sobrescribiendo una función, que antes (ProjectsManager.ts) era onProjectCreated = () => {}
  // ¿Qué quiere decir? "Cuando se cree un proyecto → ejecuta esto"
  // setProjects([...props.projectsManager.list]) → [...array] es un operador spread → crea una copia
  // React compara referencias: array antiguo === array nuevo → no renderiza / array antiguo !== array nuevo → renderiza
  // Importante: React NO detecta cambios en objetos (eso lo hace el ProjectsManager). React detecta cambios en estado y re-renderiza si hay algún cambio
  React.useEffect(() => {
    props.projectsManager.onProjectCreated = () => {
      setProjects([...props.projectsManager.list])
    }

    props.projectsManager.onProjectDeleted = () => {
      setProjects([...props.projectsManager.list])
    }

    props.projectsManager.onProjectUpdated = () => {
      setProjects([...props.projectsManager.list])
    }

    // React → ProjectsManager → FirebaseService → Firestore
    props.projectsManager.loadProjects()

  }, [])

  // ======================================================
  // RENDERIZACIÓN DE LISTA DE PROYECTOS: TRANSFORMACIÓN DE DATOS → COMPONENTES UI (DATOS → JSX)
  // ======================================================
  // MAPEO DE PROYECTOS A COMPONENTES VISUALES (PROJECTCARDS)
  // Convierte cada Project en una tarjeta navegable (ProjectCard)

  // projectCards se define para transformar Project [] → JSX[], es decir, es un array de JSX
  // map = transforma cada elemento de un array en otro valor
  // (project) => { ... } = función que se ejecuta por cada elemento → Para cada project en el array → ejecuta esto
  const projectCards = projects.map((project) => {
    // Devuelve JSX y cada vuelta del map devuelve un elemento visual
    return (
      // Router.Link es la componente de navegación y evita la recarga de página
      // to={`/project/${project.id}`} → string dinámico → Cada proyecto tiene su URL única
      // key={project.id} es un prop especial de React que sirve para identificar cada elemento de la lista, ya que React necesita saber qué elemento cambió, se añadió o se eliminó
      <Router.Link to={`/project/${project.id}`} key={project.id}>
        {/* projectCards es la lista de proyectos y cada uno de los proyectos de la lista va a tener una ProjectCard asociada */}
        {/* Dentro de ProjectCard → props.project.name, props.project.description, etc. */}
        <ProjectCard project={project} />
      </Router.Link>
    )
  })

  // ======================================================
  // Funciones que manejan EVENTOS
  // ======================================================

  // ======================================================
  // EXPORTAR la lista de proyectos JSON
  // ======================================================
  // Delega en el manager
  const onExportProject = () => {
    props.projectsManager.exportToJSON()
  }

  // ======================================================
  // IMPORTAR una lista de proyectos JSON
  // ======================================================
  // Delega en el manager
  const onImportProject = () => {

    const input = document.createElement("input")

    input.type = "file"
    input.accept = "application/json"

    const reader = new FileReader()

    reader.onload = async () => {

      const json = reader.result

      if (!json) return

      const projects: IProjectJSON[] = JSON.parse(json as string)

      await props.projectsManager.importProjects(projects)

    }

    input.onchange = () => {
      if (!input.files) return
      reader.readAsText(input.files[0])
    }

    input.click()
  }

  // ======================================================
  // FILTRAR proyectos en función del input del searchbox
  // ======================================================
  // Delega en el manager el filtrado de proyectos para hacerlo de forma más GLOBAL
  const onProjectSearch = (value :string) => {
    setProjects(props.projectsManager.filterProjects(value))
  }

  // ======================================================
  // RENDER (UI)
  // ======================================================
  // Ahora vamos a ver como todo lo anterior se convierte en UI real → Se trata básicamente de la pantalla completa de ProjectsPage
  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
      {/* ENCABEZADO DE LA PÁGINA PRINCIPAL: TITULO Y BOTONES */}
      <header>
        {/* TITULO */}
        <h2>Projects</h2>
        {/* SEARCHBOX */}
        <SearchBox 
          onChange={(value) => onProjectSearch(value)}
          placeholder="Search projects by name..."
          width="300px"
        />
        {/* CONTENEDOR DE BOTONES */}
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          {/* BOTONES DE IMPORTAR O EXPORTAR PROYECTOS */}
          <span
            id="import-projects-btn"
            className="material-icons-round action-icon"
            onClick={onImportProject}
          >
            file_upload
          </span>
          <span
            id="export-projects-btn"
            className="material-icons-round action-icon"
            onClick={onExportProject}
          >
            file_download
          </span>
          {/* BOTÓN DE "NEW PROJECT" */}
          {/* () => setCreatingProject(true): Activa el modo creación → abre el modal */}
          <button onClick={() => setCreatingProject(true)} id="new-project-btn">
            <span className="material-icons-round">add</span>New Project
          </button>
        </div>
      </header>
      {/* Modal reutilizable:
        - isOpen controla apertura
        - projectToEdit = null → modo CREAR
        - onSubmit delega creación al manager */}
      <ProjectFormModal
        isOpen={creatingProject}
        projectToEdit={creatingProject ? null : undefined}
        onSubmit={async (data) => {
          try {
            const newProject = new Project(data)

            await props.projectsManager.createProject(newProject)

            setCreatingProject(false)
            
          } catch (error) {
            console.error(error)
          }
        }}
        // Sincroniza el cierre del modal con el estado de React
        // Flujo de cierre del modal:
          // 1. Usuario hace click en "Cancel"
          // 2. Se ejecuta dialogRef.current?.close() (cierra visualmente el dialog)
          // 3. Se llama a onClose() → el padre cambia el estado (setCreatingProject(false))
          // 4. React re-renderiza
          // 5. isOpen = false → useEffect mantiene el modal cerrado (sincronización UI ↔ estado)
        onClose={() => setCreatingProject(false)}
      />

      {/* CONTENEDOR DONDE SE VAN A ALMACENAR LAS TARJETAS DE PROYECTO (projectCards) */}
      {/* Se incluye un operador ternario para que se muestre un mensaje de que no hay proyectos con las características que buscas en el SEARCHBOX */}
      {
        projects.length > 0 ? (
          <div id="projects-list">{ projectCards }</div>
        ) : (
          <div className="page" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="error-modal">
              <h3>No Results</h3>
              <p>No projects match your search criteria.</p>
            </div>
          </div>
        )
      }

    </div>
  )
}
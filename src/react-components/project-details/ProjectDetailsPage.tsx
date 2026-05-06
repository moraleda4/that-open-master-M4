// RESPONSABILIDADES DE ESTE COMPONENTE:

// ProjectDetailsPage = ORQUESTADOR → coordina componentes, gestiona estado (editingProject) y controla el flujo de la página.
//No implementa UI compleja directamente, pero sí decide qué se renderiza y cuándo.

// 1. Lee la URL → obtiene ID (sabe qué proyecto tiene que mostrar)
// 2. Busca el proyecto → Para ello recurre al ProjectsManager
// 3. Maneja estados de UI (editar / no editar):
// - Si no existe → error modal
// - Si existe:
//   - muestra info
//   - muestra tareas
//   - permite editar
// 4. Coordina componentes hijos: ProjectHeader, ProjectInfoCard, TodoList, Modal
// 5. Gestiona el flujo de edición
// 6. Maneja errores (proyecto no existe)

// FLUJO COMPLETO DE EDITAR PROYECTO DESDE ProjectDetailsPage.tsx:
// 1. Usuario edita formulario (click en "Edit" dentro del ProjectInfoCard)
// 2. ProjectFormModal llama a onSubmit(data) cuando se envía el formulario
// 3. handleEditSubmit recibe data
// 4. Se actualiza el objeto project
// 5. Se avisa a ProjectsManager para que actualice → projectsManager.updateProject()
// 6. ProjectsManager dispara onProjectUpdated → ProjectsPage / componentes suscritos actualizan estado
// 6. React re-renderiza
// 7. UI actualizada

// FLUJO REAL DE CAMBIOS EN LA BARRA DE PROGRESO:
// 1. Usuario mueve slider
// 2. Cambias project.progress
// 3. React detecta cambio de estado
// 4. React re-renderiza
// 5. UI se actualiza

// ======================================================
// IMPORTACIONES
// ======================================================
// Importa React → necesario para hooks (useState) y JSX
import * as React from "react"
// Librería de navegación, necesaria para useParams()
import * as Router from "react-router-dom"
// Clase que gestiona el estado global de los proyectos (CRUD + notificación a la UI)
  // C → Create   (Crear)
  // R → Read     (Leer)
  // U → Update   (Actualizar)
  // D → Delete   (Eliminar)
import { ProjectsManager } from "../../classes/ProjectsManager"
// Componente visual → muestra info del proyecto: nombre, estado, coste, progreso y el botón Edit. Llama a onEdit
import { ProjectInfoCard } from "./ProjectInfoCard"
// Cabecera del proyecto → Parte visual: título, icono de proyecto y estilo
import { ProjectHeader } from "./ProjectHeader"
// Gestiona lista de tareas del proyecto
import { TodoList } from "./TodoList"
// Formulario reutilizable (crear / editar) → Recibe de ProjectFormModal.tsx: isOpen, projectToEdit, onSubmit y onClose. Función: UI del formulario
import { ProjectFormModal } from "../projects-page/ProjectFormModal"
// Tipos + clase Project
import { IProject, Project } from "../../classes/Project"
// Visor 3D
import { ThreeViewer } from "./ThreeViewer"


// Define lo que recibe el componente
// Props que recibe el componente → acceso al manager global de proyectos
interface Props {
  projectsManager: ProjectsManager
}

// ======================================================
// COMPONENTE: ProjectDetailsPage
// ======================================================
// Función que define el componente
export function ProjectDetailsPage(props: Props) {
  
  // ======================================================
  // ESTADO: controla si estamos editando un proyecto
  // ======================================================
  // editingProject → valor actual
  // setEditingProject → función para cambiarlo
  // Estado:
  // null → no se está editando nada (editingProject = null → modal cerrado)
  // Project → se está editando ese proyecto (se abre el modal) → (editingProject = project → modal abierto)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)

  // ======================================================
  // PARÁMETROS DE LA URL
  // ======================================================
  // Hook de React que lee la URL
  // Ejemplo URL: /project/123 → routeParams.id = "123"
  // { id?: string } = id es opcional
  const routeParams = Router.useParams<{ id?: string }>()

  // Si no hay ID en la URL → no podemos mostrar nada (no puedes cargar proyecto → renderiza mensaje)
  if (!routeParams.id) {
    return <p>Project ID is needed to see this page</p>
  }

  // ======================================================
  // OBTENER EL PROYECTO DESDE EL MANAGER
  // ======================================================
  // Busca el proyecto en memoria → llama al projectsManager para buscar el proyecto con ese ID
  const project = props.projectsManager.getProject(routeParams.id)

  // ======================================================
  // CASO ERROR: el proyecto no existe
  // ======================================================
  // Si metemos una URL mal o se ha borrado el proyecto que definía esa URL aparecerá el mensaje de error
  if (!project) {
    return (
    // Si llega hasta aquí → Muestra modal SIEMPRE (porque open)
    <dialog open>
      <div className="error-modal">
        <h3>Error</h3>
        <p>The project with ID {routeParams.id} was not found.</p>
         {/* Redirige a la página principal cuando se haga click en el botón "Go back" */}
        <button onClick={() => window.location.href = "/"}>
          Go back
        </button>
      </div>
    </dialog>
    )
  }

  const navigate = Router.useNavigate()

  const handleDeleteProject = async () => {
    if (!project) return

    try {
      await props.projectsManager.deleteProjectFromFirebase(project.id)

      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  // ======================================================
  // FUNCIÓN: guardar cambios del formulario (editar)
  // ======================================================
  // Se ejecuta cuando el formulario hace submit
  const handleEditSubmit = async (data: IProject) => {

    // 1. ACTUALIZAR EN MEMORIA (tu app)
    // Actualizamos los datos del proyecto existente (se sobreescribe lo que ya hay con los nuevos datos introducidos)
    project.name = data.name
    project.description = data.description
    project.status = data.status
    project.userRole = data.userRole
    project.finishDate = data.finishDate

     // Opcional pero recomendable
    project.cost = data.cost
    project.progress = data.progress

    // 2. ACTUALIZAR EN FIREBASE (CUANDO LE DAMOS AL BOTÓN EDIT)
    await props.projectsManager.updateProjectInFirebase(project)
    
    // 3. REFRESCAR REACT
    // Notificamos al manager los cambios ( internamente this.onProjectUpdated() → Eso dispara setProjects([...]) en ProjectsPage.tsx ) → React se re-renderiza
    props.projectsManager.updateProject()

    // 4. CERRAR MODAL
    // Se cierra el modal (React → isOpen = false → modal se cierra)
    setEditingProject(null)
  }


  // ======================================================
  // RENDER
  // ======================================================
  // Devuelve JSX (UI)
  return (
    // Contenedor principal de la página ProjectDetailsPage
    <div className="page" id="project-details">
      {/* HEADER del proyecto (nombre, botón editar, etc.) → Pasa el proyecto como prop */}
      <ProjectHeader
        project={project}
        onDelete={handleDeleteProject}
      />

      {/* Contenido principal de la página ProjectDetailsPage */}
      <div className="main-page-content">

        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>

          {/* Tarjeta con info del proyecto */}
          <ProjectInfoCard
            // Props = Datos del proyecto
            project={project}
            // Función onEdit: Cuando el usuario hace click en "Edit" se abre el modal en modo EDICIÓN: → editingProject = project → modal se abre
            onEdit={() => setEditingProject(project)}
            // Función onUpdate: notifica cambios al manager → este dispara eventos → React re-renderiza

            // ANTES: React ← hack ← setRefresh
            // AHORA:
              // Project muta
              // ↓
              // ProjectsManager.updateProject()
              // ↓
              // Nueva referencia de array
              // ↓
              // React detecta cambio
              // ↓
              // Re-render global limpio
            onUpdate={props.projectsManager.updateProject.bind(props.projectsManager)}
            onProgressChange={async (value) => {

              project.progress = value

              await props.projectsManager.updateProjectInFirebase(project)

              props.projectsManager.updateProject()

            }}
          />

          {/* Lista de tareas */}
          <TodoList
            project={project}
            onUpdate={() => props.projectsManager.updateProject()}
            projectsManager={props.projectsManager}
          />
        </div>

        {/* COLUMNA DERECHA: VISOR 3D */}
        <ThreeViewer />

      </div>

      {/* Componente ProjectFormModal es una función a la que le paso datos y funciones */}
      {/* MODAL reutilizable (editar proyecto) */}
      {/* Es la conexión entre: UI (modal) ↔ estado ↔ lógica */}
      <ProjectFormModal
        // editingProject es una variable puede ser SOLO dos cosas: 1. null → no estás editando → modal cerrado 2. un objeto Project → estás editando → modal abierto
        // !! = Es una forma de convertir cualquier valor a booleano, es decir, editingProject: Project | null lo convierto en boolean (true → abrir o false → cerrar)
        // CASO 1. NO estás editando: editingProject = null | !editingProject → true | !!editingProject → false | Resultado final: isOpen = false
        // CASO 2. SÍ estás editando: editingProject = { name: "Proyecto A" } | !editingProject → false | !!editingProject → true | Resultado final: isOpen = true
        // Traducción real: "Si hay proyecto → abre modal" / "Si no hay → ciérralo"
        isOpen={!!editingProject}
        // LE DAS DATOS AL MODAL: PADRE → HIJO [ projectToEdit (datos) ]
        // Le pasas el proyecto (objeto) al formulario (componente hijo) → para que se muestren los datos del proyecto introducidos hasta el momento
        // "Si estás editando → usa estos datos" / "Si no → formulario vacío"
        projectToEdit={editingProject}
        // EL MODAL TE DEVUELVE LOS DATOS: HIJO → PADRE [ onSubmit(data) ] → callback que el modal ejecuta al enviar el formulario
        // Se pasa una función al componente hijo (formulario)
        // Se pasa la función handleEditSubmit como prop de onSubmit. No la ejecutas, sino que la pasas
        // ¿Por qué? Porque ProjectFormModal NO sabe guardar proyectos, necesita ayuda del padre → "Cuando el usuario envíe el formulario → ejecuta esta función"
        onSubmit={handleEditSubmit}
        // editingProject = null → isOpen = false → modal se cierra
        // onClose → resetea el estado → el modal se cierra automáticamente
        // Aquí sí usas función anónima porque necesitas ejecutar algo en ese momento (cerrar el modal) → "Cuando el modal se cierre → borra el proyecto en edición"
        onClose={() => setEditingProject(null)}
      />

    </div>
  )
}
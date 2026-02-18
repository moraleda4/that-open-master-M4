// Este archivo es el cerebro de la aplicación, ya que se conecta con HTML y lee formularios, crea clases y escucha eventos.

//======================================================================================
// IMPORTACIONES
//======================================================================================
// Importo la interfaz IProject y los tipos de dato de ProjectStatus y UserRole
import { IProject, ProjectStatus, UserRole } from "./classes/Project"
// Importo la clase ProjectsManager para conseguir que el proyecto se cree al hacer submit
import { ProjectsManager } from "./classes/ProjectsManager"

//======================================================================================
// UI HELPERS (MODALS / ERRORS)
//======================================================================================
// FUNCIÓN TOGGLEMODAL: Queremos tener una sola función que abra el <dialog> si está cerrado y que lo cierre si está abierto
// De esta forma evitamos duplicar lógicas: showModal y closeModal
// Toggle genérico para <dialog>
function toggleModal(id: string){
  const modal = document.getElementById(id)

  if (modal && modal instanceof HTMLDialogElement){
    if (modal.open) {
      modal.close()
    } else {
      modal.showModal()
    }
  } else {
    console.warn("The provided modal wasn't found, ID:", id)
  }
}

// POPUP DE ERROR
// Función reutilizable para mostrar errores
function showError(message: string) {
  if (
    errorModal instanceof HTMLDialogElement &&
    errorMessage instanceof HTMLElement
  ) {
    errorMessage.textContent = message
    errorModal.showModal()
  }
}

//======================================================================================
// DOM REFERENCES
//======================================================================================
//LISTA DE PROYECTOS
// Generar una referencia al contenedor HTML, es decir, a la lista de proyectos del archivo HTML
const projectsListUI = document.getElementById("projects-list") as HTMLElement

// BOTÓN NEW PROJECT
// Se guarda el resultado de una función específica en una VARIABLE (const), para poder reutilizarla. Referencia al botón de nuevo proyecto:
const newProjectBtn = document.getElementById("new-project-btn")

// FORMULARIO
// Referencia al <form>
const projectForm = document.getElementById("new-project-form")

// BOTÓN DE CANCELAR FORMULARIO
const cancelProjectBtn = document.getElementById("cancel-project-btn")

// ERROR MODAL
// Cuadro de error al crear uno existente
const errorModal = document.getElementById("error-modal")
const errorMessage = document.getElementById("error-message")
const errorOkBtn = document.getElementById("error-ok-btn")

// BOTÓN DE "PROJECTS" DEL SIDEBAR
const projectsBtn = document.getElementById("projects-btn")
const projectsPage = document.getElementById("projects-page")
const detailsPage = document.getElementById("project-details")


//======================================================================================
// MANAGERS
//======================================================================================
// Generamos una única instancia para introducir ProjectsManager. Controlará todos los proyectos:
const projectsManager = new ProjectsManager (projectsListUI)

//======================================================================================
// EVENT LISTENERS
//======================================================================================
// ABRIR EL MODAL DE NUEVO PROYECTO
if (newProjectBtn) {
  // Se encapsula la función en una función anónima para que no se ejecute sin hacer antes click en el botón de nuevo proyecto
  // Hasta que no se hace click en el botón de nuevo proyecto no se aplica la función toggleModal
  newProjectBtn.addEventListener("click", () => {toggleModal("new-project-modal")})
} else {
  // Se utiliza console.warn para indicar en la consola en amarillo que no se ha podido ejecutar la función
  console.warn("New projects button was not found")
}

// ENVÍO DEL FORMULARIO
// Se añade && projectForm... para corregir posible error advertido por Typescript relacionado con inheritance de los elementos HTML
if (projectForm && projectForm instanceof HTMLFormElement) {
  // Se evita que se recargue la página
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    // Extrae los datos del formulario
    const formData = new FormData(projectForm)

    // Fecha por defecto si no se especifica: genero una variable rawDate (string) donde se extrae el valor de fecha del formulario (valor o null si no se rellena)
    const rawDate = formData.get("finishDate") as string

    // Construye un objeto projectData tipado según IProjectD
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      // Fecha por defecto si no se especifica: Si el usuario no pone fecha se muestra por defecto 6 meses desde hoy (operador ternario)
      finishDate: rawDate
        ? new Date(rawDate)
        // Si el usuario no introduce una fecha concreta --> new Date().getMonth() devuelve el mes actual y se suman 6 meses más
        // new Date().setMonth() modifica la fecha actual y devuelve el timestamp en milisegundos
        // new Date (timestamp) convierte esos milisegundos de nuevo en un objeto Date válido
        : new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
    // Utilizo el método TRY para que si se quiere volver a dar de alta un proyecto existente, no se quede el formulario abierto
    try {
      // Crea el proyecto y se renderiza automáticamente. Se cambia para que si el proyecto está activo se actualice y si no se genere el proyecto como al principio
      if (projectsManager.activeProject) {
        projectsManager.updateActiveProject(projectData)
      } else {
        projectsManager.newProject(projectData)
      }
      // Se limpia el formulario para cuando se tenga que introducir uno nuevo
      projectForm.reset()
      // Al enviar el formulario se aplica la función toggleModal
      toggleModal("new-project-modal")
    } catch (err) {
        if (err instanceof Error) {
          showError(err.message)
        } else {
          showError("Unexpected error")
        }
      }
  }) 
} else {
	console.warn("The project form was not found. Check the ID!")
}

// CANCELAR EL FORMULARIO
if (cancelProjectBtn && projectForm instanceof HTMLFormElement) {
  cancelProjectBtn.addEventListener("click", () => {
    projectForm.reset()
    toggleModal("new-project-modal")
  })
}

// CERRAR EL POPUP DE ERROR
if (errorOkBtn) {
  errorOkBtn.addEventListener("click", () => {
    if (errorModal instanceof HTMLDialogElement) {
      errorModal.close()
    }
  })
}

// BOTÓN DE EXPORTACIÓN DE PROYECTOS
const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

// BOTÓN DE IMPORTACIÓN DE PROYECTOS
const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

// BOTÓN DE "PROJECTS" DEL SIDEBAR
if (projectsBtn && projectsPage && detailsPage) {
  projectsBtn.addEventListener("click", () => {
    projectsManager.activeProject = null 
    projectsPage.style.display = "flex"
    detailsPage.style.display = "none"
  })
}

// CONECTAR EL BOTÓN "+"
const addTodoBtn = document.getElementById("add-todo-btn")
const todoModal = document.getElementById("new-todo-modal") as HTMLDialogElement
const todoForm = document.getElementById("new-todo-form") as HTMLFormElement
const cancelTodoBtn = document.getElementById("cancel-todo-btn")

// Abrir el modal
if (addTodoBtn && todoModal instanceof HTMLDialogElement) {
  addTodoBtn.addEventListener("click", () => {
    if (!projectsManager.activeProject) return
    todoModal.showModal()
  })
}

// Envío del formulario ToDo
if (todoForm && todoForm instanceof HTMLFormElement) {
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!projectsManager.activeProject) return

    const formData = new FormData(todoForm)
    const description = formData.get("todoText") as string
    const status = formData.get("todoStatus") as any

    if (!description || !description.trim()) return

    projectsManager.addTodoToActiveProject(description, status)

    todoForm.reset()
    todoModal.close()
  })
}

//Botón Cancel
if (cancelTodoBtn && todoModal instanceof HTMLDialogElement) {
  cancelTodoBtn.addEventListener("click", () => {
    todoModal.close()
  })
}

//======================================================================================
// DEFAULT DATA
//======================================================================================
// CREAR UN PROYECTO POR DEFECTO DESDE EL CÓDIGO
const defaultProject: IProject = {
  name: "Hospital Center",
  description: "Community hospital located at downtown",
  status: "Active",
  userRole: "Engineer",
  finishDate: new Date("2025-05-01")
}

projectsManager.newProject(defaultProject)
// Este archivo es el gestor de proyectos. Es el encargado de crear, guardar y mostrar los proyectos (insertarlos en el DOM).

// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa el tipado de datos IProject
// Se importa la clase Project para crear instancias reales
import { IProject, Project } from "./Project"


// ======================================================
// CLASS: ProjectsManager
// ======================================================
// Se exporta la clase ProjectsManager, que se basa en una colección de proyectos
export class ProjectsManager {
    // Array donde se guardan todos los proyectos creados
    list: Project[] = []
    // Contenedor HTML donde se insertarán todos los proyectos
    ui: HTMLElement
    // Añadimos propiedad para proyecto activo. Para guardar el proyecto que editemos en la página de detalles
    activeProject: Project | null = null

    // Recibe el contenedor desde fuera y no acopla el manager a un ID concreto
    constructor(container: HTMLElement) {
        this.ui = container
    }

    // Regla para que al menos el nombre del proyecto tenga 5 caracteres
    private validateProject(data: IProject) {
        if (data.name.trim().length < 5) {
            throw new Error("Project name must have at least 5 characters")
        }
    }

    // ======================================================
    // MÉTODOS
    // ======================================================
    // Método newProject: recibe los datos en bruto del formulario
    newProject(data: IProject) {
        // Validación del número de caracteres del proyecto
        this.validateProject(data)

        const projectNames = this.list.map((project) => {
            return project.name
        })
        const nameInUse = projectNames.includes(data.name)
        if (nameInUse) {
            throw new Error(`A project with the name "${data.name}" already exists`)
        }
        // Crea una instancia real de Project
        const project = new Project(data)
        // Se crea un event listner para que cuando haga click en la tarjeta de proyecto se abra la página de detalles de proyecto
        project.ui.addEventListener("click", () => {
          //Para que cuando hagamos click en una tarjeta de proyecto, se guarde ese proyecto como activo
          this.activeProject = project
          const projectsPage = document.getElementById("projects-page")
          const detailsPage = document.getElementById("project-details")
          if (!(projectsPage && detailsPage)) { return }
          // Desde aquí se puede cambiar la configuración display indicada en el archivo HTML
          projectsPage.style.display = "none"
          detailsPage.style.display = "flex"
          this.setDetailsPage(project)
        })

        // Inserta la tarjeta del proyecto en el DOM
        this.ui.append(project.ui)
        // Guarda el proyecto en memoria
        this.list.push(project)
        // Devuelve el proyecto creado (para debug o futuras acciones)
        return project
    }

    // Método para escribir todos los detalles de proyecto en la página de detalles de proyecto
    private setDetailsPage(project: Project) {
      
      this.activeProject = project //Se añade esto

      const editBtn = document.getElementById("edit-project-btn")

      if (editBtn) {
        editBtn.onclick = () => {
          const modal = document.getElementById("new-project-modal") as HTMLDialogElement
          const form = document.getElementById("new-project-form") as HTMLFormElement

          if (!modal || !form) return

          ;(form.elements.namedItem("name") as HTMLInputElement).value = project.name
          ;(form.elements.namedItem("description") as HTMLTextAreaElement).value = project.description
          ;(form.elements.namedItem("status") as HTMLSelectElement).value = project.status
          ;(form.elements.namedItem("userRole") as HTMLSelectElement).value = project.userRole
          ;(form.elements.namedItem("finishDate") as HTMLInputElement).value =
            project.finishDate.toISOString().split("T")[0]

          modal.showModal()
        }
      }

      const detailsPage = document.getElementById("project-details")
      if (!detailsPage) return

      const fields = detailsPage.querySelectorAll<HTMLElement>(
        "[data-project-info]"
      )

      fields.forEach((field) => {
        const key = field.dataset.projectInfo as keyof Project
        const value = project[key]

        if (value === undefined || value === null) return

        // Fechas
        if (value instanceof Date) {
          field.textContent = value.toLocaleDateString()
          return
        }

        // Números (cost, progress, etc.)
        if (typeof value === "number") {
          if (key === "cost") {
            field.textContent = `$${value}`
          } 
          else if (key === "progress") {
            field.textContent = `${value * 100}%`
            field.style.width = `${value * 100}%`
          }
          else {
            field.textContent = String(value)
          }
          return
        }

        // Strings
        if (typeof value === "string") {
          field.textContent = value
          return
        }

        // Comprobación de seguridad (por si el día de mañana se añaden otros tipos de dato)
        field.textContent = String(value)
      })

      // Mantener el color de la etiqueta de cada proyecto en la página de detalles
      const detailsIcon = detailsPage.querySelector(".project-details-icon") as HTMLElement

      if (detailsIcon) {
        detailsIcon.style.backgroundColor = project.colour
        detailsIcon.textContent = project.getInitials()
      }

      // Renderizar los ToDo items
      this.renderTodos(project)
    }

    // Método para encontrar un proyecto entre todos los proyectos de la lista
    // Es posible implementar una mejora para que no exista la posibilidad de obtener como valor "undefined" si no se encuentra el proyecto
    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    // Método para encontrar el proyecto por ID
    getProjectById(id: string) {
      return this.list.find(project => project.id === id)
    }
    // Creamos un método para calcular el coste total de todos los proyectos
    getTotalCost(): number {
        return this.list.reduce((total, project) => {
            return total + project.cost
        }, 0)
    }
    
    // Creamos un método para obtener un proyecto buscándolo por el nombre
    getProjectByName(name: string) {
        const project = this.list.find((project) => {
            return project.name === name
        })
        return project
    }


    // Se genera un método para borrar proyectos. En este caso se utiliza el símbolo !== porque nos queremos quedar con todos los proyectos, menos con el que queremos eliminar
    deleteProject(id: string) {
        const project = this.getProject(id)
        if (!project) { return }
        project.ui.remove()
        const remaining = this.list.filter((project) => {
            return project.id !== id
    })
    this.list = remaining
  }
  
  // Se genera un método para exportar la lista de proyectos en formato JSON (formato estandarizado)
  exportToJSON(fileName: string = "projects") { 
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Define un método de la clase encargado de cargar proyectos desde un archivo externo en formato JSON
  importFromJSON() {
    const input = document.createElement('input') // Se crea dinámicamente un elemento <input> de HTML. No se inserta en el DOM; se usa únicamente para abrir el selector de archivos del sistema.
    input.type = 'file' // Se especifica que el <input> será de tipo file, lo que permite al usuario seleccionar archivos desde su PC.
    input.accept = 'application/json' // Especifica que se aceptan archivos JSON
    const reader = new FileReader() // Se crea una instancia de FileReader, una API del navegador que permite leer el contenido de archivos locales de forma asíncrona.
    reader.addEventListener("load", () => { // Se añade un listener al evento load, que se ejecuta cuando el archivo ha sido leído completamente por el FileReader.
      const json = reader.result // Se obtiene el contenido del archivo leído.
      if (!json) { return } // Verificación de seguridad: si por algún motivo no hay contenido, se detiene la ejecución del método.
      
      // Cambiar el método import para importar toda la información de cada proyecto
      const projects = JSON.parse(json as string)

      for (const projectData of projects) {
        try {

          // Buscar por ID
          let existingProject = this.getProjectById(projectData.id)

          // Si no existe por ID, buscar por nombre
          if (!existingProject) {
            existingProject = this.getProjectByName(projectData.name)
          }

          if (existingProject) {

            // Si existe por ID o por nombre → actualizar
            this.updateProjectFromImport(existingProject, projectData)

          } else {

            // Si no existe → crear nuevo
            const project = new Project(projectData, projectData)

            this.list.push(project)
            this.ui.append(project.ui)

            project.ui.addEventListener("click", () => {
              this.activeProject = project
              const projectsPage = document.getElementById("projects-page")
              const detailsPage = document.getElementById("project-details")
              if (!(projectsPage && detailsPage)) return

              projectsPage.style.display = "none"
              detailsPage.style.display = "flex"
              this.setDetailsPage(project)
            })
          }

        } catch (error) {
          console.error("Error importing project", error)
        }
      }

    })
    input.addEventListener('change', () => { // Se escucha el evento change, que se dispara cuando el usuario selecciona un archivo.
      const filesList = input.files // Se obtiene la lista de archivos seleccionados por el usuario (FileList | null).
      if (!filesList) { return } // Verificación defensiva para asegurar que existe al menos un archivo seleccionado.
      reader.readAsText(filesList[0]) // Se lee el primer archivo seleccionado como texto plano, lo que desencadena el evento load del FileReader.
    })
    input.click() // Se simula un clic programático sobre el <input> para abrir el selector de archivos sin que el elemento sea visible.
  }

  // Nuevo método para actualizar la información de un proyecto desde la página de detalles
  updateActiveProject(data: IProject) {
  // Si por alguna razón no hay proyecto activo → se para la ejecución del método
  if (!this.activeProject) return

    // Validación del número de caracteres del proyecto
    this.validateProject(data)

    // En caso contrario, se actualiza cada propiedad manualmente
    this.activeProject.name = data.name
    this.activeProject.description = data.description
    this.activeProject.status = data.status
    this.activeProject.userRole = data.userRole
    this.activeProject.finishDate = data.finishDate
    this.activeProject.cost = data.cost
    
    // Se actualiza SOLO la página de detalles
    this.setDetailsPage(this.activeProject)

    // Actualizamos SOLO la tarjeta visual sin recrearla
    const title = this.activeProject.ui.querySelector("h5")
    const description = this.activeProject.ui.querySelector("p")
    const properties = this.activeProject.ui.querySelectorAll(".card-property p")

    // El orden actual en la tarjeta es:
    // 0 = "Status" label
    // 1 = Status value
    // 2 = "Role" label
    // 3 = Role value
    // 4 = "Cost" label
    // 5 = Cost value
    // 6 = "Estimated Progress" label
    // 7 = Progress value

    if (properties[5]) {
      properties[5].textContent = `$${this.activeProject.cost}`
    }

        if (title) title.textContent = this.activeProject.name
        if (description) description.textContent = this.activeProject.description
      }

  // Nuevo método para añadir ToDo items
  addTodoToActiveProject(description: string, status: any) {
    if (!this.activeProject) return

    this.activeProject.addTodo(description, status)

    this.renderTodos(this.activeProject)
  }

  // Método para renderizar los nuevos ToDo items
  private renderTodos(project: Project) {
    const container = document.getElementById("todo-list")
    if (!container) return

    container.innerHTML = ""

    project.todos.forEach(todo => {
      const item = document.createElement("div")
      item.className = `todo-item ${todo.status.replace(" ", "-").toLowerCase()}`

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; column-gap: 15px; align-items: center;">
            <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
            <p>${todo.description}</p>
          </div>
          <p style="text-wrap: nowrap; margin-left: 10px;">
            ${new Date(todo.date).toLocaleDateString()}
          </p>
        </div>
      `

      container.appendChild(item)
    })
  }

  // Nuevo método para que se actualice la información de los proyectos existentes al importar
  private updateProjectFromImport(existing: Project, data: any) {

    existing.name = data.name
    existing.description = data.description
    existing.status = data.status
    existing.userRole = data.userRole
    existing.finishDate = new Date(data.finishDate)

    existing.cost = data.cost ?? 0
    existing.progress = data.progress ?? 0
    existing.colour = data.colour ?? existing.colour

    existing.todos = (data.todos ?? []).map((todo: any) => ({
      ...todo,
      date: new Date(todo.date)
    }))

    // Actualizar UI
    const title = existing.ui.querySelector("h5")
    const description = existing.ui.querySelector("p")

    if (title) title.textContent = existing.name
    if (description) description.textContent = existing.description
    const properties = existing.ui.querySelectorAll(".card-property p")

    if (properties[5]) {
      properties[5].textContent = `$${existing.cost}`
    }
  }

}
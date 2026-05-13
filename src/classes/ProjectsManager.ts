// ======================================================
// RESPONSABILIDADES
// ======================================================
// Estado + lógica de negocio
  // ↳ gestión de memoria global
  // ↳ coordinación con Firebase
  // ↳ sincronización con React
  // ↳ creación/reconstrucción de proyectos

// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa la clase Project y la interfaz IProject que define cómo debe de ser un proyecto, es decir, su estructura mínima
import { IProject, IProjectJSON, Project } from "./Project"
// Importo FirebaseService
import { FirebaseService } from "../firebase/FirebaseService"

// ======================================================
// CLASE PRINCIPAL: ProjectsManager
// ======================================================
// Se define la clase ProjectsManager que es el gestor de proyectos
export class ProjectsManager {
  // Lista de proyectos (vacía en un principio)
  list: Project[] = []
  // Estas son 3 variables que están almacenando funciones (callbacks). Aquí se declaran y luego se utilizan desde fuera → "Cuando pase algo → avisa a otro sistema"
  // ProjectsManager no sabe nada de React → Deja "huecos" para que React se conecte. Ejemplo: en ProjectsPage.tsx
  // Analogía: ProjectsManager = fábrica y React = pantalla → "Cuando se cree algo → avisa a la pantalla"
  onProjectCreated = (project: Project) => {} // Función que recibe un project e inicialmente no hace nada. Se ejecuta cuando se crea un proyecto. AVISO DE CREACIÓN
  onProjectDeleted = () => {} // Función sin parámetros. Se ejecuta cuando se elimina un proyecto. AVISO DE BORRADO
  onProjectUpdated = () => {} // Función sin parámetros. Se ejecuta cuando cambia alo dentro de un proyecto. AVISO DE CAMBIOS

  async loadProjects() {

    const projects = await FirebaseService.getProjects()

    // Reinicia memoria antes de reconstruir
    this.list = []

    // Reconstruye cada proyecto
    for (const project of projects) {

      await this.restoreProject(project)
    }

    this.onProjectUpdated()
  }

    // Firestore
    // ↓
    // FirebaseService.getProjects()
    // ↓ devuelve IProjectJSON[]
    // ProjectsManager.restoreProject()
    // ↓
    // new Project(...)
    // ↓
    // instancia real
    
  // --------------------------------------------------
  // MÉTODOS DE LA CLASE ProjectsManager
  // --------------------------------------------------

  // --------------------------------------------------
  // MÉTODO createProject
  // --------------------------------------------------
  // Responsabilidad:
  // 1. Crear una instancia Project
  // 2. Guardarla en Firebase
  // 3. Añadirla a memoria
  // 4. Notificar a React
  async createProject(data: IProject) {

    // Crear instancia real del proyecto
    const project = new Project(data)

    // Persistir en Firebase
    await FirebaseService.saveProject(
      project.toJSON()
    )

    // Guardar en memoria
    this.list = [...this.list, project]

    // Notificar a React
    this.onProjectCreated(project)

    return project
  }

  // CREACIÓN DESDE UI
    // ProjectFormModal
    // ↓
    // ProjectsPage
    // ↓
    // ProjectsManager.createProject()
    // ↓
    // FirebaseService.saveProject()
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO restoreProject
  // --------------------------------------------------
  // Responsabilidad:
  // Reconstruir proyectos que vienen desde Firebase
  // o desde archivos JSON importados.
  //
  // DIFERENCIA IMPORTANTE:
  // createProject() → crea proyectos NUEVOS desde la UI
  // restoreProject() → reconstruye proyectos YA existentes
  // conservando:
  // - id
  // - colour
  // - todos
  // - progress
  // - cost
  async restoreProject(projectData: IProjectJSON) {

    // Evita duplicados en memoria
    const existingProject = this.getProject(projectData.id)

    // Si ya existe → actualizar referencia existente
    if (existingProject) {

      existingProject.name = projectData.name
      existingProject.description = projectData.description
      existingProject.status = projectData.status
      existingProject.userRole = projectData.userRole
      existingProject.finishDate = new Date(projectData.finishDate)
      existingProject.cost = projectData.cost
      existingProject.progress = projectData.progress
      existingProject.colour = projectData.colour

      existingProject.todos = projectData.todos.map(todo => ({
        ...todo,
        date: new Date(todo.date),
        priority: todo.priority ?? "Medium"
      }))

      this.onProjectUpdated()

      return existingProject
    }

    // Reconstrucción real del proyecto
    const project = new Project(
      {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        userRole: projectData.userRole,
        finishDate: new Date(projectData.finishDate),
        cost: projectData.cost,
        progress: projectData.progress
      },
      projectData
    )

    // Guardar en memoria
    this.list = [...this.list, project]

    return project
  }

  // RECONSTRUCCIÓN DESDE FIREBASE
    // FirebaseService.getProjects()
    // ↓
    // ProjectsManager.restoreProject()
    // ↓
    // new Project(...)
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO getProject
  // --------------------------------------------------
  // Busca un proyecto dentro de la lista usando su ID
  // FIND → SOLO BUSCA EL PROYECTO. Recorre el array y devuelve el PRIMER elemento que cumpla la condición. Si no encuentra nada → devuelve undefined
  getProject(id: string): Project | undefined {
    return this.list.find(project => project.id === id) // Se ejecuta para cada elemento del array → "Para cada proyecto → comprueba si su id coincide"
  }
  
  // --------------------------------------------------
  // MÉTODO filterProjects (para filtrar proyectos mediante el searchbox)
  // --------------------------------------------------
  filterProjects(value: string): Project[] {
    return this.list.filter(project =>
      project.name.toLowerCase().includes(value.toLowerCase()) // Para que no haga distinción entre minúsculas y mayúsculas
    )
  }

  // --------------------------------------------------
  // MÉTODO deleteProject
  // --------------------------------------------------
  // Este método elimina un proyecto del array usando su ID
  // Además, he añadido una condición para evitar que se ejecute onProjectDeleted() si no ha habido cambios en la longitud de la lista
  deleteProject(id: string) {
    const initialLength = this.list.length
    this.list = this.list.filter(project => project.id !== id)

    if (this.list.length !== initialLength) {
      this.onProjectDeleted()
    }
  }

  async deleteProjectFromFirebase(id: string) {

    await FirebaseService.deleteProject(id)

    this.deleteProject(id)
  }
  
  // --------------------------------------------------
  // MÉTODO updateProject
  // --------------------------------------------------
  // Este método notifica a React que los datos han cambiado, es decir, NO modifica datos sino que SOLO dispara una actualización de la UI
  // Avisa de que cuando se actualice un proyecto → se refresque React
  updateProject() {

  // NUEVA REFERENCIA DE ARRAY: para eliminar los parcheos del setRefresh
  // React detecta cambio de referencia
  this.list = [...this.list]

  // Notificar actualización UI
  this.onProjectUpdated()
}

  async updateProjectInFirebase(project: Project) {

    await FirebaseService.updateProject(
      project.id,
      project.toJSON()
    )
  }
  
  // --------------------------------------------------
  // MÉTODO exportToJSON
  // --------------------------------------------------
  // Este método convierte tus proyectos en un archivo JSON y lo descarga
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list.map(p => p.toJSON()),null,2) // Convierte tu array de proyectos en texto
    const blob = new Blob([json], { type: 'application/json' }) // BLOB: Un archivo en memoria → Estás creando un archivo sin guardarlo aún
    const url = URL.createObjectURL(blob) // Convierte el archivo en una URL temporal
    const a = document.createElement('a') // Crea un enlace HTML (invisible)
    a.href = url // el enlace apunta al archivo
    a.download = fileName // define el nombre del archivo
    a.click() // simula un click → descarga el archivo
    URL.revokeObjectURL(url) // limpia memoria
  }
  
  // --------------------------------------------------
  // MÉTODO importProjects
  // --------------------------------------------------
  // importProjects() recibe proyectos que ya vienen de fuera, por ejemplo de un archivo JSON, los guarda en Firebase y luego recarga desde Firebase.
  async importProjects(projects: IProjectJSON[]) {

    for (const projectData of projects) {

      await FirebaseService.saveProject(projectData)
    }

    await this.loadProjects()
  }
}
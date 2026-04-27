// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa la clase Project y la interfaz IProject que define cómo debe de ser un proyecto, es decir, su estructura mínima
import { IProject, Project } from "./Project"

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

  // --------------------------------------------------
  // MÉTODOS DE LA CLASE ProjectsManager
  // --------------------------------------------------

  // --------------------------------------------------
  // MÉTODO filterProjects (para filtrar proyectos mediante el searchbox)
  // --------------------------------------------------
  filterProjects(value: string){
    const filteredProjects = this.list.filter((project) => {
      return project.name.includes(value)
    })
    return filteredProjects
  }
  
  // --------------------------------------------------
  // MÉTODO newProject
  // --------------------------------------------------
  // El método newProject tiene doble comportamiento:
  // 1. Si ya existe un proyecto con ese nombre → lo ACTUALIZA
  // 2. Si no existe → CREA uno nuevo
    // data: objeto con los datos del proyecto (del formulario o JSON/Firebase)
    // id?: opcional → puede venir o no
  newProject(data: IProject, id?: string) {
    // Recorre la lista de proyectos (this.list)
    // find(...) → devuelve el primer proyecto que cumpla la condición
    // p.name === data.name → compara nombres
    // Resultado: si lo encuentra → devuelve el objeto Project // Si no lo encuentra → devuelve undefined
    const existingProject = this.list.find(p => p.name === data.name)

    // SI YA EXISTE ESE PROYECTO → LO ACTUALIZA
    if (existingProject) {
      // Se sobreescribe la información del proyecto
      existingProject.name = data.name
      existingProject.description = data.description
      existingProject.status = data.status
      existingProject.userRole = data.userRole
      // Se asegura el tipo correcto de Date
      existingProject.finishDate = new Date(data.finishDate)
      existingProject.cost = data.cost
      existingProject.progress = data.progress

      // Se notifica a React (ProjectsPage.tsx) → Hace setProjects(...) → Se re-renderiza la UI 
      this.onProjectUpdated()
      // Devuelve el objeto modificado. NO crea uno nuevo, sino que es el mismo objeto en memoria pero actualizado
      return existingProject
    }

    // SI NO EXISTE ESE PROYECTO → LO CREA
    // Llamo al constructor de Project, que es: constructor(data: IProject, existingData?: Partial<IProjectJSON>, id = uuidv4())
    // Tiene 3 parámetros:
      // data → datos del proyecto
      // existingData → objeto opcional (puede contener id, colour, etc.)
      // id → valor por defecto si no hay ID
      // Significa que: si existingData.id existe → úsalo (JSON/Firebase) // si no → usa id (tercer parámetro → uuid)

    // Operador ternario: condición ? valor_si_true : valor_si_false
    // Si id existe → crea un objeto { id: id }
      // ¿POR QUÉ NECESITAS UN OBJETO Y NO UN STRING? Porque tu constructor de project.ts espera esto: constructor(data: IProject, existingData?: Partial<IProjectJSON>, id = uuidv4())
      // El segundo parámetro del constructor NO es un string, es un objeto: 
        // existingData?: {
        // id?: string
        // colour?: string
        // todos?: ...
        // }
    // Si no → pasa undefined
    const project = new Project(data, id ? { id } : undefined)

    // Se guarda en la lista, es decir, se añade el proyecto al array. Modifica el estado interno del manager y el array ahora tiene un elemento más
    this.list.push(project)
    // Se notifica la creación a React (ProjectsPage.tsx) → React hace setProjects([...this.list]) → Se re-renderiza la UI 
    this.onProjectCreated(project)

    // Devuelve la nueva instancia creada
    return project
  }

  // --------------------------------------------------
  // MÉTODO getProject
  // --------------------------------------------------
  // Busca un proyecto dentro de la lista usando su ID
  // FIND → SOLO BUSCA EL PROYECTO. Recorre el array y devuelve el PRIMER elemento que cumpla la condición. Si no encuentra nada → devuelve undefined
  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id // Se ejecuta para cada elemento del array → "Para cada proyecto → comprueba si su id coincide"
    })
    return project // Si no encuentra el proyecto → devuelve undefined
  }
  
  // --------------------------------------------------
  // MÉTODO deleteProject
  // --------------------------------------------------
  // Este método elimina un proyecto del array usando su ID
  deleteProject(id: string) {
    const project = this.getProject(id) // Se busca el ID del proyecto
    if (!project) { return } // Si NO existe el proyecto → se sale del método (evita errores si el ID no existe: if (!project) → true → return → se termina la función)
    // FILTER → crea un NUEVO array quedándose con todos los proyectos menos el que queremos eliminar (no modifica el array → crea uno nuevo)
    const remaining = this.list.filter((project) => {
      return project.id !== id // Va comparando los IDs y se quedan solo los que son distintos
    })
    this.list = remaining // Se actualiza la lista de proyectos tras eliminar el proyecto que queríamos. Se sustituye el array original (No modifica el array → crea uno nuevo) → Clave para que React detecte el cambio
    this.onProjectDeleted() // LLama al callback (notificación a React)
  }
  
  // --------------------------------------------------
  // MÉTODO updateProject
  // --------------------------------------------------
  // Este método notifica a React que los datos han cambiado, es decir, NO modifica datos sino que SOLO dispara una actualización de la UI
  // Avisa de que cuando se actualice un proyecto → se refresque React
  updateProject() {
    this.onProjectUpdated()
  }
  
  // --------------------------------------------------
  // MÉTODO exportToJSON
  // --------------------------------------------------
  // Este método convierte tus proyectos en un archivo JSON y lo descarga
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2) // Convierte tu array de proyectos en texto
    const blob = new Blob([json], { type: 'application/json' }) // BLOB: Un archivo en memoria → Estás creando un archivo sin guardarlo aún
    const url = URL.createObjectURL(blob) // Convierte el archivo en una URL temporal
    const a = document.createElement('a') // Crea un enlace HTML (invisible)
    a.href = url // el enlace apunta al archivo
    a.download = fileName // define el nombre del archivo
    a.click() // simula un click → descarga el archivo
    URL.revokeObjectURL(url) // limpia memoria
  }
  
  // --------------------------------------------------
  // MÉTODO importFromJSON
  // --------------------------------------------------
  importFromJSON() {
    const input = document.createElement('input') // crea un input tipo archivo
    input.type = 'file'
    input.accept = 'application/json' // solo permite subir JSON
    const reader = new FileReader() // herramienta para leer archivos
    reader.addEventListener("load", () => { // se ejecuta cuando el archivo ya está leído
      const json = reader.result // contenido del archivo (texto)
      if (!json) { return } // seguridad (por si falla)
      const projects: IProject[] = JSON.parse(json as string) // convierte texto → objetos JS
      for (const project of projects) { // recorre cada proyecto
        try {
          this.newProject(project) // los añade al sistema
        } catch (error) { // ignora errores (por ejemplo duplicados)
          
        }
      }
    })
    input.addEventListener('change', () => { // se ejecuta cuando el usuario selecciona archivo
      const filesList = input.files // obtiene archivo seleccionado
      if (!filesList) { return }
      reader.readAsText(filesList[0]) // lee el archivo
    })
    input.click() // abre el selector de archivos
  }
}
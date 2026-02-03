// Este archivo es el gestor de proyectos. Es el encargado de crear, guardar y mostrar los proyectos (insertarlos en el DOM).

// Se importa el tipado de datos IProject
// Se importa la clase Project para crear instancias reales
import { IProject, Project } from "./Project"

// Se exporta la clase ProjectsManager, que se basa en una colección de proyectos
export class ProjectsManager {
    // Array donde se guardan todos los proyectos creados
    list: Project[] = []
    // Contenedor HTML donde se insertarán todos los proyectos
    ui: HTMLElement

    // Recibe el contenedor desde fuera y no acopla el manager a un ID concreto
    constructor(container: HTMLElement) {
        this.ui = container
    }

    // Método newProject: recibe los datos en bruto del formulario
    newProject(data: IProject) {
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
          const projectsPage = document.getElementById("projects-page")
          const detailsPage = document.getElementById("project-details")
          if (!(projectsPage && detailsPage)) { return }
          // Desde aquí se puede cambiar la configuración display indicada en el archivo HTML
          projectsPage.style.display = "none"
          detailsPage.style.display = "flex"
        })

        // Inserta la tarjeta del proyecto en el DOM
        this.ui.append(project.ui)
        // Guarda el proyecto en memoria
        this.list.push(project)
        // Devuelve el proyecto creado (para debug o futuras acciones)
        return project
    }

    // Método para encontrar un proyecto entre todos los proyectos de la lista
    // Es posible implementar una mejora para que no exista la posibilidad de obtener como valor "undefined" si no se encuentra el proyecto
    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
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
      const projects: IProject[] = JSON.parse(json as string) //Convierte el texto JSON en un objeto JavaScript. Se hace un type assertion (as string) porque TypeScript no puede garantizar que result sea un string. Se asume que el JSON contiene un array que cumple la interfaz IProject.
      for (const project of projects) { // Itera sobre cada proyecto contenido en el array importado.
        try { // Para cada proyecto, se llama al método newProject, que se encarga de crear o registrar el proyecto en la aplicación.
          this.newProject(project) // El método newProject se aplica a la variable proyecto
        } catch (error) { // Se captura cualquier error que pueda producirse durante la creación de un proyecto.
          // Actualmente el catch está vacío, por lo que los errores se silencian.
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
}
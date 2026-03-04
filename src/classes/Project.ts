// Este archivo define un proyecto: qué datos tiene, qué tipos de dato son válidos y cómo se representa visualmente (UI)

// ======================================================
// IMPORTACIONES
// ======================================================
// Importo el paquete de UUID para que se genere un código único a cada proyecto generado
// Renombramos v4 por uuidv4 para ser más explícitos
import { v4 as uuidv4 } from 'uuid'

// ======================================================
// VARIABLES GLOBALES
// ======================================================
// Variable que define 6 colores diferentes para generar las etiquetas con las iniciales de cada proyecto:
const project_colours = [
  "#ca8134",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b"
]

// ======================================================
// TIPOS
// ======================================================
// Define los tipos de dato para ProjectStatus y UserRole, obligando que sus valores solo puedan ser estos
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type TodoStatus = "Pending" | "In Progress" | "Completed"

// ======================================================
// INTERFACES
// ======================================================
// La interfaz define cómo debe de ser un objeto, en este caso, cada proyecto
// Asegura que cualquier proyecto tenga estos campos y se usa para tipar el formulario y el constructor de la clase
export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
  cost: number
  progress: number
}

// La interfaz de cómo debe ser cada ToDo item
export interface ITodo {
  id: string
  text: string
  date: Date
}

// Se genera una nueva interfaz que incluye toda la información que debe arrastrar el proyecto
export interface IProjectJSON extends IProject {
  id: string
  colour: string
  todos: {
    id: string
    description: string
    date: string
    status: TodoStatus
  }[]
}

// ======================================================
// CUSTOM CLASS: Project
// ======================================================
// Exporto la custom class "Project" para poder importarla en otros archivos
// La clase implementa IProject, por lo que está obligada a definir todas sus propiedades con el tipado fijado por IProject
export class Project implements IProject {

  // --------------------------------------------------
  // DATA PROPERTIES (IProject)
  // --------------------------------------------------
  // Son los datos del proyecto que coinciden con lo que viene del formulario
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  
  // --------------------------------------------------
  // INTERNAL PROPERTIES
  // --------------------------------------------------
  // Propiedades internas de la clase
  ui!: HTMLDivElement // El contenedor de HTML que representa el proyecto
  cost: number = 0 // Valor calculable más adelante
  progress: number = 0 // Valor calculable más adelante
  id: string // El tipo de dato del id generado por el paquete uuidv4 va a ser una string
  colour: string
  todos: {
    id: string
    description: string
    date: Date
    status: TodoStatus
  }[] = []


  // --------------------------------------------------
  // CONSTRUCTOR
  // --------------------------------------------------
  // Recibe un objeto que cumple con la interfaz IProject
  constructor(data: IProject, existingData?: Partial<IProjectJSON>) {

    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    this.finishDate = new Date(data.finishDate)

    this.id = existingData?.id ?? uuidv4()

    this.colour = existingData?.colour ?? 
      project_colours[Math.floor(Math.random() * project_colours.length)]

    this.cost = existingData?.cost ?? data.cost ?? 0
    this.progress = existingData?.progress ?? data.progress ?? 0

    this.todos = existingData?.todos?.map(todo => ({
      ...todo,
      date: new Date(todo.date)
    })) ?? []

    this.setUI()
  }

  // --------------------------------------------------
  // MÉTODO: CÁLCULO DE LAS INICIALES
  // --------------------------------------------------
  // Para conseguir que se cojan las 2 letras del nombre del proyecto en mayúscula, en lugar de "HC" se configura de la siguiente forma:
  // Genero una variable words en la que cojo el nombre del proyecto (this.name), elimino espacios en blanco al inicio y al final (trim), divido el string en un array usando el espacio como separador (split) y elimino posibles espacios vacíos entre las palabras (filter)
  getInitials(): string {
  const words = this.name.trim().split(" ").filter(Boolean)

  // ¿El nombre tiene solo una palabra?
  if (words.length === 1) {
    return words[0].slice(0, 2)
  }
  // Recorre cada palabra y coge la primera letra (map) y convierte el array en string (join):
  return words.map(word => word[0]).join("").slice(0, 2)
  }

  // --------------------------------------------------
  // MÉTODO: AÑADIR TO-DO
  // --------------------------------------------------
  addTodo(description: string, status: TodoStatus = "Pending") {
    this.todos.push({
      id: crypto.randomUUID(),
      description,
      date: new Date(),
      status
    })
  }

  // --------------------------------------------------
  // MÉTODOS UI
  // --------------------------------------------------
  // Método setUI(): Método encargado de crear la TARJETA VISUAL DEL PROYECTO
  setUI() {
    // Evita recrear el DOM si ya existe. Es una buena práctica para evitar duplicados
    if (this.ui) {return}
    // Crea un <div>
    this.ui = document.createElement("div")
    // Se le asigna la clase CSS "project-card"
    this.ui.className = "project-card"
   
    // Inserta todo el HTML de la tarjeta
    // Y se utiliza template literals ${this.} para que cada proyecto genere su propia UI
    
    const initials = this.getInitials()

    this.ui.innerHTML = `
    <div class="card-header">
       <div class="project-icon">${initials}</div>
      <div>
        <h5>${this.name}</h5>
        <p>${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p>${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p>${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p>$${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p>${this.progress * 100}%</p>
      </div>
    </div>`
    
    // Busca dentro de this.ui el primer elemento que tenga la clase ".project-icon" y devuelve el elemento HTML si lo encuentra o null si no existe:
    const icon = this.ui.querySelector(".project-icon") as HTMLElement
    if (icon) {
      // Aquí estamos modificando el CSS directamente desde Javascript:
      icon.style.backgroundColor = this.colour
    }
  }
}
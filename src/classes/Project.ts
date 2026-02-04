// Este archivo define un proyecto: qué datos tiene, qué tipos de dato son válidos y cómo se representa visualmente (UI)

// ======================================================
// IMPORTACIONES
// ======================================================
// Importo el paquete de UUID para que se genere un código único a cada proyecto generado
// Renombramos v4 por uuidv4 para ser más explícitos
import { v4 as uuidv4 } from 'uuid'

// ======================================================
// TIPOS & INTERFACES
// ======================================================
// Define los tipos de dato para ProjectStatus y UserRole, obligando que sus valores solo puedan ser estos
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

// La interfaz define cómo debe de ser un objeto, en este caso, cada proyecto
// Asegura que cualquier proyecto tenga estos campos y se usa para tipar el formulario y el constructor de la clase
export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
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

  // --------------------------------------------------
  // CONSTRUCTOR
  // --------------------------------------------------
  // Recibe un objeto que cumple con la interfaz IProject
  constructor(data: IProject) {
    //Definición de los datos de proyecto
    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    this.finishDate = data.finishDate
    // Se genera esto para que se asigne a cada proyecto generado un código ID único del paquete uuidv4
    this.id = uuidv4()
    // En cuanto se genera el proyecto, se genera su interfaz visual y cada Project sabe cómo dibujarse así mismo
    this.setUI()
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
    this.ui.innerHTML = `
    <div class="card-header">
      <p style="background-color: #ca8134; padding: 10px; border-radius: 8px; aspect-ratio: 1;">HC</p>
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
  }
}
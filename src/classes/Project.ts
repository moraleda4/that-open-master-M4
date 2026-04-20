// Este archivo define un proyecto: qué datos tiene, qué tipos de dato son válidos y cómo se representa visualmente (UI)

// ======================================================
// IMPORTACIONES
// ======================================================
// Importo el paquete de UUID para que se genere un código único a cada proyecto generado
// Esto evita conflictos y permite identificar proyectos
// Renombramos v4 por uuidv4 para ser más explícitos
import { v4 as uuidv4 } from 'uuid'

// ======================================================
// VARIABLES GLOBALES
// ======================================================
// Variable que define 6 colores diferentes para generar las etiquetas con las iniciales de cada proyecto:
// Luego se le asigna un color aleatorio a cada proyecto
const project_colours = [
  "#ca8134",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b"
]

// ======================================================
// TIPOS (TypeScript)
// ======================================================
// Tipos cerrados → solo permiten estos valores
// Muy útil para evitar errores en formularios
// Define los tipos de dato para ProjectStatus y UserRole, obligando que sus valores solo puedan ser estos
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type TodoStatus = "Pending" | "In Progress" | "Completed"

// ======================================================
// INTERFACES
// ======================================================
// La interfaz define cómo debe de ser un objeto, es decir, su estructura mínima (en este caso un proyecto)
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
  description: string
  date: Date
  status: TodoStatus
}

// Se genera una nueva interfaz que incluye toda la información que debe arrastrar el proyecto
// Esta interfaz se usa para exportar/importar JSON
// Diferencia clave: la fecha viene como string
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
// CLASE PRINCIPAL: Project
// ======================================================
// Representa un proyecto real dentro de la app
// Exporto la clase principal "Project" para poder importarla en otros archivos
// La clase implementa IProject, por lo que está obligada a definir todas sus propiedades con el tipado fijado por IProject
export class Project implements IProject {

  // --------------------------------------------------
  // DATOS PRINCIPALES (esto viene del formulario)
  // --------------------------------------------------
  // Son los datos del proyecto que coinciden con lo que viene del formulario (no se han incluido aquí ni "cost" ni "progress")
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  
  // --------------------------------------------------
  // DATOS INTERNOS (lógica de la app, es decir, estos NO los mete el usuario directamente desde el formulario)
  // --------------------------------------------------
  // Propiedades internas de la clase
  cost: number = 0 // Valor calculable más adelante. Es el coste del proyecto
  progress: number = 0 // Valor calculable más adelante. Es el nivel de progreso del proyecto
  id: string // El tipo de dato del id generado por el paquete uuidv4 va a ser una string → Se usa para navegar (/project/:id), encontrar el proyecto, actualizarlo...
  colour: string // Color del icono de proyecto → Solo UI (visual)
  // Lista de tareas del proyecto (ToDo list): es un array de objetos
  todos: {
    id: string
    description: string
    date: Date
    status: TodoStatus
  }[] = [] // Cada proyecto empieza con este array vacío, es decir, sin tareas. Si no haces esto todos: {...}[] sería undefined y project.todos.push(...) ❌ rompe
  // Conclusión: todos: {...}[] = [] → estado inicial seguro

  // --------------------------------------------------
  // CONSTRUCTOR DE LA CLASE PROJECT
  // --------------------------------------------------
  // Es la función que se ejecuta cuando se hace: new Project (data), es decir, donde nace el objeto
  // Para almacenar los datos que rellena un usuario desde un formulario

  // Recibe un objeto que cumple con la interfaz IProject
  // data → datos del formulario
  // existingData → datos cuando importas JSON
  // La ? significa que este parámetro es OPCIONAL
  // Partial significa que NO hace falta que vengan todos los campos
  constructor(data: IProject, existingData?: Partial<IProjectJSON>) {

    // Asignación de datos básicos
    // this.name → Es la forma de coger los datos del proyecto que ha rellenado el usuario en el formulario. Es una propiedad del objeto que estás creando: const project = new Project(data)
    // = data.name → Es la forma de guardar el dato que viene del formulario en data
    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    // Convertimos siempre a Date (por seguridad)
    this.finishDate = new Date(data.finishDate)

    // ?? se llama nullish coalescing: A ?? B
    // Si A existe → usa A  
    // Si A es null o undefined → usa B

    // ID único (o reutilizado si viene de JSON)
    // Si existingData existe → dame su id  
    // Si no → undefined → uuidv4() genera un ID único
    this.id = existingData?.id ?? uuidv4()

    // Color aleatorio o recuperado
    // Si ya tenía color → úsalo  
    // Si no → asigna uno aleatorio
    this.colour = existingData?.colour ?? project_colours[Math.floor(Math.random() * project_colours.length)]
      // 1.Math.random() → número entre 0 y 1
      // 2.multiplicas por tamaño del array
      // 3.Math.floor() → número entero
      // 4.accedes al array project_colours

    // Coste y progreso 
    // 1. usa existingData.cost si existe
    // 2. si no → usa data.cost
    // 3. si no → usa 0
    this.cost = existingData?.cost ?? data.cost ?? 0
    this.progress = existingData?.progress ?? data.progress ?? 0

    // 1. Usa existingData?.todos cuando existe
    // 2. si no → usa []
        // existingData?.todos → intenta acceder a los todos
        // ?.map(...) → SOLO ejecuta map si existen todos, La ? significa "Ejecuta esto SOLO si existe lo anterior"
        // .map(todo => (...)) → transforma cada elemento del array
        // ...todo → copia todas las propiedades
        // date: new Date(todo.date) → Convierte: "2026-04-01" → Date object, ya que cuando importas en JSON viene como string
    this.todos = existingData?.todos?.map(todo => ({
      ...todo,
      date: new Date(todo.date)
    })) ?? []
  }

  // --------------------------------------------------
  // MÉTODOS DE LA CLASE PROJECT
  // --------------------------------------------------
  // Método = acción que puede hacer el objeto. Los DATOS/PROPIEDADES de la clase define QUÉ ES y los MÉTODOS definen QUÉ HACE
  // Se utilizan los MÉTODOS cuando queremos que el objeto modifique su estado, calcule algo, encapsule lógica...

  // --------------------------------------------------
  // MÉTODO: CÁLCULO DE LAS INICIALES
  // --------------------------------------------------
  // Este método calcula algo (cálculo)

  // Para conseguir que se cojan las 2 letras del nombre del proyecto en mayúscula, en lugar de "HC" se configura de la siguiente forma:
  // Genero una variable words en la que cojo el nombre del proyecto (this.name), elimino espacios en blanco al inicio y al final (trim),
  // divido el string en un array usando el espacio como separador (split) y elimino posibles espacios vacíos entre las palabras (filter)
  getInitials(): string {
  // 1. this.name → nombre del proyecto
  // 2. .trim() → quita espacios al inicio y final
  // 3. .split(" ") → separa en palabras
  // 4. .filter(Boolean) → elimina espacios vacíos
  const words = this.name.trim().split(" ").filter(Boolean)

  // ¿El nombre tiene solo una palabra? → primeras 2 letras
  if (words.length === 1) {
    return words[0].slice(0, 2)
  }
  // Más de una palabra → Recorre cada palabra y coge la primera letra (map) y convierte el array en string (join) → iniciales de cada palabra
    // words.map(word => word[0]) → coge la primera letra de cada palabra
    // .join("") → convierte en string
    // .slice(0, 2) → limita a 2 caracteres
  return words.map(word => word[0]).join("").slice(0, 2)
  }

  // --------------------------------------------------
  // MÉTODO: AÑADIR TO-DO
  // --------------------------------------------------
  // Este método modifica estado y añade datos (acción)

  // Este método no pinta nada, no toca React → SOLO modifica datos → Añade un nuevo objeto al final del array "todos"
    // description → obligatorio
    // status → opcional (por defecto "Pending")
  addTodo(description: string, status: TodoStatus = "Pending") {
    // Añade una nueva tarea al array (ToDo list) → Modifica el estado del proyecto
    // push() → Es un método de los arrays de JavaScript → NO sustituye lo ya existente, sino que AÑADE
    // array.push(elemento) → "mete esto dentro del array" → Se almacena EN MEMORIA dentro del objeto Project
    this.todos.push({
      id: crypto.randomUUID(), // Genera ID único
      description, // Texto de la tarea
      date: new Date(), // Fecha actual
      status // Estado inicial
    })
  }
}
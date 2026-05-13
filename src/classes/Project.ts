// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo define:
  // Qué es un Project (estructura: qué datos tiene, qué tipos de dato son válidos)
  // Cómo se construye (constructor)
  // Cómo se transforma (JSON ↔ App)

// ======================================================
// RELACIÓN CON EL RESTO DE ARCHIVOS
// ======================================================
//
// Project.ts
//    ↓ crea y reconstruye objetos Project
//
// ProjectsManager.ts
//    ↓ gestiona la memoria global de proyectos
//
// FirebaseService.ts
//    ↓ serializa/deserializa datos Firestore
//
// React Components
//    ↓ renderizan información visual
//
// ProjectFormModal.tsx
//    ↓ crea/edita datos base del proyecto
//
// TodoList.tsx
//    ↓ modifica project.todos
//
// ProjectDetailsPage.tsx
//    ↓ actualiza propiedades del proyecto

// Porque realmente:
  // TodoList muta project.todos
  // DetailsPage muta progress
  // FirebaseService reconstruye Project
// y eso es MUY importante arquitectónicamente.

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
// Define los tipos de dato para ProjectStatus, UserRole, TodoStatus y TodoPriority → obligando que sus valores solo puedan ser estos
// Muy útil para evitar errores en formularios que rellenan los usuarios
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type TodoStatus = "Pending" | "In Progress" | "Completed"
export type TodoPriority = "Low" | "Medium" | "High"

// INTERFAZ = forma de los datos vs CLASS = comportamiento
// ======================================================
// INTERFACES BASE
// ======================================================
// Define la estructura mínima de un proyecto dentro de la app (en este caso un Project)
// Los datos básicos del proyecto y que maneja la app en memoria
// ¿Dónde se utiliza esta interfaz?
  // Project.ts → constructor(data: IProject ...) → El constructor exige que los datos base del proyecto tengan esa estructura.
  // ProjectsManager.ts → newProject(data: IProject ...) → El manager obliga a que cualquier nuevo proyecto tenga esa forma.
  // ProjectFormModal.tsx → MUY importante → const data: IProject = {...} → El formulario genera datos válidos para crear/editar proyectos.
  // ProjectDetailsPage.tsx → const handleEditSubmit = async (data: IProject) → El modal devuelve datos tipados como IProject.
// IProject = modelo interno NO serializable
export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
  cost: number
  progress: number
}

// La interfaz que define cómo debe ser cada ToDo item. Modelo base interno de tareas
// Representa una tarea real dentro de la app, una tarea en memoria y una tarea ya normalizada
// ¿Dónde se utiliza esta interfaz?
  // Project.ts → todos: ITodo [] = [] → Representa los todos reales del proyecto en memoria.
export interface ITodo {
  id: string
  description: string
  date: Date
  status: TodoStatus
  priority: TodoPriority
}

// ======================================================
// INTERFACES SERIALIZABLES (JSON y Firebase solo entienden objetos planos serializables)
// ======================================================
// La interfaz representa un To-do serializable, para Firebase/JSON y persistible. Modelo serializable de tareas
// ¿Dónde se utiliza esta interfaz?
  // Project.ts → IProjectJSON
  // toJSON() → date: todo.date.toISOString()
  // FirebaseService.ts (indirectamente)
export interface ITodoJSON {
  id: string
  description: string
  // Diferencia clave: la fecha viene como string
  // En este caso date no es :Date, ya que Date NO existe realmente en JSON. JSON guarda una string
  date: string
  status: TodoStatus
  // priority? (opcional) → para no romper datos antiguos de Firebase
  priority?: TodoPriority
}

// Esta interfaz representa el proyecto serializable, persistible, exportable y compatible con Firebase. Modelo serializable/persistente
// Se genera una nueva interfaz que incluye toda la información que debe arrastrar el proyecto cuando importamos/exportamos datos desde un JSON o en Firebase
// extends IProject = "Copia todo IProject y añade más cosas"
// ¿Dónde se utiliza esta interfaz?
  // FirebaseService.ts → saveProject(project: IProjectJSON)
  // ProjectsManager.ts → import/export
  // Project.ts → constructor → existingData?: Partial<IProjectJSON>
  // toJSON() → toJSON(): IProjectJSON
// IprojectJSON = modelo persistente
export interface IProjectJSON extends Omit<IProject, "finishDate"> {
  // Incluyo a IProject id de proyecto, color de su etiqueta y los to-do items generados
  finishDate: string
  id: string
  colour: string
  todos: ITodoJSON[]
}

// ======================================================
// CLASE PRINCIPAL: Project
// ======================================================
// Representa un proyecto real dentro de la app
// Exporto la clase principal "Project" para poder importarla en otros archivos
// La clase implementa IProject, por lo que está obligada a definir todas sus propiedades con el tipado fijado por IProject
export class Project implements IProject {

  // --------------------------------------------------
  // DATOS EDITABLES DEL PROYECTO
  // --------------------------------------------------
  // Son las propiedades principales del proyecto.
  // Algunas se introducen desde formularios (crear/editar)
  // y otras se modifican desde componentes específicos de la UI (ejemplo: progress).
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  
  // Coste editable desde el formulario del proyecto
  cost: number = 0 

  // Nivel de progreso del proyecto
  // Se actualiza desde la página de detalles del proyecto
  progress: number = 0

  // --------------------------------------------------
  // DATOS INTERNOS DE IDENTIDAD Y UI
  // --------------------------------------------------
  // ID único del proyecto
    // Se utiliza para:
      // - navegación (/project/:id)
      // - búsquedas
      // - actualizaciones
      // - sincronización con Firebase
  id: string // El tipo de dato del id generado por el paquete uuidv4 va a ser una string
  // Color visual asociado al proyecto
    // Se utiliza únicamente en la UI (icono/etiqueta con las iniciales del proyecto)
  colour: string // Color del icono de proyecto → Solo UI (visual)

  // --------------------------------------------------
  // ESTADO ASOCIADO AL PROYECTO
  // --------------------------------------------------
  // Lista de tareas (To-Do items) asociadas al proyecto: es un array de objetos. Cada proyecto empieza con una lista vacía.
  // IMPORTANTE: Estado inicial seguro
    // Inicializar con [] evita errores al hacer: project.todos.push(...)
    // Si no hiciera esto, project.todos === undefined y se rompería la lógica de cualquier archivo que haga project.todos.push(...)
      // En TodoList.tsx → const [todos, setTodos] = React.useState(project.todos) → SI project.todos = undefined → todos = undefined  → todos.filter(...) → ERROR
      // En ProjectDetailsPage.tsx indirectamente, ya que renderiza → <TodoList project={project} /> → Si project.todos estuviera roto: TodoList rompe y ProjectDetailsPage también
  todos: ITodo [] = []

  // --------------------------------------------------
  // CONSTRUCTOR DE LA CLASE PROJECT
  // --------------------------------------------------
  // Es la función que se ejecuta cuando se hace: new Project (data), es decir, donde nace el objeto
  // Para almacenar los datos que rellena un usuario desde un formulario
  // Su responsabilidad es:
    // 1. Crear un proyecto nuevo (desde formulario)
    // 2. O reconstruir uno existente (desde JSON / Firebase)
    // 3. Asegurar que todos los datos tienen el formato correcto

  // Recibe los datos base del proyecto y, opcionalmente, datos persistidos como id, colour o todos.
    // data → datos del formulario
    // existingData → datos cuando importas JSON/Firebase
    // La ? significa que este parámetro es OPCIONAL
    // Partial significa que NO hace falta que vengan todos los campos rellenos
  constructor(data: IProject, existingData?: Partial<IProjectJSON>) {

    // Asignación de datos básicos
    // this.name → Es la forma de coger los datos del proyecto que ha rellenado el usuario en el formulario. 
      // Es una propiedad del objeto que estás creando: const project = new Project(data)
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


    // ID único (o reutilizado si viene de JSON/Firebase)
      // Si existingData existe → dame su id (cuando viene de JSON/Firebase)
      // Si no → undefined → uuidv4() genera un ID único nuevo
    this.id = existingData?.id ?? uuidv4()

    // Asigna un color aleatorio al proyecto → Color aleatorio o recuperado
    // Si ya tenía color → úsalo  
    // Si no → asigna uno aleatorio
    this.colour = existingData?.colour ?? project_colours[Math.floor(Math.random() * project_colours.length)]
      // 1.Math.random() → número entre 0 y 1
      // 2.multiplicas por tamaño del array
      // 3.Math.floor() → número entero
      // 4.accedes al array project_colours

    // Coste y progreso 
    // 1. usa existingData.cost si existe (cuando viene de JSON/Firebase)
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
    this.todos = existingData?.todos?.map((todo : ITodoJSON | any) => ({
      ...todo,
      // Para que no rompa al traerlo de Firestore a la app
      date:
        typeof todo.date === "object" && "seconds" in todo.date
          ? new Date(todo.date.seconds * 1000) // Firestore Timestamp
          : new Date(todo.date), // string o Date,
      priority: todo.priority ?? "Medium"
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

  // Operador ternario
    // ¿El nombre tiene solo una palabra? → primeras 2 letras
    // ¿El nombre tiene más de una palabra? → Recorre cada palabra y coge la primera letra (map) y convierte el array en string (join) → iniciales de cada palabra
      // words.map(word => word[0]) → coge la primera letra de cada palabra
      // .join("") → convierte en string
      // .slice(0, 2) → limita a 2 caracteres
  const initials =
  words.length === 1
    ? words[0].slice(0, 2)
    : words.map(word => word[0]).join("").slice(0, 2)
  // Pone las iniciales en mayúscula
  return initials.toUpperCase()
  }

 // --------------------------------------------------
  // MÉTODO toJSON()
  // --------------------------------------------------
  // toJSON() sirve para convertir una instancia de la clase Project en un objeto plano con forma de IProjectJSON
  // ¿Dónde se utiliza este método?
    // Para crear proyecto y guardarlo en Firebase (ProjectsManager.ts): await FirebaseService.saveProject(project.toJSON())
    // Para actualizar proyecto en Firebase (ProjectsManager.ts): project.toJSON()
    // Para exportar proyectos a archivo JSON (ProjectsManager.ts): JSON.stringify(this.list.map(p => p.toJSON()), null, 2)
  toJSON(): IProjectJSON {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      userRole: this.userRole,
      finishDate:
        this.finishDate instanceof Date &&
        !isNaN(this.finishDate.getTime())
          ? this.finishDate.toISOString()
          : new Date().toISOString(),
      cost: this.cost,
      progress: this.progress,
      colour: this.colour,
      // todo es el parámetro de la función callback que le pasas a .map()
      // this.todos.map(todo => ...) significa:
        // “Recorre this.todos; por cada elemento del array, llámalo temporalmente todo y construye un nuevo objeto con sus datos”.
      // Así que todo representa, uno por uno, cada objeto guardado dentro de: this.todos
      todos: this.todos.map<ITodoJSON>(todo => ({
        id: todo.id,
        description: todo.description,
        date: todo.date.toISOString(),
        status: todo.status,
        priority: todo.priority
      }))
    }
  }
}
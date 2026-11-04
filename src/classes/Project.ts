// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo define el MODELO principal de la aplicación:
  // 1. La estructura de un proyecto (propiedades -qué datos tiene- y tipos -qué tipos de dato son válidos-)
  // 2. El comportamiento del proyecto (métodos)
  // 3. Cómo se crean proyectos nuevos
  // 4. Cómo se reconstruyen proyectos desde Firebase/JSON
  // 5. Cómo se serializan los datos para persistencia
// Es el núcleo del modelo de datos de la app.

// Clase Project = MODELO DE DOMINIO


// ======================================================
// RELACIÓN CON EL RESTO DE ARCHIVOS
// ======================================================
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


// El objeto Project actúa como fuente de verdad de los datos.
//
// Distintos componentes modifican diferentes partes del modelo:
// - TodoList → modifica project.todos
// - ProjectDetailsPage → modifica progress y datos generales
// - FirebaseService → serializa/deserializa datos persistidos
//
// Esto permite desacoplar:
// UI ↔ lógica ↔ persistencia

// ======================================================
// IMPORTACIONES
// ======================================================
// Importo el paquete de UUID para que se genere un código único a cada proyecto generado
// Esto garantiza IDs únicos para:
  // - navegación
  // - persistencia
  // - búsquedas
  // - sincronización con Firebase
// Renombramos v4 por uuidv4 para ser más explícitos
import { v4 as uuidv4 } from 'uuid'
// Importa el tipo SmartViewsExport desde ../bim-components/SmartViews. Esto es para guardar las Smart Views como parte de los datos del proyecto almacenados en Firebase.
import type { SmartViewsExport } from "../bim-components/SmartViews";
import type * as OBC from "@thatopen/components";

type ItemFinderQueriesExport = ReturnType<OBC.ItemsFinder["export"]>;

// ======================================================
// VARIABLES GLOBALES
// ======================================================
// Variable que define una paleta de 6 colores diferentes para generar las etiquetas con las iniciales de cada proyecto:
  // Cada proyecto recibe un color aleatorio al crearse.
// Se utiliza únicamente para representación visual en la UI.
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
// Tipos cerrados/literales → solo permiten estos valores, es decir, restringen los valores posibles a un conjunto concreto de strings
// Define los tipos de dato para ProjectStatus, UserRole, TodoStatus y TodoPriority → obligando que sus valores solo puedan ser estos
// Muy útil para evitar errores en formularios que rellenan los usuarios
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type TodoStatus = "Pending" | "In Progress" | "Completed"
export type TodoPriority = "Low" | "Medium" | "High"


// INTERFACE = forma de los datos vs CLASS = comportamiento
  // INTERFACE:
  // Describe la FORMA de los datos.
  // No contiene lógica ni implementación.
  //
  // CLASS:
  // Representa un objeto real de la aplicación.
  // Puede contener:
  // - propiedades
  // - métodos
  // - lógica
  // - comportamiento
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

// Modelo interno utilizado por la aplicación
// Representa datos ya normalizados y listos para usarse en memoria
// Incluye tipos complejos como Date
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
// Esta interfaz representa el proyecto serializable, persistente, exportable y compatible con Firebase
// Se genera una nueva interfaz que incluye toda la información que debe arrastrar el proyecto cuando importamos/exportamos datos desde un JSON o en Firebase
// extends IProject = "Copia todo IProject y añade más cosas"
// ¿Dónde se utiliza esta interfaz?
  // FirebaseService.ts → saveProject(project: IProjectJSON)
  // ProjectsManager.ts → import/export
  // Project.ts → constructor → existingData?: Partial<IProjectJSON>
  // toJSON() → toJSON(): IProjectJSON

// Modelo persistente/serializable.
// Representa cómo deben almacenarse los datos en:
// - Firebase
// - JSON
// - exportaciones
// Sustituye tipos complejos (Date) por tipos serializables (string).
// Omit<Tipo, "propiedad"> = Sirve para copiar un tipo/interfaz, PERO eliminando algunas propiedades
export interface IProjectJSON extends Omit<IProject, "finishDate"> {
  // Incluyo a IProject id de proyecto, color de su etiqueta y los to-do items generados
  finishDate: string
  id: string
  colour: string
  todos: ITodoJSON[]
  smartViews?: SmartViewsExport;
  itemFinderQueries?: ItemFinderQueriesExport;
}

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
  // priority? (opcional) → para no romper datos antiguos que vengan de Firebase
  // Ejemplo:
            //{
              // description: "...",
              // status: "Pending"
            // }
  // Si no viene con priority desde Firebase rompe, por eso se pone opcional y después si viene undefined lo normalizo y se le asigna por defecto "Medium"
      priority?: TodoPriority
    }

// ======================================================
// CLASE PRINCIPAL: Project
// ======================================================
// Representa un proyecto real dentro de la app
// Exporto la clase principal "Project" para poder importarla en otros archivos
// La CLASE Project es la plantilla del proyecto y la INSTANCIA es el objeto real
// La clase implementa IProject, por lo que está obligada a definir todas sus propiedades con el tipado fijado por IProject
export class Project implements IProject {

  // --------------------------------------------------
  // DATOS EDITABLES DEL PROYECTO
  // --------------------------------------------------
  // Son las propiedades principales del proyecto, que representan el estado editable del proyecto dentro de la aplicación.
  // Algunas se introducen desde formularios (crear/editar) y otras se modifican desde componentes específicos de la UI (ejemplo: progress).
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  
  // Coste editable desde el formulario del proyecto
  // Le asigno el valor de 0 inicial por defecto para garantizar consistencia y que nunca se de la situación de que cost === undefined
  cost: number = 0 

  // Nivel de progreso del proyecto
  // Se actualiza desde la página de detalles del proyecto
  // Le asigno el valor de 0 inicial por defecto para garantizar consistencia y que nunca se de la situación de que progress === undefined
  progress: number = 0

  // --------------------------------------------------
  // DATOS INTERNOS DE IDENTIDAD Y UI
  // --------------------------------------------------
  // ID único y persistente del proyecto que define la identidad de cada proyecto
  // Dos proyectos pueden tener el mismo nombre, mismo coste, misma fecha...pero nunca el mismo ID
    // Se utiliza para:
      // - navegación (/project/:id)
      // - búsquedas
      // - actualizaciones
      // - sincronización con Firebase
  id: string // El tipo de dato del id generado por el paquete uuidv4 va a ser una string

  // Color visual asociado al proyecto (realmente NO pertenece al dominio del proyecto, sino que pertenece a representación visual)
    // Se utiliza únicamente en la UI (icono/etiqueta con las iniciales del proyecto)
  colour: string // Color del icono de proyecto → Solo UI (visual)

  // --------------------------------------------------
  // ESTADO ASOCIADO AL PROYECTO
  // --------------------------------------------------
  // Lista de tareas (To-Do items) asociadas a cada proyecto: es un array de objetos. Cada proyecto empieza con una lista vacía.
  // IMPORTANTE: Estado inicial seguro
    // Inicializar con [] evita errores al hacer: project.todos.push(...)
    // Si no hiciera esto, project.todos === undefined y se rompería la lógica de cualquier archivo que haga project.todos.push(...)
      // En TodoList.tsx → const [todos, setTodos] = React.useState(project.todos) → SI project.todos = undefined → todos = undefined  → todos.filter(...) → ERROR
      // En ProjectDetailsPage.tsx indirectamente, ya que renderiza → <TodoList project={project} /> → Si project.todos estuviera roto: TodoList rompe y ProjectDetailsPage también
  todos: ITodo [] = []

  smartViews?: SmartViewsExport;

  itemFinderQueries?: ItemFinderQueriesExport;

  // --------------------------------------------------
  // CONSTRUCTOR DE LA CLASE PROJECT
  // --------------------------------------------------
  // Es la función que se ejecuta/inicializa una instancia de la clase Project cuando se hace: const project = new Project (data)
  // El objeto ya estaba creado (clase Project), lo que hace el constructor es inicializarlo
  // Para almacenar los datos que rellena un usuario desde un formulario
  // Cuando hacemos const project = new Project(data), JavaScript hace internamente:
    // 1. crea un objeto vacío
    // 2. ejecuta constructor(...)
    // 3. asigna propiedades
    // 4. devuelve la instancia final
  // Sus responsabilidades son:
    // 1. Inicializar el estado (datos internos) del objeto
    // 2. Crear proyectos nuevos desde la UI (desde formulario)
    // 3. Reconstruir proyectos desde Firebase/JSON
    // 4. Normalizar datos externos: asegurar que todos los datos tienen el formato correcto
    // 5. Garantizar un estado consistente

  // Recibe los datos base del proyecto y, opcionalmente, datos persistentes como id, colour o todos.
  // El constructor puede trabajar en 2 modos:
    // MODO 1: Creación nueva → new Project(data)
      // Solo existe data → datos del formulario
      // El constructor genera ID nuevo, color de etiqueta y crea to-do list vacía
    // MODO 2: Reconstrucción → new Project(data, existingData)
      // Ya existen ID, colour, todos, progress, cost... es decir, reconstruye el objeto preservando su identidad y estado previo
      // existingData → datos cuando importas JSON/Firebase
      // La ? significa que este parámetro es OPCIONAL
      // Partial<> convierte todas las propiedades del tipo en opcionales, es decir, significa que NO hace falta que vengan todos los campos rellenos
      // Firebase NO devuelve instancias reales de Project, sino que devuelve objetos planos JSON que el constructor los convierte en objetos reales con métodos y comportamiento
  constructor(data: IProject, existingData?: Partial<IProjectJSON>) {

    // Asignación de datos básicos
    // this → Es la instancia actual del objeto que se ha creado → Dentro del constructor: this === project
    // this.name → Es la propiedad "name" de esa instancia
    // = data.name → Es la forma de guardar el dato que viene del formulario que ha rellenado el usuario (data)
    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    // Convertimos siempre a Date (por seguridad) → Normalización de la fecha
    this.finishDate = new Date(data.finishDate)

    // ?? se llama nullish coalescing: A ?? B
    // Si A existe → usa A  
    // Si A es null o undefined → usa B


    // ID único (o reutilizado si viene de JSON/Firebase)
      // Si existingData existe → dame su id (cuando viene de JSON/Firebase) → Preserva identidad: la identidad del objeto NO debe cambiar nunca
      // Si no → undefined → uuidv4() genera un ID único nuevo → Preserva estado visual previo de la etiqueta con las iniciales de proyecto
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


    // 1. Coge los todos que vienen de Firebase/JSON
    // 2. Recorre cada uno
    // 3. Corrige/normaliza sus datos
    // 4. Convierte fechas a Date reales
    // 5. Añade valores por defecto si faltan
    // 6. Guarda el resultado en this.todos

    // this.todos es la lista REAL de tareas del proyecto dentro de la app
    // 1. Usa existingData?.todos cuando existe (reconstrucción de proyectos desde Firebase/JSON) → Convierte datos externos serializados en modelo interno consistente (deserialización + normalización)
        // existingData?.todos → accede a los todos
        // ?.map(...) → SOLO ejecuta map si existen todos, La ? significa "Ejecuta esto SOLO si existe lo anterior"
        // .map(todo => (...)) → recorre un array y transforma cada elemento. Ejemplo: [1,2,3].map(n => n * 2) → Resultado [2,4,6]
        // existingData.todos.map(todo => ...) → Recorre cada todo y construye una versión corregida/normalizada
        // todo representa cada elemento individual del array
        // (todo : ITodoJSON | any) → Normalmente esto debería tener forma ITodoJSON, pero puede venir cualquier cosa rara desde Firebase (Firestore a veces devuelve seconds, nanoseconds...)
        // ...todo → copia todas las propiedades del objeto y luego sobreescribo solo algunas de ellas (date y priority)
        // date: new Date(todo.date) → Convierte: "2026-04-01" → Date object, ya que cuando importas en JSON/Firebase viene como string
    // 2. si no existe existingData → devuelve undefined → usa []

    this.todos = existingData?.todos?.map((todo : ITodoJSON | any) => ({
      ...todo,
      // Para que no rompa al traerlo de Firestore a la app
      date:
        // 1. Si la fecha viene como Timestamp de Firestore → conviértela desde seconds
          // typeof todo.date === "object" → Pregunta ¿todo.date es un objeto?
          // "seconds" in todo.date → Pregunta "¿Existe la propiedad seconds dentro del objeto?"
        // 2. Si NO → conviértela directamente con new Date(todo.date)
        typeof todo.date === "object" && "seconds" in todo.date // Operador ternario
          ? new Date(todo.date.seconds * 1000) // Firestore Timestamp ¿Por qué multiplicas por 1000? Porque Firestore guarda segundos, pero JavaScript Date usa milisegundos
          : new Date(todo.date), // Suele ser una string JSON y esto la convierte a Date real o también podría ser un Date ya y simplemente se crearía otra instancia Date válida
      // Si priority existe → úsala
      // Si no → usa "Medium" → Porque tus datos antiguos quizás NO tenían priority y así evitamos undefined
      priority: todo.priority ?? "Medium"
    })) ?? [] // Si todo lo anterior da undefined o null → usa [] → Porque si no existen todo items existingData?.todos = undefined, this.todos = undefined y romperías project.todos.map(...)
              // Este bloque garantiza que SIEMPRE haya un array válido de todo items y que además todas las fechas sean Date reales, aunque Firebase devuelva formatos distintos.
    
    this.smartViews = existingData?.smartViews;
    this.itemFinderQueries = existingData?.itemFinderQueries;
    
  }


  // --------------------------------------------------
  // MÉTODOS DE LA CLASE PROJECT
  // --------------------------------------------------
  // Los métodos definen el comportamiento del objeto.
  //
  // Mientras que las propiedades describen QUÉ DATOS tiene el proyecto, los métodos describen QUÉ PUEDE HACER el proyecto.
  //
  // Ejemplos:
  // - calcular información derivada (getInitials)
  // - transformar datos (toJSON)
  // - modificar estado interno
  // - encapsular lógica reutilizable

  // --------------------------------------------------
  // MÉTODO: CÁLCULO DE LAS INICIALES
  // --------------------------------------------------
  // Este método genera automáticamente las iniciales visuales del proyecto a partir de su nombre.
  // Ejemplo: "Hospital Central" → "HC"
  // Este método se utiliza principalmente en componentes UI para mostrar el icono/etiqueta del proyecto.
  // Información derivada → las iniciales NO se guardan en Firebase, sino que se calculan a partir de this.name 

  // Para conseguir que se cojan las 2 letras del nombre del proyecto en mayúscula, en lugar de "HC" se configura de la siguiente forma:
  // Genero una variable words en la que cojo el nombre del proyecto (this.name), elimino espacios en blanco al inicio y al final (trim),
  // divido el string en un array usando el espacio como separador (split) y elimino posibles espacios vacíos entre las palabras (filter)
  getInitials(): string {
  // 1. this.name → nombre del proyecto
  // 2. .trim() → elimina espacios al inicio y final. Ejemplo: "   Hospital Central   " → "Hospital Central"
  // 3. .split(" ") → divide el string en palabras usando el espacio como separador. Ejemplo: "Hospital Central" → ["Hospital", "Central"]
  // 4. .filter(Boolean) → elimina elementos vacíos del array. ejemplo: "Hospital    Central" → ["Hospital", "", "", "", "Central"] → ["Hospital", "Central"]
  const words = this.name.trim().split(" ").filter(Boolean)

  // Operador ternario → distingue entre nombres de una sola palabra y nombres de varias palabras
    // ¿El nombre tiene solo una palabra? → primeras 2 letras
    // ¿El nombre tiene más de una palabra? → Recorre cada palabra y coge la primera letra (map) y convierte el array en string (join) → iniciales de cada palabra
      // words.map(word => word[0]) → coge la primera letra de cada palabra. Ejemplo: ["Hospital", "Central"] → ["H", "C"]
      // .join("") → coge el array anterior de todas las letras y lo convierte en string. Ejemplo: ["H", "C"] → "HC"
      // .slice(0, 2) → limita a 2 caracteres. Ejemplo: "Hospital Civil Madrid" → "HCM" → "HC"
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
  // Convierte la instancia Project en un objeto plano serializable. Esto es necesario porque:
    // - Firebase
    // - JSON.stringify()
    // - almacenamiento externo
  // NO entienden instancias de clases complejas.

  // toJSON() transforma:
    // Project (objeto con métodos y lógica) → IProjectJSON (objeto plano serializable)

  // ¿Dónde se utiliza este método?
    // Para crear proyecto y guardarlo en Firebase (ProjectsManager.ts): await FirebaseService.saveProject(project.toJSON())
    // Para actualizar proyecto en Firebase (ProjectsManager.ts): project.toJSON()
    // Para exportar proyectos a archivo JSON (ProjectsManager.ts): JSON.stringify(this.list.map(p => p.toJSON()), null, 2)

  // La clase Project tiene métodos, lógica, Date y comportamiento. Sin embargo, JSON solo entiende strings, numbers, arrays y objetos planos.
  // Por eso es necesario este método y return{ significa "construye un objeto plano nuevo"
  toJSON(): IProjectJSON {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      userRole: this.userRole,
      // Validación + serialización segura de fechas → evitando guardar "Invalid Date" y garantizando que siempre se guarde una fecha válida en formato string
      finishDate:
        // instanceof = "¿Este objeto fue creado usando esta clase?" → "¿finishDate es realmente un objeto Date real?"
          // Ejemplo 1: const date = new Date() → date instanceof Date → true
          // Ejemplo 2: const text = "hola" → date instanceof Date → false
        // Sin embargo, esto NO garantiza que la fecha sea válida, porque JavaScript permite esto: const badDate = new Date("hola") →  badDate instanceof Date → true
        // Sigue siendo un objeto Date aunque esté roto internamente y por eso necesito la segunda validación: !isNaN(this.finishDate.getTime())
          // getTime() convierte la fecha en timestamp numérico (nº milisegundos desde 1970). Ejemplo: new Date().getTime() → 1735689600000
          // Pero si la fecha es inválida. Ejemplo: new Date("hola").getTime() → NaN (Not a Number)
          // isNaN(...) pregunta "¿Esto es NaN?". Concretamente se pregunta lo contrario !isNaN(...) → "¿La fecha NO es inválida?" o "¿La fecha es válida?"
        this.finishDate instanceof Date &&
        !isNaN(this.finishDate.getTime())
          ? this.finishDate.toISOString() // Si la fecha es válida convierte Date → string serializable universal como "2025-01-01T00:00:00.000Z"
          : new Date().toISOString(), // Si la fecha no es válida → Se crea una fecha fallback segura evitando por ejemplo: new Date("hola").toISOString() → RangeError: Invalid time value
      cost: this.cost,
      progress: this.progress,
      colour: this.colour,
      
      // Convierte cada todo interno (ITodo) en un objeto serializable (ITodoJSON). Esto es necesario porque:
        // - Date no puede guardarse directamente en JSON
        // - Firebase trabaja mejor con objetos planos
      
      // this.todos.map(todo => ...) significa:
        // “Recorre this.todos; por cada elemento del array, llámalo temporalmente "todo" y construye un nuevo objeto con sus datos internos”.
        // "todo" es el parámetro de la función callback que le pasas a .map()
        // Así que "todo" representa, uno por uno, cada objeto guardado dentro de: this.todos
      todos: this.todos.map<ITodoJSON>(todo => ({
        id: todo.id,
        description: todo.description,
        date: todo.date.toISOString(),
        status: todo.status,
        priority: todo.priority
      })),
      ...(this.smartViews && { smartViews: this.smartViews }),
      ...(this.itemFinderQueries && {itemFinderQueries: this.itemFinderQueries})
      
    }
  }
}
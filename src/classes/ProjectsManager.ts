// ======================================================
// RESPONSABILIDADES
// ======================================================
// ProjectsManager actúa como capa de coordinación entre Firebase, los modelos Project y React.
// Sus responsabilidades principales son:
  // ↳ mantener el estado global de proyectos en memoria
  // ↳ coordinar sincronización con Firebase
  // ↳ reconstruir instancias Project desde JSON (se importan objetos planos desde JSON/Firebase que hay que reconstruir)
    // const data = await Firebase... NO tiene project.getInitials() . Solo existe después de new Project(...)
  // ↳ notificar cambios a React (manager → eventos → React)
  // ↳ centralizar operaciones CRUD de proyectos
// ======================================================
// IMPORTACIONES
// ======================================================
// Modelos y tipos del dominio Project
// - Project → instancia real con comportamiento
// - IProject → estructura interna usada para crear proyectos
// - IProjectJSON → estructura serializable compatible con Firebase/JSON
import { IProject, IProjectJSON, Project } from "./Project"
// Servicio de persistencia: encapsula toda la comunicación con Firebase/Firestore
// Importo FirebaseService, ya que es el nexo con Firestore. ProjectsManager NO habla directamente con Firestore
// Esto evita que React → Firestore directo, es decir, React → ProjectsManager → FirebaseService → Firestore
import { FirebaseService } from "../firebase/FirebaseService"

// Aspectos importantes:
  // ProjectsManager NO depende de React. React depende de ProjectsManager
  // ProjectsManager NO depende de Firestore, sino que depende de FirebaseService
  // Esto se llama desacoplamiento arquitectónico

// ======================================================
// CLASE PRINCIPAL: ProjectsManager
// ======================================================
// Se define la clase ProjectsManager, que es el ESTADO GLOBAL EN MEMORIA
// Contiene las instancias Project activas cargadas actualmente en la aplicación.
// Actúa como:
  // - estado global en memoria
  // - coordinador entre Firebase y React
  // - capa de lógica CRUD (Create, Read, Update, Delete)
  // - sistema de sincronización de proyectos
// Por lo que no es solo el gestor de proyectos, sino que es la capa de orquestación del dominio Project
export class ProjectsManager {
  
  // Estado global en memoria de la aplicación. Contiene las instancias Project reales que React renderiza.
  // Lista de proyectos (vacía en un principio): la memoria viva de la app
  // La app funciona así: Firebase (persistencia) → ProjectsManager.list (estado vivo) → React UI, es decir, React NO renderiza Firebase, sino que renderiza projectsManager.list
    // Firebase es persistencia
    // list es estado vivo en memoria
  list: Project[] = []

  // ProjectsManager puede avisar a React cuando algo cambia mediante callbacks
    // Propiedad vs Método:
      // Propiedad: onProjectUpdated = () => {}
      // Método: updateProject() {}
   // Cuando ocurre un cambio:
    // - creación
    // - borrado
    // - actualización
  // el manager ejecuta estos callbacks para avisar a la UI.

  // Estas son 3 variables están almacenando callbacks/eventos de sincronización. Aquí se declaran y luego se utilizan desde fuera → "Cuando pase algo → avisa a otro sistema"
  // ProjectsManager NO conoce React directamente. En lugar de usar hooks o setState, expone funciones que React puede registrar.Ejemplo: en ProjectsPage.tsx
  // Analogía: ProjectsManager = fábrica y React = pantalla → "Cuando se cree algo → avisa a la pantalla"
  // React utiliza estas funciones para reaccionar a cambios del estado global. 
  onProjectCreated = () => {} // Se ejecuta cuando se crea un proyecto. AVISO DE CREACIÓN a React → React lo usa para sincronizar la UI
  onProjectDeleted = () => {} // Se ejecuta cuando se elimina un proyecto. AVISO DE BORRADO a React → React lo usa para refrescar la lista visual
  onProjectUpdated = () => {} // Se ejecuta cuando se actualiza un proyecto, cambia la lista o se necesita refrescar la UI. AVISO DE CAMBIOS a React → React actualiza UI
    
  // --------------------------------------------------
  // MÉTODOS DE LA CLASE ProjectsManager
  // --------------------------------------------------
  // --------------------------------------------------
  // MÉTODO loadProjects
  // --------------------------------------------------
  // Carga toda la aplicación desde Firebase
  // Cuando abro la app ocurre esto: Firebase → loadProjects() → memoria global → React → pantalla
  // async = Función ASÍNCRONA. ¿Por qué? Porque puede tardar tiempo en completarse y no queremos que se bloquee el resto de la app
  // Dentro de la función hago esto: await FirebaseService.getProjects() y Firebase no responde de forma instantánea, sino que realmente ocurre esto:
    // Tu app → manda petición a internet → Firebase procesa → Firebase responde → tu app continúa

  async loadProjects() {
    const projects = await FirebaseService.getProjects()

    // Lo que recibimos son datos planos serializados (IProjectJSON[]) → Por eso hacemos this.list = []
    // Reiniciamos memoria antes de reconstruir completamente el estado global. Esto evita duplicados, datos antiguos e inconsistencias
    // Si no hiciera esto, en cada carga se añadirían los proyectos encima de los existentes
    this.list = []

    // Reconstrucción de cada proyecto
    // Se recorre el array IPojectJSON []
    for (const project of projects) {
      // Aquí ocurre la reconstrucción de instancias reales (este método se define más abajo)
      await this.restoreProject(project)
    }
    // Aviso a React para que vuelva a renderizar. Después de cargar Firebase, reconstruir memoria y actualizarla, ahora toca sincronizar la UI
    this.onProjectUpdated()
  }

    // Firestore
    // ↓
    // FirebaseService.getProjects()
    // ↓ devuelve datos serializados (IProjectJSON[])
    // ↓
    // ProjectsManager.restoreProject()
    // ↓ reconstrucción de instancias reales
    // ↓
    // new Project(...)
    // ↓
    // ProjectsManager.list (estado global vivo)
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO createProject
  // --------------------------------------------------
  // Responsabilidades:
    // 1. Construye una instancia Project real
    // 2. La serializa y guarda en Firebase
    // 3. Actualiza el estado global en memoria
    // 4. Notifica a React para refrescar la UI

  // async = Función ASÍNCRONA. ¿Por qué? Porque puede tardar tiempo en completarse y no queremos que se bloquee el resto de la app
  // data = la información mínima necesaria para construir un proyecto
  async createProject(data: IProject) {

    // Crear instancia real del proyecto
    // Aquí se ejecuta el constructor(data: IProject) y este genera: id, colour, normaliza datos, convierte fechas, prepara todos, etc.
    const project = new Project(data)

    // Persistir en Firebase: se guarda el proyecto en Firebase y se le aplica el método toJSON para convertir el proyecto en un objeto plano
    // Flujo real: App → petición internet → Firebase → guardar documento → respuesta OK
    await FirebaseService.saveProject(
      project.toJSON()
    )

    // Se actualiza el estado global de la app → Guardar en memoria el nuevo proyecto
    // ¿Por qué no hago → this.list.push(project)? Porque React detecta nuevas referencias, pero no mutaciones internas
    // [...this.list, project] crea un array completamente nuevo → Esto permite que React detecte "el estado cambió"
    // Ejemplo 1: this.list = [A, B] → Cuando hago this.list.push(C) → this.list = [A, B, C], pero sigue siendo el mismo array inicial (misma referencia en memoria)
      // React ve esto array viejo === array nuevo → "no cambió nada"
    // Ejemplo 2 (spread operator): this.list = [A, B] → this.list = [...this.list, C] → Se crea un array completamente nuevo: this.list = [A, B, C]
      // React ve esto y dice "ahora sí cambió" → re-render (React está diseñado para programación inmutable)
    this.list = [...this.list, project]

    // Notificación a React (callback): "React, refresca la pantalla"
    this.onProjectCreated()
    
    // Este método no solo crea, sino que también devuelve la instancia creada
    // ¿Para qué sirve? Para que quien llame al método pueda usar el proyecto, navegar, acceder al id y hacer más lógica
    return project
  }

  // FLUJO COMPLETO DE CREACIÓN DE PROYECTO DESDE UI:
    // ProjectFormModal
    // ↓ devuelve IProject
    // ProjectsPage
    // ↓ delega lógica
    // ProjectsManager.createProject()
    // ↓
    // new Project(...) → instancia real
    // ↓
    // project.toJSON()
    // ↓
    // FirebaseService.saveProject()
    // ↓
    // Firebase (persistencia)
    // ↓
    // this.list (estado global)
    // ↓
    // onProjectCreated()
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO restoreProject
  // --------------------------------------------------
  // Responsabilidad:
  // Reconstruye instancias Project reales a partir de datos serializados (Firebase/JSON).
  
  // DIFERENCIA CLAVE:
  // createProject() → crea proyectos NUEVOS desde la UI
  // restoreProject() → reconstruye proyectos YA existentes
  
  // restoreProject conserva:
    // - id
    // - colour
    // - todos
    // - progress
    // - cost
  
  // // Flujo: IProjectJSON → Project real

  async restoreProject(projectData: IProjectJSON) {

    // Evita duplicados en memoria → Hay que buscar si ese proyecto ya existe en memoria
    // Esto es importante ya que podríamos importar dos veces un mismo proyecto, cargar Firebase varias veces o actualizar proyectos existentes
    // Es decir, sin hacer esto, tendríamos duplicados en this.list
    // Esto significa: "¿ya existe en memoria un proyecto con este id?"
    const existingProject = this.getProject(projectData.id)

    // Si el proyecto ya existe en memoria → NO se crea otro Project, sino que se actualiza la instancia viva existente
    // Esto es muy importante porque React y la pp ya podrían estar usando esta referencia de proyecto
    // Si se creara otro objeto Project se romperían las referencias, la sincronización, la UI y los componentes
    // Estoy mutando la instancia viva actual.
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
        priority: todo.priority ?? "Medium" // ?? "Medium" por si viene de Firebase un antiguo proyecto que no tenga priority definido = fallback seguro
      }))

      existingProject.smartViews = projectData.smartViews;
      existingProject.itemFinderQueries = projectData.itemFinderQueries;

      // Como se acaba de modificar el estado vivo en memoria, hay que notificar a React
      // Notificación a React (callback): "React, refresca la pantalla"
      this.onProjectUpdated()

      // Se devuelve una instancia Project real (da igual si ya existía o si se creó una nueva) → Si se creó una nueva se sale del IF y se pasa al siguiente bloque:
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

    // Guardar en memoria → Se actualiza el estado global vivo 
    this.list = [...this.list, project]

    // Aquí NO llamo a React: this.onProjectCreated() → Porque NO se está creando el proyecto desde UI, sino que viene de Firebase/JSON → restaurando datos persistidos

    return project
  }

  // RECONSTRUCCIÓN DESDE FIREBASE / JSON
    // FirebaseService.getProjects()
    // ↓ devuelve IProjectJSON[]
    // ProjectsManager.restoreProject(projectData)
    // ↓
    // getProject(projectData.id)
    // ↓
    // CASO 1: El proyecto NO existe en memoria → undefined → new Project(...) → se añade a this.list (esto es clave para que cambie el estado global y React re-renderice)
    // ↓
    // CASO 2: El proyecto YA existe en memoria → se actualiza la instancia existente → onProjectUpdated()
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO getProject
  // --------------------------------------------------
  // Busca un proyecto dentro de this.list usando su ID
  // FIND → SOLO BUSCA EL PROYECTO. Recorre el array this.list y devuelve el PRIMER elemento que cumpla la condición. En este caso:
    // Busca un proyecto cuyo id coincida.
    // Si no encuentra ninguno → devuelve undefined
  getProject(id: string): Project | undefined {
    return this.list.find(project => project.id === id) // Se ejecuta para cada elemento del array → "Para cada proyecto → comprueba si su id coincide"
  }
  
  // getProject NO devuelve un array, sino que devuelvo Project | undefined vs filterProjects devuelve un array

  // --------------------------------------------------
  // MÉTODO filterProjects
  // --------------------------------------------------
  // Filtra proyectos en memoria usando el nombre y devuelve un NUEVO array con los proyectos, cuyo nombre incluye el texto buscado (searchbox).
  // La búsqueda NO distingue entre mayúsculas y minúsculas
  // Resultado del método: un array Project[] con los proyectos filtrados
    // filter NO modifica this.list, sino que genera una vista filtrada
    // value = texto escrito en el searchbox
    // project => significa: "para cada proyecto..."
    // includes() = "contiene" → NO busca exacto, sino que busca coincidencia parcial. Ejemplo: value = hos, encuentra el proyecto "Hospital"
  filterProjects(value: string): Project[] {
    return this.list.filter(project =>
      project.name.toLowerCase().includes(value.toLowerCase()) // Para que no haga distinción entre minúsculas y mayúsculas
    )
  }

  // FLUJO COMPLETO:
    // Usuario escribe
    // ↓
    // SearchBox
    // ↓
    // onProjectSearch(value)
    // ↓
    // projectsManager.filterProjects(value)
    // ↓
    // nuevo array filtrado
    // ↓
    // setProjects(...)
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO deleteProject
  // --------------------------------------------------
  // Este método elimina un proyecto de la memoria global usando su ID 

  //Responsabilidades:
    // 1. Filtrar el proyecto fuera de this.list
    // 2. Generar una nueva referencia de array
    // 3. Notificar a React solo si realmente hubo cambios
  //
  // IMPORTANTE:
  // Este método SOLO modifica memoria. NO elimina datos de Firebase.

  // Se ha añadido una condición para evitar que se ejecute onProjectDeleted() si no ha habido cambios en la longitud de la lista
  // filter no modifica el array original, sino que crea un NUEVO array con todos los proyectos, excepto el que tenga ese ID
  deleteProject(id: string) {
    const initialLength = this.list.length
    this.list = this.list.filter(project => project.id !== id) 

    if (this.list.length !== initialLength) { // ¿la longitud cambió?
      // Si es TRUE → Notificación a React → Re-renderiza
      this.onProjectDeleted()
    }
  }

  // FLUJO COMPLETO:
    // deleteProject(id)
    // ↓
    // this.list cambia
    // ↓
    // onProjectDeleted()
    // ↓
    // ProjectsPage escucha callback
    // ↓
    // setProjects([...])
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO deleteProjectFromFirebase
  // --------------------------------------------------
  // Elimina un proyecto de Firebase y después sincroniza la memoria local.
  // Flujo: Firebase → memoria → React

  async deleteProjectFromFirebase(id: string) {

    // Elimina persistencia
    await FirebaseService.deleteProject(id)

    // Actualiza memoria + React
    this.deleteProject(id)
  }
  
  // FLUJO COMPLETO:
    // Usuario pulsa "Delete" (UI)
    // ↓
    // ProjectHeader
    // ↓
    // ProjectDetailsPage.handleDeleteProject()
    // ↓
    // projectsManager.deleteProjectFromFirebase(project.id)
    // ↓
    // FirebaseService.deleteProject(id)
    // ↓
    // deleteProject(id)
    // ↓
    // React re-render
    // ↓
    // navigate("/")

  // --------------------------------------------------
  // MÉTODO updateProject
  // --------------------------------------------------
  // Fuerza una actualización de React. Avisa de que cuando se actualice un proyecto → se refresque React

  // IMPORTANTE:
  // Este método NO modifica datos. SOLO:
    // 1. genera una nueva referencia del array
    // 2. dispara el callback onProjectUpdated() para notificar a React que los datos han cambiado (NO modifica datos sino que SOLO dispara una actualización de la UI)

  // Se utiliza cuando:
    // - ya se modificó un proyecto
    // - pero React todavía no detectó cambios
 
  updateProject() {

    // NUEVA REFERENCIA DE ARRAY: para eliminar los parcheos del setRefresh (para que funcionen los cambios en la barra de progreso)
    // project.progress = 0.7 modifica el objeto, pero no cambia el array
    // React detecta cambio de referencia
    this.list = [...this.list]

    // Notificar actualización UI
    this.onProjectUpdated()
  }

  // FLUJO COMPLETO:
    // Usuario mueve slider
    // ↓
    // project.progress cambia
    // ↓
    // updateProject()
    // ↓
    // nuevo array
    // ↓
    // onProjectUpdated()
    // ↓
    // setProjects([...])
    // ↓
    // React re-render

  // --------------------------------------------------
  // MÉTODO updateProjectInFirebase
  // --------------------------------------------------
  // Actualiza un proyecto existente en Firebase.
  // Convierte la instancia Project en un objeto serializable mediante toJSON() antes de enviarlo a Firestore.
  async updateProjectInFirebase(project: Project) {

    await FirebaseService.updateProject(
      project.id, // IDENTIDAD: Porque Firestore necesita saber QUÉ documento concreto tiene que actualizar
      project.toJSON() // CONTENIDO
    )
  }
  
  // --------------------------------------------------
  // MÉTODO exportToJSON
  // --------------------------------------------------
  // Exporta todos los proyectos a un archivo JSON.
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
  
  // FLUJO COMPLETO:
  // Project instances
  // ↓
  // toJSON()
  // ↓
  // JSON.stringify()
  // ↓
  // Blob (archivo en memoria)
  // ↓
  // descarga automática

  // --------------------------------------------------
  // MÉTODO importProjects
  // --------------------------------------------------
  // Importa proyectos externos desde JSON.

  // El método recibe un array de proyectos serializados
  async importProjects(projects: IProjectJSON[]) {

    // Este bucle recorre los proyectos importados, uno por uno
    // ¿Por qué se llama projectData en este caso? Porque todavía no es una instancia de clase Project, no tiene métodos ni ha sido reconstruido
    for (const projectData of projects) { 

      // Guarda cada proyecto en Firebase. En este caso no necesito hacer new Project(...), porque los datos ya vienen preparados (JSON)
      await FirebaseService.saveProject(projectData) 
    }

    // Firebase carga los proyectos: loadProjects() → descarga → reconstruye → sincroniza → re-renderiza
    await this.loadProjects() 
  }

  // FLUJO COMPLETO:
    // Archivo JSON importado
    // ↓
    // importProjects(projects)
    // ↓
    // FirebaseService.saveProject(projectData)
    // ↓
    // Firebase (persistencia)
    // ↓
    // loadProjects()
    // ↓
    // FirebaseService.getProjects()
    // ↓ devuelve IProjectJSON[]
    // restoreProject(projectData)
    // ↓
    // new Project(...)
    // ↓
    // instancias reales de clase Project
    // ↓
    // this.list (estado global en memoria)
    // ↓
    // onProjectUpdated()
    // ↓
    // React re-render
}
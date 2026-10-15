// ======================================================
// RESPONSABILIDADES DE ESTE COMPONENTE:
// ======================================================
// Página principal de la aplicación.

// 1. Recibir la instancia global de ProjectsManager
// 2. Mantener sincronizado el estado de React con el manager, es decir, guarda los proyectos en estado (useState) y escucha cambios (create / delete / update)
// 3. Renderizar la lista de proyectos
// 4. Gestionar la creación de proyectos
// 5. Gestionar la importación/exportación de proyectos
// 6. Filtrar proyectos mediante el SearchBox
// 7. Delegar toda la lógica de negocio al ProjectsManager

// IMPORTANTE: Este componente NO contiene lógica de negocio. React solo controla:
  // - estado UI
  // - renderizado
  // - eventos de usuario

// Toda la lógica de proyectos se delega en ProjectsManager.

// ======================================================
// IMPORTACIONES
// ======================================================
// Biblioteca principal de React. Se utiliza para JSX y poder añadir hooks (useState, useEffect)
import * as React from 'react';
// React Router. Permite navegación entre páginas, enlaces (<Link>) y rutas dinámicas
import * as Router from "react-router-dom";
// Modelo Project y tipos asociados.
  // Project → instancia viva utilizada por la aplicación.
  // IProjectJSON → estructura serializable utilizada para importación/exportación JSON.
import { IProjectJSON, Project } from '../../classes/Project';
// Gestor global de proyectos. Contiene: estado global, lógica de negocio y sincronización con Firebase
// "Quiero poder utilizar el tipo ProjectsManager en este archivo, aunque la creación de la única instancia venga de index.tsx"
import { ProjectsManager } from '../../classes/ProjectsManager';
// Componente visual (UI) que representa una tarjeta de proyecto
import { ProjectCard } from './ProjectCard';
// Modal reutilizable para crear o editar proyectos. En ProjectsPage solo se utiliza para CREAR
import { ProjectFormModal } from "./ProjectFormModal";
// Componente reutilizable de búsqueda de proyectos
import { SearchBox } from "./SearchBox";
import { appIcons } from "../../globals"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// ProjectsPage recibe la instancia global de ProjectsManager creada en index.tsx ( const projectsManager = new ProjectsManager() ). 
// No porque lo importe desde allí, sino porque la instancia concreta que utiliza el componente fue creada en index.tsx y se le pasa mediante props.

// Gracias a esto:
  // index.tsx (se crea una única instancia real de ProjectsManager)
  // ↓
  // projectsManager
  // ↓ (aquí se le pasa esa instancia al componente)
    // <ProjectsPage
    //   projectsManager={projectsManager}
    // />
  // ↓  
  // ProjectsPage

// Todos los componentes trabajan sobre el mismo estado global.

// ProjectsManager es una clase que representa el gestor de proyectos de la app
// interface Props representa lo que recibe el componente ProjectsPage → define qué datos y qué tipo tienen
// "Voy a recibir una instancia de ProjectsManager"
interface Props {
  projectsManager: ProjectsManager
}

// ======================================================
// COMPONENTE: ProjectsPage
// ======================================================
// Página principal de la aplicación. Recibe mediante props la instancia global de ProjectsManager creada en index.tsx.
// React utilizará esta función para generar y actualizar la interfaz de usuario.

// ProjectsPage → Componente funcional que recibe props.projectsManager
// props = datos que recibe el componente
export function ProjectsPage(props: Props) {

  // ======================================================
  // ESTADOS de la componente ProjectsPage
  // ======================================================
  // ======================================================
  // ESTADO de DATOS: Guarda los proyectos que React debe pintar en pantalla. Se inicializa desde el manager, pero luego se actualiza vía setProjects
  // ======================================================
  // Lista de proyectos que React renderiza.

  // IMPORTANTE: useState(...) utiliza props.projectsManager.list únicamente como valor inicial.
  // A partir de ese momento: projects → pertenece a React → y se actualiza mediante setProjects(...)

  // useState → Creación de estado
  // React.useState<Project[]> es un hook que define un estado interno del componente
  // Cuando React ejecuta: React.useState(props.projectsManager.list) solo utiliza ese valor una única vez para inicializar el estado
  // <Project[]> es TypeScript y significa que "projects será un array de proyectos"
  // (props.projectsManager.list) → valor inicial → es el array que viene del manager
  // projects = la copia que React utiliza para pintar la UI (array de proyectos perteneciente a React)
  // setProjects → función que actualiza el estado interno del componente → Cuando llamas a setProjects → React re-renderiza
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)

  // ======================================================
  // ESTADO de UI (solo controla la interfaz visual): controla si el modal está abierto o cerrado
  // ======================================================
  // useState solo puede utilizarse dentro del componente y debe declararse antes del return
  // Crea una variable que guarda un valor (estado) y una función para cambiarlo → [valor actual, funcionParaCambiarlo/Actualizarlo]
  // true → abrir modal (modo CREACIÓN) y false → cerrar modal
  // Valor inicial = false → Al principio → creatingProject = false, es decir, el modal está cerrado
  // Funcionamiento: Cuando haces click en "New project" → setCreatingProject(true) → React re-renderiza → 
  // ProjectFormModal recibe isOpen={true} → su useEffect abre el <dialog> → y projectToEdit={null}  → El formulario entra en modo CREACIÓN
  const [creatingProject, setCreatingProject] = React.useState(false)

 // ======================================================
  // SINCRONIZACIÓN REACT ↔ PROJECTSMANAGER
  // ======================================================
  // ProjectsManager mantiene el estado global. React mantiene el estado visual.
  // Este efecto conecta ambos sistemas para que cualquier cambio en el manager provoque una actualización de la UI.

  // Escucha cambios en el manager y fuerza re-render en React
  // Se registran callbacks para que cualquier cambio en el manager (crear, borrar, actualizar) fuerce un re-render en React
  // Todos los eventos del manager provocan la misma acción: sincronizar el estado React con la memoria global.

  // Envuelvo todo en un React.useEffect para evitar reasignaciones innecesarias en cada render
    // props.projectsManager.onProjectCreated → estás sobrescribiendo una función, que antes (ProjectsManager.ts) era onProjectCreated = () => {}
    // ¿Qué quiere decir? "Cuando se cree un proyecto → ejecuta esto"
    // setProjects([...props.projectsManager.list]) → [...array] es un operador spread → crea una copia
    // React compara referencias: array antiguo === array nuevo → no renderiza / array antiguo !== array nuevo → renderiza
    // Importante: React NO detecta cambios en objetos (eso lo hace el ProjectsManager). React detecta cambios en estado y re-renderiza si hay algún cambio

  // El efecto se ejecuta:
    // 1. Al montar el componente.
    // 2. Si cambia la referencia de projectsManager.
  // En la práctica esto ocurre una sola vez porque la instancia global se crea en index.tsx.

  //IMPORTANTE: 
  // ProjectsManager guarda los datos.
  // React guarda lo que se pinta.
  // Este useEffect mantiene ambos sincronizados.

  React.useEffect(() => {
    props.projectsManager.onProjectCreated = () => {
      setProjects([...props.projectsManager.list])
    }

    props.projectsManager.onProjectDeleted = () => {
      setProjects([...props.projectsManager.list])
    }

    props.projectsManager.onProjectUpdated = () => {
      setProjects([...props.projectsManager.list])
    }

    // Carga inicial de proyectos
    // Flujo:
      // React
      // ↓
      // ProjectsManager.loadProjects()
      // ↓
      // FirebaseService.getProjects()
      // ↓
      // Firestore
      // ↓
      // restoreProject()
      // ↓
      // this.list
      // ↓
      // setProjects()
      // ↓
      // React re-render
    props.projectsManager.loadProjects()

    // CLEANUP
    // Se ejecuta cuando el componente se desmonta.
    // Elimina los callbacks registrados para evitar referencias obsoletas o comportamientos inesperados.
    return () => {
      props.projectsManager.onProjectCreated = () => {}
      props.projectsManager.onProjectDeleted = () => {}
      props.projectsManager.onProjectUpdated = () => {}
    }

  }, [props.projectsManager])

  // ======================================================
  // RENDERIZACIÓN DE LISTA DE PROYECTOS: TRANSFORMACIÓN DE DATOS → COMPONENTES UI (DATOS → JSX)
  // ======================================================
  // Convierte la lista de proyectos almacenada en el estado React (projects) en una lista de elementos JSX. Este bloque no pinta nada todavía.
  // Solo transforma datos (Project[]) en JSX (JSX[]) para que React pueda renderizarlos después.
  
  // MAPEO DE PROYECTOS A COMPONENTES VISUALES (PROJECTCARDS) 
  // Convierte cada Project en una tarjeta navegable (ProjectCard). Cada proyecto se transforma en: Link → ProjectCard

  // projectCards se define para transformar Project [] → JSX[], es decir, es un array de JSX
  // map = transforma cada elemento de un array en otro valor
    // map(...) recorre el array completo.
    // Por cada Project: recibe un proyecto y genera JSX
    // El resultado final es un nuevo array:
      // Project[]
      // ↓ map()
      // JSX[]
  // (project) => { ... } = función que se ejecuta por cada elemento → Para cada project en el array → ejecuta esto
    // project representa cada elemento individual del array projects durante la iteración.
    // En cada vuelta del map:
      // project = projects[0]
      // project = projects[1]
      // project = projects[2]
      // ...
  // projectCards NO contiene datos. Contiene elementos JSX listos para que React los renderice posteriormente dentro del return.
  const projectCards = projects.map((project) => {
    // Cada iteración devuelve un elemento JSX. React almacenará todos estos elementos dentro del array projectCards.
    return (
      // Router.Link permite navegar entre rutas sin recargar completamente la aplicación. React Router intercepta el click y actualiza únicamente la vista.
      // to={`/project/${project.id}`} → URL dinámica construida a partir del id (string) → Cada proyecto tiene su URL única
        // Esta ruta coincide con: path="/project/:id" definido en index.tsx
      // key={project.id} es un identificador interno de React que sirve para detectar:
        // - elementos añadidos
        // - elementos eliminados
        // - elementos modificados 
      // Esto optimiza el renderizado de listas.
      // IMPORTANTE: key NO llega como prop al componente. Solo es utilizada por React internamente.
      <Router.Link to={`/project/${project.id}`} key={project.id}>
        {/* projectCards es la lista de proyectos y cada uno de los proyectos de la lista va a tener una ProjectCard asociada */}
        {/* ProjectCard recibe el proyecto completo y se encarga únicamente de mostrarlo. */}
           {/* Dentro de ProjectCard → props.project.name, props.project.description, etc. */}
        <ProjectCard project={project} />
      </Router.Link>
    )
  })

  // FLUJO:
  //
  // projects (estado React)
  // ↓
  // map(...)
  // ↓
  // projectCards (JSX[])
  // ↓
  // return (...)
  // ↓
  // React renderiza las tarjetas en pantalla

  // ======================================================
  // MANEJADORES DE EVENTOS (EVENT HANDLERS): Funciones que manejan EVENTOS
  // ======================================================
  // Estas funciones responden a acciones del usuario.
  // IMPORTANTE: La lógica de negocio se delega en ProjectsManager. React solo captura el evento y coordina la interfaz.

  // ======================================================
  // EXPORTAR la lista de proyectos JSON
  // ======================================================
  // Solicita la exportación de todos los proyectos. React captura el click → ProjectsManager genera y descarga e archivo JSON
  const onExportProject = () => {
    props.projectsManager.exportToJSON()
  }

  // FLUJO COMPLETO:
    // Usuario
    // ↓
    // Click Export
    // ↓
    // onExportProject()
    // ↓
    // ProjectsManager.exportToJSON()
    // ↓
    // JSON.stringify(...)
    // ↓
    // Descarga archivo

  // ======================================================
  // IMPORTAR una lista de proyectos JSON
  // ======================================================
  // Permite seleccionar un archivo JSON, leer su contenido y delegar la importación al ProjectsManager.
  const onImportProject = () => {

    // Se crea dinámicamente un selector de archivos invisible. No existe en el JSX.
    const input = document.createElement("input")

    // Convierte el input en un selector de archivos.
    input.type = "file"
    // Limita la selección a archivos JSON.
    input.accept = "application/json"

    // API nativa del navegador utilizada para leer archivos locales.
    const reader = new FileReader()

    // Se ejecuta automáticamente cuando el archivo termina de leerse.
    reader.onload = async () => {

      const json = reader.result

      if (!json) return

      // Convierte el texto JSON en un array de objetos JavaScript.
      const projects: IProjectJSON[] = JSON.parse(json as string)

      await props.projectsManager.importProjects(projects)
    }

    // Flujo:
        // JSON
        // ↓
        // importProjects()
        // ↓
        // Firebase
        // ↓
        // loadProjects()
        // ↓
        // restoreProject()
        // ↓
        // React re-render

    // Se ejecuta cuando el usuario selecciona un archivo.
    input.onchange = () => {
      if (!input.files) return
      // Lee el contenido del archivo como texto plano.
      reader.readAsText(input.files[0])
    }
    // Abre el selector de archivos de forma programática.
    input.click()
  }

  // ======================================================
  // FILTRAR proyectos en función del input del searchbox
  // ======================================================
  // Filtra los proyectos en memoria utilizando ProjectsManager. El resultado sustituye temporalmente la lista renderizada por React.
  // filterProjects() NO modifica projectsManager.list, sino que SOLO modifica projects, es decir, el estado React, no el estado global
  const onProjectSearch = (value :string) => {
    setProjects(props.projectsManager.filterProjects(value))
  }

  // ======================================================
  // RENDER (UI)
  // ======================================================
  // Ahora vamos a ver como todo lo anterior se convierte en UI real → Se trata básicamente de la pantalla completa de ProjectsPage
  // Convierte el estado React en elementos visuales. Todo lo calculado anteriormente:
    // - projects
    // - creatingProject
    // - projectCards
  // se transforma aquí en interfaz.
  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
      {/* ENCABEZADO DE LA PÁGINA PRINCIPAL: TITULO Y BOTONES */}
      <header>
        {/* TITULO */}
        <bim-label style={{fontSize: "1.5rem", color: "white"}}>Projects</bim-label>
        {/* SEARCHBOX */}
        {/* Cada cambio en el buscador actualiza la lista de proyectos mostrada en pantalla. */}
        <SearchBox 
          onChange={(value) => onProjectSearch(value)}
          placeholder="Search projects by name..."
          width="300px"
        />
        {/* CONTENEDOR DE BOTONES */}
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          {/* BOTONES DE IMPORTAR O EXPORTAR PROYECTOS */}
          <bim-button onclick={onImportProject} icon={appIcons.UPLOAD} label="Upload"></bim-button>
          <bim-button onclick={onExportProject} icon={appIcons.DOWNLOAD} label="Download"></bim-button>
          {/* BOTÓN DE "NEW PROJECT" */}
          {/* Abre el modal de creación actualizando el estado UI. */}
          {/* () => setCreatingProject(true): Activa el modo creación → abre el modal */}
          <bim-button onclick={() => setCreatingProject(true)} icon={appIcons.ADD} label="New Project"></bim-button>
        </div>
      </header>
      {/* Modal reutilizable:
          React controla: apertura y cierre del modal
            - isOpen controla apertura
            - projectToEdit = null → modo CREAR
          ProjectsManager controla la creación real del proyecto
            - onSubmit delega creación al manager */}
      <ProjectFormModal
        isOpen={creatingProject}
        projectToEdit={creatingProject ? null : undefined}
         onSubmit={async (data) => {
          try {

            await props.projectsManager.createProject(data)

            setCreatingProject(false)
            
          } catch (error) {
            console.error(error)
          }
        }}

        // Flujo:
        // Formulario
        // ↓
        // createProject()
        // ↓
        // Firebase
        // ↓
        // onProjectCreated()
        // ↓
        // setProjects()
        // ↓
        // React re-render

        // Sincroniza el cierre del modal con el estado de React
        // Flujo de cierre del modal:
          // 1. Usuario hace click en "Cancel"
          // 2. Se ejecuta dialogRef.current?.close() (cierra visualmente el dialog)
          // 3. Se llama a onClose() → el padre cambia el estado (setCreatingProject(false))
          // 4. React re-renderiza
          // 5. isOpen = false → useEffect mantiene el modal cerrado (sincronización UI ↔ estado)
        onClose={() => setCreatingProject(false)}
      />

      {/* CONTENEDOR DONDE SE VAN A ALMACENAR LAS TARJETAS DE PROYECTO (projectCards) */}
      {/* Se incluye un operador ternario para que se muestre un mensaje de que no hay proyectos con las características que buscas en el SEARCHBOX */}
      {/* Renderizado condicional:
            Si existen proyectos → muestra la lista.
            Si no existen proyectos → muestra el mensaje "No Results". */}
      {
        projects.length > 0 ? (
          <div id="projects-list">{ projectCards }</div>
        ) : (
          <div className="page" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="error-modal">
              <h3>No Results</h3>
              <p>No projects match your search criteria.</p>
            </div>
          </div>
        )
      }

    </div>
  )
}

// FLUJO GENERAL:
// Usuario
// ↓
// Eventos React
// ↓
// ProjectsPage
// ↓
// ProjectsManager
// ↓
// FirebaseService
// ↓
// Firestore
// ↓
// ProjectsManager
// ↓
// Estado React
// ↓
// Render UI
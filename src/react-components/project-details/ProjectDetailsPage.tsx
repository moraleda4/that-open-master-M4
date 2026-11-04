// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================

// ProjectDetailsPage = ORQUESTADOR → coordina componentes, gestiona estado (editingProject) y controla el flujo de la página.
//No implementa UI compleja directamente, pero sí decide qué se renderiza y cuándo.

// Responsabilidades:
// 1. Leer el ID del proyecto desde la URL → obtiene ID (sabe qué proyecto tiene que mostrar)
// 2. Buscar el proyecto (obtener el proyecto correspondiente) → Para ello recurre al ProjectsManager
// 3. Gestionar el estado visual de la página, es decir, maneja estados de UI (editar / no editar):
  // - Si no existe → error modal (maneja errores cuando el proyecto no existe)
  // - Si existe:
    //   - muestra info
    //   - muestra tareas
    //   - permite editar
// 4. Coordinar componentes hijos: ProjectHeader, ProjectInfoCard, TodoList, Modal
// 5. Gestionar la edición de proyectos, es decir, gestiona el flujo de edición
// 6. Gestionar la actualización del progreso
// 7. Gestionar la actualización de tareas

// IMPORTANTE: Toda la lógica de negocio sigue delegándose en ProjectsManager. Este componente coordina la interfaz.

// FLUJO COMPLETO DE EDITAR PROYECTO DESDE ProjectDetailsPage.tsx:
// 1. Usuario edita formulario (click en "Edit" dentro del ProjectInfoCard)
// 2. ProjectFormModal llama a onSubmit(data) cuando se envía el formulario
// 3. handleEditSubmit recibe data
// 4. Se actualiza el objeto project (se modifican propiedades del objeto project)
// 5. updateProjectInFirebase()
// 5. Se avisa a ProjectsManager para que actualice → projectsManager.updateProject()
// 6. ProjectsManager dispara onProjectUpdated → ProjectsPage / componentes suscritos actualizan estado
// 6. React re-renderiza
// 7. UI actualizada

// FLUJO REAL DE ACTUALIZACIÓN DEL PROGRESO:
// 1. Usuario mueve el slider
// 2. Se actualiza project.progress
// 3. ProjectsManager notifica cambios (onProjectUpdated)
// 4. ProjectDetailsPage sincroniza el estado React (setProject)
// 5. React re-renderiza
// 6. ProgressEditor recibe el nuevo valor actualizado

// IMPORTANTE: progress pertenece al objeto Project. React solo refleja visualmente el valor actualizado.

// ======================================================
// IMPORTACIONES
// ======================================================
// Importa biblioteca principal de React → necesario para JSX y hooks: useState()) y useEffect()
import * as React from "react"
// Librería de navegación, necesaria para useParams(), que permite obtener el ID del proyecto desde la URL.
import * as Router from "react-router-dom"
// Gestor global de proyectos (CRUD + notificación a la UI). Contiene:
// - memoria global
// - sincronización Firebase
// - lógica de negocio
// - notificación a React

  // C → Create   (Crear)
  // R → Read     (Leer)
  // U → Update   (Actualizar)
  // D → Delete   (Eliminar)
import { ProjectsManager } from "../../classes/ProjectsManager"
// Componente visual / Tarjeta principal del proyecto → muestra info del proyecto: nombre, estado, rol, coste, progreso y el botón Edit. Llama a onEdit
import { ProjectInfoCard } from "./ProjectInfoCard"
// Cabecera visual del proyecto → Parte visual: iniciales, nombre y descripción
import { ProjectHeader } from "./ProjectHeader"
// Componente responsable de la gestión y visualización de tareas del proyecto. Permite listar, crear y editar tareas
import { TodoList } from "./TodoList"
// Formulario reutilizable (crear / editar) → Recibe de ProjectFormModal.tsx: isOpen, projectToEdit, onSubmit y onClose. Función: UI del formulario
import { ProjectFormModal } from "../projects-page/ProjectFormModal"
// Modelo Project y tipos asociados.
// Project → instancia viva utilizada por la app.
// IProject → estructura de datos del formulario.
import { IProject, Project } from "../../classes/Project"
// Componente de visualización 3D asociado al proyecto.
import { ThreeViewer } from "./ThreeViewer"
import * as BUI from "@thatopen/ui"
// Importo toda la parte de ui-templates. Por ejemplo: componentsGridTemplate, viewportContainerTemplate, viewerToolbarTemplate...
import * as TEMPLATES from "../../ui-templates"
// Importo toda la infraestructura BIM:

// setupComponents()
// ↓
// Components
// ↓
// createWorld()
// ↓
// setupIfcLoader()
// ↓
// setupFragmentsManager()
// ↓
// setupHighlighter()
// ↓
// setupItemsFinder()
// ↓
// components.init()
// ↓
// { components, viewport }
import { setupComponents } from "../../bim-components"
// Importo toda la parte de Components de That Open Engine (para las memory leaks)
import * as OBC from "@thatopen/components"
import { ComponentsGrid } from "../../ui-templates/grids/components/src"
import { ViewerGrid } from "../../ui-templates/grids/viewer/src"

import { SmartViews } from "../../bim-components/SmartViews";

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// ProjectDetailsPage recibe la instancia global de ProjectsManager creada en index.tsx.
// Gracias a esto:
  // index.tsx
  // ↓
  // projectsManager
  // ↓
  // ProjectDetailsPage

// Define lo que recibe el componente ProjectDetailsPage
// Props que recibe el componente → acceso al manager global de proyectos
interface Props {
  projectsManager: ProjectsManager
}

// ======================================================
// COMPONENTE: ProjectDetailsPage
// ======================================================
// Función que define el componente de la página de detalle de un proyecto.
// A partir del ID presente en la URL:
  // - localiza el proyecto
  // - muestra su información
  // - permite editarlo
  // - permite eliminarlo
  // - permite gestionar sus tareas
export function ProjectDetailsPage(props: Props) {
  
  // ======================================================
  // ESTADO DE UI: controla si estamos editando un proyecto, es decir, controla si el modal de edición está abierto o cerrado.
  // ======================================================
  // editingProject → valor actual
  // setEditingProject → función para cambiarlo
  // Estado:
    // null → no se está editando nada (editingProject = null → modal cerrado)
    // Project → se está editando ese proyecto, es decir, el modal está abierto mostrando los datos de ese proyecto → (editingProject = project → modal abierto)
  // IMPORTANTE: Este estado NO contiene una copia del proyecto. Solo indica qué proyecto se está editando actualmente.
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)

  // ======================================================
  // ESTADO AUXILIAR DE RE-RENDER: solo sirve para forzar el re-render
  // ======================================================
  // Este estado NO almacena información (no guarda datos reales). Su única función es forzar que React vuelva a renderizar el componente.
  // Se utiliza cuando cambia un objeto Project pero React no detecta automáticamente el cambio.
  // ¿Por qué la "," vacía? Significa const [valor, setValor], pero ignorando valor porque nunca lo utilizas.
  const [, forceUpdate] = React.useState(0)

  // ======================================================
  // PARÁMETROS DE LA URL. routeParams obtiene los los parámetros dinámicos definidos en la ruta: path="/project/:id"
  // ======================================================
  // Hook de React que lee la URL
  // Ejemplo URL: /project/123 → routeParams.id = "123"
  // { id?: string } = id es opcional
  const routeParams = Router.useParams<{ id?: string }>()

  // Protección de seguridad. Si no hay ID en la URL → no podemos mostrar nada (no puedes cargar proyecto → renderiza mensaje)
  if (!routeParams.id) {
    return <p>Project ID is needed to see this page</p>
  }

  // Busca el proyecto correspondiente dentro de la memoria global.
    // routeParams.id
    // ↓
    // getProject(id)
    // ↓
    // Project | undefined
  const project = props.projectsManager.getProject(routeParams.id)

  // ======================================================
  // CASO ERROR: el proyecto no existe
  // ======================================================
  // Si el proyecto no existe:
    // - la URL es incorrecta
    // - el proyecto fue eliminado
    // - la memoria aún no está sincronizada
  // En este caso se muestra un mensaje/diálogo de error y se ofrece volver al inicio.
  if (!project) {
    return (
    // Si llega hasta aquí → Muestra modal SIEMPRE (porque open)
    <dialog open>
      <div className="error-modal">
        <h3>Error</h3>
        <p>The project with ID {routeParams.id} was not found.</p>
         {/* Redirige a la página principal cuando se haga click en el botón "Go back" */}
        <button onClick={() => window.location.href = "/"}>
          Go back
        </button>
      </div>
    </dialog>
    )
  }

  // Hook de React Router utilizado para cambiar de página mediante código. Equivale a navegar a otra URL sin recargar la aplicación.
  const navigate = Router.useNavigate()

  // ======================================================
  // ELIMINAR PROYECTO
  // ======================================================
  // Elimina el proyecto actual:
    // 1. Firebase
    // 2. Memoria
    // 3. Navega a la página principal
  const handleDeleteProject = async () => {
    // Protección extra. Evita intentar borrar un proyecto inexistente.
    if (!project) return

    try {
      // Borra el proyecto:
        // Firebase
        // ↓
        // deleteProject()
        // ↓
        // ProjectsManager.list
        // ↓
        // React
      await props.projectsManager.deleteProjectFromFirebase(project.id)

      // Una vez eliminado el proyecto, volvemos a la página principal. Ya no tendría sentido permanecer en una página cuyo proyecto acaba de desaparecer.
      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  // ======================================================
  // GUARDAR CAMBIOS DEL PROYECTO (edición desde el formulario)
  // ======================================================
  // Se ejecuta cuando el usuario envía el formulario de edición (submit)
  // Responsabilidades:
    // 1. Actualizar el objeto Project.
    // 2. Guardar cambios en Firebase.
    // 3. Notificar a React.
    // 4. Cerrar el modal.
  const handleEditSubmit = async (data: IProject) => {

    // 1. ACTUALICIÓN DE LA INSTANCIA Project QUE YA EXISTE EN MEMORIA
    // NO se crea un proyecto nuevo, sino que se modifican las propiedades del proyecto actual: MISMO OBJETO → NUEVOS VALORES
    // Actualizamos los datos del proyecto existente (se sobreescribe lo que ya hay con los nuevos datos introducidos). 
    project.name = data.name
    project.description = data.description
    project.status = data.status
    project.userRole = data.userRole
    project.finishDate = data.finishDate

     // Opcional pero recomendable
    project.cost = data.cost
    project.progress = data.progress

    // 2. ACTUALIZAR EN FIREBASE (CUANDO LE DAMOS AL BOTÓN EDIT)
    // Persistencia. Convierte el proyecto a JSON y actualiza el documento correspondiente en Firestore.
    await props.projectsManager.updateProjectInFirebase(project)
    
    // 3. REFRESCAR REACT
    // Fuerza la sincronización con React. updateProject():
      // - genera una nueva referencia de array
      // - dispara onProjectUpdated(): Notificamos al manager los cambios ( internamente this.onProjectUpdated() → Eso dispara setProjects([...]) en ProjectsPage.tsx )
      // - React se re-renderiza: React vuelve a renderizar los componentes suscritos
    props.projectsManager.updateProject()

    // 4. CERRAR MODAL
    // editingProject: Project → null
    // React re-renderiza y el modal desaparece (React → isOpen = false → modal se cierra)
    setEditingProject(null)
  }

  // FLUJO DE EDICIÓN:
    // Usuario
    // ↓
    // ProjectFormModal
    // ↓
    // handleEditSubmit()
    // ↓
    // actualizar Project
    // ↓
    // updateProjectInFirebase()
    // ↓
    // updateProject()
    // ↓
    // onProjectUpdated()
    // ↓
    // React re-render
    // ↓
    // modal cerrado

  // ======================================================
  // RENDER
  // ======================================================
  // Devuelve JSX (UI)
  // Convierte el estado actual de la página en elementos visuales. Si el proyecto existe:
    // - muestra la cabecera
    // - muestra la información del proyecto
    // - muestra las tareas
    // - muestra el visor 3D
    // - muestra el modal de edición cuando corresponda

  // Aquí React crea una referencia: no existe ningún Grid. React solamente dice: Cuando exista el <bim-grid>, guárdamelo aquí.
  // Visualmente.
    // React
    // ↓
    // useRef()
    // ↓
    // viewerGrid.current
    // ↓
    // <bim-grid></bim-grid>
  const viewerGrid = React.useRef<ViewerGrid>(null)

  // Memory leaks: Se declara una variable vacía fuera de la función setupGrid ()
  let engineManager: OBC.Components | null = null

  // Esta función es el auténtico punto de unión entre React y That Open
  const setupGrid = async () => {
    const { current: grid } = viewerGrid
    // Protección. Si React todavía no ha creado el <bim-grid> --> No hacemos nada
    if (!grid) return

    // Crear toda la infraestructura BIM
    const { components, viewport } = await setupComponents()
    // Cuando setupGrid() crea el Components Manager, éste se asigna a dicha variable
    engineManager = components

    const smartViews = components.get(SmartViews);

    if (project.smartViews) {
      smartViews.importFromJSON(project.smartViews);
    }

    const finder = components.get(OBC.ItemsFinder);

    if (project.itemFinderQueries !== undefined) {
      finder.list.clear();
      finder.import(project.itemFinderQueries);
    }
    
    let querySaveTimeout: ReturnType<typeof setTimeout> | undefined;

    const saveItemFinderQueries = () => {
      if (querySaveTimeout) {
        clearTimeout(querySaveTimeout);
      }

      querySaveTimeout = setTimeout(() => {
        project.itemFinderQueries = JSON.parse(
          JSON.stringify(finder.export()),
        );

        void props.projectsManager
          .updateProjectInFirebase(project)
          .catch((error) => {
            console.error("Could not save ItemsFinder queries:", error);
          });
      }, 0);
    };

    finder.list.onItemSet.add(saveItemFinderQueries);
    finder.list.onItemUpdated.add(saveItemFinderQueries);
    finder.list.onItemDeleted.add(saveItemFinderQueries);
    finder.list.onCleared.add(saveItemFinderQueries);

    // Guardar las smart views
    const saveSmartViews = async () => {
      const exportedSmartViews = smartViews.exportToJSON();

      // Elimina propiedades undefined que Firestore no acepta.
      project.smartViews = JSON.parse(JSON.stringify(exportedSmartViews));

      await props.projectsManager.updateProjectInFirebase(project);
    };

    // Aquí empieza ui-templates
    grid.elements = {
      // Hemos quitado el encabezado y el sidebar ya no tiene apariencia de barra lateral, mantiene el mismo nombre por simplicidad.
      sidebar: {
        template: TEMPLATES.gridSidebarTemplate,
        initialState: {}
      },
      // Esta línea conecta absolutamente todo
      componentsGrid: {
        template: TEMPLATES.componentsGridTemplate,
        initialState: { components, viewport, onSmartViewsChange: saveSmartViews }
      }
    };

    grid.layouts = {
      Main: {
        template: `
          "sidebar" auto
          "componentsGrid" 1fr
          /1fr
        `,
      },
    }

    grid.addEventListener("elementcreated", (e: CustomEvent<BUI.ElementCreatedEventDetail<ComponentsGrid>>) => {
      const { name, element: componentsGrid } = e.detail
      if (name !== "componentsGrid") return
      grid.updateComponent.sidebar({ grid: componentsGrid })
    })

    grid.layout = "Main";
  }

  // Esto es simplemente React diciendo: Cuando el componente aparezca --> Construye toda la interfaz BIM solo una vez, porque: [] significa: solo al montar.
  React.useEffect(() => {
    setupGrid()
    // La función de limpieza utiliza la referencia engineManager para destruir el motor:
    return () => {
      engineManager?.dispose()
      engineManager = null
    }
  }, [])

  // Render: Porque después: setupGrid() rellena ese Grid. Es decir. React crea: <bim-grid> y That Open lo convierte en:
    // Header
    // Sidebar
    // ComponentsGrid
    // ↓
    // ComponentsGrid crea:
      // Viewport
      // Models
      // Queries
      // ItemsData
    // ↓
    // Viewport crea:
      // Scene
      // Renderer
      // Camera
    // ↓
    // Toolbar
    // ↓
    // Highlighter
    // ↓
    // FragmentsManager
    // ↓
    // ItemsFinder

  // Todo aparece automáticamente
  return (
    <bim-grid ref={viewerGrid} className="viewer-grid"></bim-grid>
  );
}

// ======================================================
// ARQUITECTURA COMPLETA
// ======================================================
// React
// │
// ▼
// ProjectDetailsPage
// │
// ├──────────── setupComponents()
// │                   │
// │                   ▼
// │             Components
// │             Viewport
// │
// ▼
// componentsGridTemplate
// │
// ├──────────── ViewportContainer
// │                   │
// │                   ▼
// │               Viewport
// │
// ├──────────── ModelsPanel
// │
// ├──────────── QueriesPanel
// │
// └──────────── ItemsDataPanel

// Y si seguimos bajando:

// QueriesPanel
// │
// ▼
// queriesList()
// │
// ▼
// template.ts
// │
// ▼
// setDefaults()
// │
// ▼
// query.test()
// │
// ▼
// Highlighter
// │
// ▼
// Viewport

// ======================================================
// OBSERVACIONES
// ======================================================
// ProjectDetailsPage apenas conoce detalles del motor BIM. Sus únicas responsabilidades relacionadas con That Open son:

// 1. Crear la infraestructura BIM (importando y utilizando setupComponents()).
// 2. Obtener los dos objetos que necesita la interfaz (components y viewport).
// 3. Entregarlos al primer template (componentsGridTemplate).
// 4. Crear el <bim-grid> raíz sobre el que se montará toda la interfaz.

// A partir de ahí, todo lo demás ocurre dentro de los módulos BIM (bim-components y ui-templates):
  // bim-components configura el motor (World, IfcLoader, FragmentsManager, Highlighter, ItemsFinder).
  // ui-templates construye toda la interfaz (grids, paneles, tablas, toolbar).
  // ProjectDetailsPage actúa únicamente como el puente entre React y el ecosistema de That Open.

// Creo que esa separación de responsabilidades es uno de los aspectos más elegantes de la arquitectura del proyecto.










    {/* HEADER del proyecto (nombre, botón editar, etc.) → Pasa el proyecto como prop. Muestra la identidad visual del proyecto y permite eliminarlo. */}
    {/*   <ProjectHeader
    //     project={project}
    //     onDelete={handleDeleteProject}
    //   /> */}

    {/* Contenido principal de la página ProjectDetailsPage */}
    {/*   <div className="main-page-content"> */}

    {/* COLUMNA IZQUIERDA: información y tareas */}
    {/*    <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}> */}

            {/* Tarjeta con info del proyecto */}
    {/*       <ProjectInfoCard
              // Props = Datos del proyecto
              project={project}
              // Función onEdit: Cuando el usuario hace click en "Edit" se abre el modal en modo EDICIÓN: → editingProject: null → project → modal se abre
              onEdit={() => setEditingProject(project)}
              // Función onUpdate: notifica cambios al manager → este dispara eventos → React re-renderiza

    //         // ======================================================
    //         // ACTUALIZACIÓN DEL PROGRESO
    //         // ======================================================
    //         // Usuario mueve slider (cambio de valor)
    //         // ↓
    //         // project.progress = value
    //         // ↓
    //         // forceUpdate()
    //         // ↓
    //         // React render inmediato
    //         // ↓
    //         // Firebase
    //         // ↓
    //         // updateProject()
    //         // ↓
    //         // sincronización global
    //         onProgressChange={async (value) => {

    //         // 1. Modifica directamente el proyecto compartido en memoria
    //         project.progress = value

    //         // 2. Fuerza un render inmediato. React no detecta automáticamente:
    //           // project.progress = value
    //         // porque se está modificando un objeto existente. Por eso se utiliza este estado auxiliar.
    //         forceUpdate(v => v + 1)

    //         // 3. Persistencia. Guarda el nuevo progreso en Firebase
    //         await props.projectsManager.updateProjectInFirebase(project)

    //         // 4. Sincronización global. Notifica a todos los componentes que utilizan ProjectsManager
    //         props.projectsManager.updateProject()

    //       }}
    //       /> */}

    {/* Lista de tareas. Gestión completa de tareas: visualizar, crear y editar */}
    {/* TodoList se encarga internamente de coordinar sus propios componentes */}
    {/*       <TodoList
    //         project={project}
    //         onUpdate={() => props.projectsManager.updateProject()}
    //         projectsManager={props.projectsManager}
    //       />
    //     </div>

    //     {/* COLUMNA DERECHA: Visor 3D */}
    {/*     <ThreeViewer />

    //   </div>

    //   {/* Componente ProjectFormModal es una función a la que le paso datos y funciones */}
         {/* MODAL reutilizable (editar proyecto) */}
         {/* Es la conexión entre: UI (modal) ↔ estado ↔ lógica */}
         {/* ProjectDetailsPage controla: apertura, cierre y guardado*/}
         {/* ProjectFormModal solo muestra el formulario */} 
    {/*     <ProjectFormModal
    //     // editingProject es una variable que puede ser SOLO dos cosas: 1. null → no estás editando → modal cerrado 2. un objeto Project → estás editando → modal abierto
    //     // !! = Es una forma de convertir cualquier valor a booleano, es decir, editingProject: Project | null lo convierto en boolean (true → abrir o false → cerrar)
    //     // CASO 1. NO estás editando: editingProject = null | !editingProject → true | !!editingProject → false | Resultado final: isOpen = false
    //     // CASO 2. SÍ estás editando: editingProject = { name: "Proyecto A" } | !editingProject → false | !!editingProject → true | Resultado final: isOpen = true
    //     // Traducción real: "Si hay proyecto → abre modal" / "Si no hay → ciérralo"
    //     isOpen={!!editingProject}
    //     // LE DAS DATOS AL MODAL: PADRE → HIJO [ projectToEdit (datos) ]
    //     // Le pasas el proyecto (objeto) al formulario (componente hijo) → para que se muestren los datos del proyecto introducidos hasta el momento
    //     // "Si estás editando → usa estos datos" / "Si no → formulario vacío"
    //     projectToEdit={editingProject}
    //     // EL MODAL TE DEVUELVE LOS DATOS: HIJO → PADRE [ onSubmit(data) ] → callback que el modal ejecuta al enviar el formulario
    //     // Se pasa una función al componente hijo (formulario)
    //     // Se pasa la función handleEditSubmit como prop de onSubmit. No la ejecutas, sino que la pasas
    //     // ¿Por qué? Porque ProjectFormModal NO sabe guardar proyectos, necesita ayuda del padre → "Cuando el usuario envíe el formulario → ejecuta esta función"
    //     onSubmit={handleEditSubmit}
    //     // editingProject = null → isOpen = false → modal se cierra
    //     // onClose → resetea el estado → el modal se cierra automáticamente
    //     // Aquí sí usas función anónima porque necesitas ejecutar algo en ese momento (cerrar el modal) → "Cuando el modal se cierre → borra el proyecto en edición"
    //     onClose={() => setEditingProject(null)}
    //   /> 
    // </div> */}
    
 

// FLUJO GENERAL:
// URL
// ↓
// useParams()
// ↓
// getProject()
// ↓
// Project
// ↓
// ProjectHeader
// ProjectInfoCard
// TodoList
// ThreeViewer
//
// Cambios del usuario
// ↓
// ProjectsManager
// ↓
// Firebase
// ↓
// React re-render
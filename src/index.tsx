// Este archivo es el cerebro de la aplicación. Es el que conecta el HTML con la lógica, escucha eventos del usuario, lee formularios, llama al ProjectsManager, abre y cierra modales, controla import/export y maneja errores.

//======================================================================================
// IMPORTACIONES
//======================================================================================
// Importo todo lo necesario para que React funcione
import * as React from "react"
import * as ReactDom from "react-dom/client"
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/ProjectsPage"
// Importo la biblioteca ThreeJS
import * as THREE from "three"
// Importo GUI para interacción dinámica (ejes, color, visibilidad...)
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
// Importo las las extensiones relacionadas con el movimiento de la cámara
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"
// Importo OBJLoader: convierte las coordenadas de vértices en meshes
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
// Importo MTLLoader: textura de los materiales
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
// Importo GTLFLoader
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
// Importo la interfaz IProject y los tipos de dato de ProjectStatus y UserRole
import { IProject, ProjectStatus, UserRole } from "./classes/Project"
// Importo la clase ProjectsManager para conseguir que el proyecto se cree al hacer submit (delega la creación al manager)
import { ProjectsManager } from "./classes/ProjectsManager"

const rootElement = document.getElementById("app") as HTMLDivElement
const appRoot = ReactDom.createRoot(rootElement)
appRoot.render(
  <>
    <Sidebar />
    <ProjectsPage/>
  </>
)

//======================================================================================
// UI HELPERS (MODALS / ERRORS)
//======================================================================================
// FUNCIÓN TOGGLEMODAL: Queremos tener una sola función que abra el <dialog> si está cerrado y que lo cierre si está abierto
// De esta forma evitamos duplicar lógicas: showModal y closeModal
// Toggle genérico para <dialog>
function toggleModal(id: string){
  const modal = document.getElementById(id)

  if (modal && modal instanceof HTMLDialogElement){
    if (modal.open) {
      modal.close()
    } else {
      modal.showModal()
    }
  } else {
    console.warn("The provided modal wasn't found, ID:", id)
  }
}

// POPUP DE ERROR
// Función reutilizable para mostrar errores
function showError(message: string) {
  if (
    errorModal instanceof HTMLDialogElement &&
    errorMessage instanceof HTMLElement
  ) {
    errorMessage.textContent = message
    errorModal.showModal()
  }
}

//======================================================================================
// DOM REFERENCES
//======================================================================================
//LISTA DE PROYECTOS
// Generar una referencia al contenedor HTML, es decir, a la lista de proyectos del archivo HTML
const projectsListUI = document.getElementById("projects-list") as HTMLElement

// BOTÓN NEW PROJECT
// Se guarda el resultado de una función específica en una VARIABLE (const), para poder reutilizarla. Referencia al botón de nuevo proyecto:
const newProjectBtn = document.getElementById("new-project-btn")

// FORMULARIO
// Referencia al formulario
const projectForm = document.getElementById("new-project-form")

// BOTÓN DE CANCELAR FORMULARIO
// Referencia al botón de cancelar del formulario
const cancelProjectBtn = document.getElementById("cancel-project-btn")

// ERROR MODAL
// Cuadro de error al crear uno existente
// Referencias al modal de error, mensaje de error del modal y al botón Ok del modal de error
const errorModal = document.getElementById("error-modal")
const errorMessage = document.getElementById("error-message")
const errorOkBtn = document.getElementById("error-ok-btn")

// BOTÓN DE "PROJECTS" DEL SIDEBAR
// Referencias al botón "Projects" del sidebar, a la página de proyectos y a la página de detalles de proyecto
const projectsBtn = document.getElementById("projects-btn")
const projectsPage = document.getElementById("projects-page")
const detailsPage = document.getElementById("project-details")

// BOTÓN "+" PARA GENERAR TO-DOs
// Referencias al botón "+", al modal para añadir un nuevo to-do, al formulario to-do y al botón de cancelar
const addTodoBtn = document.getElementById("add-todo-btn")
const todoModal = document.getElementById("new-todo-modal") as HTMLDialogElement
const todoForm = document.getElementById("new-todo-form") as HTMLFormElement
const cancelTodoBtn = document.getElementById("cancel-todo-btn")

//======================================================================================
// MANAGERS
//======================================================================================
// Generamos una única instancia para introducir ProjectsManager. Controlará todos los proyectos:
const projectsManager = new ProjectsManager (projectsListUI)

//======================================================================================
// EVENT LISTENERS
//======================================================================================
// ABRIR EL MODAL DE NUEVO PROYECTO
if (newProjectBtn) {
  // Se encapsula la función en una función anónima para que no se ejecute sin hacer antes click en el botón de nuevo proyecto
  // Hasta que no se hace click en el botón de nuevo proyecto no se aplica la función toggleModal
  newProjectBtn.addEventListener("click", () => {toggleModal("new-project-modal")})
} else {
  // Se utiliza console.warn para indicar en la consola en amarillo que no se ha podido ejecutar la función
  console.warn("New projects button was not found")
}

// ENVÍO DEL FORMULARIO
// Se añade && projectForm... para corregir posible error advertido por Typescript relacionado con inheritance de los elementos HTML
if (projectForm && projectForm instanceof HTMLFormElement) {
  // Se escucha el envío/submit
  projectForm.addEventListener("submit", (e) => {
    // Se evita que se recargue la página
    e.preventDefault()

    // Se crea un objeto que permite leer/extraer los datos introducidos en el formulario
    const formData = new FormData(projectForm)
    // Fecha por defecto si no se especifica: genero una variable rawDate (string) donde se extrae el valor de fecha del formulario (valor o null si no se rellena)
    const rawDate = formData.get("finishDate") as string

    // Construye un objeto projectData tipado según IProjectD
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      cost: Number(formData.get("cost")) || 0,
      progress: 0,
      // Fecha por defecto si no se especifica: Si el usuario no pone fecha se muestra por defecto 6 meses desde hoy (operador ternario)
      finishDate: rawDate
        ? new Date(rawDate)
        // Si el usuario no introduce una fecha concreta --> new Date().getMonth() devuelve el mes actual y se suman 6 meses más
        // new Date().setMonth() modifica la fecha actual y devuelve el timestamp en milisegundos
        // new Date (timestamp) convierte esos milisegundos de nuevo en un objeto Date válido
        : new Date(new Date().setMonth(new Date().getMonth() + 6))
    }

    // Utilizo el método TRY para que si se quiere volver a dar de alta un proyecto existente, no se quede el formulario abierto
    try {
      // Crea el proyecto y se renderiza automáticamente. Se cambia para que si el proyecto está activo se actualice y si no se genere el proyecto como al principio
      if (projectsManager.activeProject) {
        projectsManager.updateActiveProject(projectData)
      } else {
        projectsManager.newProject(projectData)
      }
      // Se limpia el formulario para cuando se tenga que introducir uno nuevo
      projectForm.reset()
      // Al enviar el formulario se aplica la función toggleModal
      toggleModal("new-project-modal")
    } catch (err) {
        if (err instanceof Error) {
          showError(err.message)
        } else {
          showError("Unexpected error")
        }
      }
  }) 
} else {
	console.warn("The project form was not found. Check the ID!")
}

// CANCELAR EL FORMULARIO
if (cancelProjectBtn && projectForm instanceof HTMLFormElement) {
  cancelProjectBtn.addEventListener("click", () => {
    projectForm.reset()
    toggleModal("new-project-modal")
  })
}

// CERRAR EL POPUP DE ERROR
if (errorOkBtn) {
  errorOkBtn.addEventListener("click", () => {
    if (errorModal instanceof HTMLDialogElement) {
      errorModal.close()
    }
  })
}

// BOTÓN DE EXPORTACIÓN DE PROYECTOS
const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

// BOTÓN DE IMPORTACIÓN DE PROYECTOS
const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

// BOTÓN DE "PROJECTS" DEL SIDEBAR
if (projectsBtn && projectsPage && detailsPage) {
  projectsBtn.addEventListener("click", () => {
    projectsManager.activeProject = null 
    projectsPage.style.display = "flex"
    detailsPage.style.display = "none"
  })
}

// BOTÓN "+" PARA AÑADIR UN NUEVO TO-DO
// Abrir el modal ToDo
if (addTodoBtn && todoModal instanceof HTMLDialogElement) {
  addTodoBtn.addEventListener("click", () => {
    if (!projectsManager.activeProject) return
    todoModal.showModal()
  })
}

// Envío del formulario ToDo
if (todoForm && todoForm instanceof HTMLFormElement) {
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!projectsManager.activeProject) return

    const formData = new FormData(todoForm)
    const description = formData.get("todoText") as string
    const status = formData.get("todoStatus") as any

    if (!description || !description.trim()) return

    projectsManager.addTodoToActiveProject(description, status)

    todoForm.reset()
    todoModal.close()
  })
}

// Botón Cancel del formulario ToDo
if (cancelTodoBtn && todoModal instanceof HTMLDialogElement) {
  cancelTodoBtn.addEventListener("click", () => {
    todoModal.close()
  })
}

//======================================================================================
// DEFAULT DATA
//======================================================================================
// CREAR UN PROYECTO POR DEFECTO DESDE EL CÓDIGO
const defaultProject: IProject = {
  name: "Hospital Center",
  description: "Community hospital located at downtown",
  status: "Active",
  userRole: "Engineer",
  finishDate: new Date("2025-05-01"),
  cost: 0,
  progress: 0
}

projectsManager.newProject(defaultProject)


//======================================================================================
// ThreeJS VIEWER
//======================================================================================
// Se crea la ESCENA (casi todo en ThreeJS son instancias de clases)
const scene = new THREE.Scene()

// Hacemos referencia al contenedor donde se va a ubicar el visor
const viewerContainer = document.getElementById("viewer-container") as HTMLElement

// Se crea la CÁMARA
const camera = new THREE.PerspectiveCamera(75)
// Ajuste de la posición de la cámara (por defecto se ubica en las coordenadas 0,0,0)
camera.position.z = 5

// Se crea el CAMAREÓGRAFO (renderer)
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

// Se crea el MONITOR donde se va a mostrar lo que graba la cámara
viewerContainer.append(renderer.domElement)

// Almaceno en una FUNCIÓN DE AJUSTE DEL TAMAÑO DEL MONITOR
function resizeViewer () {
  const containerDimensions = viewerContainer.getBoundingClientRect()
  renderer.setSize(containerDimensions.width, containerDimensions.height)
  // CÁMARA: CÁLCULO DE LA RELACIÓN DE ASPECTO (Aspect Ratio)
  // Para que no se pierdan las proporciones en nuestro modelo al achicar o agrandar el monitor
  const aspectRatio = containerDimensions.width / containerDimensions.height
  camera.aspect = aspectRatio
  // Se añade esto para que se actualice el tamaño del MONITOR
  camera.updateProjectionMatrix()
}

// Añado este evento para hacer responsive la pantalla de visualización del modelo
window.addEventListener("resize", resizeViewer)

// Inicializo la función resizeViewer
resizeViewer()

// Un MESH está compuesto de GEOMETRÍA y de MATERIAL
// Creación de la geometría de un cubo
const boxGeometry = new THREE.BoxGeometry()
// Creación del material (los más utilizados son MeshBasicMaterial, MeshLamberMaterial y MeshStandardMaterial-->representa rugosidad y los metales, útil en arquitectura)
const material = new THREE.MeshStandardMaterial()
// Se crea el mesh
const cube = new THREE.Mesh(boxGeometry, material)

// LUCES
// Se añade la luz a la escena (directional = como la luz del Sol y ambient = luz indirecta omnipresente desde cualquier ángulo)
const directionalLight = new THREE.DirectionalLight()
const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.4
// Añado spot light
const spotLight = new THREE.SpotLight(0xffffff, 2, 50, Math.PI / 6, 0.3, 2)

// Se añaden las luces a la escena
scene.add(directionalLight, ambientLight, spotLight)

// CONTROLES
// Se crea una instancia de la clase OrbitControls
const cameraControls = new OrbitControls(camera, viewerContainer)

// RENDERIZADO DE LA ESCENA
// Necesitamos un bucle que ejecute los fotogramas de la escena con 60fps
function renderScene() {
  // Mostrar la escena capturada por el camareógrafo en el monitor: render() --> Capturamos el mesh después de crearlo
  renderer.render(scene, camera)
  requestAnimationFrame(renderScene)
}

renderScene()

// HELPERS
// Creamos un HELPER para que se dibujen los ejes en el origen de coordenadas
const axes = new THREE.AxesHelper()
// Creamos el HELPER para que se dibuje la malla "suelo"
const grid = new THREE.GridHelper()
// Ajuste del material de la grid
grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#808080")
// Creamos el HELPER para la DirectionalLight
directionalLight.position.set(3, 5, 2)
ambientLight.intensity = 0.4
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)

// Añadimos los helper a la escena
scene.add(axes, grid, directionalLightHelper)

// GUI: Añadir controladores en escena
// Genero una instancia de GUI: se ejecuta por objeto
const gui = new GUI()
// Generamos un grupo de controles para el cubo
const cubeControls = gui.addFolder("Cube")

// Aquí se le indican las propiedades que queremos controlar de ese objeto: POSICIÓN
cubeControls.add(cube.position, "x", -10, 10, 1)
cubeControls.add(cube.position, "y", -10, 10, 1)
cubeControls.add(cube.position, "z", -10, 10, 1)
// Añadimos un checkbox para el control de visibilidad del cubo
cubeControls.add(cube, "visible")
// Añadimos control del color del cubo
cubeControls.addColor(cube.material, "color")

// Generamos un grupo de controles para la dirección de la luz
const lightControls = gui.addFolder("Directional Light")
// Aquí se le indican las propiedades que queremos controlar de ese objeto: DIRECCIÓN DE LA LUZ
lightControls.add(directionalLight.position, "x", -10, 10, 0.1)
lightControls.add(directionalLight.position, "y", -10, 10, 0.1)
lightControls.add(directionalLight.position, "z", -10, 10, 0.1)
// Añadimos control de la intensidad de la luz
lightControls.add(directionalLight, "intensity", 0, 10, 0.1)
// Añadimos control del color de la luz
lightControls.addColor(directionalLight, "color")

// LOADERS
// Genero las instancias de los loaders: OBJLoader y de MTLLoader
const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader()

mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
  // Antes de cargar el archivo OBJ se asignan las texturas a los materiales
  materials.preload()
  objLoader.setMaterials(materials)
  // Carga el archivo OBJ y lo transforma en un mesh (realmente es un grupo de meshes)
  objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
    // Se añade el mesh a la escena
    scene.add(mesh)
  })
})

// Cargo el archivo GLTF
// Creo una instancia del loader de GLTF
const gltfLoader = new GLTFLoader()

// Método load que va a descargar y convertir el gltf a Three.js
// Primero se cargar el archivo almacenado en esta ruta
gltfLoader.load("../assets/GLTF/DamagedHelmet.glb", (gltf) => {
    // Una vez cargado el modelo (archivos gltf, bin y png) se ejecuta la callback function y se guarda el modelo en una escena
    const model = gltf.scene
    // Añado el modelo a la escena
    scene.add(model)
  },
)
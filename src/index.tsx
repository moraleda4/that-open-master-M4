// ======================================================
// IMPORTACIONES
// ======================================================
// REACT
// React → para crear componentes
import * as React from "react"
// ReactDOM → para renderizar en el HTML
import * as ReactDOM from "react-dom/client"

//ROUTER
// Router permite navegar entre páginas
import * as Router from "react-router-dom"

// COMPONENTES → Las pantallas de la app y el sidebar que es fijo
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/projects-page/ProjectsPage"
import { ProjectDetailsPage } from "./react-components/project-details/ProjectDetailsPage"

// LÓGICA → Cerebro de la app
import { ProjectsManager } from "./classes/ProjectsManager"

// ESTILOS GLOBALES
import "../style.css"

// VISOR 3D
import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

// ======================================================
// INSTANCIA DE LA CLASE ProjectsManager
// ======================================================
// Se crea el cerebro/base de datos global de la app a partir de la clase ProjectsManager → Se instancia la clase ProjectsManager
// projectsManager = objeto real que contiene la lista de proyectos (con el proyecto por defecto) y sus métodos asociados (crear, borrar, etc.)
// Todos los componentes de la app (páginas de la app) van a utilizar el mismo cerebro
const projectsManager = new ProjectsManager()

// ======================================================
// ESTRUCTURA DE LA APP → RENDERIZADO
// ======================================================
// Busca en el HTML el elemento con id="app" → Este div es donde React va a renderizar TODA la aplicación
const rootElement = document.getElementById("app") as HTMLDivElement
// Crea la raíz de React → Es el punto desde donde React controla el DOM
const appRoot = ReactDOM.createRoot(rootElement)
// Aquí empieza el renderizado de React → Todo lo que pongas dentro se dibuja en el navegador
appRoot.render(
  // Fragmento de React (<> </>) → sirve para agrupar sin añadir divs extra al HTML
  <>
    {/* Activa el sistema de rutas (navegación por URL) */}
    <Router.BrowserRouter>
      {/* Sidebar → se renderiza SIEMPRE (no depende de la ruta) */}
      <Sidebar />
      {/* Contenedor de rutas */}
      <Router.Routes>
        {/* Ruta 1: Cuando la URL es "/" (home), se muestra la página de proyectos */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager}/>}></Router.Route>
        {/* Ruta 2: Cuando la URL es "/project/:id" ":id" es un parámetro dinámico */}
        {/* Le pasas el projectsManager como prop → esto permite que la página acceda a los datos */}
        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager}/>}></Router.Route>
      </Router.Routes>
    </Router.BrowserRouter>
  </>
)


//======================================================================================
// ThreeJS VIEWER
//======================================================================================
// Se crea la ESCENA (casi todo en ThreeJS son instancias de clases)
// const scene = new THREE.Scene()

// // Hacemos referencia al contenedor donde se va a ubicar el visor
// const viewerContainer = document.getElementById("viewer-container") as HTMLElement

// // Se crea la CÁMARA
// const camera = new THREE.PerspectiveCamera(75)
// // Ajuste de la posición de la cámara (por defecto se ubica en las coordenadas 0,0,0)
// camera.position.z = 5

// // Se crea el CAMAREÓGRAFO (renderer)
// const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

// // Se crea el MONITOR donde se va a mostrar lo que graba la cámara
// viewerContainer.append(renderer.domElement)

// // Almaceno en una FUNCIÓN DE AJUSTE DEL TAMAÑO DEL MONITOR
// function resizeViewer () {
//   const containerDimensions = viewerContainer.getBoundingClientRect()
//   renderer.setSize(containerDimensions.width, containerDimensions.height)
//   // CÁMARA: CÁLCULO DE LA RELACIÓN DE ASPECTO (Aspect Ratio)
//   // Para que no se pierdan las proporciones en nuestro modelo al achicar o agrandar el monitor
//   const aspectRatio = containerDimensions.width / containerDimensions.height
//   camera.aspect = aspectRatio
//   // Se añade esto para que se actualice el tamaño del MONITOR
//   camera.updateProjectionMatrix()
// }

// // Añado este evento para hacer responsive la pantalla de visualización del modelo
// window.addEventListener("resize", resizeViewer)

// // Inicializo la función resizeViewer
// resizeViewer()

// // Un MESH está compuesto de GEOMETRÍA y de MATERIAL
// // Creación de la geometría de un cubo
// const boxGeometry = new THREE.BoxGeometry()
// // Creación del material (los más utilizados son MeshBasicMaterial, MeshLamberMaterial y MeshStandardMaterial-->representa rugosidad y los metales, útil en arquitectura)
// const material = new THREE.MeshStandardMaterial()
// // Se crea el mesh
// const cube = new THREE.Mesh(boxGeometry, material)

// // LUCES
// // Se añade la luz a la escena (directional = como la luz del Sol y ambient = luz indirecta omnipresente desde cualquier ángulo)
// const directionalLight = new THREE.DirectionalLight()
// const ambientLight = new THREE.AmbientLight()
// ambientLight.intensity = 0.4
// // Añado spot light
// const spotLight = new THREE.SpotLight(0xffffff, 2, 50, Math.PI / 6, 0.3, 2)

// // Se añaden las luces a la escena
// scene.add(directionalLight, ambientLight, spotLight)

// // CONTROLES
// // Se crea una instancia de la clase OrbitControls
// const cameraControls = new OrbitControls(camera, viewerContainer)

// // RENDERIZADO DE LA ESCENA
// // Necesitamos un bucle que ejecute los fotogramas de la escena con 60fps
// function renderScene() {
//   // Mostrar la escena capturada por el camareógrafo en el monitor: render() --> Capturamos el mesh después de crearlo
//   renderer.render(scene, camera)
//   requestAnimationFrame(renderScene)
// }

// renderScene()

// // HELPERS
// // Creamos un HELPER para que se dibujen los ejes en el origen de coordenadas
// const axes = new THREE.AxesHelper()
// // Creamos el HELPER para que se dibuje la malla "suelo"
// const grid = new THREE.GridHelper()
// // Ajuste del material de la grid
// grid.material.transparent = true
// grid.material.opacity = 0.4
// grid.material.color = new THREE.Color("#808080")
// // Creamos el HELPER para la DirectionalLight
// directionalLight.position.set(3, 5, 2)
// ambientLight.intensity = 0.4
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)

// // Añadimos los helper a la escena
// scene.add(axes, grid, directionalLightHelper)

// // GUI: Añadir controladores en escena
// // Genero una instancia de GUI: se ejecuta por objeto
// const gui = new GUI()
// // Generamos un grupo de controles para el cubo
// const cubeControls = gui.addFolder("Cube")

// // Aquí se le indican las propiedades que queremos controlar de ese objeto: POSICIÓN
// cubeControls.add(cube.position, "x", -10, 10, 1)
// cubeControls.add(cube.position, "y", -10, 10, 1)
// cubeControls.add(cube.position, "z", -10, 10, 1)
// // Añadimos un checkbox para el control de visibilidad del cubo
// cubeControls.add(cube, "visible")
// // Añadimos control del color del cubo
// cubeControls.addColor(cube.material, "color")

// // Generamos un grupo de controles para la dirección de la luz
// const lightControls = gui.addFolder("Directional Light")
// // Aquí se le indican las propiedades que queremos controlar de ese objeto: DIRECCIÓN DE LA LUZ
// lightControls.add(directionalLight.position, "x", -10, 10, 0.1)
// lightControls.add(directionalLight.position, "y", -10, 10, 0.1)
// lightControls.add(directionalLight.position, "z", -10, 10, 0.1)
// // Añadimos control de la intensidad de la luz
// lightControls.add(directionalLight, "intensity", 0, 10, 0.1)
// // Añadimos control del color de la luz
// lightControls.addColor(directionalLight, "color")

// // LOADERS
// // Genero las instancias de los loaders: OBJLoader y de MTLLoader
// const objLoader = new OBJLoader()
// const mtlLoader = new MTLLoader()

// mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
//   // Antes de cargar el archivo OBJ se asignan las texturas a los materiales
//   materials.preload()
//   objLoader.setMaterials(materials)
//   // Carga el archivo OBJ y lo transforma en un mesh (realmente es un grupo de meshes)
//   objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
//     // Se añade el mesh a la escena
//     scene.add(mesh)
//   })
// })

// // Cargo el archivo GLTF
// // Creo una instancia del loader de GLTF
// const gltfLoader = new GLTFLoader()

// // Método load que va a descargar y convertir el gltf a Three.js
// // Primero se cargar el archivo almacenado en esta ruta
// gltfLoader.load("../assets/GLTF/DamagedHelmet.glb", (gltf) => {
//     // Una vez cargado el modelo (archivos gltf, bin y png) se ejecuta la callback function y se guarda el modelo en una escena
//     const model = gltf.scene
//     // Añado el modelo a la escena
//     scene.add(model)
//   },
// )
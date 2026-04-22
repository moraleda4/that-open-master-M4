// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react"
// VISOR 3D
import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

//======================================================================================
// COMPONENTE: ThreeJS VIEWER
//======================================================================================
// Para eliminar de golpe comentarios: Ctrl + ç
export function ThreeViewer() {
    let scene: THREE.Scene | null
    let mesh: THREE.Object3D | null
    let renderer: THREE.WebGLRenderer | null
    let cameraControls: OrbitControls | null
    let camera: THREE.PerspectiveCamera | null
    let axes: THREE.AxesHelper | null
    let grid: THREE.GridHelper | null
    let directionalLight: THREE.DirectionalLight | null
    let ambientLight: THREE.AmbientLight | null
    let mtlLoader: MTLLoader | null
    let objLoader: OBJLoader | null

    const setViewer = () => {
        // Se crea la ESCENA (casi todo en ThreeJS son instancias de clases)
        scene = new THREE.Scene()

        // Hacemos referencia al contenedor donde se va a ubicar el visor
        const viewerContainer = document.getElementById("viewer-container") as HTMLElement

        // Se crea la CÁMARA
        camera = new THREE.PerspectiveCamera(75)
        // Ajuste de la posición de la cámara (por defecto se ubica en las coordenadas 0,0,0)
        camera.position.z = 5

        // Se crea el CAMAREÓGRAFO (renderer)
        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

        // Se crea el MONITOR donde se va a mostrar lo que graba la cámara
        viewerContainer.append(renderer.domElement)

        // Almaceno en una FUNCIÓN DE AJUSTE DEL TAMAÑO DEL MONITOR
        function resizeViewer () {
            const containerDimensions = viewerContainer.getBoundingClientRect()
            if(!renderer) return
            renderer.setSize(containerDimensions.width, containerDimensions.height)
            // CÁMARA: CÁLCULO DE LA RELACIÓN DE ASPECTO (Aspect Ratio)
            // Para que no se pierdan las proporciones en nuestro modelo al achicar o agrandar el monitor
            const aspectRatio = containerDimensions.width / containerDimensions.height
            if(!camera) return
            camera.aspect = aspectRatio
            // Se añade esto para que se actualice el tamaño del MONITOR
            camera.updateProjectionMatrix()
        }

        // Añado este evento para hacer responsive la pantalla de visualización del modelo
        window.addEventListener("resize", resizeViewer)

        // Inicializo la función resizeViewer
        resizeViewer()

        // LUCES
        // Se añade la luz a la escena (directional = como la luz del Sol y ambient = luz indirecta omnipresente desde cualquier ángulo)
        directionalLight = new THREE.DirectionalLight()
        ambientLight = new THREE.AmbientLight()
        ambientLight.intensity = 0.4

        // Se añaden las luces a la escena
        scene.add(directionalLight, ambientLight)

        // CONTROLES
        // Se crea una instancia de la clase OrbitControls
        cameraControls = new OrbitControls(camera, viewerContainer)

        // RENDERIZADO DE LA ESCENA
        // Necesitamos un bucle que ejecute los fotogramas de la escena con 60fps
        function renderScene() {
            if(!renderer || !scene || !camera) return
            // Mostrar la escena capturada por el camareógrafo en el monitor: render() --> Capturamos el mesh después de crearlo
            renderer.render(scene, camera)
            requestAnimationFrame(renderScene)
        }

        renderScene()

        // HELPERS
        // Creamos un HELPER para que se dibujen los ejes en el origen de coordenadas
        axes = new THREE.AxesHelper()
        // Creamos el HELPER para que se dibuje la malla "suelo"
        grid = new THREE.GridHelper()
        // Ajuste del material de la grid
        grid.material.transparent = true
        grid.material.opacity = 0.4
        grid.material.color = new THREE.Color("#808080")

        // Añadimos los helper a la escena
        scene.add(axes, grid)

        // LOADERS
        // Genero las instancias de los loaders: OBJLoader y de MTLLoader
        objLoader = new OBJLoader()
        mtlLoader = new MTLLoader()

        mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
            // Antes de cargar el archivo OBJ se asignan las texturas a los materiales
            materials.preload()
            if(!objLoader) return
            objLoader.setMaterials(materials)
            // Carga el archivo OBJ y lo transforma en un mesh (realmente es un grupo de meshes)
            objLoader.load("../assets/Gear/Gear1.obj", (object) => {
                if(!scene) return
                // Se añade el mesh a la escena
                scene.add(object)
                mesh = object
            })
        })
    }

    
    React.useEffect(() => {
        setViewer();
        return () => {
        mesh?.removeFromParent()
        mesh?.traverse((child) => {
            if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            child.material.dispose()
            }
        })
        mesh = null

        cameraControls?.dispose()
        cameraControls = null
    
        directionalLight?.dispose()
        directionalLight?.removeFromParent()
        directionalLight = null
                        
        ambientLight?.removeFromParent()
        ambientLight?.dispose()
        ambientLight = null
    
        renderer?.dispose()
        renderer = null
            
        grid?.removeFromParent()
        grid?.geometry.dispose()
        grid?.material.dispose()
        grid = null
    
        axes?.removeFromParent()
        axes?.traverse((child) => {
            if (child instanceof THREE.Mesh) {
            child.material.dispose();
            }
        })
        axes?.geometry.dispose()
        axes = null
        
        camera?.removeFromParent()
        camera = null

        scene?.removeFromParent()
        scene = null

        mtlLoader = null
        objLoader = null
        };
    }, []);

    return (
        <>
            {/* COLUMNA DERECHA DE LA PÁGINA DE DETALLES DE PROYECTO: THREE VIEWER */}
            <div
            id="viewer-container"
            className="dashboard-card"
            style={{ minWidth: 0 }}
            />
        </> 
    )
}
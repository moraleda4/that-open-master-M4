// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================

// - Crear y montar un visor 3D con Three.js
// - Cargar un modelo OBJ + MTL
// - Gestionar render y limpieza de memoria

// FLUJO COMPLETO:
// ======================================================
// FASE DE MONTAJE (MOUNTING)
// ======================================================
// Aunque setViewer esté arriba en el archivo, NO se ejecuta automáticamente. React sigue este orden:
// 1. React ejecuta la función del componente: export function ThreeViewer() {
    // Se declaran variables (scene, camera, etc.)
    // Se define setViewer
    // Pero NO se ejecuta nada aún
// 2. React ejecuta render (renderiza el JSX) → construye el DOM → se considera montado 
    // return (
    //   <div id="viewer-container" />
    // )
    // Resultado: El <div> se pinta en el DOM. Ahora existe físicamente en la página
// 3. React finaliza el montaje
// 4. DESPUÉS de montar el componente → Se ejecuta useEffect: useEffect(() => { ... }, [])
    // Se ejecuta DESPUÉS del render
    // Solo una vez ([])
// 5. Dentro de useEffect → se llama a setViewer(): Aquí se crea TODO el visor 3D → Se crea la escena Three.js: (Scene → Camera → Renderer → DOM → Controls → Lights → Model)
    // Se conecta al HTML: viewerContainer.append(renderer.domElement) → renderer.domElement se inserta en el contenedor
    // Se inicia el render loop con requestAnimationFrame(renderScene)
        // → La frecuencia depende del navegador (~60 FPS)
        // → React no interviene en este proceso

    // Se cargan modelos (MTL → materiales y OBJ → geometría)
    // Se añade a la escena: scene.add(object)
// ======================================================
// FASE DE ACTUALIZACIÓN (UPDATING)
// ======================================================
// En este componente NO hay updating porque:
    // → No hay useState
    // → No hay props dinámicas
    // → useEffect tiene dependencias vacías ([])
// El render se actualiza mediante Three.js:
    // → requestAnimationFrame(renderScene)
    // → React no interviene
// ======================================================
// FASE DE DESMONTAJE (UNMOUNTING)
// ======================================================
// 1. React desmonta/elimina el componente (ej: cambio de página - Estás en ProjectDetailsPage → cambias a otra ruta → ThreeViewer desaparece)
// 2. Se ejecuta la función de cleanup de useEffect
// 3. Se liberan recursos manualmente: mesh.removeFromParent(), geometry.dispose(), material.dispose(), renderer.dispose(), controls.dispose(), lights.dispose()
    // hree.js gestiona recursos en GPU (WebGL) que NO están controlados por el Garbage Collector de JavaScript y React NO limpia eso. Por eso, se hace una limpieza manual
    // ¿QUÉ PASA SI NO HACES CLEANUP? Si navegas varias veces:
        // → Cada visor sigue vivo en memoria
        // → GPU acumula recursos
        // → caída de rendimiento
        // → posible crash
// 4. Se eliminan referencias (scene = null, camera = null, mesh = null)
    // No estás “borrando” el objeto directamente, sino que estás eliminando la referencia que apunta a ese objeto
    // dispose() → libera recursos reales (GPU/memoria)
    // = null → permite al Garbage Collector limpiar JS

//RESUMEN:
// React crea y destruye el contenedor, es decir, controla el ciclo de vida del componente (mount/unmount)
// Three.js gestiona el renderizado y los recursos gráficos
// El desarrollador es responsable de liberar manualmente los recursos GPU al desmontar, es decir, limpiar

// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react"
// VISOR 3D
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

//======================================================================================
// COMPONENTE: ThreeJS VIEWER
//======================================================================================
// Para eliminar de golpe comentarios: Ctrl + ç

export function ThreeViewer() {
    // ======================================================
    // VARIABLES (estado interno NO React)
    // ======================================================
    // Se usan variables normales porque Three.js no depende de re-render de React
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

    // ======================================================
    // FUNCIÓN PRINCIPAL: setViewer
    // Inicializa TODO el visor 3D
    // ======================================================
    const setViewer = () => {

        // =============================
        // 1. ESCENA
        // =============================
        // Se crea la ESCENA (casi todo en ThreeJS son instancias de clases)
        scene = new THREE.Scene()

        // Contenedor HTML donde se renderiza: Hacemos referencia al contenedor donde se va a ubicar el visor
        const viewerContainer = document.getElementById("viewer-container") as HTMLElement

        // =============================
        // 2. CÁMARA
        // =============================
        // Se crea la CÁMARA
        camera = new THREE.PerspectiveCamera(75)
        // Ajuste de la posición de la cámara (por defecto se ubica en las coordenadas 0,0,0)
        camera.position.z = 5

        // =============================
        // 3. RENDERER (motor gráfico)
        // =============================
        // Se crea el CAMAREÓGRAFO (renderer)
        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

        // Se crea el MONITOR donde se va a mostrar lo que graba la cámara (inserta el canvas en el DOM)
        viewerContainer.append(renderer.domElement)

        // =============================
        // 4. RESPONSIVE (resize)
        // =============================
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

        // =============================
        // 5. LUCES
        // =============================
        // Se añade la luz a la escena (directional = como la luz del Sol y ambient = luz indirecta omnipresente desde cualquier ángulo)
        directionalLight = new THREE.DirectionalLight()
        ambientLight = new THREE.AmbientLight()
        ambientLight.intensity = 0.4

        // Se añaden las luces a la escena
        scene.add(directionalLight, ambientLight)

        // =============================
        // 6. CONTROLES (orbit)
        // =============================
        // Se crea una instancia de la clase OrbitControls
        cameraControls = new OrbitControls(camera, viewerContainer)

        // =============================
        // 7. BUCLE DE RENDER
        // =============================
        // RENDERIZADO DE LA ESCENA
        // Necesitamos un bucle que ejecute los fotogramas de la escena con 60fps
        function renderScene() {
            if(!renderer || !scene || !camera) return
            // Mostrar la escena capturada por el camareógrafo en el monitor: render() --> Capturamos el mesh después de crearlo
            renderer.render(scene, camera)
            requestAnimationFrame(renderScene)
        }

        renderScene()

        // =============================
        // 8. HELPERS (ejes + grid)
        // =============================
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

        // =============================
        // 9. CARGA DE MODELO (OBJ + MTL)
        // =============================
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

    // ======================================================
    // HOOK: useEffect (montaje y limpieza)
    // ======================================================
    React.useEffect(() => {

        // Inicializa el visor al montar el componente
        setViewer();

        // CLEANUP → MUY IMPORTANTE EN THREE.JS
        // React elimina el DOM → pero NO elimina recursos de Three.js
        //Por eso tenemos que limpiar → geometría, materiales, renderer y listeners
        return () => {
        // 1. Elimina el mesh (modelo) de la escena y libera memoria → Quita el objeto de la pantalla
            // mesh es tu objeto 3D (OBJ cargado)
            // removeFromParent() lo saca del árbol de la escena
        mesh?.removeFromParent()
        // 2. Recorre el modelo y liberar memoria GPU de geometría y materiales: child.geometry.dispose() y child.material.dispose()
            // Si no hago esto: Memory leak, GPU saturada y la app se vuelve lenta
        // mesh?.traverse((child) => { → Recorre todos los nodos hijos del modelo. Un OBJ suele ser un árbol de meshes
        mesh?.traverse((child) => {
            // Filtra solo objetos renderizables (los que tienen geometría/material)
            if (child instanceof THREE.Mesh) {
            // Libera buffers de geometría en GPU (vértices, índices…)
            child.geometry.dispose()
            // Libera shaders, texturas, uniforms
            child.material.dispose()
            }
        })
        // 3. Eliminar referencia JS: Rompe la referencia en JavaScript y permite al Garbage Collector eliminar el objeto en RAM
        mesh = null

        // 4. Elimina controles: elimina listeners activos (mouse, wheel...) y referencias internas
            // ¿Qué pasa si no hago esto? Listeners siguen activos → consumo innecesario → comportamiento raro
        cameraControls?.dispose()
        // Limpia referencia JS
        cameraControls = null
        
        // 5. Elimina luces: libera recursos internos de la luz
        directionalLight?.dispose()
        // La quita de la escena
        directionalLight?.removeFromParent()
        // Limpia referencia
        directionalLight = null
                        
        ambientLight?.removeFromParent()
        ambientLight?.dispose()
        ambientLight = null
        
        // 6. Liberar renderer (MUY IMPORTANTE): Esto libera contexto WebGL, buffers GPU y texturas
            // Si NO hacemos esto: GPU sigue ocupada → memory leak brutal → posible crash del navegador
        renderer?.dispose()
        // Limpia referencia JS
        renderer = null
        
        // 7. Elimina GRID helper
        // Lo quita del render
        grid?.removeFromParent()
        // Libera geometría
        grid?.geometry.dispose()
        // Libera material
        grid?.material.dispose()
        // Limpia referencia
        grid = null
        
        // 8. Elimina AXES helper
        // Lo quita de la escena
        axes?.removeFromParent()
        // Libera materiales internos
        axes?.traverse((child) => {
            if (child instanceof THREE.Mesh) {
            child.material.dispose();
            }
        })
        // Libera geometría
        axes?.geometry.dispose()
        // Limpia referencia
        axes = null
        
        // 9. Limpia referencias
        // Cámara
        // La desvinculas de la escena
        camera?.removeFromParent()
        // Limpias referencia
        camera = null

        // Escena
        // Realmente aquí no es crítico (la escena suele ser root)
        scene?.removeFromParent()
        // Limpia referencia
        scene = null

        // Loaders
        // Solo elimina referencias JS
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
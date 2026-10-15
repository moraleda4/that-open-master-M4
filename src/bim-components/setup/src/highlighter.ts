// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// setupHighlighter configura el componente Highlighter, que se encarga de:
  // 1. Detectar qué elemento del modelo ha seleccionado el usuario.
  // 2. Resaltar visualmente ese elemento.
  // 3. Mantener la selección activa.
  // 4. Servir como base para otras funcionalidades (mostrar propiedades, aislar elementos, ocultarlos, etc.).

// Es importante destacar que este archivo no implementa el comportamiento del resaltado, sino que simplemente inicializa el componente.

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// That Open abstrae toda la complejidad del resaltado. Tú solo necesitas indicar sobre qué World debe trabajar, y la librería se encarga internamente de:
  // 1. escuchar los eventos del ratón,
  // 2. usar el Raycaster para identificar el objeto seleccionado,
  // 3. aplicar el material o estilo de resaltado correspondiente,
  // 4. mantener el estado de la selección.

// Eso explica por qué, con solo dos líneas de configuración, obtienes una funcionalidad que en un proyecto hecho directamente con Three.js requeriría bastante más código.

// ======================================================
// IMPORTACIONES
// ======================================================
// Se utiliza para acceder a: Components y World. No interviene directamente en el resaltado
import * as OBC from "@thatopen/components"
// Aquí aparece una librería nueva. Hasta ahora habíamos trabajado principalmente con: @thatopen/components que contiene la lógica principal del motor BIM
// @thatopen/components-front incluye componentes orientados a la interacción del usuario
// Es una separación muy lógica:
  // components → infraestructura y motor.
  // components-front → interacción con el usuario.
import * as OBF from "@thatopen/components-front"

// ======================================================
// CLASE PRINCIPAL: setupHighlighter
// ======================================================
// Configura el componente encargado de gestionar la selección y el resaltado de elementos del modelo BIM
// Recibe el contenedor de componentes y el mundo donde se realizará la selección
// El Highlighter necesita conocer el World porque es ahí donde se encuentran: la cámara, el renderer, el raycaster y los modelos.
export const setupHighlighter = (components: OBC.Components, world: OBC.World) => {
  // Obtiene la instancia del Highlighter registrada en el sistema. No crea un objeto nuevo, sino que obtiene la instancia registrada dentro del contenedor
  // Eso significa que todo el proyecto utilizará el mismo Highlighter, evitando múltiples instancias con estados distintos
  const highlighter = components.get(OBF.Highlighter)
  // Inicializa el componente Highlighter asociándolo al mundo sobre el que actuará. Le estamos diciendo: "Este será el mundo sobre el que vas a trabajar"
  // A partir de este momento el Highlighter podrá detectar y resaltar los elementos seleccionados por el usuario, es decir, ya sabe:
    // dónde buscar objetos,
    // qué cámara utilizar,
    // qué renderer observar,
    // y sobre qué escena actuar.
  highlighter.setup({world})
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// ¿Qué ocurre cuando el usuario hace clic?
// Usuario hace clic
//         │
//         ▼
// Raycaster (En create-world.ts vimos esto: components.get(OBC.Raycasters).get(world))
//         │
//         ▼
// Detecta el fragmento
//         │
//         ▼
// Highlighter (utiliza precisamente ese Raycaster para saber qué objeto ha sido seleccionado)
//         │
//         ▼
// Cambia el material
//         │
//         ▼
// Elemento resaltado

// Relación con el resto del proyecto: este archivo depende de que exista un world, un Raycaster y una escena con modelos. Por eso se inicializa después de createWorld()
// createWorld()
//         │
//         ├── Camera
//         ├── Renderer
//         ├── Scene
//         └── Raycaster
//                   │
//                   ▼
// setupHighlighter()
//                   │
//                   ▼
// Usuario hace clic
//                   │
//                   ▼
// Elemento seleccionado
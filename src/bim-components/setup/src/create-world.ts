// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Archivo donde se construye el visor 3D sobre el que trabajará toda la aplicación.
// Podemos dividirlo en 6 responsabilidades:
// 1. Crear el World (el entorno 3D).
// 2. Crear la escena.
// 3. Crear el viewport (la parte de la interfaz donde se dibuja el modelo).
// 4. Crear el renderer y la cámara.
// 5. Configurar servicios auxiliares (raycaster y grid).
// 6. Devolver el visor ya preparado.

// En That Open Components, un World agrupa todos los elementos necesarios para visualizar un modelo BIM: Scene, Camera, Renderer, Raycaster, Grid
// World representa un visor completo. En teoría podrías tener varios mundos al mismo tiempo. Sin embargo, en la mayoría de aplicaciones solo existe uno

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// Separación entre motor y UI: create-world.ts no construye HTML manualmente, sino que delega el diseño del visor en ui-templates
// Eso hace que el motor sea independiente de la presentación.

// ======================================================
// IMPORTACIONES
// ======================================================
// Importa todas las clases relacionadas con el motor BIM. De aquí salen: Components, Worlds, Scene, Renderer, Camera, Grid, Raycaster
import * as OBC from "@thatopen/components"
// Importa el sistema de componentes web que utiliza la interfaz. Mientras @thatopen/components se ocupa del motor 3D, @thatopen/ui se ocupa de construir la interfaz HTML.
import * as BUI from "@thatopen/ui"
// Aquí aparecen por primera vez las plantillas de interfaz. Este archivo no sabe cómo es visualmente el visor (no conoce los detalles del HTML). Simplemente pide una plantilla
// Esto es una buena separación de responsabilidades: create-world.ts → ui-templates
import * as TEMPLATES from "../../../ui-templates"

// ======================================================
// CLASE PRINCIPAL: createWorld
// ======================================================
// Crea y configura un nuevo visor (World) con todos los elementos necesarios para visualizar modelos BIM.
// Recibe el contenedor principal de componentes. No crea uno nuevo. Esto es importante porque todos los módulos compartirán el mismo Components.
export const createWorld = (components: OBC.Components) => {
  // Obtiene el gestor encargado de crear y administrar los distintos mundos.
  // Este servicio es el encargado de crear y administrar todos los visores existentes
  // Es parecido a hacer: const worlds = new Worlds(); pero utilizando el contenedor de dependencias de That Open.
  const worlds = components.get(OBC.Worlds);
  // Crea un nuevo mundo indicando qué implementaciones utilizará para la escena, la cámara y el renderizador. Esto hace que el mundo sea totalmente configurable
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >()

  // Crea la escena 3D donde se cargarán y visualizarán los modelos. Podemos imaginarla como una caja vacía, ya que todavía no contiene ningún IFC
  world.scene = new OBC.SimpleScene(components);
  // Inicializa la escena con su configuración por defecto. Normalmente aquí se configuran: luces, ambiente, elementos internos, etc.
  world.scene.setup();
  // Elimina el color de fondo para que el canvas sea transparente.
    // world.scene.three es la escena de Three.js que utiliza internamente That Open
    // Al asignar background = null se consigue que el canvas tenga fondo transparente. Es útil si el visor va encima de otro fondo de la aplicación
  world.scene.three.background = null;

  // Crea el componente visual (viewport) donde se renderizará la escena.
    // Se crea un componente web (<bim-viewport>). Dentro de ese componente se insertará el renderizador
  const viewport = BUI.Component.create<BUI.Viewport>(
    () => {
      // Se inserta la plantilla que define la estructura del visor (esto viene de ui-templates).
      const [viewportGrid] = BUI.Component.create(TEMPLATES.viewportGridTemplate, {
        components,
        world
      });
      return BUI.html`<bim-viewport>${viewportGrid}</bim-viewport>`
    },
  );

  // Asocia el renderizador al viewport creado. El renderer utilizará el componente HTML creado anteriormente: viewport
  // Renderer → Dibuja dentro de viewport
  world.renderer = new OBC.SimpleRenderer(components, viewport);

  // Crea la cámara utilizada para navegar por el modelo. No es solo ortográfica, no es solo perspectiva, sino que puede alternar entre ambas
  world.camera = new OBC.OrthoPerspectiveCamera(components);

  // Ajusta el tamaño del renderer y la cámara cuando cambia el tamaño del viewport.
  const resizeWorld = () => {
    try {
      // Hace que el renderer ocupe el nuevo tamaño
      world.renderer?.resize();
      // Actualiza la relación de aspecto de la cámara. Si no hicieras esto, el modelo aparecería deformado.
      world.camera.updateAspect();
    } catch (error) {
      console.warn("Resizing the world was not possible")
    }
  };
  
  // Escucha los cambios de tamaño del viewport. Cada vez que cambie el tamaño, el visor se adapta automáticamente.
  viewport.addEventListener("resize", resizeWorld);

  // Inicializa el raycaster para permitir seleccionar objetos mediante clics del ratón. Sin él, el sistema de selección (Highlighter) no funcionaría
  components.get(OBC.Raycasters).get(world);

  // Añade una cuadrícula de referencia al mundo. Es simplemente una ayuda visual para orientarse
  components.get(OBC.Grids).create(world);

  // Devuelve el mundo y su componente visual asociado.
  return { world, viewport }
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// createWorld()
//         │
//         ▼
// crear World
//         │
//         ▼
// crear Scene
//         │
//         ▼
// crear Viewport
//         │
//         ▼
// crear Renderer
//         │
//         ▼
// crear Cámara
//         │
//         ▼
// configurar Resize
//         │
//         ▼
// crear Raycaster
//         │
//         ▼
// crear Grid
//         │
//         ▼
// return
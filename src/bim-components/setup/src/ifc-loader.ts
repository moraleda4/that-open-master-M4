// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// La función setupIfcLoader configura el componente IfcLoader, que será el encargado de:
// 1. Leer archivos con extensión .ifc.
// 2. Interpretar su contenido mediante la librería web-ifc.
// 3. Convertir el modelo IFC en Fragments, que posteriormente gestionará el FragmentsManager.

// Es importante entender que este archivo no carga modelos. Solo establece cómo debe funcionar el cargador.

// Cuando más adelante el usuario pulse un botón como "Cargar modelo", ocurrirá algo parecido a esto:

// Usuario selecciona un IFC
//             │
//             ▼
//        IfcLoader
//             │
//             ▼
// web-ifc interpreta el archivo
//             │
//             ▼
// Se generan Fragments
//             │
//             ▼
// FragmentsManager los administra
//             │
//             ▼
// Se añaden al World

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// Este archivo es un buen ejemplo de configuración desacoplada. No intenta cargar un IFC ni manipular el visor; únicamente prepara el IfcLoader.
// Gracias a ello, cualquier parte de la aplicación puede reutilizar este componente sin preocuparse por cómo se ha configurado.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as OBC from "@thatopen/components"

// ======================================================
// CLASE PRINCIPAL: setupIfcLoader
// ======================================================
// Configura el cargador IFC indicando cómo debe localizar la librería web-ifc encargada de interpretar los archivos IFC
// Recibe el contenedor de componentes, igual que el resto de funciones de configuración. No necesita el world porque aquí todavía no se representa nada en pantalla
export const setupIfcLoader = (components: OBC.Components) => {
  // Obtiene el componente encargado de cargar y procesar archivos IFC
  // A partir de este momento podemos modificar su configuración
  const ifcLoader = components.get(OBC.IfcLoader);
  // Desactiva la configuración automática de WebAssembly para indicar manualmente la ubicación de los archivos necesarios
  // Por defecto, IfcLoader puede intentar localizar automáticamente los archivos necesarios para ejecutar web-ifc
  // Aquí se desactiva ese comportamiento porque queremos indicar manualmente dónde se encuentran esos archivos
    // autoSetWasm = true → IfcLoader decide automáticamente dónde buscar WebAssembly
    // autoSetWasm = false → Nosotros indicamos exactamente la ubicación
    // Esta última opción da más control y evita depender de una configuración automática que puede variar según el entorno de desarrollo o despliegue
  ifcLoader.settings.autoSetWasm = false
  // Define la ruta desde la que se cargarán los archivos WebAssembly de la librería web-ifc. En este caso se utiliza un CDN público
  // Aquí se especifica dónde debe encontrar IfcLoader los archivos de web-ifc. web-ifc es la librería que realmente entiende el formato IFC.
  // Podemos verlo así: Archivo IFC → web-ifc → Datos geométricos y propiedades → IfcLoader → Fragments
  // IfcLoader actúa como intermediario, pero quien interpreta el contenido del IFC es web-ifc
  // ¿Qué significa absolute: true? Indica que la ruta proporcionada es absoluta, es decir, no depende de la ubicación de la aplicación
  // ¿Qué significa path? Es la ubicación desde la que se descargarán los archivos WebAssembly necesarios para interpretar los IFC
  ifcLoader.settings.wasm = { absolute: true, path: "https://unpkg.com/web-ifc@0.0.77/" }
}

// ======================================================
// FLUJO COMPLETO
// ======================================================

// setupComponents()
//         │
//         ├── createWorld()
//         │
//         ├── setupFragmentsManager()
//         │
//         ├── setupIfcLoader()
//         │          │
//         │          ▼
//         │   Configura web-ifc
//         │
//         ▼
// Usuario carga un IFC
//         │
//         ▼
// IfcLoader utiliza web-ifc
//         │
//         ▼
// Genera Fragments
//         │
//         ▼
// FragmentsManager
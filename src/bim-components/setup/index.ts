// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Orquestador de todos los componentes de That Open Engine
// Inicializa el sistema de componentes de That Open Company y devuelve un visor completamente configurado

// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa la librería principal de That Open Company, que contiene: Components, Worlds, FragmentsManager, IfcLoader, etc.
import * as OBC from "@thatopen/components";
// Aquí se importan los distintos módulos de configuración (una responsabilidad por módulo, lo que hace que el código sea más mantenible):
  // createWorld() → construye el visor 3D
  // setupIfcLoader() → configura cómo leer archivos IFC
  // setupFragmentsManager() →  gestiona los modelos y optimiza su renderizado
  // setupHighlighter() → configura la selección y el resaltado de elementos
  // setupItemsFinder() → registra consultas para buscar información BIM
import { createWorld, setupFragmentsManager, setupHighlighter, setupIfcLoader, setupItemsFinder, setupDataEnhancer, setupSmartViews } from "./src";
import * as BUI from "@thatopen/ui"
import { loadModelBtnTemplate } from "../../ui-templates";

// ======================================================
// CLASE PRINCIPAL: setupComponents
// ======================================================
// Esta función será la que llame la aplicación cuando quiera crear el visor.
// Inicializa todos los componentes necesarios para el funcionamiento
// del visor BIM y devuelve los objetos principales que utilizará la aplicación.
export const setupComponents = async () => {
  // Se crea el contenedor principal del motor. Puedes imaginarlo como un registro donde se irán almacenando todos los servicios (Worlds, FragmentsManager, IfcLoader...)
  // Cada módulo que inicialicemos quedará registrado dentro de components.
  // Contenedor principal donde se registrarán todos los componentes y servicios del motor de That Open Company
  const components = new OBC.Components();
  // Crea el entorno 3D (escena, cámara, renderer y viewport).createWorld devuelve 2 objetos: world y viewport
    // world representa el entorno 3D. Dentro tendrá: escena, cámara, renderer...y será el objeto principal sobre el que trabajará el visor
    // viewport será el componente visual donde se renderizará la escena
  const { world, viewport } = createWorld(components)

  // Configura el sistema encargado de cargar archivos IFC
  // Todavía no carga ningún modelo. Simplemente deja preparado el sistema para que, cuando el usuario pulse "Cargar IFC", el visor sepa cómo hacerlo
  setupIfcLoader(components)
  // Inicializa el gestor Fragments para optimizar el renderizado y la gestión de los modelos cargados
  // Los modelos IFC no se renderizan directamente, sino que se convierten en Fragments, una representación optimizada para mejorar el rendimiento
  setupFragmentsManager(components, world)
  // Configura el sistema de selección y resaltado de elementos del modelo. Gracias a este módulo, cuando el usuario haga clic sobre un elemento del modelo, podrá resaltarse visualmente
  setupHighlighter(components, world)
  // Inicializa el sistema que permitirá localizar elementos del modelo, probablemente por propiedades, identificadores u otros criterios
  setupItemsFinder(components)
  // Inicializa el sistema que permite obtener datos de los elementos procedentes de fuentes de datos externas
  setupDataEnhancer(components)
  // Inicializa el sistema de las Smart Views
  setupSmartViews (components)

  // Hasta este momento hemos ido registrando distintos módulos en el contenedor components, pero aún no estaban completamente operativos
  // Con init() el sistema realiza la inicialización definitiva para que todos los componentes puedan empezar a trabajar conjuntamente, es decir, "se pone en marcha" el motor
  components.init()

  // En lugar de devolver absolutamente todo, esta función expone únicamente lo que la aplicación necesita para seguir trabajando:
    // components: para acceder al resto de servicios registrados.
    // viewport: para insertar el visor dentro de la interfaz.
  return { components, viewport }
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// Este es el proceso de inicialización del motor BIM en tu aplicación:

// setupComponents()
//         │
//         ▼
// new Components()
//         │
//         ▼
// createWorld()
//         │
//         ▼
// setupIfcLoader()
//         │
//         ▼
// setupFragmentsManager()
//         │
//         ▼
// setupHighlighter()
//         │
//         ▼
// setupItemsFinder()
//         │
//         ▼
// components.init()
//         │
//         ▼
// return { components, viewport }
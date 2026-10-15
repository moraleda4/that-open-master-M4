// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// viewport.ts define una plantilla (viewportContainerTemplate) cuya misión es:

  // 1. Recibir un Viewport ya creado.
  // 2. Insertarlo dentro de un contenedor HTML.
  // 3. Mostrar un mensaje alternativo si todavía no existe un viewport.

// Es un componente puramente de presentación.

// ======================================================
// OBSERVACIONES DEL DISEÑO DE LA APP
// ======================================================
// Este archivo representa muy bien la separación entre lógica y presentación que sigue tu proyecto:

  // create-world.ts crea el Viewport.
  // viewport.ts lo muestra.
  // Ninguno invade la responsabilidad del otro.

// Eso hace que el componente sea completamente reutilizable. Si en el futuro el Viewport cambiara (por ejemplo, otro tipo de visor o incluso un visor 2D),
// este contenedor seguiría funcionando siempre que reciba un objeto compatible con BUI.Viewport.

// ======================================================
// IMPORTACIONES
// ======================================================
// Solo necesita la librería de componentes de interfaz de That Open. Su única responsabilidad es construir parte de la interfaz
import * as BUI from "@thatopen/ui";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Recibe opcionalmente el viewport que se mostrará dentro del contenedor
// Eso significa que el componente puede crearse aunque todavía no exista un visor
// Esto tiene sentido porque, dependiendo del orden de inicialización, puede ocurrir que la interfaz se construya antes de que el World haya terminado de crear su Viewport
export interface ViewportContainerState {
  viewport?: BUI.Viewport;
}

// ======================================================
// COMPONENTE PRINCIPAL: viewportContainerTemplate
// ======================================================
// Se define un componente con estado. La diferencia es que aquí el estado contiene un Viewport en lugar de Components
// Plantilla encargada de alojar el viewport del visor BIM. Si todavía no existe un viewport disponible, muestra un mensaje informativo en su lugar
export const viewportContainerTemplate: BUI.StatefullComponent<ViewportContainerState> = (state) => {
  // Contenido que se mostrará dentro del contenedor. Normalmente será el viewport creado durante la inicialización
  let content: HTMLElement | undefined = state.viewport;
  // Si aún no existe un viewport, crea un componente alternativo con un mensaje para evitar que la interfaz quede vacía
  // "No viewer viewport has been defined": Este mensaje actúa como un fallback, es decir, un contenido de respaldo cuando no hay un viewport disponible
  if (!content) {
    content = BUI.Component.create(() => BUI.html`
        <bim-label>No viewer viewport has been defined.</bim-label>
      `,)
  }
  // Devuelve el contenedor principal con el contenido correspondiente. Content podrá ser o un viewport o un bim-label
  // El viewport generado en el archivo create-world.ts: const { world, viewport } = createWorld(components); es precisamente el que terminará llegando a este componente
  // Es decir, el motor BIM crea el visor y este componente simplemente decide dónde mostrarlo
  return BUI.html`<div class="viewport-container">${content}</div>`;
};

// ======================================================
// FLUJO COMPLETO
// ======================================================

// createWorld()
//       │
//       ▼
// Viewport
//       │
//       ▼
// ViewportContainerState
//       │
//       ▼
// viewportContainerTemplate
//       │
//       ▼
// <div class="viewport-container">
//     Viewport
// </div>

// Si el visor todavía no existe:
// ViewportContainerState
//       │
//       ▼
// viewport = undefined
//       │
//       ▼
// bim-label
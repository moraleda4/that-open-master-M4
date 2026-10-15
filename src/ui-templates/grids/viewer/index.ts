// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo define la distribución principal del visor dentro de la aplicación. 
// A diferencia de viewportGridTemplate, que organiza componentes flotantes sobre la escena 3D, 
// viewerGridTemplate organiza las distintas zonas de la interfaz (cabecera, barra lateral y contenido principal)

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
// Aquí solo estamos importando un tipo. No es un componente. No es un Grid. Es simplemente la definición tipada del Grid. Lo veremos cuando entremos en src
import { ViewerGrid } from "./src";
// Significa: El contenido principal del Viewer será otro Grid. Es decir, el Viewer contiene un Grid
import { componentsGridTemplate } from "../components";

export * from "./src";

// ======================================================
// COMPONENTE PRINCIPAL: viewerGridTemplate
// ======================================================
// (_) => significa: Esta función recibe un parámetro...pero no lo utiliza.
export const viewerGridTemplate = (_) => {
  const onCreated = (e?: Element) => {
    if (!e) return;
    const grid = e as ViewerGrid;

    // Está diciendo: ¿Qué componentes tiene este Grid? Header, Sidebar y ComponentsGrid
    grid.elements = {
      // Aquí de momento no existe nada
      header: {
        template: (_) => BUI.html`<div></div>`,
        initialState: {}
      },
      // Aquí de momento no existe nada
      sidebar: {
        template: (_) => BUI.html`<div></div>`,
        initialState: {}
      },
      // El contenido principal de la aplicación será otro componente
      componentsGrid: {
        template: componentsGridTemplate,
        initialState: {}
      }
    };

    grid.layouts = {
      Main: {
        // header header significa que el Header ocupa las dos columnas y auto: altura automática (lo que necesite)
        // sidebar componentsGrid: ahora aparecen dos columnas. 1fr: components ocupará todo el espacio restante
        // columnas: /auto 1fr --> Primera columna ancho automático. Segunda columna todo lo demás.
        template: `
          "header header" auto
          "sidebar componentsGrid" 1fr
          /auto 1fr
        `,
      },
    };

    // Resultado visual. Este Grid realmente dibuja esto:

    // ┌─────────────────────────────────────┐
    // │ Header                              │
    // ├───────────────┬─────────────────────┤
    // │ Sidebar       │                     │
    // │               │                     │
    // │               │ ComponentsGrid      │
    // │               │                     │
    // │               │                     │
    // └───────────────┴─────────────────────┘

    // Se activa el layout
    grid.layout = "Main";
  }

  // Este Grid no es flotante. No aparece: floating. Como ocurría antes. Eso significa que este Grid forma parte del layout normal de la aplicación
  return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="viewer-grid"></bim-grid>`
}

// Entonces...¿Dónde está el visor 3D? Curiosamente...en este archivo todavía no aparece. Lo único que sabemos es que existe una zona llamada:
  // ComponentsGrid
// Y dentro de esa zona se colocará otra cosa. Es decir, todavía seguimos descendiendo en la jerarquía.
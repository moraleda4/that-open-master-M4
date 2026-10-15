// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo no organiza el visor 3D, sino la interfaz flotante que se superpone sobre él. 
// Define qué componentes de la interfaz (toolbar, paneles, etc.) se muestran sobre el viewport y cómo se distribuyen mediante un Grid.
// No dibuja el visor, ni la toolbar, sino que decide dónde se colocan.
// viewportGridTemplate crea un Grid que organizará todos los elementos del visor.

// En este caso solo contiene un elemento:

// ┌───────────────────────────────┐
// │                               │
// │       (espacio visor)         │
// │                               │
// ├───────────────────────────────┤
// │        Viewer Toolbar         │
// └───────────────────────────────┘

// Más adelante podrían añadirse más componentes sin cambiar la filosofía del archivo.

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// Este archivo es un buen ejemplo de una arquitectura por composición.

// - viewerToolbarTemplate no sabe dónde se coloca.
// - viewportGridTemplate no sabe cómo funciona la toolbar.

// Simplemente une ambas piezas.

// Esa separación hace que cualquiera de las dos pueda reutilizarse en otro contexto
// Por ejemplo, podrías crear otro Grid distinto para una versión móvil o añadir nuevos paneles (árbol del modelo, propiedades, etc.) sin modificar el código de la toolbar
// Es una arquitectura muy modular y escalable, que es precisamente la filosofía que sigue That Open UI.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
// ¿Qué significa ".."? Hace referencia a la carpeta padre de grids, es decir: src/ui-templates/
  // Por tanto, TypeScript busca automáticamente: src/ui-templates/index.ts → export * from "./containers"; → containers/index.ts → export * from "./viewport-toolbar"
  // Aquí estaban definidos: export interface ViewerToolbarState { components: OBC.Components; } y export const viewerToolbarTemplate = ...
import {
  ViewerToolbarState,
  viewerToolbarTemplate,
} from "..";

// ======================================================
// TIPADO DEL GRID
// ======================================================
// ¿Qué es esto? No es un objeto. Es un tipo que describe cómo será un elemento del Grid
// name: "bottomToolbar". Ese nombre será el identificador del Grid
// ¿Por qué también tiene un estado? state: ViewerToolbarState. Porque cada componente del Grid necesita saber qué estado recibirá
type BottomToolbar = { name: "bottomToolbar"; state: ViewerToolbarState };

// ¿Por qué hay corchetes? No es un array normal. Es una tupla. Está diciendo: Este Grid contendrá exactamente estos tipos de elementos
// ¿Y si mañana hubiera más? Sería algo así: type ViewportGridElements = [LeftPanel, BottomToolbar, PropertiesPanel];
type ViewportGridElements = [BottomToolbar];

// Otra tupla. Esta vez define: ¿Qué layouts puede utilizar este Grid? Ahora mismo solo existe uno: main
// Pero podrían existir varios y cambiar entre ellos dinámicamente. Por ejemplo: desktop, mobile, fullscreen
type ViewportGridLayouts = ["main"];

// Aquí construimos el tipo definitivo
// ¿Qué significa? Le estamos diciendo a TypeScript: Este Grid: solo admite los layouts definidos antes; solo admite esos elementos. 
// Es una forma de hacer el Grid completamente tipado
export type ViewportGrid = BUI.Grid<ViewportGridLayouts, ViewportGridElements>

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El Grid únicamente necesita: components, porque tendrá que pasárselos a la toolbar
interface ViewportGridState {
  components: OBC.Components;
  world: OBC.World
}

// ======================================================
// COMPONENTE PRINCIPAL: viewportGridTemplate
// ======================================================
export const viewportGridTemplate: BUI.StatefullComponent<ViewportGridState> = (
  state,
) => {
  // Extraer componentes
  const { components, world } = state;

  // ¿Qué es elements? Es el objeto que describe: ¿Qué componentes contiene este Grid? Podemos imaginarlo como una lista de componentes.
  const elements: BUI.GridComponents<ViewportGridElements> = {
    // Aquí aparece el elemento que definimos antes. Tiene que llamarse exactamente igual
    bottomToolbar: {
      // Esta línea conecta directamente con el archivo anterior. Le estamos diciendo: Para el elemento llamado bottomToolbar, utiliza este componente
      template: viewerToolbarTemplate,
      // initialState es precisamente el objeto que recibirá la toolbar
      initialState: { components, world },
    },
  };

  // Visualmente:

    // ViewportGrid
    // ↓
    // bottomToolbar
    // ↓
    // viewerToolbarTemplate
    // ↓
    // state
    // ↓
    // components

  // Se ejecuta cuando el Grid ya existe
  const onCreated = (e?: Element) => {
    // Protección
    if (!e) return;
    // Casting. TypeScript solo sabe que es un: Element
    // Nosotros sabemos que realmente es: ViewportGrid
    const grid = e as ViewportGrid;
    // Ahora empieza la configuración del Grid. Aquí le entregamos al Grid la lista de componentes
    grid.elements = elements;

    // Aquí definimos los layouts disponibles: en este caso main
    // Un Layout es simplemente una distribución de los componentes existentes
    grid.layouts = {
      main: {
        // Esta sintaxis es muy parecida al CSS Grid. 
        // Existe una fila llamada empty que ocupa 1fr (todo el espacio disponible)
        // 2ª fila: La toolbar ocupará únicamente el espacio que necesite
        // /1fr define las columnas. Solo hay una, que ocupa todo el ancho
        template: `
          "empty" 1fr
          "bottomToolbar" auto
          /1fr
        `,
      },
    };

    //  Visualmente el Grid queda así.

    // ┌──────────────────────────────┐
    // │                              │
    // │            empty             │
    // │                              │
    // │          (1fr)               │
    // ├──────────────────────────────┤
    // │        bottomToolbar         │
    // │            auto              │
    // └──────────────────────────────┘
    
    // ¿Por qué existe "empty"? Porque el visor 3D no forma parte del Grid. Recordemos create-world.ts. Allí hacíamos:
      // <bim-viewport>
      //     ${viewportGrid}
      // </bim-viewport>
    // El visor ya ocupa todo el fondo. El Grid es: floating y se dibuja encima. Es como una hoja transparente encima del visor.
    // Por eso la primera fila simplemente deja espacio libre. Y la toolbar se superpone en la parte inferior

    // Aquí activamos el layout. Si existieran: desktop, mobile, fullscreen...podríamos cambiar entre ellos.
    grid.layout = "main"
  };

  // <bim-grid> es otro Web Component de That Open. Será el contenedor del layout
  // floating: este atributo indica que el Grid será flotante, ess decir, no reemplaza al visor. Se dibuja encima.

  // Visualmente:

  // ┌───────────────────────────┐
  // │                           │
  // │       Viewport 3D         │
  // │                           │
  // │                           │
  // │───────────────────────────│
  // │      Toolbar flotante     │
  // └───────────────────────────┘

  // class: Simplemente añade una clase CSS
  // BUI.ref(onCreated): Cuando el Grid termina de construirse, ejecuta onCreated(grid) y configura elementos; layouts; layout activo.
  return BUI.html`<bim-grid floating class="viewport-grid" ${BUI.ref(onCreated)}></bim-grid>`;
};

// ======================================================
// FLUJO COMPLETO
// ======================================================

// viewportGridTemplate()
// ↓
// Crear Grid
// ↓
// Crear viewerToolbarTemplate
// ↓
// Asignar elementos
// ↓
// Definir layout
// ↓
// Activar layout
// ↓
// Mostrar Grid

// ======================================================
// RELACIÓN CON createWorld()
// ======================================================
// const [viewportGrid] =
// BUI.Component.create(
//     viewportGridTemplate,
//     {
//         components,
//     }
// );

// return BUI.html`
// <bim-viewport>
//     ${viewportGrid}
// </bim-viewport>
// `;

// El resultado final es aproximadamente este:

// bim-viewport
// │
// ├────────────── Viewport 3D ───────────────┐
// │                                          │
// │                                          │
// │          Escena Three.js                 │
// │                                          │
// │                                          │
// ├──────────────────────────────────────────┤
// │      bim-grid (floating)                 │
// │              │                           │
// │              ▼                           │
// │      viewerToolbarTemplate               │
// └──────────────────────────────────────────┘


// ======================================================
// ARQUITECTURA GENERAL
// ======================================================

// createWorld()
// │
// ▼
// bim-viewport                     ← Visor 3D (Three.js)
// │
// ├────────────────────────────────────────────┐
// │                                            │
// │ viewportGridTemplate (overlay flotante)    │
// │                                            │
// │      └── ViewerToolbar                     │
// │                                            │
// └────────────────────────────────────────────┘
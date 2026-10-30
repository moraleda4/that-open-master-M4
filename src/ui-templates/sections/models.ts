// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define el panel "Models" que aparece en la parte izquierda de la interfaz.
// Su misión es proporcionar una interfaz para gestionar los modelos cargados en la aplicación.

// El panel está formado por:
  // - Un buscador.
  // - Un botón para cargar modelos IFC o FRAG.
  // - Una tabla con los modelos cargados.

// No implementa la lógica de carga de modelos. Esa responsabilidad pertenece a loadModelBtnTemplate.

// Tampoco implementa la tabla. Utiliza el componente modelsList proporcionado por @thatopen/ui-obc.

// ======================================================
// OBSERVACIONES DEL DISEÑO
// ======================================================
// Este archivo demuestra muy bien una característica de la arquitectura de That Open: la mayoría de la funcionalidad ya viene encapsulada en componentes especializados.

// El panel no sabe cómo buscar modelos, cómo dibujar una tabla o cómo cargar un IFC. Simplemente conecta piezas ya existentes:

// - modelsList se encarga de mostrar y filtrar los modelos.
// - loadModelBtnTemplate se encarga de la carga de archivos.
// - El panel únicamente organiza ambos componentes y gestiona la interacción entre ellos.

// Es un buen ejemplo de composición: cada componente tiene una responsabilidad muy concreta y el panel se limita a coordinarlos sin duplicar lógica.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
// ¿Qué es @thatopen/ui-obc? Componentes visuales especializados en BIM. Por ejemplo:
  // tablas de modelos,
  // tablas de propiedades,
  // árboles IFC,
  // etc.
// Es decir, ya no son controles genéricos. Son widgets pensados específicamente para trabajar con Components.
import * as CUI from "@thatopen/ui-obc"
import { loadModelBtnTemplate } from "../buttons";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El panel solo necesita acceso a los componentes BIM.
export interface ModelsPanelState {
  components: OBC.Components;
}

// ======================================================
// COMPONENTE PRINCIPAL: modelsPanelTemplate
// ======================================================
export const modelsPanelTemplate: BUI.StatefullComponent<
  ModelsPanelState
> = (state) => {
  const { components } = state;

  // ¿Qué devuelve? No crea una tabla HTML. Crea un componente de That Open. Podemos imaginar: Models Table, ya completamente implementada con:
    // filas,
    // columnas,
    // selección,
    // ordenación,
    // etc.
  // ¿Por qué recibe components? Porque esa tabla sabe consultar automáticamente: FragmentsManager --> Modelos cargados
  // No tenemos que escribir: for(...), ni recorrer listas. La propia librería lo hace.
  // Visualmente:
    // Components
    // ↓
    // modelsList()
    // ↓
    // Tabla de modelos
  const [modelsList] = CUI.tables.modelsList({
    components,
  });

  modelsList.addEventListener("cellcreated", (event) => {
    const cell = (event as CustomEvent<{ cell: HTMLElement }>).detail.cell;

    cell.querySelectorAll<HTMLElement>("bim-button").forEach((button) => {
      button.style.setProperty("--bim-label--c", "#fff");
    });

    cell.querySelectorAll<HTMLElement>("bim-label").forEach((label) => {
      label.style.setProperty("--bim-label--c", "#fff");
    });
  });

  const missingDataLabel = modelsList.querySelector(
    'bim-label[slot="missing-data"]',
  ) as BUI.Label | null;

  missingDataLabel?.style.setProperty(
    "--bim-label--c",
    "var(--bim-ui_bg-contrast-60)",
  );

  // Aquí simplemente reutilizamos un componente que ya conocíamos. Es exactamente el botón: Load IFC y Load FRAG
  const [loadModelsBtn] = BUI.Component.create(loadModelBtnTemplate, { components })
  // Le estamos diciendo: El botón tendrá únicamente el tamaño que necesite. Así el buscador ocupa casi todo el ancho. Y el botón mantiene un tamaño fijo.
  
  // Sin:
  // [Buscar.................][Botón enorme]

  // Con:
  // [Buscar.........................][+]
  loadModelsBtn.style.flex = "0"

  // ¿Qué hace? No buscamos nosotros. No recorremos filas. No filtramos arrays. Simplemente cambiamos: queryString
  // Y la propia tabla hace el filtrado.

  // Visualmente:

    // Usuario
    // ↓
    // Escribe
    // ↓
    // queryString cambia
    // ↓
    // Tabla se filtra
  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    modelsList.queryString = input.value;
  };

  // bim-panel-section: crea un panel, con el título "Models List"
  // Contenedor superior: div, que contiene: Buscador (bim-text-input) y Botón cargar
  // @input=${onSearch}: Cada vez que escribimos, se actualiza queryString
  // ${loadModelsBtn} inserta el botón
  // ${modelsList} inserta la tabla

  // Resultado visual:
  // ┌───────────────────────────────┐
  // │ Models List                   │
  // │                               │
  // │ [Buscar.............] [+]     │
  // │                               │
  // ├───────────────────────────────┤
  // │ Modelo A                      │
  // │ Modelo B                      │
  // │ Modelo C                      │
  // │ ...                           │
  // └───────────────────────────────┘
  return BUI.html`
  <bim-panel-section fixed label="Models List">
    <div style="display: flex; gap: 0.5rem;">
      <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
      ${loadModelsBtn}
    </div>
    ${modelsList}
  </bim-panel-section>`;
};

// ======================================================
// RELACIÓN CON LA ARQUITECTURA
// ======================================================
// Models Panel
// │
// ├────────────── Search
// │                    │
// │                    ▼
// │              modelsList.queryString
// │
// ├────────────── Load Button
// │                    │
// │                    ▼
// │          loadModelBtnTemplate
// │                    │
// │         IFC / FRAG Loader
// │
// └────────────── Models List
//                      │
//                      ▼
//           CUI.tables.modelsList
//                      │
//                      ▼
//              Components
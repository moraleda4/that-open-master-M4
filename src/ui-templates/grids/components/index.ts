// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define el contenido principal del Viewer.
//
// Si viewerGridTemplate dividía la aplicación en grandes zonas (Header, Sidebar y ComponentsGrid), este archivo divide la zona ComponentsGrid en componentes BIM:
// - Viewport
// - Panel de modelos
// - Panel de consultas
// - Panel de información

// Es decir, este Grid organiza el espacio de trabajo principal de la aplicación.

// Es el archivo donde aparecen todos los componentes funcionales de la aplicación:
  // el visor,
  // el panel de modelos,
  // el panel de consultas,
  // el panel de información.

// Hasta ahora solo habíamos visto "contenedores". Aquí ya aparece el espacio de trabajo BIM propiamente dicho.

// ======================================================
// OBSERVACIONES DEL DISEÑO DE LA APP
// ======================================================
// Si miras los tres Grid que hemos estudiado:

  // viewportGridTemplate
  // viewerGridTemplate
  // componentsGridTemplate

// verás que todos siguen exactamente el mismo patrón:

  // Crear Grid
  //         │
  //         ▼
  // Definir elementos
  //         │
  //         ▼
  // Definir layouts
  //         │
  //         ▼
  // Activar uno de los layouts

// Es decir, That Open UI utiliza siempre el mismo ciclo de construcción para cualquier Grid, independientemente de si organiza una toolbar flotante, 
// una ventana principal o el área de trabajo BIM. Una vez entiendes este patrón, los siguientes archivos de Grid del proyecto se vuelven mucho 
// más fáciles de leer porque todos responden a la misma estructura.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";
import { itemsDataPanelTemplate, modelsPanelTemplate, queriesPanelTemplate, dataSourcesPanelTemplate, smartViewsPanelTemplate } from "../../sections";
import * as OBC from "@thatopen/components"
import { appIcons } from "../../../globals";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// En este caso aparece Components y también Viewport, ya que este Grid sí necesita colocar el visor
interface ComponentsGridState {
  components: OBC.Components
  viewport?: BUI.Viewport
  onSmartViewsChange: () => Promise<void>
}

// ======================================================
// COMPONENTE PRINCIPAL: componentsGridTemplate
// ======================================================
export const componentsGridTemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {
  const { components, viewport } = state
  const onCreated = (e?: Element) => {
    if (!e) return;
    const grid = e as ComponentsGrid;

    grid.elements = {
      viewport: {
        // El Grid no coloca directamente el visor. Coloca un contenedor. Y ese contenedor contiene el visor
        template: viewportContainerTemplate,
        initialState: { viewport },
      },
      itemsData: {
        template: itemsDataPanelTemplate,
        initialState: { components }
      },
      models: {
        template: modelsPanelTemplate,
        initialState: { components }
      },
      queries: {
        template: queriesPanelTemplate,
        initialState: { components }
      },
      dataSources: {
        template: dataSourcesPanelTemplate,
        initialState: { components }
      },
      smartViews: {
        template: smartViewsPanelTemplate,
        initialState: {
          components,
          onSmartViewsChange: state.onSmartViewsChange,
      },
    }
  };
  
    grid.layouts = {
      Models: {
        // 1ª fila:
        // ┌──────────────┬──────────────┬──────────────┐
        // │ Models       │ Viewport     │ ItemsData    │
        // └──────────────┴──────────────┴──────────────┘
        // 2ª fila:
        // ┌──────────────┬──────────────┬──────────────┐
        // │ queries      │ Viewport     │DataSources   │
        // └──────────────┴──────────────┴──────────────┘
        // ¿Qué significa repetir un nombre? Que ocupa ambas filas
        // Visualmente:
        // ┌──────────────┬────────────────────┬──────────────┐
        // │ Models       │                    │ ItemsData    │
        // │              │                    │              │
        // ├──────────────┤      Viewport      ├──────────────┤
        // │ Queries      │                    │DataSources   │
        // │              │                    │              │
        // └──────────────┴────────────────────┴──────────────┘
        icon: appIcons.MODELS,
        // Columnas: /22rem 1fr 22rem
        // Izquierda: 22 rem, Centro: todo el espacio restante, Derecha: 22 rem
        template: `
          "models viewport itemsData" 1fr
          "queries viewport dataSources" 1fr
          /22rem 1fr 22rem
        `,
      },
      SmartViews: {
        icon: appIcons.QUERIES,
        template: `
          "viewport smartViews" 1fr
          "viewport queries" 1fr
          /1fr 22rem
        `,
      },
      Viewer: {
        icon: appIcons.VIEWER,
        template: `
          "viewport" 1fr
          /1fr
        `,
      },
    };

    grid.layout = "Models"
  }
  return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`
}
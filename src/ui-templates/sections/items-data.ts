// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// A diferencia de models.ts y queries.ts, este archivo ya no trabaja con listas, sino con la selección activa del visor.
// Es decir, este panel es el que responde a la pregunta: ¿Qué información tienen los elementos que tengo seleccionados ahora mismo?
// Y aquí se conecta directamente con el Highlighter, que configuraste al principio del proyecto.

// Este archivo define el panel "Selection Data". Su función es mostrar las propiedades BIM de los elementos actualmente seleccionados en el visor.
// El panel no obtiene directamente las propiedades del modelo. En su lugar:
// - Consulta al Highlighter qué elementos están seleccionados.
// - Utiliza el componente itemsData de @thatopen/ui-obc para mostrar automáticamente sus propiedades.

// Además:
//
// - Limpia la tabla cuando se elimina la selección.
// - Permite refrescar manualmente la información mediante
//   un botón.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
// Componente especializado de That Open UI-OBC para mostrar propiedades BIM
import * as CUI from "@thatopen/ui-obc"
import * as OBF from "@thatopen/components-front"
// Simplemente proporciona el icono del botón de refresco
import { appIcons } from "../../globals";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Solo necesita acceder a los Components
export interface ItemsDataPanelState {
  components: OBC.Components;
}

// ======================================================
// COMPONENTE PRINCIPAL: itemsDataPanelTemplate
// ======================================================
export const itemsDataPanelTemplate: BUI.StatefullComponent<
  ItemsDataPanelState
> = (state) => {
  const { components } = state;

  // Recordemos que en setupHighlighter() configurábamos: highlighter.setup({ world })
  // Desde ese momento el Highlighter mantiene siempre información sobre: Elemento seleccionado --> Selección actual --> Eventos de selección
  // Este panel aprovechará precisamente esa información.
  const highlighter = components.get(OBF.Highlighter)

  // Crear la tabla de propiedades
  // ¿Qué devuelve? No devuelve solo una tabla. Devuelve dos cosas:

    // itemsData()
    // ↓
    // propsTable
    // ↓
    // Componente visual
  // ------------------------
    // updatePropsTable()
    // ↓
    // Función para actualizar su contenido

  const [propsTable, updatePropsTable] = CUI.tables.itemsData({
    components,
    // ¿Por qué empieza vacío? Porque cuando se abre la aplicación: No hay ningún elemento seleccionado. Por tanto la tabla no tiene nada que mostrar.
    modelIdMap: {},
  });

  // LECCIÓN 4.5: poder copiar los valores de la columna values al hacer click
  propsTable.dataTransform.Value = (value) => {
    const onClick = ({ target }: { target: BUI.Label }) => {
      navigator.clipboard.writeText(value)
      target.textContent = "Copied!"
      setTimeout(() => {
        target.textContent = value
      }, 500)
    }

    const onMouseOver = ({ target }: { target: BUI.Label }) => {
      target.style.color = "var(--primary)"
    }

    const onMouseLeave = ({ target }: { target: BUI.Label }) => {
      target.style.removeProperty("color")
    }
    
    return BUI.html`
      <bim-label @click=${onClick} @mouseleave=${onMouseLeave} @mouseover=${onMouseOver}>${value}</bim-label>
    `
  }

  // Escuchar cuándo se limpia la selección
  // ¿Qué significa? El Highlighter dispone de distintos eventos. Uno de ellos es: onClear, que ocurre cuando:
    // Usuario
    // ↓
    // Deselecciona todo
  // ¿Qué hacemos?
    // updatePropsTable({
    //     modelIdMap: {}
    // })
  // Es decir:
  // No hay selección
  // ↓
  // Vaciar tabla
  highlighter.events.select.onClear.add(() => {
    updatePropsTable({modelIdMap: {}})
  })

  // Botón Refresh: aquí sí se actualizan las propiedades.
  const onRefresh = () => {
    // Recuperamos la selección actual
    const selection = highlighter.selection.select
    // Si no hay selección, no hacemos nada
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return
    // No buscamos propiedades. No recorremos entidades IFC. No hacemos consultas. Simplemente entregamos: ModelIdMap
    // Y el componente: itemsData se encarga de:
      // buscar los elementos,
      // leer sus propiedades,
      // construir la tabla.
    updatePropsTable({modelIdMap: selection})
  }

  // Resultado visual:
  // ┌───────────────────────────────┐
  // │ Selection Data                │
  // │                               │
  // │ [↻]                           │
  // │                               │
  // ├───────────────────────────────┤
  // │ Name          Wall_001        │
  // │ Height        3.20            │
  // │ Width         0.20            │
  // │ Fire Rating   EI120           │
  // │ ...                           │
  // └───────────────────────────────┘
  return BUI.html`<bim-panel-section fixed label="Selection Data">
    <div style="display: flex; gap: 0.5rem;">
      <bim-button style="flex: 0" icon=${appIcons.REFRESH} @click=${onRefresh}></bim-button>
    </div>
    ${propsTable}
  </bim-panel-section>`;
};

// ======================================================
// RELACIÓN CON ARQUITECTURA
// ======================================================
// Usuario
// ↓
// Selecciona elemento
// ↓
// Highlighter
// ↓
// selection
// ↓
// updatePropsTable()
// ↓
// itemsData()
// ↓
// Tabla de propiedades


// setupHighlighter()
//         │
//         ▼
// Highlighter
//         │
//         ├──────── viewerToolbar
//         │            │
//         │            ├── Hide
//         │            ├── Isolate
//         │            ├── Colorize
//         │            └── Reset
//         │
//         └──────── itemsDataPanel
//                      │
//                      ▼
//               Tabla de propiedades

// Es decir, el Highlighter ya no sirve únicamente para colorear elementos. También es el componente que mantiene la selección activa utilizada por otras partes de la aplicación.
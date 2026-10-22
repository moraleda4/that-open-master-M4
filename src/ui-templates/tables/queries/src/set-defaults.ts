// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo configura el comportamiento por defecto de la tabla de consultas (Queries List).

// No crea la tabla ni la rellena con datos. Su misión es:
  // • Configurar su aspecto visual.
  // • Definir las columnas.
  // • Personalizar el contenido de la columna "Actions".
  // • Añadir acciones para ejecutar consultas y colorear sus resultados.

// Es el archivo que convierte una tabla estática en una interfaz interactiva conectada con el motor BIM.

// Aquí aparecen dos protagonistas:

// ItemsFinder → para recuperar la consulta.
// Highlighter → para seleccionar resultados y aplicarles colores.
// SmartViews → para guardar el color asociado a la consulta.

// ======================================================
// OBSERVACIONES DEL DISEÑO
// ======================================================
// Este archivo refleja muy bien el principio de separación entre datos y presentación.

// En template.ts, la columna Actions contiene simplemente un valor vacío (""). A primera vista puede parecer innecesario, 
//pero permite que la tabla mantenga una estructura de datos simple y uniforme. 
// Después, setDefaults.ts utiliza dataTransform para decidir cómo debe representarse visualmente esa columna.

// Gracias a este enfoque:
  // Los datos siguen siendo independientes de la interfaz.
  // El aspecto visual puede cambiar sin modificar la estructura de las filas.
  // Es posible reemplazar fácilmente el botón por un menú contextual, varios botones o cualquier otro componente sin tocar template.ts.

// Es un patrón muy habitual en componentes de tablas avanzadas y hace que la implementación sea mucho más flexible y mantenible.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as THREE from "three"
import { createColorPicker } from "../../../containers/color-picker";

// Importamos los tipos del componente
import { QueriesListState, QueriesListTableData } from "./types";
// Únicamente proporciona el icono del botón
import { appIcons } from "../../../../globals";
import { SmartViews } from "../../../../bim-components/SmartViews";

// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================
// Esta función recibe dos cosas y las conecta: Estado --> Components + Tabla
export const setDefaults = (
  state: QueriesListState,
  table: BUI.Table<QueriesListTableData>,
) => {
  // Obtener Components
  const { components } = state

  // Configuración visual:
  // Por defecto muchas tablas de That Open permiten mostrar datos jerárquicos. Algo así:
    // ▶ Building
    //     ▶ Storey
    //         ▶ Wall
  // Como aquí no existe ninguna jerarquía: lo desactivamos
  table.noIndentation = true
  // Ocultar encabezados: en lugar de mostrar: Name | Actions --> el panel mostrará únicamente las filas
  table.headersHidden = true
  // Estamos diciendo que la tabla tendrá 2 columnas: Nombre y Acciones
  // auto solo significa que tomará el valor más bajo posible para abarcar el contenido... los botones en este caso.
  // Visualmente:
    // Walls                  [▶]

    // En lugar de:
    // Walls        [          ▶          ]
  table.columns = ["Name", {name: "Actions", width: "auto"}] 
  // ¿Qué hace table.dataTransform? Permite transformar una celda antes de mostrarla. Es decir, en los datos: Actions --> ""
  // Pero visualmente queremos: [▶]
  table.dataTransform = {
    // La función recibe 2 cosas: valor original + fila completa
    Actions: (cellValue, rowData) => {
      // Recuperar Name. ¿Por qué? Porque necesitamos saber: ¿Qué consulta representa esta fila?
      const { Name } = rowData
      // Protección: Si por alguna razón la fila no tiene nombre --> No hacemos nada.
      if (!Name) return cellValue

      // Recuperar ItemsFinder
      const finder = components.get(OBC.ItemsFinder)
      // Recuperar la consulta
      const query = finder.list.get(Name)
      // Protección: Si la consulta no existe --> Devolver el contenido original.
      if (!query) return cellValue

      const onClick = async ({ target: button }: { target: BUI.Button }) => {
        button.loading = true;

        try {
          const items = await query.test();

          // Evita que Select falle sin dar pistas
          if (OBC.ModelIdMapUtils.isEmpty(items)) {
            console.warn(`The query "${Name}" returned no items.`);
            return;
          }

          const highlighter = components.get(OBF.Highlighter);
          await highlighter.highlightByID("select", items);
        } finally {
          button.loading = false;
        }
      };

      const applyColorToQuery = async (color: string) => {
        const items = await query.test();

        // Evita que Select falle sin dar pistas
        if (OBC.ModelIdMapUtils.isEmpty(items)) {
          console.warn(`The query "${Name}" returned no items.`);
          return;
        }

        const highlighter = components.get(OBF.Highlighter);

        if (!highlighter.styles.has(color)) {
          highlighter.styles.set(color, {
            color: new THREE.Color(color),
            renderedFaces: 1,
            opacity: 1,
            transparent: false,
          });
        }
    
        await highlighter.highlightByID(color, items, false, false);
        await highlighter.clear("select");

        const smartViews = components.get(SmartViews);
        smartViews.addQueryColor(color, Name);
    
      }

      // Devolver los botones: uno ejecuta la consulta y el otro abre el menú de acciones
      return BUI.html`
      <bim-button style="flex: 0;" icon=${appIcons.SELECT} @click=${onClick}></bim-button>
      <bim-button style="flex: 0;" icon=${appIcons.CONTEXT}>
        <bim-context-menu>
           <bim-button style="flex: 0;" icon=${appIcons.COLORIZE} label="Colorize">
              <bim-context-menu>
                ${createColorPicker({ onApply: applyColorToQuery })}
              </bim-context-menu>
           </bim-button>
        </bim-context-menu>
      </bim-button>
      `
    }
  }
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// ItemsFinder
// ↓
// Lista de consultas
// ↓
// template.ts crea las filas
// ↓
// setDefaults() añade las acciones
// ↓
// ┌─────────────────────────┬────────────────────────────┐
// │ Botón Select            │ Menú Colorize              │
// ↓                         ↓
// query.test()              createColorPicker()
// ↓                         ↓
// ModelIdMap                 Usuario elige un color
// ↓                         ↓
// Highlighter                applyColorToQuery(color)
// ↓                         ↓
// Resaltar resultados        query.test()
//                           ↓
//                           Aplicar color con Highlighter
//                           ↓
//                           Guardar color en SmartViews

// ======================================================
// RELACIÓN CON TODO EL PROYECTO
// ======================================================
// setupItemsFinder()
//         │
//         ▼
// ItemsFinder
//         │
//         ▼
// Queries List
//         │
//         ▼
// setDefaults()
//         │
//         ├── Select
//         │     └── query.test() → Highlighter → Resultados seleccionados
//         │
//         └── Colorize
//               └── createColorPicker()
//                     └── query.test() → Highlighter → SmartViews
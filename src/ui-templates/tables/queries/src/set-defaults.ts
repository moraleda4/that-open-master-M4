// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo configura el comportamiento por defecto de la tabla de consultas (Queries List).

// No crea la tabla ni la rellena con datos. Su misión es:
  // • Configurar su aspecto visual.
  // • Definir las columnas.
  // • Personalizar el contenido de la columna "Actions".
  // • Asociar a cada fila un botón capaz de ejecutar la consulta correspondiente.

// Es el archivo que convierte una tabla estática en una interfaz interactiva conectada con el motor BIM.

// Aquí aparecen dos protagonistas:

// ItemsFinder → para recuperar la consulta.
// Highlighter → para resaltar los resultados.

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
// Importamos los tipos del componente
import { QueriesListState, QueriesListTableData } from "./types";
// Únicamente proporciona el icono del botón
import { appIcons } from "../../../../globals";

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

      // Este botón ejecutará la consulta
      const onClick = async ({target: button}: {target: BUI.Button}) => {
        // Activar loading
        button.loading = true
        // Ejecutar la consulta. ¿Qué hace? Ejecuta la consulta BIM. Por ejemplo. Si la consulta es: External Walls buscará --> Todos los muros exteriores
        const items = await query.test()
        // Obtener Highlighter
        const highligher = components.get(OBF.Highlighter)
        // Resaltar resultados
        // La consulta devuelve: items --> ModelIdMap
        // Y el Highlighter sabe trabajar precisamente con ese tipo: Resultado --> Todos los elementos encontrados aparecen seleccionados en el visor
        // Visualmente:

          // Usuario
          // ↓
          // Pulsa botón
          // ↓
          // Query.test()
          // ↓
          // Items
          // ↓
          // Highlighter
          // ↓
          // Selección

        await highligher.highlightByID("select", items)
        // Desactivar loading
        button.loading = false
      }

      // Devolver el botón: aquí sustituimos el texto vacío por un botón
      return BUI.html`<bim-button style="flex: 0;" icon=${appIcons.SELECT} @click=${onClick}></bim-button>`
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
// template.ts
// ↓
// Filas
// ↓
// setDefaults()
// ↓
// Botón
// ↓
// Usuario pulsa
// ↓
// query.test()
// ↓
// ModelIdMap
// ↓
// Highlighter
// ↓
// Elementos seleccionados

// ======================================================
// RELACIÓN CON TODO EL PROYECTO
// ======================================================
//  setupItemsFinder()
//         │
//         ▼
//  finder.create()
//         │
//         ▼
//    ItemsFinder
//         │
//         ▼
//    Queries List
//         │
//         ▼
//       Botón
//         │
//         ▼
//    query.test()
//         │
//         ▼
//    ModelIdMap
//         │
//         ▼
//    Highlighter
//         │
//         ▼
//     Viewport

// Es decir, todo empieza en: finder.create(...) y termina con el usuario viendo los resultados resaltados en el visor.
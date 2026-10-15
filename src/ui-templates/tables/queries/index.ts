// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo actúa como el punto de entrada de la tabla de consultas (Queries List).

// Su función no es dibujar la tabla. En realidad coordina tres responsabilidades:
  // • Crear la tabla mediante queriesListTemplate.
  // • Configurar sus valores por defecto.
  // • Mantenerla sincronizada con el ItemsFinder.

// Gracias a ello, cualquier cambio realizado sobre las consultas BIM (crear, modificar o eliminar queries) se refleja automáticamente en la interfaz.

// ======================================================
// OBSERVACIONES DEL DISEÑO
// ======================================================
// Creo que este archivo refleja muy bien un principio de diseño que se repite en todo el proyecto: 
// separar la creación del componente de su configuración y de la sincronización con los datos.

// Cada responsabilidad está aislada:
  // queriesListTemplate se ocupa únicamente de construir la tabla.
  // setDefaults configura su comportamiento inicial (columnas, estilos, opciones, etc.).
  // index.ts coordina el conjunto y mantiene la tabla sincronizada con el ItemsFinder.

// Esta división hace que el código sea mucho más fácil de mantener. 
// Si mañana quieres cambiar el aspecto visual de la tabla, modificarás template.ts; 
// si quieres cambiar su configuración por defecto, tocarás set-defaults.ts;
// y si cambian los eventos del ItemsFinder, solo tendrás que revisar este index.ts.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
// Define los tipos
import { QueriesListState, QueriesListTableData } from "./src/types";
// Construye la tabla
import { queriesListTemplate } from "./src/template";
// Configura su comportamiento inicial
import { setDefaults } from "./src/set-defaults";

// ======================================================
// COMPONENTE PRINCIPAL: queriesList
// ======================================================
// Esta función no devuelve datos. Construye un componente
export const queriesList = (state: QueriesListState) => {
  // Crear el componente
  // BUI.Table<QueriesListTableData>: Le estamos diciendo:Esta tabla contendrá filas del tipo QueriesListTableData. Ese tipo lo veremos en types.ts
  // QueriesListState es simplemente el estado que recibirá el componente
  const component = BUI.Component.create<BUI.Table<QueriesListTableData>, QueriesListState>(queriesListTemplate, state);

  // Desectructuración: Aquí ocurre algo parecido a React. El componente devuelve: Tabla + Función para actualizarla
  const [table, updateTable] = component;

  // Valores por defecto: Esta línea delega completamente la configuración inicial. 
  // Es decir, en lugar de llenar este archivo de código, el autor ha decidido separar esa responsabilidad.
  setDefaults(state, table)

  // Obtener ItemsFinder
  const { components } = state;
  const finder = components.get(OBC.ItemsFinder);
  // Crear función de actualización
  const updateFunction = () => updateTable();
  // Se dispara cuando aparece una nueva consulta --> Actualizar tabla
  finder.list.onItemSet.add(updateFunction);
  // Se dispara cuando una consulta cambia --> Actualizar tabla
  finder.list.onItemUpdated.add(updateFunction);
   // Se dispara cuando se elimina --> Actualizar tabla
  finder.list.onItemDeleted.add(updateFunction);
   // Se dispara cuando desaparecen todas --> Actualizar tabla
  finder.list.onCleared.add(updateFunction);

  // Simplemente devuelve: Tabla + Función update
  return component
};

// ======================================================
// FLUJO COMPLETO
// ======================================================
// ItemsFinder
// │
// ├── Nueva Query
// ├── Query modificada
// ├── Query eliminada
// └── Todas eliminadas
//         │
//         ▼
// updateTable()
//         │
//         ▼
// Queries List

// Es decir, la tabla siempre permanece sincronizada con el ItemsFinder.

// ======================================================
// RELACIÓN CON TODA LA ARQUITECTURA
// ======================================================
// setupItemsFinder()
// ↓
// ItemsFinder
// ↓
// Queries List
// ↓
// Queries Panel
// ↓
// ComponentsGrid
// ↓
// ViewerGrid
// ↓
// Aplicación
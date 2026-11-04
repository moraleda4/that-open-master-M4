// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define la plantilla (template) de la tabla de consultas (Queries List).

// Su función es construir el componente <bim-table> y rellenarlo con todas las consultas registradas en el ItemsFinder.

// No configura el comportamiento de la tabla. No define sus columnas por defecto. No la mantiene sincronizada.
// Esas responsabilidades pertenecen a:
  // • set-defaults.ts
  // • index.ts 

// Este archivo únicamente transforma las consultas del ItemsFinder en filas de la tabla.

// ======================================================
// OBSERVACIONES DEL DISEÑO
// ======================================================
// Fíjate que aquí no aparece ninguna lógica de búsqueda. Tampoco aparece: queryString
// ¿Por qué? Porque eso lo hacía: queries.ts
// Es decir, cada archivo sigue teniendo una responsabilidad muy concreta.

// Hay una decisión de diseño que me parece especialmente acertada: este archivo no sabe nada sobre cómo se utilizan las consultas.
// Su única responsabilidad es transformar los datos del ItemsFinder en filas de una tabla. 
// No decide cómo se muestran las columnas, qué ocurre al pulsar un botón o cómo se ejecuta una consulta.
// Esa lógica está delegada en otros archivos (set-defaults.ts e index.ts).
// Gracias a esta separación, si mañana cambias la forma en que se renderiza la tabla (por ejemplo, añadiendo más columnas o modificando el aspecto visual), 
// solo tendrás que tocar template.ts. En cambio, si cambia el comportamiento de las acciones o la configuración de la tabla, 
// modificarás otros archivos sin afectar a esta plantilla.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
// Estado del componente y Estructura de cada fila de la tabla
import { QueriesListState, QueriesListTableData } from "./types";

// ======================================================
// COMPONENTE PRINCIPAL: queriesListTemplate
// ======================================================
export const queriesListTemplate: BUI.StatefullComponent<QueriesListState> = (state) => {
  // Obtener Components
  const { components } = state;

  // Obtener el ItemsFinder:

    // setupItemsFinder()
    // ↓
    // finder.create()
    // ↓
    // ItemsFinder
    // ↓
    // queriesListTemplate()
  // Es decir, la tabla leerá directamente las consultas almacenadas en el ItemsFinder.
  const finder = components.get(OBC.ItemsFinder);

  const onCreated = (e?: Element) => {
    // Protección habitual
    if (!e) return;
    // Casting
    const table = e as BUI.Table<QueriesListTableData>;
    // ¿Qué significa? Estamos creando el array que contendrá todas las filas. Pero, en lugar de escribir: const data = []; hacemos: typeof table.data
    // ¿Por qué? Porque así TypeScript deduce automáticamente el tipo correcto. Es decir, si mañana cambia la definición interna de table.data, esta línea seguirá siendo válida.
    const data: typeof table.data = [];
    // Recorrer el ItemsFinder
      // ¿Por qué [name]? Porque realmente estamos iterando un Map. Cada elemento tiene la forma: [name, query]
      // Aquí solo necesitamos: name
    for (const [name] of finder.list) {
      // Crear una fila: cada consulta genera una fila
      data.push({
        // Aquí aparece la información de esa fila
        data: {
          Name: name,
          // ¿Por qué está vacía? Porque este archivo solo construye los datos. Más adelante: set-defaults.ts probablemente reemplazará esa columna por botones.
          // Es decir, ahora mismo: Actions --> "" es solo un marcador de posición.
          Actions: "",
        },
      });
    }

    // La tabla recibe todas las filas. Y automáticamente se renderiza.
    table.data = data;
  };

  // No hay columnas. No hay estilos. No hay botones. Solo se crea el componente. Y cuando existe --> onCreated --> rellenar datos
  return BUI.html`
   <bim-table style="width: 100%; height: fit-content; max-height: 18rem; flex: 0 0 auto;" ${BUI.ref(onCreated)}>
  `;
};

// ======================================================
// FLUJO COMPLETO
// ======================================================
// ItemsFinder
// ↓
// Map de consultas
// ↓
// for (...)
// ↓
// Crear filas
// ↓
// table.data
// ↓
// BIM Table

// ======================================================
// RELACIÓN CON setupItemsFinder()
// ======================================================
// setupItemsFinder()
// ↓
// finder.create()
// ↓
// ItemsFinder
// ↓
// queriesListTemplate
// ↓
// table.data
// ↓
// Queries Panel
// ↓
// Usuario

// ======================================================
// RELACIÓN CON TODA LA CARPETA
// ======================================================
// queries/
// │
// ├── index.ts
// │       │
// │       ├── Crear componente
// │       ├── Escuchar ItemsFinder
// │       └── Actualizar tabla
// │
// ├── types.ts
// │       │
// │       └── Tipos
// │
// ├── template.ts
// │       │
// │       └── Construir filas
// │
// └── set-defaults.ts
//         │
//         └── Configurar tabla
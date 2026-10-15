// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define los tipos utilizados por la tabla de consultas (Queries List). No crea la tabla ni implementa ninguna lógica.

// Su misión es describir:
  // • Qué estado necesita el componente.
  // • Cómo es cada fila de la tabla.

// Gracias a estos tipos, TypeScript puede comprobar que la tabla se construye correctamente y que los datos utilizados tienen la estructura esperada.

// ======================================================
// IMPORTACIONES
// ======================================================
// No utilizamos ningún servicio del motor. Simplemente lo usamos para tipar el estado del componente.
import * as OBC from "@thatopen/components";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Estado que necesita la tabla de consultas. Se proporciona acceso al contenedor de Components para poder consultar servicios BIM como el ItemsFinder.
// La tabla necesita acceso al contenedor de componentes porque más adelante deberá consultar el:
export interface QueriesListState {
  components: OBC.Components;
}

// ======================================================
// TIPOS DE DATOS DE LA TABLA: ESTRUCTURA DE CADA FILA DE LA TABLA
// ======================================================
// Aquí estamos describiendo cómo será cada fila de la tabla. No la tabla completa. Una sola fila.

// Cada fila de la tabla representa una consulta BIM.
// Name:
  // Nombre de la consulta registrada en el ItemsFinder.
// Actions:
//   Columna destinada a mostrar las acciones disponibles sobre la consulta (ejecutar, eliminar, etc.).

// Podemos imaginar algo así:
// ┌──────────────────────────────┐
// │ Name               Actions   │
// ├──────────────────────────────┤
// │ Walls             [▶][🗑]     │ 
// │ Doors             [▶][🗑]     │
// │ Windows           [▶][🗑]     │
// └──────────────────────────────┘
// Cada fila tendrá exactamente dos columnas.
export type QueriesListTableData = {
  Name: string;
  // ¿Por qué es un string si probablemente contendrá botones? La respuesta está en cómo funciona BUI.Table.
  // La tabla se define mediante un tipo de datos sencillo (QueriesListTableData), pero después, en template.ts, 
  // esa columna podrá renderizarse como componentes HTML (botones, iconos, menús, etc.) en lugar de mostrarse como texto plano.
  // Ahora mismo solo estamos definiendo la estructura de los datos, no su representación visual.
  Actions: string;
};

// ======================================================
// RELACIÓN CON EL RESTO DEL PROYECTO
// ======================================================
// Este tipo será utilizado por queriesListTemplate. El flujo será aproximadamente este:

// ItemsFinder
//       │
//       ▼
// Lista de consultas
//       │
//       ▼
// QueriesListTableData
//       │
//       ▼
// queriesListTemplate
//       │
//       ▼
// Tabla HTML

// ======================================================
// RELACIÓN CON setupItemsFinder()
// ======================================================
// En setupItemsFinder() definíamos:

  // finder.create("Walls", ...)
  // finder.create("Doors & Windows", ...)
  // finder.create("Drywall T7", ...)
  // finder.create("External Walls", ...)

// Esas consultas terminarán convirtiéndose en filas de tipo:

  // {
  //     Name: "Walls",
  //     Actions: ...
  // }
  // {
  //     Name: "Doors & Windows",
  //     Actions: ...
  // }
  // {
  //     Name: "External Walls",
  //     Actions: ...
  // }

// Es decir, este tipo es el puente entre el ItemsFinder y la tabla.

// ======================================================
// DIAGRAMA DE LA ARQUITECTURA
// ======================================================
// setupItemsFinder()
//         │
//         ▼
// ItemsFinder
//         │
//         ▼
// Consultas registradas
//         │
//         ▼
// QueriesListTableData
//         │
//         ▼
// queriesListTemplate
//         │
//         ▼
// Tabla de consultas
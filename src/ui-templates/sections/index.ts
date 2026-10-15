// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo actúa como la API pública del módulo "sections".
// No implementa ningún panel ni contiene lógica. Su única función es reunir y reexportar todas las secciones de la interfaz para que puedan importarse desde un único punto.

// ======================================================
// RELACIÓN CON LA ARQUITECTURA
// ======================================================
// Recordemos que ComponentsGrid definía:

// grid.elements = {
//    viewport,
//    models,
//    queries,
//    itemsData
// }

// Los tres últimos componentes corresponden precisamente a las secciones exportadas desde este módulo.

// ComponentsGrid
// │
// ├── ViewportContainer
// ├── Models Panel
// ├── Queries Panel
// └── ItemsData Panel

// Este index.ts simplemente hace públicas esas tres secciones.

// ======================================================
// REEXPORTACIONES
// ======================================================
// Panel que muestra la información de los elementos BIM seleccionados.
export * from "./items-data"
// Panel encargado de gestionar los modelos cargados.
export * from "./models"
// Panel que permite ejecutar y gestionar consultas (queries) sobre el modelo.
export * from "./queries"
// Panel que permite identificar/seleccionar los elementos del modelo que tienen datos relacionados con alguna de las fuentes de datos registradas en la aplicación.
export * from "./datasources"
// Panel que permitirá ejecutar smart views preconfiguradas a golpe de click
export * from "./smart-views"
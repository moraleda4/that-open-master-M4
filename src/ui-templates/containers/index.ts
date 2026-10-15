// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Su responsabilidad es reunir en un único punto todos los componentes de tipo contenedor, evitando que el resto del proyecto tenga que importar cada archivo por separado

// Gracias a él, desde cualquier otro archivo basta con escribir: import { viewportTemplate, viewportToolbarTemplate } from "./containers";
// en lugar de: 
    // import { viewportTemplate } from "./containers/viewport";
    // import { viewportToolbarTemplate } from "./containers/viewport-toolbar";

// Un container no suele contener lógica BIM. Su misión es organizar otros componentes de la interfaz.


// Reexporta los contenedores principales de la interfaz.
// Este archivo actúa como punto de entrada para el módulo "containers", permitiendo importar sus componentes sin conocer la estructura interna de la carpeta

// Reexporta el componente encargado del contenedor principal del visor
export * from "./viewport";
// Reexporta el componente encargado de la barra de herramientas del visor.
export * from "./viewport-toolbar";

export * from "./grid-sidebar"
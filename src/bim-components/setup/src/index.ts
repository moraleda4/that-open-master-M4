// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Archivo para exportar todos los bim-components
// Su única responsabilidad es agrupar las exportaciones de todos los módulos del directorio src, para que desde fuera no sea necesario conocer la estructura interna

// Reexporta todas las utilidades relacionadas con la configuración del visor BIM
// Este archivo actúa como un punto de entrada único para el submódulo "setup", evitando importar cada archivo individualmente desde el resto de la aplicación
export * from "./ifc-loader"
export * from "./create-world"
export * from "./fragments-manager"
export * from "./items-finder"
export * from "./highlighter"
export * from "./data-enhancer"
export * from "./smart-views"
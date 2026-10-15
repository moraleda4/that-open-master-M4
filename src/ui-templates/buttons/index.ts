// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Su función es reexportar todos los botones disponibles para que el resto de la aplicación no tenga que conocer la estructura interna de la carpeta.

// Reexporta todos los botones definidos en este módulo
// Actúa como punto de entrada para la carpeta "buttons", evitando que el resto de la aplicación tenga que importar directamente desde archivos concretos
export * from "./load-button"

// Sin este archivo, habría que importar directamente desde: import { loadModelBtnTemplate } from "./buttons/load-button";
// Gracias a este index.ts, basta con: import { loadModelBtnTemplate } from "./buttons";
// Y gracias al ui-templates/index.ts que vimos antes, incluso podemos hacer: import { loadModelBtnTemplate } from "../../ui-templates";
// Que es precisamente lo que aparecía en setup/index.ts.
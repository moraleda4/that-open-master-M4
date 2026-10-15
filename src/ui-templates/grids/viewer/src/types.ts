// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define el tipado del ViewerGrid. No crea ningún Grid ni construye ninguna interfaz.
// Su única función es describir, mediante TypeScript, qué elementos puede contener el Grid y qué layouts admite.
// Gracias a ello, TypeScript puede comprobar que el ViewerGrid se configura correctamente y detectar errores durante el desarrollo.

// ======================================================
// IMPORTACIONES
// ======================================================
// Necesitamos importar el tipo genérico: BUI.Grid. No utilizamos ningún componente visual. Solo el tipo.
import * as BUI from "@thatopen/ui";

// ======================================================
// 1º TIPO
// ======================================================
// Representa la descripción del Header. Es como una ficha técnica. Podemos leerlo así:
// Existe un elemento del Grid llamado "header" cuyo estado será {}.
type Header = {
  name: "header";
  // ¿Por qué el estado está vacío? Porque en viewerGridTemplate vimos esto:
    // header: {
    //     template: (_) => BUI.html`<div></div>`,
    //     initialState: {}
    // }
// Ese componente no necesita ninguna información. Por tanto:
  state: {};
}

// ======================================================
// 2º TIPO
// ======================================================
type Sidebar = {
  name: "sidebar";
  state: {};
}

// ======================================================
// 3º TIPO
// ======================================================
type ComponentsGrid = {
  name: "componentsGrid";
  // ¿Por qué {} si luego usamos componentsGridTemplate? Porque ese componente tampoco necesita recibir estado inicial.
  // En viewerGridTemplate hacíamos:
    // componentsGrid: {
    //     template: componentsGridTemplate,
    //     initialState: {}
    // }
  state: {};
}

// La tupla: Ya conocemos esta idea. No representa los componentes. Representa los tipos de componentes que el Grid admite
// Podemos imaginarlo como una lista de componentes permitidos
type ViewerGridElements = [Header, Sidebar, ComponentsGrid];
// Otra lista. En este caso: ¿Qué layouts conoce el Grid? Respuesta: Main. Solo uno.
type ViewerGridLayouts = ["Main"];

// ======================================================
// TIPO FINAL
// ======================================================
// Está diciendo: Crea un tipo llamado ViewerGrid que sea un BUI.Grid configurado con: estos layouts; estos elementos.
export type ViewerGrid = BUI.Grid<ViewerGridLayouts, ViewerGridElements>;

// Es decir, el objetivo del archivo no es hacer funcionar el Grid, sino evitar errores de programación

// ======================================================
// FLUJO COMPLETO
// ======================================================

// ViewerGrid
// │
// ├── Layouts permitidos
// │       │
// │       └── Main
// │
// └── Elementos permitidos
//         │
//         ├── Header
//         ├── Sidebar
//         └── ComponentsGrid

// Este archivo es un buen ejemplo de algo que probablemente irás viendo mucho en proyectos grandes de TypeScript:
  // No todo archivo existe para ejecutar código.
  // Muchos archivos existen únicamente para hacer que el resto del código sea más seguro y más fácil de mantener.
// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Su función es ocultar la estructura interna de ui-templates para que el resto del proyecto no tenga que importar desde carpetas específicas.

// En lugar de escribir:
    // import { viewportGridTemplate } from "./ui-templates/grids";
    // import { loadModelBtnTemplate } from "./ui-templates/buttons";
// podemos hacer simplemente:
    // import { viewportGridTemplate, loadModelBtnTemplate } from "./ui-templates";

// Esto hace que los imports sean más limpios y desacopla el resto de la aplicación de la organización interna de la carpeta.

// ======================================================
// EXPORTACIONES
// ======================================================
// Reexporta todos los componentes de interfaz relacionados con los contenedores, las plantillas de distribución (grids) y los botones
// Este archivo actúa como punto de entrada público para todo el módulo "ui-templates"

// Reexporta todos los contenedores de la interfaz. Los contenedores suelen ser componentes cuya misión es alojar otros componentes o definir zonas de la interfaz
export * from "./containers"
// Reexporta todas las plantillas relacionadas con la distribución (layout)
// Por lo que hemos visto en create-world.ts, aquí probablemente estará: viewportGridTemplate, que es precisamente el template utilizado para construir el visor
export * from "./grids"
// Reexporta todos los botones reutilizables. Hasta ahora sabemos que al menos existe: loadModelBtnTemplate que seguramente será el botón encargado de cargar modelos IFC
export * from "./buttons"

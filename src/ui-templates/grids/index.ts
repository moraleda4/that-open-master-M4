// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo define la API pública del módulo grids. Su misión es agrupar todas las plantillas relacionadas con la distribución (layout) de la aplicación
// Mientras que en containers teníamos componentes como: Viewport y Toolbar, aquí tendremos plantillas que organizan esos componentes dentro de la pantalla

// Containers
//         │
//         ▼
// ¿Qué componentes existen?

// ----------------------------

// Grids
//         │
//         ▼
// ¿Cómo se colocan esos componentes?

// ¿Qué significa "Grid" aquí? Es importante no confundirlo con el Grid que vimos en createWorld(). Allí aparecía: components.get(OBC.Grids).create(world);
// Ese Grid era el suelo del visor 3D.
// En cambio, esta carpeta: ui-templates/grids no tiene nada que ver con Three.js. 
// Aquí Grid significa layout de la interfaz, es decir, cómo se distribuyen paneles, botones y visores.

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// Cada nivel tiene una responsabilidad distinta:

    //      Buttons
    //         │
    //         ▼
    // Acciones individuales

    //     Containers
    //         │
    //         ▼
    // Agrupan componentes

    //       Grids
    //         │
    //         ▼
    // Organizan la distribución de la interfaz

// Esta separación es muy útil porque evita mezclar qué hace un componente con dónde se coloca
// Si en el futuro cambias el diseño de la aplicación (por ejemplo, moviendo la barra de herramientas de la izquierda a la parte superior), 
// probablemente solo tendrás que modificar las plantillas de grids, mientras que los botones y contenedores seguirán funcionando exactamente igual


// Reexporta todas las plantillas de distribución (grids) de la interfaz
// Estas plantillas organizan los distintos contenedores y componentes visuales que forman el layout de la aplicación
// Reexporta todas las plantillas relacionadas con los componentes del layout: paneles, barras, etc.
export * from "./components";
// Recordemos que en create-world.ts vimos: const [viewportGrid] = BUI.Component.create( TEMPLATES.viewportGridTemplate, { components, } );
// Eso significa que en algún lugar de esta carpeta existe: viewportGridTemplate
// Muy probablemente terminará estando relacionado con esta exportación. Es decir, aquí empezaremos a ver el layout completo del visor BIM.
export * from "./viewer";
// grids/viewport probablemente será una plantilla de distribución

// containers/viewport
// ↓
// Componente reutilizable
// ----------------------------
// grids/viewport
// ↓
// Lugar donde se coloca ese componente

export * from "./viewport"


// ======================================================
// ARQUITECTURA GENERAL
// ======================================================

// viewerGridTemplate (layout general)
// │
// ├── Header
// ├── Sidebar
// └── ComponentsGrid
//         │
//         ├── Models Panel
//         ├── Queries Panel
//         ├── ViewportContainer
//         │        │
//         │        └── Viewport (Three.js)
//         │
//         └── ItemsData Panel
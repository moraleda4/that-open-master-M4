// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Punto de entrada de la app al módulo bim-components
export * from "./setup"
export * from "./DataEnhancer"
export * from "./SmartViews"

// ======================================================
// ARQUITECTURA DE BIM COMPONENTS
// ======================================================
// bim-components/
// │
// ├── index.ts
// │
// ▼
// setup/
// │
// ├── index.ts
// │
// ▼
// setup/src/
// │
// ├── index.ts
// │
// ├── create-world.ts
// ├── ifc-loader.ts
// ├── fragments-manager.ts
// ├── highlighter.ts
// └── items-finder.ts
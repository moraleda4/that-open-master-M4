// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Aquí empieza a conectarse todo el trabajo que hice en: setupItemsFinder(components) donde definía consultas como:
  // finder.create("Walls", ...)
  // finder.create("Doors & Windows", ...)
  // finder.create("External Walls", ...)
// Ahora vamos a darles una interfaz gráfica.

// Este archivo define el panel "Queries" de la aplicación.Su función es mostrar todas las consultas BIM disponibles (Queries) y permitir buscarlas mediante un cuadro de texto.
// A diferencia de modelsPanelTemplate:
  // - No gestiona modelos.
  // - No carga archivos IFC.
  // - No implementa las consultas.

// Simplemente crea la interfaz del panel y reutiliza el componente queriesList, que contiene la lógica de la tabla.
// Las consultas mostradas en este panel proceden del ItemsFinder configurado previamente en setupItemsFinder().

// ======================================================
// OBSERVACIONES DEL DISEÑO
// ======================================================
// Este archivo demuestra algo interesante de la arquitectura del proyecto.
// Los tres paneles (Models, Queries e ItemsData) siguen prácticamente el mismo patrón:

//       Panel
//         │
//         ▼
// Buscador (opcional)
//         │
//         ▼
// Componente especializado
//         │
//         ▼
//   Servicios BIM

// La diferencia está en el componente especializado que utilizan:

// Models → modelsList() (proporcionado por @thatopen/ui-obc).
// Queries → queriesList() (implementado en el propio proyecto).
// ItemsData → probablemente otro componente especializado que veremos en el siguiente archivo.

// Esto hace que todos los paneles tengan una estructura homogénea y que la lógica específica quede encapsulada en componentes reutilizables, 
// manteniendo las plantillas de sección muy limpias y fáciles de mantener.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc"
import { loadModelBtnTemplate } from "../buttons";
// En models.ts utilizábamos: CUI.tables.modelsList(...) que venía ya implementada por la librería.
// Aquí ocurre algo distinto. No existe una tabla de consultas dentro de That Open. Por eso el proyecto tiene su propia implementación.
import { queriesList } from "../tables/queries";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El panel solo necesita acceso a los componentes BIM.
export interface QueriesPanelState {
  components: OBC.Components;
}

// ======================================================
// COMPONENTE PRINCIPAL: queriesPanelTemplate
// ======================================================
export const queriesPanelTemplate: BUI.StatefullComponent<
  QueriesPanelState
> = (state) => {
  const { components } = state;

  const [modelsList] = queriesList({
    components,
  });

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    modelsList.queryString = input.value;
  };

  // Resultado visual
  // ┌───────────────────────────────┐
  // │ Queries List                  │
  // │                               │
  // │ [Buscar.....................] │
  // │                               │
  // ├───────────────────────────────┤
  // │ Walls                         │
  // │ Doors & Windows               │
  // │ External Walls                │
  // │ Drywall T7                    │
  // │ ...                           │
  // └───────────────────────────────┘
  return BUI.html`
  <bim-panel-section fixed label="Queries List">
    <div style="display: flex; gap: 0.5rem;">
      <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
    </div>
    ${modelsList}
  </bim-panel-section>`;
};

// ======================================================
// RELACIÓN CON ARQUITECTURA
// ======================================================
// setupItemsFinder()
// ↓
// ItemsFinder
// ↓
// queriesList()
// ↓
// Queries Panel
// ↓
// Usuario

// Es decir, este archivo es el puente entre: la lógica BIM y la interfaz.

// Queries Panel
// │
// ├────────────── Search
// │                    │
// │                    ▼
// │             queryString
// │
// └────────────── Queries List
//                      │
//                      ▼
//                queriesList()
//                      │
//                      ▼
//                ItemsFinder
//                      │
//                      ▼
//           Consultas registradas
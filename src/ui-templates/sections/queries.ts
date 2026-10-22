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
import * as FRAGS from "@thatopen/fragments";

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

  // El panel necesita acceder al ItemsFinder para crear, exportar e importar consultas.
  const finder = components.get(OBC.ItemsFinder);

  // Las variables siguientes guardan temporalmente lo que el usuario escribe en el formulario.
  let queryName = "";
  let category = "";
  let psetName = "";
  let propertyName = "";
  let propertyValue = "";

  let importFileInput: HTMLInputElement | undefined;

  const onImportInputCreated = (element?: Element) => {
    if (!element) return;
    importFileInput = element as HTMLInputElement;
  };

  const [modelsList] = queriesList({
    components,
  });

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    modelsList.queryString = input.value;
  };

  // Convierte los textos introducidos por el usuario en expresiones regulares seguras.
  // Así, caracteres como "." o "*" se interpretan como texto literal.
  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Conversor para que valores habituales se pasen con su tipo correcto:
  const parseAttributeValue = (value: string): RegExp | boolean | number => {
    const normalized = value.trim();

    if (/^true$/i.test(normalized)) return true;
    if (/^false$/i.test(normalized)) return false;

    if (normalized !== "" && Number.isFinite(Number(normalized))) {
      return Number(normalized);
    }

    return new RegExp(`^${escapeRegExp(normalized)}$`, "i");
  };

  // Crea una consulta nueva a partir de la categoría IFC y de una propiedad perteneciente al Property Set indicado en el formulario.
  const createQuery = () => {
    const name = queryName.trim();
    const pset = psetName.trim();
    const property = propertyName.trim();
    const value = propertyValue.trim();
    const ifcCategory = category.trim();

    // No se puede crear una consulta sin nombre, Property Set, propiedad y valor.
    if (!name || !pset || !property || !value) {
      alert("Complete the query name, Property Set, property, and value.");
      return;
    }

    // Evita reemplazar una consulta que ya esté registrada con el mismo nombre.
    if (finder.list.has(name)) {
      alert(`A query named "${name}" already exists.`);
      return;
    }

    // La consulta sigue las relaciones IFC desde el elemento hasta su Property Set y busca allí la propiedad y el valor indicados.
    // La categoría IFC es opcional y, si se especifica, reduce los resultados.
    const query: FRAGS.ItemsQueryParams = {
      ...(ifcCategory
        ? { categories: [new RegExp(escapeRegExp(ifcCategory), "i")] }
        : {}),
      relation: {
        name: "IsDefinedBy",
        query: {
          attributes: {
            queries: [
              {
                name: /Name/,
                value: new RegExp(`^${escapeRegExp(pset)}$`, "i"),
              },
            ],
          },
          relation: {
            name: "HasProperties",
            query: {
              attributes: {
                queries: [
                  {
                    name: /Name/,
                    value: new RegExp(`^${escapeRegExp(property)}$`, "i"),
                  },
                  {
                    name: /NominalValue/,
                    value: parseAttributeValue(value),
                  },
                ],
              },
            },
          },
        },
      },
    };

    // ItemsFinder registra la consulta y la lista de la interfaz se actualiza mediante los eventos que ya escucha queriesList.
    finder.create(name, [query]);
  };

    // Serializa todas las consultas registradas y descarga el resultado como JSON.
    // Se exportan las definiciones de búsqueda, no los elementos encontrados.
    const exportQueries = () => {
    const json = JSON.stringify(finder.export(), null, 2);
    const file = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = "items-finder-queries.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  // Abre el selector de archivos y carga un JSON exportado previamente desde ItemsFinder.
  const openImportFile = () => {
    importFileInput?.click();
  };

  const importQueries = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Comprueba que el archivo tenga el formato esperado antes de pasarlo al componente.
    try {
      const parsed: unknown = JSON.parse(await file.text());

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("data" in parsed) ||
        !Array.isArray(parsed.data)
      ) {
        throw new Error("Invalid ItemsFinder export format.");
      }

      // ItemsFinder reconstruye las consultas y las registra en su lista.
      finder.import(parsed as ReturnType<typeof finder.export>);
    } catch (error) {
      console.error("Could not import queries:", error);
      alert("The selected file is not a valid ItemsFinder query export.");
    } finally {
      input.value = "";
    }
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
  // La sección Queries List combina el buscador y la tabla existentes con controles para crear, exportar e importar consultas del ItemsFinder.
  return BUI.html`
  <bim-panel-section fixed label="Queries List">

    <!-- Mantiene el buscador existente y agrupa los controles de consultas. -->
    <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
      <bim-text-input
        @input=${onSearch}
        placeholder="Search..."
        debounce="200"
      ></bim-text-input>

      <!-- El menú reúne los campos necesarios para construir una consulta por propiedad IFC. -->
      <bim-button label="Create query">
        <bim-context-menu>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 16rem;">
            <bim-text-input
              label="Query name"
              placeholder="My query"
              @input=${({ target }: { target: BUI.TextInput }) => {
                queryName = target.value;
              }}
            ></bim-text-input>

            <bim-text-input
              label="IFC category (optional)"
              placeholder="WALL"
              @input=${({ target }: { target: BUI.TextInput }) => {
                category = target.value;
              }}
            ></bim-text-input>

            <bim-text-input
              label="Property Set"
              placeholder="Pset_WallCommon"
              @input=${({ target }: { target: BUI.TextInput }) => {
                psetName = target.value;
              }}
            ></bim-text-input>

            <bim-text-input
              label="Property"
              placeholder="IsExternal"
              @input=${({ target }: { target: BUI.TextInput }) => {
                propertyName = target.value;
              }}
            ></bim-text-input>

            <bim-text-input
              label="Value"
              placeholder="true"
              @input=${({ target }: { target: BUI.TextInput }) => {
                propertyValue = target.value;
              }}
            ></bim-text-input>

            <bim-button
              label="Create"
              @click=${createQuery}
            ></bim-button>
          </div>
        </bim-context-menu>
      </bim-button>

      <bim-button
        label="Export"
        @click=${exportQueries}
      ></bim-button>

      <bim-button
        label="Import"
        @click=${openImportFile}
      ></bim-button>
      
      <!-- Input oculto que se activa desde el botón Import. -->
      <input
        ${BUI.ref(onImportInputCreated)}
        type="file"
        accept=".json,application/json"
        style="display: none;"
        @change=${importQueries}
      />
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
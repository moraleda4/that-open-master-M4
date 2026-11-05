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
import { appIcons } from "../../globals";
import * as OBF from "@thatopen/components-front";


type QueryCondition = {
  id: number;
  category: string;
  psetName: string;
  propertyName: string;
  value: string;
};

let nextQueryConditionId = 0;

const createEmptyQueryCondition = (): QueryCondition => ({
  id: nextQueryConditionId++,
  category: "",
  psetName: "",
  propertyName: "",
  value: "",
});

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El panel solo necesita acceso a los componentes BIM.
export interface QueriesPanelState {
  components: OBC.Components;
  conditions?: QueryCondition[];
  queryName?: string;
  queryAggregation?: "inclusive" | "exclusive";
  createQueryStep?: "mode" | "form";
}

// ======================================================
// COMPONENTE PRINCIPAL: queriesPanelTemplate
// ======================================================
export const queriesPanelTemplate: BUI.StatefullComponent<
  QueriesPanelState
> = (state, update) => {
  const { components } = state;

  // El panel necesita acceder al ItemsFinder para crear, exportar e importar consultas.
  const finder = components.get(OBC.ItemsFinder);

  // Las variables siguientes guardan temporalmente lo que el usuario escribe en el formulario.
  state.queryName ??= "";

  const conditions =
    state.conditions ?? (state.conditions = [createEmptyQueryCondition()]);
    state.queryAggregation ??= "inclusive";
    state.createQueryStep ??= "mode";
  
  const chooseQueryMode = (
    aggregation: "inclusive" | "exclusive",
  ) => {
    state.queryAggregation = aggregation;
    state.createQueryStep = "form";
    update();
  };

  const openCreateQueryDialog = () => {
    state.createQueryStep = "mode";
    state.queryAggregation = "inclusive";

    update();

    requestAnimationFrame(() => {
      if (createQueryDialog && !createQueryDialog.open) {
        createQueryDialog.showModal();
      }
    });
  };

  const ALL_IFC_ENTITIES = "All IFC Entities";

  let categoryInput: BUI.TextInput | undefined;
  let queryNameInput: BUI.TextInput | undefined;
  let createQueryDialog: HTMLDialogElement | undefined;
  let queryNameMessage: HTMLDivElement | undefined;
  let psetInput: BUI.TextInput | undefined;
  let propertyInput: BUI.TextInput | undefined;
  let valueInput: BUI.TextInput | undefined;
  let entityListContainer: HTMLDivElement | undefined;
  let psetListContainer: HTMLDivElement | undefined;
  let propertyListContainer: HTMLDivElement | undefined;
  const categoryInputs = new Map<number, BUI.TextInput>();
  const psetInputs = new Map<number, BUI.TextInput>();
  const propertyInputs = new Map<number, BUI.TextInput>();
  const valueInputs = new Map<number, BUI.TextInput>();

  const entityListContainers = new Map<number, HTMLDivElement>();
  const psetListContainers = new Map<number, HTMLDivElement>();
  const propertyListContainers = new Map<number, HTMLDivElement>();
  const valueListContainers = new Map<number, HTMLDivElement>();

  let cachedEntityModelIds = "";
  let cachedEntities: string[] = [];

  let cachedPropertyListKey = "";
  let cachedPropertyNames: string[] = [];
  const cachedValueOptions = new Map<string, string[]>();

  let cachedPsetModelIds = "";
  let cachedPsetNames: string[] = [];

  let importFileInput: HTMLInputElement | undefined;

  const onImportInputCreated = (element?: Element) => {
    if (!element) return;
    importFileInput = element as HTMLInputElement;
  };

  const onCategoryInputCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const input = element as BUI.TextInput;
    categoryInputs.set(id, input);

    if (conditions[0]?.id === id) categoryInput = input;
  };

  const onQueryNameInputCreated = (element?: Element) => {
    if (element) queryNameInput = element as BUI.TextInput;
  };

  const onCreateQueryDialogCreated = (element?: Element) => {
    if (element instanceof HTMLDialogElement) {
      createQueryDialog = element;
    }
  };

  const onPsetInputCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const input = element as BUI.TextInput;
    psetInputs.set(id, input);

    if (conditions[0]?.id === id) psetInput = input;
  };

  const onPropertyInputCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const input = element as BUI.TextInput;
    propertyInputs.set(id, input);

    if (conditions[0]?.id === id) propertyInput = input;
  };

  const onValueInputCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const input = element as BUI.TextInput;
    valueInputs.set(id, input);

    if (conditions[0]?.id === id) valueInput = input;
  };

  const onEntityListContainerCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const container = element as HTMLDivElement;
    entityListContainers.set(id, container);

    if (conditions[0]?.id === id) entityListContainer = container;
  };

  const onPsetListContainerCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const container = element as HTMLDivElement;
    psetListContainers.set(id, container);

    if (conditions[0]?.id === id) psetListContainer = container;
  };

  const onPropertyListContainerCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    const container = element as HTMLDivElement;
    propertyListContainers.set(id, container);

    if (conditions[0]?.id === id) propertyListContainer = container;
  };

  const onValueListContainerCreated = (id: number) => (element?: Element) => {
    if (!element) return;

    valueListContainers.set(id, element as HTMLDivElement);
  };

  const onCategoryInput = (
    event: Event,
    conditionId = conditions[0].id,
  ) => {
    const input = event.currentTarget as BUI.TextInput;
    const condition = conditions.find(({ id }) => id === conditionId);

    if (!condition) return;

    const value = input.value.trim();
    condition.category = value === ALL_IFC_ENTITIES ? "" : value;
  };

  let resultsLabel: HTMLElement | undefined;

  const onResultsLabelCreated = (element?: Element) => {
    if (!element) return;
    resultsLabel = element as HTMLElement;
  };

  const onQueryResults = (queryName: string, count: number) => {
    if (!resultsLabel) return;

    if (count === 0) {
      const name = queryName.replace(/\s+(selected|colored)$/i, "");
      resultsLabel.textContent = `No items match the query "${name}".`;
      return;
    }

    resultsLabel.textContent = `${queryName}: ${count} items.`;
  };

  const resetQueryResults = () => {
    if (!resultsLabel) return;

    resultsLabel.textContent =
      "No items are currently selected or colorized.";
  };

  const highlighter = components.get(OBF.Highlighter);

  highlighter.events.select.onClear.add(resetQueryResults);
  window.addEventListener("query-results-reset", resetQueryResults);
  
  const [modelsList] = queriesList({
    components,
    onQueryResults,
  });

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    modelsList.queryString = input.value;
  };

  const onQueryNameMessageCreated = (element?: Element) => {
    if (element) queryNameMessage = element as HTMLDivElement;
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

  const getStringAttribute = (
    record: Record<string, unknown>,
    key: string,
  ): string | undefined => {
    const attribute = record[key];

    if (
      typeof attribute !== "object" ||
      attribute === null ||
      !("value" in attribute) ||
      typeof attribute.value !== "string"
    ) {
      return undefined;
    }

    return attribute.value;
  };

  const getPrimitiveValueAttributes = (
    record: Record<string, unknown>,
  ): string[] => {
    const values: string[] = [];

    for (const [key, attribute] of Object.entries(record)) {
      if (!key.toLowerCase().endsWith("value")) continue;

      if (
        typeof attribute !== "object" ||
        attribute === null ||
        !("value" in attribute)
      ) {
        continue;
      }

      const value = attribute.value;

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        values.push(String(value));
      }
    }

    return values;
  };

  const closeOptionList = (option: HTMLElement) => {
    const menu = option.closest("bim-context-menu") as BUI.ContextMenu | null;
    if (menu) menu.visible = false;
  };

  const loadIfcEntityOptions = async (conditionId: number) => {
    const listContainer = entityListContainers.get(conditionId);
    const input = categoryInputs.get(conditionId);
    const condition = conditions.find(({ id }) => id === conditionId);

    if (!listContainer || !input || !condition) return;

    listContainer.textContent = "Loading IFC entities...";

    try {
      const fragments = components.get(OBC.FragmentsManager);
      const modelIds = [...fragments.list]
        .map(([modelId]) => modelId)
        .sort();
      const modelSignature = modelIds.join("|");

      if (modelSignature !== cachedEntityModelIds) {
        const entities = new Set<string>();

        for (const [, model] of fragments.list) {
          const localIds = await model.getLocalIds();
          const batchSize = 500;

          for (let start = 0; start < localIds.length; start += batchSize) {
            const items = await model.getItemsData(
              localIds.slice(start, start + batchSize),
              { attributesDefault: true },
            );

            for (const item of items) {
              const attribute = item["_category"];

              if (
                typeof attribute === "object" &&
                attribute !== null &&
                !Array.isArray(attribute) &&
                "value" in attribute &&
                typeof attribute.value === "string"
              ) {
                entities.add(attribute.value);
              }
            }
          }
        }

        cachedEntities = [...entities].sort((a, b) => a.localeCompare(b));
        cachedEntityModelIds = modelSignature;
      }

      const options = [ALL_IFC_ENTITIES, ...cachedEntities];

      listContainer.replaceChildren(
        ...options.map((entity) => {
          const option = document.createElement("button");
          option.type = "button";
          option.textContent = entity;
          option.style.cssText =
            "display:block;width:100%;text-align:left;padding:0.4rem;" +
            "background:transparent;color:white;border:0;cursor:pointer;";

          option.addEventListener("click", (event) => {
            event.stopPropagation();

            input.value = entity;
            condition.category =
              entity === ALL_IFC_ENTITIES ? "" : entity;

            closeOptionList(option);
          });

          return option;
        }),
      );

      if (options.length === 1) {
        listContainer.style.color = "#fff";
        listContainer.style.fontStyle = "italic";
        listContainer.style.fontSize = "0.65rem";
        listContainer.textContent =
          "No IFC entities found in the loaded models.";
      }
     } catch (error) {
      console.error("Could not load IFC entities:", error);
      listContainer.textContent = "Could not load IFC entities.";
    }
  };

  const loadPsetOptions = async (conditionId: number) => {
    const listContainer = psetListContainers.get(conditionId);
    const input = psetInputs.get(conditionId);
    const condition = conditions.find(({ id }) => id === conditionId);

    if (!listContainer || !input || !condition) return;

    listContainer.textContent = "Loading Property Sets and Qto...";

    try {
      const fragments = components.get(OBC.FragmentsManager);
      const modelIds = [...fragments.list]
        .map(([modelId]) => modelId)
        .sort();
      const modelSignature = modelIds.join("|");

      if (modelSignature !== cachedPsetModelIds) {
        const psetNames = new Set<string>();

        for (const [, model] of fragments.list) {
          const localIds = await model.getLocalIds();
          const batchSize = 500;

          for (let start = 0; start < localIds.length; start += batchSize) {
            const items = await model.getItemsData(
              localIds.slice(start, start + batchSize),
              {
                attributesDefault: true,
                relations: {
                  IsDefinedBy: { attributes: true, relations: true },
                },
              },
            );

            for (const item of items) {
              const relatedItems = item["IsDefinedBy"];
              if (!Array.isArray(relatedItems)) continue;

              for (const relatedItem of relatedItems) {
                if (
                  typeof relatedItem !== "object" ||
                  relatedItem === null ||
                  Array.isArray(relatedItem)
                ) {
                  continue;
                }

                const relation = relatedItem as Record<string, unknown>;
                const ifcType = getStringAttribute(relation, "_category");

                if (
                  ifcType !== "IFCPROPERTYSET" &&
                  ifcType !== "IFCELEMENTQUANTITY"
                ) {
                  continue;
                }

                const name = getStringAttribute(relation, "Name");
                if (name) psetNames.add(name);
              }
            }
          }
        }

        cachedPsetNames = [...psetNames].sort((a, b) => a.localeCompare(b));
        cachedPsetModelIds = modelSignature;
      }

      if (cachedPsetNames.length === 0) {
        listContainer.style.color = "#fff";
        listContainer.style.fontSize = "0.65rem";
        listContainer.style.fontStyle = "italic";
        listContainer.textContent =
          "No Psets or Qto groups found in the loaded models.";
        return;
      }

      listContainer.replaceChildren(
        ...cachedPsetNames.map((name) => {
          const option = document.createElement("button");
          option.type = "button";
          option.textContent = name;
          option.style.cssText =
            "display:block;width:100%;text-align:left;padding:0.4rem;" +
            "background:transparent;color:white;border:0;cursor:pointer;";

          option.addEventListener("click", (event) => {
            event.stopPropagation();

            input.value = name;
            condition.psetName = name;

            closeOptionList(option);
          });

          return option;
        }),
      );
    } catch (error) {
      console.error("Could not load Property Sets and Qto groups:", error);
      listContainer.style.color = "#fff";
      listContainer.style.fontSize = "0.65rem";
      listContainer.style.fontStyle = "italic";
      listContainer.textContent =
        "Could not load Property Sets and Qto groups.";
    }
  };

  const loadPropertyOptions = async (conditionId: number) => {
    const listContainer = propertyListContainers.get(conditionId);
    const input = propertyInputs.get(conditionId);
    const condition = conditions.find(({ id }) => id === conditionId);

    if (!listContainer || !input || !condition) return;

    const selectedPset = condition.psetName.trim();

    listContainer.style.fontStyle = "";
    listContainer.style.fontSize = "";
    listContainer.style.color = "";
    listContainer.textContent = "Loading properties...";

    if (!selectedPset) {
      listContainer.style.color = "#fff";
      listContainer.style.fontSize = "0.65rem";
      listContainer.style.fontStyle = "italic";
      listContainer.textContent =
        "Enter a Property Set or Qto before loading its properties.";
      return;
    }

    try {
      const fragments = components.get(OBC.FragmentsManager);
      const modelIds = [...fragments.list]
        .map(([modelId]) => modelId)
        .sort();

      const cacheKey =
        `${modelIds.join("|")}::${selectedPset.toLowerCase()}`;

      if (cacheKey !== cachedPropertyListKey) {
        const properties = new Set<string>();

        for (const [, model] of fragments.list) {
          const localIds = await model.getLocalIds();
          const batchSize = 500;

          for (let start = 0; start < localIds.length; start += batchSize) {
            const items = await model.getItemsData(
              localIds.slice(start, start + batchSize),
              {
                attributesDefault: true,
                relations: {
                  IsDefinedBy: { attributes: true, relations: true },
                },
              },
            );

            for (const item of items) {
              const relatedItems = item["IsDefinedBy"];
              if (!Array.isArray(relatedItems)) continue;

              for (const relatedItem of relatedItems) {
                if (
                  typeof relatedItem !== "object" ||
                  relatedItem === null ||
                  Array.isArray(relatedItem)
                ) {
                  continue;
                }

                const relation = relatedItem as Record<string, unknown>;
                const groupName = getStringAttribute(relation, "Name");
                if (groupName?.toLowerCase() !== selectedPset.toLowerCase()) {
                  continue;
                }

                const ifcType = getStringAttribute(relation, "_category");
                const propertyKey =
                  ifcType === "IFCPROPERTYSET"
                    ? "HasProperties"
                    : ifcType === "IFCELEMENTQUANTITY"
                      ? "Quantities"
                      : undefined;

                if (!propertyKey) continue;

                const relatedProperties = relation[propertyKey];
                if (!Array.isArray(relatedProperties)) continue;

                for (const relatedProperty of relatedProperties) {
                  if (
                    typeof relatedProperty !== "object" ||
                    relatedProperty === null ||
                    Array.isArray(relatedProperty)
                  ) {
                    continue;
                  }

                  const name = getStringAttribute(
                    relatedProperty as Record<string, unknown>,
                    "Name",
                  );

                  if (name) properties.add(name);
                }
              }
            }
          }
        }

        cachedPropertyNames = [...properties].sort((a, b) =>
          a.localeCompare(b),
        );
        cachedPropertyListKey = cacheKey;
      }

      if (cachedPropertyNames.length === 0) {
        listContainer.style.color = "#fff";
        listContainer.style.fontSize = "0.65rem";
        listContainer.style.fontStyle = "italic";
        listContainer.textContent =
          `No properties found in "${selectedPset}".`;
        return;
      }

      listContainer.replaceChildren(
        ...cachedPropertyNames.map((name) => {
          const option = document.createElement("button");
          option.type = "button";
          option.textContent = name;
          option.style.cssText =
            "display:block;width:100%;text-align:left;padding:0.4rem;" +
            "background:transparent;color:white;border:0;cursor:pointer;";

          option.addEventListener("click", (event) => {
            event.stopPropagation();

            input.value = name;
            condition.propertyName = name;

            closeOptionList(option);
          });

          return option;
        }),
      );
    } catch (error) {
      console.error("Could not load properties:", error);
      listContainer.style.color = "#fff";
      listContainer.style.fontSize = "0.65rem";
      listContainer.style.fontStyle = "italic";
      listContainer.textContent = "Could not load properties.";
    }
  };

  const loadValueOptions = async (conditionId: number) => {
    const listContainer = valueListContainers.get(conditionId);
    const input = valueInputs.get(conditionId);
    const condition = conditions.find(({ id }) => id === conditionId);

    if (!listContainer || !input || !condition) return;

    const selectedPset = condition.psetName.trim();
    const selectedProperty = condition.propertyName.trim();

    listContainer.style.color = "";
    listContainer.style.fontSize = "";
    listContainer.style.fontStyle = "";

    if (!selectedPset || !selectedProperty) {
      listContainer.style.color = "#fff";
      listContainer.style.fontSize = "0.65rem";
      listContainer.style.fontStyle = "italic";
      listContainer.textContent =
        "Enter a Property Set and Property before loading values.";
      return;
    }

    listContainer.textContent = "Loading values...";

    try {
      const fragments = components.get(OBC.FragmentsManager);
      const modelIds = [...fragments.list]
        .map(([modelId]) => modelId)
        .sort();

      const cacheKey =
        `${modelIds.join("|")}::${selectedPset.toLowerCase()}::${selectedProperty.toLowerCase()}`;

      let values = cachedValueOptions.get(cacheKey);

      if (!values) {
        const collectedValues = new Set<string>();

        for (const [, model] of fragments.list) {
          const localIds = await model.getLocalIds();
          const batchSize = 500;

          for (let start = 0; start < localIds.length; start += batchSize) {
            const items = await model.getItemsData(
              localIds.slice(start, start + batchSize),
              {
                attributesDefault: true,
                relations: {
                  IsDefinedBy: { attributes: true, relations: true },
                },
              },
            );

            for (const item of items) {
              const relatedItems = item["IsDefinedBy"];
              if (!Array.isArray(relatedItems)) continue;

              for (const relatedItem of relatedItems) {
                if (
                  typeof relatedItem !== "object" ||
                  relatedItem === null ||
                  Array.isArray(relatedItem)
                ) {
                  continue;
                }

                const relation = relatedItem as Record<string, unknown>;
                const groupName = getStringAttribute(relation, "Name");

                if (groupName?.toLowerCase() !== selectedPset.toLowerCase()) {
                  continue;
                }

                const ifcType = getStringAttribute(relation, "_category");
                const propertyKey =
                  ifcType === "IFCPROPERTYSET"
                    ? "HasProperties"
                    : ifcType === "IFCELEMENTQUANTITY"
                      ? "Quantities"
                      : undefined;

                if (!propertyKey) continue;

                const properties = relation[propertyKey];
                if (!Array.isArray(properties)) continue;

                for (const property of properties) {
                  if (
                    typeof property !== "object" ||
                    property === null ||
                    Array.isArray(property)
                  ) {
                    continue;
                  }

                  const propertyRecord =
                    property as Record<string, unknown>;
                  const propertyName =
                    getStringAttribute(propertyRecord, "Name");

                  if (
                    propertyName?.toLowerCase() !==
                    selectedProperty.toLowerCase()
                  ) {
                    continue;
                  }

                  for (const value of getPrimitiveValueAttributes(propertyRecord)) {
                    collectedValues.add(value);
                  }
                }
              }
            }
          }
        }

        values = [...collectedValues].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true }),
        );

        cachedValueOptions.set(cacheKey, values);
      }

      if (values.length === 0) {
        listContainer.style.color = "#fff";
        listContainer.style.fontSize = "0.65rem";
        listContainer.style.fontStyle = "italic";
        listContainer.textContent =
          `No values found for "${selectedProperty}" in "${selectedPset}".`;
        return;
      }

      listContainer.replaceChildren(
        ...values.map((value) => {
          const option = document.createElement("button");
          option.type = "button";
          option.textContent = value;
          option.style.cssText =
            "display:block;width:100%;text-align:left;padding:0.4rem;" +
            "background:transparent;color:white;border:0;cursor:pointer;";

          option.addEventListener("click", (event) => {
            event.stopPropagation();

            input.value = value;
            condition.value = value;
            closeOptionList(option);
          });

          return option;
        }),
      );
    } catch (error) {
      console.error("Could not load property values:", error);
      listContainer.style.color = "#fff";
      listContainer.style.fontSize = "0.65rem";
      listContainer.style.fontStyle = "italic";
      listContainer.textContent = "Could not load property values.";
    }
  };

  const renderConditionRow = (condition: QueryCondition) => BUI.html`
    <div style="display: flex; flex: 0 0 auto; flex-direction: column; gap: 0.5rem; width: 100%; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.25);">
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 6rem; align-items: end; gap: 0.5rem; width: 100%;">
        <bim-text-input
          vertical
          ${BUI.ref(onCategoryInputCreated(condition.id))}
          style="--bim-label--c: #fff;"
          label="IFC Entity"
          placeholder="IFCWALL (optional)"
          @input=${(event: Event) => onCategoryInput(event, condition.id)}
        ></bim-text-input>

        <bim-button
          style="--bim-label--c: #000;"
          label="Load list"
          @click=${() => loadIfcEntityOptions(condition.id)}
        >
          <bim-context-menu>
            <div
              ${BUI.ref(onEntityListContainerCreated(condition.id))}
              style="max-height: 14rem; min-width: 14rem; overflow-y: auto;"
            ></div>
          </bim-context-menu>
        </bim-button>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 6rem; align-items: end; gap: 0.5rem; width: 100%;">
        <bim-text-input
          vertical
          ${BUI.ref(onPsetInputCreated(condition.id))}
          style="--bim-label--c: #fff;"
          label="Property Set"
          placeholder="Pset_... or Qto_..."
          @input=${({ target }: { target: BUI.TextInput }) => {
            condition.psetName = target.value;
          }}
        ></bim-text-input>

        <bim-button
          style="--bim-label--c: #000;"
          label="Load list"
          @click=${() => loadPsetOptions(condition.id)}
        >
          <bim-context-menu>
            <div
              ${BUI.ref(onPsetListContainerCreated(condition.id))}
              style="max-height: 14rem; min-width: 18rem; overflow-y: auto;"
            ></div>
          </bim-context-menu>
        </bim-button>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 6rem; align-items: end; gap: 0.5rem; width: 100%;">
        <bim-text-input
          vertical
          ${BUI.ref(onPropertyInputCreated(condition.id))}
          style="--bim-label--c: #fff;"
          label="Property"
          placeholder="Property name"
          @input=${({ target }: { target: BUI.TextInput }) => {
            condition.propertyName = target.value;
          }}
        ></bim-text-input>

        <bim-button
          style="--bim-label--c: #000;"
          label="Load list"
          @click=${() => loadPropertyOptions(condition.id)}
        >
          <bim-context-menu>
            <div
              ${BUI.ref(onPropertyListContainerCreated(condition.id))}
              style="max-height: 14rem; min-width: 18rem; overflow-y: auto;"
            ></div>
          </bim-context-menu>
        </bim-button>
      </div>

      <div
        style="display: grid; grid-template-columns: minmax(0, 1fr) 6rem; align-items: end; gap: 0.5rem; width: 100%;"
      >
        <bim-text-input
          vertical
          ${BUI.ref(onValueInputCreated(condition.id))}
          style="--bim-label--c: #fff;"
          label="Value"
          placeholder="True"
          @input=${({ target }: { target: BUI.TextInput }) => {
            condition.value = target.value;
            BUI.ContextMenu.removeMenus();
            createQueryDialog?.close();
          }}
        ></bim-text-input>

        <bim-button
          style="--bim-label--c: #000;"
          label="Load list"
          @click=${() => loadValueOptions(condition.id)}
        >
          <bim-context-menu>
            <div
              ${BUI.ref(onValueListContainerCreated(condition.id))}
              style="max-height: 14rem; min-width: 14rem; overflow-y: auto;"
            ></div>
          </bim-context-menu>
        </bim-button>
      </div>

    </div>
  `;

  const addCondition = () => {
    conditions.push(createEmptyQueryCondition());
    update();
  };

  const buildQueryFromCondition = (
    condition: QueryCondition,
  ): FRAGS.ItemsQueryParams => {
    const ifcCategory = condition.category.trim();
    const pset = condition.psetName.trim();
    const property = condition.propertyName.trim();
    const value = condition.value.trim();

    const propertyAttributes = [];

    if (property) {
      propertyAttributes.push({
        name: /Name/,
        value: new RegExp(`^${escapeRegExp(property)}$`, "i"),
      });
    }

    if (value) {
      propertyAttributes.push({
        name: /NominalValue/,
        value: parseAttributeValue(value),
      });
    }

    const propertyQuery: FRAGS.ItemsQueryParams = {};

    if (propertyAttributes.length > 0) {
      propertyQuery.attributes = {
        queries: propertyAttributes,
      };
    }

    const propertySetQuery: FRAGS.ItemsQueryParams = {};

    if (pset) {
      propertySetQuery.attributes = {
        queries: [
          {
            name: /Name/,
            value: new RegExp(`^${escapeRegExp(pset)}$`, "i"),
          },
        ],
      };
    }

    if (property || value) {
      propertySetQuery.relation = {
        name: "HasProperties",
        query: propertyQuery,
      };
    }

    return {
      ...(ifcCategory
        ? { categories: [new RegExp(escapeRegExp(ifcCategory), "i")] }
        : {}),
      ...(pset || property || value
        ? {
            relation: {
              name: "IsDefinedBy",
              query: propertySetQuery,
            },
          }
        : {}),
    };
  };

  const createQuery = () => {
    const name = (state.queryName ?? "").trim();

    if (!name) {
      if (queryNameMessage) {
        queryNameMessage.textContent = "Enter a query name.";
        queryNameMessage.style.display = "block";
      }
      queryNameInput?.focus();
      return;
    }

    if (queryNameMessage) {
      queryNameMessage.textContent = "";
      queryNameMessage.style.display = "none";
    }

    if (finder.list.has(name)) {
      alert(`A query named "${name}" already exists.`);
      return;
    }

   const activeConditions = conditions.filter((condition) =>
    Boolean(
      condition.category.trim() ||
        condition.psetName.trim() ||
        condition.propertyName.trim() ||
        condition.value.trim(),
    ),
  );

    if (activeConditions.length === 0) {
      alert("Enter at least one filter besides the query name.");
      return;
    }

    const queryParams = activeConditions.map(buildQueryFromCondition);
    const finderQuery = finder.create(name, queryParams);
    finderQuery.aggregation = state.queryAggregation ?? "inclusive";

    for (const input of categoryInputs.values()) input.value = "";
    for (const input of psetInputs.values()) input.value = "";
    for (const input of propertyInputs.values()) input.value = "";
    for (const input of valueInputs.values()) input.value = "";

    conditions.splice(0, conditions.length, createEmptyQueryCondition());
    state.queryName = "";

    if (queryNameInput) queryNameInput.value = "";

    BUI.ContextMenu.removeMenus();
    createQueryDialog?.close();

    state.createQueryStep = "mode";
    state.queryAggregation = "inclusive";

    update();
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
    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
      <!-- Primera fila: búsqueda a todo el ancho. -->
      <bim-text-input
        style="width: 100%; box-sizing: border-box;"
        @input=${onSearch}
        placeholder="Search..."
        debounce="200"
      ></bim-text-input>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 2.5rem 2.5rem; gap: 0.5rem; width: 100%; min-width: 0;">
        
        <bim-button
          style="width: 100%; min-width: 0; box-sizing: border-box;"
          label="Create query"
          @click=${openCreateQueryDialog}
        ></bim-button>

        <!-- Los botones de descarga y carga siguen como hermanos de Create query. -->
        <bim-button
          style="width: 100%; min-width: 0; box-sizing: border-box;"
          icon=${appIcons.DOWNLOAD}
          title="Download queries"
          aria-label="Download queries"
          @click=${exportQueries}
        ></bim-button>

        <bim-button
          style="width: 100%; min-width: 0; box-sizing: border-box;"
          icon=${appIcons.UPLOAD}
          title="Upload queries"
          aria-label="Upload queries"
          @click=${openImportFile}
        ></bim-button>
      </div>

      <dialog
        ${BUI.ref(onCreateQueryDialogCreated)}
        style=${`
          width: ${
            state.createQueryStep === "mode"
              ? "min(22rem, calc(100vw - 2rem))"
              : "min(34rem, calc(100vw - 2rem))"
          };
          height: fit-content;
          max-height: calc(100dvh - 2rem);
          min-height: 0;
          overflow: hidden;
          box-sizing: border-box;
          margin: auto;
          padding: 1rem;
          color: #fff;
          background: #202124;
          border: 1px solid #9aa0a6;
          border-radius: 0.5rem;
        `}
      >
        <div style=${`display: ${
          state.createQueryStep === "mode" ? "flex" : "none"
        }; flex-direction: column; gap: 0.75rem;`}>
          <bim-label style="color: #fff;">
            How do you want to configure the multi-query?
          </bim-label>

          <bim-button
            style="--bim-label--c: #000;"
            label="Inclusive (OR)"
            @click=${() => chooseQueryMode("inclusive")}
          ></bim-button>

          <bim-button
            style="--bim-label--c: #000;"
            label="Exclusive (AND)"
            @click=${() => chooseQueryMode("exclusive")}
          ></bim-button>
        </div>

        <div style=${`display: ${
          state.createQueryStep === "form" ? "flex" : "none"
        }; flex-direction: column; gap: 0.5rem; width: 100%; height: fit-content; min-width: 0; min-height: 0; box-sizing: border-box;`}>
          <bim-text-input
            vertical
            ${BUI.ref(onQueryNameInputCreated)}
            style="--bim-label--c: #fff;"
            label="Query name"
            placeholder="My query"
            @input=${({ target }: { target: BUI.TextInput }) => {
              state.queryName = target.value;
              if (queryNameMessage) {
                queryNameMessage.textContent = "";
                queryNameMessage.style.display = "none";
              }
            }}
          ></bim-text-input>

          <div
            ${BUI.ref(onQueryNameMessageCreated)}
            role="alert"
            style="display: none; color: #fff; font-size: 0.75rem; font-style: italic;"
          ></div>

          <div style="display: flex; flex: 0 1 auto; flex-direction: column; gap: 0.5rem; max-height: min(45vh, 22rem); min-height: 0; overflow-y: auto; overflow-x: hidden;">
            ${conditions.map((condition) => renderConditionRow(condition))}
          </div>

          <bim-button
            style="flex: 0 0 auto; height: 2.5rem; --bim-button--bgc: #087eaa; --bim-label--c: #fff;"
            label="Add condition"
            @click=${addCondition}
          ></bim-button>

          <bim-button
            class="query-create-submit"
             style="flex: 0 0 auto; height: 2.5rem; #42464b; --bim-label--c: #000;"
            label="Create"
            @click=${createQuery}
          ></bim-button>
        </div>
      </dialog>

      <!-- Input oculto que se activa desde el botón Import. -->
      <input
        ${BUI.ref(onImportInputCreated)}
        type="file"
        accept=".json,application/json"
        style="display: none;"
        @change=${importQueries}
      />
    </div>
    <bim-label
      ${BUI.ref(onResultsLabelCreated)}
      style="flex: 0 0 auto; margin: 0.5rem 0;"
    >
      No items are currently selected or colorized.
    </bim-label>

    <div style="min-height: 0; max-height: 18rem; overflow-y: auto; overflow-x: hidden;">
      ${modelsList}
    </div>
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
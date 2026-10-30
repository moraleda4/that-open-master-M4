// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// A diferencia de models.ts y queries.ts, este archivo ya no trabaja con listas, sino con la selección activa del visor.
// Es decir, este panel es el que responde a la pregunta: ¿Qué información tienen los elementos que tengo seleccionados ahora mismo?
// Y aquí se conecta directamente con el Highlighter, que configuraste al principio del proyecto.

// Este archivo define el panel "Selection Data". Su función es mostrar las propiedades BIM de los elementos actualmente seleccionados en el visor.
// El panel no obtiene directamente las propiedades del modelo. En su lugar:
// - Consulta al Highlighter qué elementos están seleccionados.
// - Utiliza el componente itemsData de @thatopen/ui-obc para mostrar automáticamente sus propiedades.

// Además:
//
// - Limpia la tabla cuando se elimina la selección.
// - Permite refrescar manualmente la información mediante
//   un botón.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
// Componente especializado de That Open UI-OBC para mostrar propiedades BIM
import * as CUI from "@thatopen/ui-obc"
import * as OBF from "@thatopen/components-front"
// Simplemente proporciona el icono del botón de refresco
import { appIcons } from "../../globals";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Solo necesita acceder a los Components
export interface ItemsDataPanelState {
  components: OBC.Components;
}

// ======================================================
// COMPONENTE PRINCIPAL: itemsDataPanelTemplate
// ======================================================
export const itemsDataPanelTemplate: BUI.StatefullComponent<
  ItemsDataPanelState
> = (state) => {
  const { components } = state;

  // Recordemos que en setupHighlighter() configurábamos: highlighter.setup({ world })
  // Desde ese momento el Highlighter mantiene siempre información sobre: Elemento seleccionado --> Selección actual --> Eventos de selección
  // Este panel aprovechará precisamente esa información.
  const highlighter = components.get(OBF.Highlighter)

  // Crear la tabla de propiedades
  // ¿Qué devuelve? No devuelve solo una tabla. Devuelve dos cosas:

    // itemsData()
    // ↓
    // propsTable
    // ↓
    // Componente visual
  // ------------------------
    // updatePropsTable()
    // ↓
    // Función para actualizar su contenido

  const [propsTable, updatePropsTable] = CUI.tables.itemsData({
    components,
    // ¿Por qué empieza vacío? Porque cuando se abre la aplicación: No hay ningún elemento seleccionado. Por tanto la tabla no tiene nada que mostrar.
    modelIdMap: {},
  });

  type DataRecord = Record<string, unknown>;

  type ParsedProperty = {
    name: string;
    value: unknown;
    valueAttribute?: string;
  };

  type ParsedGroup = {
    name: string;
    kind: "pset" | "qto";
    entries: ParsedProperty[];
  };

  type LoadedItem = {
    modelId: string;
    item: DataRecord;
  };

  let loadedSelectionData: LoadedItem[] = [];
  let resultsContainer: HTMLDivElement | undefined;

  const onResultsContainerCreated = (element?: Element) => {
    if (element) resultsContainer = element as HTMLDivElement;
  };

  let psetDropdown: BUI.Dropdown | undefined;

  const onPsetDropdownCreated = (element?: Element) => {
    if (element) psetDropdown = element as BUI.Dropdown;
  };

  let entityDropdown: BUI.Dropdown | undefined;
  let predefinedTypeDropdown: BUI.Dropdown | undefined;
  let propertyDropdown: BUI.Dropdown | undefined;

  let latestRefreshId = 0;

  const onEntityDropdownCreated = (element?: Element) => {
    if (element) entityDropdown = element as BUI.Dropdown;
  };

  const onPredefinedTypeDropdownCreated = (element?: Element) => {
    if (element) predefinedTypeDropdown = element as BUI.Dropdown;
  };

  const onPropertyDropdownCreated = (element?: Element) => {
    if (element) propertyDropdown = element as BUI.Dropdown;
  };

  const ALL_ENTITIES = "All IFC Entities";
  const ALL_PREDEFINED_TYPES = "All IFC PredefinedType";
  const ALL_PSETS = "All Psets";
  const ALL_PROPERTIES = "All Properties";

  // Comprueba que el dato sea un objeto antes de leer sus campos.
  const asDataRecord = (value: unknown): DataRecord | undefined => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }

    return value as DataRecord;
  };

  const createFreshDropdown = (
    current: BUI.Dropdown | undefined,
    placeholder: string,
    allLabel: string,
    values: string[],
    onChange: (event: Event) => void,
  ): BUI.Dropdown => {
    const dropdown = document.createElement("bim-dropdown") as BUI.Dropdown;
    dropdown.placeholder = placeholder;
    dropdown.style.setProperty("--bim-drodown--fz", "0.65rem");
    dropdown.addEventListener("change", onChange);

    const options = [...new Set([allLabel, ...values])].map((name) => {
      const option = document.createElement("bim-option");
      option.setAttribute("label", name);
      option.style.setProperty("--bim-label--c", "#fff");
      option.style.setProperty("--bim-label--fz", "0.65rem");
      return option;
    });

    dropdown.append(...options);

    if (current?.isConnected) {
      current.replaceWith(dropdown);
    }

    dropdown.value = [allLabel];
    return dropdown;
  };

  // Los atributos IFC vienen envueltos, por ejemplo: { value: "IFCWALL" }.
  // Este helper devuelve el contenido de "value" cuando existe.
  const getAttributeValue = (record: DataRecord, key: string): unknown => {
    const field = record[key];
    const attribute = asDataRecord(field);

    if (attribute && "value" in attribute) {
      return attribute.value;
    }

    return field;
  };

  // Convierte una relación —que puede ser undefined o no ser una lista—
  // en una lista de objetos que podamos recorrer con seguridad.
  const getRelatedRecords = (value: unknown): DataRecord[] => {
    if (!Array.isArray(value)) return [];

    return value
      .map(asDataRecord)
      .filter((record): record is DataRecord => record !== undefined);
  };

  // Extrae Property Sets y conjuntos de cantidades (Qto).
  const getPropertyGroups = (item: unknown): ParsedGroup[] => {
    const itemRecord = asDataRecord(item);
    if (!itemRecord) return [];

    return getRelatedRecords(itemRecord["IsDefinedBy"]).flatMap((relation): ParsedGroup[] => {
      const category = getAttributeValue(relation, "_category");
      const groupName = getAttributeValue(relation, "Name");

      if (typeof groupName !== "string") return [];

      if (category === "IFCPROPERTYSET") {
        const entries = getRelatedRecords(relation["HasProperties"]).map(
          (property) => {
            const name = getAttributeValue(property, "Name");
            const valueAttribute =
              "NominalValue" in property ? "NominalValue" : undefined;

            return {
              name: typeof name === "string" ? name : "",
              value: valueAttribute
                ? getAttributeValue(property, valueAttribute)
                : undefined,
              valueAttribute,
            };
          },
        );

        return [{ name: groupName, kind: "pset", entries }];
      }

      if (category === "IFCELEMENTQUANTITY") {
        const entries = getRelatedRecords(relation["Quantities"]).map(
          (quantity) => {
            const name = getAttributeValue(quantity, "Name");
            const valueAttribute = Object.keys(quantity).find((key) =>
              key.endsWith("Value"),
            );

            return {
              name: typeof name === "string" ? name : "",
              value: valueAttribute
                ? getAttributeValue(quantity, valueAttribute)
                : undefined,
              valueAttribute,
            };
          },
        );

        return [{ name: groupName, kind: "qto", entries }];
      }

      return [];
    });
  };

  const displayValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const formatAttributeName = (name: string): string => {
    const labels: Record<string, string> = {
      _category: "Category",
      _localId: "LocalID",
      _guid: "GlobalID",
      GlobalId: "GlobalID",
    };

    if (labels[name]) return labels[name];

    return name
      .replace(/^_/, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, (letter) => letter.toUpperCase());
    };

  const renderFilteredItems = (
    items: LoadedItem[],
    selectedPset: string,
    selectedProperty: string,
  ) => {
    if (!resultsContainer) return;

    resultsContainer.replaceChildren();

    if (items.length === 0) {
      const message = document.createElement("p");
      message.textContent = "No matching information for the current filters.";
      resultsContainer.append(message);
      return;
    }

    for (const { modelId, item } of items) {
      const itemDetails = document.createElement("details");
      itemDetails.open = true;

      const summary = document.createElement("summary");
      const itemName = getAttributeValue(item, "Name");
      const entity = getAttributeValue(item, "_category");
      const localId = getAttributeValue(item, "_localId");

      summary.textContent =
        `${displayValue(itemName)} · ${displayValue(entity)} · ` +
        `LocalId ${displayValue(localId)} · ${modelId}`;

      itemDetails.append(summary);

      const attributes = document.createElement("dl");

      attributes.style.display = "grid";
      attributes.style.gridTemplateColumns = "minmax(7rem, max-content) minmax(0, 1fr)";
      attributes.style.columnGap = "0.75rem";
      attributes.style.rowGap = "0.25rem";
      attributes.style.margin = "0.5rem 0";

      for (const [key, rawValue] of Object.entries(item)) {
        if (key === "IsDefinedBy") continue;

        const term = document.createElement("dt");
        term.textContent = formatAttributeName(key);

        const value = document.createElement("dd");
        value.textContent = displayValue(getAttributeValue(item, key));

        term.style.fontWeight = "700";
        term.style.overflowWrap = "anywhere";

        value.style.fontWeight = "400";
        value.style.margin = "0";
        value.style.minWidth = "0";
        value.style.overflowWrap = "anywhere";

        attributes.append(term, value);
      }

      const generalDetails = document.createElement("details");
      generalDetails.open = false;

      const generalSummary = document.createElement("summary");
      generalSummary.textContent = "Element properties";

      generalDetails.append(generalSummary, attributes);
      itemDetails.append(generalDetails);

      const groups = getPropertyGroups(item).filter(
        (group) =>
          (selectedPset === ALL_PSETS || group.name === selectedPset) &&
          (selectedProperty === ALL_PROPERTIES ||
            group.entries.some((entry) => entry.name === selectedProperty)),
      );

      for (const group of groups) {
        const groupDetails = document.createElement("details");
        groupDetails.open = false;

        const groupSummary = document.createElement("summary");
        groupSummary.textContent = `${group.kind.toUpperCase()}: ${group.name}`;
        groupDetails.append(groupSummary);

        const properties = document.createElement("dl");

        properties.style.display = "grid";
        properties.style.gridTemplateColumns = "minmax(7rem, max-content) minmax(0, 1fr)";
        properties.style.columnGap = "0.75rem";
        properties.style.rowGap = "0.25rem";
        properties.style.margin = "0.5rem 0";

        const entries = group.entries.filter(
          (entry) =>
            selectedProperty === ALL_PROPERTIES ||
            entry.name === selectedProperty,
        );

        for (const entry of entries) {
          const term = document.createElement("dt");
          term.textContent = entry.name || "(unnamed)";

          const value = document.createElement("dd");
          value.textContent = displayValue(entry.value);

          term.style.fontWeight = "700";
          term.style.overflowWrap = "anywhere";

          value.style.fontWeight = "400";
          value.style.margin = "0";
          value.style.minWidth = "0";
          value.style.overflowWrap = "anywhere";

          properties.append(term, value);
        }

        groupDetails.append(properties);
        itemDetails.append(groupDetails);
      }

      resultsContainer.append(itemDetails);
    }
  };

  // LECCIÓN 4.5: poder copiar los valores de la columna values al hacer click
  propsTable.dataTransform.Value = (value) => {
    const onClick = ({ target }: { target: BUI.Label }) => {
      navigator.clipboard.writeText(value)
      target.textContent = "Copied!"
      setTimeout(() => {
        target.textContent = value
      }, 500)
    }

    const onMouseOver = ({ target }: { target: BUI.Label }) => {
      target.style.color = "var(--primary)"
    }

    const onMouseLeave = ({ target }: { target: BUI.Label }) => {
      target.style.removeProperty("color")
    }
    
    return BUI.html`
      <bim-label @click=${onClick} @mouseleave=${onMouseLeave} @mouseover=${onMouseOver}>${value}</bim-label>
    `
  }

  // Escuchar cuándo se limpia la selección
  // ¿Qué significa? El Highlighter dispone de distintos eventos. Uno de ellos es: onClear, que ocurre cuando:
    // Usuario
    // ↓
    // Deselecciona todo
  // ¿Qué hacemos?
    // updatePropsTable({
    //     modelIdMap: {}
    // })
  // Es decir:
  // No hay selección
  // ↓
  // Vaciar tabla
  highlighter.events.select.onClear.add(() => {
      latestRefreshId++;
      updatePropsTable({modelIdMap: {}})
      loadedSelectionData = [];
      resultsContainer?.replaceChildren();
    })

    const updateFilterOptions = async () => {
      const refreshId = ++latestRefreshId;
      const selection = highlighter.selection.select;

      if (OBC.ModelIdMapUtils.isEmpty(selection)) return;

      const fragments = components.get(OBC.FragmentsManager);
      const psetNames = new Set<string>();
      const entityNames = new Set<string>();
      const predefinedTypes = new Set<string>();

      const loadedItems: LoadedItem[] = [];

      // Aquí mueve el bucle actual que recorre la selección,
      // llama a model.getItemsData() y recopila:
      // - psetNames
      // - entityNames
      // - predefinedTypes
      for (const [modelId, localIds] of Object.entries(selection)) {
        const model = fragments.list.get(modelId);
        if (!model || localIds.size === 0) continue;

        const data = await model.getItemsData([...localIds], {
          attributesDefault: true,
          relations: {
            IsDefinedBy: { attributes: true, relations: true },
          },
        });

        for (const item of data) {

          const itemRecord = asDataRecord(item);
            if (!itemRecord) continue;

            loadedItems.push({ modelId, item: itemRecord });

          const entity = itemRecord
            ? getAttributeValue(itemRecord, "_category")
            : undefined;

          if (typeof entity === "string") {
            entityNames.add(entity);
          }

          const predefinedType = itemRecord
            ? getAttributeValue(itemRecord, "PredefinedType")
            : undefined;

          if (typeof predefinedType === "string" && predefinedType.trim() !== "") {
            predefinedTypes.add(predefinedType);
          }

          for (const pset of getPropertyGroups(item)) {
            psetNames.add(pset.name);
          }
        }
      }

      if (refreshId !== latestRefreshId) return;

      loadedSelectionData = loadedItems;

      // Aquí mueve las tres llamadas actuales a createFreshDropdown:
      // Psets, entidades IFC y PredefinedType.
      psetDropdown = createFreshDropdown(
        psetDropdown,
        "Pset…",
        "All Psets",
        [...psetNames].sort(),
        () => {
          updatePropertyOptions();
        },
      );

      entityDropdown = createFreshDropdown(
        entityDropdown,
        "IFC Entity…",
        "All IFC Entities",
        [...entityNames].sort(),
        () => {
          updatePropertyOptions();
        },
      );

      predefinedTypeDropdown = createFreshDropdown(
        predefinedTypeDropdown,
        "IFC PredefinedType…",
        "All IFC PredefinedType",
        [...predefinedTypes].sort(),
        () => {
          updatePropertyOptions();
        },
      );
  };

  highlighter.events.select.onHighlight.add(async () => {
    await updateFilterOptions();
    updatePropertyOptions();
  });

  const getFilteredItems = (
    selectedEntity: string,
    selectedPredefinedType: string,
    selectedPset: string,
  ): LoadedItem[] => {
    const selection = highlighter.selection.select;

    return loadedSelectionData.filter(({ modelId, item }) => {
      const localId = Number(getAttributeValue(item, "_localId"));
      const isStillSelected = selection[modelId]?.has(localId) ?? false;

      if (!isStillSelected) return false;

      const entity = getAttributeValue(item, "_category");
      const predefinedType = getAttributeValue(item, "PredefinedType");
      const groups = getPropertyGroups(item);

      const matchesEntity =
        selectedEntity === "All IFC Entities" || entity === selectedEntity;

      const matchesPredefinedType =
        selectedPredefinedType === "All IFC PredefinedType" ||
        predefinedType === selectedPredefinedType;

      const matchesPset =
        selectedPset === "All Psets" ||
        groups.some((group) => group.name === selectedPset);

      return matchesEntity && matchesPredefinedType && matchesPset;
    });
  };

  const updatePropertyOptions = () => {
    const selectedEntity = entityDropdown?.value?.[0] ?? ALL_ENTITIES;
    const selectedPredefinedType =
      predefinedTypeDropdown?.value?.[0] ?? ALL_PREDEFINED_TYPES;
    const selectedPset = psetDropdown?.value?.[0] ?? ALL_PSETS;

    const propertyNames = new Set<string>();

    const matchingItems = getFilteredItems(
      selectedEntity,
      selectedPredefinedType,
      selectedPset,
    );

    for (const { item } of matchingItems) {
      const groups = getPropertyGroups(item).filter(
        (group) => selectedPset === ALL_PSETS || group.name === selectedPset,
      );

      for (const group of groups) {
        for (const entry of group.entries) {
          if (entry.name) propertyNames.add(entry.name);
        }
      }
    }

    propertyDropdown = createFreshDropdown(
      propertyDropdown,
      "Property…",
      ALL_PROPERTIES,
      [...propertyNames].sort(),
      (event) => {},
    );
  };

  // Botón Refresh: aquí sí se actualizan las propiedades.
  const onRefresh = () => {
    const selection = highlighter.selection.select;

    if (OBC.ModelIdMapUtils.isEmpty(selection)) {
      resultsContainer?.replaceChildren();
      return;
    }

    const allEntitiesLabel = "All IFC Entities";
    const allPredefinedTypesLabel = "All IFC PredefinedType";
    const allPsetsLabel = "All Psets";

    const selectedEntity = entityDropdown?.value?.[0] ?? allEntitiesLabel;
    const selectedPredefinedType =
      predefinedTypeDropdown?.value?.[0] ?? allPredefinedTypesLabel;
    const selectedPset = psetDropdown?.value?.[0] ?? allPsetsLabel;
    const selectedProperty = propertyDropdown?.value?.[0] ?? ALL_PROPERTIES;

    const filteredItems = getFilteredItems(
      selectedEntity,
      selectedPredefinedType,
      selectedPset,
    );

    const propertyFilteredItems = filteredItems.filter(({ item }) => {
      if (selectedProperty === ALL_PROPERTIES) return true;

      return getPropertyGroups(item).some(
        (group) =>
          (selectedPset === ALL_PSETS || group.name === selectedPset) &&
          group.entries.some((entry) => entry.name === selectedProperty),
      );
    });

    renderFilteredItems(propertyFilteredItems, selectedPset, selectedProperty);
  };

  // Resultado visual:
  // ┌───────────────────────────────┐
  // │ Selection Data                │
  // │                               │
  // │ [↻]                           │
  // │                               │
  // ├───────────────────────────────┤
  // │ Name          Wall_001        │
  // │ Height        3.20            │
  // │ Width         0.20            │
  // │ Fire Rating   EI120           │
  // │ ...                           │
  // └───────────────────────────────┘
  return BUI.html`<bim-panel-section fixed label="Selection Data">
    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem;">
        <bim-dropdown
          style="--bim-drodown--fz: 0.65rem;"
          ${BUI.ref(onEntityDropdownCreated)}
          placeholder="IFC Entity…"
        ></bim-dropdown>

        <bim-dropdown
          style="--bim-drodown--fz: 0.65rem;"
          ${BUI.ref(onPredefinedTypeDropdownCreated)}
          placeholder="IFC PredefinedType…"
        ></bim-dropdown>

        <bim-dropdown
          style="--bim-drodown--fz: 0.65rem;"
          ${BUI.ref(onPsetDropdownCreated)}
          placeholder="Pset…"
        ></bim-dropdown>

        <bim-dropdown
          style="--bim-drodown--fz: 0.65rem;"
          ${BUI.ref(onPropertyDropdownCreated)}
          placeholder="Property…"
        ></bim-dropdown>
      </div>

      <bim-button
        style="width: 100%; height: 2.5rem;"
        icon=${appIcons.REFRESH}
        @click=${onRefresh}
      ></bim-button>
    </div>
    <div ${BUI.ref(onResultsContainerCreated)}  style="width: 100%; min-width: 0; max-height: 20rem; overflow: auto; margin-top: 0.75rem; color: white; font-size: 0.75rem;"></div>
  </bim-panel-section>`;
};

// ======================================================
// RELACIÓN CON ARQUITECTURA
// ======================================================
// Usuario
// ↓
// Selecciona elemento
// ↓
// Highlighter
// ↓
// selection
// ↓
// updatePropsTable()
// ↓
// itemsData()
// ↓
// Tabla de propiedades


// setupHighlighter()
//         │
//         ▼
// Highlighter
//         │
//         ├──────── viewerToolbar
//         │            │
//         │            ├── Hide
//         │            ├── Isolate
//         │            ├── Colorize
//         │            └── Reset
//         │
//         └──────── itemsDataPanel
//                      │
//                      ▼
//               Tabla de propiedades

// Es decir, el Highlighter ya no sirve únicamente para colorear elementos. También es el componente que mantiene la selección activa utilizada por otras partes de la aplicación.
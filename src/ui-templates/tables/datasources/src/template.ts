import * as BUI from "@thatopen/ui";
import { DataSourcesListState } from "./types";
import { DataEnhancer } from "../../../../bim-components/DataEnhancer";
import * as OBF from "@thatopen/components-front";

export const dataSourcesListTemplate: BUI.StatefullComponent<DataSourcesListState> = (state) => {
  const { components, source } = state;

  const onCreated = (e?: Element) => {
    if (!e) return;

    const table = e as BUI.Table;

    table.loadFunction = async () => {
      const data: typeof table.data = [];
      if (!source) return data;

      const enhancer = components.get(DataEnhancer);
      const sourceData = await enhancer.getSourceData(source);

      for (const entry of sourceData) {
        if (source === "Technical Documentation") {
          data.push({
            data: {
              category: entry.category,
              url: entry.url,
              sourceRecord: entry,
            } as any,
          });
        } else if (source === "Activities") {
          data.push({
            data: {
              name: entry.name,
              guids: Array.isArray(entry.guids)
                ? entry.guids.join(", ")
                : String(entry.guids ?? ""),
              sourceRecord: entry,
            } as any,
          });
        } else {
          data.push({ data: entry });
        }
      }

      return data;
    };

    const selectSourceRecord = async (
      rowData: Record<string, any>,
    ) => {
      if (!source) return;

      try {
        const enhancer = components.get(DataEnhancer);
        const highlighter = components.get(OBF.Highlighter);
        const sourceRecord = rowData.sourceRecord ?? rowData;

        const items = await enhancer.getItemsForSourceRecord(
          source,
          sourceRecord,
        );

        await highlighter.clear("select");

        const hasItems = Object.values(items).some(
          (localIds) => localIds.size > 0,
        );

        if (hasItems) {
          await highlighter.highlightByID("select", items);
        }
      } catch (error) {
        console.error("Could not select items for this source record:", error);
      }
    };

    const renderButton = (
      value: unknown,
      rowData: Record<string, any>,
    ) => BUI.html`
      <bim-button
        style="width: 100%; text-align: center; color: #fff; --bim-label--c: #fff;"
        label=${String(value ?? "")}
        @click=${() => void selectSourceRecord(rowData)}
      ></bim-button>
    `;

    table.dataTransform = {};

    if (source === "Technical Documentation") {
      table.dataTransform = {
        category: (value, rowData) => renderButton(value, rowData),
      };
    } else if (source === "Activities") {
      table.dataTransform = {
        name: (value, rowData) => renderButton(value, rowData),
      };
    }

    table.columns =
      source === "Technical Documentation"
        ? ["category", "url"]
        : source === "Activities"
          ? ["name", "guids"]
          : [];

    table.hiddenColumns =
      source === "Activities"
        ? ["sourceRecord", "category", "url"]
        : source === "Technical Documentation"
          ? ["sourceRecord", "name", "guids"]
          : ["sourceRecord", "name", "guids", "category", "url"];

    if (source) {
      table.loadData(true).catch((error) => {
        console.error(`Could not load data for source "${source}":`, error);
      });
    } else {
      table.data = [];
    }
  };

  return BUI.html`
    <bim-table ${BUI.ref(onCreated)}>
      <bim-label style="white-space: normal;" slot="missing-data">Select a source from the list to inspect the information.</bim-label>
    </bim-table> 
  `;
};
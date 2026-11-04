import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { dataSourcesList } from "../tables/datasources";
import { DataEnhancer } from "../../bim-components/DataEnhancer";

export interface DataSourcesPanelState {
  components: OBC.Components;
}

export const dataSourcesPanelTemplate: BUI.StatefullComponent<
  DataSourcesPanelState
> = (state) => {
  const { components } = state;
  const enhancer = components.get(DataEnhancer)

  const [dataSources, updateDataSources] = dataSourcesList({
    components,
  });

  const onSourceChange = ({ target }: { target: BUI.Dropdown }) => {
    const [source] = target.value
    updateDataSources({ source })
    BUI.ContextMenu.removeMenus()
  }

  const onSearch = (event: Event) => {
    const input = event.target as BUI.TextInput;
    dataSources.queryString = input.value;
  };

  return BUI.html`
    <bim-panel-section fixed label="Sources">
      <div
        style="
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr);
          gap: 0.75rem;
          width: 100%;
          height: 100%;
          min-height: 0;
        "
      >
        <bim-dropdown
          style="--bim-drodown--fz: 0.65rem;"
          @change=${onSourceChange}
          placeholder="Select a datasource..."
        >
          ${[...enhancer.sources.keys()].map(
            (source) => BUI.html`
              <bim-option
                label=${source}
                style="--bim-label--c: #fff;"
              ></bim-option>
            `,
          )}
        </bim-dropdown>

        <bim-text-input
          style="width: 100%;"
          placeholder="Search category or activity..."
          debounce="200"
          @input=${onSearch}
        ></bim-text-input>

        ${dataSources}
      </div>
    </bim-panel-section>
  `;
};
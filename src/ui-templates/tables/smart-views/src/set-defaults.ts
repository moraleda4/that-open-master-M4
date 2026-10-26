import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { SmartViewsListState, SmartViewsListTableData } from "./types";
import { appIcons } from "../../../../globals";
import { SmartViews} from "../../../../bim-components";

export const setDefaults = (
  state: SmartViewsListState,
  table: BUI.Table<SmartViewsListTableData>,
) => {
  const { components, onSmartViewsChange } = state

  table.noIndentation = true
  table.headersHidden = true
  table.columns = ["Name", {name: "Actions", width: "auto"}] 
  table.hiddenColumns = ["guid"]
  table.dataTransform = {
    Actions: (cellValue, rowData) => {
      const { guid } = rowData
      if (!guid) return cellValue
      
      const smartViews = components.get(SmartViews)
      const view = smartViews.list.get(guid)
      if(!view) return cellValue
      
      const onClick = async ({target: button}: {target: BUI.Button}) => {
        button.loading = true
        await smartViews.apply(view, guid)
        button.loading = false
      }

      const onUpdate = async ({ target: button }: { target: BUI.Button }) => {
        button.loading = true;

        try {
          smartViews.updateView(guid);
          await onSmartViewsChange();
        } catch (error) {
          console.error("Could not update Smart View:", error);
          alert("Apply this Smart View before updating it.");
        } finally {
          button.loading = false;
        }
      };

      return BUI.html`
        <div style="display: flex; gap: 0.25rem;">
          <bim-button style="flex: 0;" icon=${appIcons.APPLY} @click=${onClick}></bim-button>
          <bim-button style="flex: 0;" label="Update" @click=${onUpdate}></bim-button>
        </div>
      `;
    }
  }
}
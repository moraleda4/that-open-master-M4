import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { SmartViewsListState, SmartViewsListTableData } from "./types";
import { appIcons } from "../../../../globals";
import { SmartViews} from "../../../../bim-components";

export const setDefaults = (
  state: SmartViewsListState,
  table: BUI.Table<SmartViewsListTableData>,
) => {
  const { components, onSmartViewsChange, onUpdateRequest } = state

  table.noIndentation = true
  table.headersHidden = true
  table.columns = ["Name", {name: "Actions", width: "auto"}] 
  table.hiddenColumns = ["guid"]
  table.dataTransform = {
    Name: (cellValue) => {
      if (!cellValue) return cellValue;

      return BUI.html`
        <bim-label style="color: #fff;">${cellValue}</bim-label>
      `;
    },
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

      const onUpdate = () => {
        onUpdateRequest(guid, view.name);
      };

      const onDelete = async ({ target: button }: { target: BUI.Button }) => {
        const confirmed = window.confirm(`Delete Smart View "${view.name}"?`);
        if (!confirmed) return;

        button.loading = true;

        try {
          smartViews.list.delete(guid);

          // Si se elimina la vista que está aplicada, limpia también su estado del visor.
          if (smartViews.currentViewId === guid) {
            await smartViews.reset();
          }

          await onSmartViewsChange();
        } finally {
          button.loading = false;
        }
      };

      return BUI.html`
        <div style="display: flex; gap: 0.25rem;">
          <bim-button
            style="flex: 0; --bim-label--c: #fff;"
            icon=${appIcons.APPLY}
            @click=${onClick}
          ></bim-button>

          <bim-button
            style="flex: 0; --bim-label--c: #fff;"
            label="Update"
            @click=${onUpdate}
          ></bim-button>

          <bim-button
            style="flex: 0; --bim-label--c: #fff;"
            icon=${appIcons.DELETE}
            @click=${onDelete}
          ></bim-button>
        </div>
      `;
    }
  }
}
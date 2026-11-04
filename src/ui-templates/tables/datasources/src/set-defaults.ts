import * as BUI from "@thatopen/ui";

export const setDefaults = (table: BUI.Table) => {

  table.noIndentation = true
  
  table.addEventListener("cellcreated", (event) => {
    const { cell } = (
      event as CustomEvent<{ cell: HTMLElement }>
    ).detail;

    if (cell.hasAttribute("data-cell-header")) {
      cell.style.justifyContent = "center";
      cell.style.textAlign = "center";
    }
  });

  table.addEventListener("rowcreated", (event) => {
    const { row } = (
      event as CustomEvent<BUI.RowCreatedEventDetail>
    ).detail;
    row.style.cursor = "pointer";
  })
}
// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { smartViewsList } from "../tables/smart-views";
import { appIcons } from "../../globals";
import { SmartViews } from "../../bim-components";


// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El panel solo necesita acceso a los componentes BIM.
export interface SmartViewsPanelState {
  components: OBC.Components;
  onSmartViewsChange: () => Promise<void>;
}

let textInput: BUI.TextInput | undefined;
let createSmartViewButton: BUI.Button | undefined;
let editingSmartViewId: string | null = null;

// ======================================================
// COMPONENTE PRINCIPAL: smartViewsPanelTemplate
// ======================================================
export const smartViewsPanelTemplate: BUI.StatefullComponent<
  SmartViewsPanelState
> = (state) => {
  const { components, onSmartViewsChange } = state;
  
  const onUpdateRequest = (id: string, name: string) => {
    editingSmartViewId = id;

    if (textInput) textInput.value = name;
    createSmartViewButton?.click();
  };
  
  const [smartViewsElement] = smartViewsList({
    components,
    onSmartViewsChange,
    onUpdateRequest,
  });

  const onCreateButtonCreated = (element?: Element) => {
    if (element) createSmartViewButton = element as BUI.Button;
  };

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    smartViewsElement.queryString = input.value;
  };

  let textInput: BUI.TextInput | undefined;
  const onTextInputCreated = (e?: Element) => {
    if (!e) return;
    textInput = e as BUI.TextInput;
  };

  let importFileInput: HTMLInputElement | undefined;
  const onImportInputCreated = (e?: Element) => {
    if (!e) return;
    importFileInput = e as HTMLInputElement;
  };

  const onCreatedClick = async () => {
    if (!textInput) return;

    const name = textInput.value;
    if (name.trim() === "") return;

    const smartViews = components.get(SmartViews);
    
    if (editingSmartViewId) {
      smartViews.updateView(editingSmartViewId, name);
      editingSmartViewId = null;
    } else {
      smartViews.saveCurrentState(name);
    }

    textInput.value = "";

    BUI.ContextMenu.removeMenus();

    await onSmartViewsChange();
  };

  const onReset = async ({target: button}: {target: BUI.Button}) => {
    button.loading = true
    const smartViews = components.get(SmartViews)
    await smartViews.reset(true);
    window.dispatchEvent(new Event("query-results-reset"));
    button.loading = false
  }

  const downloadSmartViews = (includeQueries: boolean) => {
    const smartViews = components.get(SmartViews);
    const json = JSON.stringify(
      smartViews.exportToJSON(includeQueries),
      null,
      2,
    );

    const file = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = includeQueries
      ? "smart-views-and-queries.json"
      : "smart-views.json";

    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportSmartViews = () => {
    const dialog = document.createElement("dialog");
    const content = document.createElement("div");

    content.style.cssText = `
      width: min(24rem, calc(100vw - 2rem));
      box-sizing: border-box;
      padding: 1rem;
      color: #fff;
      background: #292d32;
      border: 1px solid #9aa0a6;
      border-radius: 8px;
    `;

    const title = document.createElement("p");
    title.textContent = "What do you want to export?";
    title.style.margin = "0 0 1rem";

    const buttons = document.createElement("div");
    buttons.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    `;

    const viewsButton = document.createElement("button");
    viewsButton.textContent = "Smartviews";

    const viewsAndQueriesButton = document.createElement("button");
    viewsAndQueriesButton.textContent = "Smartviews + Queries";

    for (const button of [viewsButton, viewsAndQueriesButton]) {
      button.style.cssText = `
        border: 0;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
      `;
    }

    viewsButton.addEventListener("click", () => {
      downloadSmartViews(false);
      dialog.close();
    });

    viewsAndQueriesButton.addEventListener("click", () => {
      downloadSmartViews(true);
      dialog.close();
    });

    dialog.style.cssText = `
      padding: 0;
      color: #fff;
      background: transparent;
      border: 0;
    `;

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener(
      "close",
      () => dialog.remove(),
      { once: true },
    );

    buttons.append(viewsButton, viewsAndQueriesButton);
    content.append(title, buttons);
    dialog.append(content);
    document.body.append(dialog);
    dialog.showModal();
  };
  
  const openImportFile = () => {
    importFileInput?.click();
  };

  const importSmartViews = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const smartViews = components.get(SmartViews);

      smartViews.importFromJSON(parsed);
      await onSmartViewsChange();
    } catch (error) {
      console.error("Could not import Smart Views:", error);
      alert("The selected file is not a valid Smart Views export.");
    } finally {
      input.value = "";
    }
  };

  return BUI.html`
  <bim-panel-section fixed label="Smart Views">
    <div style="display: grid; grid-template-columns: minmax(3rem, 0.7fr) minmax(0, 1.9fr) minmax(3rem, 0.7fr) minmax(3rem, 0.7fr); gap: 0.5rem; width: 100%;">
      <bim-text-input style="grid-column: 1 / -1; width: 100%;" @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
      <bim-button style="width: 100%; min-width: 0;" @click=${onReset} icon=${appIcons.CLEAN}></bim-button>
      <bim-button ${BUI.ref(onCreateButtonCreated)} style="width: 100%; min-width: 0;" label="Create Smartview">
        <bim-context-menu>
          <div style="display: flex; gap: 0.5rem;">
            <bim-text-input ${BUI.ref(onTextInputCreated)} style="width: 10rem"></bim-text-input>
            <bim-button @click=${onCreatedClick}  style="flex: 0; --bim-label--c: #000;" label="Create"></bim-button>
          </div>
        </bim-context-menu>
      </bim-button>

      <bim-button  icon=${appIcons.DOWNLOAD} style="width: 100%; min-width: 0;" @click=${exportSmartViews}></bim-button>
      <bim-button icon=${appIcons.UPLOAD} style="width: 100%; min-width: 0;" @click=${openImportFile}></bim-button>
      <input ${BUI.ref(onImportInputCreated)} type="file" accept=".json,application/json" style="display: none;" @change=${importSmartViews}/>
      
    </div>
    ${smartViewsElement}
  </bim-panel-section>`;
};
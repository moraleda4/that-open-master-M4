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

// ======================================================
// COMPONENTE PRINCIPAL: smartViewsPanelTemplate
// ======================================================
export const smartViewsPanelTemplate: BUI.StatefullComponent<
  SmartViewsPanelState
> = (state) => {
  const { components, onSmartViewsChange } = state;

  const [smartViewsElement] = smartViewsList({
    components,
    onSmartViewsChange,
  });

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
    smartViews.saveCurrentState(name);

    await onSmartViewsChange();
  };

  const onReset = async ({target: button}: {target: BUI.Button}) => {
    button.loading = true
    const smartViews = components.get(SmartViews)
    await smartViews.reset()
    button.loading = false
  }

  const exportSmartViews = () => {
    const smartViews = components.get(SmartViews);
    const json = JSON.stringify(smartViews.exportToJSON(), null, 2);
    const file = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-views.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
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
    <div style="display: flex; gap: 0.5rem;">
      <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
      <bim-button @click=${onReset} icon=${appIcons.REFRESH} style="flex: 0"></bim-button>
      <bim-button style="flex: 0" icon=${appIcons.ADD}>
        <bim-context-menu>
          <div style="display: flex; gap: 0.5rem;">
            <bim-text-input ${BUI.ref(onTextInputCreated)} style="width: 10rem"></bim-text-input>
            <bim-button @click=${onCreatedClick} style="flex: 0" label="Create"></bim-button>
          </div>
        </bim-context-menu>
      </bim-button>

      <bim-button label="Export" @click=${exportSmartViews}></bim-button>
      <bim-button label="Import" @click=${openImportFile}></bim-button>
      <input ${BUI.ref(onImportInputCreated)} type="file" accept=".json,application/json" style="display: none;" @change=${importSmartViews}/>
      
    </div>
    ${smartViewsElement}
  </bim-panel-section>`;
};
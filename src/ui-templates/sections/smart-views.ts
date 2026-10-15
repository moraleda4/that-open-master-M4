// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { smartViewsList } from "../tables/smart-views";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// El panel solo necesita acceso a los componentes BIM.
export interface SmartViewsPanelState {
  components: OBC.Components;
}

// ======================================================
// COMPONENTE PRINCIPAL: smartViewsPanelTemplate
// ======================================================
export const smartViewsPanelTemplate: BUI.StatefullComponent<
  SmartViewsPanelState
> = (state) => {
  const { components } = state;

  const [smartViewsElement] = smartViewsList({
    components,
  });

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    smartViewsElement.queryString = input.value;
  };

  return BUI.html`
  <bim-panel-section fixed label="Smart Views">
    <div style="display: flex; gap: 0.5rem;">
      <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
    </div>
    ${smartViewsElement}
  </bim-panel-section>`;
};
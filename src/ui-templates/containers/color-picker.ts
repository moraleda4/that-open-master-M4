import * as BUI from "@thatopen/ui";
import { appIcons } from "../../globals";

export interface ColorPickerState {
  onApply: (color: string) => Promise<void>;
}

export const colorPickerTemplate: BUI.StatefullComponent<ColorPickerState> = (
  state,
) => {
  let colorInput: BUI.ColorInput | undefined;

  const onInputCreated = (element?: Element) => {
    if (!element) return;
    colorInput = element as BUI.ColorInput;
  };

  const onApply = async ({ target: button }: { target: BUI.Button }) => {
    if (!colorInput) return;

    button.loading = true;
    try {
      await state.onApply(colorInput.color);
      BUI.ContextMenu.removeMenus();
    } finally {
      button.loading = false;
    }
  };

  return BUI.html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <bim-color-input ${BUI.ref(onInputCreated)}></bim-color-input>
      <bim-button
        style="flex: 0;"
        icon=${appIcons.APPLY}
        label="Apply"
        @click=${onApply}
      ></bim-button>
    </div>
  `;
};

export const createColorPicker = (state: ColorPickerState) => {
  const [element] = BUI.Component.create(colorPickerTemplate, state);
  return element;
};
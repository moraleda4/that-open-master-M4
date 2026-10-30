import * as BUI from "@thatopen/ui";
import { appIcons } from "../../globals";

export interface ColorPickerState {
  onApply: (color: string) => Promise<void>;
}

// Colores predefinidos que se mostrarán como botones en la paleta.
const PRESET_COLORS = [
  { name: "Red", value: "#e53935" },
  { name: "Orange", value: "#fb8c00" },
  { name: "Yellow", value: "#fdd835" },
  { name: "Green", value: "#43a047" },
  { name: "Cyan", value: "#00acc1" },
  { name: "Blue", value: "#1e88e5" },
  { name: "Indigo", value: "#3949ab" },
  { name: "Purple", value: "#8e24aa" },
] as const;

export const colorPickerTemplate: BUI.StatefullComponent<ColorPickerState> = (
  state,
) => {
  let colorInput: BUI.ColorInput | undefined;

  const onInputCreated = (element?: Element) => {
    if (!element) return;
    colorInput = element as BUI.ColorInput;
  };

  // Aplica el color recibido y cierra el menú si la operación termina correctamente.
   const applyColor = async (color: string) => {
    await state.onApply(color);
    BUI.ContextMenu.removeMenus();
  };

  // Conserva la opción de elegir un color personalizado.
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
      <span style="font-size: 0.85rem;">Preset colors</span>

      <div
        role="group"
        aria-label="Preset colors"
        style="
          display: grid;
          grid-template-columns: repeat(4, 1.5rem);
          gap: 0.4rem;
        "
      >
        ${PRESET_COLORS.map(
          ({ name, value }) => BUI.html`
            <button
              type="button"
              title=${name}
              aria-label=${`Apply ${name}`}
              style=${`
                width: 1.5rem;
                height: 1.5rem;
                padding: 0;
                border: 1px solid #777;
                border-radius: 50%;
                background-color: ${value};
                cursor: pointer;
              `}
              @click=${() => applyColor(value)}
            ></button>
          `,
        )}
      </div>
      
      <bim-color-input ${BUI.ref(onInputCreated)}></bim-color-input>
      <bim-button
        style="flex: 0; margin-bottom: 0.35rem; --bim-label--c: #000; --bim-icon--c: #000;"
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
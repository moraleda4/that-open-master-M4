// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// viewerToolbarTemplate crea una barra de herramientas que permite al usuario interactuar con los modelos cargados. Concretamente implementa las siguientes acciones:

  // 1. Mostrar todos los elementos ocultos.
  // 2. Ocultar la selección actual.
  // 3. Aislar la selección.
  // 4. Aplicar un color personalizado a la selección.
  // 5. Restaurar el resaltado.
  // 6. Activar o desactivar el modo Ghost (modelo semitransparente).

// Es decir, este archivo es el puente entre la interfaz y los servicios BIM.

// ======================================================
// ARQUITECTURA DEL ARCHIVO
// ======================================================
// A diferencia de los anteriores, aquí aparecen varios componentes trabajando juntos:
// ViewerToolbar
// │
// ├── Highlighter
// │
// ├── Hider
// │
// ├── FragmentsManager
// │
// ├── ColorInput
// │
// └── ContextMenu

// Cada botón invoca un servicio distinto del motor.

// ======================================================
// OBSERVACIONES DEL DISEÑO DE LA APP
// ======================================================
// Este es el primer archivo del proyecto donde se aprecia una interacción completa entre UI y BIM.
// Aquí convergen prácticamente todos los componentes que has configurado en bim-components:

  // 1. Highlighter para seleccionar y colorear elementos.
  // 2. Hider para gestionar la visibilidad.
  // 3. FragmentsManager para modificar los materiales del modelo.
  // 4. Three.js para trabajar directamente con colores y propiedades gráficas.

// Es, probablemente, el archivo que mejor resume la arquitectura de tu aplicación hasta este punto. 
// Si alguien entendiera únicamente setupComponents, createWorld y viewerToolbarTemplate, tendría una visión bastante completa de cómo está organizada toda la aplicación.

// ======================================================
// IMPORTACIONES
// ======================================================
// Se utiliza para construir toda la interfaz: Toolbar, ToolbarSection, Buttons, ContextMenu, ColorInput
import * as BUI from "@thatopen/ui";
// Aquí aparecen varios componentes que ya conocemos: FragmentsManager, Hider, ModelIdMapUtils
import * as OBC from "@thatopen/components";
// Aquí volvemos a utilizar: Highlighter que vimos en setupHighlighter()
import * as OBF from "@thatopen/components-front";
// Se importan los iconos globales para incorporarlos en los diferentes botones del toolbar
import { appIcons } from "../../globals";
// Hasta ahora no habíamos utilizado Three.js directamente. Aquí sí, ya que lo necesitaremos para crear colores personalizados
import * as THREE from "three"
// Se utiliza para acceder al tipo FRAGS.BIMMaterial
import * as FRAGS from "@thatopen/fragments"

import { createColorPicker } from "./color-picker";
import { SmartViews } from "../../bim-components";


// Almacena el estado original de los materiales para poder restaurarlo después de activar el modo "Ghost"
// Su misión es guardar el estado original de cada material antes de modificarlo
// Visualmente funciona así:
  // Material original
  //         │
  //         ▼
  // Map
  //         │
  //         ▼
  // Color
  // Opacity
  // Transparency
  // LOD Opacity
// Gracias a esto luego podremos restaurar exactamente el aspecto inicial
const originalMaterialsData = new Map<
  FRAGS.BIMMaterial,
  { color: number; transparent: boolean; opacity: number; lodOpacity?: number }
>();

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Solo necesita una cosa: components, porque desde él accederá a todos los servicios BIM
export interface ViewerToolbarState {
  components: OBC.Components;
  world: OBC.World
}

// ======================================================
// COMPONENTE PRINCIPAL: viewerToolbarTemplate
// ======================================================
// ======================================================
// Bloque 1. Creación del componente
// ======================================================
// BUI.StatefullComponent<ViewerToolbarState> = "La función que viene a continuación tiene que cumplir el contrato de un componente con estado." Es parecido a una interfaz
// Un componente de That Open UI siempre recibe un objeto llamado state. Ese objeto contiene toda la información que necesita para construirse
// En este caso ViewerToolbarState definido previamente
export const viewerToolbarTemplate: BUI.StatefullComponent<
  ViewerToolbarState
> = (state) => {
  // Desestructuración. Sin desestructurar escribiríamos: const components = state.components; Simplemente evita repetir:state. durante todo el archivo
  // ¿Qué contiene realmente components? No es un array. No es una lista. No es un objeto cualquiera. Es exactamente el mismo objeto que creamos aquí:
    // const components = new OBC.Components(); en setupComponents()
  // Es decir, toda la aplicación comparte esta misma instancia
  const { components, world } = state;

  // ======================================================
  // Bloque 2. Colorize
  // ======================================================
  // Aplica un color personalizado a los elementos actualmente seleccionados.
  // La interfaz de selección de color y el botón Apply están en color-picker.ts.
  // Esta función define qué debe hacer la toolbar cuando recibe el color elegido.
  const applyColorToSelection = async (color: string) => {
    const highlighter = components.get(OBF.Highlighter);
    const selection = highlighter.selection.select;

    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;

    if (!highlighter.styles.has(color)) {
      highlighter.styles.set(color, {
        color: new THREE.Color(color),
        renderedFaces: 1,
        opacity: 1,
        transparent: false,
      });
    }

    // highlightByID() es la función que realmente colorea los elementos
    // Aplica el color a los elementos seleccionados.
    await highlighter.highlightByID(
      color,
      selection,
      false,
      false,
    );

    // Registra el color individual para que Smart Views pueda guardarlo con Update.
    components.get(SmartViews).addItemColor(color, selection);

    // Quita la selección activa, pero conserva el color aplicado.
    await highlighter.clear("select");
  };
  // FLUJO:
    //   Usuario pulsa Apply
    //         │
    //         ▼
    // Obtener color
    //         │
    //         ▼
    // Obtener selección
    //         │
    //         ▼
    // ¿Hay selección?
    //         │
    //         ├── No → salir
    //         │
    //         ▼
    // Crear estilo (si no existe)
    //         │
    //         ▼
    // Aplicar color
    //         │
    //         ├── highlightByID()
    //         └── clear("select")
  
  
  // ¿Cuándo se ejecuta? Esta función se ejecuta cuando el usuario pulsa este botón del menú contextual:
    // <bim-button
    //     icon=${appIcons.CLEAR}
    //     label="Reset"
    //     @click=${onReset}>
    // </bim-button>

  const onReset = async ({ target }: { target: BUI.Button }) => {
    target.loading = true;
    const highlighter = components.get(OBF.Highlighter)
    // Restaura todos los resaltados a su color original
    // clear() elimina todos esos estilos. 
    // Porque el Highlighter no modifica permanentemente el modelo. Lo que hace es aplicar estilos temporales. Internamente guarda cuál era el material original
    // No está reseteando la selección: clear("select"). No está reseteando el visor. Está reseteando el estado del Highlighter.
    await highlighter.clear()
    BUI.ContextMenu.removeMenus()
    target.loading = false;
  };
  
  // ======================================================
  // Bloque 3. Hide / Isolate / Show All
  // ======================================================
  // Oculta todos los elementos seleccionados
    // Hider (visible = S/N)
    // ↓
    // Decide si un elemento se renderiza o no

  const onHide = async ({ target }: { target: BUI.Button }) => {
    // ¿Por qué necesitamos el Highlighter? Porque el usuario no dice: Oculta el muro 15
    // Lo que dice es: Oculta lo que tengo seleccionado. Y la selección la conoce el Highlighter
    const highlighter = components.get(OBF.Highlighter);
    // Recuperamos exactamente el mismo ModelIdMap que vimos antes
    const selection = highlighter.selection.select;
    // La misma validación. Si no hay nada seleccionado, no hacemos nada
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    // Igual que antes. Mientras dura la operación, el botón muestra un indicador de carga
    target.loading = true;
    // Aquí recuperamos el componente especializado en controlar la visibilidad. Otra vez, no se crea uno nuevo. Es el mismo objeto compartido por toda la aplicación
    const hider = components.get(OBC.Hider);
    // hider.set(...) es la función principal del componente. Y set(visible, items)
      // Visible = false para todos los elementos seleccionados es como decir "OCULTAR"
      // selection se trata de los elementos afectados, es decir, significa: "Haz invisibles todos los elementos seleccionados."
    // highlighter.clear("select"): Una vez ocultos, ya no tiene sentido mantenerlos seleccionados. Por eso se limpia la selección
    const promises = [hider.set(false, selection), highlighter.clear("select")];
    // Otra vez las dos operaciones ocurren en paralelo
    await Promise.all(promises);
    target.loading = false;
  }

  // FLUJO:

  // Seleccionar
  // ↓
  // Hide
  // ↓
  // Hider
  // ↓
  // Visible = false
  // ↓
  // Elemento oculto

  // Muestra únicamente los elementos seleccionados ocultando el resto del modelo
  const onIsolate = async ({ target }: { target: BUI.Button }) => {
    const highlighter = components.get(OBF.Highlighter);
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    target.loading = true;
    const hider = components.get(OBC.Hider);
    // Esta función es como la anterior, pero no hace: Visible = false
    // Hace algo bastante más complejo. Internamente podemos imaginarlo así:
      // Todos los elementos
      // ↓
      // Ocultar
      // ↓
      // Excepto
      // ↓
      // selection
    // Es decir, el algoritmo sería algo parecido a: 
        // Para cada elemento
        // ↓
        // ¿Está seleccionado?
        // ↓
        // Sí: visible
        // ↓
        // No: oculto
    await hider.isolate(selection);
    target.loading = false;
  };

  // Vuelve a mostrar absolutamente todos los elementos
  const onShowAll = async ({ target }: { target: BUI.Button }) => {
    target.loading = true;
    const hider = components.get(OBC.Hider);
    // Cuando hacemos set(true) That Open interpreta: Haz visibles todos los elementos. No necesita saber cuáles
    // Simplemente recorre todos los fragmentos y vuelve a activarlos. Es equivalente a decir:  Todos los elementos → Visible = true
    await hider.set(true);
    target.loading = false;
  };

  // ======================================================
  // Bloque 4. Ghost Mode
  // ======================================================
  // Esta función es una de las más avanzadas del archivo. No utiliza el Highlighter. Trabaja directamente sobre los materiales de Three.js
  // Hace que todo el modelo se vuelva semitransparente, conservando la información original necesaria para poder restaurarlo después
  // Esta función recibe un número → opacity: number
    // En Three.js: 1.0 es totalmente opaco. 0.5 es 50 % transparente. 0 es invisible
    // En este proyecto: 0.05 significa: "Haz el modelo casi transparente, pero que todavía se pueda ver."
  const setModelTransparency = (opacity: number) => {
    // Recupera el gestor de fragmentos, pero...¿por qué necesitamos el FragmentsManager?
    // Porque el FragmentsManager conoce todos los modelos cargados. Cada modelo contiene materiales. Y esos materiales son precisamente lo que queremos modificar
    const fragments = components.get(OBC.FragmentsManager);
    // Primero obtiene todos los materiales
      // fragments.core: Accedemos al núcleo interno del gestor. Normalmente no trabajamos aquí. Pero para modificar materiales necesitamos bajar un nivel
      // models: Accedemos al conjunto de modelos cargados
      // materials: Cada modelo tiene materiales. Un material define: color, transparencia, brillo, textura, etc.
      // list: Es una colección. Internamente es un: Map. Algo parecido a Map → id → Material
      // values(): Obtiene únicamente los materiales. Sin las claves. Ejemplo: 1 → MaterialA --> MaterialA
      // ¿Y por qué aparecen los tres puntos ...? Aquí aparece el Spread Operator. values() devuelve un iterador, no un array. 
        // El Spread Operator convierte ese iterador en un array real
    const materials = [...fragments.core.models.materials.list.values()];

    // Después recorre cada uno de los materiales. Vamos a modificar todos ellos, uno por uno
    for (const material of materials) {
      // ¿Qué es userData? Todos los objetos de Three.js tienen una propiedad: userData. Sirve para guardar información personalizada.
        // Es como una mochila donde puedes guardar cualquier dato. Three.js nunca toca esa información. Es exclusivamente para el desarrollador
      // ¿Qué es customId? En este proyecto se utiliza para marcar materiales especiales. Es decir:
        // Material
        // ↓
        // ¿Tiene customId?
        // ↓
        // Sí
        // ↓
        // No modificar
      // ¿Por qué? Porque probablemente sean materiales utilizados por otros sistemas. Por ejemplo: Highlighter, Sección de cortes, Medidas... No queremos hacerlos transparentes
      // ¿Qué hace continue? Muy importante. No sale del bucle. Simplemente dice: "Este material no me interesa." Y pasa al siguiente.
      if (material.userData.customId) continue;
      // Aquí simplemente reservamos espacio para guardar información. Todavía no tienen valor. Más adelante se rellenarán
      let color: number | undefined;
      let lodOpacity: number | undefined
      // ¿Este material tiene una propiedad llamada color? No todos los materiales de That Open son iguales. Hay dos grandes tipos:
        // Materiales normales que tienen material.color
        // Materiales LOD que NO tienen color, sino que tienen lodColor
      // Por eso primero preguntamos
      if ("color" in material) {
        // Aquí simplemente guardamos el color actual (devuelve un entero, no una string)
        color = material.color.getHex();
      } else {
        // Si NO tiene color, guardamos el color LOD
        color = material.lodColor.getHex();
        // ¿Qué son los uniforms? Esto ya pertenece a los shaders de Three.js. No hace falta entrar muy profundo. 
        // Quédate con esta idea. Un shader recibe variables. Esas variables se llaman: Uniforms
          // lodOpacity es la uniform que controla la transparencia del shader LOD
        lodOpacity = material.uniforms.lodOpacity.value
      }

      // FLUJO:
        // Material
        // ↓
        // ¿Normal?
        // ↓
        // Sí
        // ↓
        // Guardar color
        // ----------------
        // ↓
        // ¿LOD?
        // ↓
        // Guardar lodColor
        // ↓
        // Guardar lodOpacity

      // En este punto todavía no hemos modificado absolutamente nada. Solo estamos recopilando toda la información necesaria para poder restaurar el material más adelante
      // Y aquí está la clave del diseño de esta función: Antes de cambiar un solo material, guarda una copia completa de su estado original:
        // Color, Opacity, Transparency, LOD Opacity...Esto permitirá restaurarlos después (es como una copia de seguridad)
      originalMaterialsData.set(material, {
        color,
        // Esta propiedad indica si el material era transparente antes. Puede ser true o false. No queremos asumir que todos eran opacos
        transparent: material.transparent,
        // Aquí guardamos el nivel de opacidad. Por ejemplo: 1, 0.8, etc.
        opacity: material.opacity,
        // Solo existirá para materiales LOD. Por eso era: lodOpacity?: number
        lodOpacity
      });

      // AQUÍ COMIENZA LA MODIFICACIÓN
      // Convertir en transparente. Muchas personas piensan que basta con escribir: material.opacity = 0.1; Pero no
      // Si el material tiene: transparent = false Three.js ignorará la opacidad
      material.transparent = true;
      // Volvemos a distinguir los dos tipos de materiales: color o lodColor
      if ("color" in material) {
        // Cambiar opacidad
        material.opacity = opacity;
        // Cambiar color. Todos los materiales pasan a blanco. Así el modelo adquiere aspecto de "fantasma"
        material.color.setColorName("white");
      } else {
        // ¿Qué hace setColorName()? Three.js permite cambiar el color utilizando nombres
        material.uniforms.lodColor.value.setColorName("white")
        material.uniforms.lodOpacity.value = opacity
      }
      // Cuando modificamos: material.opacity el material en memoria cambia. Pero la GPU todavía no sabe nada. 
      // Three.js necesita saber que debe volver a enviar ese material a la tarjeta gráfica.
        // CPU
        // ↓
        // Modificar material
        // ↓
        // needsUpdate = true
        // ↓
        // Three.js detecta el cambio
        // ↓
        // Enviar datos a la GPU
        // ↓
        // Renderizar otra vez
      material.needsUpdate = true;
    }
  }

  // FLUJO:

    // Obtener FragmentsManager
    //       │
    //       ▼
    // Obtener todos los materiales
    //         │
    //         ▼
    // Recorrer materiales
    //         │
    //         ▼
    // ¿Material especial?
    //         │
    //         ├── Sí → Saltar
    //         │
    //         ▼
    // Guardar estado original
    //         │
    //         ▼
    // Activar transparencia
    //         │
    //         ▼
    // Cambiar opacidad
    //         │
    //         ▼
    // Cambiar color a blanco
    //         │
    //         ▼
    // Marcar needsUpdate
    //         │
    //         ▼
    // Three.js actualiza la GPU

  // ¿POR QUÉ NO SE USA EL HIGHLIGHTER? Esta es una de las preguntas más interesantes. Podríamos pensar: "¿No podría el Highlighter hacer el modelo transparente?"
  // No. Porque el Highlighter trabaja sobre elementos concretos. Por ejemplo: Muro 15 --> Rojo
  // En cambio, el modo Ghost pretende modificar todos los materiales de todos los modelos. Eso ya no es un problema de selección. Es un problema de renderizado
  // Por eso aquí se trabaja directamente con los materiales de Three.js.

  // Orden de la función:
    // 1. Localizar materiales.
    // 2. Guardar el estado original.
    // 3. Modificar los materiales.
    // 4. Avisar a Three.js para que los vuelva a renderizar.
  // Primero se preserva la información original y solo después se realizan los cambios
  // Gracias a ello, la función restoreTransparency() que veremos ahora puede restaurar el modelo exactamente al estado
  // en el que estaba antes de activar el modo Ghost, sin tener que recalcular nada:

  // Si setModelTransparency() era la función que "transformaba" los materiales, esta es la que deshace exactamente esos cambios
  // No recalcula nada, simplemente restaura la copia de seguridad que habíamos guardado
  // Restaura los materiales a su estado original después de desactivar el modo "Ghost"
  // const restoreTransparency = () => {: Esta función no recibe parámetros. ¿Por qué? Porque toda la información necesaria ya está almacenada en: originalMaterialsData
  // Es decir, la función no necesita volver a recorrer el modelo buscando colores originales. Ya los tiene guardados
  const restoreTransparency = () => {
    // "Para cada material que guardé anteriormente, recupera también los datos que almacené sobre él."
    for (const [material, data] of originalMaterialsData) {
      const { color, transparent, opacity, lodOpacity } = data;

      // Primera restauración. Ahora ya no queremos asumir que el material era transparente. Queremos devolverlo exactamente a su estado anterior. Puede ser: true o false
      // Depende del material
      material.transparent = transparent;
      // Vuelve a aparecer la distinción entre materiales normales y materiales LOD
      if ("color" in material) {
        // Restauramos el valor que tuviera originalmente
        material.opacity = opacity;
        // Restauramos el valor que tuviera originalmente
        material.color.setHex(color);
      } else {
        material.uniforms.lodColor.value.setHex(color)
        material.uniforms.lodOpacity.value = lodOpacity
      }
      // En este caso también estamos modificando el material
      material.needsUpdate = true;
    }

    // Porque ya no hace falta conservarlos. El modelo ya ha vuelto a su estado original. Guardar la copia dejaría de tener sentido
    originalMaterialsData.clear();
  }

  // FLUJO:
    // Map
    // ↓
    // Material A
    // ↓
    // Restaurar color
    // ↓
    // Restaurar opacidad
    // ↓
    // Restaurar transparencia
    // ↓
    // Actualizar GPU
    // ↓
    // Siguiente material
    // ↓
    // Vaciar Map
  
  // RELACIÓN ENTRE AMBAS FUNCIONES:

    //                   MODELO ORIGINAL
    //                         │
    //                         ▼
    //          setModelTransparency(0.05)
    //                         │
    //         ┌───────────────┴───────────────┐
    //         │                               │
    //         ▼                               ▼
    // Guardar estado original         Modificar materiales
    //         │                               │
    //         └───────────────┬───────────────┘
    //                         ▼
    //                  MODO GHOST ACTIVO
    //                         │
    //                         ▼
    //              restoreTransparency()
    //                         │
    //         ┌───────────────┴───────────────┐
    //         │                               │
    //         ▼                               ▼
    // Restaurar materiales            Vaciar el Map
    //         │
    //         ▼
    //   MODELO ORIGINAL

  // ======================================================
  // Bloque 5. Toggle Ghost
  // ======================================================
  // Objetivo: Actuar como un interruptor (toggle) entre el modo normal y el modo Ghost

  // Si ya hay materiales guardados, significa que estamos en modo Ghost
  //   ↓
  // Restaurar

  // En caso contrario
  // ↓
  // Aplicar transparencia
  const onToggleGhost = () => {
    // ¿Qué es size? originalMaterialsData es un Map y todos los Map tienen una propiedad: size, que indica cuántos elementos contienen
    // Map vacío: size = 0 o Material A, Material B, Material C: size = 3
    // ¿Por qué comprobar el tamaño? Cuando activamos el modo Ghost: setModelTransparency(...) lo primero que hacemos es: originalMaterialsData.set(...)
    // Es decir, el Map deja de estar vacío. Visualmente:
    // Antes:
      // Map
      // ↓
      // Vacío
        //Ghost OFF

    // Después:
      // Map
      // ↓
      // Material A
      // Material B
      // Material C
        // Ghost ON

    // Por tanto, este código realmente está preguntando: ¿Existe ya una copia de seguridad de los materiales? Si existe, significa que: Ya hemos activado el modo Ghost
    if (originalMaterialsData.size > 0) {
      // Si el Map contiene materiales, significa: Ghost ON y entonces restauramos. Internamente devuelve colores, opacidad, transparencia y vacía el Map
      restoreTransparency();
    }  else {
      // Si el Map está vacío, el modelo está en estado normal. Entonces: Modelo normal pasa a Ghost. Y dentro de esa función: se guardan los materiales; se vuelven transparentes
      setModelTransparency(0.05);
    }
  }

   const onFocus = async ({ target }: { target: BUI.Button }) => {
    if (!(world.camera instanceof OBC.SimpleCamera)) return;
    const highlighter = components.get(OBF.Highlighter)
    const selection = highlighter.selection.select;
    target.loading = true;
    await world.camera.fitToItems(
      OBC.ModelIdMapUtils.isEmpty(selection) ? undefined : selection,
    );
    target.loading = false;
  };

  // FLUJO:

  // Usuario
  // ↓
  // Toggle Ghost
  // ↓
  // ¿Hay materiales guardados?
  //         │
  //   Sí ───────► Restaurar materiales
  //         │
  //   No ───────► Guardar materiales
  //                 ↓
  //           Aplicar transparencia

  // RELACIÓN DE TODO EL BLOQUE CON GHOST:
    //   Ahora ya entendemos las tres funciones juntas.

    //               onToggleGhost()
    //                      │
    //       ┌──────────────┴──────────────┐
    //       ▼                             ▼
    // Map vacío                    Map con datos
    //       │                             │
    //       ▼                             ▼
    // setModelTransparency()    restoreTransparency()
    //       │                             │
    //       ▼                             ▼
    // Guardar estado             Restaurar estado
    // Modificar materiales       Vaciar Map

  // ======================================================
  // Bloque 6. HTML
  // ======================================================
  // Toolbar
  // │
  // ├── Visibility
  // │       ├── ShowAll: onShowAll()
  // │       └── Toggle Ghost: onToggleGhost()
  // │  
  // └── Selection
  //        │
  //        ├── Hide: onHide()
  //        ├── Isolate: onIsolate()
  //        └── Colorize
  //               │
  //          Context Menu
  //               │
  //  ┌────────────┴────────────┐
  //  ▼                         ▼
  // Color Picker             Apply / Reset
  //    │                       │        │
  //    ▼                       ▼        ▼  
  // onInputCReated    onApplyColor()   onReset()
       
  // Esto es igual que un return ( <div>...</div> ) de React, pero That Open UI utiliza plantillas HTML (template literals) en lugar de JSX.
  // BUI.html interpreta lo que está entre `` para construir componentes reales del DOM.
    // <bim-toolbar>, <bim-button>, <bim-context-menu>, <bim-color-input> son Web Components (componentes HTML personalizados) creados por That Open UI
    // bim-toolbar-section representa una sección de la barra de herramientas: "Visibility" y "Selection"
    // label es el texto que verá el usuario y icon viene del archivo globals.ts
    // En <bim-button icon=${appIcons.COLORIZE} label="Colorize"> no hay @click, ya que ese botón no ejecuta una acción, sino que abre un menú (bim-context-menu)
    // <div style="display: flex; flex-direction: column; gap: 0.5rem;">, ya que queremos el color picker arriba y los botones abajo, no una cosa al lado de la otra
    // BUI.ref(onInputCreated): Crear componente → Cuando exista → Llamar → onInputCreated(elemento). Es decir, establece una referencia al componente recién creado
      // ¿Por qué necesitamos esa referencia? Porque luego hacemos: colorInput.color. Sin esa referencia, no podríamos acceder al color seleccionado
      // En React escribiríamos algo como: const ref = useRef(); Aquí That Open utiliza: BUI.ref(...). La idea es prácticamente la misma
  return BUI.html`
    <bim-toolbar>
      <bim-toolbar-section label="Visibility" icon=${appIcons.SHOW}>
        <bim-button icon=${appIcons.SHOW} label="Show All" @click=${onShowAll}></bim-button>
        <bim-button icon=${appIcons.TRANSPARENT} label="Toggle Ghost" @click=${onToggleGhost}></bim-button>
      </bim-toolbar-section>
      <bim-toolbar-section label="Selection" icon=${appIcons.SELECT}>
        <bim-button icon=${appIcons.FOCUS} label="Focus" @click=${onFocus}></bim-button>
        <bim-button icon=${appIcons.HIDE} label="Hide" @click=${onHide}></bim-button>
        <bim-button icon=${appIcons.ISOLATE} label="Isolate" @click=${onIsolate}></bim-button>
        <bim-button icon=${appIcons.COLORIZE} label="Colorize">
          <bim-context-menu>
            ${createColorPicker({ onApply: applyColorToSelection })}
            <bim-button
              style="--bim-label--c: #000; --bim-icon--c: #000;"
              icon=${appIcons.CLEAR}
              label="Reset"
              @click=${onReset}
            ></bim-button>
          </bim-context-menu>
        </bim-button>
      </bim-toolbar-section>
    </bim-toolbar>
  `;
};

// ======================================================
// ESTRUCTURA DEL HTML
// ======================================================
// Toolbar
// │
// ├── Visibility
// │      │
// │      ├── Show All
// │      └── Toggle Ghost
// │
// └── Selection
//        │
//        ├── Hide
//        ├── Isolate
//        └── Colorize ── Context Menu 
//                               └── Color Input
//                                       ↓
//                                      Apply
//                                       ↓
//                                      Reset


// ======================================================
// RELACIÓN CON TODA LA ARQUITECTURA
// ======================================================
// Toolbar
//     │
//     ▼
// Highlighter
//     │
//     ├── selección
//     ├── color
//     └── reset
//           │
//           ▼
// Hider
//     │
//     ├── Hide
//     ├── Isolate
//     └── Show All
//           │
//           ▼
// FragmentsManager
//           │
//           ▼
// Materiales
//           │
//           ▼
// Modo Ghost

// Es el punto donde más claramente se aprecia cómo la interfaz aprovecha todos los servicios configurados previamente en bim-components.


//      Usuario
//         │
//         ▼
// viewerToolbarTemplate
//         │
//         ├──────────────┬──────────────┬──────────────┐
//         ▼              ▼              ▼              ▼
//  Highlighter         Hider      FragmentsManager   ColorInput
//         │              │              │
//         ▼              ▼              ▼
//   Selección      Visibilidad     Materiales
//         │              │              │
//         └──────────────┴──────────────┘
//                        │
//                        ▼
//                   Modelo BIM
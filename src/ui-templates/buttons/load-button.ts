// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Primer componente que el usuario utiliza para interactuar con la aplicación. De hecho, este botón es el encargado de introducir modelos en el visor

// load-button.ts define una plantilla (template) para un botón que permite al usuario cargar:
    // archivos IFC (.ifc)
    // archivos FRAG (.frag)
// No se limita a mostrar un botón, sino que encapsula toda la lógica necesaria para:
    // 1. Abrir el explorador de archivos.
    // 2. Leer el fichero seleccionado.
    // 3. Obtener el componente adecuado (IfcLoader o FragmentsManager).
    // 4. Cargar el modelo en memoria.

// Es un buen ejemplo de cómo la UI actúa como puente entre el usuario y el motor BIM.

// ======================================================
// IMPORTACIONES
// ======================================================
// Importa el sistema de componentes de interfaz de That Open. Será el encargado de crear el botón y el menú contextual
import * as BUI from "@thatopen/ui";
// Permite acceder a: IfcLoader y FragmentsManager. Es decir, conecta la UI con la lógica BIM
import * as OBC from "@thatopen/components"
// Importa el conjunto de iconos de la aplicación. Aquí únicamente se utiliza: appIcons.ADD para mostrar el icono del botón principal
import { appIcons } from "../../globals";

// ======================================================
// ESTADO DEL COMPONENTE
// ======================================================
// Estado que recibe el componente. Contiene el sistema de componentes para poder acceder a servicios como IfcLoader o FragmentsManager.

// Hasta ahora nuestras funciones recibían directamente components. Ahora el componente recibe un estado (state).
// Los componentes de @thatopen/ui son componentes con estado, similares al concepto de props en React. Cuando el botón se cree, alguien hará algo parecido a:
    // BUI.Component.create(loadModelBtnTemplate, { components })
// Así el botón tendrá acceso a todo el sistema BIM
export interface LoadModelBtnState { 
    components: OBC.Components
}

// ======================================================
// DEFINICIÓN DEL TEMPLATE
// ======================================================
// Plantilla del botón encargado de cargar modelos IFC o FRAG

// Estamos creando un componente de interfaz reutilizable. Recibe un estado. Devuelve HTML. Muy parecido al concepto de componente funcional de React
export const loadModelBtnTemplate: BUI.StatefullComponent<LoadModelBtnState> = (
    state,
) => {
    // Extrae el contenedor de componentes del estado recibido
    // Simplemente desestructura el objeto recibido. A partir de aquí podremos acceder a: IfcLoader, FragmentsManager o cualquier otro componente registrado
    const { components } = state

     // Permite seleccionar y cargar un archivo IFC
    const onLoadIfc = () => {
        // Crea dinámicamente un selector de archivos
        // En lugar de tener un <input type="file"> permanente en el HTML, se crea dinámicamente
        const input = document.createElement("input");
        // Indica que será un selector de archivos
        input.type = "file";
        // Solo podrá seleccionarse un modelo. Si algún día quieres cargar varios IFC simultáneamente, bastaría con: input.multiple = true; y adaptar la lógica
        input.multiple = false;
        // Hace que el explorador solo muestre archivos IFC
        input.accept = ".ifc";

        // Este evento se dispara cuando el usuario ya ha elegido un archivo
        input.addEventListener("change", async () => {
            // Obtiene el archivo seleccionado
            const file = input.files?.[0];
            // Protege frente a cancelar el diálogo
            if (!file) return;
            // Convierte el archivo en un array de bytes, es decir, en memoria. Todavía no son fragmentos. Simplemente es un bloque de bytes
            const buffer = await file.arrayBuffer();
            // IfcLoader necesita un Uint8Array. Por eso se hace esta conversión.
            const bytes = new Uint8Array(buffer);
             // Recupera el cargador IFC configurado durante la inicialización
            // Aquí se conecta con todo lo que vimos en: setupIfcLoader()
            const ifcLoader = components.get(OBC.IfcLoader)
            // Este método hace todo el trabajo. Internamente:
            // IFC
            //  │
            //  ▼
            // web-ifc
            //  │
            //  ▼
            // Fragments
            //  │
            //  ▼
            // FragmentsManager
            //  │
            //  ▼
            // World

             // Carga el modelo, lo convierte en fragmentos y lo incorpora automáticamente al visor
            await ifcLoader.load(
                // Contenido del archivo
                bytes,
                // Significa que, si cargas varios modelos, That Open intentará colocarlos correctamente en el mismo sistema de coordenadas. Muy útil para federaciones
                true, // Coordina automáticamente el modelo respecto a los ya cargados
                // Será el identificador del modelo con el que se cargará en memoria. Por ejemplo: Hospital.ifc → Hospital
                file.name.replace(".ifc", ""), // Identificador del modelo en memoria
            );
            })
        
        // Abre el explorador de archivos
        // Como el input nunca se añadió al DOM, hay que simular el clic
        input.click();

    }
    
    // Exactamente igual que el módulo anterior, pero para cargar directamente un archivo de Fragments
    // Permite cargar directamente un archivo de fragmentos (.frag)
    const onLoadFrag = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.accept = ".frag";

        input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();

        // Recupera el FragmentsManager
        const fragments = components.get(OBC.FragmentsManager)
        // Carga el modelo ya convertido a Fragments
        fragments.core.load(buffer, {
            modelId: file.name.replace(".frag", "")
        })
        });

        input.click();
    }
    
    // Aquí aparece el componente visual: Devuelve el botón principal con un menú contextual que permite elegir el tipo de archivo a cargar
    // <bim-button icon=${appIcons.ADD}> es el botón que verá el usuario
    // <bim-context-menu> significa que el botón no ejecuta una acción directamente. Abre un pequeño menú con 2 botones: Load FRAG y Load IFC
    return BUI.html`<bim-button icon=${appIcons.ADD}>
    <bim-context-menu>
      <bim-button class="transparent" @click=${onLoadFrag} label="Load FRAG"></bim-button>
      <bim-button class="transparent" @click=${onLoadIfc} label="Load IFC"></bim-button>
    </bim-context-menu>
  </bim-button>`
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// Usuario
//     │
//     ▼
// Pulsa botón
//     │
//     ▼
// load-button.ts
//     │
//     ├── Load IFC
//     │       │
//     │       ▼
//     │   IfcLoader
//     │       │
//     │       ▼
//     │   Fragments
//     │
//     └── Load FRAG
//             │
//             ▼
//      FragmentsManager
//             │
//             ▼
//       World
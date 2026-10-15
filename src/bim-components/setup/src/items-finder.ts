// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// setupItemsFinder configura el componente ItemsFinder creando una serie de búsquedas predefinidas.
// Después de ejecutar esta función, la aplicación ya sabe responder preguntas como:
  // "Dame todos los muros."
  // "Dame todas las puertas y ventanas."
  // "Dame todos los muros livianos T7."
  // "Dame todos los muros exteriores."

// Es decir, aquí se define el catálogo de consultas disponibles sobre los modelos BIM.

// Cuando se carga un IFC, no solo obtenemos geometría. Cada elemento también contiene información BIM:
// IfcWall
// │
// ├── Name
// ├── GlobalId
// ├── Type
// ├── Material
// ├── Property Sets
// ├── Quantities
// └── Relaciones

// ItemsFinder permite buscar elementos utilizando esa información. Podemos imaginarlo como un pequeño motor de consultas:
// Modelo IFC
//       │
//       ▼
// ItemsFinder
//       │
//       ├── Buscar muros
//       ├── Buscar puertas
//       ├── Buscar por propiedades
//       └── Buscar por relaciones IFC

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================

// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa la librería principal de That Open Company, que contiene: Components, Worlds, FragmentsManager, IfcLoader, etc.
import * as OBC from "@thatopen/components"

// ======================================================
// CLASE PRINCIPAL: setupItemsFinder
// ======================================================
// Registra un conjunto de consultas predefinidas que permitirán buscar elementos del modelo BIM por categoría, atributos o relaciones IFC
// Como en el resto de archivos de setup, únicamente recibe el contenedor de componentes. No necesita el World porque trabaja únicamente sobre los datos del modelo
export const setupItemsFinder = (components: OBC.Components) => {
  // Obtiene el buscador de elementos registrado en el sistema
  // A partir de aquí se empiezan a registrar consultas
  const finder = components.get(OBC.ItemsFinder);
  // Consulta que devuelve todos los elementos pertenecientes a la categoría de muros
  // /WALL/ no es una string, sino que es una expresión regular. Eso significa que la búsqueda es más flexible
  // Por ejemplo podría coincidir con: IfcWall, IfcWallStandardCase, WALL...dependiendo de cómo procese internamente las categorías.
  finder.create("Walls", [{ categories: [/WALL/] }])
  // Consulta que devuelve tanto puertas como ventanas
  finder.create("Doors & Windows", [{ categories: [/DOOR/, /WINDOW/] }])
  // Consulta basada en un atributo del modelo. Busca los elementos cuyo nombre sea "Muro liviano T7".
  finder.create("Drywall T7", [
    {
      attributes: {
        queries: [
          { name: /Name/, value: /Muro liviano T7/ }
        ]
      }
    }
  ])
  // Consulta más compleja que busca únicamente los muros cuya propiedad IFC "IsExternal" tenga el valor true
  finder.create("External Walls", [
    {
      categories: [/WALL/],
      relation: {
        name: "IsDefinedBy",
        query: {
          relation: {
            name: "HasProperties",
            query: {
              attributes: {
                // Se buscan dos atributos:
                queries: [
                  { name: /Name/, value: /IsExternal/ },
                  { name: /NominalValue/, value: true },
                ]
              }
            }
          }
        }
      }
    }
  ])
}

// ======================================================
// FLUJO COMPLETO
// ======================================================
// ¿Por qué limpiar la caché en FragmentsManager?
// En fragments-manager.ts aparecía esto: query.clearCache()
// Estas consultas pueden almacenar resultados. Si cargamos otro IFC, hay que volver a ejecutarlas.
// Por eso se limpia la caché cuando llega un nuevo modelo. Los dos archivos están directamente relacionados.

// setupComponents()
//         │
//         ▼
// createWorld()
//         │
//         ▼
// setupIfcLoader()
//         │
//         ▼
// setupFragmentsManager()
//         │
//         ▼
// setupHighlighter()
//         │
//         ▼
// setupItemsFinder()
//         │
//         ▼
// La aplicación ya sabe:
//     • cargar IFC
//     • renderizar modelos
//     • seleccionar elementos
//     • buscar elementos
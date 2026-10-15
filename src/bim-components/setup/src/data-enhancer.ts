// ======================================================
// IMPORTACIONES
// ======================================================
// Importamos components, que es el contenedor principal de componentes de That Open
import * as OBC from "@thatopen/components"
// Importamos components-front, que contiene componentes orientados a la interacción en navegador, como el Highlighter
import * as OBF from "@thatopen/components-front"
// Importamos nuestro custom component DataEnhancer
import { DataEnhancer } from "../../DataEnhancer"
// Importamos el tipo ItemData, que representa los datos/atributos de un elemento BIM
import { ItemData } from "@thatopen/fragments"
import { getCollection } from "../../../firebase"
import { getDocs } from "firebase/firestore"

// ======================================================
// FUNCIÓN DE CONFIGURACIÓN: setupDataEnhancer
// ======================================================
// Creamos la función de configuración setupDataEnhance. Su función es configurar el custom component DataEnhancer
// setupDataEnhancer recibe el contenedor components y le decimos mediante TypeScript que es OBC.Components
// Después en setup/index.ts se importa e inicializa el DataEnhancer: setupDataEnhancer(components)
export const setupDataEnhancer = (components: OBC.Components) => {

  // Busca dentro del contenedor components la instancia de nuestro DataEnhancer
  // components.get(DataEnhancer) nos devuelve nuestro componente y lo guardamos en enhancer
  const enhancer = components.get(DataEnhancer)

  // Con enhancer.sources accedemos al conjunto de fuentes que conoce el DataEnhancer
  // Y usamos .set(...) porque sources es un DataMap
  // Estamos creando una entrada: fuente con nombre identificador "Technical Documentation"
  enhancer.sources.set("Technical Documentation", {
    // Definimos la función data de la fuente, ya que el DataEnhancer sabe que cada fuente debe proporcionar una función que le permita obtener sus datos
    // Función: responde a ¿cuáles son todos los datos de mi fuente?
    // async indica que esta función trabaja de forma asíncrona, ya que vamos a realizar una petición: fetch(...)
    data: async () => {
      // Aquí ocurre la petición HTTP. Estamos diciendo al navegador: "Ve a buscar este archivo"
      // await significa: "Espera a que termine la petición antes de continuar" 
      const file = await fetch("/resources/technical_documentation.json")
      // Convertir la respuesta a JSON
      const json = await file.json()
      // Se devuelven los datos a la función data
      // Y aquí entra en juego la 1ª caché. La 1ª vez: data() -> fetch() -> guardar en _sourceDataCache / Las siguientes veces: getSourceData() -> _sourcesDataCache -> no hace fetch()
      return json
    },
    // matcher es la segunda función fundamental de la fuente
    // Función: responde a...de esos datos, ¿cuáles corresponden a este elemento BIM?
    // Es decir, es el mecanismo encargado de decidir qué información externa pertenece a cada elemento
    // Tenemos dos parámetros:
      // attrs: ItemData, que son los atributos del elemento BIM que estamos procesando
      // data: any[], que son todos los datos externos que obtuvimos mediante data()
    matcher: (attrs: ItemData, data: any[]) => {
      // Buscamos dentro de los atributos la categoría del elemento
      const categoryData = attrs._category
      // Se comprueba que existe la categoría: ¿Existe categoryData y además tiene una propiedad value?
      if (!(categoryData && "value" in categoryData)) return null
      // Se obtiene el valor de la categoría. Por ejemplo: WALL
      const category = categoryData.value
      // Tenemos data que son todos los registros externos y hacemos un data.filter(...)
      // ¿Para qué? Para quedarnos únicamente con los registros cuya entry.category sea igual a category. Por ejemplo: todos los WALL
      // Es decir, se obtienen únicamente los datos externos asociados a esa categoría concreta y se guardan en dataSubset
      const dataSubset = data.filter(entry => entry.category === category)
      // Se devuelve el resultado y utilizamos un operador ternario
        // Si encuentra datos --> return dataSubset
        // Si no se encuentran datos --> return null. Y ese null termina convirtiéndose en []
      return dataSubset.length > 0 ? dataSubset : null
    }
  })

  // LECCIÓN 4.5: conectar modelo a fuente de datos de Firebase
  enhancer.sources.set("Activities", {
    data: async () => {
      const url = location.href
      const match = url.match(/\/project\/([^\/]+)/);
      const projectId = match ? match[1] : null;
      if (!projectId) return [];
      const activitiesCollection = getCollection(`/projects/${projectId}/activities`);
      const firebaseProjects = await getDocs(activitiesCollection);
      const sourceData = [];
      for (const doc of firebaseProjects.docs) {
        sourceData.push(doc.data());
      }
      return sourceData;
    },
    matcher: (attrs: ItemData, data: any[]) => {
      const guidData = attrs._guid
      if (!(guidData && "value" in guidData)) return null
      const guid = guidData.value
      const dataSubset = data.filter(entry => Array.isArray(entry.guids) && entry.guids.includes(guid))
      return dataSubset.length > 0 ? dataSubset : null
    }
  })

  // Necesitamos el Highlighter porque queremos reaccionar cuando el usuario seleccione un elemento BIM
  // components.get(OBF.Highlighter): "Dame la instancia del Highlighter que está registrada en components"
  const highlighter = components.get(OBF.Highlighter)
  // Y esta línea conecta el Highlighter con nuestro Data Enhancer
  // Significa: "Cuando el Highlighter produzca el evento onHighlight, ejecuta esta función": Usuario hace clic -> Highlighter -> events.select -> onHighlight -> ejecutar callback
  // E items representa la selección recibida, en forma de Model ID Map
  highlighter.events.select.onHighlight.add(async items => {
    // El DataEnhancer recibe items que contiene los elementos seleccionados
    // Aquí entra en juego la 2ª caché
    const data = await enhancer.getData(items)
    console.log(data)
  })
}

// ======================================================
// RESUMEN
// ======================================================
// 1. Tengo acceso al motor de That Open.
//              ↓
// 2. Tengo acceso al Highlighter.
//              ↓
// 3. Tengo acceso a mi DataEnhancer.
//              ↓
// 4. Configuro una fuente llamada
//    "Technical Documentation".
//              ↓
// 5. Para obtener sus datos:
//       cargo technical_documentation.json
//              ↓
// 6. Para relacionarlos con BIM:
//       miro la categoría del elemento
//              ↓
// 7. Filtro los registros externos
//    que tengan esa misma categoría.
//              ↓
// 8. Escucho las selecciones del Highlighter.
//              ↓
// 9. Cuando selecciono un elemento:
//       DataEnhancer.getData(items)
//              ↓
// 10. Se ejecutan las cachés + matcher.

//            setupDataEnhancer()
//                     │
//         ┌───────────┴────────────┐
//         ▼                        ▼
//  CONFIGURA FUENTE          CONECTA SELECCIÓN
//         │                        │
//         ▼                        ▼
//  data() + matcher()         Highlighter
//         │                        │
//         └───────────┬────────────┘
//                     ▼
//              enhancer.getData()
//                     │
//                     ▼
//              Model ID Data Map
// No estás creando aquí el DataEnhancer. Lo estás configurando y conectando con el resto de la aplicación.
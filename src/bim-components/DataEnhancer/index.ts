import * as OBC from "@thatopen/components"
import * as FRAGS from "@thatopen/fragments"
import { DataEnhancerSource } from "./src";

export class DataEnhancer extends OBC.Component {
  static uuid = "d9d41a68-2606-4c61-9e86-af6b675758ef" as const
  enabled = true;

  // PRIMERA CACHÉ
  // Guarda los datos completos descargados de cada fuente
  // Estructura: source -> datos externos
  private _sourcesDataCache: Record<string, any[]> = {}

  // SEGUNDA CACHÉ
  // Guarda los resultados ya procesados por matcher()
  // Estructura: modelId -> localId -> source -> datos asociados
  private _processedDataCache: OBC.ModelIdDataMap<Record<string, any[]>> =
    new FRAGS.DataMap()

  // Fuentes que conoce el DataEnhancer
  readonly sources = new FRAGS.DataMap<string, DataEnhancerSource>()

  // Método que implementa la PRIMERA CACHÉ
  async getSourceData(source: string) {
    // Busca la configuración de la fuente
    const sourceConfig = this.sources.get(source)
    // Comprobando primero si dicha fuente existe. En caso contrario, mensaje de error
    if (!sourceConfig) {
      throw new Error(`DataEnhancer: Source "${source}" not found`)
    }

    // Busca en la PRIMERA CACHÉ: ¿Se han descargado anteriormente los datos de esta fuente?
    let data = this._sourcesDataCache[source]
    // Si no se han descargado anteriormente, se ejecuta data()
    if (!data) {
      data = await sourceConfig.data()
      // Se guardan los datos de la fuente
      this._sourcesDataCache[source] = data
    }
    // Se devuelven los datos
    return data
  }

  // Método capaz de localizar todos los elementos que compartan una misma información procedente de una fuente de datos.
  async getRelatedItems(
    selectedItems: OBC.ModelIdMap,
    source: string,
    property: string,
  ): Promise<OBC.ModelIdMap> {
    const sourceConfig = this.sources.get(source);

    if (!sourceConfig) {
      throw new Error(`DataEnhancer: Source "${source}" not found`);
    }

    const sourceData = await this.getSourceData(source);
    const fragments = this.components.get(OBC.FragmentsManager);
    const sharedValues = new Set<unknown>();

    // Obtiene el valor o los valores de la propiedad en los elementos iniciales.
    for (const [modelId, selectedLocalIds] of Object.entries(selectedItems)) {
      if (!selectedLocalIds || selectedLocalIds.size === 0) continue;

      const model = fragments.list.get(modelId);
      if (!model) continue;

      const selectedLocalIdsArray = [...selectedLocalIds];
      const selectedAttributes = await model.getItemsData(selectedLocalIdsArray);

      // Continúa aquí con la búsqueda de valores compartidos
      for (const attributes of selectedAttributes) {
        const records = sourceConfig.matcher(attributes, sourceData) ?? [];

        for (const record of records) {
          const value = record?.[property];

          if (value !== undefined && value !== null) {
            sharedValues.add(value);
          }
        }
      }
    }

    // Si los elementos iniciales no tienen datos para esa propiedad, no hay nada que buscar.
    if (sharedValues.size === 0) return {};

    const relatedItems: OBC.ModelIdMap = {};

    // Revisa todos los elementos de todos los modelos cargados.
    for (const [modelId, model] of fragments.list.entries()) {
      const localIds = await model.getLocalIds();
      if (localIds.length === 0) continue;

      const attributesList = await model.getItemsData(localIds);
      const matchingLocalIds: number[] = [];

      for (const [index, attributes] of attributesList.entries()) {
        const localId = localIds[index];
        if (localId === undefined) continue;

        const records = sourceConfig.matcher(attributes, sourceData) ?? [];
        const hasSharedValue = records.some((record) =>
          sharedValues.has(record?.[property]),
        );

        if (hasSharedValue) {
          matchingLocalIds.push(localId);
        }
      }

      if (matchingLocalIds.length > 0) {
        relatedItems[modelId] = new Set(matchingLocalIds);
      }
    }

    return relatedItems;
  }

  async getData(items: OBC.ModelIdMap) {
    // Se solicita el FragmentsManager que gestiona los modelos Fragment
    const fragments = this.components.get(OBC.FragmentsManager)
    // Se genera la variable result que será donde se almacene el resultado de getData()
    const result: OBC.ModelIdDataMap<Record<string, any[]>> =
      new FRAGS.DataMap()

    // Se recorren los modelos del ModelIdMap
    // Object.entries() nos da el modelId y el conjunto de localIds de ese modelo
    for (const [modelId, _localIds] of Object.entries(items)) {
      // Se busca dentro del FragmentsManager el modelo correspondiente
      const model = fragments.list.get(modelId)
      // Si ese modelo ya no existe, salta al siguiente
      if (!model) continue

      // Se convierte el conjunto de localIds en un array para poder acceder posteriormente a cada ID mediante su índice
      const localIds = [..._localIds]
      // Se obtienen los atributos de los elementos
      const itemsData = await model.getItemsData(localIds)

      // Se recorren todas las fuentes de datos
      // getSourceData() utiliza la PRIMERA CACHÉ para evitar volver a ejecutar data() si los datos ya fueron descargados
      for (const [source, config] of this.sources.entries()) {
        // Se obtienen los datos de la fuente mediante getSourceData()
        // Este método utiliza la PRIMERA CACHÉ para evitar ejecutar config.data() de nuevo si los datos de esta fuente ya fueron descargados
        const sourceData = await this.getSourceData(source)

        // Se recorren los atributos obteniendo también su índice. Ese índice permite acceder al localId correspondiente, ya que ambos arrays mantienen el mismo orden
        for (const [index, attributes] of itemsData.entries()) {
          const localId = localIds[index]

          // SEGUNDA CACHÉ: buscamos primero el modelo
          // Buscamos primero la caché del modelo
          let modelCache = this._processedDataCache.get(modelId)

          // Si nunca se había procesado ese modelo, se crea su Map
          if (!modelCache) {
            modelCache = new FRAGS.DataMap()
            // Y se guarda
            this._processedDataCache.set(modelId, modelCache)
          }

          // Buscamos después el elemento dentro del modelo
          let itemCache = modelCache.get(localId)

          // Si nunca habíamos procesado ese elemento, se crea el objeto que almacenará sus fuentes
          if (!itemCache) {
            itemCache = {}
            modelCache.set(localId, itemCache)
          }

          // Comprobamos si este elemento ya fue procesado para esta fuente concreta
          // Aquí voy a tener el resultado de matcher(), independientemente de si viene de la caché o si se acaba de calcular
          let itemExternalData: any[]

          // Se comprueba si ya existe un resultado almacenado para esta fuente dentro de la caché del elemento
          // ¿Ya existe un resultado almacenado para esta fuente dentro de la caché de este elemento?
          if (source in itemCache) {
            // Sí: reutilizamos el resultado y NO ejecutamos matcher().
            itemExternalData = itemCache[source]

          } else {
            
            // No: ejecutamos matcher() por primera vez para esta combinación elemento + fuente
            // matcher() determina qué datos externos pertenecen a este elemento
            // ?? [] --> Si matcher() devuelve null o undefined, utilizamos [] como resultado vacío
            itemExternalData = config.matcher(attributes, sourceData) ?? []

            // Guardamos el resultado en la segunda caché para no volver a ejecutar matcher() en futuras llamadas
            itemCache[source] = itemExternalData
          }

          // Si matcher() no encontró datos asociados, no añadimos nada al resultado de esta llamada de getData()
          // El resultado vacío ya ha quedado guardado en la segunda caché
          if (itemExternalData.length === 0) continue


          // RESULTADO DE LA LLAMADA ACTUAL
          // Aquí construimos el ModelIdDataMap que devolverá este getData()
          // No es la segunda caché: _processedDataCache contiene resultados procesados anteriormente para evitar repetir matcher()
          let modelResult = result.get(modelId)
          if (!modelResult) {
            modelResult = new FRAGS.DataMap()
            result.set(modelId, modelResult)
          }

          // Se busca el elemento dentro del resultado
          let itemSources = modelResult.get(localId)
          if (!itemSources) {
            itemSources = {}
            modelResult.set(localId, itemSources)
          }

          // Se guarda la información
          itemSources[source] = itemExternalData
        }
      }
    }

    // Se devuelve el ModelIdDataMap
    return result
  }
}

// ======================================================
// FLUJO GENERAL
// ======================================================
// getData(items)
// │
// ▼
// Recorro las fuentes
// │
// ▼
// getSourceData(source)
// │
// ├── ¿Existe en PRIMERA CACHÉ?
// │       │
// │       ├── NO → sourceConfig.data()
// │       │          ↓
// │       │       guardar datos
// │       │
// │       └── SÍ → reutilizar datos
// │
// ▼
// sourceData
// │
// ▼
// matcher(attributes, sourceData)
// │
// ├── ¿Existe en SEGUNDA CACHÉ?
// │       │
// │       ├── NO → ejecutar matcher()
// │       │          ↓
// │       │       guardar resultado
// │       │
// │       └── SÍ → reutilizar resultado
// │
// ▼
// resultado


// ======================================================
// FLUJO getData()
// ======================================================
// getData(items)
//    │
//    ▼
// modelId
//    │
//    ▼
// localIds
//    │
//    ▼
// itemsData
//    │
//    ▼
// source
//    │
//    ▼
// getSourceData(source)  ← PRIMERA CACHÉ
//    │
//    ▼
// sourceData
//    │
//    ▼
// modelId + localId      ← SEGUNDA CACHÉ
//    │
//    ├── ¿ya existe modelId?
//    │
//    ├── ¿ya existe localId?
//    │
//    └── ¿ya existe source?
//            │
//            ├── SÍ → reutiliza matcher()
//            │
//            └── NO → ejecuta matcher()
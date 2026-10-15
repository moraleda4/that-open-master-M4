// ======================================================
// RESPONSABILIDADES DE ESTE ARCHIVO
// ======================================================
// Este archivo se encarga de gestionar los modelos BIM una vez cargados, manteniendo un buen rendimiento.
// La función setupFragmentsManager configura el Fragments Manager, que es el responsable de administrar todos los modelos cargados en el visor.

// Sus responsabilidades principales son:
// 1. Inicializar el Fragments Manager.
// 2. Detectar cuándo se carga un nuevo modelo.
// 3. Incorporarlo a la escena.
// 4. Mantener actualizado el sistema de renderizado (culling y LOD).
// 5. Sincronizar los modelos con la cámara.

// En otras palabras: Este archivo prepara el sistema que gestiona los modelos BIM dentro del visor y optimiza su representación gráfica.

// ======================================================
// OBSERVACIONES DE DISEÑO DE LA APP
// ======================================================
// Este archivo no carga modelos ni los busca. Se limita a gestionar su ciclo de vida una vez que existen.
// Esa separación de responsabilidades hace que la arquitectura sea más modular:

// 1. ifc-loader.ts se encargará de crear los modelos a partir de archivos IFC.
// 2. fragments-manager.ts se encargará de administrar esos modelos ya creados.
// 3. highlighter.ts utilizará esos modelos para permitir la selección de elementos.
// 4. items-finder.ts permitirá consultarlos y buscarlos.

// Cada módulo tiene una función clara, lo que facilita tanto el mantenimiento como la ampliación del proyecto.

// ======================================================
// IMPORTACIONES
// ======================================================
// Se importa la librería principal de That Open Company, que contiene: Components, Worlds, FragmentsManager, IfcLoader, etc.
import * as OBC from "@thatopen/components"

// ======================================================
// CLASE PRINCIPAL: setupFragmentsManager
// ======================================================
// Configura el Fragments Manager encargado de administrar los modelos BIM cargados y mantener optimizado su renderizado
// Recibe dos objetos:
  // components: el contenedor con todos los servicios registrados.
  // world: el visor que creamos en create-world.ts.
// Necesita ambos porque va a conectar los modelos con el mundo 3D.
export const setupFragmentsManager = (components: OBC.Components, world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>) => {
  // Obtiene el Fragments Manager registrado en el sistema. Este gestor será quien mantenga la lista de modelos cargados y gestione su actualización
  const fragments = components.get(OBC.FragmentsManager);
  // El FragmentsManager utiliza un Web Worker, ya que muchas opreaciones sobre modelos BIM son pesadas:
    // leer geometría, calcular visibilidad, actualizar LOD, procesar información...
  // Si se ejecutaran en el hilo principal, la interfaz se bloquearía. Con un Worker el usuario puede seguir interactuando mientras el Worker realiza los cálculos.
  // Se inicializa el Web Worker (desde node_modules) que realizará en segundo plano las tareas relacionadas con la gestión de fragmentos.
  // Para construir la aplicación, el archivo del worker debe colocarse dentro de la carpeta public en la raíz del proyecto y referenciarse como "worker.mjs"
  fragments.init("/node_modules/@thatopen/fragments/dist/Worker/worker.mjs");

  // Se ejecuta automáticamente cuando se añade un nuevo modelo al gestor
  // FragmentsManager mantiene una colección de modelos. Cada vez que entra uno nuevo, se dispara este evento.
  // Es equivalente a decir: "Cuando un modelo termine de añadirse al gestor, ejecuta este código"
  fragments.list.onItemSet.add(async ({ value: model }) => {
    // Limpia la caché de todas las consultas del buscador (ItemsFinder caché) para que los nuevos elementos del modelo puedan aparecer en futuras búsquedas.
    // ItemsFinder guarda resultados de búsquedas anteriores para no repetir trabajo. Pero si ahora aparece un modelo nuevo, esas búsquedas ya no son válidas.
    const finder = components.get(OBC.ItemsFinder)
    for (const [, query] of finder.list) {
      query.clearCache()
    }
    
    // model.useCamera(world.camera.three): asocia la cámara del visor al modelo para que pueda actualizar correctamente el culling y el nivel de detalle (LOD).
    // Gracias a ello el modelo puede actualizar: qué partes son visibles, qué partes están ocultas y qué nivel de detalle utilizar
      // Culling es el proceso para no renderizar lo que la cámara no ve.
      // Ejemplo: Imagina un edificio. La cámara está mirando hacia la fachada norte. No tiene sentido renderizar la fachada sur. Solo se dibuja lo que entra en el campo de visión
      // LOD significa Nivel de Detalle en gráficos 3D (no en BIM) y se usa para disminuir el detalle de la geometría a medida que la cámara se aleja del elemento.
    model.useCamera(world.camera.three);

    // Hasta este momento, el modelo existía en memoria. Ahora pasa a formar parte de la escena de Three.js. Desde este instante puede renderizarse
    // Añade el modelo a la escena de Three.js para que pueda visualizarse.
    world.scene.three.add(model.object);

    // MUY IMPORTANTE: Fuerza al Fragments Manager a recalcular su estado tras incorporar el nuevo modelo.
    // Es decir, después de modificar la configuración, el gestor necesita recalcular su estado.
    // Modelo añadido → Escena cambia → FragmentsManager recalcula → Nuevo estado
    // Si no se llamara a update(), el gestor seguiría trabajando con información desactualizada
    await fragments.core.update(true);
  })

  // Cuando el usuario termina de mover la cámara, se actualizan nuevamente los fragmentos para recalcular visibilidad, culling y nivel de detalle
    // El evento "rest" significa: "El usuario ha terminado de mover la cámara." No se ejecuta continuamente mientras arrastras el ratón. Solo cuando el movimiento finaliza.
    // Esto evita hacerlo cientos de veces por segundo.
  world.camera.controls.addEventListener("rest", async () => {
    await fragments.core.update(true);
  });
}

// ======================================================
// FLUJO COMPLETO
// ======================================================

// setupFragmentsManager()
//           │
//           ▼
// Inicializar Worker
//           │
//           ▼
// Esperar nuevos modelos
//           │
//           ▼
// Limpiar cachés
//           │
//           ▼
// Asociar cámara
//           │
//           ▼
// Añadir a la escena
//           │
//           ▼
// Actualizar Fragments
//           │
//           ▼
// Esperar movimiento de cámara
//           │
//           ▼
// Actualizar nuevamente
// ======================================================
// RESPONSABILIDADES
// ======================================================
// Este archivo encapsula toda la comunicación con Firestore (Firebase) y React ya NO necesita saber cómo funciona Firestore. MUY importante.

// Lógica de acceso a datos o capa de persistencia (responsabilidades):
    // ✔ obtener proyectos desde Firebase: loadProjects()
    // ✔ guardar proyectos: saveProject()
    // ✔ actualizar proyectos: updateProject()
    // ✔ eliminar proyectos: deleteProject()

// Este archivo se crea para que React deje de hacer directamente todo esto:
    // Firestore.addDoc(...)
    // Firestore.updateDoc(...)
    // Firestore.getDocs(...)

// IMPORTANTE:
// FirebaseService NO contiene lógica de negocio. SOLO se encarga de persistencia y acceso a datos.

// Este archivo desacopla React de Firestore. Gracias a esto React NO necesita conocer:
  // - getDocs()
  // - setDoc()
  // - deleteDoc()
  // - collections
  // - documents
// React solo habla con FirebaseService.

// Esto mejora:
// ✔ separación de responsabilidades
// ✔ mantenibilidad
// ✔ reutilización
// ✔ escalabilidad

// Firestore es como un contenedor de funciones. Ejemplo: Firestore.getFirestore(...)
import * as Firestore from "firebase/firestore"
// SDK Firestore
import { firestoreDB } from "./index"
// FirebaseService trabaja con IProjectJSON (objetos planos serializables), NO con Project
import { IProjectJSON } from "../classes/Project"

export class FirebaseService {

  // ======================================================
  // COLECCIÓN FIREBASE
  // ======================================================
  // static en todos los métodos: porque FirebaseService NO necesita ni estado interno ni instancias
  // Firestore funciona mucho con references. Ejemplo: 
    // collection(...) = referencia colección
    // doc(...) = referencia documento
    // getDocs(...) = datos reales

  // Referencia global a la colección "projects" de Firestore.
  // Aquí defino la colección Firestore. ¿Qué es una collection? En Firestore: Collection → Documents (en mi caso collection = projects → abc123, projects → xyz999)
  // IMPORTANTE: ¿Qué devuelve Firestore.collection(...)? Una referencia de Firestore, NO los datos. Devuelve un puntero/ruta hacia /projects (solo defino dónde están los proyectos)
  static projectsCollection = Firestore.collection(
    firestoreDB,
    "projects"
  )
  
  // Arquitectura completa hasta aquí:
    // firebase/index.ts
    // ↓
    // firestoreDB
    // ↓
    // FirebaseService
    // ↓
    // projectsCollection
    // ↓
    // referencia a /projects

  // ======================================================
  // MÉTODO getProjects
  // ======================================================
  // Descarga todos los documentos de la colección "projects" desde Firestore y los convierte en objetos IProjectJSON.
  static async getProjects(): Promise<IProjectJSON[]> {

    // getDocs(...): ejecuta realmente la consulta
    // Hasta ahora projectsCollection era SOLO una referencia/ruta.Sin embargo, aquí ya Firestore contacta con Firebase, descarga datos y devuelve documentos.
    // snapshot NO es todavía un array normal. Es una fotografía (snapshot) del resultado de la consulta
    
    // Ejecuta la consulta en Firestore.
    // getDocs(...):
      // → descarga todos los documentos
      // → devuelve un QuerySnapshot
    // snapshot representa el resultado completo de la consulta.
    const snapshot = await Firestore.getDocs(
      this.projectsCollection
    )

    // Se crea el array final que devolverá el método, ya que Firestore Firestore NO devuelve directamente IProjectJSON[], sino que devuelve DocumentSnapshots
    const projects: IProjectJSON[] = []

    // snapshot.docs: array de documentos Firestore. Cada doc representa un documento de la colección. Ejemplo: /projects/abc123
    // Es decir, cada doc contiene datos, metadata, id y referencia Firestore
    for (const doc of snapshot.docs) {

      // doc.data(): extrae solo el contenido del documento
      // Ejemplo: 
      // Firestore document:{  
          // "name": "Hospital",
          // "progress": 0.8
      // }
      // doc.data(): {
        // name: "Hospital",
        // progress: 0.8
      // }
      const data = doc.data() as IProjectJSON

      // Pero OJO: NO incluye doc.id y por eso hago esto.
      // Firestore separa doc.data() = campos y doc.id = identidad documento
      // ...data significa "copia todos los campos", es decir, reconstruyo IProjectJSON completo.
      projects.push({
        ...data,
        id: doc.id
      })
    }

    // Decuelve IProjectJSON → los datos serializados
    return projects
  }

  // Flujo real:
    // Firestore
    // ↓
    // DocumentSnapshots
    // ↓
    // doc.data()
    // ↓
    // IProjectJSON[]
    // ↓
    // ProjectsManager.restoreProject()
    // ↓
    // new Project(...)
    // ↓
    // instancias reales

  // ======================================================
  // MÉTODO saveProject
  // ======================================================
  // Responsabilidad: guardar o sobrescribir un proyecto en Firestore

  static async saveProject(project: IProjectJSON) {

    // setDoc() significa escribe completamente el documento
    // IMPORTANTE: Si NO existe: lo crea / Si YA existe: lo sobreescribe
    await Firestore.setDoc(
      // Crea una referencia al documento /projects/:id
      // Ejemplo: project.id = "abc123" → /projects/abc123
      Firestore.doc(this.projectsCollection, project.id),
      project
    )
  }

  // ======================================================
  // MÉTODO updateProject()
  // ======================================================
  // Responsabilidad: actualizar parcialmente un documento existente

  // Aquí uso Partial<IProjectJSON> ya que NO hace falta enviar todos los campos
  static async updateProject(
    id: string,
    data: Partial<IProjectJSON>
  ) {
    await Firestore.setDoc(
      Firestore.doc(this.projectsCollection, id),
      data,
      // "Mezcla estos datos con el documento existente"
      // Sin merge: true Firestore reemplazaría TODO el documento.
      { merge: true }
    )
  }

  // ======================================================
  // MÉTODO deleteProject()
  // ======================================================
  // Responsabilidad: eliminar un documento Firestore

  static async deleteProject(id: string) {

    // Con Firestore.deleteDoc(...), Firestore elimina físicamente el documento.
    await Firestore.deleteDoc(
      // Firestore.doc(this.projectsCollection, id) construye: /projects/:id
      Firestore.doc(this.projectsCollection, id)
    )
  }
  // MUY IMPORTANTE: Este método no toca React, ni this.list ni re-renderiza. SOLO elimina persistencia.
  // Por eso después ProjectsManager hace: this.deleteProject(id), que sincroniza memoria + React.
}
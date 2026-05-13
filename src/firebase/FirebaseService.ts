// ======================================================
// RESPONSABILIDADES
// ======================================================
// Lógica de persistencia:

    // ✔ loadProjects()
    // ✔ saveProject()
    // ✔ updateProject()
    // ✔ deleteProject()

// Este archivo se crea para que React deje de hacer directamente todo esto:
    // Firestore.addDoc(...)
    // Firestore.updateDoc(...)
    // Firestore.getDocs(...)

// Así Firebase queda encapsulado en este archivo y React ya NO necesita saber cómo funciona Firestore. MUY importante.

import * as Firestore from "firebase/firestore"

import { firestoreDB } from "./index"

import { IProjectJSON } from "../classes/Project"

export class FirebaseService {

  // ======================================================
  // COLECCIÓN FIREBASE
  // ======================================================

  static projectsCollection = Firestore.collection(
    firestoreDB,
    "projects"
  )

  // ======================================================
  // OBTENER TODOS LOS PROYECTOS
  // ======================================================

  static async getProjects(): Promise<IProjectJSON[]> {

    const snapshot = await Firestore.getDocs(
      this.projectsCollection
    )

    const projects: IProjectJSON[] = []

    for (const doc of snapshot.docs) {

      const data = doc.data() as IProjectJSON

      projects.push({
        ...data,
        id: doc.id
      })
    }

    return projects
  }

  // ======================================================
  // GUARDAR PROYECTO
  // ======================================================

  static async saveProject(project: IProjectJSON) {

    await Firestore.setDoc(
      Firestore.doc(this.projectsCollection, project.id),
      project
    )
  }

  // ======================================================
  // ACTUALIZAR PROYECTO
  // ======================================================

  static async updateProject(
    id: string,
    data: Partial<IProjectJSON>
  ) {
    await Firestore.setDoc(
      Firestore.doc(this.projectsCollection, id),
      data,
      { merge: true }
    )
  }

  // ======================================================
  // ELIMINAR PROYECTO
  // ======================================================

  static async deleteProject(id: string) {

    await Firestore.deleteDoc(
      Firestore.doc(this.projectsCollection, id)
    )
  }
}
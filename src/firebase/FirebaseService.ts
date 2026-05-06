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

import { IProjectJSON, IProject, Project } from "../classes/Project"

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

  static async getProjects(): Promise<Project[]> {

    const snapshot = await Firestore.getDocs(
      this.projectsCollection
    )

    const projects: Project[] = []

    for (const doc of snapshot.docs) {

      const data = doc.data() as IProjectJSON

      const projectInput: IProject = {
        name: data.name ?? "",
        description: data.description ?? "",
        status: data.status ?? "Pending",
        userRole: data.userRole ?? "Developer",

        finishDate: data.finishDate
          ? (data.finishDate as any).toDate
            ? (data.finishDate as any).toDate()
            : new Date(data.finishDate)
          : new Date(),

        cost: data.cost ?? 0,

        progress: data.progress ?? 0
      }

      const project = new Project(projectInput, {
        ...data,
        id: doc.id
      })

      projects.push(project)
    }

    return projects
  }

  // ======================================================
  // GUARDAR PROYECTO
  // ======================================================

  static async saveProject(project: IProjectJSON) {

    if (project.id) {

      await Firestore.setDoc(
        Firestore.doc(this.projectsCollection, project.id),
        project
      )

      return
    }

    await Firestore.addDoc(
      this.projectsCollection,
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

    await Firestore.updateDoc(
      Firestore.doc(this.projectsCollection, id),
      data
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
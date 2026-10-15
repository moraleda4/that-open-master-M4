// ======================================================
// RESPONSABILIDADES
// ======================================================
// Este archivo configura e inicializa Firebase.

// Responsabilidades:
// ✔ conectar la app con Firebase
// ✔ inicializar Firestore
// ✔ exportar la instancia global de base de datos

// IMPORTANTE:
// Este archivo SOLO configura infraestructura.
// NO contiene lógica de negocio ni CRUD.

// index.ts (infraestructura) vs FirebaseService.ts (persistencia CRUD)

// ======================================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ======================================================

// SDK (Software Development Kit: un conjunto de herramientas/librerías que te permiten usar una tecnología sin tener que construir todo desde cero) oficial de Firebase:
  // firebase/app → inicializa la aplicación Firebase
  // firebase/firestore → acceso a la base de datos Firestore

// Aquí no estamos importando la base de datos, estamos importando las funciones/utilidades del SDK
// Firestore es como un contenedor de funciones. Ejemplo: Firestore.getFirestore(...)
import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app"

// ======================================================
// CONFIGURACIÓN DEL PROYECTO FIREBASE
// ======================================================
// Configuración pública del proyecto Firebase.

// Estos datos permiten conectar esta app con el proyecto correcto en Firebase.

// IMPORTANTE:
// NO son credenciales secretas. Identifican el proyecto, pero no dan acceso completo.

const firebaseConfig = {
  // ¿apiKey es una contraseña? NO. La apiKey no es secreta. Solo identifica el proyecto. La seguridad real está en Firestore Rules
  apiKey: "AIzaSyD5Wq-bew6j02drgniN69ZJRsD7KTUQleY",
  authDomain: "creating-reactive-apps.firebaseapp.com",
  projectId: "creating-reactive-apps",
  storageBucket: "creating-reactive-apps.firebasestorage.app",
  messagingSenderId: "261776846720",
  appId: "1:261776846720:web:e1f3cc761cacd27e415b65"
};

// ======================================================
// INICIALIZACIÓN DE FIREBASE
// ======================================================
// const app = una instancia de Firebase App. Esa instancia representa tu conexión/configuración Firebase activa. Después todo cuelga de app

// Inicializa la aplicación Firebase.

// initializeApp(...):
  // → crea la conexión principal con Firebase
  // → carga la configuración del proyecto

// IMPORTANTE:
// Debe ejecutarse UNA sola vez en toda la aplicación.
const app = initializeApp(firebaseConfig);

// ======================================================
// FIRESTORE (BASE DE DATOS)
// ======================================================
// Se crea la instancia global de Firestore asociada a esta app

//// Representa la conexión activa con la base de datos Firestore.

// Se exporta para que otros archivos puedan realizar operaciones CRUD.

// Esta variable será usada en toda la app para leer/escribir datos
// Firestore.getFirestore(app) = "crea Firestore usando ESTA app Firebase"

// firestoreDB NO es la base de datos en sí, sino que es el cliente/conexión/punto de entrada hacia Firestore
// FirebaseService.ts hace cosas como: Firestore.collection(firestoreDB, "projects")
export const firestoreDB = Firestore.getFirestore(app)

export function getCollection<T>(path: string) {
  return Firestore.collection(
    firestoreDB,
    path
  ) as Firestore.CollectionReference<T>
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.deleteDoc(doc)
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.updateDoc(doc, data)
}
// ======================================================
// ARQUITECTURA COMPLETA:
// ======================================================
// Firebase SDK
// ↓
// initializeApp()
// ↓
// app Firebase
// ↓
// getFirestore(app)
// ↓
// firestoreDB
// ↓
// FirebaseService.ts
// ↓
// CRUD
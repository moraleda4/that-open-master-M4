// ======================================================
// RESPONSABILIDADES
// ======================================================
// Infraestructura base:

  // ✔ initializeApp()
  // ✔ firestoreDB
  // ✔ configuración
  // ✔ helpers genéricos

// ======================================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ======================================================

// Importamos Firestore y la función para poder inicializar la app de Cloud Firestore
import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app"

// ======================================================
// CONFIGURACIÓN DEL PROYECTO FIREBASE
// ======================================================
// Contiene las credenciales de tu proyecto en Firebase
// Estas credenciales identifican tu app contra Firebase

const firebaseConfig = {
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
// Se crea la instancia principal de la app Firebase
// IMPORTANTE: Esto debe ejecutarse una sola vez en toda la app
const app = initializeApp(firebaseConfig);

// ======================================================
// FIRESTORE (BASE DE DATOS)
// ======================================================
// Se crea la instancia de Firestore asociada a esta app
// Esta variable será usada en toda la app para leer/escribir datos
export const firestoreDB = Firestore.getFirestore(app)
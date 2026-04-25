import { initializeApp } from "firebase/app"
import { getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyD5Wq-bew6j02drgniN69ZJRsD7KTUQleY",
  authDomain: "creating-reactive-apps.firebaseapp.com",
  projectId: "creating-reactive-apps",
  storageBucket: "creating-reactive-apps.firebasestorage.app",
  messagingSenderId: "261776846720",
  appId: "1:261776846720:web:e1f3cc761cacd27e415b65"
};

const app = initializeApp(firebaseConfig);
// Exportar la variable firebaseDB para utilizarla en otros archivos
export const firebaseDB = getFirestore()
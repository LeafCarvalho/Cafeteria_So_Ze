import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Importe getStorage

const firebaseConfig = {
    apiKey: "AIzaSyD_CCfIqWRggQsZxaVK6Cq_L0BiytV7xNM",
    authDomain: "cafeteria-so-ze.firebaseapp.com",
    projectId: "cafeteria-so-ze",
    storageBucket: "cafeteria-so-ze.appspot.com",
    messagingSenderId: "913264179492",
    appId: "1:913264179492:web:53e72024a765f9f1599bb1",
    measurementId: "G-T6NGFD3Q0W"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize a Autenticação
const auth = getAuth(app);

// Inicialize o Firestore
const db = getFirestore(app);

// Inicialize o Firebase Storage
const storage = getStorage(app); // Inicialize o Storage

export { db, auth, storage }; // Exporte o storage

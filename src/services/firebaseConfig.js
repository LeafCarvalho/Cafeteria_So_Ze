import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Importe getStorage

const firebaseConfig = {
    apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
    authDomain: import.meta.env.VITE_REACT_APP_authDomain,
    projectId: import.meta.env.VITE_REACT_APP_projectId,
    storageBucket: import.meta.env.VITE_REACT_APP_storageBucket,
    messagingSenderId: import.meta.env.VITE_REACT_APP_messagingSenderId,
    appId: import.meta.env.VITE_REACT_APP_appId,
    measurementId: import.meta.env.VITE_REACT_APP_measurementId
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

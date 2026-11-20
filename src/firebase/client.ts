import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const configured = Object.values(firebaseConfig).every(Boolean);

// La carta también puede mostrarse sin configurar Firebase. Usamos una
// configuración local válida únicamente para que los módulos de Firebase se
// puedan importar; AuthContext y los servicios comprueban `configured` antes
// de realizar operaciones contra el backend.
const fallbackConfig = {
  apiKey: 'local-development-key',
  authDomain: 'local-development.firebaseapp.com',
  databaseURL: 'https://local-development-default-rtdb.firebaseio.com',
  projectId: 'local-development',
  appId: 'local-development-app'
};

const app = getApps().length ? getApp() : initializeApp(configured ? firebaseConfig : fallbackConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

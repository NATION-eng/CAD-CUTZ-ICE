import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyA8qVU4B_dBNWgUDavmoq7jvPwv43s4-8Y",
  authDomain: "cad-cutz.firebaseapp.com",
  projectId: "cad-cutz",
  // storageBucket removed to stop 401
  messagingSenderId: "1087354514412",
  appId: "1:1087354514412:web:327e009cc1d307ac59eec9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Export Auth

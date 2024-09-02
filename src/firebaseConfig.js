import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
    apiKey: "AIzaSyAw8gUZd0P65Pq5hATfGtcgEbJ4AxOfDM8",
    authDomain: "boards-app-78d43.firebaseapp.com",
    projectId: "boards-app-78d43",
    storageBucket: "boards-app-78d43.appspot.com",
    messagingSenderId: "995954325199",
    appId: "1:995954325199:web:102761981a699ed42269ba",
    measurementId: "G-876CD9X7Z4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

// Create an instance of the Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export the auth, db, and googleProvider
export { auth, db, googleProvider };

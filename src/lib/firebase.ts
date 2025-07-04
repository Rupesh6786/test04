// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEsi2at9uEvSycslN4-6rH6s8WbLJQjWs",
  authDomain: "classic-solution-d7a01.firebaseapp.com",
  projectId: "classic-solution-d7a01",
  storageBucket: "classic-solution-d7a01.appspot.com",
  messagingSenderId: "537568297351",
  appId: "1:537568297351:web:2d9e6ce7fa03e893b85322"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, googleProvider, db, storage };
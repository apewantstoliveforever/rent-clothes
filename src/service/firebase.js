// import firebase from 'firebase/app';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
// import 'firebase/firestore';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAE3JMfEt5_8vQLBh0SYYi7T48KJ31_bLk",
  authDomain: "rent-clothes-project.firebaseapp.com",
  projectId: "rent-clothes-project",
  storageBucket: "rent-clothes-project.appspot.com",
  messagingSenderId: "935494970261",
  appId: "1:935494970261:web:d4728823ca3d4d1db0e49c",
  measurementId: "G-MJ86Y83C8B"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore  = getFirestore(app);

export { auth, firestore };

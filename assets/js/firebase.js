import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuVsHCEbYyWIpd1wexx3jugSYCrlONN28",
  authDomain: "website-sekolah-3c480.firebaseapp.com",
  projectId: "website-sekolah-3c480",
  storageBucket: "website-sekolah-3c480.firebasestorage.app",
  messagingSenderId: "536032424833",
  appId: "1:536032424833:web:b0359cc339c7a29eb26e80"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

export {
  db,
  auth,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc
};
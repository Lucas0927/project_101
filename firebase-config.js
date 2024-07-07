// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCsp2Jn6VdumbzL87znFmgOR-0iImaC3D0",
    authDomain: "project101-8f9c5.firebaseapp.com",
    projectId: "project101-8f9c5",
    storageBucket: "project101-8f9c5.appspot.com",
    messagingSenderId: "668941963532",
    appId: "1:668941963532:web:d191d523aed7a8141eb929"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
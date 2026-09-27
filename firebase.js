import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCkgVfm2jDPKgs6q4nrvXCVxSUKoaWI_oI",
    authDomain: "skillsense-26fe3.firebaseapp.com",
    projectId: "skillsense-26fe3",
    storageBucket: "skillsense-26fe3.firebasestorage.app",
    messagingSenderId: "183288381732",
    appId: "1:183288381732:web:26fd7c7a1d4ca392b833b1"
  };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
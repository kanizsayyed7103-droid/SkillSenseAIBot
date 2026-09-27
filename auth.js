import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SIGNUP FUNCTION
window.signupUser = async function() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firebase Firestore mein user ka data save karna
        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            email: email,
            createdAt: new Date()
        });

        alert("Account Created Successfully!");
        window.location.href = "dashboard.html"; // Yahan apne page ka link dein
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// LOGIN FUNCTION
window.loginUser = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
        window.location.href = "dashboard.html"; 
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
}
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Ye function local storage se data nikal kar Firebase mein dalega
async function migrateLocalStorageData(userId) {
    const localData = localStorage.getItem('interview_history'); // Aapki key ka naam yahan likhein
    
    if (localData) {
        const parsedData = JSON.parse(localData);
        
        try {
            // Local data ko user ke specific collection mein save karna
            await addDoc(collection(db, "users", userId, "history"), {
                data: parsedData,
                migratedAt: new Date()
            });
            
            console.log("Local storage data successfully synced to Firebase!");
            
            // Sync hone ke baad local storage saaf kar dein (Optional)
            // localStorage.removeItem('interview_history'); 
            
        } catch (e) {
            console.error("Error syncing local data: ", e);
        }
    }
}
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Check Auth & Load Data
onAuthStateChanged(auth, (user) => {
    if (user) {
        const emailEl = document.getElementById("userEmail");
        if (emailEl) emailEl.innerText = user.email;
        loadHistory(user.uid);
    } else {
        window.location.href = "NewIndex.html";
    }
});

// 2. Load History from Firebase
async function loadHistory(uid) {
    const box = document.getElementById("history");
    if (!box) return;
    
    box.innerHTML = "<p style='text-align:center;'>Loading your history...</p>";

    try {
        // Query: Users -> UID -> History (Latest first)
        // NOTE: If this fails, ensure you have created an 'Index' in Firebase Console
        const q = query(collection(db, "users", uid, "history"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            box.innerHTML = "<p style='text-align:center;'>No interviews yet. Start your first one!</p>";
            return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
            const h = docSnap.data();
            const docId = docSnap.id;

            // --- SCORE FORMATTING LOGIC ---
            // Ensure score is a number and fix scale to /10
            let displayScore = h.totalScore || 0;
            if (displayScore > 10) {
                displayScore = (displayScore / 10).toFixed(1);
            } else {
                displayScore = Number(displayScore).toFixed(1);
            }

            html += `
                <div class="question history-card" style="position:relative; margin-bottom:15px; padding:15px; border-radius:12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <span class="delete-btn" onclick="deleteHistory('${docId}')" style="position:absolute; top:12px; right:15px; cursor:pointer; color:#ff4d4d; font-size:1.2rem;">✖</span>
                    <strong style="font-size:1.1rem; color:#fff;">${h.role || 'Interview'}</strong> <span style="font-size:0.8rem; opacity:0.7;">(${h.difficulty || 'Medium'})</span><br>
                    
                    <div style="margin-top:8px;">
                        <span style="color:#00e676; font-weight:bold;">Score: ${displayScore}/10</span><br>
                        <small style="opacity:0.6;">Date: ${h.date}</small>
                    </div>

                    ${h.feedback ? `<p style="font-size:0.85rem; margin-top:10px; opacity:0.9; font-style:italic;">"${h.feedback}"</p>` : ""}
                </div>
            `;
        });
        box.innerHTML = html;

    } catch (error) {
        console.error("Error loading history:", error);
        // Fallback: If "orderBy" fails because of missing index, try fetching without ordering
        box.innerHTML = "<p style='color:orange;'>Error loading sorted history. Check Firebase Indexes.</p>";
    }
}

// 3. Delete History from Firebase
window.deleteHistory = async function(docId) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Are you sure you want to delete this record permanentally?")) return;

    try {
        await deleteDoc(doc(db, "users", user.uid, "history", docId));
        loadHistory(user.uid); // Refresh UI
    } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete record.");
    }
};

// --- Helper Functions ---

window.logout = function() {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = "NewIndex.html";
    });
};

window.back = function() {
    window.location.href = "dashboard.html";
};

window.toggleTheme = function() {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

// Initial Theme Check
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
}
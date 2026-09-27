import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. CHECK AUTH STATUS
onAuthStateChanged(auth, (user) => {
  if (user) {
    const el = document.getElementById("userEmail");
    if (el) el.innerText = user.email;
    console.log("Logged in as:", user.email);
  } else {
    window.location.href = "NewIndex.html";
  }
});

// 2. THEME LOGIC
function applyTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    document.body.classList.add("light");
  }
}

window.toggleTheme = function () {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}
applyTheme();

// 3. LOGOUT FUNCTION
window.logout = function () {
  signOut(auth).then(() => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("currentInterview");
    window.location.href = "NewIndex.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
}

// 4. HISTORY NAVIGATION
window.goHistory = function () {
  window.location.href = "history.html";
}

// 5. AI INTERVIEW LOGIC (n8n Connection)
window.startInterview = async function () {
  const role = document.getElementById("role").value;
  const job = document.getElementById("job").value;
  const difficulty = document.getElementById("difficulty").value;

  if (!role || !job || !difficulty) {
    alert("Please select Role, Job Level, and Difficulty");
    return;
  }

  // Button Loading State
  const btn = document.querySelector(".start");
  const originalText = btn.innerText;
  btn.innerText = "AI is thinking...";
  btn.disabled = true;

  try {
    const webhookUrl = 'https://sahil10.app.n8n.cloud/webhook/generate-questions';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: role,
        difficulty: difficulty,
        jobLevel: job
      })
    });

    if (!response.ok) throw new Error("Webhook failed");

    const data = await response.json();
    console.log("AI Data Received:", data);

    let aiQuestions = data.questions;

    // Parsing safety
    if (typeof aiQuestions === 'string') {
      try {
        aiQuestions = JSON.parse(aiQuestions);
      } catch (e) {
        aiQuestions = [aiQuestions];
      }
    }

    const config = {
      role,
      job,
      difficulty,
      total: aiQuestions.length,
      questions: aiQuestions,
      startedAt: Date.now()
    };

    localStorage.setItem("currentInterview", JSON.stringify(config));
    window.location.href = "interview.html";

  } catch (error) {
    console.error("Error connecting to AI:", error);
    alert("Failed to generate questions. Check internet or console.");
    btn.innerText = originalText;
    btn.disabled = false;
  }
}
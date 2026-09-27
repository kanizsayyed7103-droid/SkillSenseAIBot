import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. GLOBAL UI FUNCTIONS ---
window.toggleTheme = function() {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

window.logout = function() {
  signOut(auth).then(() => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("currentInterview");
    window.location.href = "NewIndex.html";
  });
};

// --- 2. AUTH STATE ---
onAuthStateChanged(auth, (user) => {
    const emailEl = document.getElementById("userEmail");
    if (user) {
        if (emailEl) emailEl.innerText = user.email;
    } else {
        window.location.href = "NewIndex.html"; 
    }
});

// --- 3. INTERVIEW LOGIC ---
const config = JSON.parse(localStorage.getItem("currentInterview"));

if (!config || !config.questions || config.questions.length === 0) {
    alert("No questions found!");
    window.location.href = "dashboard.html";
}

let current = 0;
let questions = config.questions;
let responses = [];

showQuestion();

function showQuestion() {
  const qBox = document.getElementById("questionBox");
  const pBox = document.getElementById("progress");
  if (qBox) qBox.innerText = questions[current];
  if (pBox) pBox.innerText = `Question ${current + 1} / ${questions.length}`;
}

window.nextQuestion = function() {
  const ansEl = document.getElementById("answer");
  const ans = ansEl.value.trim();

  if (!ans) {
    alert("Please type or speak your answer!");
    return;
  }

  responses.push({
    question: questions[current] || "N/A",
    answer: ans
  });

  ansEl.value = "";
  current++;

  if (current < questions.length) {
    showQuestion();
  } else {
    finishInterview();
  }
};

// --- ROBUST FINISH INTERVIEW (FIXED SCORING 1-10) ---
async function finishInterview() {
  const btn = document.querySelector(".next-btn") || document.querySelector(".start");
  if(btn) { 
      btn.innerText = "AI is Grading... Please wait"; 
      btn.disabled = true; 
  }

  try {
    const response = await fetch("https://sahil10.app.n8n.cloud/webhook/grade-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: config.role || "Developer",
        difficulty: config.difficulty || "Medium",
        responses: responses 
      })
    });

    const responseText = await response.text();
    console.log("Raw AI Response:", responseText);

    let finalScore = 0;
    let feedback = "Grading complete.";

    // 1. ATTEMPT JSON PARSE
    try {
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResult = JSON.parse(cleanedText);
        finalScore = aiResult.totalScore || aiResult.score || 0;
        feedback = aiResult.feedback || feedback;
    } catch (e) {
        // 2. FALLBACK: REGEX (Finds any number like 85 or 8.5)
        const match = responseText.match(/(\d+(\.\d+)?)/);
        if (match) {
            finalScore = parseFloat(match[0]);
        }
    }

    // --- LOGIC TO CONVERT TO 10 POINT SCALE (e.g., 85 -> 8.5) ---
    let normalizedScore = parseFloat(finalScore);
    if (normalizedScore > 10) {
        normalizedScore = (normalizedScore / 10).toFixed(1);
    } else {
        normalizedScore = normalizedScore.toFixed(1);
    }

    const finalData = {
        role: config.role || "N/A",
        difficulty: config.difficulty || "N/A",
        date: new Date().toLocaleString(),
        timestamp: Date.now(),
        totalScore: parseFloat(normalizedScore), // Saves as 8.5
        feedback: feedback,
        responses: responses
    };

    const user = auth.currentUser;
    if (user) {
        await addDoc(collection(db, "users", user.uid, "history"), finalData);
        console.log("✅ Data saved with score:", normalizedScore);
    }

    localStorage.removeItem("currentInterview");
    window.location.href = "history.html";

  } catch (error) {
    console.error("❌ Error:", error);
    alert("Grading failed: " + error.message);
    if(btn) {
        btn.disabled = false;
        btn.innerText = "Next Question";
    }
  }
}

// --- 4. PRO VOICE LOGIC (CONTINUOUS & STABLE) ---
window.startVoice = function(){
  if(!('webkitSpeechRecognition' in window)){
    alert("Voice input not supported in this browser");
    return;
  }
  
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;      // Keep mic on
  recognition.interimResults = false; // Only final text

  const ansField = document.getElementById("answer");

  recognition.onresult = function(event){
    let newText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            newText += event.results[i][0].transcript;
        }
    }
    
    if (newText) {
        // Adds space automatically between sentences
        const space = ansField.value.trim().length > 0 ? " " : "";
        ansField.value += space + newText;
    }
  };

  recognition.onerror = (e) => console.error("Speech Error: ", e);
  
  recognition.start();
  console.log("Voice started...");
};
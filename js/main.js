const container = document.getElementById("card-container");
let cards = [];
let currentCard = null;
let isAdmin = isGamemaster();

function updateAdminPanel() {
  if (isAdmin) {
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("status-bar").innerHTML = `👑 Zalogowano jako <strong>Wulwryczek</strong> <button onclick="logout()">[Wyloguj]</button>`;
  } else {
    document.getElementById("admin-panel").style.display = "none";
    document.getElementById("status-bar").innerHTML = "";
  }
}


function fetchCards() {
  fetch("data/cards.json?" + Date.now())
    .then(res => res.json())
    .then(data => {
      cards = data;
      renderCards();
      if (isAdmin) updateCardJsonPreview();

    });
}

function renderCards() {
  container.innerHTML = "";
  cards.forEach(card => {
    const unlocked = localStorage.getItem("card-" + card.id);
    const img = document.createElement("img");
    img.src = unlocked ? card.image : "assets/icons/question.png";
    img.onclick = () => {
      if (!unlocked) showPopup(card);
    };
    container.appendChild(img);
  });
}

function showPopup(card) {
  currentCard = card;
  document.getElementById("unlock-popup").style.display = "block";
}

async function submitCode() {
  const input = document.getElementById("code-input").value.trim();
  const hash = await sha256(input);
  if (hash === currentCard.codeHash) {
    localStorage.setItem("card-" + currentCard.id, true);
    renderCards();
    alert("Odblokowano!");
  } else {
    alert("Błędny kod.");
  }
  document.getElementById("unlock-popup").style.display = "none";
}

function toggleLogin() {
  const panel = document.getElementById("login-panel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function login() {
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();
  if (login === "wulwryczek" && password === "zagadkowo2137") {
    isAdmin = true;
    document.getElementById("login-panel").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    updateCardJsonPreview();
    alert("Zalogowano jako Wulwryk 👑");
  } else {
    document.getElementById("login-error").textContent = "Błędne dane.";
  }
}

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}

// Admin-only
async function addCard() {
  const fileInput = document.getElementById("card-upload");
  const code = document.getElementById("card-code").value.trim();
  if (!fileInput.files.length || !code) return alert("Dodaj obrazek i kod.");
  const file = fileInput.files[0];
  const fileName = "card-" + (cards.length + 1) + "." + file.name.split('.').pop();
  const imagePath = "assets/cards/" + fileName;
  const hash = await sha256(code);

  cards.push({ id: "card-" + (cards.length + 1), image: imagePath, codeHash: hash });
  updateCardJsonPreview();
  alert("Dodano! Prześlij ręcznie plik do: " + imagePath);
}

function updateCardJsonPreview() {
  document.getElementById("card-json-preview").textContent = JSON.stringify(cards, null, 2);
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cards.json";
  a.click();
}

fetchCards();
setInterval(fetchCards, 5000);
updateAdminPanel();

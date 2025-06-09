// Plik main.js
const container = document.getElementById("card-container");
let cards = [];

function getCardsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cards")) || [];
  } catch {
    return [];
  }
}

function saveCardsToStorage(cards) {
  localStorage.setItem("cards", JSON.stringify(cards));
}

function renderPlaceholders() {
  container.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const img = document.createElement("img");
    img.src = "assets/icons/rewers.webp";
    container.appendChild(img);
  }
}

function fetchCards() {
  fetch("data/cards.json?" + Date.now())
    .then(res => res.json())
    .then(remoteCards => {
      const localCards = getCardsFromStorage();
      cards = [...remoteCards, ...localCards];
      renderCards();
      if (isGamemaster()) updateCardJsonPreview();
    })
    .catch(() => {
      cards = getCardsFromStorage();
      cards.length ? renderCards() : renderPlaceholders();
    });
}

function renderCards() {
  container.innerHTML = "";
  cards.forEach(card => {
    const unlocked = localStorage.getItem("card-" + card.id) === "true";
    const img = document.createElement("img");
    img.src = unlocked ? card.image : "assets/icons/rewers.webp";
    img.classList.add("card-img");
    container.appendChild(img);
  });
}

function showTemporaryMessage(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  Object.assign(div.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#333",
    padding: "10px 20px",
    borderRadius: "10px",
    color: "#fff",
    zIndex: 1000,
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function setupPanelToggles() {
  const body = document.body;
  const chatToggle = document.getElementById("chat-toggle");
  const chatIcon = document.getElementById("chat-icon");
  const adminToggle = document.getElementById("admin-toggle");
  const adminIcon = document.getElementById("admin-icon");

  function flipChevron(icon, direction) {
    icon.style.transform = direction === "right" ? "scaleX(-1)" : "scaleX(1)";
  }

  if (chatToggle && chatIcon) {
    chatToggle.addEventListener("click", () => {
      const hidden = body.classList.toggle("chat-hidden");
      flipChevron(chatIcon, hidden ? "left" : "right");
    });
    flipChevron(chatIcon, body.classList.contains("chat-hidden") ? "left" : "right");
  }

  if (adminToggle && adminIcon) {
    adminToggle.addEventListener("click", () => {
      const hidden = body.classList.toggle("admin-hidden");
      flipChevron(adminIcon, hidden ? "right" : "left");
    });
    flipChevron(adminIcon, body.classList.contains("admin-hidden") ? "right" : "left");
  }
}

function updateAdminPanel() {
  if (!isGamemaster()) return;

  document.getElementById("admin-panel").style.display = "block";

  const adminToggle = document.getElementById("admin-toggle");
  if (adminToggle) adminToggle.style.display = "block";

  const statusBar = document.getElementById("status-bar");
  if (statusBar) {
    statusBar.innerHTML = `👑 Zalogowano jako <strong>Wulwryczek</strong> <button onclick="logout()">[Wyloguj]</button>`;
  }

  const adminControls = document.getElementById("admin-controls");
  if (adminControls) {
    adminControls.style.display = "block";
  }

  updatePlayersList();
}

function addCard() {
  const fileInput = document.getElementById("card-upload");
  const code = document.getElementById("card-code").value.trim();

  if (!fileInput.files.length || !code) {
    alert("Dodaj obrazek i kod.");
    return;
  }

  const file = fileInput.files[0];
  const fileName = "card-" + (cards.length + 1) + "." + file.name.split('.').pop();
  const imagePath = "assets/cards/" + fileName;

  const newCard = {
    id: "card-" + (cards.length + 1),
    image: imagePath,
    code: code
  };

  cards.push(newCard);

  const newLocalCards = getCardsFromStorage();
  newLocalCards.push(newCard);
  saveCardsToStorage(newLocalCards);

  updateCardJsonPreview();
  renderCards();
  alert("Dodano! Prześlij ręcznie plik obrazka do: " + imagePath);
}

function updateCardJsonPreview() {
  const el = document.getElementById("card-json-preview");
  if (el) el.textContent = JSON.stringify(cards, null, 2);
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cards.json";
  a.click();
}

function clearLocalCards() {
  if (confirm("Czy na pewno chcesz usunąć wszystkie lokalne karty?")) {
    localStorage.removeItem("cards");
    fetchCards();
    alert("Lokalne karty zostały usunięte.");
  }
}

function isGamemaster() {
  return localStorage.getItem("gm") === "true";
}

function logout() {
  localStorage.removeItem("gm");
  location.reload();
}

// === DOMContentLoaded Init ===
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("code-input");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const code = input.value.trim();
      const match = cards.find(card => card.code === code);

      if (match) {
        const alreadyUnlocked = localStorage.getItem("card-" + match.id) === "true";
        if (alreadyUnlocked) {
          showTemporaryMessage("🔓 Karta już odblokowana");
          input.value = "";
          return;
        }

        const cardIndex = cards.findIndex(c => c.id === match.id);
        const imgEl = container.children[cardIndex];
        imgEl.classList.add("flip-fade");

        localStorage.setItem("card-" + match.id, "true");
        input.value = "";

        setTimeout(renderCards, 500);
      } else {
        input.style.border = "1px solid red";
        input.value = "";
        input.placeholder = "Błędny kod";
      }
    }
  });

  setupPanelToggles();
});

// === Start ===
fetchCards();
updateAdminPanel();

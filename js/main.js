// Plik main.js
const container = document.getElementById("card-container");
let cards = [];
let currentCard = null;

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

// Renderuj placeholdery
function renderPlaceholders() {
  container.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const img = document.createElement("img");
    img.src = "assets/icons/rewers.webp";
    container.appendChild(img);
  }
}

// Pobieranie kart z JSON lub localStorage
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
      // fallback na same localStorage
      cards = getCardsFromStorage();
      if (!cards.length) renderPlaceholders();
      else renderCards();
    });
}

// Render kart
function renderCards() {
  container.innerHTML = "";
  cards.forEach(card => {
    const unlocked = localStorage.getItem("card-" + card.id);
    const img = document.createElement("img");
    img.src = unlocked ? card.image : "assets/icons/rewers.webp";
    img.onclick = () => {
      if (!unlocked) showPopup(card);
    };
    container.appendChild(img);
  });
}

// Popup
function showPopup(card) {
  currentCard = card;
  document.getElementById("unlock-popup").style.display = "block";
}

// Odbokowywanie
function submitCode() {
  const input = document.getElementById("code-input").value.trim();
  if (input === currentCard.code) {
    localStorage.setItem("card-" + currentCard.id, true);
    renderCards();
    alert("Odblokowano!");
  } else {
    alert("Błędny kod.");
  }
  document.getElementById("unlock-popup").style.display = "none";
}

// Panel GM
function updateAdminPanel() {
  if (!isGamemaster()) return;

  document.getElementById("admin-panel").style.display = "block";
  const statusBar = document.getElementById("status-bar");
  if (statusBar) {
    statusBar.innerHTML = `👑 Zalogowano jako <strong>Wulwryczek</strong> <button onclick="logout()">[Wyloguj]</button>`;
  }

  const adminControls = document.getElementById("admin-controls");
  if (adminControls) {
    adminControls.style.display = "block";
  }

  updatePlayersList(); // z chat.js
}

// Dodanie nowej karty
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

// Podgląd JSON
function updateCardJsonPreview() {
  const el = document.getElementById("card-json-preview");
  if (el) el.textContent = JSON.stringify(cards, null, 2);
}

// Pobieranie JSON
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

// Init
fetchCards();
updateAdminPanel();

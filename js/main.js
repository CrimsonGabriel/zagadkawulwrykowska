//Plik main.html
const container = document.getElementById("card-container");
let cards = [];
let currentCard = null;

// Domyślnie pokaż 5 zasłoniętych kart
function renderPlaceholders() {
  container.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const img = document.createElement("img");
    img.src = "assets/icons/rewers.webp";
    container.appendChild(img);
  }
}

// Pobieranie kart z JSON-a
function fetchCards() {
  fetch("data/cards.json?" + Date.now())
    .then(res => res.json())
    .then(data => {
      cards = data || [];
      renderCards();
      if (isGamemaster()) updateCardJsonPreview();
    })
    .catch(() => {
      renderPlaceholders(); // fallback jeśli brak pliku
    });
}

// Wyświetlanie kart na stronie
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

// Pokazuje popup do odblokowania karty
function showPopup(card) {
  currentCard = card;
  document.getElementById("unlock-popup").style.display = "block";
}

// Obsługa odblokowywania
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

// Panel administratora
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

// Dodaje nową kartę i kod
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

  cards.push({
    id: "card-" + (cards.length + 1),
    image: imagePath,
    code: code
  });

  updateCardJsonPreview();
  alert("Dodano! Prześlij ręcznie plik obrazka do: " + imagePath);
}

// Podgląd JSON-a w panelu GM-a
function updateCardJsonPreview() {
  const el = document.getElementById("card-json-preview");
  if (el) el.textContent = JSON.stringify(cards, null, 2);
}

// Pobieranie JSON-a
function downloadJSON() {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cards.json";
  a.click();
}

// Inicjalizacja
fetchCards();
setInterval(fetchCards, 5000);
updateAdminPanel();

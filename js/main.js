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
      if (!cards.length) renderPlaceholders();
      else renderCards();
    });
}

function renderCards() {
  container.innerHTML = "";
  cards.forEach(card => {
    const unlocked = localStorage.getItem("card-" + card.id);
    const img = document.createElement("img");
    img.src = unlocked ? card.image : "assets/icons/rewers.webp";
    img.classList.add("card-img");
    img.onclick = () => {
      if (!unlocked) showPopup(card, img);
    };
    container.appendChild(img);
  });
}

function showPopup(card, imgElement) {
  currentCard = card;
  const popup = document.getElementById("unlock-popup");
  popup.style.display = "block";
  const input = document.getElementById("code-input");
  input.value = "";
  input.placeholder = "Wpisz kod...";
  input.focus();

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      const inputVal = input.value.trim();
      if (inputVal === currentCard.code) {
        localStorage.setItem("card-" + currentCard.id, true);
        imgElement.classList.add("flip-fade");
        setTimeout(renderCards, 500);
      } else {
        input.style.border = "1px solid red";
        input.value = "";
        input.placeholder = "Błędny kod";
      }
      popup.style.display = "none";
    }
  };
}

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

fetchCards();
updateAdminPanel();

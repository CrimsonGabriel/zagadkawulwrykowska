// Plik main.js
const container = document.getElementById("card-container");
let cards = [];
let cardOwnerMap = {};
let currentDiscoveredCards = [];
let cardOwnersMultiMap = {};

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

function listenToOwnDiscoveredCards() {
  firebase.database().ref(`discoveredCards/${playerId}`).on("value", snap => {
    const data = snap.val() || {};
    currentDiscoveredCards = Object.entries(data)
      .filter(([key, val]) => key !== "_nickname" && val === true)
      .map(([key]) => key);
    renderCards(currentDiscoveredCards);
  });
}


function listenToAllDiscoveredCards() {
  firebase.database().ref("discoveredCards").on("value", snap => {
    const data = snap.val() || {};
    const discoveredSet = new Set();
    cardOwnersMultiMap = {};

    for (const [playerId, entries] of Object.entries(data)) {
      for (const [cardId, val] of Object.entries(entries)) {
        if (cardId === "_nickname" || val !== true) continue;

        discoveredSet.add(cardId);

        if (!cardOwnersMultiMap[cardId]) {
          cardOwnersMultiMap[cardId] = [];
        }
        cardOwnersMultiMap[cardId].push(playerId);
      }
    }

    currentDiscoveredCards = [...discoveredSet];
    renderCards(currentDiscoveredCards);
  });
}



function subscribeToNicknames() {
  firebase.database().ref("nicknames").on("value", snap => {
    nicknameMap = snap.val() || {};
    renderCards(currentDiscoveredCards);
  });
}

function fetchCards() {
  return new Promise((resolve) => {
    fetch("data/cards.json?" + Date.now())
      .then(res => res.json())
      .then(remoteCards => {
        const localCards = getCardsFromStorage();
        cards = [...remoteCards, ...localCards];
        if (isGamemaster()) {
          listenToAllDiscoveredCards();
          subscribeToNicknames();
        } else {
          listenToOwnDiscoveredCards();
        }
        resolve();
      })
      .catch(() => {
        cards = getCardsFromStorage();
        cards.length ? renderCards([]) : renderPlaceholders();
        resolve();
      });
  });
}


function renderCards(discovered = []) {
  container.innerHTML = "";
  cards.forEach(card => {
    const isDiscovered = discovered.includes(card.id);
    const img = document.createElement("img");
    img.src = isDiscovered ? card.image : "assets/icons/rewers.webp";
    img.classList.add("card-img");

    const wrapper = document.createElement("div");
    wrapper.classList.add("card-wrapper");
    wrapper.appendChild(img);

    if (isDiscovered && isGamemaster()) {
	const owners = cardOwnersMultiMap[card.id] || [];
	const label = document.createElement("div");
	label.classList.add("card-nickname");

owners.forEach(pid => {
  const nick = nicknameMap[pid] || pid;
  const line = document.createElement("div");
  line.classList.add("nickname-line");

  const nameSpan = document.createElement("span");
  nameSpan.textContent = nick;
  line.appendChild(nameSpan);

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.classList.add("delete-btn");
  delBtn.title = "Usuń tę kartę graczowi";
  delBtn.onclick = () => {
    if (confirm(`Znów zakryć kartę "${card.id}" graczowi ${nick}?`)) {
      firebase.database().ref(`discoveredCards/${pid}/${card.id}`).remove();
    }
  };
  line.appendChild(delBtn);

  label.appendChild(line);
});

  wrapper.appendChild(label);
}

    container.appendChild(wrapper);
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

  document.body.classList.add("admin-enabled");
  document.getElementById("admin-panel").style.display = "block";

  const statusText = document.getElementById("status-text");
  if (statusText) {
    statusText.innerHTML = `👑 Zalogowano jako <strong>Wulwryczek</strong> <button class="gm-btn-black"  onclick="logout()">Wyloguj</button>`;
  }

  const adminControls = document.getElementById("admin-controls");
  if (adminControls) adminControls.style.display = "block";

  const adminToggle = document.getElementById("admin-toggle");
  if (adminToggle) adminToggle.style.display = "block";

  updatePlayersList?.();
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
  return localStorage.getItem("isGM") === "true";
}

function logout() {
  localStorage.removeItem("isGM");
  localStorage.removeItem("gm");
  localStorage.removeItem("allowLogin");
  location.reload();
}

// === DOMContentLoaded Init ===
document.addEventListener("DOMContentLoaded", () => {
  setupPanelToggles();
  fetchCards().then(() => {
    const input = document.getElementById("code-input");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const code = input.value.trim();
        const match = cards.find(card => card.code === code);

        if (!match) {
          input.style.border = "1px solid red";
          input.value = "";
          input.placeholder = "Błędny kod";
          return;
        }

        const isAlreadyDiscovered = currentDiscoveredCards.includes(match.id);
        if (isAlreadyDiscovered) {
          showTemporaryMessage("🔒 Ta karta została już przez Ciebie odkryta.");
          input.value = "";
          return;
        }

        firebase.database().ref(`discoveredCards/${playerId}/${match.id}`).set(true);

        input.value = "";
      }
    });

    if (!isGamemaster()) {
      listenToOwnDiscoveredCards(); // ⬅️ Dodane tutaj
    }

    updateAdminPanel();
	updateCardJsonPreview();
  });
});



function toggleMusic() {
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  if (audio.paused) {
    audio.play();
    btn.textContent = "🔈";
  } else {
    audio.pause();
    btn.textContent = "🔇";
  }
}

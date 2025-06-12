// Plik chat.js
// === 🔧 Inicjalizacja ===
const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");

if (!localStorage.getItem("playerId")) {
  const id = "gracz_" + crypto.randomUUID().slice(0, 6);
  localStorage.setItem("playerId", id);
}
let playerId = localStorage.getItem("playerId");

let nicknameMap = {};
let colorMap = {};
let bannedList = {};
let fullMessageMap = {};
let allPlayers = [];


// === 💬 Obsługa wiadomości ===
function renderChat(messages) {
  chatLog.innerHTML = "";
  fullMessageMap = messages || {};

  Object.entries(messages).slice(-60).forEach(([id, msg]) => {
    const name = msg.name;
    const nickname = nicknameMap[name] || name;
    const color = colorMap[name] || "#fff";
    const label = name === "GM"
      ? '<span style="color:red;">GM Wulwryk</span>'
      : `<span style="color:${color};">${nickname}</span>`;
    const time = new Date(msg.timestamp || Date.now())
      .toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' });

    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-msg");

    const msgSpan = document.createElement("span");
    msgSpan.innerHTML = `<span style="color:gray;">[${time}]</span> [${label}] ${msg.text}`;
    wrapper.appendChild(msgSpan);

    if (isGamemaster()) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.classList.add("delete-btn");
      delBtn.onclick = () => deleteMessage(id);
      wrapper.appendChild(delBtn);
    }

    chatLog.appendChild(wrapper);
  });
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  if (bannedList[playerId]) {
    alert("Jesteś zbanowany 😡");
    return;
  }

  const name = isGamemaster() ? "GM" : playerId;

  db.ref("chat").push({
    name,
    text,
    timestamp: Date.now()
  });

  chatInput.value = "";
  chatInput.style.height = "auto";
}

function handleChatInput(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }

  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
}


// === 🔄 Subskrypcje Firebase ===
function subscribeToChat() {
  db.ref("chat").on("value", snap => {
    const data = snap.val() || {};
    renderChat(data);
    updatePlayersListFromMessages(data);
  });
}

function subscribeToNicknames() {
  db.ref("nicknames").on("value", snap => {
    nicknameMap = snap.val() || {};
    renderChat(fullMessageMap);
    updatePlayersListUI();
  });
}

function subscribeToColors() {
  db.ref("nickColors").on("value", snap => {
    colorMap = snap.val() || {};
    renderChat(fullMessageMap);
    updatePlayersListUI();
  });
}

function subscribeToBans() {
  db.ref("banned").on("value", snap => {
    bannedList = snap.val() || {};
    if (bannedList[playerId]) {
      alert("Zostałeś zbanowany przez Wulwryka 😢");
      chatInput.disabled = true;
      chatInput.placeholder = "Zbanowany...";
    } else {
      chatInput.disabled = false;
      chatInput.placeholder = "Napisz coś...";
    }
  });
}


// === 👥 Gracze / Nicki / Kolory ===
function updatePlayersListFromMessages(messages) {
  const names = new Set();
  Object.values(messages || {}).forEach(msg => {
    if (msg.name !== "GM") names.add(msg.name);
  });
  allPlayers = [...names];
  updatePlayersListUI();
}

function updatePlayersListUI() {
  const list = document.getElementById("players-list");
  if (!list || !isGamemaster()) return;

  list.innerHTML = "";
  allPlayers.forEach(id => {
    const current = nicknameMap[id] || id;
    const color = colorMap[id] || "#ffffff";

    const li = document.createElement("li");
    li.style.marginBottom = "5px";

    li.innerHTML = `
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
        <span>${id} → <strong>${current}</strong></span>
        <input type="text" placeholder="Nowe imię" id="rename-${id}" style="width:100px;" />
        <button class="gm-btn-black" onclick="renamePlayer('${id}')">Zmień</button>
        <input type="color" value="${color}" id="color-${id}" onchange="setColor('${id}')" />
        <button class="gm-btn-black" onclick="banPlayer('${id}')">🚫 Ban</button>
        <button class="gm-btn-black" onclick="unbanPlayer('${id}')">✅ Unban</button>
      </div>
    `;
    list.appendChild(li);
  });
}


// === 👑 GM Akcje ===
function isGamemaster() {
  return localStorage.getItem("isGM") === "true";
}

function renamePlayer(id) {
  const input = document.getElementById("rename-" + id);
  const newName = input.value.trim();
  if (newName) db.ref("nicknames/" + id).set(newName);
}

function setColor(id) {
  const color = document.getElementById("color-" + id).value;
  db.ref("nickColors/" + id).set(color);
}

function banPlayer(id) {
  db.ref("banned/" + id).set(true);
}

function unbanPlayer(id) {
  db.ref("banned/" + id).remove();
}

function updateNicknames(newMap) {
  db.ref("nicknames").set(newMap);
}


// === 🗑️ Operacje na wiadomościach ===
function deleteMessage(id) {
  db.ref("chat/" + id).remove();
}

function clearChat() {
  if (confirm("Czy na pewno chcesz wyczyścić cały czat?")) {
    db.ref("chat").remove();
  }
}

function deleteLastN() {
  const n = parseInt(document.getElementById("del-n").value);
  if (!n || n <= 0) return;
  const toDelete = Object.entries(fullMessageMap).slice(-n);
  toDelete.forEach(([id]) => db.ref("chat/" + id).remove());
}

function deleteFirstN() {
  const n = parseInt(document.getElementById("del-n").value);
  if (!n || n <= 0) return;
  const toDelete = Object.entries(fullMessageMap).slice(0, n);
  toDelete.forEach(([id]) => db.ref("chat/" + id).remove());
}


// === 🚀 Start ===
chatInput.placeholder = "Napisz wiadomość..."; 

chatInput.addEventListener("keydown", handleChatInput);
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

subscribeToNicknames();
subscribeToColors();
subscribeToBans();
subscribeToChat();


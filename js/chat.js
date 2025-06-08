const chatLog = document.getElementById("chat-log");
const input = document.getElementById("chat-input");

if (!localStorage.getItem("playerId")) {
  let nextId = Math.floor(Math.random() * 100000);
  localStorage.setItem("playerId", "gracz_" + nextId);
}
let playerId = localStorage.getItem("playerId");

let nicknameMap = {};
let playerName = null;
let fullMessageMap = {}; // all messages with Firebase keys

function renderChat(messages) {
  chatLog.innerHTML = "";
  fullMessageMap = messages || {};

  Object.entries(messages || {}).slice(-60).forEach(([id, msg]) => {
    const name = msg.name;
    const display = nicknameMap[name] || name;
    const label = name === "GM"
      ? '<span style="color:red;">GM - Wulwryk</span>'
      : display;

    const div = document.createElement("div");
    div.innerHTML = `[${label}] ${msg.text}`;

    if (isGamemaster()) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => deleteMessage(id);
      div.appendChild(delBtn);
    }

    chatLog.appendChild(div);
  });
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const name = isGamemaster() ? "GM" : playerId;

  const newMsg = {
    name,
    text,
    timestamp: Date.now()
  };

  db.ref("chat").push(newMsg);
  input.value = "";
}

function subscribeToChat() {
  db.ref("chat").on("value", (snapshot) => {
    const data = snapshot.val() || {};
    renderChat(data);
    updatePlayersListFromMessages(data);
  });
}

function isGamemaster() {
  return localStorage.getItem("isGM") === "true";
}

// 🔁 nickname system
function updateNicknames(newMap) {
  db.ref("nicknames").set(newMap);
}

function subscribeToNicknames() {
  db.ref("nicknames").on("value", (snap) => {
    nicknameMap = snap.val() || {};
    subscribeToChat();
    updatePlayersListUI();
  });
}

// 🧠 Admin panel nickname changer
let allPlayers = [];

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
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${id} → <strong>${current}</strong></span><br>
      <input type="text" placeholder="Nowe imię" id="rename-${id}"/>
      <button onclick="renamePlayer('${id}')">Zmień</button>
    `;
    list.appendChild(li);
  });

  list.innerHTML += `
    <hr/>
    <p><strong>Zarządzanie czatem</strong></p>
    <button onclick="clearChat()">🧹 Wyczyść cały czat</button><br><br>
    <input type="number" id="del-last-n" placeholder="Ostatnie X"/>
    <button onclick="deleteLastN()">Usuń ostatnie</button><br><br>
    <input type="number" id="del-first-n" placeholder="Najstarsze X"/>
    <button onclick="deleteFirstN()">Usuń najstarsze</button>
  `;
}

function renamePlayer(id) {
  const input = document.getElementById("rename-" + id);
  const newName = input.value.trim();
  if (!newName) return;
  nicknameMap[id] = newName;
  updateNicknames(nicknameMap);
}

// 🔥 Firebase chat utils

function deleteMessage(msgId) {
  db.ref("chat/" + msgId).remove();
}

function clearChat() {
  if (confirm("Czy na pewno chcesz wyczyścić cały czat?")) {
    db.ref("chat").remove();
  }
}

function deleteLastN() {
  const n = parseInt(document.getElementById("del-last-n").value);
  if (!n || n <= 0) return;

  const entries = Object.entries(fullMessageMap);
  const toDelete = entries.slice(-n);
  toDelete.forEach(([id]) => db.ref("chat/" + id).remove());
}

function deleteFirstN() {
  const n = parseInt(document.getElementById("del-first-n").value);
  if (!n || n <= 0) return;

  const entries = Object.entries(fullMessageMap);
  const toDelete = entries.slice(0, n);
  toDelete.forEach(([id]) => db.ref("chat/" + id).remove());
}

// 🔥 INIT
subscribeToNicknames();

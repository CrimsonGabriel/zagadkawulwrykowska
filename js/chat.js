const chatLog = document.getElementById("chat-log");
const input = document.getElementById("chat-input");

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

function renderChat(messages) {
  chatLog.innerHTML = "";
  fullMessageMap = messages || {};

  Object.entries(messages || {}).slice(-60).forEach(([id, msg]) => {
    const name = msg.name;
    const nickname = nicknameMap[name] || name;
    const color = colorMap[name] || "#fff";
    const label = name === "GM"
      ? '<span style="color:red;">GM Wulwryk</span>'
      : `<span style="color:${color};">${nickname}</span>`;

    const date = new Date(msg.timestamp || Date.now());
    const time = date.toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement("div");
    div.innerHTML = `<span style="color:gray;">[${time}]</span> [${label}] ${msg.text}`;

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
      input.disabled = true;
      input.placeholder = "Zbanowany...";
    } else {
      input.disabled = false;
      input.placeholder = "Napisz coś...";
    }
  });
}

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
		<button onclick="renamePlayer('${id}')">Zmień</button>
        <input type="color" value="${color}" id="color-${id}" onchange="setColor('${id}')" title="Wybierz kolor"/>
        <button onclick="banPlayer('${id}')">🚫 Ban</button>
        <button onclick="unbanPlayer('${id}')">✅ Unban</button>
      </div>
    `;
    list.appendChild(li);
  });
}

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
subscribeToColors();
subscribeToBans();
subscribeToChat();

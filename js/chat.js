const chatLog = document.getElementById("chat-log");
const input = document.getElementById("chat-input");

// przypisanie gracza jeśli nie istnieje
if (!localStorage.getItem("playerId")) {
  let nextId = parseInt(localStorage.getItem("lastPlayerId") || "0") + 1;
  localStorage.setItem("lastPlayerId", nextId);
  localStorage.setItem("playerId", "Gracz #" + nextId);
}

let nicknameMap = JSON.parse(localStorage.getItem("nicknameMap") || "{}");
let playerName = localStorage.getItem("playerId") || "Gracz #?";

const messages = JSON.parse(localStorage.getItem("chat-log") || "[]");

function renderChat() {
  chatLog.innerHTML = "";
  messages.slice(-60).forEach(msg => {
    const original = msg.name;
    const displayName = nicknameMap[original] || original;
    const label = original === "GM" ? '<span style="color:red;">GM - Wulwryk</span>' : displayName;
    const div = document.createElement("div");
    div.innerHTML = `[${label}] ${msg.text}`;
    chatLog.appendChild(div);
  });
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const sender = isGamemaster() ? "GM" : playerName;
  messages.push({ name: sender, text });
  localStorage.setItem("chat-log", JSON.stringify(messages));
  input.value = "";
  renderChat();
}

function updateNicknames(newMap) {
  nicknameMap = newMap;
  localStorage.setItem("nicknameMap", JSON.stringify(nicknameMap));
  renderChat();
  updatePlayersList(); // aktualizacja listy graczy
}

function getAllPlayers() {
  const unique = new Set(messages.map(msg => msg.name).filter(name => name !== "GM"));
  return [...unique];
}

function updatePlayersList() {
  const list = document.getElementById("players-list");
  if (!list) return;

  list.innerHTML = "";
  getAllPlayers().forEach(player => {
    const current = nicknameMap[player] || player;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${player} → <strong>${current}</strong></span><br>
      <input type="text" placeholder="Nowe imię" id="rename-${player}"/>
      <button onclick="renamePlayer('${player}')">Zmień</button>
    `;
    list.appendChild(li);
  });
}

function renamePlayer(original) {
  const input = document.getElementById("rename-" + original);
  const newName = input.value.trim();
  if (newName) {
    nicknameMap[original] = newName;
    updateNicknames(nicknameMap);
  }
}

renderChat();
if (isGamemaster()) updatePlayersList();

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

  Object.values(messages || {}).forEach(msg => {
    if (msg.name !== "GM") names.add(msg.name);
  });
  allPlayers = [...names];
  updatePlayersListUI();
}


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
        <input type="color" value="${color}" id="color-${id}" onchange="setColor('${id}')" />
        <button onclick="banPlayer('${id}')">🚫 Ban</button>
        <button onclick="unbanPlayer('${id}')">✅ Unban</button>
      </div>
    `;
    list.appendChild(li);
  });
}


// === 👑 GM Akcje ===

function deleteMessage(id) {
  db.ref("chat/" + id).remove();
}


function clearChat() {
  if (confirm("Czy na pewno chcesz wyczyścić cały czat?")) {
    db.ref("chat").remove();
  }
}


  toDelete.forEach(([id]) => db.ref("chat/" + id).remove());
}


chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

subscribeToNicknames();
subscribeToColors();
subscribeToBans();
subscribeToChat();



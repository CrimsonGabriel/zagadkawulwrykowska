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


chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

subscribeToNicknames();
subscribeToColors();
subscribeToBans();
subscribeToChat();



  db.ref("chat").on("value", snap => {
    const data = snap.val() || {};
    renderChat(data);
    updatePlayersListFromMessages(data);
  });
}


  db.ref("nicknames").on("value", snap => {
    nicknameMap = snap.val() || {};
    renderChat(fullMessageMap);
    updatePlayersListUI();
  });
}


  db.ref("nickColors").on("value", snap => {
    colorMap = snap.val() || {};
    renderChat(fullMessageMap);
    updatePlayersListUI();
  });
}


chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

subscribeToNicknames();
subscribeToColors();
subscribeToBans();
subscribeToChat();



const chatLog = document.getElementById("chat-log");
const input = document.getElementById("chat-input");

const messages = JSON.parse(localStorage.getItem("chat-log") || "[]");

function renderChat() {
  chatLog.innerHTML = "";
  messages.slice(-60).forEach(msg => {
    const div = document.createElement("div");
    div.textContent = msg;
    chatLog.appendChild(div);
  });
}

function sendMessage() {
  const text = input.value.trim();
  if (text) {
    messages.push("[Użytkownik] " + text);
    localStorage.setItem("chat-log", JSON.stringify(messages));
    input.value = "";
    renderChat();
  }
}

renderChat();
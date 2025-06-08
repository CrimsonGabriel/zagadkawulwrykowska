const container = document.getElementById("card-container");
let cards = [];

fetch("data/cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
    renderCards();
  });

function renderCards() {
  container.innerHTML = "";
  cards.forEach(card => {
    const unlocked = localStorage.getItem("card-" + card.id);
    const img = document.createElement("img");
    img.src = unlocked ? card.image : "assets/icons/question.png";
    img.onclick = () => {
      if (!unlocked) showPopup(card);
    };
    container.appendChild(img);
  });
}

let currentCard = null;
function showPopup(card) {
  currentCard = card;
  document.getElementById("unlock-popup").style.display = "block";
}

async function submitCode() {
  const input = document.getElementById("code-input").value.trim();
  const hash = await sha256(input);
  if (hash === currentCard.codeHash) {
    localStorage.setItem("card-" + currentCard.id, true);
    renderCards();
    alert("Odblokowano!");
  } else {
    alert("Błędny kod.");
  }
  document.getElementById("unlock-popup").style.display = "none";
}

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}
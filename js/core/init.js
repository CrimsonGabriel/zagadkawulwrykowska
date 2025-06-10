reload();
}

// === DOMContentLoaded Init ===
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("code-input");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const code = input.value.trim();
      const match = cards.find(card => card.code === code);

      if (match) {
        const alreadyUnlocked = localStorage.getItem("card-" + match.id) === "true";
        if (alreadyUnlocked) {
          showTemporaryMessage("🔓 Karta już odblokowana");
          input.value = "";
          return;
        }

        const cardIndex = cards.findIndex(c => c.id === match.id);
        const imgEl = container.children[cardIndex];
        imgEl.classList.add("flip-fade");

        localStorage.setItem("card-" + match.id, "true");
        input.value = "";

        setTimeout(renderCards, 500);
      } else {
        input.style.border = "1px solid red";
        input.value = "";
        input.placeholder = "Błędny kod";
      }
    }
  });

  setupPanelToggles();
});

// === Start ===
fetchCards();
updateAdminPanel();

function getCardsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cards")) || [];
  } catch {
    return [];
  }
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


//Plik auth.js
function isGamemaster() {
  return localStorage.getItem("isGM") === "true";
}

function logout() {
  localStorage.removeItem("isGM");
  localStorage.removeItem("allowLogin");
  window.location.reload();
}

function goToLogin() {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector('#gm-login');
  if (!loginBtn) return;

  loginBtn.style.display = "none";
  let buffer = "";

  document.addEventListener("keydown", (e) => {
    buffer += e.key;
    if (buffer.length > 30) buffer = buffer.slice(-30);

    if (buffer.includes("123")) {
      localStorage.setItem("allowLogin", "true");
      loginBtn.style.display = "inline-block";
    }
  });
});

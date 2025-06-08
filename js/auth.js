function login() {
  const login = document.getElementById("login")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (login === "wulwryczek" && password === "zagadkowo2137") {
    localStorage.setItem("isGM", "true");
    window.location.href = "index.html";
  } else {
    document.getElementById("login-error").textContent = "Błędne dane logowania.";
  }
}

function isGamemaster() {
  return localStorage.getItem("isGM") === "true";
}

function logout() {
  localStorage.removeItem("isGM");
  window.location.reload();
}

function goToLogin() {
  window.location.href = "login.html";
}

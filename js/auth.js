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

  const SECRET_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"; // hash("123")
  loginBtn.style.display = "none";

  let buffer = "";

  document.addEventListener("keydown", async (e) => {
    buffer += e.key;
    if (buffer.length > 30) buffer = buffer.slice(-30);

    const recent = buffer.slice(-17);
    const hash = await sha256(recent);
    if (hash === SECRET_HASH) {
      localStorage.setItem("allowLogin", "true");
      loginBtn.style.display = "inline-block";
    }
  });

  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
});

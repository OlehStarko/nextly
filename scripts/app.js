document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("installButton");
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  const toggleButtons = document.querySelectorAll("[data-password-toggle]");
  toggleButtons.forEach((btn) => {
    const targetId = btn.dataset.passwordToggle;
    const input = document.getElementById(targetId);
    const icon = btn.querySelector("[data-password-icon]");
    if (!input) return;

    btn.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.setAttribute("aria-label", isHidden ? "Сховати пароль" : "Показати пароль");
      if (icon) icon.src = isHidden ? "images/icons/hide.svg" : "images/icons/show.svg";
    });
  });
});

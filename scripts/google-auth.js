import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const googleButton = document.querySelector("[data-google-signin]");
const messageEl = document.querySelector("[data-google-message]");

const setMessage = (text, isError = true) => {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.classList.toggle("form__message--success", !isError);
};

if (googleButton) {
  googleButton.addEventListener("click", async () => {
    setMessage("");
    googleButton.disabled = true;

    try {
      await signInWithPopup(auth, provider);
      setMessage("Вхід через Google успішний", false);
      window.location.href = "dashboard.html";
    } catch (err) {
      const fallbackMessage = "Не вдалося виконати вхід через Google";
      setMessage(err?.message || fallbackMessage);
    } finally {
      googleButton.disabled = false;
    }
  });
}

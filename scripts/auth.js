import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const screens = document.querySelectorAll(".hero-screen");
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-navigate]");
  if (!target) return;
  const next = target.dataset.navigate;
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === next);
  });
});

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const getMessageNode = (type) =>
  document.querySelector(`[data-message="${type}"]`);

const setMessage = (type, text, isError = true) => {
  const node = getMessageNode(type);
  if (!node) return;
  node.textContent = text ?? "";
  node.classList.toggle("is-error", isError && Boolean(text));
  node.classList.toggle("is-success", !isError && Boolean(text));
};

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("signup", "");

  const formData = new FormData(signupForm);
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  try {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(user, { displayName: name.toString() });
    }
    setMessage("signup", "Account created! Redirecting…", false);
    window.location.href = "index.html";
  } catch (error) {
    setMessage("signup", error.message || "Could not create account.");
  }
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("login", "");

  const formData = new FormData(loginForm);
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  try {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    await signInWithEmailAndPassword(auth, email, password);
    setMessage("login", "Welcome back! Redirecting…", false);
    window.location.href = "index.html";
  } catch (error) {
    setMessage("login", error.message || "Incorrect email or password");
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

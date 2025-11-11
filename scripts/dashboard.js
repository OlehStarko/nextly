import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const requireAuth = () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "auth.html";
    } else {
      const nameBadge = document.querySelector(".sidebar__profile-avatar");
      if (nameBadge && user.displayName) {
        nameBadge.textContent = user.displayName.charAt(0).toUpperCase();
      }
    }
  });
};

const initPillToggles = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".pill");
    if (!button) return;
    const group = button.closest(".pill-group");
    group
      .querySelectorAll(".pill")
      .forEach((pill) => pill.classList.remove("is-active"));
    button.classList.add("is-active");
  });
};

const initScreenNavigation = () => {
  const screens = document.querySelectorAll("[data-screen]");
  const screenButtons = document.querySelectorAll("[data-screen-target]");
  const sidebar = document.querySelector(".sidebar");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");

  const toggleSidebar = (shouldOpen) => {
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", shouldOpen);
  };

  mobileToggle?.addEventListener("click", () => {
    toggleSidebar(!sidebar?.classList.contains("is-open"));
  });

  screenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextScreen = button.dataset.screenTarget;
      screens.forEach((screen) => {
        screen.classList.toggle("is-active", screen.dataset.screen === nextScreen);
      });

      screenButtons.forEach((btn) =>
        btn.classList.toggle("is-active", btn === button)
      );

      toggleSidebar(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      toggleSidebar(false);
    }
  });
};

const initLogout = () => {
  const logoutButton = document.getElementById("logout-btn");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await signOut(auth);
      window.location.href = "auth.html";
    } catch (error) {
      console.error(error);
      logoutButton.disabled = false;
    }
  });
};

const initRecordRedirects = () => {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-record-id]");
    if (!trigger) return;
    const recordId = trigger.dataset.recordId;
    if (!recordId) return;
    window.location.href = `record.html?id=${recordId}`;
  });
};

requireAuth();
initPillToggles();
initScreenNavigation();
initLogout();
initRecordRedirects();

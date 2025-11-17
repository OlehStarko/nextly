import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const setMessage = (el, text, isError = true) => {
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("form__message--success", !isError);
};

const handleSignup = () => {
  const form = document.querySelector('[data-auth="signup"]');
  if (!form) return;

  const name = form.querySelector("#signup-name");
  const phone = form.querySelector("#signup-phone");
  const phoneToggle = form.querySelector("[data-phone-toggle]");
  const phoneList = form.querySelector("[data-phone-list]");
  const phoneFlag = form.querySelector("[data-phone-flag]");
  const phoneDial = form.querySelector("[data-phone-dial]");
  const email = form.querySelector("#signup-email");
  const password = form.querySelector("#signup-password");
  const messageEl = form.querySelector("[data-auth-message]");
  const button = document.querySelector('button[form="signupForm"]');
  const phoneState = { dial: "+380", country: "UA", flag: "🇺🇦" };

  const countries = [
    { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
    { code: "AL", name: "Albania", dial: "+355", flag: "🇦🇱" },
    { code: "AM", name: "Armenia", dial: "+374", flag: "🇦🇲" },
    { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
    { code: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
    { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
    { code: "AZ", name: "Azerbaijan", dial: "+994", flag: "🇦🇿" },
    { code: "BA", name: "Bosnia and Herzegovina", dial: "+387", flag: "🇧🇦" },
    { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
    { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
    { code: "BG", name: "Bulgaria", dial: "+359", flag: "🇧🇬" },
    { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
    { code: "BY", name: "Belarus", dial: "+375", flag: "🇧🇾" },
    { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
    { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
    { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
    { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
    { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
    { code: "CZ", name: "Czechia", dial: "+420", flag: "🇨🇿" },
    { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
    { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
    { code: "DZ", name: "Algeria", dial: "+213", flag: "🇩🇿" },
    { code: "EE", name: "Estonia", dial: "+372", flag: "🇪🇪" },
    { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
    { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
    { code: "FI", name: "Finland", dial: "+358", flag: "🇫🇮" },
    { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
    { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { code: "GE", name: "Georgia", dial: "+995", flag: "🇬🇪" },
    { code: "GR", name: "Greece", dial: "+30", flag: "🇬🇷" },
    { code: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
    { code: "HR", name: "Croatia", dial: "+385", flag: "🇭🇷" },
    { code: "HU", name: "Hungary", dial: "+36", flag: "🇭🇺" },
    { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
    { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
    { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
    { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
    { code: "IQ", name: "Iraq", dial: "+964", flag: "🇮🇶" },
    { code: "IR", name: "Iran", dial: "+98", flag: "🇮🇷" },
    { code: "IS", name: "Iceland", dial: "+354", flag: "🇮🇸" },
    { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
    { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
    { code: "JO", name: "Jordan", dial: "+962", flag: "🇯🇴" },
    { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
    { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
    { code: "KZ", name: "Kazakhstan", dial: "+7", flag: "🇰🇿" },
    { code: "LT", name: "Lithuania", dial: "+370", flag: "🇱🇹" },
    { code: "LV", name: "Latvia", dial: "+371", flag: "🇱🇻" },
    { code: "MA", name: "Morocco", dial: "+212", flag: "🇲🇦" },
    { code: "MD", name: "Moldova", dial: "+373", flag: "🇲🇩" },
    { code: "MK", name: "North Macedonia", dial: "+389", flag: "🇲🇰" },
    { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
    { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
    { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
    { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
    { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
    { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
    { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
    { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
    { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
    { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
    { code: "RO", name: "Romania", dial: "+40", flag: "🇷🇴" },
    { code: "RS", name: "Serbia", dial: "+381", flag: "🇷🇸" },
    { code: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
    { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
    { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
    { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
    { code: "SI", name: "Slovenia", dial: "+386", flag: "🇸🇮" },
    { code: "SK", name: "Slovakia", dial: "+421", flag: "🇸🇰" },
    { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
    { code: "TR", name: "Türkiye", dial: "+90", flag: "🇹🇷" },
    { code: "TW", name: "Taiwan", dial: "+886", flag: "🇹🇼" },
    { code: "UA", name: "Ukraine", dial: "+380", flag: "🇺🇦" },
    { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
    { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
    { code: "UZ", name: "Uzbekistan", dial: "+998", flag: "🇺🇿" },
    { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
    { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
    { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  ];

  const isEmailValid = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

  const closePhoneList = () => {
    if (phoneList) phoneList.hidden = true;
  };

  const openPhoneList = () => {
    if (phoneList) phoneList.hidden = false;
  };

  const togglePhoneList = () => {
    if (!phoneList) return;
    phoneList.hidden ? openPhoneList() : closePhoneList();
  };

  const renderPhoneOptions = () => {
    if (!phoneList) return;
    phoneList.innerHTML = "";
    countries.forEach(({ code, name, dial, flag }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.country = code;
      btn.dataset.dial = dial;
      btn.dataset.flag = flag;
      btn.textContent = `${flag} ${name} ${dial}`;
      phoneList.appendChild(btn);
    });
  };

  const applyPhoneState = () => {
    if (phoneFlag) phoneFlag.textContent = phoneState.flag;
    if (phoneDial) phoneDial.textContent = phoneState.dial;
  };

  if (phoneToggle && phoneList && phoneFlag && phoneDial) {
    renderPhoneOptions();
    applyPhoneState();
    phoneToggle.addEventListener("click", togglePhoneList);

    phoneList.addEventListener("click", (e) => {
      const target = e.target.closest("button[data-country]");
      if (!target) return;
      phoneState.country = target.dataset.country;
      phoneState.dial = target.dataset.dial;
      phoneState.flag = target.dataset.flag || target.textContent.trim().slice(0, 2);
      applyPhoneState();
      closePhoneList();
      phone?.focus();
    });

    document.addEventListener("click", (e) => {
      if (!phoneList || !phoneToggle) return;
      if (phoneList.contains(e.target) || phoneToggle.contains(e.target)) return;
      closePhoneList();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePhoneList();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(messageEl, "");

    const normalizedName = name.value.trim();
    const normalizedPhoneLocal = phone.value.trim();
    const normalizedEmail = email.value.trim().toLowerCase();
    const normalizedPassword = password.value.trim();

    if (!normalizedName || !normalizedPhoneLocal || !normalizedEmail || !normalizedPassword) {
      setMessage(messageEl, "Заповніть усі поля");
      return;
    }

    if (!isEmailValid(normalizedEmail)) {
      setMessage(messageEl, "Некоректний email");
      return;
    }

    name.value = normalizedName;
    phone.value = `${phoneState.dial} ${normalizedPhoneLocal}`;
    email.value = normalizedEmail;

    button.disabled = true;
    try {
      await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
      setMessage(messageEl, "Реєстрація успішна. Ви увійшли у систему.", false);
      form.reset();
      window.location.href = "dashboard.html";
    } catch (err) {
      setMessage(messageEl, err.message || "Помилка реєстрації");
    } finally {
      button.disabled = false;
    }
  });
};

const handleLogin = () => {
  const form = document.querySelector('[data-auth="login"]');
  if (!form) return;

  const email = form.querySelector("#login-email");
  const password = form.querySelector("#login-password");
  const messageEl = form.querySelector("[data-auth-message]");
  const button = document.querySelector('button[form="loginForm"]');
  const resetButton = form.querySelector("[data-reset-password]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(messageEl, "");

    if (!email.value || !password.value) {
      setMessage(messageEl, "Введіть email і пароль");
      return;
    }

    button.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      setMessage(messageEl, "Вхід успішний", false);
      form.reset();
      window.location.href = "dashboard.html";
    } catch (err) {
      setMessage(messageEl, err.message || "Помилка входу");
    } finally {
      button.disabled = false;
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      setMessage(messageEl, "");

      if (!email.value) {
        setMessage(messageEl, "Вкажіть email, щоб надіслати лист для скидання");
        return;
      }

      resetButton.disabled = true;
      try {
        await sendPasswordResetEmail(auth, email.value);
        setMessage(messageEl, "Якщо email зареєстрований, ми надіслали лист для скидання", false);
      } catch (err) {
        setMessage(messageEl, err.message || "Не вдалося надіслати лист для скидання");
      } finally {
        resetButton.disabled = false;
      }
    });
  }
};

handleSignup();
handleLogin();

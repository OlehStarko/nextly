const ACCOUNT_KEY = "nextly_account_profile";
const LANG_KEY = "nextly_lang";

const loadProfile = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveProfile = (profile) => {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(profile));
};

const exportProfile = (profile) => {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "account-data.json";
  a.click();
  URL.revokeObjectURL(url);
};

const initAccountPage = () => {
  if (document.body.dataset.page !== "account") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.accountReady === "true") return;
  hero.dataset.accountReady = "true";

  const nameInput = document.getElementById("account-name");
  const phoneInput = document.getElementById("account-phone");
  const emailInput = document.getElementById("account-email");
  const roleInput = document.getElementById("account-role");
  const avatarInput = document.getElementById("account-avatar");
  const avatarPreview = document.getElementById("account-avatar-preview");

  const langSelect = document.getElementById("account-language");
  const tzSelect = document.getElementById("account-timezone");
  const timeFormatSelect = document.getElementById("account-timeformat");
  const currencySelect = document.getElementById("account-currency");

  const notifyEmail = document.getElementById("notify-email");
  const notifyPush = document.getElementById("notify-push");
  const notifyAppt = document.getElementById("notify-appointments");
  const notifyDigest = document.getElementById("notify-digest");

  const privacyPhone = document.getElementById("privacy-phone");
  const privacyEmail = document.getElementById("privacy-email");
  const privacyMarketing = document.getElementById("privacy-marketing");

  const form = document.getElementById("accountForm");
  const messageEl = document.querySelector("[data-account-message]");
  const securityMsg = document.querySelector("[data-security-message]");
  const dangerMsg = document.querySelector("[data-danger-message]");

  const setMessage = (el, text, isError = false) => {
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#dc2626" : "#111827";
  };

  const profile = loadProfile() || {
    name: "",
    phone: "",
    email: "",
    role: roleInput?.value || "Owner",
    avatar: "",
    lang: localStorage.getItem(LANG_KEY) || "uk",
    timezone: "Europe/Kyiv",
    timeformat: "24h",
    currency: "UAH",
    notifyEmail: true,
    notifyPush: false,
    notifyAppt: true,
    notifyDigest: false,
    privacyPhone: true,
    privacyEmail: false,
    privacyMarketing: false,
  };

  // populate fields
  if (nameInput) nameInput.value = profile.name;
  if (phoneInput) phoneInput.value = profile.phone;
  if (emailInput) emailInput.value = profile.email;
  if (roleInput) roleInput.value = profile.role;
  if (avatarPreview && profile.avatar) avatarPreview.src = profile.avatar;
  if (langSelect) langSelect.value = profile.lang;
  if (tzSelect) tzSelect.value = profile.timezone;
  if (timeFormatSelect) timeFormatSelect.value = profile.timeformat;
  if (currencySelect) currencySelect.value = profile.currency;
  if (notifyEmail) notifyEmail.checked = profile.notifyEmail;
  if (notifyPush) notifyPush.checked = profile.notifyPush;
  if (notifyAppt) notifyAppt.checked = profile.notifyAppt;
  if (notifyDigest) notifyDigest.checked = profile.notifyDigest;
  if (privacyPhone) privacyPhone.checked = profile.privacyPhone;
  if (privacyEmail) privacyEmail.checked = profile.privacyEmail;
  if (privacyMarketing) privacyMarketing.checked = profile.privacyMarketing;

  const persistLang = () => {
    if (langSelect) localStorage.setItem(LANG_KEY, langSelect.value);
  };

  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (avatarPreview) avatarPreview.src = reader.result;
      profile.avatar = reader.result;
      saveProfile(profile);
      setMessage(messageEl, "Аватар оновлено");
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    profile.name = nameInput?.value.trim() || "";
    profile.phone = phoneInput?.value.trim() || "";
    profile.email = emailInput?.value.trim() || "";
    profile.role = roleInput?.value || profile.role;
    profile.lang = langSelect?.value || profile.lang;
    profile.timezone = tzSelect?.value || profile.timezone;
    profile.timeformat = timeFormatSelect?.value || profile.timeformat;
    profile.currency = currencySelect?.value || profile.currency;
    profile.notifyEmail = !!notifyEmail?.checked;
    profile.notifyPush = !!notifyPush?.checked;
    profile.notifyAppt = !!notifyAppt?.checked;
    profile.notifyDigest = !!notifyDigest?.checked;
    profile.privacyPhone = !!privacyPhone?.checked;
    profile.privacyEmail = !!privacyEmail?.checked;
    profile.privacyMarketing = !!privacyMarketing?.checked;

    persistLang();
    saveProfile(profile);
    setMessage(messageEl, "Профіль збережено");
  });

  document.getElementById("changePassword")?.addEventListener("click", () => {
    setMessage(securityMsg, "Зміна пароля поки не підключена (mock).");
  });

  const clearCookies = () => {
    const parts = document.cookie.split(";").map((c) => c.trim());
    parts.forEach((cookie) => {
      if (!cookie) return;
      const [name] = cookie.split("=");
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  };

  const logoutEverywhere = () => {
    setMessage(securityMsg, "Вихід...");
    try {
      localStorage.clear();
      sessionStorage.clear();
      clearCookies();
    } catch (err) {
      // ignore storage errors
    }
    window.location.href = "login.html";
  };

  document.getElementById("logoutAll")?.addEventListener("click", logoutEverywhere);
  // робимо доступним у консолі на випадок ручного виклику
  window.logoutEverywhere = logoutEverywhere;

  document.getElementById("exportData")?.addEventListener("click", () => {
    exportProfile(profile);
    setMessage(dangerMsg, "Дані експортовано у JSON");
  });

  document.getElementById("deleteAccount")?.addEventListener("click", () => {
    const confirmed = window.confirm("Видалити акаунт? Дані профілю буде очищено локально.");
    if (!confirmed) return;
    localStorage.removeItem(ACCOUNT_KEY);
    setMessage(dangerMsg, "Акаунт видалено локально.");
    form?.reset();
  });
};

document.addEventListener("DOMContentLoaded", initAccountPage);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "account") initAccountPage();
});

const SETTINGS_KEY = "nextly_company_settings";
const LANG_KEY = "nextly_lang";

const readSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSettings = (data) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));

const initSettingsPage = () => {
  if (document.body.dataset.page !== "settings") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.settingsReady === "true") return;
  hero.dataset.settingsReady = "true";

  const messageEl = document.querySelector("[data-settings-message]");
  const setMessage = (text, isError = false) => {
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.style.color = isError ? "#dc2626" : "#111827";
    }
  };

  const fields = {
    bizName: document.getElementById("biz-name"),
    bizAddress: document.getElementById("biz-address"),
    bizHours: document.getElementById("biz-hours"),
    bizLogo: document.getElementById("biz-logo"),
    bizLogoPreview: document.getElementById("biz-logo-preview"),

    teamStatus: document.getElementById("team-status"),
    serviceCategory: document.getElementById("service-category"),

    bookingBuffer: document.getElementById("booking-buffer"),
    bookingMax: document.getElementById("booking-max"),
    bookingCancel: document.getElementById("booking-cancel"),
    bookingOnline: document.getElementById("booking-online"),
    bookingAuto: document.getElementById("booking-auto"),

    payStripe: document.getElementById("pay-stripe"),
    payCash: document.getElementById("pay-cash"),
    payInvoice: document.getElementById("pay-invoice"),
    payRefund: document.getElementById("pay-refund"),

    smsProvider: document.getElementById("sms-provider"),
    emailSender: document.getElementById("email-sender"),
    waTemplates: document.getElementById("wa-templates"),
    reminderTemplate: document.getElementById("reminder-template"),
    promoTemplate: document.getElementById("promo-template"),

    limitClients: document.getElementById("limit-clients"),
    limitAppts: document.getElementById("limit-appts"),
    limitTeam: document.getElementById("limit-team"),
    featAnalytics: document.getElementById("feat-analytics"),
    featSms: document.getElementById("feat-sms"),

    brandColor: document.getElementById("brand-color"),
    brandWhitelabel: document.getElementById("brand-whitelabel"),

    gdprConsent: document.getElementById("gdpr-consent"),
  };

  const avatarInput = fields.bizLogo;
  const avatarPreview = fields.bizLogoPreview;

  const stored = readSettings() || {};
  const applyValues = () => {
    const v = (key, def = "") => stored[key] ?? def;
    if (fields.bizName) fields.bizName.value = v("bizName");
    if (fields.bizAddress) fields.bizAddress.value = v("bizAddress");
    if (fields.bizHours) fields.bizHours.value = v("bizHours");
    if (avatarPreview && stored.bizLogoData) avatarPreview.src = stored.bizLogoData;

    if (fields.teamStatus) fields.teamStatus.value = v("teamStatus", "active");
    if (fields.serviceCategory) fields.serviceCategory.value = v("serviceCategory");

    if (fields.bookingBuffer) fields.bookingBuffer.value = v("bookingBuffer", "");
    if (fields.bookingMax) fields.bookingMax.value = v("bookingMax", "");
    if (fields.bookingCancel) fields.bookingCancel.value = v("bookingCancel", "");
    if (fields.bookingOnline) fields.bookingOnline.checked = v("bookingOnline", true);
    if (fields.bookingAuto) fields.bookingAuto.checked = v("bookingAuto", true);

    if (fields.payStripe) fields.payStripe.checked = v("payStripe", false);
    if (fields.payCash) fields.payCash.checked = v("payCash", true);
    if (fields.payInvoice) fields.payInvoice.checked = v("payInvoice", false);
    if (fields.payRefund) fields.payRefund.value = v("payRefund", "");

    if (fields.smsProvider) fields.smsProvider.value = v("smsProvider", "twilio");
    if (fields.emailSender) fields.emailSender.value = v("emailSender", "");
    if (fields.waTemplates) fields.waTemplates.value = v("waTemplates", "");
    if (fields.reminderTemplate) fields.reminderTemplate.value = v("reminderTemplate", "");
    if (fields.promoTemplate) fields.promoTemplate.value = v("promoTemplate", "");

    if (fields.limitClients) fields.limitClients.value = v("limitClients", "");
    if (fields.limitAppts) fields.limitAppts.value = v("limitAppts", "");
    if (fields.limitTeam) fields.limitTeam.value = v("limitTeam", "");
    if (fields.featAnalytics) fields.featAnalytics.checked = v("featAnalytics", true);
    if (fields.featSms) fields.featSms.checked = v("featSms", false);

    if (fields.brandColor) fields.brandColor.value = v("brandColor", "#1b1b1b");
    if (fields.brandWhitelabel) fields.brandWhitelabel.checked = v("brandWhitelabel", false);

    if (fields.gdprConsent) fields.gdprConsent.checked = v("gdprConsent", true);
  };

  applyValues();

  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      stored.bizLogoData = reader.result;
      if (avatarPreview) avatarPreview.src = reader.result;
      saveSettings(stored);
      setMessage("Логотип оновлено");
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("saveSettings")?.addEventListener("click", () => {
    const data = {
      bizName: fields.bizName?.value || "",
      bizAddress: fields.bizAddress?.value || "",
      bizHours: fields.bizHours?.value || "",
      bizLogoData: stored.bizLogoData || "",
      teamStatus: fields.teamStatus?.value || "active",
      serviceCategory: fields.serviceCategory?.value || "",

      bookingBuffer: fields.bookingBuffer?.value || "",
      bookingMax: fields.bookingMax?.value || "",
      bookingCancel: fields.bookingCancel?.value || "",
      bookingOnline: !!fields.bookingOnline?.checked,
      bookingAuto: !!fields.bookingAuto?.checked,

      payStripe: !!fields.payStripe?.checked,
      payCash: !!fields.payCash?.checked,
      payInvoice: !!fields.payInvoice?.checked,
      payRefund: fields.payRefund?.value || "",

      smsProvider: fields.smsProvider?.value || "twilio",
      emailSender: fields.emailSender?.value || "",
      waTemplates: fields.waTemplates?.value || "",
      reminderTemplate: fields.reminderTemplate?.value || "",
      promoTemplate: fields.promoTemplate?.value || "",

      limitClients: fields.limitClients?.value || "",
      limitAppts: fields.limitAppts?.value || "",
      limitTeam: fields.limitTeam?.value || "",
      featAnalytics: !!fields.featAnalytics?.checked,
      featSms: !!fields.featSms?.checked,

      brandColor: fields.brandColor?.value || "#1b1b1b",
      brandWhitelabel: !!fields.brandWhitelabel?.checked,

      gdprConsent: !!fields.gdprConsent?.checked,
    };

    saveSettings(data);
    setMessage("Налаштування збережено");
  });

  document.getElementById("backupData")?.addEventListener("click", () => {
    setMessage("Backup виконано (mock)");
  });
  document.getElementById("restoreData")?.addEventListener("click", () => {
    setMessage("Restore виконано (mock)");
  });
  document.getElementById("exportClients")?.addEventListener("click", () => {
    setMessage("Export clients (mock)");
  });
  document.getElementById("exportAppointments")?.addEventListener("click", () => {
    setMessage("Export appointments (mock)");
  });
};

document.addEventListener("DOMContentLoaded", initSettingsPage);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "settings") initSettingsPage();
});

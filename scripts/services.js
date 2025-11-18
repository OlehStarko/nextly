const SERVICES_KEY = "nextly_services";

const sampleServices = [
  { id: crypto.randomUUID(), name: "Манікюр", price: 800, duration: 60, active: true },
  { id: crypto.randomUUID(), name: "Масаж", price: 600, duration: 60, active: true },
  { id: crypto.randomUUID(), name: "Педікюр", price: 700, duration: 60, active: true },
  { id: crypto.randomUUID(), name: "Стрижка", price: 500, duration: 60, active: true },
];

const readServices = () => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) return sampleServices;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid data");
    return parsed;
  } catch {
    return sampleServices;
  }
};

const writeServices = (list) => localStorage.setItem(SERVICES_KEY, JSON.stringify(list));

const setCountBadge = (count) => {
  const badge = document.querySelector("[data-services-count]");
  if (badge) badge.textContent = `${count} шт.`;
};

const renderTable = (list) => {
  const body = document.querySelector("[data-services-body]");
  if (!body) return;
  setCountBadge(list.length);

  if (!list.length) {
    body.innerHTML = `<p class="services__empty">Ще немає послуг. Додайте першу.</p>`;
    return;
  }

  body.innerHTML = list
    .map(
      (s) => `
      <div class="services__table-row" data-id="${s.id}">
        <span>${s.name}</span>
        <span>${(Number(s.price) || 0).toFixed(2)} ₴</span>
        <span>${s.duration} хв</span>
        <span>
          <label class="switch">
            <input type="checkbox" data-active="${s.id}" ${s.active ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </span>
        <span class="services__row-actions">
          <button class="btn btn--ghost" type="button" data-edit="${s.id}">Редагувати</button>
          <button class="btn btn--danger" type="button" data-delete="${s.id}">Видалити</button>
        </span>
      </div>`
    )
    .join("");
};

const initServicesPage = () => {
  if (document.body.dataset.page !== "services") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.servicesReady === "true") return;
  hero.dataset.servicesReady = "true";

  let services = readServices();
  let editingId = null;

  const form = document.getElementById("serviceForm");
  const toggleBtn = document.getElementById("addServiceToggle");
  const resetBtn = document.getElementById("resetService");
  const searchInput = document.getElementById("servicesSearch");
  const nameInput = document.getElementById("service-name");
  const priceInput = document.getElementById("service-price");
  const durationInput = document.getElementById("service-duration");
  const activeInput = document.getElementById("service-active");
  const messageEl = document.querySelector("[data-service-message]");

  const setMessage = (text, isError = true) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.toggle("services__message--error", isError);
    messageEl.classList.toggle("services__message--success", !isError);
  };

  const filtered = () => {
    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q));
  };

  const resetForm = () => {
    editingId = null;
    form?.reset();
    activeInput.checked = true;
    setMessage("");
  };

  renderTable(services);

  toggleBtn?.addEventListener("click", () => {
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInput?.focus();
  });

  resetBtn?.addEventListener("click", resetForm);

  searchInput?.addEventListener("input", () => renderTable(filtered()));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");
    const name = nameInput?.value.trim();
    const price = Number(priceInput?.value || 0);
    const duration = Number(durationInput?.value || 0);
    const active = !!activeInput?.checked;

    if (!name || price < 0 || duration <= 0) {
      setMessage("Перевірте назву, ціну та тривалість");
      return;
    }

    if (editingId) {
      services = services.map((s) =>
        s.id === editingId ? { ...s, name, price, duration, active } : s
      );
      setMessage("Послугу оновлено", false);
    } else {
      services = [
        { id: crypto.randomUUID(), name, price, duration, active },
        ...services,
      ];
      setMessage("Послугу створено", false);
    }

    writeServices(services);
    renderTable(filtered());
    resetForm();
  });

  document.querySelector("[data-services-body]")?.addEventListener("click", (e) => {
    const row = e.target.closest(".services__table-row");
    const id = row?.dataset.id;
    if (!id) return;

    if (e.target.closest("[data-delete]")) {
      const confirmed = window.confirm("Видалити послугу?");
      if (!confirmed) return;
      services = services.filter((s) => s.id !== id);
      writeServices(services);
      renderTable(filtered());
    }

    if (e.target.closest("[data-edit]")) {
      const svc = services.find((s) => s.id === id);
      if (!svc) return;
      editingId = id;
      nameInput.value = svc.name;
      priceInput.value = svc.price;
      durationInput.value = svc.duration;
      activeInput.checked = !!svc.active;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setMessage("Режим редагування", false);
    }

    const activeToggle = e.target.closest("input[data-active]");
    if (activeToggle) {
      const svc = services.find((s) => s.id === id);
      if (!svc) return;
      svc.active = activeToggle.checked;
      writeServices(services);
      setMessage("Статус оновлено", false);
    }
  });
};

const maybeInitServices = () => {
  if (document.body.dataset.page === "services") initServicesPage();
};

document.addEventListener("DOMContentLoaded", maybeInitServices);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "services") initServicesPage();
});

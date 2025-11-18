const STORAGE_KEY = "nextly_clients";

const sampleClients = [
  { id: crypto.randomUUID(), name: "Лера", phone: "0991337613", age: 39, avatar: "images/photo.jpg" },
  { id: crypto.randomUUID(), name: "Олександр", phone: "0501234567", age: 31, avatar: "" },
  { id: crypto.randomUUID(), name: "Марія", phone: "0979876543", age: 27, avatar: "" },
];

const readClients = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleClients;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid data");
    return parsed;
  } catch {
    return sampleClients;
  }
};

const writeClients = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const createAvatar = (client) => {
  if (client.avatar) {
    return `<img class="clients__avatar" src="${client.avatar}" alt="${client.name}">`;
  }
  const initials =
    client.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return `<div class="clients__avatar clients__avatar--fallback">${initials}</div>`;
};

const renderClients = (list) => {
  const container = document.getElementById("clientsList");
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<p class="clients__empty">Немає клієнтів. Додайте першого.</p>`;
    return;
  }

  container.innerHTML = list
    .map(
      (client) => `
        <article class="clients__card" data-id="${client.id}">
          <div class="clients__info">
            ${createAvatar(client)}
            <div class="clients__about">
              <h2 class="clients__name">${client.name}</h2>
              <a class="clients__phone" href="tel:${client.phone}">${client.phone}</a>
              ${client.age ? `<span class="clients__badge">Вік: ${client.age}</span>` : ""}
            </div>
          </div>
          <div class="clients__actions">
            <button class="btn btn--light" type="button" data-history="${client.id}">Історія</button>
            <button class="btn btn--primary" type="button" data-edit="${client.id}">Редагувати</button>
            <button class="btn btn--danger" type="button" data-delete="${client.id}">Видалити</button>
          </div>
        </article>
      `
    )
    .join("");
};

const initClientsPage = () => {
  if (document.body.dataset.page !== "clients") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.clientsReady === "true") return;
  hero.dataset.clientsReady = "true";

  let clients = readClients();
  let editingId = null;

  const searchInput = document.getElementById("clientsSearch");
  const addToggle = document.getElementById("addClientToggle");
  const form = document.getElementById("clientForm");
  const cancelBtn = document.getElementById("cancelClientEdit");
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");
  const ageInput = document.getElementById("client-age");
  const messageEl = document.querySelector("[data-form-message]");

  const setMessage = (text, isError = true) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.toggle("clients__form-message--error", isError);
    messageEl.classList.toggle("clients__form-message--success", !isError);
  };

  const toggleForm = (open) => {
    if (!form) return;
    if (open === true) form.hidden = false;
    else if (open === false) form.hidden = true;
    else form.hidden = !form.hidden;
    if (!form.hidden) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      nameInput?.focus();
    }
  };

  const resetForm = () => {
    editingId = null;
    form?.reset();
    setMessage("");
    toggleForm(false);
  };

  const filtered = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );
  };

  renderClients(clients);

  addToggle?.addEventListener("click", () => {
    if (form?.hidden) toggleForm(true);
    else resetForm();
  });

  cancelBtn?.addEventListener("click", resetForm);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");
    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const ageVal = ageInput?.value.trim();
    const age = ageVal ? Number(ageVal) : null;

    if (!name || !phone) {
      setMessage("Заповніть ім'я та телефон");
      return;
    }

    if (editingId) {
      clients = clients.map((c) =>
        c.id === editingId ? { ...c, name, phone, age } : c
      );
      setMessage("Клієнта оновлено", false);
    } else {
      const newClient = {
        id: crypto.randomUUID(),
        name,
        phone,
        age,
        avatar: "",
      };
      clients = [newClient, ...clients];
      setMessage("Клієнта додано", false);
    }

    writeClients(clients);
    renderClients(filtered());
    form.reset();
    editingId = null;
    toggleForm(false);
  });

  searchInput?.addEventListener("input", () => {
    renderClients(filtered());
  });

  document.getElementById("clientsList")?.addEventListener("click", (e) => {
    const card = e.target.closest(".clients__card");
    const id = card?.dataset.id;
    if (!id) return;

    if (e.target.closest("[data-delete]")) {
      const confirmed = window.confirm("Видалити клієнта?");
      if (!confirmed) return;
      clients = clients.filter((c) => c.id !== id);
      writeClients(clients);
      renderClients(filtered());
    }

    if (e.target.closest("[data-edit]")) {
      const client = clients.find((c) => c.id === id);
      if (!client) return;
      editingId = id;
      toggleForm(true);
      nameInput.value = client.name;
      phoneInput.value = client.phone;
      ageInput.value = client.age || "";
      setMessage("Редагування клієнта", false);
    }

    if (e.target.closest("[data-history]")) {
      alert("Історія клієнта поки не реалізована.");
    }
  });
};

const maybeInitClients = () => {
  if (document.body.dataset.page === "clients") initClientsPage();
};

document.addEventListener("DOMContentLoaded", maybeInitClients);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "clients") initClientsPage();
});

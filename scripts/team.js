const TEAM_KEY = "nextly_team";

const sampleTeam = [
  { id: crypto.randomUUID(), name: "Ірина", role: "Барбер", phone: "+380991234567", exp: 3, active: true },
  { id: crypto.randomUUID(), name: "Олег", role: "Масажист", phone: "+380501234567", exp: 5, active: true },
];

const readTeam = () => {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (_) {}
  return sampleTeam;
};

const writeTeam = (list) => localStorage.setItem(TEAM_KEY, JSON.stringify(list));

const renderTeam = (list) => {
  const container = document.getElementById("teamList");
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<p class="team__message">Немає майстрів. Додайте першого.</p>`;
    return;
  }

  container.innerHTML = list
    .map(
      (m) => `
        <article class="team__card" data-id="${m.id}">
          <div class="team__info">
            <h2 class="team__name">${m.name}</h2>
            <div class="team__meta">
              <span>${m.role || "—"}</span>
              ${m.phone ? `<span>${m.phone}</span>` : ""}
              ${m.exp ? `<span>${m.exp} р.</span>` : ""}
            </div>
            <span class="team__badge">${m.active ? "Активний" : "Не активний"}</span>
          </div>
          <div class="team__actions">
            <button class="btn btn--light" type="button" data-edit="${m.id}">Редагувати</button>
            <button class="btn btn--danger" type="button" data-delete="${m.id}">Видалити</button>
          </div>
        </article>
      `
    )
    .join("");
};

const initTeamPage = () => {
  if (document.body.dataset.page !== "team") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.teamReady === "true") return;
  hero.dataset.teamReady = "true";

  let team = readTeam();
  let editingId = null;

  const form = document.getElementById("teamForm");
  const toggleBtn = document.getElementById("addTeamToggle");
  const cancelBtn = document.getElementById("cancelTeam");
  const searchInput = document.getElementById("teamSearch");
  const nameInput = document.getElementById("team-name");
  const roleInput = document.getElementById("team-role");
  const phoneInput = document.getElementById("team-phone");
  const expInput = document.getElementById("team-exp");
  const activeInput = document.getElementById("team-active");
  const messageEl = document.querySelector("[data-team-message]");

  const setMessage = (text, isError = true) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.toggle("team__message--error", isError);
    messageEl.classList.toggle("team__message--success", !isError);
  };

  const filtered = () => {
    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q) return team;
    return team.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q)
    );
  };

  const resetForm = () => {
    editingId = null;
    form?.reset();
    activeInput.checked = true;
    setMessage("");
  };

  renderTeam(team);

  toggleBtn?.addEventListener("click", () => {
    form.hidden = !form.hidden;
    if (!form.hidden) nameInput?.focus();
  });

  cancelBtn?.addEventListener("click", () => {
    resetForm();
    form.hidden = true;
  });

  searchInput?.addEventListener("input", () => renderTeam(filtered()));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");
    const name = nameInput?.value.trim();
    const role = roleInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const exp = expInput?.value ? Number(expInput.value) : null;
    const active = !!activeInput?.checked;

    if (!name || !role || !phone) {
      setMessage("Заповніть ім'я, спеціалізацію і телефон");
      return;
    }

    if (editingId) {
      team = team.map((m) =>
        m.id === editingId ? { ...m, name, role, phone, exp, active } : m
      );
      setMessage("Майстра оновлено", false);
    } else {
      team = [{ id: crypto.randomUUID(), name, role, phone, exp, active }, ...team];
      setMessage("Майстра додано", false);
    }

    writeTeam(team);
    renderTeam(filtered());
    resetForm();
    form.hidden = true;
  });

  document.getElementById("teamList")?.addEventListener("click", (e) => {
    const card = e.target.closest(".team__card");
    const id = card?.dataset.id;
    if (!id) return;

    if (e.target.closest("[data-delete]")) {
      const confirmed = window.confirm("Видалити майстра?");
      if (!confirmed) return;
      team = team.filter((m) => m.id !== id);
      writeTeam(team);
      renderTeam(filtered());
    }

    if (e.target.closest("[data-edit]")) {
      const current = team.find((m) => m.id === id);
      if (!current) return;
      editingId = id;
      nameInput.value = current.name;
      roleInput.value = current.role;
      phoneInput.value = current.phone;
      expInput.value = current.exp || "";
      activeInput.checked = !!current.active;
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setMessage("Режим редагування", false);
    }
  });
};

const maybeInitTeam = () => {
  if (document.body.dataset.page === "team") initTeamPage();
};

document.addEventListener("DOMContentLoaded", maybeInitTeam);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "team") initTeamPage();
});

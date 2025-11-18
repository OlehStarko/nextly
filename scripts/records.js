const CLIENTS_STORAGE_KEY = "nextly_clients";
const RECORDS_STORAGE_KEY = "nextly_records";
const SERVICES_STORAGE_KEY = "nextly_services";
const MASTERS_STORAGE_KEY = "nextly_team";

const sampleServicesSeed = [
  { id: "s1", name: "Стрижка", price: 500, duration: 60, active: true },
  { id: "s2", name: "Манікюр", price: 700, duration: 60, active: true },
];

const sampleMastersSeed = [
  { id: "m1", name: "Ірина", role: "Майстер", phone: "+380991234567", exp: 3, active: true },
];

const statusLabels = {
  planned: "Заплановано",
  done: "Виконано",
  canceled: "Скасовано",
};

const readClients = () => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (_) {}
  return [
    { id: "c1", name: "Оксана", phone: "+380665821908" },
    { id: "c2", name: "Марія", phone: "0979876543" },
  ];
};

const sampleRecords = (clients) => [
  {
    id: crypto.randomUUID(),
    clientId: clients[0]?.id || "c1",
    serviceId: "",
    date: new Date().toISOString().slice(0, 10),
    time: "11:00",
    amount: 1200,
    status: "planned",
    paid: false,
    note: "Пробний запис",
  },
];

const readRecords = (clients) => {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return sampleRecords(clients);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid records");
    return parsed;
  } catch {
    return sampleRecords(clients);
  }
};

const writeRecords = (list) => localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(list));

const readServices = () => {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return Object.values(parsed);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(sampleServicesSeed));
    return sampleServicesSeed;
  } catch {
    return sampleServicesSeed;
  }
};

const readMasters = () => {
  try {
    const raw = localStorage.getItem(MASTERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return Object.values(parsed);
    localStorage.setItem(MASTERS_STORAGE_KEY, JSON.stringify(sampleMastersSeed));
    return sampleMastersSeed;
  } catch {
    return sampleMastersSeed;
  }
};

const formatDate = (iso) => {
  if (!iso) return "";
  return iso.split("-").reverse().join(".");
};

const initRecordsPage = () => {
  if (document.body.dataset.page !== "records") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.recordsReady === "true") return;
  hero.dataset.recordsReady = "true";

  const clients = readClients();
  let services = readServices();
  let masters = readMasters();
  let records = readRecords(clients);

  const baseDateInput = document.getElementById("baseDate");
  const rangeButtons = document.querySelectorAll("[data-range]");
  const statusButtons = document.querySelectorAll("[data-status]");
  const clientFilter = document.getElementById("recordsClientFilter");
  const addToggle = document.getElementById("addRecordToggle");
  const form = document.getElementById("recordForm");
  const cancelBtn = document.getElementById("cancelRecord");
  const recordClient = document.getElementById("record-client");
  const recordMaster = document.getElementById("record-master");
  const recordDate = document.getElementById("record-date");
  const recordAmount = document.getElementById("record-amount");
  const recordService = document.getElementById("record-service");
  const recordTime = document.getElementById("record-time");
  const recordPaid = document.getElementById("record-paid");
  const recordStatus = document.getElementById("record-status");
  const recordNote = document.getElementById("record-note");
  const messageEl = document.querySelector("[data-record-message]");
  const statsCount = document.querySelector("[data-count]");
  const statsSum = document.querySelector("[data-sum]");
  const statsPeriod = document.querySelector("[data-period]");
  const listEl = document.getElementById("recordsList");

  const setMessage = (text, isError = true) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.toggle("records__form-message--error", isError);
    messageEl.classList.toggle("records__form-message--success", !isError);
  };

  const activeStatuses = () =>
    Array.from(statusButtons)
      .filter((btn) => btn.classList.contains("records__status--active"))
      .map((btn) => btn.dataset.status);

  const activeRange = () => {
    const btn = document.querySelector(".records__range-btn--active");
    return btn?.dataset.range || "all";
  };

  const getFiltered = () => {
    const statuses = activeStatuses();
    const clientId = clientFilter?.value || "all";
    const baseIso = baseDateInput?.value;
    const now = baseIso ? new Date(baseIso) : new Date();
    const range = activeRange();
    return records.filter((rec) => {
      if (statuses.length && !statuses.includes(rec.status)) return false;
      if (clientId !== "all" && rec.clientId !== clientId) return false;
      if (!range || range === "all") return true;
      const d = new Date(rec.date);
      if (Number.isNaN(d.getTime())) return true;
      if (range === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (range === "week") {
        const diff = Math.abs(d - now);
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (range === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const updateStats = (filtered) => {
    const count = filtered.length;
    const sum = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    if (statsCount) statsCount.textContent = `Записів: ${count}`;
    if (statsSum) statsSum.textContent = `Сума: ${sum.toFixed(2)} ₴`;
    if (statsPeriod) {
      const range = activeRange();
      const baseLabel = baseDateInput?.value ? formatDate(baseDateInput.value) : "сьогодні";
      const label =
        range === "today"
          ? `Період: ${baseLabel}`
          : range === "week"
            ? `Період: тиждень від ${baseLabel}`
            : range === "month"
              ? `Період: місяць ${baseLabel.slice(3)}`
              : "Період: усі";
      statsPeriod.textContent = label;
    }
  };

  const renderList = () => {
    if (!listEl) return;
    const filtered = getFiltered();
    updateStats(filtered);
    if (!filtered.length) {
      listEl.innerHTML = `<p class="records__empty">У цьому періоді записів немає.</p>`;
      return;
    }
    listEl.innerHTML = filtered
      .map((rec) => {
        const client = clients.find((c) => c.id === rec.clientId);
        const service = services.find((s) => s.id === rec.serviceId);
        const master = masters.find((m) => m.id === rec.masterId);
        const name = client?.name || "Клієнт";
        const phone = client?.phone || "";
        const serviceName = service?.name ? ` · ${service.name}` : "";
        const masterName = master?.name ? `<span class="records__chip">Майстер: ${master.name}</span>` : "";
        return `
          <article class="records__card" data-id="${rec.id}">
            <div class="records__card-info">
              <div class="records__card-head">
                <h3>${name}${serviceName}</h3>
                <span class="records__badge records__badge--${rec.status}">${statusLabels[rec.status] || rec.status}</span>
              </div>
              <p class="records__phone">${phone}</p>
              <div class="records__meta">
                <span class="records__chip">Дата: ${formatDate(rec.date)}</span>
                ${rec.time ? `<span class="records__chip">Час: ${rec.time}</span>` : ""}
                <span class="records__chip">Сума: ${(Number(rec.amount) || 0).toFixed(2)} ₴</span>
                ${masterName}
                ${rec.paid ? `<span class="records__chip records__chip--success">Оплачено</span>` : ""}
              </div>
              ${rec.note ? `<p class="records__note">${rec.note}</p>` : ""}
            </div>
            <div class="records__card-actions">
              <button class="btn btn--light" type="button" data-status-set="planned" data-id="${rec.id}">Заплановано</button>
              <button class="btn btn--primary" type="button" data-status-set="done" data-id="${rec.id}">Виконано</button>
              <button class="btn btn--danger" type="button" data-status-set="canceled" data-id="${rec.id}">Скасувати</button>
              <button class="btn btn--ghost" type="button" data-delete="${rec.id}">Видалити</button>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const toggleForm = (open) => {
    if (!form) return;
    if (open === true) form.hidden = false;
    else if (open === false) form.hidden = true;
    else form.hidden = !form.hidden;
    if (!form.hidden) recordClient?.focus();
  };

  const syncSelects = () => {
    const clientOptions = clients.map((c) => `<option value="${c.id}">${c.name}${c.phone ? " · " + c.phone : ""}</option>`).join("");
    if (recordClient) recordClient.innerHTML = clientOptions;
    if (clientFilter) clientFilter.innerHTML = `<option value="all">Усі клієнти</option>${clientOptions}`;

    const serviceOptions = services.map((s) => `<option value="${s.id}" data-price="${s.price || 0}">${s.name}</option>`).join("");
    if (recordService) recordService.innerHTML = `<option value="">— Виберіть —</option>${serviceOptions || ""}`;

    const masterOptions = masters.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    if (recordMaster) recordMaster.innerHTML = `<option value="">— Без майстра —</option>${masterOptions}`;
  };

  const refreshServices = () => {
    services = readServices();
    masters = readMasters();
    syncSelects();
  };

  refreshServices();
  renderList();

  // defaults
  const todayIso = new Date().toISOString().slice(0, 10);
  if (baseDateInput) baseDateInput.value = todayIso;
  if (recordDate) recordDate.value = todayIso;
  if (recordTime) {
    const now = new Date();
    recordTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  baseDateInput?.addEventListener("change", renderList);

  rangeButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      rangeButtons.forEach((b) => b.classList.remove("records__range-btn--active"));
      btn.classList.add("records__range-btn--active");
      renderList();
    })
  );

  statusButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      btn.classList.toggle("records__status--active");
      renderList();
    })
  );

  clientFilter?.addEventListener("change", renderList);

  addToggle?.addEventListener("click", () => {
    refreshServices();
    if (form?.hidden) toggleForm(true);
    else toggleForm(false);
  });

  cancelBtn?.addEventListener("click", () => {
    form?.reset();
    if (recordDate) recordDate.value = todayIso;
    toggleForm(false);
    setMessage("");
  });

  recordService?.addEventListener("change", () => {
    const opt = recordService.selectedOptions[0];
    const price = opt ? Number(opt.dataset.price || 0) : 0;
    if (recordAmount) recordAmount.value = price.toFixed(2);
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");
    const clientId = recordClient?.value;
    const masterId = recordMaster?.value || "";
    const serviceId = recordService?.value || "";
    const date = recordDate?.value;
    const time = recordTime?.value || "";
    const status = recordStatus?.value || "planned";
    const amount = Number(recordAmount?.value || 0);
    const note = recordNote?.value.trim();
    const paid = !!recordPaid?.checked;
    if (!clientId || !date) {
      setMessage("Оберіть клієнта та введіть дату");
      return;
    }
    records = [
      {
        id: crypto.randomUUID(),
        clientId,
        masterId,
        serviceId,
        date,
        time,
        status,
        amount,
        paid,
        note,
      },
      ...records,
    ];
    writeRecords(records);
    renderList();
    form.reset();
    if (recordDate) recordDate.value = todayIso;
    if (recordTime) {
      const now = new Date();
      recordTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
    toggleForm(false);
    setMessage("Запис додано", false);
  });

  listEl?.addEventListener("click", (e) => {
    const statusBtn = e.target.closest("[data-status-set]");
    if (statusBtn) {
      const id = statusBtn.dataset.id;
      const status = statusBtn.dataset.statusSet;
      records = records.map((r) => (r.id === id ? { ...r, status } : r));
      writeRecords(records);
      renderList();
      return;
    }
    const deleteBtn = e.target.closest("[data-delete]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.delete;
      const confirmed = window.confirm("Видалити запис?");
      if (!confirmed) return;
      records = records.filter((r) => r.id !== id);
      writeRecords(records);
      renderList();
    }
  });
};

document.addEventListener("DOMContentLoaded", initRecordsPage);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "records") initRecordsPage();
  // Коли повертаємось на сторінку записів через SPA після змін у послугах
  if (e.detail?.page === "services") {
    // нічого не робимо тут, але залишено для можливого розширення
  }
});

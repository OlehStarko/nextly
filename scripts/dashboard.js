const CLIENTS_STORAGE_KEY = "nextly_clients";
const RECORDS_STORAGE_KEY = "nextly_records";
const SERVICES_STORAGE_KEY = "nextly_services";
const MASTERS_STORAGE_KEY = "nextly_team";

const seedClients = [
  { id: "c1", name: "Марина", phone: "+3805636984" },
  { id: "c2", name: "Світлана", phone: "+3805636984" },
  { id: "c3", name: "Настя", phone: "+3805636984" },
  { id: "c4", name: "Олег", phone: "+3805636984" },
];

const seedServices = [
  { id: "s1", name: "Манікюр класичний", price: 500, duration: 60 },
  { id: "s2", name: "Манікюр фірмовий", price: 500, duration: 60 },
  { id: "s3", name: "Покраска волосся", price: 4000, duration: 90 },
  { id: "s4", name: "Стрижка чоловіча", price: 700, duration: 45 },
];

const seedMasters = [
  { id: "m1", name: "Аня", role: "Майстер" },
];

const seedRecords = () => {
  const today = todayIso();
  return [
    { id: "r1", clientId: "c1", serviceId: "s1", masterId: "m1", date: today, time: "10:00", amount: 500, status: "done" },
    { id: "r2", clientId: "c2", serviceId: "s2", masterId: "m1", date: today, time: "13:00", amount: 500, status: "planned" },
    { id: "r3", clientId: "c3", serviceId: "s3", masterId: "m1", date: today, time: "15:00", amount: 4000, status: "planned" },
    { id: "r4", clientId: "c4", serviceId: "s4", masterId: "m1", date: today, time: "17:00", amount: 700, status: "done" },
    { id: "r5", clientId: "c1", serviceId: "s1", masterId: "m1", date: today, time: "18:30", amount: 500, status: "planned" },
  ];
};

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
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(seedClients));
    return seedClients;
  } catch {
    return seedClients;
  }
};

const readRecords = () => {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
    const seeded = seedRecords();
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return seedRecords();
  }
};

const readServices = () => {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return Object.values(parsed);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(seedServices));
    return seedServices;
  } catch {
    return seedServices;
  }
};

const readMasters = () => {
  try {
    const raw = localStorage.getItem(MASTERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return Object.values(parsed);
    localStorage.setItem(MASTERS_STORAGE_KEY, JSON.stringify(seedMasters));
    return seedMasters;
  } catch {
    return seedMasters;
  }
};

const formatDate = (iso) => (iso ? iso.split("-").reverse().join(".") : "");
const todayIso = () => new Date().toISOString().slice(0, 10);
const atStartOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const ymd = (d) => {
  const x = atStartOfDay(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
let selectedDate = todayIso();
let currentMonth = atStartOfDay(new Date());
let eventsBound = false;
let handleDaysWheel = null;
let dragState = null;

const renderDashboardRecords = () => {
  if (document.body.dataset.page !== "dashboard") return;
  const list = document.getElementById("dashRecordsList");
  const countEl = document.querySelector("[data-dash-count]");
  const sumEl = document.querySelector("[data-dash-sum]");
  const dateInput = document.getElementById("dashDate");
  const dateLabel = document.querySelector("[data-dash-date]");
  const crumb = document.querySelector(".dash__crumb");
  const daysRow = document.getElementById("dashDays");
  const showMoreBtn = document.getElementById("dashShowMore");
  const prevBtn = document.getElementById("dashPrev");
  const nextBtn = document.getElementById("dashNext");
  const servicesList = document.getElementById("dashServices");
  const todayBtn = document.querySelector('[data-dash-range="today"]');
  if (!list) return;

  const clients = readClients();
  const services = readServices();
  const masters = readMasters();
  const records = readRecords();

  selectedDate = dateInput?.value || selectedDate || todayIso();

  const renderDays = () => {
    if (!daysRow) return;
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const countsByDay = new Map();
    records.forEach((r) => {
      countsByDay.set(r.date, (countsByDay.get(r.date) || 0) + 1);
    });

    const todayDate = atStartOfDay(new Date(todayIso()));
    const items = [];
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = ymd(d);
      items.push({
        iso: key,
        dow: d.toLocaleDateString("uk-UA", { weekday: "short" }),
        day: d.getDate(),
        isActive: key === selectedDate,
        isToday: key === todayIso(),
        isPast: d < todayDate,
        count: countsByDay.get(key) || 0,
      });
    }
    daysRow.innerHTML = items
      .map(
        (d) => `<button class="dash__day ${d.isActive ? "dash__day--active" : ""} ${d.isToday ? "dash__day--today" : ""}" data-day="${d.iso}">
          <span>${d.dow}</span>
          <strong>${d.day}</strong>
          ${
            d.count
              ? `<span class="dash__day-count ${d.isPast ? "dash__day-count--past" : "dash__day-count--future"}">${d.count}</span>`
              : ""
          }
        </button>`
      )
      .join("");
    daysRow.querySelectorAll("[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDate = btn.dataset.day;
        if (dateInput) dateInput.value = selectedDate;
        renderDashboardRecords();
      });
    });

    if (!handleDaysWheel) {
      handleDaysWheel = (e) => {
        if (!daysRow) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          daysRow.scrollBy({ left: e.deltaY, behavior: "auto" });
        }
      };
    }
    daysRow.onwheel = null;
    daysRow.addEventListener("wheel", handleDaysWheel, { passive: false });

    // позиціонуємо today третім зліва
    const scrollActive = () => {
      const activeEl = daysRow.querySelector(".dash__day--active") || daysRow.querySelector(".dash__day--today");
      if (!activeEl) return;
      const desired = activeEl.offsetLeft - activeEl.clientWidth * 2;
      const maxLeft = Math.max(0, daysRow.scrollWidth - daysRow.clientWidth);
      const left = Math.min(maxLeft, Math.max(0, desired));
      daysRow.scrollTo({ left, behavior: "auto" });
    };
    requestAnimationFrame(scrollActive);

    // drag-to-scroll
    const startDrag = (e) => {
      dragState = {
        startX: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        scrollLeft: daysRow.scrollLeft,
        dragging: true,
      };
      daysRow.classList.add("is-dragging");
    };
    const moveDrag = (e) => {
      if (!dragState || !dragState.dragging) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const delta = dragState.startX - x;
      daysRow.scrollLeft = dragState.scrollLeft + delta;
    };
    const endDrag = () => {
      if (dragState) dragState.dragging = false;
      daysRow.classList.remove("is-dragging");
    };

    daysRow.onmousedown = startDrag;
    daysRow.ontouchstart = startDrag;
    daysRow.onmousemove = moveDrag;
    daysRow.ontouchmove = moveDrag;
    daysRow.onmouseup = endDrag;
    daysRow.onmouseleave = endDrag;
    daysRow.ontouchend = endDrag;
  };

  renderDays();

  if (dateInput && !dateInput.value) dateInput.value = selectedDate;
  if (dateLabel) {
    const dateObj = new Date(selectedDate);
    const formatted = dateObj.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
    dateLabel.textContent = formatted;
  }
  if (crumb) {
    crumb.textContent = currentMonth.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
  }

  const filtered = records.filter((r) => r.date === selectedDate);
  const sorted = [...filtered].sort((a, b) => (a.time || "").localeCompare(b.time || "") || (a.date || "").localeCompare(b.date || ""));

  const total = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  if (countEl) countEl.textContent = `${filtered.length}`;
  if (sumEl) sumEl.textContent = `${total.toFixed(2)} ₴`;

  if (!sorted.length) {
    list.innerHTML = `<p class="dash-records__empty">Ще немає записів. Додайте перший у розділі Records.</p>`;
    return;
  }

  list.innerHTML = sorted
    .map((rec) => {
      const client = clients.find((c) => c.id === rec.clientId);
      const service = services.find((s) => s.id === rec.serviceId);
      const master = masters.find((m) => m.id === rec.masterId);
      const name = client?.name || "Клієнт";
      const phone = client?.phone ? `<span class="dash-records__phone">${client.phone}</span>` : "";
      const serviceName = service?.name ? service.name : "—";
      const masterName = master?.name ? master.name : "";
      const amount = (Number(rec.amount) || 0).toFixed(2);
      return `
        <article class="dash-records__card">
          <div class="dash-records__head">
            <div>
              <h3>${name}</h3>
              <p class="dash-records__service">${serviceName}${masterName ? " • " + masterName : ""}</p>
            </div>
          </div>
          <div class="dash-records__service">${serviceName}</div>
          <div class="dash-records__phone">${client?.phone || ""}</div>
          <div class="dash-records__time">🕒 ${rec.time || "--:--"}</div>
          <div class="dash-records__meta">
            <span class="dash-records__price">₴ ${amount}</span>
            <span class="dash-records__badge dash-records__badge--${rec.status}">${statusLabels[rec.status] || rec.status}</span>
          </div>
        </article>
      `;
    })
    .join("");

  // services summary
  if (servicesList) {
    const counts = new Map();
    filtered.forEach((r) => {
      const key = r.serviceId || "none";
      const svc = services.find((s) => s.id === key);
      const name = svc?.name || "Без послуги";
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    servicesList.innerHTML = [...counts.entries()]
      .map(([name, ct]) => `<div class="dash__service-item"><span>${name}</span><span>${ct}</span></div>`)
      .join("");
  }

  if (!eventsBound) {
    dateInput?.addEventListener("change", () => {
      selectedDate = dateInput.value || todayIso();
      const d = new Date(selectedDate);
      currentMonth = atStartOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
      renderDashboardRecords();
    });

    prevBtn?.addEventListener("click", () => {
      const selDate = new Date(selectedDate || todayIso());
      const day = selDate.getDate();
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const maxDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
      const newDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), Math.min(day, maxDay));
      currentMonth = atStartOfDay(newDate);
      selectedDate = ymd(newDate);
      if (dateInput) dateInput.value = selectedDate;
      renderDashboardRecords();
    });

    nextBtn?.addEventListener("click", () => {
      const selDate = new Date(selectedDate || todayIso());
      const day = selDate.getDate();
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      const maxDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
      const newDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(day, maxDay));
      currentMonth = atStartOfDay(newDate);
      selectedDate = ymd(newDate);
      if (dateInput) dateInput.value = selectedDate;
      renderDashboardRecords();
    });

    todayBtn?.addEventListener("click", () => {
      selectedDate = todayIso();
      const d = new Date(selectedDate);
      currentMonth = atStartOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
      if (dateInput) dateInput.value = selectedDate;
      renderDashboardRecords();
    });

    eventsBound = true;
  }
};

document.addEventListener("DOMContentLoaded", renderDashboardRecords);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "dashboard") renderDashboardRecords();
});

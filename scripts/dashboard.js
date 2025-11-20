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

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 20;
const TIMELINE_STEP_MINUTES = 30;

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
const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const ymd = (d) => {
  const x = atStartOfDay(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const getRangeBoundaries = (iso, period) => {
  const base = iso ? new Date(iso) : new Date();
  let start = new Date(base);
  let end = new Date(base);
  switch (period) {
    case "week": {
      const day = (base.getDay() + 6) % 7; // Monday start
      start = addDays(base, -day);
      end = addDays(start, 6);
      break;
    }
    case "month": {
      start = new Date(base.getFullYear(), base.getMonth(), 1);
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      break;
    }
    case "year": {
      start = new Date(base.getFullYear(), 0, 1);
      end = new Date(base.getFullYear(), 11, 31);
      break;
    }
    default: {
      start = atStartOfDay(base);
      end = atStartOfDay(base);
    }
  }
  return { start: ymd(start), end: ymd(end) };
};

const formatRangeLabel = (startIso, endIso, period) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (period === "day") {
    return start.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  }
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: sameMonth ? "long" : "short",
    year: sameYear ? undefined : "numeric",
  });
  const endLabel = end.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
};

const formatShortDateLabel = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short" });
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return TIMELINE_START_HOUR * 60;
  const [hours, minutes] = timeStr.split(":").map((value) => Number(value) || 0);
  return hours * 60 + minutes;
};

const buildTimelineSlots = () => {
  const slots = [];
  for (let hour = TIMELINE_START_HOUR; hour <= TIMELINE_END_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour === TIMELINE_END_HOUR) break;
    slots.push(`${String(hour).padStart(2, "0")}:${String(TIMELINE_STEP_MINUTES).padStart(2, "0")}`);
  }
  return slots;
};

const DASHBOARD_VIEW_KEY = "nextly_dashboard_view";
const DASHBOARD_PERIOD_KEY = "nextly_dashboard_period";
const PERIOD_LABELS = {
  day: "День",
  week: "Тиждень",
  month: "Місяць",
  year: "Рік",
};
let selectedDate = todayIso();
let currentMonth = atStartOfDay(new Date());
let eventsBound = false;
let handleDaysWheel = null;
let dragState = null;
let recordsView = localStorage.getItem(DASHBOARD_VIEW_KEY) || "list";
let currentPeriod = localStorage.getItem(DASHBOARD_PERIOD_KEY) || "day";
let searchQuery = "";

const syncSearchInputs = () => {
  document.querySelectorAll("[data-dash-search-input]").forEach((input) => {
    if (input.value !== searchQuery) input.value = searchQuery;
  });
};

const setSearchQuery = (value) => {
  const next = value ?? "";
  if (next === searchQuery) return;
  searchQuery = next;
  syncSearchInputs();
  renderDashboardRecords();
};
const bindDashSearchControls = () => {
  document.querySelectorAll("[data-dash-search]").forEach((wrap) => {
    if (wrap.dataset.bound === "true") return;
    const toggle = wrap.querySelector("[data-search-toggle]") || wrap.querySelector("button");
    const input = wrap.querySelector("input");
    if (!toggle || !input) return;
    input.value = searchQuery;
    toggle.addEventListener("click", () => {
      const isOpen = wrap.classList.toggle("is-open");
      if (isOpen) {
        input.focus();
      } else {
        input.blur();
      }
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        wrap.classList.remove("is-open");
        input.blur();
      }
    });
    input.addEventListener("blur", () => {
      wrap.classList.remove("is-open");
    });
    input.addEventListener("input", (event) => setSearchQuery(event.target.value));
    wrap.dataset.bound = "true";
  });
};

const bindDashPeriodMenu = () => {
  document.querySelectorAll("[data-period-wrap]").forEach((wrap) => {
    const labelEl = wrap.querySelector("[data-period-label]");
    const toggle = wrap.querySelector("[data-period-toggle]");
    const menu = wrap.querySelector("[data-period-menu]");
    if (labelEl) labelEl.textContent = PERIOD_LABELS[currentPeriod] || PERIOD_LABELS.day;
    if (wrap.dataset.bound === "true" || !toggle || !menu) return;
    const updateLabel = () => {
      if (labelEl) labelEl.textContent = PERIOD_LABELS[currentPeriod] || PERIOD_LABELS.day;
    };
    const closeMenu = () => {
      menu.classList.remove("is-open");
      document.removeEventListener("click", outsideClick);
    };
    const outsideClick = (e) => {
      if (!wrap.contains(e.target)) {
        closeMenu();
      }
    };
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        menu.classList.add("is-open");
        document.addEventListener("click", outsideClick);
      }
    });
    menu.querySelectorAll("button[data-period]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPeriod = btn.dataset.period || "day";
        try {
          localStorage.setItem(DASHBOARD_PERIOD_KEY, currentPeriod);
        } catch (e) {
          console.warn("Не вдалося зберегти період", e);
        }
        updateLabel();
        closeMenu();
        renderDashboardRecords();
      });
    });
    wrap.dataset.bound = "true";
  });
};

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
  const todayButtons = Array.from(document.querySelectorAll('[data-dash-range="today"]'));
  const viewButtons = Array.from(document.querySelectorAll("[data-view]"));
  const monthToggle = document.querySelector("[data-month-toggle]");
  if (!list) return;

  const clients = readClients();
  const services = readServices();
  const masters = readMasters();
  const records = readRecords();

  selectedDate = dateInput?.value || selectedDate || todayIso();
  syncSearchInputs();
  const range = getRangeBoundaries(selectedDate, currentPeriod);
  const toggleTodayActive = () => {
    const isToday = selectedDate === todayIso();
    todayButtons.forEach((btn) => btn.classList.toggle("is-active", isToday));
  };
  toggleTodayActive();
  bindDashPeriodMenu();

  viewButtons.forEach((btn) => {
    const targetView = btn.dataset.view || "list";
    btn.classList.toggle("is-active", targetView === recordsView);
  });

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
          daysRow.scrollBy({ left: e.deltaY, behavior: "smooth" });
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
      daysRow.scrollTo({ left, behavior: "smooth" });
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
    dateLabel.textContent = formatRangeLabel(range.start, range.end, currentPeriod);
  }
  if (crumb) {
    crumb.textContent = currentMonth.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
  }

  const clientsById = new Map(clients.map((c) => [c.id, c]));
  const servicesById = new Map(services.map((s) => [s.id, s]));
  const mastersById = new Map(masters.map((m) => [m.id, m]));
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const matchesSearch = (rec) => {
    if (!normalizedSearch) return true;
    const client = clientsById.get(rec.clientId);
    const service = servicesById.get(rec.serviceId);
    const master = mastersById.get(rec.masterId);
    const haystack = [
      client?.name,
      client?.phone,
      service?.name,
      master?.name,
      rec.time,
      rec.date,
      statusLabels[rec.status],
    ];
    return haystack.some((value) => typeof value === "string" && value.toLowerCase().includes(normalizedSearch));
  };

  const filtered = records.filter(
    (r) => r.date >= range.start && r.date <= range.end && matchesSearch(r)
  );
  const sorted = [...filtered].sort(
    (a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || "")
  );

  const total = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  if (countEl) countEl.textContent = `${filtered.length}`;
  if (sumEl) sumEl.textContent = `${total.toFixed(2)} ₴`;

  if (!sorted.length) {
    list.innerHTML = `<p class="dash-records__empty">Ще немає записів. Додайте перший у розділі Records.</p>`;
    return;
  }

  const showDateTags = currentPeriod !== "day";

  if (recordsView === "timeline") {
    list.classList.add("dash-records__list--timeline");
    const timelineSlots = buildTimelineSlots();
    const slotHeight = 32;
    const pxPerMinute = slotHeight / TIMELINE_STEP_MINUTES;
    const timelineHeight = timelineSlots.length * slotHeight;
    const timelineScale = timelineSlots
      .map((time) => `<div class="dash-timeline__scale-item">${time}</div>`)
      .join("");
    const eventsMarkup = sorted
      .map((rec) => {
        const client = clientsById.get(rec.clientId);
        const service = servicesById.get(rec.serviceId);
        const master = mastersById.get(rec.masterId);
        const name = client?.name || "Клієнт";
        const phone = client?.phone ? `<p class="dash-timeline__phone">${client.phone}</p>` : "";
        const serviceName = service?.name ? service.name : "—";
        const masterName = master?.name ? master.name : "";
        const amount = (Number(rec.amount) || 0).toFixed(2);
        const statusClass = `dash-timeline__event dash-timeline__event--${rec.status}`;
        const timeLabel = showDateTags
          ? `${formatShortDateLabel(rec.date)} • ${rec.time || "--:--"}`
          : rec.time || "--:--";
        const startMinutes = timeToMinutes(rec.time) - TIMELINE_START_HOUR * 60;
        const durationMinutes = service?.duration || 60;
        const top = Math.max(0, startMinutes * pxPerMinute);
        const height = Math.max(pxPerMinute * TIMELINE_STEP_MINUTES, durationMinutes * pxPerMinute);
        return `
          <div class="${statusClass}" style="top:${top}px;height:${height}px">
            <div class="dash-timeline__body">
              <h3>${name}</h3>
              ${phone}
              <p class="dash-timeline__service">${serviceName}${masterName ? " • " + masterName : ""}</p>
            </div>
            <div class="dash-timeline__meta">
              <span class="dash-timeline__time-label">${timeLabel}</span>
              <span class="dash-timeline__price">₴ ${amount}</span>
            </div>
          </div>
        `;
      })
      .join("");
    list.innerHTML = `<div class="dash-timeline"><div class="dash-timeline__scale">${timelineScale}</div><div class="dash-timeline__events" style="height:${timelineHeight}px">${eventsMarkup}</div></div>`;
  } else {
    list.classList.remove("dash-records__list--timeline");
    list.innerHTML = sorted
      .map((rec) => {
        const client = clientsById.get(rec.clientId);
        const service = servicesById.get(rec.serviceId);
        const master = mastersById.get(rec.masterId);
        const name = client?.name || "Клієнт";
        const phone = client?.phone || "";
        const serviceName = service?.name ? service.name : "—";
        const masterName = master?.name ? master.name : "";
        const amount = (Number(rec.amount) || 0).toFixed(2);
        const avatar = client?.photo || "images/photo.jpg";
        return `
          <article class="dash-records__card">
            <div class="dash-records__person">
              <span class="dash-records__avatar">
                <img src="${avatar}" alt="${name}">
              </span>
              <h3>${name}</h3>
            </div>
            <div class="dash-records__service">${serviceName}${masterName ? " • " + masterName : ""}</div>
            <div class="dash-records__phone">${phone || "—"}</div>
            <div class="dash-records__time">
              ${showDateTags ? `<span class="dash-records__date">${formatShortDateLabel(rec.date)}</span>` : ""}
              <img src="images/icons/clock.svg" alt="" aria-hidden="true">
              <span>${rec.time || "--:--"}</span>
            </div>
            <div class="dash-records__price">
              <img src="images/icons/money.svg" alt="" aria-hidden="true">
              <span>₴ ${amount}</span>
            </div>
            <span class="dash-records__badge dash-records__badge--${rec.status}">${statusLabels[rec.status] || rec.status}</span>
          </article>
        `;
      })
      .join("");
  }

  // services summary
  if (servicesList) {
    const counts = new Map();
    filtered.forEach((r) => {
      const key = r.serviceId || "none";
      const svc = servicesById.get(key);
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

    todayButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDate = todayIso();
        const d = new Date(selectedDate);
        currentMonth = atStartOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
        if (dateInput) dateInput.value = selectedDate;
        renderDashboardRecords();
      });
    });

    monthToggle?.addEventListener("click", () => {
      if (!dateInput) return;
      if (typeof dateInput.showPicker === "function") {
        dateInput.showPicker();
      } else {
        dateInput.focus();
        dateInput.click();
      }
    });

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextView = btn.dataset.view || "list";
        if (recordsView === nextView) return;
        recordsView = nextView;
        try {
          localStorage.setItem(DASHBOARD_VIEW_KEY, recordsView);
        } catch (e) {
          console.warn("Не вдалося зберегти режим відображення", e);
        }
        viewButtons.forEach((control) => {
          const targetView = control.dataset.view || "list";
          control.classList.toggle("is-active", targetView === recordsView);
        });
        renderDashboardRecords();
      });
    });

    bindDashSearchControls();
    bindDashPeriodMenu();
    eventsBound = true;
  }
};

document.addEventListener("DOMContentLoaded", renderDashboardRecords);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "dashboard") {
    eventsBound = false;
    renderDashboardRecords();
  } else {
    eventsBound = false;
  }
});

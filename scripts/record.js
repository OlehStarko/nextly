import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const records = {
  anna: {
    id: "#A-1021",
    name: "Anna",
    phone: "+3 80 66 582 19 08",
    email: "mail@gmail.com",
    birthday: "11.07.1991",
    service: "Manicure",
    date: "12.11.2025",
    time: "12:00",
    cost: "500 ₴",
    statusLabel: "Scheduled",
    statusClass: "status--scheduled",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=320&h=320&q=80",
  },
  mark: {
    id: "#M-2330",
    name: "Mark",
    phone: "+3 80 44 222 44 01",
    email: "mark@example.com",
    birthday: "04.03.1990",
    service: "Massage",
    date: "12.11.2025",
    time: "14:00",
    cost: "800 ₴",
    statusLabel: "Done",
    statusClass: "status--done",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=320&h=320&q=80",
  },
  sofia: {
    id: "#S-1984",
    name: "Sofia",
    phone: "+3 80 50 888 19 19",
    email: "sofia@example.com",
    birthday: "21.09.1994",
    service: "Massage",
    date: "12.11.2025",
    time: "15:00",
    cost: "800 ₴",
    statusLabel: "Canceled",
    statusClass: "status--canceled",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=320&h=320&q=80",
  },
};

const STATUS_CLASS_MAP = {
  Scheduled: "status--scheduled",
  Done: "status--done",
  Canceled: "status--canceled",
};

let setUserFormVisibility;
let setRecordFormVisibility;
let currentRecordKey = "anna";

const requireAuth = () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "auth.html";
      return;
    }

    const badge = document.querySelector(".sidebar__profile-avatar");
    if (badge && user.displayName) {
      badge.textContent = user.displayName.charAt(0).toUpperCase();
    }
  });
};

const toggleSidebar = (shouldOpen) => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("is-open", shouldOpen);
};

const initSidebarToggle = () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector(".mobile-menu-toggle");
  toggleButton?.addEventListener("click", () => {
    toggleSidebar(!sidebar?.classList.contains("is-open"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      toggleSidebar(false);
    }
  });
};

const setTextContent = (selector, value) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
};

const populateRecord = () => {
  const params = new URLSearchParams(window.location.search);
  const recordId = params.get("id") ?? "anna";
  const record = records[recordId] ?? records.anna;
  currentRecordKey = recordId in records ? recordId : "anna";

  const avatar = document.querySelector('[data-record-field="avatar"]');
  if (avatar instanceof HTMLImageElement) {
    avatar.src = record.avatar;
    avatar.alt = record.name;
  }

  setTextContent('[data-record-field="name"]', record.name);
  setTextContent('[data-record-field="phone"]', record.phone);
  setTextContent('[data-record-field="email"]', record.email);
  setTextContent('[data-record-field="birthday"]', record.birthday);
  setTextContent('[data-record-field="service"]', record.service);
  setTextContent('[data-record-field="date"]', record.date);
  setTextContent('[data-record-field="time"]', record.time);
  setTextContent('[data-record-field="cost"]', record.cost);
  setTextContent('[data-record-field="id"]', record.id);

  const statusNodes = document.querySelectorAll('[data-record-field="status"]');
  statusNodes.forEach((node) => {
    node.textContent = record.statusLabel;
    node.classList.remove(...Object.values(STATUS_CLASS_MAP));
    node.classList.add(record.statusClass);
  });

  fillRecordForm(record);
  setUserFormVisibility?.(false);
  fillRecordEntryForm(record);
  setRecordFormVisibility?.(false);
};

const fillRecordForm = (record) => {
  const form = document.querySelector("[data-user-edit-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const setValue = (name, value) => {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement) {
      input.value = value;
    }
  };

  setValue("name", record.name);
  setValue("phone", record.phone);
  setValue("birthday", record.birthday);
};

const fillRecordEntryForm = (record) => {
  const form = document.querySelector("[data-record-edit-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const setValue = (name, value) => {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.value = value;
    }
  };

  setValue("service", record.service);
  setValue("date", record.date);
  setValue("time", record.time);
  setValue("cost", record.cost);
  setValue("status", record.statusLabel);
};

const initUserEditForm = () => {
  const form = document.querySelector("[data-user-edit-form]");
  const toggleButton = document.querySelector("[data-user-edit-toggle]");
  if (!(form instanceof HTMLFormElement) || !(toggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const setVisibility = (shouldShow) => {
    form.classList.toggle("record-form--visible", shouldShow);
    toggleButton.textContent = shouldShow ? "Close" : "Edit";
  };

  toggleButton.addEventListener("click", () => {
    const next = !form.classList.contains("record-form--visible");
    setVisibility(next);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    console.info("User form submitted", Object.fromEntries(data.entries()));
    setVisibility(false);
  });

  return setVisibility;
};

const updateRecordSummary = (updates) => {
  const apply = (selector, value) => {
    if (!value) return;
    setTextContent(selector, value);
  };

  apply('[data-record-field="service"]', updates.service);
  apply('[data-record-field="date"]', updates.date);
  apply('[data-record-field="time"]', updates.time);
  apply('[data-record-field="cost"]', updates.cost);

  if (updates.status) {
    const className = STATUS_CLASS_MAP[updates.status] ?? STATUS_CLASS_MAP.Scheduled;
    document.querySelectorAll('[data-record-field="status"]').forEach((node) => {
      node.textContent = updates.status;
      node.classList.remove(...Object.values(STATUS_CLASS_MAP));
      node.classList.add(className);
    });
  }
};

const initRecordEditForm = () => {
  const form = document.querySelector("[data-record-edit-form]");
  const toggleButton = document.querySelector("[data-record-edit-toggle]");
  if (!(form instanceof HTMLFormElement) || !(toggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const setVisibility = (shouldShow) => {
    form.classList.toggle("record-form--visible", shouldShow);
    toggleButton.textContent = shouldShow ? "Close" : "Edit";
  };

  toggleButton.addEventListener("click", () => {
    const next = !form.classList.contains("record-form--visible");
    setVisibility(next);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const updates = Object.fromEntries(formData.entries());
    updates.statusClass = STATUS_CLASS_MAP[updates.status] ?? STATUS_CLASS_MAP.Scheduled;
    records[currentRecordKey] = {
      ...records[currentRecordKey],
      service: updates.service,
      date: updates.date,
      time: updates.time,
      cost: updates.cost,
      statusLabel: updates.status,
      statusClass: updates.statusClass,
    };
    updateRecordSummary(records[currentRecordKey]);
    console.info("Record form submitted", records[currentRecordKey]);
    setVisibility(false);
  });

  return setVisibility;
};

requireAuth();
initSidebarToggle();
setUserFormVisibility = initUserEditForm();
setRecordFormVisibility = initRecordEditForm();
populateRecord();

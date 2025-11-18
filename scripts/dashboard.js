const CLIENTS_STORAGE_KEY = "nextly_clients";
const RECORDS_STORAGE_KEY = "nextly_records";

const statusLabels = {
  planned: "Заплановано",
  done: "Виконано",
  canceled: "Скасовано",
};

const readClients = () => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readRecords = () => {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDate = (iso) => (iso ? iso.split("-").reverse().join(".") : "");

const renderDashboardRecords = () => {
  if (document.body.dataset.page !== "dashboard") return;
  const list = document.getElementById("dashRecordsList");
  const countEl = document.querySelector("[data-dash-count]");
  const sumEl = document.querySelector("[data-dash-sum]");
  if (!list) return;

  const clients = readClients();
  const records = readRecords();
  const sorted = [...records].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);

  const total = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  if (countEl) countEl.textContent = `Записів: ${records.length}`;
  if (sumEl) sumEl.textContent = `Сума: ${total.toFixed(2)} ₴`;

  if (!sorted.length) {
    list.innerHTML = `<p class="dash-records__empty">Ще немає записів. Додайте перший у розділі Records.</p>`;
    return;
  }

  list.innerHTML = sorted
    .map((rec) => {
      const client = clients.find((c) => c.id === rec.clientId);
      const name = client?.name || "Клієнт";
      const phone = client?.phone ? `<span class="dash-records__phone">${client.phone}</span>` : "";
      const amount = (Number(rec.amount) || 0).toFixed(2);
      return `
        <article class="dash-records__card">
          <div>
            <div class="dash-records__head">
              <h3>${name}</h3>
              <span class="dash-records__badge dash-records__badge--${rec.status}">${statusLabels[rec.status] || rec.status}</span>
            </div>
            ${phone}
            <div class="dash-records__meta">
              <span class="dash-records__chip">Дата: ${formatDate(rec.date)}</span>
              <span class="dash-records__chip">Сума: ${amount} ₴</span>
            </div>
            ${rec.note ? `<p class="dash-records__note">${rec.note}</p>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", renderDashboardRecords);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "dashboard") renderDashboardRecords();
});

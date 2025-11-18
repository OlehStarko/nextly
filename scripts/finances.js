import { ReportsService } from "./reports.js";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} ₴`;

const renderKpi = (overview) => {
  const container = document.getElementById("fin-kpi");
  if (!container) return;
  container.innerHTML = overview
    .map(
      (kpi) => `
      <div class="fin__card">
        <p class="fin__card-label">${kpi.label}</p>
        <p class="fin__card-value">${kpi.suffix ? `${kpi.value} ${kpi.suffix}` : kpi.value}</p>
      </div>
    `
    )
    .join("");
};

const renderTable = (containerId, rows, columns) => {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!rows.length) {
    el.innerHTML = `<p class="fin__empty">Немає даних для цього періоду.</p>`;
    return;
  }
  const head = columns.map((c) => `<span>${c.label}</span>`).join("");
  const body = rows
    .map(
      (row) => `
      <div class="fin__row">
        ${columns
          .map((c) => `<span>${typeof c.format === "function" ? c.format(row[c.key], row) : row[c.key] ?? ""}</span>`)
          .join("")}
      </div>
    `
    )
    .join("");
  el.innerHTML = `<div class="fin__row fin__row--head">${head}</div>${body}`;
};

const renderReports = (report) => {
  renderKpi(report.overview);

  renderTable("fin-revenue-day", report.revenueByDay, [
    { key: "date", label: "Дата" },
    { key: "total", label: "Дохід", format: formatCurrency },
    { key: "count", label: "Візитів" },
    { key: "avg", label: "Сер. чек", format: (v, row) => formatCurrency(row.total / (row.count || 1)) },
  ]);

  renderChart(report.revenueByDay);

  renderTable("fin-revenue-master", report.revenueByMaster, [
    { key: "name", label: "Майстер" },
    { key: "appointments", label: "Візитів" },
    { key: "total", label: "Дохід", format: formatCurrency },
    { key: "share", label: "%", format: (v) => `${v.toFixed(1)}%` },
  ]);

  renderTable("fin-revenue-service", report.revenueByService, [
    { key: "name", label: "Послуга" },
    { key: "count", label: "Разів" },
    { key: "total", label: "Дохід", format: formatCurrency },
    { key: "avg", label: "Сер. ціна", format: formatCurrency },
  ]);

  renderTable("fin-appointments", report.appointments, [
    { key: "date", label: "Дата" },
    { key: "booked", label: "Записів" },
    { key: "done", label: "Виконано" },
    { key: "canceled", label: "Скасовано" },
    { key: "completion_rate", label: "Completion", format: (v) => `${(v * 100).toFixed(1)}%` },
    { key: "cancellation_rate", label: "Cancel", format: (v) => `${(v * 100).toFixed(1)}%` },
  ]);

  renderTable("fin-clients", report.clients, [
    { key: "name", label: "Клієнт" },
    { key: "first", label: "Перший візит" },
    { key: "last", label: "Останній візит" },
    { key: "count", label: "Візитів" },
    { key: "total", label: "Сума", format: formatCurrency },
  ]);
};

const fillFilters = ({ services, masters }) => {
  const serviceSel = document.getElementById("fin-service");
  const masterSel = document.getElementById("fin-master");
  if (serviceSel) {
    const opts = services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
    serviceSel.innerHTML = `<option value="">Усі послуги</option>${opts}`;
  }
  if (masterSel) {
    const opts = masters.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    masterSel.innerHTML = `<option value="">Усі майстри</option>${opts}`;
  }
};

const getFilters = () => {
  const range = document.getElementById("fin-period")?.value || "this_week";
  const serviceId = document.getElementById("fin-service")?.value || "";
  const masterId = document.getElementById("fin-master")?.value || "";
  const fromInput = document.getElementById("fin-from");
  const toInput = document.getElementById("fin-to");
  const from = fromInput?.value ? new Date(fromInput.value) : null;
  const to = toInput?.value ? new Date(toInput.value) : null;
  return { range, serviceId, masterId, from, to };
};

const toggleCustomDates = () => {
  const range = document.getElementById("fin-period")?.value;
  const show = range === "custom";
  document.getElementById("fin-from").hidden = !show;
  document.getElementById("fin-to").hidden = !show;
};

const renderChart = (rows) => {
  const chart = document.getElementById("fin-chart");
  if (!chart) return;
  if (!rows.length) {
    chart.innerHTML = `<p class="fin__empty">Немає даних для графіка</p>`;
    return;
  }
  const max = Math.max(...rows.map((r) => Number(r.total) || 0), 1);
  chart.innerHTML = rows
    .map((r) => {
      const h = (Number(r.total) / max) * 100;
      return `<div class="fin__bar" style="height:${h}%" data-label="${r.date}: ${formatCurrency(r.total)}"></div>`;
    })
    .join("");
};

const exportCsv = (rows, columns, filename) => {
  if (!rows.length) return;
  const header = columns.map((c) => c.label).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const raw = r[c.key];
          const val = typeof c.format === "function" ? c.format(raw, r) : raw;
          return `"${val !== undefined ? String(val).replace(/"/g, '""') : ""}"`;
        })
        .join(",")
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const initFinances = () => {
  if (document.body.dataset.page !== "finances") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.finReady === "true") return;
  hero.dataset.finReady = "true";

  const data = ReportsService.loadData();
  fillFilters(data);
  toggleCustomDates();

  const apply = () => {
    const filters = getFilters();
    const report = ReportsService.generate(filters);
    renderReports(report);
    window.__latestReport = report;
  };

  document.getElementById("fin-period")?.addEventListener("change", () => {
    toggleCustomDates();
    apply();
  });
  document.getElementById("fin-apply")?.addEventListener("click", apply);

  document.querySelectorAll("[data-export]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const report = window.__latestReport;
      if (!report) return;
      const type = btn.dataset.export;
      switch (type) {
        case "revenue-day":
          exportCsv(report.revenueByDay, [
            { key: "date", label: "Дата" },
            { key: "total", label: "Дохід" },
            { key: "count", label: "Візитів" },
            { key: "avg", label: "Сер. чек" },
          ], "revenue_by_day");
          break;
        case "revenue-master":
          exportCsv(report.revenueByMaster, [
            { key: "name", label: "Майстер" },
            { key: "appointments", label: "Візитів" },
            { key: "total", label: "Дохід" },
            { key: "share", label: "Частка %" },
          ], "revenue_by_master");
          break;
        case "revenue-service":
          exportCsv(report.revenueByService, [
            { key: "name", label: "Послуга" },
            { key: "count", label: "Разів" },
            { key: "total", label: "Дохід" },
            { key: "avg", label: "Сер. ціна" },
          ], "revenue_by_service");
          break;
        case "appointments":
          exportCsv(report.appointments, [
            { key: "date", label: "Дата" },
            { key: "booked", label: "Записів" },
            { key: "done", label: "Виконано" },
            { key: "canceled", label: "Скасовано" },
            { key: "completion_rate", label: "Completion" },
            { key: "cancellation_rate", label: "Cancel" },
          ], "appointments");
          break;
        case "clients":
          exportCsv(report.clients, [
            { key: "name", label: "Клієнт" },
            { key: "first", label: "Перший візит" },
            { key: "last", label: "Останній візит" },
            { key: "count", label: "Візитів" },
            { key: "total", label: "Сума" },
          ], "clients");
          break;
        default:
          break;
      }
    });
  });

  apply();
};

document.addEventListener("DOMContentLoaded", initFinances);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "finances") initFinances();
});

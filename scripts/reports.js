const REPORT_KEYS = {
  records: "nextly_records",
  clients: "nextly_clients",
  services: "nextly_services",
  masters: "nextly_team",
};

const sampleClients = [
  { id: "c1", name: "Оксана", phone: "+380665821908" },
  { id: "c2", name: "Марія", phone: "0979876543" },
];

const sampleServices = [
  { id: "s1", name: "Стрижка", price: 500, duration: 60, active: true },
  { id: "s2", name: "Манікюр", price: 700, duration: 60, active: true },
];

const sampleMasters = [
  { id: "m1", name: "Ірина", role: "Майстер", phone: "+380991234567", exp: 3, active: true },
];

const sampleRecords = [
  { id: "r1", clientId: "c1", serviceId: "s1", masterId: "m1", date: new Date().toISOString().slice(0, 10), time: "11:00", amount: 500, status: "done", paid: true },
  { id: "r2", clientId: "c2", serviceId: "s2", masterId: "m1", date: new Date().toISOString().slice(0, 10), time: "12:00", amount: 700, status: "done", paid: true },
];

const safeRead = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return Object.values(parsed);
    return fallback;
  } catch {
    return fallback;
  }
};

const parseDate = (iso) => (iso ? new Date(iso) : null);

const inRange = (date, from, to) => {
  if (!date) return false;
  const time = date.getTime();
  if (from && time < from.getTime()) return false;
  if (to && time > to.getTime()) return false;
  return true;
};

const sumBy = (arr, getter) => arr.reduce((acc, item) => acc + (Number(getter(item)) || 0), 0);

const formatKeyDate = (d) => d.toISOString().slice(0, 10);

const ReportsService = {
  loadData() {
    let records = safeRead(REPORT_KEYS.records, []);
    let clients = safeRead(REPORT_KEYS.clients, []);
    let services = safeRead(REPORT_KEYS.services, []);
    let masters = safeRead(REPORT_KEYS.masters, []);

    if (!clients.length) {
      clients = sampleClients;
      localStorage.setItem(REPORT_KEYS.clients, JSON.stringify(clients));
    }
    if (!services.length) {
      services = sampleServices;
      localStorage.setItem(REPORT_KEYS.services, JSON.stringify(services));
    }
    if (!masters.length) {
      masters = sampleMasters;
      localStorage.setItem(REPORT_KEYS.masters, JSON.stringify(masters));
    }
    if (!records.length) {
      records = sampleRecords;
      localStorage.setItem(REPORT_KEYS.records, JSON.stringify(records));
    }
    return { records, clients, services, masters };
  },

  dateRange(range) {
    const today = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    let from = null;
    let to = null;

    switch (range) {
      case "today":
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case "yesterday": {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        from = startOfDay(y);
        to = endOfDay(y);
        break;
      }
      case "this_week": {
        const first = new Date(today);
        const day = first.getDay() || 7;
        first.setDate(first.getDate() - day + 1);
        from = startOfDay(first);
        to = endOfDay(today);
        break;
      }
      case "this_month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = endOfDay(today);
        break;
      case "last_month": {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        from = startOfDay(first);
        to = endOfDay(last);
        break;
      }
      default:
        break;
    }
    return { from, to };
  },

  generate({ range = "this_week", from: customFrom, to: customTo, masterId, serviceId }) {
    const { records, clients, services, masters } = this.loadData();
    const { from, to } = range === "custom" ? { from: customFrom, to: customTo } : this.dateRange(range);

    const filtered = records.filter((rec) => {
      const d = parseDate(rec.date);
      if (!inRange(d, from, to)) return false;
      if (serviceId && rec.serviceId !== serviceId) return false;
      if (masterId && rec.masterId !== masterId) return false;
      return true;
    });

    const completed = filtered.filter((r) => r.status === "done");
    const canceled = filtered.filter((r) => r.status === "canceled" || r.status === "cancelled");

    const totalRevenue = sumBy(completed, (r) => r.amount);
    const appointmentsCount = completed.length;
    const avgTicket = appointmentsCount ? totalRevenue / appointmentsCount : 0;

    // clients stats
    const clientVisits = new Map();
    records.forEach((r) => {
      const arr = clientVisits.get(r.clientId) || [];
      arr.push(r.date);
      clientVisits.set(r.clientId, arr);
    });

    const newClients = clients.filter((c) => {
      const dates = clientVisits.get(c.id) || [];
      if (!dates.length) return false;
      const first = dates.sort()[0];
      return inRange(parseDate(first), from, to);
    });

    const returningClients = filtered
      .map((r) => r.clientId)
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .filter((id) => (clientVisits.get(id) || []).length > 1);

    // overview KPI
    const overview = [
      { label: "Дохід", value: totalRevenue.toFixed(2), suffix: "₴" },
      { label: "Візитів виконано", value: appointmentsCount },
      { label: "Скасовано", value: canceled.length },
      { label: "Нові клієнти", value: newClients.length },
      { label: "Повторні клієнти", value: returningClients.length },
      { label: "Сер. чек", value: avgTicket.toFixed(2), suffix: "₴" },
    ];

    // revenue by day
    const revenueByDayMap = new Map();
    completed.forEach((r) => {
      const key = r.date;
      const day = revenueByDayMap.get(key) || { date: key, total: 0, count: 0 };
      day.total += Number(r.amount) || 0;
      day.count += 1;
      revenueByDayMap.set(key, day);
    });
    const revenueByDay = Array.from(revenueByDayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // by master
    const revenueByMasterMap = new Map();
    completed.forEach((r) => {
      const key = r.masterId || "none";
      const row = revenueByMasterMap.get(key) || { masterId: key, total: 0, count: 0 };
      row.total += Number(r.amount) || 0;
      row.count += 1;
      revenueByMasterMap.set(key, row);
    });
    const revenueByMaster = Array.from(revenueByMasterMap.values()).map((row) => {
      const master = masters.find((m) => m.id === row.masterId);
      return {
        name: master?.name || "Без майстра",
        appointments: row.count,
        total: row.total,
        share: totalRevenue ? (row.total / totalRevenue) * 100 : 0,
      };
    });

    // by service
    const revenueByServiceMap = new Map();
    completed.forEach((r) => {
      const key = r.serviceId || "none";
      const row = revenueByServiceMap.get(key) || { serviceId: key, total: 0, count: 0 };
      row.total += Number(r.amount) || 0;
      row.count += 1;
      revenueByServiceMap.set(key, row);
    });
    const revenueByService = Array.from(revenueByServiceMap.values()).map((row) => {
      const svc = services.find((s) => s.id === row.serviceId);
      return {
        name: svc?.name || "Без послуги",
        count: row.count,
        total: row.total,
        avg: row.count ? row.total / row.count : 0,
      };
    });

    // appointments aggregated by day
    const apptsByDayMap = new Map();
    filtered.forEach((r) => {
      const key = r.date;
      const row = apptsByDayMap.get(key) || { date: key, booked: 0, done: 0, canceled: 0 };
      row.booked += 1;
      if (r.status === "done") row.done += 1;
      if (r.status === "canceled" || r.status === "cancelled") row.canceled += 1;
      apptsByDayMap.set(key, row);
    });
    const appointments = Array.from(apptsByDayMap.values())
      .map((row) => ({
        ...row,
        completion_rate: row.booked ? row.done / row.booked : 0,
        cancellation_rate: row.booked ? row.canceled / row.booked : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // clients table
    const clientRows = clients.map((c) => {
      const visits = records.filter((r) => r.clientId === c.id);
      const dates = visits.map((v) => v.date).sort();
      const total = sumBy(visits, (v) => v.amount);
      return {
        name: c.name,
        first: dates[0] || "",
        last: dates[dates.length - 1] || "",
        count: visits.length,
        total,
      };
    });

    return {
      overview,
      revenueByDay,
      revenueByMaster,
      revenueByService,
      appointments,
      clients: clientRows,
    };
  },
};

export { ReportsService };

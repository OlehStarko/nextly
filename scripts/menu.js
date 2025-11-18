const MENU_ITEMS = [
  { slug: "dashboard", label: "Dashboard", icon: "images/icons/dashboards.svg", href: "dashboard.html" },
  { slug: "clients", label: "Clients", icon: "images/icons/clients.svg", href: "clients.html" },
  { slug: "records", label: "Records", icon: "images/icons/records.svg", href: "records.html" },
  { slug: "team", label: "Team", icon: "images/icons/team.svg", href: "team.html" },
  { slug: "shop", label: "Shop", icon: "images/icons/shop.svg", href: "shop.html" },
  { slug: "services", label: "Services", icon: "images/icons/services.svg", href: "services.html" },
  { slug: "finances", label: "Finances", icon: "images/icons/finances.svg", href: "finances.html" },
  { slug: "settings", label: "Settings", icon: "images/icons/settings.svg", href: "settings.html" },
];

const dispatchPageReady = (page) => {
  document.dispatchEvent(new CustomEvent("page:ready", { detail: { page } }));
};

const loadedPages = new Set();
const ensurePageModule = async (page) => {
  if (!page || loadedPages.has(page)) return;
  const loaders = {
    dashboard: () => import("./dashboard.js"),
    clients: () => import("./clients.js"),
    records: () => import("./records.js"),
    shop: () => import("./shop.js"),
    services: () => import("./services.js"),
    team: () => import("./team.js"),
    finances: () => import("./finances.js"),
    settings: () => import("./settings.js"),
    account: () => import("./account.js"),
  };
  const loader = loaders[page];
  if (!loader) return;
  try {
    await loader();
    loadedPages.add(page);
  } catch (e) {
    console.warn("Не вдалося завантажити модуль сторінки:", page, e);
  }
};

const renderSidebar = (activeSlug) => {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  const itemsHtml = MENU_ITEMS.map(
    (item) => `
      <a class="sidebar__item ${item.slug === activeSlug ? "sidebar__item--active" : ""}" href="${item.href}" data-slug="${item.slug}">
        <img src="${item.icon}" alt="">
        <span class="sidebar__label">${item.label}</span>
      </a>`
  ).join("");

  root.innerHTML = `
    <div class="mobile-header">
      <img class="mobile-header__logo" src="images/icons/logo_icon.svg" alt="Nextly">
    </div>
    <aside class="sidebar" aria-label="Головне меню">
      <div class="sidebar__header">
        <img class="sidebar__logo" src="images/icons/logo_icon.svg" alt="Nextly">
      </div>
      <nav class="sidebar__nav" aria-label="Розділи">
        ${itemsHtml}
      </nav>
      <div class="sidebar__footer">
        <a class="sidebar__avatar" href="account.html" aria-label="Account">
          <img src="images/photo.jpg" alt="User profile">
          <span class="sidebar__status" aria-hidden="true"></span>
        </a>
      </div>
    </aside>
  `;
};

const initSpaNav = () => {
  const navLinks = Array.from(
    document.querySelectorAll(".sidebar__nav .sidebar__item[href], .sidebar__avatar[href]")
  );
  if (!navLinks.length) return;

  const isMobileNav = () => window.innerWidth <= 900;

  const syncStylesheets = (doc) => {
    const head = document.head;
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !head.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        head.appendChild(link.cloneNode(true));
      }
    });
  };

  const setActive = (path) => {
    navLinks.forEach((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname;
      link.classList.toggle("sidebar__item--active", linkPath === path);
    });
    if (isMobileNav()) {
      const currentActive = document.querySelector(".sidebar__item--active");
      if (currentActive) currentActive.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    }
  };

const replaceMain = (doc) => {
  const currentMain = document.querySelector(".hero");
  const incomingMain = doc.querySelector(".hero");
  if (currentMain && incomingMain) {
    currentMain.replaceWith(incomingMain);
  }
  };

  const navigateTo = async (href, push = true) => {
    try {
      const res = await fetch(href, { headers: { "X-Requested-With": "spa" } });
      if (!res.ok) throw new Error("Failed to load");
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      syncStylesheets(doc);
      replaceMain(doc);
      document.title = doc.title;
      const page = doc.body?.dataset?.page;
      if (page) document.body.dataset.page = page;
      const path = new URL(href, window.location.href).pathname;
      if (push) history.pushState({ path }, "", path);
      setActive(path);
      await ensurePageModule(page);
      dispatchPageReady(page);
    } catch (e) {
      window.location.href = href;
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.href, true);
    });
  });

  window.addEventListener("popstate", () => {
    navigateTo(window.location.href, false);
  });

  // ensure active item is visible on load (mobile)
  const currentActive = document.querySelector(".sidebar__item--active");
  if (currentActive && isMobileNav()) {
    currentActive.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeSlug = document.body.dataset.page;
  renderSidebar(activeSlug);
  initSpaNav();
  await ensurePageModule(activeSlug);
  dispatchPageReady(activeSlug);
});

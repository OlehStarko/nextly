const PRODUCTS_KEY = "nextly_products";
const CLIENTS_KEY = "nextly_clients";

const readProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeProducts = (list) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
};

const readClients = () => {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const renderBadge = (count) => {
  const badge = document.querySelector("[data-shop-count]");
  if (badge) badge.textContent = `${count} шт.`;
};

const renderProducts = (products) => {
  const list = document.getElementById("productsList");
  if (!list) return;
  renderBadge(products.length);

  if (!products.length) {
    list.innerHTML = `<p class="shop__empty">Ще немає товарів. Додайте перший, щоб почати продажі.</p>`;
    return;
  }

  list.innerHTML = products
    .map(
      (p) => `
      <div class="shop__row" data-id="${p.id}">
        <span>${p.name}</span>
        <span>${(Number(p.price) || 0).toFixed(2)}</span>
        <span>${p.sold || 0}</span>
        <span>${(Number(p.revenue) || 0).toFixed(2)}</span>
        <div class="shop__row-actions">
          <button class="btn btn--ghost" type="button" data-delete="${p.id}">Видалити</button>
        </div>
      </div>`
    )
    .join("");
};

const syncSelects = (products, clients) => {
  const productSelect = document.getElementById("sale-product");
  const clientSelect = document.getElementById("sale-client");
  if (productSelect) {
    productSelect.innerHTML = products.length
      ? `<option value="">Оберіть товар</option>${products
          .map((p) => `<option value="${p.id}" data-price="${p.price}">${p.name}</option>`)
          .join("")}`
      : `<option value="">Спочатку додайте товар</option>`;
  }
  if (clientSelect) {
    clientSelect.innerHTML = `<option value="">Без прив'язки</option>${clients
      .map((c) => `<option value="${c.id}">${c.name}</option>`)
      .join("")}`;
  }
};

const initShopPage = () => {
  if (document.body.dataset.page !== "shop") return;
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.shopReady === "true") return;
  hero.dataset.shopReady = "true";

  let products = readProducts();
  const clients = readClients();

  const productForm = document.getElementById("productForm");
  const saleForm = document.getElementById("saleForm");
  const productName = document.getElementById("product-name");
  const productPrice = document.getElementById("product-price");
  const saleProduct = document.getElementById("sale-product");
  const saleClient = document.getElementById("sale-client");
  const saleQty = document.getElementById("sale-qty");
  const salePrice = document.getElementById("sale-price");
  const productMsg = document.querySelector("[data-product-message]");
  const saleMsg = document.querySelector("[data-sale-message]");
  const listEl = document.getElementById("productsList");

  const setMsg = (el, text, isError = true) => {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("shop__message--error", isError);
    el.classList.toggle("shop__message--success", !isError);
  };

  const findProduct = (id) => products.find((p) => p.id === id);

  syncSelects(products, clients);
  renderProducts(products);

  saleProduct?.addEventListener("change", () => {
    const option = saleProduct.selectedOptions[0];
    const price = option ? Number(option.dataset.price || 0) : 0;
    if (salePrice) salePrice.value = price.toFixed(2);
  });

  productForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMsg(productMsg, "");
    const name = productName?.value.trim();
    const price = Number(productPrice?.value || 0);
    if (!name || price <= 0) {
      setMsg(productMsg, "Вкажіть назву і ціну > 0");
      return;
    }
    products = [
      { id: crypto.randomUUID(), name, price, sold: 0, revenue: 0 },
      ...products,
    ];
    writeProducts(products);
    renderProducts(products);
    syncSelects(products, clients);
    productForm.reset();
    setMsg(productMsg, "Товар додано", false);
  });

  saleForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMsg(saleMsg, "");
    const productId = saleProduct?.value;
    const qty = Number(saleQty?.value || 0);
    const price = Number(salePrice?.value || 0);
    if (!productId) {
      setMsg(saleMsg, "Оберіть товар");
      return;
    }
    if (qty <= 0 || price < 0) {
      setMsg(saleMsg, "Кількість має бути > 0");
      return;
    }
    products = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            sold: (p.sold || 0) + qty,
            revenue: (p.revenue || 0) + qty * price,
            price,
          }
        : p
    );
    writeProducts(products);
    renderProducts(products);
    syncSelects(products, clients);
    saleForm.reset();
    if (saleQty) saleQty.value = "1";
    setMsg(saleMsg, "Продаж зафіксовано", false);
  });

  listEl?.addEventListener("click", (e) => {
    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      const id = delBtn.dataset.delete;
      const confirmed = window.confirm("Видалити товар?");
      if (!confirmed) return;
      products = products.filter((p) => p.id !== id);
      writeProducts(products);
      renderProducts(products);
      syncSelects(products, clients);
    }
  });
};

const maybeInitShop = () => {
  if (document.body.dataset.page === "shop") initShopPage();
};

document.addEventListener("DOMContentLoaded", maybeInitShop);
document.addEventListener("page:ready", (e) => {
  if (e.detail?.page === "shop") initShopPage();
});

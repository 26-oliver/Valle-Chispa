"use strict";

function createValleShop({ onBuy, onOpen, onClose, onPreview }) {
  const dialog = document.querySelector("#market");
  const trigger = document.querySelector("#open-market");
  const heading = dialog.querySelector("#market-heading");
  const navigation = dialog.querySelector(".market-nav");
  const detail = dialog.querySelector(".market-detail");
  const list = dialog.querySelector(".market-items");
  const wallet = dialog.querySelector(".market-balance strong");
  const status = dialog.querySelector(".market-status");
  const format = new Intl.NumberFormat(ValleLocale.locale);
  const { categories, areaIndex, canTrade, offer } = ValleEconomy;
  let category = categories[0];
  let cards = [];
  let state;
  let busy = false;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function makeCard(item) {
    const card = element("article", "market-item");
    const art = element("div", "market-art");
    art.dataset.art = item.id;
    art.setAttribute("aria-hidden", "true");
    if (item.art) {
      const sprite = element("img", "pixel");
      sprite.src = item.art;
      sprite.alt = "";
      art.append(sprite);
    } else {
      art.append(element("span", "effect-preview"));
    }

    const info = element("div", "market-info");
    const name = element("h3", "market-name", item.name);
    const note = element("p", "market-note", item.note);
    const benefit = element("p", "market-benefit");
    info.append(name, note, benefit);

    const button = element("button", "market-buy");
    button.type = "button";
    const label = element("span", "market-buy-label");
    const price = element("span", "market-price");
    const icon = element("img", "pixel");
    icon.src = "./assets/cristal.png";
    icon.alt = "";
    const value = element("span", "market-value");
    price.append(icon, value);
    button.append(label, price);
    button.addEventListener("click", () => buyItem(item));

    const controls = element("div", "market-controls");
    if (item.category === "effect") {
      card.classList.add("market-effect");
      const preview = element("button", "market-test", t("Probar"));
      preview.type = "button";
      preview.setAttribute("aria-label", t("Probar ") + item.name);
      preview.addEventListener("click", (event) => onPreview(item.id, event));
      controls.append(preview);
    }
    controls.append(button);
    card.append(art, info, controls);
    list.append(card);
    return { item, button, label, price, value, benefit };
  }

  function showCategory(next) {
    category = next;
    for (const button of navigation.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.category === category.id));
    }
    detail.textContent = category.detail;
    status.textContent = "";
    cards = [];
    refresh(state);
  }

  function refresh(next) {
    state = next;
    if (!dialog.open) return;
    if (dialog.dataset.area !== state.area) {
      dialog.dataset.area = state.area;
      heading.textContent = areaIndex.get(state.area).shop;
    }
    const available = category.items.filter((item) => canTrade(state, item));
    if (available.length !== cards.length || available.some((item, index) => cards[index]?.item !== item)) {
      list.replaceChildren();
      cards = available.map(makeCard);
    }
    const amount = format.format(state.balance);
    if (wallet.textContent !== amount) wallet.textContent = amount;
    for (const { item, button, label, price, value, benefit } of cards) {
      const entry = offer(state, item);
      const affordable = state.balance >= entry.cost;
      label.textContent = entry.label;
      price.hidden = entry.done || entry.cost === 0;
      value.textContent = format.format(entry.cost);
      button.setAttribute("aria-label", entry.label + " " + item.name + (price.hidden ? "" : t(" por ") + value.textContent + t(" chispas")));
      button.setAttribute("aria-disabled", String(entry.done || busy));
      button.dataset.state = entry.done ? "owned" : affordable ? "available" : "short";
      if (item.category === "companions") {
        benefit.textContent = "+" + item.rate + (item.rate === 1 ? t(" chispa/s") : t(" chispas/s"));
      } else if (item.category === "upgrades") {
        benefit.textContent = t("Nivel ") + entry.level + t(" de ") + item.cap;
      }
      benefit.hidden = !benefit.textContent;
    }
  }

  async function buyItem(item) {
    if (busy) return;
    const entry = offer(state, item);
    if (entry.done) return;
    if (entry.cost > state.balance) {
      const missing = entry.cost - state.balance;
      status.textContent = t("Te faltan ") + format.format(missing) + (missing === 1 ? t(" chispa.") : t(" chispas."));
      return;
    }
    busy = true;
    refresh(state);
    try {
      const result = await onBuy(item.id);
      if (result?.changed) {
        status.textContent = result.message;
      } else if (result?.unavailable) {
        status.textContent = t("Este artículo está en otra tienda.");
      } else if (result?.missing) {
        status.textContent = t("Te faltan ") + format.format(result.missing) + (result.missing === 1 ? t(" chispa.") : t(" chispas."));
      }
    } finally {
      busy = false;
      refresh(state);
    }
  }

  for (const tab of categories) {
    const button = element("button", "market-tab", tab.name);
    button.type = "button";
    button.dataset.category = tab.id;
    button.addEventListener("click", () => showCategory(tab));
    navigation.append(button);
  }

  trigger.addEventListener("click", () => {
    onOpen();
    dialog.showModal();
    showCategory(category);
    navigation.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
  });
  dialog.addEventListener("close", () => {
    trigger.focus({ preventScroll: true });
    onClose();
  });

  return { refresh, dialog };
}

"use strict";

function createValleAtlas({ onOpen, onClose, onVisit }) {
  const dialog = document.querySelector("#atlas");
  const trigger = document.querySelector("#open-map");
  const route = dialog.querySelector(".atlas-route");
  const total = dialog.querySelector("#atlas-total");
  const format = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

  const stops = ValleEconomy.areas.map((area, index) => {
    const card = document.createElement("article");
    card.className = "atlas-stop";

    const artwork = document.createElement("img");
    artwork.src = area.art;
    artwork.alt = "";
    artwork.loading = "lazy";
    artwork.className = "atlas-art";

    const caption = document.createElement("div");
    caption.className = "atlas-caption";
    const name = document.createElement("h3");
    name.textContent = area.name;
    const level = document.createElement("p");
    level.className = "atlas-level";
    level.textContent = "Nivel " + (index + 1);
    const requirement = document.createElement("p");
    requirement.className = "atlas-requirement";
    requirement.textContent = area.goal ? format.format(area.goal) + " chispas acumuladas" : "Mapa inicial";

    const visit = document.createElement("button");
    visit.type = "button";
    visit.className = "atlas-visit";
    visit.addEventListener("click", async () => {
      const result = await onVisit(area);
      if (result.changed) dialog.close();
    });

    caption.append(level, name, requirement, visit);
    card.append(artwork, caption);
    route.append(card);
    return { area, card, visit };
  });

  function refresh(state) {
    const earned = format.format(state.earned);
    if (total.textContent !== earned) total.textContent = earned;
    for (const { area, card, visit } of stops) {
      const active = area.id === state.area;
      const unlocked = ValleEconomy.isUnlocked(state, area.id);
      const missing = area.goal - state.earned;
      const remaining = missing === 1 ? "Falta 1 chispa" : "Faltan " + format.format(Math.max(0, missing)) + " chispas";
      const label = active ? "Aquí estás" : unlocked ? "Viajar" : remaining;
      card.dataset.access = active ? "current" : unlocked ? "open" : "locked";
      if (visit.textContent !== label) {
        visit.textContent = label;
        visit.setAttribute("aria-label", label + ": " + area.name);
      }
      visit.disabled = active || !unlocked;
    }
  }

  trigger.addEventListener("click", () => {
    onOpen();
    dialog.showModal();
  });
  dialog.addEventListener("close", () => {
    trigger.focus({ preventScroll: true });
    onClose();
  });

  return { dialog, refresh };
}

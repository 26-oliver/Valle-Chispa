"use strict";

const ValleEconomy = (() => {
  const image = (name) => "./assets/tienda/" + name + ".png";
  const areas = [
    { id: "clearing", name: "Claro Esmeralda", shop: "Tienda del claro", art: "./assets/valle.webp", goal: 0 },
    { id: "summit", name: "Cumbre Nevada", shop: "Tienda de la cumbre", art: "./assets/cumbre.webp", goal: 500 },
    { id: "cave", name: "Gruta de Ámbar", shop: "Tienda de la gruta", art: "./assets/gruta.webp", goal: 5000 },
  ];
  const areaIndex = new Map(areas.map((area) => [area.id, area]));
  const games = {
    clearing: { name: "Atrapa luciérnagas", note: "Tienes 12 segundos para tocar tantos destellos como puedas.", max: 18, reward: 9 },
    summit: { name: "Pesca bajo el hielo", note: "En cuatro intentos, recoge la línea justo cuando pique un pez.", max: 4, reward: 64 },
    cave: { name: "Ritmo de la forja", note: "Golpea cuando el marcador entre en la zona dorada. Tienes seis golpes en 18 segundos.", max: 6, reward: 210 },
  };
  const quests = [
    { id: "first-taps", area: "clearing", name: "Manos al cristal", note: "Recoge chispas con 30 pulsaciones.", metric: "pulses", target: 30, reward: 80 },
    { id: "first-pet", area: "clearing", name: "Casa en el claro", note: "Adopta un compañero del claro.", metric: "pets", target: 1, reward: 65 },
    { id: "first-game", area: "clearing", name: "Luz entre la hierba", note: "Atrapa 5 luciérnagas en una ronda.", metric: "best", target: 5, reward: 100 },
    { id: "fishing", area: "summit", name: "Pescador de la cumbre", note: "Pesca 2 peces en una ronda.", metric: "best", target: 2, reward: 350 },
    { id: "snow-pet", area: "summit", name: "Refugio nevado", note: "Consigue un compañero de la cumbre.", metric: "pets", target: 1, reward: 310 },
    { id: "snow-total", area: "summit", name: "Rumbo al hielo", note: "Alcanza 1.500 chispas acumuladas.", metric: "earned", target: 1500, reward: 430 },
    { id: "forge-game", area: "cave", name: "Ritmo de fuego", note: "Acierta 3 golpes en una ronda de forja.", metric: "best", target: 3, reward: 1250 },
    { id: "cave-pet", area: "cave", name: "Vida subterránea", note: "Adopta un compañero de la gruta.", metric: "pets", target: 1, reward: 1700 },
    { id: "evolution", area: "cave", name: "Cambiaformas", note: "Evoluciona a cualquier compañero.", metric: "evolved", target: 1, reward: 2100 },
  ];
  const categories = [
    {
      id: "companions", name: "Compañeros",
      detail: "Los compañeros viven en el mapa donde los adoptas y producen chispas estés donde estés.",
      items: [
        { id: "broti", name: "Broti", note: "Zorro de hojas", cost: 25, rate: 1, art: image("broti") },
        { id: "miga", name: "Miga", note: "Duende seta", cost: 70, rate: 3, art: image("miga") },
        { id: "nimbo", name: "Nimbo", note: "Murciélago de niebla", cost: 160, rate: 7, art: image("nimbo") },
        { id: "ascua", name: "Ascua", note: "Salamandra de brasa", cost: 340, rate: 16, art: image("ascua") },
        { id: "copo", name: "Copo", note: "Liebre de nieve", cost: 560, rate: 25, art: image("copo"), area: "summit" },
        { id: "boreas", name: "Bóreas", note: "Búho de la aurora", cost: 1350, rate: 55, art: image("boreas"), area: "summit" },
        { id: "aleta", name: "Aleta", note: "Pez que flota en una burbuja", cost: 0, prize: true, rate: 32, art: image("aleta"), area: "summit" },
        { id: "geodo", name: "Geodo", note: "Tortuga de roca y jade", cost: 5200, rate: 165, art: image("geodo"), area: "cave" },
        { id: "candela", name: "Candela", note: "Polilla de chispa", cost: 12500, rate: 360, art: image("candela"), area: "cave" },
      ],
    },
    {
      id: "upgrades", name: "Mejoras",
      detail: "Las mejoras aumentan tu producción en todos los mapas.",
      items: [
        { id: "pick", name: "Pico de cobre", note: "Una chispa más por pulsación y nivel", cost: 12, rate: 1, stat: "tap", growth: 1.8, cap: 8, art: image("pico") },
        { id: "mill", name: "Molino de agua", note: "Dos chispas por segundo y nivel", cost: 50, rate: 2, stat: "passive", growth: 2.15, cap: 8, art: image("molino") },
        { id: "ice-pick", name: "Pico de escarcha", note: "Cuatro chispas más por pulsación y nivel", cost: 400, rate: 4, stat: "tap", growth: 2, cap: 6, art: image("pico"), area: "summit" },
        { id: "forge", name: "Forja de ámbar", note: "Cuarenta chispas por segundo y nivel", cost: 3600, rate: 40, stat: "passive", growth: 2.1, cap: 6, art: image("molino"), area: "cave" },
      ],
    },
    {
      id: "gem", name: "Gemas",
      detail: "El cristal que equipes te acompaña al viajar.",
      items: [
        { id: "emerald", name: "Esmeralda", note: "El cristal original del valle", cost: 0, art: "./assets/cristal.png" },
        { id: "amber", name: "Ámbar solar", note: "Color miel con un destello dorado", cost: 45, art: image("ambar") },
        { id: "moon", name: "Luna helada", note: "Azul claro con vetas de escarcha", cost: 95, art: image("luna") },
        { id: "amethyst", name: "Amatista", note: "Violeta con reflejos rosados", cost: 175, art: image("amatista") },
        { id: "aurora", name: "Prisma boreal", note: "Facetas verdes, celestes y lilas", cost: 820, art: image("prisma"), area: "summit" },
        { id: "magma", name: "Corazón de magma", note: "Un núcleo rojo de brillo dorado", cost: 7900, art: image("nucleo"), area: "cave" },
      ],
    },
    {
      id: "effect", name: "Efectos",
      detail: "Prueba los efectos y elige cuál aparece al pulsar en el escenario.",
      items: [
        { id: "spark", name: "Destellos", note: "Partículas doradas y verdes", cost: 0 },
        { id: "leaves", name: "Hojitas", note: "Hojas que giran en el aire", cost: 35 },
        { id: "rings", name: "Ondas", note: "Anillos de luz que se expanden", cost: 80 },
        { id: "stars", name: "Constelación", note: "Estrellas lilas y blancas", cost: 140 },
        { id: "snow", name: "Escarcha", note: "Copos celestes que se dispersan", cost: 450, area: "summit" },
        { id: "embers", name: "Brasas", note: "Píxeles incandescentes de la gruta", cost: 2800, area: "cave" },
      ],
    },
  ];
  categories.forEach((category) => category.items.forEach((item) => {
    item.category = category.id;
    item.area ??= areas[0].id;
  }));
  const items = new Map(categories.flatMap((category) => category.items.map((item) => [item.id, item])));
  const pets = categories[0].items;
  const upgrades = categories[1].items;

  function latestArea(earned) {
    return areas.findLast((area) => earned >= area.goal);
  }

  function isUnlocked(state, id) {
    const area = areaIndex.get(id);
    return Boolean(area && state.earned >= area.goal);
  }

  function travel(state, id) {
    if (!isUnlocked(state, id)) return { changed: false };
    const changed = state.area !== id || state.pendingArea !== null;
    state.area = id;
    state.pendingArea = null;
    return { changed };
  }

  function canTrade(state, item) {
    const cosmetic = item.category === "gem" || item.category === "effect";
    return !item.prize && (item.area === state.area || cosmetic && (item.cost === 0 || state.owned.includes(item.id)));
  }
  const limit = Number.MAX_SAFE_INTEGER;
  const offlineLimit = 2 * 60 * 60 * 1000;

  function integer(value, max = limit) {
    return Number.isSafeInteger(value) && value >= 0 ? Math.min(value, max) : 0;
  }

  function newState(now, legacyBalance = 0) {
    const balance = integer(Number(legacyBalance));
    return {
      version: 2,
      balance,
      earned: balance,
      levels: Object.fromEntries(upgrades.map((item) => [item.id, 0])),
      area: latestArea(balance).id,
      pendingArea: null,
      owned: [],
      evolved: [],
      experience: {},
      records: {},
      claimed: [],
      pulses: 0,
      generation: 0,
      gem: "emerald",
      effect: "spark",
      updatedAt: now,
      carry: 0,
    };
  }

  function readState(saved, legacy, now) {
    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch {
      return newState(now, legacy);
    }

    if (parsed?.version !== 2) return newState(now, legacy);
    const state = newState(now, parsed.balance);
    state.earned = Math.max(state.balance, integer(parsed.earned));
    state.area = isUnlocked(state, parsed.area) ? parsed.area : latestArea(state.earned).id;
    state.pendingArea = isUnlocked(state, parsed.pendingArea) && parsed.pendingArea !== state.area ? parsed.pendingArea : null;
    for (const item of upgrades) {
      state.levels[item.id] = integer(parsed.levels?.[item.id], item.cap);
    }
    if (Array.isArray(parsed.owned)) {
      state.owned = [...new Set(parsed.owned)].filter((id) => {
        const item = items.get(id);
        return item && (item.cost > 0 || item.prize) && item.category !== "upgrades";
      });
    }
    const ownedPets = pets.filter((pet) => state.owned.includes(pet.id));
    if (Array.isArray(parsed.evolved)) {
      state.evolved = ownedPets.filter((pet) => parsed.evolved.includes(pet.id)).map((pet) => pet.id);
    }
    for (const pet of ownedPets) {
      state.experience[pet.id] = integer(parsed.experience?.[pet.id], evolutionGoal(pet));
    }
    for (const area of areas) {
      state.records[area.id] = integer(parsed.records?.[area.id], games[area.id].max);
    }
    if (Array.isArray(parsed.claimed)) {
      state.claimed = quests.filter((quest) => parsed.claimed.includes(quest.id)).map((quest) => quest.id);
    }
    state.pulses = integer(parsed.pulses);
    state.generation = integer(parsed.generation);
    for (const kind of ["gem", "effect"]) {
      if (items.get(parsed[kind])?.category === kind && state.owned.includes(parsed[kind])) {
        state[kind] = parsed[kind];
      }
    }
    state.updatedAt = integer(parsed.updatedAt) || now;
    state.carry = integer(parsed.carry, 999);
    return state;
  }

  function upgradeRate(state, stat) {
    return upgrades.reduce((total, item) => total + (item.stat === stat ? state.levels[item.id] * item.rate : 0), 0);
  }

  function tapValue(state) {
    return 1 + upgradeRate(state, "tap");
  }

  function petRate(state, pet) {
    return pet.rate * (state.evolved.includes(pet.id) ? 2 : 1);
  }

  function rate(state) {
    return pets.reduce((total, pet) => total + (state.owned.includes(pet.id) ? petRate(state, pet) : 0), upgradeRate(state, "passive"));
  }

  function evolutionGoal(pet) {
    return pet.area === "clearing" ? 35 : pet.area === "summit" ? 65 : 100;
  }

  function trainPets(state, amount) {
    for (const pet of pets) {
      if (state.owned.includes(pet.id) && !state.evolved.includes(pet.id)) {
        state.experience[pet.id] = Math.min((state.experience[pet.id] || 0) + amount, evolutionGoal(pet));
      }
    }
  }

  function evolve(state, id) {
    const pet = items.get(id);
    if (pet?.category !== "companions" || !state.owned.includes(id) ||
        state.evolved.includes(id) || (state.experience[id] || 0) < evolutionGoal(pet)) return { changed: false };
    state.evolved.push(id);
    return { changed: true, message: pet.name + " ha evolucionado y ahora reúne " + petRate(state, pet) + " chispas/s." };
  }

  function pulse(state) {
    const amount = earn(state, tapValue(state));
    if (amount) {
      state.pulses = Math.min(limit, state.pulses + 1);
      trainPets(state, 1);
    }
    return { changed: amount > 0, amount };
  }

  function finishGame(state, area, score, generation) {
    const game = games[area];
    if (!isUnlocked(state, area) || generation !== state.generation || !Number.isSafeInteger(score) || score < 0 || score > game.max) {
      return { changed: false, ignored: true };
    }
    const record = score > (state.records[area] || 0);
    if (record) state.records[area] = score;
    const amount = earn(state, score * game.reward);
    if (score) trainPets(state, score * 2);
    const prize = area === "summit" && score === 4 && !state.owned.includes("aleta");
    if (prize) state.owned.push("aleta");
    return { changed: score > 0, amount, record, prize };
  }

  function questProgress(state, quest) {
    switch (quest.metric) {
      case "pulses": return state.pulses;
      case "earned": return state.earned;
      case "best": return state.records[quest.area] || 0;
      case "evolved": return state.evolved.length;
      case "pets": return pets.filter((pet) => pet.area === quest.area && state.owned.includes(pet.id)).length;
      default: return 0;
    }
  }

  function claimQuest(state, id) {
    const quest = quests.find((entry) => entry.id === id);
    if (!quest || quest.area !== state.area || state.claimed.includes(id) || questProgress(state, quest) < quest.target) {
      return { changed: false };
    }
    const amount = earn(state, quest.reward);
    state.claimed.push(id);
    return { changed: true, amount };
  }

  function earn(state, amount) {
    const received = Math.min(amount, limit - state.balance);
    state.balance += received;
    state.earned = Math.min(limit, state.earned + received);
    return received;
  }

  function settle(state, now) {
    const elapsed = Math.max(0, Math.min(offlineLimit, now - state.updatedAt));
    state.updatedAt = now;
    const production = rate(state);
    if (production === 0) {
      state.carry = 0;
      return 0;
    }
    const accumulated = state.carry + elapsed * production;
    state.carry = accumulated % 1000;
    return earn(state, Math.floor(accumulated / 1000));
  }

  function offer(state, item) {
    const { id, category } = item;
    if (category === "upgrades") {
      const level = state.levels[id];
      const done = level >= item.cap;
      return { level, done, cost: Math.ceil(item.cost * item.growth ** level), label: done ? "Nivel máximo" : "Mejorar" };
    }
    const own = item.cost === 0 || state.owned.includes(id);
    if (category === "companions") {
      return { done: own, cost: item.cost, label: own ? "Adoptado" : "Adoptar" };
    }
    const active = state[category] === id;
    return { done: active, cost: own ? 0 : item.cost, label: active ? "En uso" : own ? "Equipar" : "Comprar" };
  }

  function buy(state, id) {
    const item = items.get(id);
    if (!item || !canTrade(state, item)) return { changed: false, unavailable: true };
    const { cost, done } = offer(state, item);
    if (done) return { changed: false };
    if (cost > state.balance) return { changed: false, missing: cost - state.balance };

    state.balance -= cost;
    if (item.category === "upgrades") {
      state.levels[id] += 1;
      return { changed: true, message: item.name + " al nivel " + state.levels[id] + "." };
    }
    if (cost > 0) state.owned.push(item.id);
    if (item.category === "companions") {
      return { changed: true, message: item.name + " se ha unido a tu colección." };
    }
    state[item.category] = item.id;
    return { changed: true, message: item.name + " en uso." };
  }

  return { areas, areaIndex, games, quests, questProgress, claimQuest, pulse, finishGame, evolutionGoal, evolve, petRate, latestArea, isUnlocked, travel, canTrade, categories, items, pets, newState, readState, rate, tapValue, earn, settle, offer, buy, limit };
})();

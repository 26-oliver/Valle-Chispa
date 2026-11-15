"use strict";

function createValleActivities({ onOpen, onClose, onFinish, onClaim, onEvolve }) {
  const economy = ValleEconomy;
  const number = new Intl.NumberFormat("es-ES");
  const dialog = document.querySelector("#activities");
  const trigger = document.querySelector("#open-activities");
  const tabs = [...dialog.querySelectorAll(".activity-tab")];
  const panel = dialog.querySelector(".activity-panel");
  const notice = dialog.querySelector(".activity-notice");
  const forgeTargets = [.41, .71, .52, .28, .63, .45];
  let state;
  let activeTab = "games";
  let boardKey;
  let renderContent;
  let playButton;
  let gameScore;
  let gameClock;
  let gameRecord;
  let board;
  let cells;
  let gameButton;
  let signal;
  let marker;
  let targetBand;
  let forgeTrack;
  let run;
  let frame;
  let saving = false;

  function node(tag, className, label) {
    const result = document.createElement(tag);
    result.className = className;
    if (label) result.textContent = label;
    return result;
  }

  function button(label, action, className = "activity-button") {
    const result = node("button", className, label);
    result.type = "button";
    result.addEventListener("click", action);
    return result;
  }

  function setNotice(message) {
    notice.textContent = message;
  }

  function refresh(next) {
    state = next;
    if (!dialog.open) return;
    if (run && (run.generation !== state.generation || run.area !== state.area)) {
      clearRun();
      setNotice("La partida ha cambiado en otra pestaña.");
    }
    const key = activeTab + ":" + state.area + (activeTab === "pets" ? ":" + state.owned.join(",") : "");
    if (key !== boardKey) {
      boardKey = key;
      panel.replaceChildren();
      renderContent = activeTab === "games" ? buildGame() : buildList(activeTab);
    }
    for (const tab of tabs) {
      tab.setAttribute("aria-pressed", String(tab.dataset.tab === activeTab));
      tab.disabled = Boolean(run) || saving;
    }
    renderContent();
  }

  function buildList(tab) {
    const quests = tab === "quests";
    const entries = quests
      ? economy.quests.filter((quest) => quest.area === state.area)
      : economy.pets.filter((pet) => state.owned.includes(pet.id));
    const description = quests
      ? "Completa los encargos de " + economy.areaIndex.get(state.area).name + " y cobra sus recompensas."
      : "Cada pulsación y cada acierto en un minijuego dan experiencia a tus compañeros. Al evolucionar, duplican su producción.";
    panel.append(node("p", "activity-description", description));
    if (!entries.length) {
      panel.append(node("p", "activity-empty", "Adopta un compañero en la tienda o gana a Aleta en la pesca."));
    }
    const cards = entries.map((entry) => {
      const card = node("article", "activity-card");
      if (entry.art) {
        const art = node("img", "pixel activity-pet");
        art.src = entry.art;
        art.alt = "";
        card.append(art);
      }
      const body = node("div", "activity-card-text");
      const title = node("h3", "", entry.name);
      const detail = node("p", "", entry.note);
      const progress = node("progress", "activity-meter");
      progress.setAttribute("aria-label", "Progreso de " + entry.name);
      progress.max = quests ? entry.target : economy.evolutionGoal(entry);
      const amount = node("span", "activity-amount");
      const submit = button(quests ? "Cobrar" : "Evolucionar", async () => {
        if (saving) return;
        saving = true;
        refresh(state);
        try {
          const result = await (quests ? onClaim(entry.id) : onEvolve(entry.id));
          if (result.changed) {
            setNotice(quests ? "+" + number.format(result.amount) + " chispas por «" + entry.name + "»." : result.message);
          }
        } finally {
          saving = false;
          refresh(state);
        }
      });
      body.append(title, detail, progress, amount);
      card.append(body, submit);
      panel.append(card);
      return { entry, card, progress, amount, submit };
    });

    return () => {
      for (const { entry, card, progress, amount, submit } of cards) {
        const claimed = quests ? state.claimed.includes(entry.id) : state.evolved.includes(entry.id);
        const value = quests ? economy.questProgress(state, entry) : state.experience[entry.id] || 0;
        const display = number.format(Math.min(value, progress.max)) + " / " + number.format(progress.max);
        progress.value = claimed ? progress.max : Math.min(value, progress.max);
        amount.textContent = quests
          ? display + "   ·   +" + number.format(entry.reward) + " chispas"
          : display + " XP   ·   +" + number.format(economy.petRate(state, entry)) + " chispas/s";
        submit.textContent = claimed ? (quests ? "Cobrado" : "Evolucionado") : (quests ? "Cobrar" : "Evolucionar");
        submit.setAttribute("aria-label", submit.textContent + ": " + entry.name);
        submit.disabled = claimed || value < progress.max || saving;
        card.toggleAttribute("data-evolved", !quests && claimed);
      }
    };
  }

  function buildGame() {
    const game = economy.games[state.area];
    const heading = node("h3", "activity-game-name", game.name);
    const instructions = node("p", "activity-description", game.note);
    gameRecord = node("p", "activity-record");
    gameClock = node("span", "");
    gameScore = node("span", "");
    const stats = node("div", "activity-score");
    stats.append(gameClock, gameScore);
    board = node("div", "activity-stage");
    board.dataset.game = state.area;
    playButton = button("Jugar ronda", startGame);
    const footer = node("div", "activity-game-footer");
    footer.append(playButton, stats);
    panel.append(heading, instructions, gameRecord, board, footer);

    if (state.area === "clearing") {
      const grid = node("div", "firefly-grid");
      grid.setAttribute("aria-label", "Casillas de luciérnagas, teclas 1 a 9");
      cells = Array.from({ length: 9 }, (_, index) => {
        const cell = button(String(index + 1), () => catchLight(index), "firefly-cell");
        cell.setAttribute("aria-label", "Casilla " + (index + 1));
        grid.append(cell);
        return cell;
      });
      board.append(grid);
    } else if (state.area === "summit") {
      const pond = node("div", "ice-pond");
      pond.setAttribute("aria-hidden", "true");
      const bobber = node("span", "ice-bobber");
      pond.append(bobber);
      signal = node("p", "activity-signal", "Prepara el sedal");
      signal.setAttribute("role", "status");
      gameButton = button("Recoger sedal", pullLine);
      board.append(pond, signal, gameButton);
    } else {
      forgeTrack = node("div", "forge-track");
      targetBand = node("span", "forge-target");
      marker = node("span", "forge-marker");
      forgeTrack.append(targetBand, marker);
      signal = node("p", "activity-signal", "Seis golpes");
      gameButton = button("Golpear", hitForge);
      board.append(forgeTrack, signal, gameButton);
    }

    drawGame();
    return () => {
      const best = state.records[state.area] || 0;
      const prize = state.area === "summit" && !state.owned.includes("aleta") ? " Pesca los cuatro peces para conseguir a Aleta." : "";
      gameRecord.textContent = "Récord: " + best + ". " + game.reward + " chispas por acierto." + prize;
      playButton.disabled = Boolean(run) || saving;
    };
  }

  function drawGame(now = performance.now()) {
    if (activeTab !== "games" || !board) return;
    const area = board.dataset.game;
    if (area === "clearing") {
      cells.forEach((cell, index) => {
        const lit = run?.target === index;
        if (cell.hasAttribute("data-lit") !== lit) {
          cell.toggleAttribute("data-lit", lit);
          cell.setAttribute("aria-label", "Casilla " + (index + 1) + (lit ? ", luciérnaga" : ""));
        }
        if (cell.disabled !== !run) cell.disabled = !run;
      });
    } else {
      if (gameButton.disabled !== !run) gameButton.disabled = !run;
      if (area === "summit") {
        const phase = run?.phase || "idle";
        if (board.dataset.phase !== phase) board.dataset.phase = phase;
      } else if (!run) {
        forgeTrack.removeAttribute("data-hit-window");
      }
    }
    const score = run ? "Aciertos: " + run.score : "";
    const clock = run?.ends ? Math.max(0, Math.ceil((run.ends - now) / 1000)) + " s" : "";
    if (gameScore.textContent !== score) gameScore.textContent = score;
    if (gameClock.textContent !== clock) gameClock.textContent = clock;
  }

  function startGame() {
    if (run || saving) return;
    const now = performance.now();
    const area = state.area;
    run = { area, generation: state.generation, score: 0, round: 0, started: now };
    setNotice("");
    if (area === "clearing") {
      run.ends = now + 12000;
      nextLight(now);
    } else if (area === "summit") {
      castLine(now);
    } else {
      run.ends = now + 18000;
      run.lastHit = -Infinity;
      prepareForge();
    }
    refresh(state);
    drawGame(now);
    if (area === "clearing") cells[0].focus({ preventScroll: true });
    else gameButton.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }

  function nextLight(now) {
    const change = 1 + Math.floor(Math.random() * 8);
    run.target = ((run.target ?? -1) + change) % 9;
    run.next = now + 1150;
  }

  function catchLight(index) {
    const now = performance.now();
    if (run?.area !== "clearing" || now >= run.ends || index !== run.target) return;
    run.score += 1;
    if (run.score === economy.games.clearing.max) finish();
    else {
      nextLight(now);
      drawGame(now);
    }
  }

  function castLine(now) {
    run.phase = "waiting";
    run.next = now + 850 + Math.random() * 1250;
    signal.textContent = "Intento " + (run.round + 1) + " de 4 · Espera a que pique";
  }

  function pullLine() {
    if (run?.area !== "summit" || run.phase === "pause") return;
    const now = performance.now();
    const caught = run.phase === "bite" && now < run.next;
    if (caught) run.score += 1;
    nextCast(caught ? "¡Pez atrapado!" : run.phase === "waiting" ? "Demasiado pronto." : "El pez ha escapado.", now);
  }

  function nextCast(message, now) {
    signal.textContent = message;
    run.round += 1;
    run.phase = "pause";
    run.next = now + 700;
    drawGame(now);
  }

  function prepareForge() {
    targetBand.style.setProperty("--target", forgeTargets[run.round] * 100 + "%");
    signal.textContent = "Golpe " + (run.round + 1) + " de 6";
  }

  function forgePosition(now) {
    const fraction = ((now - run.started) / 1300) % 2;
    return fraction <= 1 ? fraction : 2 - fraction;
  }

  function hitForge() {
    const now = performance.now();
    if (run?.area !== "cave" || now >= run.ends || now - run.lastHit < 260) return;
    run.lastHit = now;
    const hit = Math.abs(forgePosition(now) - forgeTargets[run.round]) <= .095;
    if (hit) run.score += 1;
    run.round += 1;
    setNotice(hit ? "¡Golpe preciso!" : "El golpe cayó fuera de la zona.");
    if (run.round === forgeTargets.length) finish();
    else {
      prepareForge();
      drawGame(now);
    }
  }

  function tick(now) {
    if (!run) return;
    if (run.ends && now >= run.ends) {
      finish();
      return;
    }
    if (run.area === "clearing" && now >= run.next) nextLight(now);
    if (run.area === "summit" && now >= run.next) {
      if (run.phase === "waiting") {
        run.phase = "bite";
        run.next = now + 1050;
        signal.textContent = "¡Ahora! Recoge el sedal";
      } else if (run.phase === "bite") {
        nextCast("El pez ha escapado.", now);
      } else if (run.round >= 4) {
        finish();
        return;
      } else {
        castLine(now);
      }
    }
    if (run.area === "cave") {
      const position = forgePosition(now);
      marker.style.setProperty("--marker", position * 100 + "%");
      forgeTrack.toggleAttribute("data-hit-window", Math.abs(position - forgeTargets[run.round]) <= .095);
    }
    drawGame(now);
    frame = requestAnimationFrame(tick);
  }

  function clearRun() {
    cancelAnimationFrame(frame);
    run = null;
    drawGame();
  }

  async function finish() {
    if (!run) return;
    const { area, score, generation } = run;
    clearRun();
    saving = true;
    refresh(state);
    try {
      const result = await onFinish(area, score, generation);
      if (!result.ignored && dialog.open) {
        const bonus = result.prize ? " ¡Aleta se une a tus compañeros!" : result.record ? " Nuevo récord." : "";
        setNotice("Ronda terminada. " + score + " aciertos. +" + number.format(result.amount) + " chispas." + bonus);
      }
    } finally {
      saving = false;
      refresh(state);
      if (dialog.open) playButton.focus({ preventScroll: true });
    }
  }

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      setNotice("");
      refresh(state);
    });
  }

  dialog.addEventListener("keydown", (event) => {
    if (run?.area !== "clearing" || !/^[1-9]$/.test(event.key) || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    catchLight(Number(event.key) - 1);
  });
  trigger.addEventListener("click", () => {
    onOpen();
    dialog.showModal();
    boardKey = null;
    setNotice("");
    refresh(state);
  });
  dialog.addEventListener("close", () => {
    clearRun();
    trigger.focus({ preventScroll: true });
    onClose();
  });

  return { dialog, refresh };
}

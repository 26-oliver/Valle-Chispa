"use strict";

function createValleActivities({ onOpen, onClose, onFinish, onClaim, onEvolve }) {
  const economy = ValleEconomy;
  const number = new Intl.NumberFormat("es-ES");
  const dialog = document.querySelector("#activities");
  const trigger = document.querySelector("#open-activities");
  const tabs = [...dialog.querySelectorAll(".activity-tab")];
  const panel = dialog.querySelector(".activity-panel");
  const notice = dialog.querySelector(".activity-notice");
  const timingTargets = [.41, .71, .52, .28, .63, .45];
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
    board.dataset.game = game.kind;
    playButton = button("Jugar ronda", startGame);
    const footer = node("div", "activity-game-footer");
    footer.append(playButton, stats);
    panel.append(heading, instructions, gameRecord, board, footer);

    if (game.kind === "grid") {
      const grid = node("div", "firefly-grid");
      grid.setAttribute("aria-label", "Casillas del minijuego, teclas 1 a 9");
      cells = Array.from({ length: 9 }, (_, index) => {
        const cell = button(String(index + 1), () => catchLight(index), "firefly-cell");
        cell.setAttribute("aria-label", "Casilla " + (index + 1));
        grid.append(cell);
        return cell;
      });
      board.append(grid);
    } else if (game.kind === "reaction") {
      const pond = node("div", "ice-pond");
      pond.setAttribute("aria-hidden", "true");
      const bobber = node("span", "ice-bobber");
      pond.append(bobber);
      signal = node("p", "activity-signal", game.wait);
      signal.setAttribute("role", "status");
      gameButton = button(game.action, react);
      board.append(pond, signal, gameButton);
    } else {
      forgeTrack = node("div", "forge-track");
      targetBand = node("span", "forge-target");
      marker = node("span", "forge-marker");
      forgeTrack.append(targetBand, marker);
      signal = node("p", "activity-signal", "Seis intentos");
      gameButton = button(game.action, hitForge);
      board.append(forgeTrack, signal, gameButton);
    }

    drawGame();
    return () => {
      const best = state.records[state.area] || 0;
      const prize = state.area === "summit" && !state.owned.includes("aleta") ? " Pesca los cuatro peces para conseguir a Aleta." : "";
      gameRecord.textContent = "Récord: " + best + ". " + number.format(game.reward) + " chispas por acierto." + prize;
      playButton.disabled = Boolean(run) || saving;
    };
  }

  function drawGame(now = performance.now()) {
    if (activeTab !== "games" || !board) return;
    const kind = board.dataset.game;
    if (kind === "grid") {
      cells.forEach((cell, index) => {
        const lit = run?.target === index;
        if (cell.hasAttribute("data-lit") !== lit) {
          cell.toggleAttribute("data-lit", lit);
          cell.setAttribute("aria-label", "Casilla " + (index + 1) + (lit ? ", iluminada" : ""));
        }
        if (cell.disabled !== !run) cell.disabled = !run;
      });
    } else {
      if (gameButton.disabled !== !run) gameButton.disabled = !run;
      if (kind === "reaction") {
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
    const game = economy.games[area];
    run = { area, game, generation: state.generation, score: 0, round: 0, started: now };
    if (game.duration) run.ends = now + game.duration;
    setNotice("");
    if (game.kind === "grid") {
      nextLight(now);
    } else if (game.kind === "reaction") {
      beginAttempt(now);
    } else {
      run.lastHit = -Infinity;
      prepareForge();
    }
    refresh(state);
    drawGame(now);
    if (game.kind === "grid") cells[0].focus({ preventScroll: true });
    else gameButton.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }

  function nextLight(now) {
    const change = 1 + Math.floor(Math.random() * 8);
    run.target = ((run.target ?? -1) + change) % 9;
    run.next = now + run.game.interval;
  }

  function catchLight(index) {
    const now = performance.now();
    if (run?.game.kind !== "grid" || now >= run.ends || index !== run.target) return;
    run.score += 1;
    if (run.score === run.game.max) finish();
    else {
      nextLight(now);
      drawGame(now);
    }
  }

  function beginAttempt(now) {
    run.phase = "waiting";
    run.next = now + 850 + Math.random() * 1250;
    signal.textContent = "Intento " + (run.round + 1) + " de " + run.game.max + ". " + run.game.wait;
  }

  function react() {
    if (run?.game.kind !== "reaction" || run.phase === "pause") return;
    const now = performance.now();
    const caught = run.phase === "bite" && now < run.next;
    if (caught) run.score += 1;
    endAttempt(caught ? run.game.hit : run.phase === "waiting" ? "Demasiado pronto." : run.game.miss, now);
  }

  function endAttempt(message, now) {
    signal.textContent = message;
    run.round += 1;
    run.phase = "pause";
    run.next = now + 700;
    drawGame(now);
  }

  function prepareForge() {
    targetBand.style.setProperty("--target", timingTargets[run.round] * 100 + "%");
    targetBand.style.setProperty("--target-width", run.game.tolerance * 200 + "%");
    signal.textContent = run.game.step + " " + (run.round + 1) + " de " + run.game.max;
  }

  function forgePosition(now) {
    const fraction = ((now - run.started) / run.game.speed) % 2;
    return fraction <= 1 ? fraction : 2 - fraction;
  }

  function hitForge() {
    const now = performance.now();
    if (run?.game.kind !== "timing" || now >= run.ends || now - run.lastHit < 260) return;
    run.lastHit = now;
    const hit = Math.abs(forgePosition(now) - timingTargets[run.round]) <= run.game.tolerance;
    if (hit) run.score += 1;
    run.round += 1;
    setNotice(hit ? "¡Buen ritmo!" : "El marcador estaba fuera de la zona.");
    if (run.round === timingTargets.length) finish();
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
    if (run.game.kind === "grid" && now >= run.next) nextLight(now);
    if (run.game.kind === "reaction" && now >= run.next) {
      if (run.phase === "waiting") {
        run.phase = "bite";
        run.next = now + run.game.window;
        signal.textContent = run.game.ready;
      } else if (run.phase === "bite") {
        endAttempt(run.game.miss, now);
      } else if (run.round >= run.game.max) {
        finish();
        return;
      } else {
        beginAttempt(now);
      }
    }
    if (run.game.kind === "timing") {
      const position = forgePosition(now);
      marker.style.setProperty("--marker", position * 100 + "%");
      forgeTrack.toggleAttribute("data-hit-window", Math.abs(position - timingTargets[run.round]) <= run.game.tolerance);
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
    if (run?.game.kind !== "grid" || !/^[1-9]$/.test(event.key) || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
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

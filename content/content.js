(function () {
  if (window.__autoViewScrollLoaded) {
    return;
  }

  window.__autoViewScrollLoaded = true;

  const root = document.createElement("div");
  root.id = "auto-view-scroll-root";
  document.documentElement.appendChild(root);

  const shadow = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }

    .auto-view-shell {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      gap: 10px;
      user-select: none;
    }

    .auto-view-speeds {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 999px;
      background: rgba(23, 23, 23, 0.84);
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
      opacity: 0;
      transform: translateX(8px);
      pointer-events: none;
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .auto-view-shell:hover .auto-view-speeds,
    .auto-view-speeds[data-open="true"] {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .auto-view-speed {
      width: 14px;
      height: 14px;
      border: 0;
      border-radius: 999px;
      padding: 0;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.42);
      transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    }

    .auto-view-speed:hover {
      transform: scale(1.16);
      background: rgba(255, 255, 255, 0.72);
    }

    .auto-view-speed[data-active="true"] {
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
    }

    .auto-view-speed[data-speed="slow"] {
      width: 10px;
      height: 10px;
    }

    .auto-view-speed[data-speed="medium"] {
      width: 14px;
      height: 14px;
    }

    .auto-view-speed[data-speed="fast"] {
      width: 18px;
      height: 18px;
    }

    .auto-view-toggle {
      width: 54px;
      height: 54px;
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      display: grid;
      place-items: center;
      color: #ffffff;
      background: linear-gradient(135deg, #ff7a18, #ffb347);
      box-shadow: 0 14px 32px rgba(255, 122, 24, 0.34);
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
    }

    .auto-view-toggle:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 18px 36px rgba(255, 122, 24, 0.4);
    }

    .auto-view-toggle[data-running="true"] {
      background: linear-gradient(135deg, #ff4d4f, #ff8a65);
      box-shadow: 0 14px 32px rgba(255, 77, 79, 0.34);
    }

    .auto-view-icon {
      width: 22px;
      height: 22px;
      position: relative;
    }

    .auto-view-icon::before,
    .auto-view-icon::after {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      background: currentColor;
      border-radius: 999px;
    }

    .auto-view-icon::before {
      top: 1px;
      width: 4px;
      height: 14px;
    }

    .auto-view-icon::after {
      bottom: 0;
      width: 14px;
      height: 4px;
    }

    .auto-view-toggle[data-running="true"] .auto-view-icon::before {
      top: 2px;
      width: 4px;
      height: 18px;
    }

    .auto-view-toggle[data-running="true"] .auto-view-icon::after {
      display: none;
    }

    .auto-view-status {
      position: absolute;
      right: 0;
      bottom: 68px;
      max-width: 180px;
      padding: 6px 10px;
      border-radius: 12px;
      background: rgba(23, 23, 23, 0.84);
      color: #ffffff;
      font-size: 12px;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(6px);
      pointer-events: none;
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .auto-view-status[data-visible="true"] {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const container = document.createElement("div");
  container.className = "auto-view-shell";
  container.innerHTML = `
    <div class="auto-view-speeds" aria-label="Scroll speed options">
      <button class="auto-view-speed" data-speed="slow" aria-label="Slow speed" title="Slow"></button>
      <button class="auto-view-speed" data-speed="medium" aria-label="Medium speed" title="Medium"></button>
      <button class="auto-view-speed" data-speed="fast" aria-label="Fast speed" title="Fast"></button>
    </div>
    <button class="auto-view-toggle" type="button" aria-label="Toggle auto scroll" title="Toggle auto scroll">
      <span class="auto-view-icon" aria-hidden="true"></span>
    </button>
    <div class="auto-view-status" aria-live="polite"></div>
  `;

  shadow.append(style, container);

  const toggle = container.querySelector(".auto-view-toggle");
  const speedPanel = container.querySelector(".auto-view-speeds");
  const speedButtons = Array.from(container.querySelectorAll(".auto-view-speed"));
  const status = container.querySelector(".auto-view-status");

  const speeds = {
    slow: 1.5,
    medium: 3,
    fast: 5
  };

  const state = {
    isRunning: false,
    currentSpeed: "medium",
    rafId: 0,
    lastFrameTime: 0,
    statusTimer: 0
  };

  function showStatus(message) {
    status.textContent = message;
    status.dataset.visible = "true";
    window.clearTimeout(state.statusTimer);
    state.statusTimer = window.setTimeout(() => {
      status.dataset.visible = "false";
    }, 1400);
  }

  function updateSpeedButtons() {
    speedButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.speed === state.currentSpeed);
    });
  }

  function updateToggle() {
    toggle.dataset.running = String(state.isRunning);
    toggle.setAttribute(
      "aria-label",
      state.isRunning ? "Stop auto scroll" : "Start auto scroll"
    );
    toggle.title = state.isRunning ? "Stop auto scroll" : "Start auto scroll";
  }

  function getScrollLimit() {
    const scrollingElement = document.scrollingElement || document.documentElement;
    return Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
  }

  function stopAutoScroll(reason) {
    if (!state.isRunning && !state.rafId) {
      return;
    }

    state.isRunning = false;
    state.lastFrameTime = 0;
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
    updateToggle();
    if (reason) {
      showStatus(reason);
    }
  }

  function tick(timestamp) {
    if (!state.isRunning) {
      return;
    }

    if (!state.lastFrameTime) {
      state.lastFrameTime = timestamp;
    }

    const delta = timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;
    const nextY = window.scrollY + speeds[state.currentSpeed] * (delta / 16.67);
    const limit = getScrollLimit();

    window.scrollTo({
      top: Math.min(nextY, limit),
      behavior: "auto"
    });

    if (window.scrollY >= limit - 1) {
      stopAutoScroll("Reached page bottom");
      return;
    }

    state.rafId = window.requestAnimationFrame(tick);
  }

  function startAutoScroll() {
    if (state.isRunning) {
      return;
    }

    if (getScrollLimit() <= window.scrollY + 1) {
      showStatus("Already at page bottom");
      return;
    }

    state.isRunning = true;
    state.lastFrameTime = 0;
    updateToggle();
    showStatus(`Auto scroll: ${state.currentSpeed}`);
    state.rafId = window.requestAnimationFrame(tick);
  }

  toggle.addEventListener("click", () => {
    if (state.isRunning) {
      stopAutoScroll("Auto scroll stopped");
      return;
    }

    startAutoScroll();
  });

  speedButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.currentSpeed = button.dataset.speed;
      updateSpeedButtons();
      speedPanel.dataset.open = "true";
      showStatus(`Speed: ${state.currentSpeed}`);
    });
  });

  container.addEventListener("mouseenter", () => {
    speedPanel.dataset.open = "true";
  });

  container.addEventListener("mouseleave", () => {
    speedPanel.dataset.open = "false";
  });

  window.addEventListener("beforeunload", () => {
    stopAutoScroll("");
  });

  updateSpeedButtons();
  updateToggle();
  showStatus("Auto scroll ready");
})();


const slider = document.getElementById("limitSlider");
const sliderValue = document.getElementById("sliderValue");
const limitLabel = document.getElementById("limitLabel");
const watchedLabel = document.getElementById("watched");
const progress = document.getElementById("progress");
const remaining = document.getElementById("remaining");
const overlay = document.getElementById("ghostOverlay");
const watchButton = document.getElementById("watchButton");
const resetButton = document.getElementById("resetButton");
const escapeButton = document.getElementById("escapeButton");

let watched = 0;
let limit = Number(slider.value);
let haunted = false;

function updateDisplay() {
  watchedLabel.textContent = watched;
  limitLabel.textContent = limit;
  sliderValue.textContent = limit;

  const percent = Math.min(100, (watched / limit) * 100);
  progress.style.width = `${percent}%`;

  if (watched >= limit) {
    remaining.textContent = "The ghost has claimed your feed.";
    remaining.style.color = "#ff6c6c";
    watchButton.disabled = true;
    watchButton.textContent = "The ghost has stopped your scroll";
    watchButton.style.opacity = "0.6";
    showGhost();
  } else {
    remaining.textContent = `${limit - watched} videos left before the curse.`;
    remaining.style.color = "#ffbd8f";
    watchButton.disabled = false;
    watchButton.innerHTML = "<span>＋</span> Simulate watching a video";
    watchButton.style.opacity = "1";
  }
}

function showGhost() {
  if (haunted) return;

  haunted = true;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Put keyboard focus on the action so the dialog is accessible.
  escapeButton.focus({ preventScroll: true });
}

function hideGhost() {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

slider.addEventListener("input", () => {
  limit = Number(slider.value);
  updateDisplay();
});

watchButton.addEventListener("click", () => {
  if (watched >= limit) {
    showGhost();
    return;
  }

  watched++;
  updateDisplay();
});

resetButton.addEventListener("click", () => {
  watched = 0;
  haunted = false;
  hideGhost();
  updateDisplay();
});

escapeButton.addEventListener("click", () => {
  hideGhost();
  // Do not reset watched or change the selected limit.
  haunted = false;
  updateDisplay();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && overlay.classList.contains("active")) {
    hideGhost();
    haunted = false;
    updateDisplay();
  }
});

updateDisplay();

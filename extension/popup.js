
const $ = (id) => document.getElementById(id);
let saveTimer;

function send(type, data = {}) {
  chrome.runtime.sendMessage({ type, ...data }, (response) => {
    if (chrome.runtime.lastError) {
      $("message").textContent = "Reopen the extension and try again.";
      return;
    }

    if (response?.ok) render(response);
  });
}

function render(status) {
  $("count").textContent = status.watched;
  $("limitValue").textContent = status.limit;
  $("chosen").textContent = status.limit;
  $("limit").value = status.limit;

  $("progress").style.width =
    `${Math.min(100, status.watched / status.limit * 100)}%`;

  $("message").textContent = status.locked
    ? "The ghost has claimed your feed!"
    : `${Math.max(0, status.limit - status.watched)} videos left before the curse.`;
}

$("limit").addEventListener("input", () => {
  const value = Number($("limit").value);
  $("chosen").textContent = value;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    send("SET_LIMIT", { limit: value });
  }, 300);
});

$("reset").addEventListener("click", () => {
  send("RESET_COUNTER");
});

send("GET_STATUS");

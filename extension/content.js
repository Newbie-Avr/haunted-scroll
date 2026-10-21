
(() => {
  if (window.__hauntedScrollInstalled) return;
  window.__hauntedScrollInstalled = true;

  let lastId = "";
  let overlay = null;
  const seen = new Set();

  function videoId() {
    const p = location.pathname;
    const yt = p.match(/^\/shorts\/([^/?#]+)/);
    if (yt) return `youtube:${yt[1]}`;

    const ig = p.match(/^\/(?:reel|reels)\/([^/?#]+)/);
    if (ig) return `instagram:${ig[1]}`;

    return "";
  }

  function send(type, data, callback) {
    chrome.runtime.sendMessage({ type, ...data }, response => {
      if (!chrome.runtime.lastError) callback?.(response);
    });
  }

  function openActivity(activity) {
    send("OPEN_ACTIVITY", { activity }, result => {
      if (!result?.ok) return;
      // Keep the overlay visible on the original feed tab.
    });
  }

  function showGhost(s) {
    if (!s?.locked) {
      overlay?.remove();
      overlay = null;
      return;
    }

    if (overlay?.isConnected) return;

    overlay = document.createElement("div");
    overlay.id = "haunted-scroll-overlay";
    Object.assign(overlay.style, {
      position: "fixed", inset: "0", zIndex: "2147483647",
      overflowY: "auto", display: "flex", justifyContent: "center",
      padding: "22px 14px", boxSizing: "border-box",
      background: "radial-gradient(circle at top,#492052,#08050d 70%)",
      color: "#fff4ff", font: "14px system-ui,sans-serif",
      textAlign: "center"
    });

    overlay.innerHTML = `
      <style>
        #haunted-scroll-overlay * { box-sizing: border-box; }
        #haunted-scroll-overlay .box {
          width: min(620px,100%); margin: auto;
          padding: 24px 18px; border: 1px solid #a879ff45;
          border-radius: 24px; background: #100a19eF;
          box-shadow: 0 0 70px #8d45c52b;
          animation: hs-in .65s ease-out both;
        }
        #haunted-scroll-overlay .ghost {
          font-size: 76px; animation: hs-float 2s ease-in-out infinite;
          filter: drop-shadow(0 0 18px #b990ff);
        }
        #haunted-scroll-overlay h1 {
          margin: 8px 0; color: #ff843e;
          font-size: clamp(34px,7vw,54px);
        }
        #haunted-scroll-overlay .muted { color: #c6b6d2; line-height: 1.7; }
        #haunted-scroll-overlay .grid {
          display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 9px; margin-top: 20px;
        }
        #haunted-scroll-overlay button {
          border: 1px solid #a879ff4c; border-radius: 13px;
          padding: 13px 10px; background: #21132b;
          color: #fff4ff; cursor: pointer; text-align: left;
        }
        #haunted-scroll-overlay button:hover {
          border-color: #ff843e; background: #3a1c35;
        }
        #haunted-scroll-overlay button strong {
          display: block; margin-bottom: 5px;
        }
        #haunted-scroll-overlay button small {
          display: block; color: #c1b1cf; line-height: 1.5;
        }
        #haunted-scroll-overlay .note {
          margin-top: 20px; color: #bfa1ed;
          font-size: 10px; letter-spacing: 1.5px;
        }
        @keyframes hs-in {
          from { opacity: 0; transform: scale(1.04) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes hs-float {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @media(max-width:400px) {
          #haunted-scroll-overlay .grid { grid-template-columns: 1fr; }
        }
        @media(prefers-reduced-motion:reduce) {
          #haunted-scroll-overlay * { animation: none !important; }
        }
      </style>
      <div class="box">
        <div style="color:#ff995b;font-size:10px;letter-spacing:3px;font-weight:900">
          THE GHOST HAS CAUGHT YOU
        </div>
        <div class="ghost" aria-hidden="true">👻</div>
        <h1>BOO! THAT'S ENOUGH!</h1>
        <p class="muted">
          You've reached your daily limit.<br>
          Choose your next quest instead of scrolling.
        </p>
        <p class="muted" id="hs-count"></p>
        <div style="color:#ffbd8f;font-size:10px;letter-spacing:2px;font-weight:900;margin-top:22px">
          CHOOSE YOUR NEXT QUEST
        </div>
        <div class="grid">
          <button data-activity="study"><strong>📚 Study</strong><small>Open Khan Academy</small></button>
          <button data-activity="read"><strong>📖 Read</strong><small>Explore free books</small></button>
          <button data-activity="exercise"><strong>🌿 Exercise</strong><small>Move and stretch</small></button>
          <button data-activity="journal"><strong>✍️ Journal</strong><small>Write down your thoughts</small></button>
          <button data-activity="mindful"><strong>🌙 Mindful break</strong><small>Pause and reset</small></button>
          <button data-activity="learn"><strong>🧠 Learn coding</strong><small>Practise a new skill</small></button>
        </div>
        <p class="note">YOUR NEXT TREAT UNLOCKS TOMORROW</p>
        <p class="muted" style="font-size:11px">
          Choosing an activity opens a new tab. Your feed remains limited.
        </p>
      </div>
    `;

    overlay.querySelector("#hs-count").textContent =
      `Today's count: ${s.watched} / ${s.limit} videos`;

    overlay.querySelectorAll("[data-activity]").forEach(button => {
      button.addEventListener("click", () => {
        openActivity(button.dataset.activity);
      });
    });

    document.documentElement.appendChild(overlay);
  }

  function checkStatus() {
    send("GET_STATUS", {}, showGhost);
  }

  function scan() {
    const id = videoId();
    if (!id) {
      lastId = "";
      return;
    }
    if (id === lastId || seen.has(id)) return;

    lastId = id;
    seen.add(id);
    send("VIDEO_SEEN", { videoId: id }, showGhost);
  }

  scan();
  checkStatus();
  setInterval(scan, 1000);
  setInterval(checkStatus, 2500);

  new MutationObserver(scan).observe(document.documentElement, {
    childList: true, subtree: true
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" &&
        (changes.videoIds || changes.date || changes.dailyLimit)) {
      checkStatus();
    }
  });
})();

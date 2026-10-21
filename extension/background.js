
const DEFAULT_LIMIT = 15;
const MIN_LIMIT = 5;
const MAX_LIMIT = 100;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function getData() {
  const saved = await chrome.storage.local.get([
    "date", "videoIds", "dailyLimit"
  ]);

  const data = {
    date: today(),
    videoIds: saved.date === today() && Array.isArray(saved.videoIds)
      ? saved.videoIds : [],
    dailyLimit: Number.isInteger(saved.dailyLimit)
      ? Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, saved.dailyLimit))
      : DEFAULT_LIMIT
  };

  await chrome.storage.local.set(data);
  return data;
}

async function status() {
  const data = await getData();
  return {
    ok: true,
    watched: data.videoIds.length,
    limit: data.dailyLimit,
    locked: data.videoIds.length >= data.dailyLimit
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "GET_STATUS") {
      sendResponse(await status());
      return;
    }

    if (message.type === "SET_LIMIT") {
      const limit = Number(message.limit);
      if (!Number.isInteger(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
        sendResponse({ ok: false, error: "Invalid limit." });
        return;
      }

      await chrome.storage.local.set({ dailyLimit: limit });
      sendResponse(await status());
      return;
    }

    if (message.type === "RESET_COUNTER") {
      await chrome.storage.local.set({
        date: today(),
        videoIds: []
      });
      sendResponse(await status());
      return;
    }

    if (message.type === "VIDEO_SEEN") {
      const url = sender.tab?.url || "";
      const supported =
        /^https:\/\/(www\.)?youtube\.com\/shorts\/[^/?#]+/.test(url) ||
        /^https:\/\/(www\.)?instagram\.com\/(reel|reels)\/[^/?#]+/.test(url);

      const id = String(message.videoId || "");
      if (!supported || !id || id.length > 200) {
        sendResponse({ ok: false, ...(await status()) });
        return;
      }

      const data = await getData();

      if (!data.videoIds.includes(id)) {
        data.videoIds.push(id);
        await chrome.storage.local.set({ videoIds: data.videoIds });
      }

      sendResponse(await status());
      return;
    }

    if (message.type === "OPEN_ACTIVITY") {
      const destinations = {
        study: "https://www.khanacademy.org/",
        read: "https://www.gutenberg.org/",
        exercise: "https://www.nhs.uk/live-well/exercise/",
        journal: "https://keep.google.com/",
        mindful: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/",
        learn: "https://www.freecodecamp.org/"
      };

      const url = destinations[message.activity];
      if (!url) {
        sendResponse({ ok: false, error: "Unknown activity." });
        return;
      }

      await chrome.tabs.create({ url, active: true });
      sendResponse({ ok: true });
    }
  })().catch(error => {
    sendResponse({ ok: false, error: error.message });
  });

  return true;
});

console.log("Haunted Scroll is ready.");

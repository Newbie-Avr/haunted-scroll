[README.md](https://github.com/user-attachments/files/33748920/README.md)
# Haunted Scroll

Haunted Scroll is a small Chrome extension that helps users set a daily limit for YouTube Shorts and Instagram Reels. When the limit is reached, it displays a themed screen with suggestions for other activities.

## Features

- Set a daily limit from 5 to 100 videos.
- Count unique Shorts/Reels video IDs detected during the day.
- Store the daily count and limit with Chrome local storage.
- Show an overlay when the selected limit is reached.
- Offer links to study, reading, exercise, journaling, and coding activities.
- Includes `index.html` as a separate demo page; its counter is not connected to the extension.

## Install in Chrome

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the project folder containing `manifest.json`.
6. Open YouTube Shorts or Instagram Reels and test the extension.

## Files

- `manifest.json` — extension configuration.
- `background.js` — daily counter, settings, and activity links.
- `content.js` — detects supported video pages and displays the limit screen.
- `popup.html` and `popup.js` — extension popup and controls.
- `index.html`, `style.css`, and `script.js` — standalone demo website.

## Important limitations

- The counter tracks **unique video IDs detected by the extension**, not verified watch time or completed views. A video can count even if you do not watch it fully.
- The website demo has its own separate counter and does not control the extension.
- This is a personal project/prototype. Test it after YouTube or Instagram interface changes.

## Privacy

The extension stores its counter and daily limit in Chrome local storage. It does not include a server or analytics code. It runs on YouTube and Instagram pages to detect supported video URLs.

# MegaGameBox — Game Developer Guide
# Last Updated: May 2026
# Purpose: Guidelines, requirements, and constraints for publishing games on the MegaGameBox platform.

---

MegaGameBox is an offline-first, mobile arcade platform built with Flutter. Games are downloaded directly to the user's device and run entirely locally within an embedded, high-performance WebView. 

Because games are executed offline and embedded directly into the mobile app, developers must adhere to strict architectural and structural guidelines to ensure their games work flawlessly across all devices.

---

## 1. Supported Technologies & Frameworks

Your game must run entirely in a modern mobile browser without requiring any external plugins or active internet connection.

**✅ ALLOWED:**
*   **Core Web:** HTML5, CSS3, ES6+ JavaScript.
*   **Rendering:** Canvas 2D, WebGL (1.0 and 2.0), WebAssembly (Wasm).
*   **Frameworks/Engines (Exported to HTML5):**
    *   Phaser.js
    *   PixiJS
    *   Three.js / Babylon.js
    *   Construct 3
    *   Godot Engine (HTML5 export)
    *   Defold (HTML5 export)
    *   Unity (WebGL Export) — *Note: Must be heavily optimized for mobile and kept under 20MB.*

**❌ NOT ALLOWED:**
*   **Legacy Tech:** Adobe Flash, Java Applets, Silverlight.
*   **Server-Side Rendering:** Games built in PHP, Ruby, Node.js, Python, or ASP.NET that require a live server to render frames or calculate logic.
*   **Always-Online Games:** Games that crash or refuse to load if an external API (like a remote high-score server or multiplayer matchmaking) cannot be reached. MegaGameBox is an offline-first platform.

---

## 2. Directory Structure & Zipping

When uploading a game to the MegaGameBox platform, the game MUST be packaged as a `.zip` file.

**CRITICAL RULE: The `index.html` and `manifest.json` files MUST be located at the absolute root of the `.zip` file.**

If your game extracts into a subfolder (e.g., `my_game_v1/index.html`), the MegaGameBox extraction engine will fail to locate the entry point and the game will crash on launch.

**✅ Correct Structure (Inside the ZIP):**
```text
index.html          ← REQUIRED: Game entry point
manifest.json       ← REQUIRED: Game metadata (see Section 6)
thumbnail.png       ← RECOMMENDED: 512x512 game icon
screenshot_1.png    ← OPTIONAL: Screenshot for the game detail page
style.css
game.js
assets/
  ├── images/
  │   └── player.png
  └── sounds/
      └── jump.mp3
```

**❌ Incorrect Structure (Inside the ZIP):**
```text
my_awesome_game_folder/   <-- WRONG: Do not wrap the game in a parent folder!
  ├── index.html
  ├── manifest.json
  ├── style.css
  └── game.js
```

### Relative Paths Only
Because games are served via a local `localhost` server running directly on the user's phone (e.g., `http://localhost:8080/index.html`), **you must use relative paths for all assets.**

*   ✅ **DO:** `<img src="assets/player.png">` or `<script src="./game.js"></script>`
*   ❌ **DO NOT:** `<img src="/assets/player.png">` (Absolute paths will resolve to the root of the localhost server and fail to load).

---

## 3. UI, UX & Controls

MegaGameBox is a mobile application. Your game will be played on screens ranging from 4-inch phones to 12-inch tablets.

*   **Touch Controls are Mandatory:** Your game cannot rely solely on keyboard (WASD) or mouse clicks. You must implement on-screen touch controls, swipe gestures, or tap-to-move mechanics.
*   **Responsiveness:** Your `index.html` MUST include the proper mobile viewport meta tag to prevent scaling issues:
    `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
*   **CSS Resizing:** Your game canvas should dynamically resize via CSS to fit `100vw` and `100vh` without stretching or distorting the aspect ratio.
*   **Orientation:** You can design your game for Portrait, Landscape, or both. This must be declared in the game's `manifest.json` so the Flutter app can lock the screen orientation before the game launches.

---

## 4. The GameBridge API (Mandatory)

MegaGameBox injects a global JavaScript object called `window.GameBridge` into every game. Your game MUST communicate with this bridge to save scores, track playtime, and allow the user to exit.

### A. Starting a Session
As soon as your game's main menu finishes loading or the first level begins, you must call:
```javascript
if (window.GameBridge && typeof window.GameBridge.onGameStart === 'function') {
    window.GameBridge.onGameStart({ level: 1 });
}
```
*This starts the Flutter timer to track "Time Played" and logs the session.*

### B. Ending a Session / Saving a Score
When the player dies, wins, or completes a level, send the score data so the app can track it:
```javascript
if (window.GameBridge && typeof window.GameBridge.onGameEnd === 'function') {
    window.GameBridge.onGameEnd({
        score: 1500,               // Integer. The points earned. (Send 0 if game doesn't use points)
        level: 3,                  // Integer. The final level reached.
        timePlayedSeconds: 120,    // Integer. Total seconds alive.
        status: "game_over"        // String. Usually "game_over", "completed", or "quit".
    });
}
```
*This silently saves the score to the app's database. The WebView stays open — your game keeps running. You can show your own Game Over screen, replay button, or main menu. The user can play again without leaving the game. You can call `onGameEnd` multiple times (once per round).*

### C. Quitting Mid-Game
If your game has a "Main Menu" or "Quit" button, you can explicitly ask the Flutter app to close the WebView:
```javascript
if (window.GameBridge && typeof window.GameBridge.onQuit === 'function') {
    window.GameBridge.onQuit({});
}
```

### D. Audio Management (Crucial)
Users can globally mute the MegaGameBox app. Your game should respect this.
Whenever the user toggles the mute button inside the Flutter overlay, the app will execute a function inside your game called `window.setAudioMuted(isMuted)`. 

You MUST implement this function in your global scope to pause/resume your HTML5 Audio or Web Audio API contexts:
```javascript
window.setAudioMuted = function(isMuted) {
    if (isMuted) {
        // e.g., Howler.mute(true); or myAudioContext.suspend();
    } else {
        // e.g., Howler.mute(false); or myAudioContext.resume();
    }
};
```

---

## 5. Performance & File Size

*   **Target Size:** Aim for **under 15MB** zipped. The hard limit is **50MB**. Mobile users are sensitive to download times and storage limits.

    | Size | Verdict |
    |------|---------|
    | Under 5 MB | 🟢 Excellent — downloads instantly |
    | 5–15 MB | 🟢 Great — most HTML5 games fall here |
    | 15–30 MB | 🟡 Acceptable — games with lots of images/sounds |
    | 30–50 MB | 🟠 Heavy — only for complex engine exports (Godot, Unity) |
    | Over 50 MB | 🔴 Will be rejected |

*   **Audio Compression:** Use compressed `.mp3` or `.ogg` files. Never use uncompressed `.wav` files.
*   **Image Compression:** Optimize `.png` and `.jpg` spritesheets using tools like TinyPNG or TexturePacker.
*   **Garbage Collection:** Ensure your JavaScript loops are optimized. Heavy memory leaks will cause the mobile WebView to crash.

---

## 6. The `manifest.json` File (Required)

Every game zip **must** include a `manifest.json` file at the root level alongside `index.html`. This file tells the MegaGameBox platform everything it needs to know about your game — its name, category, settings, and more.

### Full Template

Copy and customize this for your game:

```json
{
  "id": "snake-classic",
  "name": "Snake Classic",
  "description": "A fun retro snake game where you eat food and grow longer. Don't hit the walls!",
  "category": "Arcade",
  "tags": ["retro", "snake", "classic"],
  "version": "1.0.0",
  "author": "YourName",
  "orientation": "portrait",
  "difficulty": "medium",
  "ageRating": "Everyone",
  "supportsScore": true,
  "supportsLevels": false,
  "maxLevel": 0,
  "hasAudio": false,
  "isPremium": false
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique game ID. **Lowercase letters, numbers, and hyphens only.** No spaces, no uppercase. Example: `"snake-classic"`, `"2048-puzzle"`, `"car-racing"` |
| `name` | string | ✅ Yes | Display name shown to users in the app. Example: `"Snake Classic"` |
| `description` | string | ✅ Yes | Short description shown on the game detail page. Aim for 20–200 characters. |
| `category` | string | ✅ Yes | Must be one of: `Arcade`, `Puzzle`, `Action`, `Strategy`, `Sports`, `Card`, `Racing`, `Adventure` |
| `version` | string | ✅ Yes | Semantic version. Example: `"1.0.0"` |
| `tags` | array | Recommended | List of search keywords. Example: `["retro", "snake"]` |
| `author` | string | Recommended | Developer or studio name. |
| `orientation` | string | Optional | `"portrait"` (default), `"landscape"`, or `"both"`. The app locks the screen to this before launching. |
| `difficulty` | string | Optional | `"easy"`, `"medium"` (default), or `"hard"`. Shown on the game detail page. |
| `ageRating` | string | Optional | `"Everyone"` (default), `"Teen"`, or `"Mature"`. |
| `supportsScore` | boolean | Optional | `true` if your game calls `GameBridge.onGameEnd()` with a score. Default: `false` |
| `supportsLevels` | boolean | Optional | `true` if your game has multiple levels. Default: `false` |
| `maxLevel` | integer | Optional | Total number of levels (if `supportsLevels` is true). Default: `0` |
| `hasAudio` | boolean | Optional | `true` if the game plays any sounds. Default: `false` |
| `isPremium` | boolean | Optional | `true` to restrict this game to premium subscribers only. Default: `false` |

### Rules
- The `id` field is permanent. Once a game is uploaded with an ID, uploading again with the same ID will **update** the existing game.
- The `id` must match the pattern `^[a-z0-9-]+$` — only lowercase letters, digits, and hyphens.
- If you set `supportsScore: true`, your game **must** call `GameBridge.onGameEnd()` with a valid score value.
- If you set `hasAudio: true`, your game **must** implement `window.setAudioMuted()` (see Section 4D).

---

## 7. Thumbnail & Screenshots

### Thumbnail (Recommended)
Place a square image named `thumbnail.png` (or `thumbnail.jpg`, `thumb.png`, `icon.png`) at the root of your zip file alongside `index.html`.

*   **Size:** 512×512 pixels recommended.
*   **File size:** Keep under 500 KB. Compress with TinyPNG if needed.
*   **What it's used for:** The game card in the home screen, category lists, and search results.

### Screenshots (Optional)
Place images named `screenshot_1.png`, `screenshot_2.png`, etc. (or `ss_1.png`, `screen_1.png`) at the root of your zip.

*   **Size:** Any resolution, but 16:9 aspect ratio (e.g., 1280×720) looks best.
*   **What it's used for:** The screenshot gallery on the game detail page.

---

## 8. Validation & Upload

Before uploading, you can validate your game bundle locally using the built-in CLI tool. This checks everything mentioned in this guide without uploading anything.

### Validate (no internet required):
```bash
dart run scripts/validate_game.dart --file path/to/your-game.zip
```

### Upload (requires API keys):
```bash
source .env.upload
dart run scripts/upload_game.dart --file path/to/your-game.zip
```

The upload script will automatically:
1. Validate the zip structure and manifest.
2. Compute a SHA256 checksum for integrity.
3. Upload the zip, thumbnail, and screenshots to Cloudflare R2 CDN.
4. Create/update the game entry in the Firebase Firestore database.
5. The game will appear in the app on the next refresh.

---

## 9. Quick Checklist for Developers

Before submitting your game, verify:

- [ ] `index.html` is at the **root** of the zip (not inside a subfolder)
- [ ] `manifest.json` is at the **root** with all required fields filled
- [ ] Game ID is lowercase with hyphens only (e.g., `my-cool-game`)
- [ ] Category is one of the 8 allowed values
- [ ] Game uses **touch controls** (not keyboard-only)
- [ ] `<meta name="viewport" ...>` tag is in `index.html`
- [ ] All asset paths are **relative** (no `/` prefix, no `http://`)
- [ ] `GameBridge.onGameStart()` is called when the game begins
- [ ] `GameBridge.onGameEnd()` is called with score when the game ends
- [ ] If `hasAudio: true`, `window.setAudioMuted()` is implemented
- [ ] Thumbnail is 512×512, under 500 KB
- [ ] Total zip size is under 50 MB (ideally under 15 MB)
- [ ] `dart run scripts/validate_game.dart --file your-game.zip` passes ✅
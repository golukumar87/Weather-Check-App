# Weather Explorer 3D Pro 🌦️ (Weather App)

## Proper define style

### 1) Language / Framework
- **HTML** (`index.html`) – page structure
- **CSS** (`style.css`) – UI styling
- **JavaScript (Vanilla)** (`script.js`) – app logic (search, render, animations)

> No backend server required for the UI.

### 2) API used
- **OpenWeatherMap API** (current weather + 5-day/3-hour forecast)

### Also uses
- **OpenWeatherMap Geocoding API** for reverse geocoding (latitude/longitude → city name)

### 3) How it works (flow)
1. User enters a **city name** and clicks **Scan Weather**.
2. App calls **OpenWeatherMap** to fetch weather + forecast data.
3. UI updates:
   - Current temperature, feels like, humidity, wind, visibility
   - 5-day forecast cards
   - Weather icon/3D animation (Canvas-based)
   - AQI indicator (if provided/derived in your script)
4. Optional features:
   - **Get current location**
   - **Switch view** between 3D and Radar (handled in `script.js`)
   - **Theme toggle**
   - **Share** weather summary

### 4) Icon legend (used in this README)
- 🏁 = Entry / main UI
- 🎨 = Styling / visuals
- 🧠 = Core logic
- ⚡ = Interactive feature logic
- 🌐 = External API integration
- 📊 = Forecast/data rendering

---

## Project files
```
RAJ Project/Weather app/
  index.html 🏁
  style.css 🎨
  script.js 🧠/⚡
  README.md
```

---

## File-by-file (with icons)

### `index.html` 🏁
**Role**
- Defines the full layout:
  - particle background
  - 3D canvas container
  - search bar (city input + buttons)
  - current weather panel
  - forecast slider
  - view/theme/share controls
  - API status area
- Includes external UI libraries:
  - Font Awesome (icons)
  - Google Fonts
  - particles.js
  - three.js

---

### `style.css` 🎨
**Role**
- Controls gradients, glassmorphism panels, animations, responsiveness
- Styles weather cards, forecast slider, buttons, and 3D scene container

---

### `script.js` 🧠/⚡
**Role**
- Implements the runtime behavior:
  - `getWeather()` (city search)
  - `getCurrentLocation()`
  - fetch calls to **OpenWeatherMap** 🌐
  - updates DOM fields like:
    - `#temperature`, `#feelsLike`, `#humidity`, `#windSpeed`, `#visibility`
    - forecast cards
  - 3D/radar view switching: `changeView('3d'|'radar')`
  - theme toggle: `toggleTheme()`
  - share: `shareWeather()`

---

## How to run
1. Open **`RAJ Project/Weather app/index.html`** in a browser.
2. Ensure `script.js` has a valid **OpenWeatherMap API key**.
   - If your code expects an API key in JS, update it there.
   - If it expects a key from environment/backend, provide it accordingly.

---

## Notes / requirements
- If you open the HTML directly, some APIs can be blocked by **CORS** depending on how `script.js` fetches data.
- Serving using a simple local server usually helps:
  - `python -m http.server 8000`
  - open: `http://localhost:8000/`


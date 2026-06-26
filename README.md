## 👩‍💻 About

I'm Hiba Shaukat, a Web Engineering student at Hamdard University, 
Karachi, currently interning at Appverse Technologies. This project 
was built as part of my internship assignment to practice real-world 
API integration and proper state management in React.

# 🌤 WeatherLens — Weather Info Dashboard

A React application that fetches real-time weather data from the OpenWeatherMap API and displays it with proper Loading, Error, and Success state handling.

---

## 🚀 Live Demo
https://weather-dashboard-hiba.netlify.app/

## 🛠️ Tech Stack

- React 18
- Vite
- JavaScript (ES6+)
- OpenWeatherMap API
- CSS-in-JS (inline styles)

---

## 📁 Project Structure

```
weather-app/
├── src/
│   ├── WeatherDashboard.jsx   # Main component
│   └── App.jsx                # Entry point
├── .env                       # API key (not committed)
├── .gitignore
├── package.json
└── vite.config.js
```

---

## ⚙️ Components

### WeatherDashboard
Main component that handles:
- Search input and button
- API fetch logic
- All three UI states (Loading, Error, Success)
- Weather data display

### StatTile
Reusable sub-component for displaying individual weather stats.
Accepts: `icon`, `value`, `label` props.

---

## 🔄 State Handling

### ⏳ Loading State
```js
setLoading(true);   // shows spinner
setError(null);     // clears old errors
setWeather(null);   // clears old data
```

### ⚠️ Error State
| HTTP Status | Error Type | Message Shown |
|-------------|------------|---------------|
| 404 | City not found | "City not found. Please check spelling." |
| 401 | Invalid API key | "Invalid API key. Check your key." |
| 429 | Rate limit hit | "API limit exceeded. Try again later." |
| TypeError | No internet | "Network error. Check your connection." |

### ✅ Success State
```js
const data = await res.json();
setWeather(data); // renders weather card
```

---

## 🔧 Setup & Installation

```bash
# 1. Clone the repo
git clone https://github.com/hibashaukat/weather-app.git
cd weather-app

# 2. Install dependencies
npm install

# 3. Create .env file in root folder
VITE_API_KEY=your_openweathermap_api_key_here

# 4. Update WeatherDashboard.jsx
const API_KEY = import.meta.env.VITE_API_KEY;

# 5. Run locally
npm run dev
```

---

## 🌐 Deployment (Netlify)

```bash
# Build the project
npm run build
```

Then drag and drop the `dist` folder to [netlify.com](https://netlify.com)

**Set Environment Variable on Netlify:**
- Key: `VITE_API_KEY`
- Value: your actual API key

---

## 🔑 API Key Setup

1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API Keys tab and copy your key
4. Add it to your `.env` file (never commit this file)

---

## ✅ Features Checklist

- [x] City search input
- [x] Loading spinner
- [x] Error: city not found (404)
- [x] Error: network failure
- [x] Error: API limit exceeded (429)
- [x] Error: invalid API key (401)
- [x] Temperature (°C + feels like)
- [x] Humidity, wind, pressure, visibility
- [x] Weather emoji icons
- [x] Min / Max temperature
- [x] Responsive design

---

## 👩‍💻 Author

**Hiba Shaukat**
Web Engineering Student | Hamdard University, Karachi
Intern @ Appverse Technologies & CodeAlpha

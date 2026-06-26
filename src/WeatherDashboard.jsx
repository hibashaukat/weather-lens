import { useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

 API_KEY = imconstport.meta.env.VITE_API_KEY;
const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

// ─── Weather Icon Map ─────────────────────────────────────────────────────────

const getWeatherEmoji = (code) => {
  if (code >= 200 && code < 300) return "⛈️";  // Thunderstorm
  if (code >= 300 && code < 400) return "🌦️";  // Drizzle
  if (code >= 500 && code < 600) return "🌧️";  // Rain
  if (code >= 600 && code < 700) return "❄️";  // Snow
  if (code >= 700 && code < 800) return "🌫️";  // Atmosphere (fog etc.)
  if (code === 800) return "☀️";               // Clear
  if (code > 800) return "⛅";                 // Clouds
  return "🌍";
};

// ─── Wind direction helper ────────────────────────────────────────────────────
const getWindDir = (deg) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);   // SUCCESS state data
  const [loading, setLoading] = useState(false);  // LOADING state
  const [error, setError] = useState(null);       // ERROR state message

  // ── Fetch Weather ────────────────────────────────────────────────────────
  const fetchWeather = async () => {
    // Guard: don't fetch if input is empty
    if (!city.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    // Reset states before new request
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const res = await fetch(
        `${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );

      // ── Error Handling: HTTP status codes ──────────────────────────────
      if (res.status === 401) {
        // API key is invalid or missing
        throw new Error("Invalid API key. Please check your OpenWeatherMap API key.");
      }
      if (res.status === 404) {
        // City not found
        throw new Error(`City "${city}" not found. Please check the spelling.`);
      }
      if (res.status === 429) {
        // API rate limit exceeded (free tier limit hit)
        throw new Error("API limit exceeded. Please wait a moment and try again.");
      }
      if (!res.ok) {
        // Any other unexpected HTTP error
        throw new Error(`Something went wrong (Error ${res.status}). Try again later.`);
      }

      // SUCCESS: parse and store the data
      const data = await res.json();
      setWeather(data);

    } catch (err) {
      // ── Error Handling: Network failures ──────────────────────────────
      if (err.name === "TypeError") {
        // TypeError usually means no internet / network failure
        setError("Network error. Please check your internet connection.");
      } else {
        // Pass through our custom error messages
        setError(err.message);
      }
    } finally {
      // Always stop loading, whether success or error
      setLoading(false);
    }
  };

  // ── Handle Enter key press ───────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* ── Background orbs for atmosphere ── */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.card}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <span style={styles.logo}>🌤</span>
          <h1 style={styles.title}>WeatherLens</h1>
          <p style={styles.subtitle}>Real-time weather, any city.</p>
        </div>

        {/* ── Search Bar ── */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter city name…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="City name"
          />
          <button
            style={loading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
            onClick={fetchWeather}
            disabled={loading}
            aria-label="Search weather"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {/* ════════════════════════════════════
            STATE 1: LOADING
            Show spinner while API request runs
        ════════════════════════════════════ */}
        {loading && (
          <div style={styles.stateBox}>
            <div style={styles.spinner} />
            <p style={styles.stateText}>Fetching weather data…</p>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE 2: ERROR
            Show specific error message to user
        ════════════════════════════════════ */}
        {error && !loading && (
          <div style={{ ...styles.stateBox, ...styles.errorBox }}>
            <span style={styles.errorIcon}>⚠️</span>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE 3: SUCCESS
            Show full weather data card
        ════════════════════════════════════ */}
        {weather && !loading && (
          <div style={styles.weatherCard}>
            {/* City + Country */}
            <div style={styles.cityRow}>
              <span style={styles.weatherEmoji}>
                {getWeatherEmoji(weather.weather[0].id)}
              </span>
              <div>
                <h2 style={styles.cityName}>
                  {weather.name}, {weather.sys.country}
                </h2>
                <p style={styles.condition}>
                  {weather.weather[0].description
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </p>
              </div>
            </div>

            {/* Temperature — hero stat */}
            <div style={styles.tempRow}>
              <span style={styles.tempMain}>{Math.round(weather.main.temp)}°C</span>
              <span style={styles.tempFeel}>
                Feels like {Math.round(weather.main.feels_like)}°C
              </span>
            </div>

            {/* Detail grid: humidity, wind, pressure, visibility */}
            <div style={styles.grid}>
              <StatTile label="Humidity" value={`${weather.main.humidity}%`} icon="💧" />
              <StatTile
                label="Wind"
                value={`${Math.round(weather.wind.speed * 3.6)} km/h ${getWindDir(weather.wind.deg)}`}
                icon="💨"
              />
              <StatTile label="Pressure" value={`${weather.main.pressure} hPa`} icon="🌡️" />
              <StatTile
                label="Visibility"
                value={
                  weather.visibility
                    ? `${(weather.visibility / 1000).toFixed(1)} km`
                    : "N/A"
                }
                icon="👁️"
              />
              <StatTile
                label="Min / Max"
                value={`${Math.round(weather.main.temp_min)}° / ${Math.round(weather.main.temp_max)}°`}
                icon="📊"
              />
              <StatTile label="Clouds" value={`${weather.clouds.all}%`} icon="☁️" />
            </div>

            {/* Timestamp */}
            <p style={styles.timestamp}>
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* ── Empty state: first load, no action yet ── */}
        {!loading && !error && !weather && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={styles.emptyText}>Search a city to see live weather.</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <p style={styles.footer}>Powered by OpenWeatherMap • WeatherLens</p>
    </div>
  );
}

// ─── Stat Tile Sub-component ──────────────────────────────────────────────────
function StatTile({ label, value, icon }) {
  return (
    <div style={styles.tile}>
      <span style={styles.tileIcon}>{icon}</span>
      <span style={styles.tileValue}>{value}</span>
      <span style={styles.tileLabel}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },
  // Decorative background glow orbs
  orb1: {
    position: "absolute", top: "-100px", left: "-100px",
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(100,120,255,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute", bottom: "-80px", right: "-80px",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,100,150,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
    zIndex: 1,
  },
  header: { textAlign: "center", marginBottom: 28 },
  logo: { fontSize: 40 },
  title: {
    margin: "8px 0 4px",
    fontSize: 28, fontWeight: 700,
    color: "#fff", letterSpacing: "-0.5px",
  },
  subtitle: { margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 14 },

  // ── Search ──
  searchRow: { display: "flex", gap: 10, marginBottom: 24 },
  input: {
    flex: 1, padding: "12px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12, color: "#fff", fontSize: 15,
    outline: "none",
  },
  btn: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    border: "none", borderRadius: 12,
    color: "#fff", fontWeight: 600, fontSize: 15,
    cursor: "pointer", whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },

  // ── Loading State ──
  stateBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12, padding: "32px 0",
  },
  spinner: {
    width: 40, height: 40, borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.15)",
    borderTop: "3px solid #667eea",
    animation: "spin 0.8s linear infinite",
    // NOTE: Add @keyframes spin in a <style> tag if using this outside an artifact
  },
  stateText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },

  // ── Error State ──
  errorBox: {
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.25)",
    borderRadius: 12, padding: "20px 24px",
    flexDirection: "row", gap: 12,
  },
  errorIcon: { fontSize: 20, flexShrink: 0 },
  errorText: { margin: 0, color: "#ff9a9a", fontSize: 14, lineHeight: 1.5 },

  // ── Success / Weather Card ──
  weatherCard: { animation: "fadeIn 0.4s ease" },
  cityRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  weatherEmoji: { fontSize: 52 },
  cityName: { margin: "0 0 4px", color: "#fff", fontSize: 22, fontWeight: 700 },
  condition: { margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 14 },
  tempRow: {
    display: "flex", alignItems: "baseline", gap: 12,
    marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)",
    paddingBottom: 20,
  },
  tempMain: { fontSize: 64, fontWeight: 700, color: "#fff", lineHeight: 1 },
  tempFeel: { color: "rgba(255,255,255,0.45)", fontSize: 14 },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10, marginBottom: 16,
  },
  tile: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "12px 10px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
  },
  tileIcon: { fontSize: 18 },
  tileValue: { color: "#fff", fontWeight: 600, fontSize: 13 },
  tileLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  timestamp: { textAlign: "right", color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 },

  // ── Empty State ──
  emptyState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 10, padding: "32px 0",
  },
  emptyText: { color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0 },

  footer: { marginTop: 20, color: "rgba(255,255,255,0.2)", fontSize: 12, zIndex: 1 },
};
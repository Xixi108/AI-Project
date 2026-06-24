import { useState, useEffect, useCallback, useRef } from 'react'


const WMO_CODES = {
  0: { label: 'Clear sky', icon: 'â˜€ï¸' },
  1: { label: 'Mainly clear', icon: 'ðŸŒ¤ï¸' },
  2: { label: 'Partly cloudy', icon: 'â›…' },
  3: { label: 'Overcast', icon: 'â˜ï¸' },
  45: { label: 'Foggy', icon: 'ðŸŒ«ï¸' },
  48: { label: 'Icy fog', icon: 'ðŸŒ«ï¸' },
  51: { label: 'Light drizzle', icon: 'ðŸŒ¦ï¸' },
  53: { label: 'Drizzle', icon: 'ðŸŒ¦ï¸' },
  55: { label: 'Heavy drizzle', icon: 'ðŸŒ§ï¸' },
  61: { label: 'Light rain', icon: 'ðŸŒ§ï¸' },
  63: { label: 'Rain', icon: 'ðŸŒ§ï¸' },
  65: { label: 'Heavy rain', icon: 'ðŸŒ§ï¸' },
  71: { label: 'Light snow', icon: 'ðŸŒ¨ï¸' },
  73: { label: 'Snow', icon: 'â„ï¸' },
  75: { label: 'Heavy snow', icon: 'â„ï¸' },
  80: { label: 'Rain showers', icon: 'ðŸŒ¦ï¸' },
  81: { label: 'Showers', icon: 'ðŸŒ§ï¸' },
  82: { label: 'Heavy showers', icon: 'â›ˆï¸' },
  95: { label: 'Thunderstorm', icon: 'â›ˆï¸' },
  96: { label: 'Thunderstorm w/ hail', icon: 'â›ˆï¸' },
  99: { label: 'Thunderstorm w/ heavy hail', icon: 'â›ˆï¸' },
}

const THEMES = {
  dark: {
    bg: 'from-gray-950 via-slate-900 to-gray-900',
    card: 'bg-white/5 border border-white/5',
    cardInner: 'bg-white/5',
    searchWrap: 'bg-white/8 border border-white/10 focus-within:border-white/30',
    dropdown: 'bg-gray-950/98 border border-white/10',
    dropdownHover: 'hover:bg-white/8',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    searchIcon: 'text-slate-500',
    searchInput: 'text-white placeholder-slate-500',
    clearBtn: 'text-slate-500 hover:text-white',
    heading: 'text-white',
    refreshBtn: 'text-slate-400 hover:text-white',
    toggleBtn: 'bg-white/10 hover:bg-white/20 text-yellow-300',
    locateBtn: 'bg-white/8 hover:bg-white/15 text-slate-300 border border-white/10',
    error: 'bg-red-500/20 border border-red-400/30 text-red-300',
    tempText: 'text-white',
    minTemp: 'text-slate-500',
  },
  light: {
    bg: 'from-sky-300 via-blue-200 to-indigo-200',
    card: 'bg-white/60 border border-white/80 shadow-sm',
    cardInner: 'bg-white/50',
    searchWrap: 'bg-white/70 border border-slate-200 focus-within:border-blue-400',
    dropdown: 'bg-white/98 border border-slate-200',
    dropdownHover: 'hover:bg-slate-50',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    textMuted: 'text-slate-400',
    searchIcon: 'text-slate-400',
    searchInput: 'text-slate-800 placeholder-slate-400',
    clearBtn: 'text-slate-400 hover:text-slate-700',
    heading: 'text-slate-800',
    refreshBtn: 'text-slate-500 hover:text-slate-800',
    toggleBtn: 'bg-slate-800/10 hover:bg-slate-800/20 text-slate-700',
    locateBtn: 'bg-white/60 hover:bg-white/80 text-slate-600 border border-slate-200',
    error: 'bg-red-50 border border-red-200 text-red-600',
    tempText: 'text-slate-800',
    minTemp: 'text-slate-400',
  },
}

const DEFAULT_CITY = { name: 'Manila', admin: 'Metro Manila', lat: 14.60, lon: 120.98 }

function wmo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'ðŸŒ¡ï¸' }
}

async function reverseGeocode(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  url.searchParams.set('format', 'json')
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  const data = await res.json()
  const a = data.address ?? {}
  return {
    name: a.city || a.town || a.village || a.municipality || a.county || 'Your Location',
    admin: a.state || a.region || '',
    lat,
    lon,
  }
}

async function searchCities(query) {
  if (!query.trim()) return []
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query.trim())
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).filter(r => r.country_code === 'PH')
}

async function fetchWeather(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation')
  url.searchParams.set('hourly', 'temperature_2m,weather_code')
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}

function parseData(raw) {
  const c = raw.current
  const currentHourIndex = raw.hourly.time.findIndex(t => t >= raw.current.time.slice(0, 13))
  const sliceStart = Math.max(0, currentHourIndex)

  const hours = raw.hourly.time.slice(sliceStart, sliceStart + 12).map((t, i) => ({
    time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(raw.hourly.temperature_2m[sliceStart + i]),
    code: raw.hourly.weather_code[sliceStart + i],
  }))

  const days = raw.daily.time.map((t, i) => ({
    date: new Date(t + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    code: raw.daily.weather_code[i],
    max: Math.round(raw.daily.temperature_2m_max[i]),
    min: Math.round(raw.daily.temperature_2m_min[i]),
  }))

  return {
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    precip: c.precipitation,
    code: c.weather_code,
    unit: raw.current_units.temperature_2m,
    hours,
    days,
  }
}

function CitySearch({ city, onSelect, t }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState(null)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    setLocateError(null)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const found = await searchCities(val)
      setResults(found)
      setSearching(false)
    }, 350)
  }

  function handleSelect(result) {
    onSelect({ name: result.name, admin: result.admin1 ?? '', lat: result.latitude, lon: result.longitude })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  async function handleLocate() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const found = await reverseGeocode(latitude, longitude)
        if (found) onSelect(found)
        else setLocateError('Could not determine your location name.')
        setLocating(false)
      },
      (err) => {
        setLocateError(err.code === 1 ? 'Location access denied.' : 'Could not get your location.')
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <div className="flex gap-2">
        <div className={`flex items-center rounded-xl px-4 py-3 gap-3 transition-colors flex-1 ${t.searchWrap}`}>
          <svg className={`w-4 h-4 shrink-0 ${t.searchIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query && setOpen(true)}
            placeholder={`${city.name}${city.admin ? `, ${city.admin}` : ''}`}
            className={`bg-transparent outline-none flex-1 text-sm ${t.searchInput}`}
          />
          {searching && <span className={`text-xs animate-pulse ${t.textMuted}`}>Searchingâ€¦</span>}
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }} className={`text-lg leading-none ${t.clearBtn}`}>Ã—</button>
          )}
        </div>

        {/* Locate me button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          title="Use my current location"
          className={`rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap ${t.locateBtn}`}
        >
          {locating ? (
            <span className="animate-spin inline-block">âŸ³</span>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0v4m0 12v4M2 12h4m12 0h4" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          )}
          {locating ? 'Locatingâ€¦' : 'My Location'}
        </button>
      </div>

      {locateError && (
        <p className={`text-xs px-1 ${t.textMuted}`}>{locateError}</p>
      )}

      {open && results.length > 0 && (
        <ul className={`absolute z-10 mt-2 w-full backdrop-blur rounded-xl overflow-hidden shadow-xl ${t.dropdown}`}>
          {results.map((r, i) => (
            <li key={i}>
              <button onClick={() => handleSelect(r)} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${t.dropdownHover}`}>
                <span className="text-lg">ðŸ“</span>
                <div>
                  <div className={`text-sm font-medium ${t.textPrimary}`}>{r.name}</div>
                  <div className={`text-xs ${t.textMuted}`}>{[r.admin1, r.admin2].filter(Boolean).join(', ')}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query && !searching && results.length === 0 && (
        <div className={`absolute z-10 mt-2 w-full backdrop-blur rounded-xl px-4 py-3 text-sm shadow-xl ${t.dropdown} ${t.textMuted}`}>
          No Philippine locations found for "{query}"
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, unit, t }) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-1 ${t.card}`}>
      <span className={`text-sm font-medium ${t.textSecondary}`}>{label}</span>
      <span className={`text-2xl font-bold ${t.textPrimary}`}>
        {value}
        {unit && <span className={`text-sm font-normal ml-1 ${t.textSecondary}`}>{unit}</span>}
      </span>
    </div>
  )
}

function HourlyBar({ hours, t }) {
  if (!hours || hours.length === 0) return null
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max pb-1">
        {hours.map((h, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 min-w-[60px] ${t.cardInner}`}>
            <span className={`text-xs ${t.textSecondary}`}>{h.time}</span>
            <span className="text-lg">{wmo(h.code).icon}</span>
            <span className={`text-sm font-semibold ${t.textPrimary}`}>{h.temp}Â°</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyRow({ day, t }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${t.cardInner}`}>
      <span className={`w-24 text-sm ${t.textSecondary}`}>{day.date}</span>
      <span className="text-xl">{wmo(day.code).icon}</span>
      <span className={`text-sm flex-1 text-center ${t.textSecondary}`}>{wmo(day.code).label}</span>
      <div className="flex gap-3 text-sm font-medium">
        <span className={t.textPrimary}>{day.max}Â°</span>
        <span className={t.minTemp}>{day.min}Â°</span>
      </div>
    </div>
  )
}

export default function Weather() {
  const [isDark, setIsDark] = useState(true)
  const [city, setCity] = useState(DEFAULT_CITY)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const t = isDark ? THEMES.dark : THEMES.light

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await fetchWeather(city.lat, city.lon)
      setWeather(parseData(raw))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [city.lat, city.lon])

  useEffect(() => { load() }, [load])

  const condition = weather ? wmo(weather.code) : null

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-500 ${t.bg} p-4 md:p-8`}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold tracking-tight ${t.heading}`}>ðŸ‡µðŸ‡­ Philippine Weather</h1>
          <div className="flex items-center gap-3">
            {/* Day/Night toggle */}
            <button
              onClick={() => setIsDark(d => !d)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ${t.toggleBtn}`}
              title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
            >
              {isDark ? 'â˜€ï¸ Day' : 'ðŸŒ™ Night'}
            </button>
            <button
              onClick={load}
              disabled={loading}
              className={`text-sm transition-colors disabled:opacity-50 ${t.refreshBtn}`}
            >
              {loading ? 'âŸ³ Refreshingâ€¦' : 'â†º Refresh'}
            </button>
          </div>
        </div>

        {/* Search */}
        <CitySearch city={city} onSelect={c => { setCity(c); setWeather(null) }} t={t} />

        {error && (
          <div className={`rounded-xl p-4 text-sm ${t.error}`}>
            {error} â€” check your connection and try again.
          </div>
        )}

        {loading && !weather && (
          <div className={`text-center py-16 text-lg animate-pulse ${t.textSecondary}`}>
            Loading weatherâ€¦
          </div>
        )}

        {weather && (
          <>
            {/* Current conditions */}
            <div className={`backdrop-blur rounded-2xl p-6 flex flex-col gap-2 ${t.card}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-sm font-medium mb-1 ${t.textSecondary}`}>
                    {city.name}{city.admin ? `, ${city.admin}` : ''}
                  </div>
                  <div className={`text-7xl font-thin leading-none ${t.tempText}`}>
                    {weather.temp}{weather.unit}
                  </div>
                  <div className={`mt-2 text-sm ${t.textSecondary}`}>
                    Feels like {weather.feels}{weather.unit}
                  </div>
                </div>
                <div className="text-6xl">{condition.icon}</div>
              </div>
              <div className={`font-medium text-lg mt-1 ${t.textPrimary}`}>{condition.label}</div>
              {lastUpdated && (
                <div className={`text-xs mt-1 ${t.textMuted}`}>Updated at {lastUpdated}</div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Humidity" value={weather.humidity} unit="%" t={t} />
              <StatCard label="Wind" value={weather.wind} unit="km/h" t={t} />
              <StatCard label="Precip." value={weather.precip} unit="mm" t={t} />
            </div>

            {/* Hourly forecast */}
            <div className={`backdrop-blur rounded-2xl p-5 flex flex-col gap-3 ${t.card}`}>
              <h2 className={`font-semibold ${t.textPrimary}`}>Next 12 Hours</h2>
              <HourlyBar hours={weather.hours} t={t} />
            </div>

            {/* 7-day forecast */}
            <div className={`backdrop-blur rounded-2xl p-5 flex flex-col gap-3 ${t.card}`}>
              <h2 className={`font-semibold ${t.textPrimary}`}>7-Day Forecast</h2>
              <div className="flex flex-col gap-2">
                {weather.days.map((d, i) => <DailyRow key={i} day={d} t={t} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


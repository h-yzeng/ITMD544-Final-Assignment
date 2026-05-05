import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { DailyForecastStrip } from './components/DailyForecastStrip';
import { HourlyScroll } from './components/HourlyScroll';
import { OutlookSection } from './components/OutlookSection';
import { DetailCards } from './components/DetailCards';
import { RecentSearches } from './components/RecentSearches';
import { useTheme } from './hooks/useTheme';
import { searchCity, getSearchHistory, getHourlyForecasts } from './api/client';
import type {
  Location,
  DailyForecast,
  HourlyForecast,
  SearchHistoryEntry,
  CurrentConditions,
} from './types';

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [unit, setUnit] = useState<'C' | 'F'>('F');
  const [currentConditions, setCurrentConditions] = useState<CurrentConditions | null>(null);

  useEffect(() => {
    getSearchHistory().then(setHistory).catch(() => {});
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchCity(query);
      setLocation(result.location);
      setDaily(result.daily);
      setCurrentConditions(result.current ?? null);
      const firstDay = result.daily[0] ?? null;
      setSelectedDay(firstDay);
      if (firstDay) {
        const h = await getHourlyForecasts(result.location.id, firstDay.id);
        setHourly(h);
      }
      setHistory(await getSearchHistory());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = async (forecast: DailyForecast) => {
    setSelectedDay(forecast);
    if (location) {
      try {
        setHourly(await getHourlyForecasts(location.id, forecast.id));
      } catch {
        setHourly([]);
      }
    }
  };

  const activeDay = selectedDay ?? daily[0] ?? null;
  const isToday = activeDay?.id === daily[0]?.id;

  // For humidity: prefer live current value when viewing today
  const hourlyHumidity = hourly.length > 0
    ? (hourly.find((h) => h.hour === 12) ?? hourly.find((h) => h.humidity != null))
        ?.humidity ?? null
    : null;
  const humidity = isToday && currentConditions?.humidity != null
    ? currentConditions.humidity
    : hourlyHumidity;

  // Day label for OutlookSection
  const dayLabel = !activeDay ? 'Today' : isToday
    ? 'Today'
    : new Date(activeDay.forecast_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">WeatherNow</h1>

        <SearchBar onSearch={handleSearch} loading={loading} />

        <div className="header-controls">
          <div className="unit-toggle">
            <button
              type="button"
              className={`unit-btn${unit === 'C' ? ' unit-btn--active' : ''}`}
              onClick={() => setUnit('C')}
            >
              °C
            </button>
            <button
              type="button"
              className={`unit-btn${unit === 'F' ? ' unit-btn--active' : ''}`}
              onClick={() => setUnit('F')}
            >
              °F
            </button>
          </div>
          <div className="controls-divider" />
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <RecentSearches history={history} onSelect={handleSearch} />
        </aside>

        <div className="content-well">
          <main className="app-content">
            {error && <div className="error-banner">{error}</div>}

            {location && daily[0] && activeDay && (
              <>
                <WeatherCard
                  location={location}
                  forecast={activeDay}
                  current={isToday ? currentConditions : null}
                  isToday={isToday}
                  unit={unit}
                  humidity={humidity}
                />
                <OutlookSection today={activeDay} unit={unit} dayLabel={dayLabel} />
                <DetailCards today={activeDay} unit={unit} humidity={humidity} />
                <DailyForecastStrip
                  forecasts={daily}
                  selectedId={selectedDay?.id ?? null}
                  onSelect={handleDaySelect}
                  unit={unit}
                />
                {hourly.length > 0 && (
                  <HourlyScroll
                    hourly={hourly}
                    unit={unit}
                    weatherCode={activeDay?.weather_code}
                  />
                )}
              </>
            )}

            {!location && !loading && (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                  <circle cx="17" cy="17" r="7.5" fill="#FDE68A" opacity="0.3" />
                  <line x1="17" y1="6" x2="17" y2="10" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                  <line x1="6" y1="17" x2="10" y2="17" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                  <line x1="9.5" y1="9.5" x2="12.2" y2="12.2" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                  <path d="M14 38 Q14 31 21 31 Q23 25 30 25 Q37 25 37 32 Q41 32 41 38 Z" fill="#4cb8f0" opacity="0.2" />
                </svg>
                <p>Search for a city to see the forecast</p>
                <small>Enter a city name in the search bar above</small>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

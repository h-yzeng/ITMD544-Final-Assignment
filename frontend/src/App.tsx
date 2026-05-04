import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { DailyForecastStrip } from './components/DailyForecastStrip';
import { HourlyChart } from './components/HourlyChart';
import { RecentSearches } from './components/RecentSearches';
import { TagManager } from './components/TagManager';
import { searchCity, getSearchHistory, getHourlyForecasts } from './api/client';
import type { Location, DailyForecast, HourlyForecast, SearchHistoryEntry, Tag } from './types';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

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
      setTags(result.location.tags ?? []);
      const firstDay = result.daily[0] ?? null;
      setSelectedDay(firstDay);
      if (firstDay) {
        const h = await getHourlyForecasts(result.location.id, firstDay.id);
        setHourly(h);
      }
      const updatedHistory = await getSearchHistory();
      setHistory(updatedHistory);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? message);
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = async (forecast: DailyForecast) => {
    setSelectedDay(forecast);
    if (location) {
      try {
        const h = await getHourlyForecasts(location.id, forecast.id);
        setHourly(h);
      } catch {
        setHourly([]);
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌤️ Weather App</h1>
        <SearchBar onSearch={handleSearch} loading={loading} />
        <div className="unit-toggle">
          <button
            type="button"
            className={`unit-btn${unit === 'C' ? ' unit-btn--active' : ''}`}
            onClick={() => setUnit('C')}
          >°C</button>
          <button
            type="button"
            className={`unit-btn${unit === 'F' ? ' unit-btn--active' : ''}`}
            onClick={() => setUnit('F')}
          >°F</button>
        </div>
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <RecentSearches history={history} onSelect={handleSearch} />
        </aside>

        <section className="app-content">
          {error && <div className="error-banner">{error}</div>}

          {location && daily[0] && (
            <>
              <WeatherCard location={location} today={daily[0]} unit={unit} />
              <TagManager locationId={location.id} currentTags={tags} onTagsChange={setTags} />
              <DailyForecastStrip forecasts={daily} selectedId={selectedDay?.id ?? null} onSelect={handleDaySelect} unit={unit} />
              {hourly.length > 0 && <HourlyChart hourly={hourly} unit={unit} />}
            </>
          )}

          {!location && !loading && (
            <div className="empty-state">
              <p>Search for a city to see the weather forecast.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

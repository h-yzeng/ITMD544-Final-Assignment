import { Router, Request, Response, NextFunction } from 'express';
import { geocodeCity, suggestCities } from '../services/geocoding.service';
import { fetchForecast } from '../services/weather.service';
import { createOrGetLocation } from '../services/location.service';
import { saveDailyForecasts } from '../services/forecast.service';
import { logSearch, getRecentSearches } from '../services/searchLog.service';

export const searchRouter = Router();

searchRouter.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q?.trim() || q.trim().length < 2) {
      res.json([]);
      return;
    }
    const results = await suggestCities(q.trim(), 5);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query?.trim()) {
      res.status(400).json({ error: 'query parameter "q" is required' });
      return;
    }

    const geo = await geocodeCity(query);
    if (!geo) {
      res.status(404).json({ error: `City "${query}" not found` });
      return;
    }

    const [forecast, location] = await Promise.all([
      fetchForecast(geo.latitude, geo.longitude, geo.timezone),
      createOrGetLocation({
        name: geo.name,
        country: geo.country,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timezone: geo.timezone,
      }),
    ]);

    const [daily] = await Promise.all([
      saveDailyForecasts(location.id, forecast),
      logSearch(query, location.id),
    ]);

    const raw = forecast.current;
    const current = raw
      ? {
          temperature: raw.temperature_2m,
          weather_code: raw.weather_code,
          humidity: raw.relative_humidity_2m,
          wind_speed: raw.wind_speed_10m,
          precipitation: raw.precipitation,
        }
      : null;

    res.json({ location, daily, current });
  } catch (err) {
    next(err);
  }
});

searchRouter.get('/history', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await getRecentSearches(20);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

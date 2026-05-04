import { Router, Request, Response, NextFunction } from 'express';
import { geocodeCity } from '../services/geocoding.service';
import { fetchForecast } from '../services/weather.service';
import { createOrGetLocation } from '../services/location.service';
import { saveDailyForecasts } from '../services/forecast.service';
import { logSearch, getRecentSearches } from '../services/searchLog.service';

export const searchRouter = Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for a city and retrieve its 7-day forecast
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Location and daily forecast data
 *       400:
 *         description: Missing query parameter
 *       404:
 *         description: City not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
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

    res.json({ location, daily });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /search/history:
 *   get:
 *     summary: Get recent search history
 *     responses:
 *       200:
 *         description: Array of recent searches with location info
 */
searchRouter.get('/history', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await getRecentSearches(20);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

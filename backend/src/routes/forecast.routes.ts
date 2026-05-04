import { Router, Request, Response, NextFunction } from 'express';
import { getDailyForecasts, getHourlyForecasts } from '../services/forecast.service';

export const forecastRouter = Router();

/**
 * @swagger
 * /forecasts/{locationId}:
 *   get:
 *     summary: Get daily forecasts for a location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of daily forecasts
 */
forecastRouter.get('/:locationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forecasts = await getDailyForecasts(req.params.locationId);
    res.json(forecasts);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /forecasts/{locationId}/hourly:
 *   get:
 *     summary: Get hourly forecasts for a specific daily forecast
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: dailyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of hourly forecasts
 *       400:
 *         description: Missing dailyId
 */
forecastRouter.get('/:locationId/hourly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dailyId } = req.query;
    if (!dailyId || typeof dailyId !== 'string') {
      res.status(400).json({ error: 'query parameter "dailyId" is required' });
      return;
    }
    const hourly = await getHourlyForecasts(dailyId);
    res.json(hourly);
  } catch (err) {
    next(err);
  }
});

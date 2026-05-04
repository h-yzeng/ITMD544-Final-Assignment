import { Router, Request, Response, NextFunction } from 'express';
import { getAllLocations, getLocationById, deleteLocation } from '../services/location.service';
import { getTagsForLocation } from '../services/tag.service';

export const locationRouter = Router();

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all cached locations
 *     responses:
 *       200:
 *         description: Array of locations
 */
locationRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await getAllLocations();
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location with its tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Location object with tags array
 *       404:
 *         description: Location not found
 */
locationRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await getLocationById(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    const tags = await getTagsForLocation(req.params.id);
    res.json({ ...location, tags });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location and all its data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
locationRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteLocation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from 'express';
import { getAllTags, addTagToLocation, removeTagFromLocation } from '../services/tag.service';

export const tagRouter = Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all available tags
 *     responses:
 *       200:
 *         description: Array of tags
 */
tagRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await getAllTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /tags/locations/{locationId}/tags:
 *   post:
 *     summary: Add a tag to a location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagId: { type: string }
 *     responses:
 *       201:
 *         description: Tag added
 *       400:
 *         description: Missing tagId
 */
tagRouter.post('/locations/:locationId/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tagId } = req.body;
    if (!tagId) {
      res.status(400).json({ error: 'tagId is required in request body' });
      return;
    }
    await addTagToLocation(req.params.locationId, tagId);
    res.status(201).send();
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /tags/locations/{locationId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Tag removed
 */
tagRouter.delete('/locations/:locationId/tags/:tagId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeTagFromLocation(req.params.locationId, req.params.tagId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

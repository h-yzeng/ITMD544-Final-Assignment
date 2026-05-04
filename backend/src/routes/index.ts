import { Router } from 'express';
import { searchRouter } from './search.routes';
import { locationRouter } from './location.routes';
import { forecastRouter } from './forecast.routes';
import { tagRouter } from './tag.routes';

export const router = Router();

router.use('/search', searchRouter);
router.use('/locations', locationRouter);
router.use('/forecasts', forecastRouter);
router.use('/tags', tagRouter);

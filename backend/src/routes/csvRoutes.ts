import { Router } from 'express';
import { processCsvController, mergeCsvController } from '../controllers/csvController';

const router = Router();

router.post('/upload-csv', processCsvController);
router.post('/merge-csv', mergeCsvController);

export default router;


import { Router } from 'express';
import {
  getCarsHandler,
  createCarHandler,
  updateCarHandler,
  deleteCarHandler,
  uploadCarPhotosHandler, deleteCarPhotoHandler
} from '../controllers/car.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';
import logger from '../utils/logger';

const router = Router();

router.get('/', getCarsHandler);
router.post('/', authMiddleware(['superadmin', 'manager']), createCarHandler);
router.put('/:id', authMiddleware(['superadmin', 'manager']), updateCarHandler);
router.delete('/:id', authMiddleware(['superadmin', 'manager']), deleteCarHandler);
router.post('/:id/photos', upload.array('photos', 10), uploadCarPhotosHandler);
router.delete('/:id/photos/:photoUrl', deleteCarPhotoHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Car route accessed');
  next();
});

export default router;
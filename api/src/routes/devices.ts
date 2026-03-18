import { Router } from 'express';
import { DeviceController } from '@/controllers/deviceController';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';
import { deviceRegistrationSchema, deviceUpdateSchema } from '@/types/validation';

const router = Router();
const deviceController = new DeviceController();

// All device routes require authentication
router.use(authenticateToken);

// Device management
router.post('/', validateRequest(deviceRegistrationSchema), deviceController.registerDevice);
router.get('/', deviceController.getDevices);
router.get('/:id', deviceController.getDevice);
router.put('/:id', validateRequest(deviceUpdateSchema), deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

// Device credentials
router.post('/:id/credentials', deviceController.issueCredential);
router.get('/:id/credentials', deviceController.getCredentials);

// Device sessions
router.get('/:id/sessions', deviceController.getDeviceSessions);

export { router as deviceRoutes };

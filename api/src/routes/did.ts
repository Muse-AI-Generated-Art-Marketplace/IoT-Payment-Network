import { Router } from 'express';
import { DIDController } from '@/controllers/didController';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';
import { didCreateSchema, didResolveSchema } from '@/types/validation';

const router = Router();
const didController = new DIDController();

// All DID routes require authentication
router.use(authenticateToken);

// DID management
router.post('/create', validateRequest(didCreateSchema), didController.createDID);
router.get('/resolve/:did', didController.resolveDID);
router.get('/list', didController.listDIDs);
router.post('/:did/verify', didController.verifyDID);

// Credential management
router.post('/:did/credentials', didController.createCredential);
router.post('/credentials/verify', didController.verifyCredential);
router.get('/:did/credentials', didController.getCredentials);

export { router as didRoutes };

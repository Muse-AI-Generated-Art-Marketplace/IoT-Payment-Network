import { Router } from 'express';
import { SessionController } from '@/controllers/sessionController';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';
import { sessionStartSchema, sessionEndSchema } from '@/types/validation';

const router = Router();
const sessionController = new SessionController();

// All session routes require authentication
router.use(authenticateToken);

// Session management
router.post('/start', validateRequest(sessionStartSchema), sessionController.startSession);
router.post('/:sessionId/end', validateRequest(sessionEndSchema), sessionController.endSession);
router.get('/', sessionController.getSessions);
router.get('/:sessionId', sessionController.getSession);
router.get('/:sessionId/status', sessionController.getSessionStatus);

export { router as sessionRoutes };

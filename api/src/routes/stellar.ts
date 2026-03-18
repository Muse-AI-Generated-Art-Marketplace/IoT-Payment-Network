import { Router } from 'express';
import { StellarController } from '@/controllers/stellarController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const stellarController = new StellarController();

// All Stellar routes require authentication
router.use(authenticateToken);

// Account management
router.get('/account', stellarController.getAccount);
router.get('/balance', stellarController.getBalance);
router.post('/fund', stellarController.fundAccount);

// Transaction management
router.get('/transactions', stellarController.getTransactions);
router.post('/transactions', stellarController.createTransaction);
router.get('/transactions/:id', stellarController.getTransaction);

// Contract interactions
router.get('/contracts', stellarController.getContracts);
router.post('/contracts/invoke', stellarController.invokeContract);
router.get('/contracts/:id', stellarController.getContractInfo);

export { router as stellarRoutes };

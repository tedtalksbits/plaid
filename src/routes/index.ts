import express from 'express';
import authRoutes from '../auth/authRoutes';
import plaidRoutes from '../plaid/plaidRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/plaid', plaidRoutes);

export default router;

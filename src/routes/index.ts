import express from 'express';
import authRoutes from '../auth/authRoutes';
import plaidRoutes from '../plaid/plaidRoutes';
import accountBalanceRoutes from '../accountBalance/accountBalanceRoutes';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/plaid', plaidRoutes);
router.use('/account-balances', accountBalanceRoutes);

export default router;

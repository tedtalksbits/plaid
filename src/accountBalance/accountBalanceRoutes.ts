import express from 'express';
const router = express.Router();

import { getAccountBalances } from './accountBalanceControllers';
import { verifySessionAndToken } from '../middleware/authMiddleware';

router.get('/', verifySessionAndToken, getAccountBalances);

export default router;

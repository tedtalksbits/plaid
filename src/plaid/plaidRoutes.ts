import express from 'express';
import {
  createLinkToken,
  getAccounts,
  getTransactions,
  setAccessToken,
} from './plaidControllers';
import { verifySessionAndToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create_link_token', verifySessionAndToken, createLinkToken);
router.post('/set_access_token', verifySessionAndToken, setAccessToken);
router.get('/transactions', verifySessionAndToken, getTransactions);
router.get('/accounts', verifySessionAndToken, getAccounts);

export default router;

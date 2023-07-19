import express from 'express';
import {
  authenticateUser,
  getUser,
  logoutUser,
  registerUser,
} from './authControllers';
import { verifySessionAndToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', authenticateUser);

router.post('/register', registerUser);

router.post('/logout', logoutUser);

router.get('/me', verifySessionAndToken, getUser);

export default router;

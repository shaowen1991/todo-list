import express from 'express';
import authRequired from '../middleware/authRequired.js';
import { register, login, logout, getMe } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authRequired, getMe);

export default router;

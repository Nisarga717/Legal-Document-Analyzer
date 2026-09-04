import { Router } from 'express';
import { askQuestion, getChatHistory } from '../controllers/chatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/ask', authenticateToken, askQuestion);
router.get('/history/:documentId', authenticateToken, getChatHistory);

export default router;

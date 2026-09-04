import { Router } from 'express';
import { uploadAndAnalyzeDocument, getAllDocuments, getDocumentById, deleteDocument } from '../controllers/docController';
import { upload } from '../middleware/uploadMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadAndAnalyzeDocument);
router.get('/', authenticateToken, getAllDocuments);
router.get('/:id', authenticateToken, getDocumentById);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;

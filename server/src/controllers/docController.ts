import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import LegalDocument from '../models/Document';
import Analysis from '../models/Analysis';
import { extractTextFromPDF } from '../services/pdfService';
import { GeminiService } from '../services/geminiService';

export const uploadAndAnalyzeDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // 1. Extract text from PDF
    const extractedText = await extractTextFromPDF(filePath);

    // 2. Create document record in database (optional user attachment)
    let doc = await LegalDocument.create({
      userId: req.userId || undefined,
      title: originalFileName.replace('.pdf', ''),
      originalFileName,
      filePath,
      fileSize: req.file.size,
      extractedText,
      status: 'processing'
    });

    // 3. Analyze with Gemini AI
    let analysisResult;
    try {
      analysisResult = await GeminiService.analyzeDocument(extractedText);
    } catch (aiErr) {
      console.error('[Gemini AI Error]', aiErr);
      analysisResult = {
        summary: 'Failed to complete AI analysis. Raw document text is available.',
        keyPoints: ['Text extracted successfully from PDF'],
        legalIssues: ['AI analysis offline'],
        recommendations: ['Review extracted text directly'],
        documentType: 'Legal Document',
        parties: [],
        dates: [],
        jurisdiction: 'Not specified'
      };
    }

    // 4. Save analysis to MongoDB
    const analysisRecord = await Analysis.create({
      documentId: doc._id,
      summary: analysisResult.summary,
      riskScore: 4, // Default baseline risk score
      keyPoints: analysisResult.keyPoints,
      redFlags: analysisResult.legalIssues,
      recommendations: analysisResult.recommendations,
      partiesInvolved: analysisResult.parties,
      rawAnalysisText: JSON.stringify(analysisResult)
    });

    // 5. Update doc status
    doc.status = 'completed';
    doc.documentType = analysisResult.documentType || 'Legal Document';
    await doc.save();

    res.status(201).json({
      message: 'Document analyzed and stored successfully',
      document: doc,
      analysis: analysisResult,
      analysisId: analysisRecord._id
    });
  } catch (error) {
    console.error('Error processing document upload:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter = req.userId ? { userId: req.userId } : {};
    const documents = await LegalDocument.find(filter).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await LegalDocument.findById(id);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const analysis = await Analysis.findOne({ documentId: id });
    res.json({ document, analysis });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await LegalDocument.findByIdAndDelete(id);
    await Analysis.deleteMany({ documentId: id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

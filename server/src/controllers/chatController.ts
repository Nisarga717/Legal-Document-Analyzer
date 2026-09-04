import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Chat from '../models/Chat';
import LegalDocument from '../models/Document';
import { GeminiService } from '../services/geminiService';

export const askQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId, question, extractedText, previousContext } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    let docText = extractedText;
    if (!docText && documentId) {
      const doc = await LegalDocument.findById(documentId);
      if (doc) {
        docText = doc.extractedText;
      }
    }

    if (!docText) {
      res.status(400).json({ error: 'Document text is missing' });
      return;
    }

    // Call Gemini AI
    const answer = await GeminiService.askQuestion(docText, question, previousContext);

    // Save to database if documentId exists
    if (documentId) {
      let chat = await Chat.findOne({ documentId });
      if (!chat) {
        chat = new Chat({
          documentId,
          userId: req.userId || undefined,
          messages: []
        });
      }

      chat.messages.push({ sender: 'user', text: question, timestamp: new Date() });
      chat.messages.push({ sender: 'ai', text: answer, timestamp: new Date() });
      await chat.save();
    }

    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const chat = await Chat.findOne({ documentId });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  originalFileName: string;
  fileSize: number;
  extractedText: string;
  documentType?: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface AnalysisData {
  summary: string;
  keyPoints: string[];
  legalIssues: string[];
  recommendations: string[];
  documentType: string;
  parties: string[];
  dates: string[];
  jurisdiction: string;
}

export const apiService = {
  // Upload and analyze PDF document
  uploadAndAnalyze: async (file: File): Promise<{ document: DocumentItem; analysis: AnalysisData; analysisId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload and analyze document');
    }

    return response.json();
  },

  // Fetch all document history from backend MongoDB
  getDocuments: async (): Promise<DocumentItem[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document history');
    }

    const data = await response.json();
    return data.documents;
  },

  // Fetch single document & analysis
  getDocumentById: async (id: string): Promise<{ document: DocumentItem; analysis: AnalysisData }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document details');
    }

    return response.json();
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  },

  // Ask question about document to Express AI endpoint
  askQuestion: async (params: { documentId?: string; question: string; extractedText?: string; previousContext?: string }): Promise<string> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to get answer from AI');
    }

    const data = await response.json();
    return data.answer;
  },

  // Auth API
  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return response.json();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  },

  // Get chat history for document
  getChatHistory: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/history/${documentId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.messages;
  }
};

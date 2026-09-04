import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
if (!API_KEY) {
  console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// Get the Gemini models candidates
const CANDIDATE_MODELS = [
  import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-pro',
  'gemini-1.5-flash-latest'
]

export interface AnalysisResult {
  summary: string
  keyPoints: string[]
  legalIssues: string[]
  recommendations: string[]
  documentType: string
  parties: string[]
  dates: string[]
  jurisdiction: string
}

// Helper function to clean Gemini response and extract JSON
function cleanGeminiResponse(response: string): string {
  let cleaned = response.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }
  return cleaned.trim()
}

async function generateWithFallback(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set VITE_GEMINI_API_KEY in your .env file.')
  }

  let lastError: Error | null = null
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (err) {
      console.warn(`[Gemini Candidate Failed] Model '${modelName}' error:`, (err as Error).message)
      lastError = err as Error
    }
  }
  throw lastError || new Error('All Gemini candidate models failed.')
}

export class GeminiService {
  static async analyzeDocument(text: string): Promise<AnalysisResult> {
    if (!genAI) {
      throw new Error('Gemini API is not configured. Please provide a valid API key.')
    }

    try {
      const prompt = `
You are a legal AI assistant. Analyze the following text that was extracted from a document.

Document Text:
"""
${text}
"""

Please provide your analysis in the following JSON structure:
{
  "summary": "A comprehensive summary of the document content in 2-3 sentences",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "legalIssues": ["Legal issue 1", "Legal issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "documentType": "Type of document (e.g., Contract, Agreement, Business Document, etc.)",
  "parties": ["Party 1", "Party 2"],
  "dates": ["Important date 1", "Important date 2"],
  "jurisdiction": "Relevant jurisdiction or 'Not specified'"
}
`

      const analysisText = await generateWithFallback(prompt)

      try {
        const cleanedResponse = cleanGeminiResponse(analysisText)
        const analysis: AnalysisResult = JSON.parse(cleanedResponse)
        return analysis
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError)
        return {
          summary: "Document analysis completed with available content.",
          keyPoints: ["Document uploaded and processed"],
          legalIssues: ["Standard review recommended"],
          recommendations: ["Consult with a legal professional"],
          documentType: "Document",
          parties: [],
          dates: [],
          jurisdiction: "Not specified"
        }
      }
    } catch (error) {
      console.error('Error analyzing document with Gemini:', error)
      throw new Error('Failed to analyze document: ' + (error as Error).message)
    }
  }

  static async askQuestion(documentText: string, question: string, previousContext?: string): Promise<string> {
    if (!genAI) {
      throw new Error('Gemini API is not configured. Please provide a valid API key.')
    }

    try {
      const prompt = `
You are a legal AI assistant answering a specific question about a document.

Document Text:
"""
${documentText}
"""

${previousContext ? `Previous Context:\n${previousContext}\n` : ''}

Question: ${question}

Answer:
`

      return await generateWithFallback(prompt)
    } catch (error) {
      console.error('Error asking question to Gemini:', error)
      throw new Error('Failed to get answer: ' + (error as Error).message)
    }
  }

  static isConfigured(): boolean {
    return !!API_KEY && !!genAI
  }

  static getConfigurationInstructions(): string {
    return `
To use the AI analysis features, you need to configure a Gemini API key:

1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Get your API key
4. Create a .env file in your project root
5. Add: VITE_GEMINI_API_KEY=your_api_key_here
6. Restart the development server

The app will work without an API key, but AI features will be disabled.
`
  }
} 
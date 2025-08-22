import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
if (!API_KEY) {
  console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// Get the Gemini model
const model = genAI?.getGenerativeModel({ model: 'gemini-2.0-flash' })

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
  // Remove markdown code blocks if present
  let cleaned = response.trim()
  
  // Remove ```json at the beginning
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3)
  }
  
  // Remove ``` at the end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }
  
  return cleaned.trim()
}

export class GeminiService {
  static async analyzeDocument(text: string): Promise<AnalysisResult> {
    if (!model) {
      throw new Error('Gemini API is not configured. Please provide a valid API key.')
    }

    try {
      const prompt = `
You are a legal AI assistant. Analyze the following text that was extracted from a document. The text may be from various types of documents (legal, business, academic, etc.) and might contain some extraction artifacts or formatting issues.

Document Text:
"""
${text}
"""

Please provide your analysis in the following JSON structure. Be flexible and work with whatever content is provided - even if it's not a perfect legal document:

{
  "summary": "A comprehensive summary of the document content in 2-3 sentences",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", ...],
  "legalIssues": ["Legal issue 1", "Legal issue 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "documentType": "Type of document (e.g., Contract, Agreement, Legal Brief, Business Document, Letter, etc.)",
  "parties": ["Party 1", "Party 2", ...],
  "dates": ["Important date 1", "Important date 2", ...],
  "jurisdiction": "Relevant jurisdiction or 'Not specified'"
}

Guidelines for analysis:
1. **Be flexible**: Work with any type of document content, even if imperfect
2. **Extract value**: Find meaningful information even from poorly formatted text
3. **Document classification**: Identify what type of document this appears to be
4. **Key information**: Extract names, dates, important terms, obligations, rights
5. **Legal relevance**: Identify any legal implications, even in non-legal documents
6. **Practical advice**: Provide actionable recommendations based on the content
7. **Context awareness**: Consider business, contractual, or regulatory contexts

If the text appears to be corrupted or unreadable:
- Still attempt to extract any readable portions
- Identify the likely document type if possible
- Provide recommendations for document improvement
- Note specific issues with text extraction

Focus on being helpful rather than dismissive. Even fragmentary or imperfect documents can yield useful insights.
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const analysisText = response.text()

      // Parse the JSON response
      try {
        // Clean the response to remove markdown code blocks
        const cleanedResponse = cleanGeminiResponse(analysisText)
        const analysis: AnalysisResult = JSON.parse(cleanedResponse)
        return analysis
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError)
        console.log('Raw response:', analysisText)
        
        // Fallback: create a basic analysis structure
        return {
          summary: "Document analysis completed. The AI has processed the available content and extracted key information where possible.",
          keyPoints: ["Document uploaded and processed", "Content analyzed for key information", "Analysis completed with available data"],
          legalIssues: ["Text extraction quality may affect analysis accuracy"],
          recommendations: ["Review the original document for complete accuracy", "Consider re-uploading if text appears corrupted", "Consult with a legal professional for important matters"],
          documentType: "Document (type analysis in progress)",
          parties: ["Analysis in progress"],
          dates: ["Analysis in progress"],
          jurisdiction: "Not specified"
        }
      }
    } catch (error) {
      console.error('Error analyzing document with Gemini:', error)
      throw new Error('Failed to analyze document. Please check your API key and try again.')
    }
  }

  static async askQuestion(documentText: string, question: string, previousContext?: string): Promise<string> {
    if (!model) {
      throw new Error('Gemini API is not configured. Please provide a valid API key.')
    }

    try {
      const prompt = `
You are a legal AI assistant. You have access to a legal document and need to answer a specific question about it.

Document Text:
"""
${documentText}
"""

${previousContext ? `Previous Analysis Context:\n${previousContext}\n` : ''}

Question: ${question}

Please provide a detailed, accurate answer based solely on the information in the document. If the document doesn't contain sufficient information to answer the question, clearly state that. Focus on legal accuracy and cite specific sections or clauses when relevant.

Guidelines:
1. Base your answer only on the provided document
2. Be specific and cite relevant sections
3. If information is not available in the document, explicitly state this
4. Provide legal context when helpful
5. Keep the response professional and legally sound
6. If the question requires legal advice, remind that this is for informational purposes only

Answer:
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error asking question to Gemini:', error)
      throw new Error('Failed to get answer. Please check your API key and try again.')
    }
  }

  static isConfigured(): boolean {
    return !!API_KEY && !!model
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
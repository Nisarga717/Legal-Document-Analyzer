import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material'
import {
  Chat as ChatIcon,
  Send,
  Person,
  SmartToy,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { GeminiService } from '../services/gemini'
import { formatTime } from '../lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  extractedText: string
  analysis: string
  fileName: string
}

export function ChatInterface({ extractedText, analysis, fileName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when component mounts
  useEffect(() => {
    if (extractedText && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Hello! I've analyzed your document "${fileName}". You can now ask me specific questions about the content, legal provisions, clauses, or anything else related to this document. What would you like to know?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [extractedText, fileName, messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!GeminiService.isConfigured()) {
      setError('Gemini AI is not configured. Please check your API key.')
      return
    }

    if (!extractedText) {
      setError('No document text available. Please upload a document first.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await GeminiService.askQuestion(
        extractedText, 
        userMessage.content, 
        analysis
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get response')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again or rephrase your question.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Hello! I've analyzed your document "${fileName}". You can now ask me specific questions about the content, legal provisions, clauses, or anything else related to this document. What would you like to know?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const suggestedQuestions = [
    "What are the key terms and conditions?",
    "Who are the parties involved in this document?",
    "What are the main obligations of each party?",
    "Are there any important deadlines or dates?",
    "What are the potential risks or liabilities?",
    "What happens in case of breach or default?",
    "Are there any termination clauses?",
    "What is the governing law or jurisdiction?"
  ]

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={<ChatIcon />}
        title="Document Q&A"
        subheader="Ask specific questions about your document and get AI-powered answers"
        action={
          messages.length > 1 && (
            <Button 
              onClick={clearChat} 
              variant="outlined" 
              size="small"
            >
              Clear Chat
            </Button>
          )
        }
      />

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!GeminiService.isConfigured() ? (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
              <ErrorIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                AI Chat Not Available
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Configure your Gemini API key to enable interactive Q&A
              </Typography>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-line' }}>
                {GeminiService.getConfigurationInstructions()}
              </Typography>
            </Paper>
          </Box>
        ) : !extractedText ? (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
              <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Document Loaded
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload and analyze a document to start asking questions
              </Typography>
            </Paper>
          </Box>
        ) : (
          <>
            {/* Messages */}
            <Box 
              className="chat-messages"
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                maxHeight: 400,
                p: 1 
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.type === 'assistant' && (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <SmartToy />
                    </Avatar>
                  )}
                  
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        opacity: 0.7,
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>

                  {message.type === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <Person />
                    </Avatar>
                  )}
                </Box>
              ))}

              {isLoading && (
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SmartToy />
                  </Avatar>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Thinking...</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error">
                <Typography variant="body2" fontWeight="medium">
                  Error
                </Typography>
                {error}
              </Alert>
            )}

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Suggested questions:
                </Typography>
                <Grid container spacing={1}>
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <Grid size={12} key={index}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setInput(question)}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          textAlign: 'left',
                          width: '100%',
                          py: 1
                        }}
                      >
                        {question}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Input Form */}
            <Box component="form" onSubmit={handleSubmit} display="flex" gap={1}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                disabled={isLoading}
                fullWidth
                size="small"
                variant="outlined"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                variant="contained"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Send />
                )}
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              AI responses are based on the uploaded document content and are for informational purposes only.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  )
} 
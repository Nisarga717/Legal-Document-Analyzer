import { useState } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,

} from '@mui/material'
import {
  Upload,
  Description,
  Psychology,
  Chat,
  Scale,
} from '@mui/icons-material'
import { PDFUpload } from './components/PDFUpload'
import { DocumentAnalysis } from './components/DocumentAnalysis'
import { ChatInterface } from './components/ChatInterface'

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
})

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [analysis, setAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setAnalysis('')
  }

  const handleTextExtracted = (text: string) => {
    setExtractedText(text)
  }

  const handleAnalysisComplete = (analysisResult: string) => {
    setAnalysis(analysisResult)
    setIsAnalyzing(false)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Scale sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              LegalDoc AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by Gemini AI
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              AI-Powered Legal Document{' '}
              <Box component="span" color="primary.main">
                Analysis
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 6 }}>
              Upload your legal documents and get instant AI-powered insights, key information extraction,
              and answers to your specific questions about the content.
            </Typography>

            {/* Features Grid */}
            <Grid container spacing={4} sx={{ mt: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Document Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secure PDF upload with instant text extraction and processing
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      AI Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Advanced AI-powered analysis to extract key insights and legal information
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Chat sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Interactive Q&A
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ask specific questions about your document and get detailed AI responses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Main Content */}
          {!uploadedFile ? (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Upload sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Upload Legal Document
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Upload a PDF legal document to begin analysis. Supported formats: PDF
                  </Typography>
                  <PDFUpload 
                    onFileUpload={handleFileUpload}
                    onTextExtracted={handleTextExtracted}
                  />
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Document Analysis */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <DocumentAnalysis
                  file={uploadedFile}
                  extractedText={extractedText}
                  onAnalysisComplete={handleAnalysisComplete}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              </Grid>

              {/* Chat Interface */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChatInterface
                  extractedText={extractedText}
                  analysis={analysis}
                  fileName={uploadedFile.name}
                />
              </Grid>
            </Grid>
          )}
        </Container>

        {/* Footer */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 8, py: 4 }}>
          <Container maxWidth="lg">
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                © 2025 LegalDoc AI. Built with React, Material-UI, and Gemini AI.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                For educational and research purposes only. Not a substitute for legal advice.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App

import { useState, useEffect } from 'react'
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
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material'
import {
  Upload,
  Description,
  Psychology,
  Chat,
  Scale,
  Storage,
  History,
  FolderOpen
} from '@mui/icons-material'
import { PDFUpload } from './components/PDFUpload'
import { DocumentAnalysis } from './components/DocumentAnalysis'
import { ChatInterface } from './components/ChatInterface'
import { AuthModal } from './components/auth/AuthModal'
import { apiService, type DocumentItem, type AnalysisData, type User } from './services/api'

// Dark Theme Setup
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
  const [analysis, setAnalysis] = useState<AnalysisData | string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeDocId, setActiveDocId] = useState<string | undefined>()

  // Auth & User State
  const [user, setUser] = useState<User | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // History state
  const [savedDocs, setSavedDocs] = useState<DocumentItem[]>([])
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true)

  // Check current logged in user & fetch history
  useEffect(() => {
    const checkAuthAndFetchHistory = async () => {
      try {
        const currentUser = await apiService.getCurrentUser()
        setUser(currentUser)
      } catch (e) {
        console.warn('Auth check skipped:', e)
      }
      loadDocumentHistory()
    }
    checkAuthAndFetchHistory()
  }, [])

  // Fetch document history from MongoDB on load
  const loadDocumentHistory = async () => {
    try {
      const docs = await apiService.getDocuments()
      setSavedDocs(docs)
      setIsServerConnected(true)
    } catch (err) {
      console.warn('Backend server not connected or offline:', err)
      setIsServerConnected(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    loadDocumentHistory()
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setAnalysis('')
    setActiveDocId(undefined)
  }

  const handleTextExtracted = async (file: File, text: string) => {
    setUploadedFile(file)
    setExtractedText(text)

    // Trigger backend upload & AI analysis pipeline
    setIsAnalyzing(true)
    try {
      console.log('[Upload] Sending document to Express backend & MongoDB...')
      const res = await apiService.uploadAndAnalyze(file)
      console.log('[Upload Success] Saved in MongoDB with ID:', res.document._id)
      setAnalysis(res.analysis)
      setActiveDocId(res.document._id)
      await loadDocumentHistory()
    } catch (err) {
      console.error('[Upload Error] Failed to store document in MongoDB:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectHistoryDoc = async (docItem: DocumentItem) => {
    try {
      const data = await apiService.getDocumentById(docItem._id)
      setExtractedText(data.document.extractedText)
      setAnalysis(data.analysis || data.document.extractedText)
      setActiveDocId(data.document._id)
      setUploadedFile(new File([], data.document.originalFileName))
    } catch (e) {
      console.error('Failed to load document details', e)
    }
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
              LegalDoc AI <Chip label="MERN Stack Monorepo" color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                icon={<Storage />} 
                label={isServerConnected ? "Backend Connected (MongoDB)" : "Client Mode"} 
                color={isServerConnected ? "success" : "warning"}
                variant="outlined" 
                size="small"
              />
              {user ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={`Account: ${user.name}`} color="primary" variant="filled" size="small" />
                  <Button variant="outlined" size="small" color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" size="small" onClick={() => setAuthModalOpen(true)}>
                  Sign In / Register
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <AuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onAuthSuccess={(u) => {
            setUser(u);
            loadDocumentHistory();
          }} 
        />

        {/* Main Workspace */}
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              AI-Powered Legal Document{' '}
              <Box component="span" color="primary.main">
                Analysis Platform
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Full-Stack Legal AI: Upload contract PDFs, parse text via Express backend, run Gemini AI analysis, and store audit history in MongoDB.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Sidebar: Document History */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
                <Box display="flex" alignItems="center" mb={2} gap={1}>
                  <History color="primary" />
                  <Typography variant="h6">MongoDB Document History</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {savedDocs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No saved documents yet. Upload a PDF to start.
                  </Typography>
                ) : (
                  <List>
                    {savedDocs.map((doc) => (
                      <ListItemButton 
                        key={doc._id}
                        selected={activeDocId === doc._id}
                        onClick={() => handleSelectHistoryDoc(doc)}
                        sx={{ borderRadius: 1, mb: 1 }}
                      >
                        <ListItemIcon><FolderOpen color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary={doc.title} 
                          secondary={new Date(doc.createdAt).toLocaleDateString()} 
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}

                {uploadedFile && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mt: 2 }} 
                    onClick={() => { setUploadedFile(null); setExtractedText(''); setAnalysis(''); setActiveDocId(undefined); }}
                  >
                    + Upload New Document
                  </Button>
                )}
              </Paper>
            </Grid>

            {/* Main Section */}
            <Grid size={{ xs: 12, md: 9 }}>
              {!uploadedFile && !activeDocId ? (
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                  <Card>
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Upload sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Upload Legal Document to Express Server
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        PDF text extraction & AI analysis will be processed through Node backend.
                      </Typography>
                      <PDFUpload 
                        onFileUpload={handleFileUpload}
                        onTextExtracted={handleTextExtracted}
                      />
                    </CardContent>
                  </Card>

                  {/* Feature Badges */}
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Description sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">PDF Extraction</Typography>
                          <Typography variant="body2" color="text.secondary">Multipart PDF Parsing on Node.js</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Psychology sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">Server-side AI</Typography>
                          <Typography variant="body2" color="text.secondary">Gemini 2.0 API Key protection</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Chat sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">Database Persisted Q&A</Typography>
                          <Typography variant="body2" color="text.secondary">Chat logs saved in MongoDB</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {/* Document Analysis View */}
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <DocumentAnalysis
                      file={uploadedFile || new File([], 'Document')}
                      extractedText={extractedText}
                      onAnalysisComplete={(res) => setAnalysis(res)}
                      isAnalyzing={isAnalyzing}
                      setIsAnalyzing={setIsAnalyzing}
                      initialAnalysis={analysis}
                    />
                  </Grid>

                  {/* Chat View */}
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <ChatInterface
                      extractedText={extractedText}
                      analysis={typeof analysis === 'string' ? analysis : JSON.stringify(analysis)}
                      fileName={uploadedFile ? uploadedFile.name : 'Legal Document'}
                      documentId={activeDocId}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App

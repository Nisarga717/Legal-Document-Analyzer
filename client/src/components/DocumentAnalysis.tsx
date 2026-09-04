import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,

  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material'
import {
  Description,
  Psychology,
  Warning,
  People,
  Event,
  LocationOn,
  Lightbulb,

  Refresh,
  CheckCircle,
  ExpandMore,
  Visibility,
  Assessment,
} from '@mui/icons-material'
import { GeminiService, type AnalysisResult } from '../services/gemini'
import { formatFileSize } from '../lib/utils'

interface DocumentAnalysisProps {
  file: File
  extractedText: string
  onAnalysisComplete: (analysis: string) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  initialAnalysis?: AnalysisResult | string | null
}

export function DocumentAnalysis({ 
  file, 
  extractedText, 
  onAnalysisComplete, 
  isAnalyzing, 
  setIsAnalyzing,
  initialAnalysis
}: DocumentAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoAnalyzeStarted, setAutoAnalyzeStarted] = useState(false)
  const [showTextPreview, setShowTextPreview] = useState(false)

  // Synchronize initialAnalysis from backend if available
  useEffect(() => {
    if (initialAnalysis) {
      if (typeof initialAnalysis === 'string') {
        try {
          setAnalysis(JSON.parse(initialAnalysis));
        } catch {
          // If plain string summary
          setAnalysis({
            summary: initialAnalysis,
            keyPoints: [],
            legalIssues: [],
            recommendations: [],
            documentType: 'Legal Document',
            parties: [],
            dates: [],
            jurisdiction: 'Not specified'
          });
        }
      } else {
        setAnalysis(initialAnalysis);
      }
      setAutoAnalyzeStarted(true);
    }
  }, [initialAnalysis]);

  const analyzeDocument = async () => {
    if (!extractedText) {
      setError('No text extracted from the document.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await GeminiService.analyzeDocument(extractedText)
      setAnalysis(result)
      onAnalysisComplete(JSON.stringify(result, null, 2))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-analyze when text is extracted (if backend analysis not present)
  useEffect(() => {
    if (extractedText && !autoAnalyzeStarted && !initialAnalysis && GeminiService.isConfigured()) {
      setAutoAnalyzeStarted(true)
      analyzeDocument()
    }
  }, [extractedText, autoAnalyzeStarted, initialAnalysis])

  // Get text quality assessment
  const getTextQuality = () => {
    if (!extractedText) return 'No text'
    const length = extractedText.length
    const words = extractedText.split(/\s+/).filter(word => word.length > 0).length
    const averageWordLength = words > 0 ? extractedText.replace(/\s/g, '').length / words : 0
    const specialChars = (extractedText.match(/[^\w\s]/g) || []).length
    const specialCharRatio = specialChars / length
    
    if (length < 100) return 'Very short'
    if (specialCharRatio > 0.3) return 'Potentially corrupted'
    if (averageWordLength < 2 || averageWordLength > 15) return 'Questionable quality'
    return 'Good quality'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Document Info Card */}
      <Card>
        <CardHeader
          avatar={<Description />}
          title="Document Information"
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                File Name:
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {file.name}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                File Size:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                Extracted Text Length:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {extractedText.length.toLocaleString()} characters
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                Text Quality:
              </Typography>
              <Chip 
                label={getTextQuality()}
                color={getTextQuality() === 'Good quality' ? 'success' : getTextQuality() === 'Potentially corrupted' ? 'error' : 'warning'}
                size="small"
              />
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                Word Count:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ~{extractedText.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="medium">
                Analysis Status:
              </Typography>
              <Chip 
                label={analysis ? "Analyzed" : isAnalyzing ? "Analyzing..." : "Ready for analysis"}
                color={analysis ? "success" : isAnalyzing ? "info" : "warning"}
                size="small"
              />
            </Grid>
          </Grid>
          
          {/* Text Preview Section */}
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<Visibility />}
              onClick={() => setShowTextPreview(!showTextPreview)}
              size="small"
              variant="outlined"
            >
              {showTextPreview ? 'Hide' : 'Show'} Extracted Text Preview
            </Button>
            
            {showTextPreview && (
              <Paper sx={{ mt: 2, p: 2, maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {extractedText.length > 2000 
                    ? `${extractedText.substring(0, 2000)}...\n\n[Text truncated for preview - showing first 2000 characters of ${extractedText.length} total]`
                    : extractedText
                  }
                </Typography>
              </Paper>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      {!GeminiService.isConfigured() && (
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            AI Analysis Not Configured
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-line' }}>
            {GeminiService.getConfigurationInstructions()}
          </Typography>
        </Alert>
      )}

      {GeminiService.isConfigured() && (
        <Card>
          <CardHeader
            avatar={<Psychology />}
            title="AI Analysis"
            subheader={`Comprehensive insights about your document${analysis ? ' - Analysis Complete' : ''}`}
          />
          <CardContent>
            {isAnalyzing ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Analyzing Document...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI is processing the extracted text and identifying key insights
                </Typography>
              </Box>
            ) : analysis ? (() => {
              const keyPoints = analysis.keyPoints || [];
              const legalIssues = analysis.legalIssues || (analysis as any).redFlags || [];
              const recommendations = analysis.recommendations || [];
              const parties = analysis.parties || (analysis as any).partiesInvolved || [];
              const dates = analysis.dates || [];
              const documentType = analysis.documentType || 'Legal Document';
              const jurisdiction = analysis.jurisdiction || 'Not specified';

              return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Summary - Always visible */}
                <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Assessment sx={{ color: 'primary.main', mr: 1, fontSize: 24 }} />
                    <Typography variant="h5" color="primary.main">Executive Summary</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {analysis.summary || 'Summary unavailable.'}
                  </Typography>
                </Paper>

                {/* Document Classification */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Document Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {documentType}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" color="primary">Jurisdiction</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {jurisdiction}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Expandable Sections */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center">
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6">Key Points ({keyPoints.length})</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {keyPoints.map((point, index) => (
                        <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: 'success.main', 
                                color: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {index + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText 
                            primary={point}
                            primaryTypographyProps={{ variant: 'body1' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Legal Issues */}
                {legalIssues.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center">
                        <Warning sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6">Legal Issues & Concerns ({legalIssues.length})</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {legalIssues.map((issue, index) => (
                          <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={issue}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center">
                        <Lightbulb sx={{ color: 'info.main', mr: 1 }} />
                        <Typography variant="h6">Recommendations ({recommendations.length})</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {recommendations.map((recommendation, index) => (
                          <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Lightbulb sx={{ color: 'info.main', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={recommendation}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Parties and Dates */}
                {((parties.length > 0 && parties[0] !== 'Not specified') || 
                  (dates.length > 0 && dates[0] !== 'Not specified')) && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">Additional Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {parties.length > 0 && parties[0] !== 'Not specified' && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <People sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="h6">Parties Involved</Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {parties.map((party, index) => (
                                <Chip 
                                  key={index} 
                                  label={party} 
                                  variant="outlined" 
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}

                        {dates.length > 0 && dates[0] !== 'Not specified' && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Event sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="h6">Important Dates</Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {dates.map((date, index) => (
                                <Chip 
                                  key={index} 
                                  label={date} 
                                  variant="outlined" 
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button 
                    onClick={() => {
                      setAnalysis(null)
                      setAutoAnalyzeStarted(false)
                      analyzeDocument()
                    }}
                    variant="outlined" 
                    startIcon={<Refresh />}
                    sx={{ flex: 1 }}
                  >
                    Re-analyze Document
                  </Button>
                </Box>
              </Box>
              );
            })() : (
              <Box textAlign="center" py={3}>
                <Button 
                  onClick={analyzeDocument} 
                  variant="contained" 
                  size="large"
                  startIcon={<Psychology />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start AI Analysis
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Click to analyze the extracted text and get comprehensive insights
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Analysis Error
                </Typography>
                {error}
                <Box sx={{ mt: 1 }}>
                  <Button 
                    onClick={() => setError(null)}
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    onClick={analyzeDocument}
                    variant="contained" 
                    size="small"
                  >
                    Retry Analysis
                  </Button>
                </Box>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
} 
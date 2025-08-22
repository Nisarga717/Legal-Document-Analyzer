import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as pdfjsLib from 'pdfjs-dist'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  Upload,
  Description,
  Error,
  CheckCircle,
} from '@mui/icons-material'

// Configure PDF.js worker to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs'

// Fallback configuration for worker issues
const configurePDFWorker = () => {
  try {
    // Try to use local worker first
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs'
  } catch (error) {
    console.warn('Failed to configure local PDF worker, using fallback:', error)
    // Fallback to unpkg CDN with different protocol
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }
}

// Initialize worker configuration
configurePDFWorker()

interface PDFUploadProps {
  onFileUpload: (file: File) => void
  onTextExtracted: (text: string) => void
}

export function PDFUpload({ onFileUpload, onTextExtracted }: PDFUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionSuccess, setExtractionSuccess] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
      
      let fullText = ''
      const textPromises: Promise<string>[] = []

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const pagePromise = pdf.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => {
              // Handle different types of text items
              if ('str' in item) {
                return item.str
              }
              return ''
            })
            .join(' ')
          
          // Update progress
          setExtractionProgress((pageNum / pdf.numPages) * 100)
          
          return pageText
        })
        
        textPromises.push(pagePromise)
      }

      // Wait for all pages to be processed
      const pageTexts = await Promise.all(textPromises)
      fullText = pageTexts.join('\n\n')

      // Clean up the extracted text
      const cleanedText = fullText
        .replace(/\s+/g, ' ') // Replace multiple whitespaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim()

      if (!cleanedText || cleanedText.length < 50) {
        throw new Error('Could not extract sufficient readable text from the PDF. The document might be image-based, password-protected, or contain mostly non-text content.')
      }

      return cleanedText
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error((error as Error).message)
      }
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid, unprotected PDF document.')
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsExtracting(true)
    setExtractionError(null)
    setExtractionSuccess(false)
    setExtractionProgress(0)
    setTotalPages(0)

    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file only.')
      }

      // Validate file size (max 50MB for better PDF support)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB.')
      }

      onFileUpload(file)
      
      // Extract text from PDF using proper PDF.js library
      const extractedText = await extractTextFromPDF(file)
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Could not extract sufficient text from the PDF. The document might be image-based, password-protected, or contain mostly non-text content.')
      }

      onTextExtracted(extractedText)
      setExtractionSuccess(true)
    } catch (error) {
      setExtractionError(error && typeof error === 'object' && 'message' in error ? (error as Error).message : 'Unknown error occurred')
    } finally {
      setIsExtracting(false)
      setExtractionProgress(0)
    }
  }, [onFileUpload, onTextExtracted])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  return (
    <Box>
      <Paper
        {...getRootProps()}
        className="pdf-upload-area"
        sx={{
          p: 6,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : isDragReject ? 'error.main' : 'grey.600',
          bgcolor: isDragActive ? 'primary.dark' : isDragReject ? 'error.dark' : 'background.paper',
          opacity: isExtracting ? 0.7 : 1,
          pointerEvents: isExtracting ? 'none' : 'auto',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {isExtracting ? (
          <Box>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Extracting text from PDF...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {totalPages > 0 
                ? `Processing ${totalPages} pages - ${Math.round(extractionProgress)}% complete`
                : 'Initializing PDF processing...'
              }
            </Typography>
            {totalPages > 0 && (
              <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={extractionProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </Box>
        ) : extractionSuccess ? (
          <Box>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              PDF processed successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Text extracted and ready for AI analysis
            </Typography>
          </Box>
        ) : (
          <Box>
            <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your PDF here' : 'Upload Legal Document'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag and drop a PDF file here, or click to select
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Description sx={{ fontSize: 16 }} />
              <Chip label="PDF only • Max 50MB" size="small" variant="outlined" />
            </Box>
          </Box>
        )}
      </Paper>

      {extractionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            Upload Error
          </Typography>
          {extractionError}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Troubleshooting tips:</strong>
              <br />• Ensure the PDF contains selectable text (not just scanned images)
              <br />• Check if the PDF is password-protected or corrupted
              <br />• Try a different PDF file or convert images to text-based PDFs
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          <strong>Supported formats:</strong> PDF files only (up to 50MB)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          <strong>Best results:</strong> Text-based PDFs work better than scanned documents
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          <strong>Processing:</strong> Uses advanced PDF.js library for accurate text extraction
        </Typography>
      </Box>
    </Box>
  )
} 
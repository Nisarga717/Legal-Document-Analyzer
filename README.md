# LegalDoc AI - Legal Document Analyzer

A modern React application that uses AI to analyze legal documents and provide intelligent insights and Q&A capabilities.

## ✨ Features

- **🔍 Document Upload**: Secure PDF upload with drag-and-drop functionality
- **📄 Text Extraction**: Automatic text extraction from PDF documents
- **🤖 AI Analysis**: Comprehensive legal document analysis using Google Gemini AI
- **💬 Interactive Q&A**: Ask specific questions about your documents
- **🌙 Dark Theme**: Professional dark-themed UI using shadcn/ui
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.18.0 or higher)
- npm or yarn package manager
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd legal-doc-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   To get a Gemini API key:
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application.

## 📖 Usage

### Upload a Document
1. Click on the upload area or drag and drop a PDF file
2. Wait for text extraction to complete
3. The document will be automatically analyzed if AI is configured

### AI Analysis
- View comprehensive analysis including:
  - Document summary
  - Key points and provisions
  - Legal issues and risks
  - Recommendations
  - Parties involved
  - Important dates
  - Document type and jurisdiction

### Interactive Q&A
- Ask specific questions about your document
- Get AI-powered answers based on the document content
- Use suggested questions or ask custom queries
- View conversation history with timestamps

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Google Gemini AI
- **Build Tool**: Vite
- **PDF Processing**: Custom text extraction
- **File Upload**: react-dropzone
- **Icons**: Lucide React

## 📁 Project Structure

```
legal-doc-analyzer/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── PDFUpload.tsx       # File upload component
│   │   ├── DocumentAnalysis.tsx # AI analysis display
│   │   └── ChatInterface.tsx   # Q&A chat interface
│   ├── services/
│   │   └── gemini.ts          # Gemini AI service
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                # Main application
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── .env                     # Environment variables
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

### Customization

- **Theme**: The app uses a professional dark theme by default
- **UI Components**: Built with shadcn/ui for consistency and accessibility
- **File Limits**: PDF files up to 10MB are supported
- **Text Processing**: Handles both text-based and scanned PDFs

## ⚠️ Important Notes

- **Legal Disclaimer**: This tool is for informational purposes only and does not constitute legal advice
- **Privacy**: Documents are processed client-side; text is sent to Google Gemini for analysis
- **File Support**: Currently supports PDF files only
- **API Costs**: Gemini API usage may incur costs based on Google's pricing

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your `.env` file is in the root directory
   - Verify the API key is correct and active
   - Restart the development server after adding the key

2. **PDF Text Extraction Issues**
   - Ensure the PDF contains selectable text (not just images)
   - Try with a different PDF file
   - Check browser console for error messages

3. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Ensure Node.js version is compatible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add appropriate tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**⚡ Quick Start**: After installation, create a `.env` file with your Gemini API key and run `npm run dev` to get started!

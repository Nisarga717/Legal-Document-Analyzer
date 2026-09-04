# LegalDoc AI - Legal Document Analyzer (MERN Stack Monorepo)

A production-ready **MERN Stack Monorepo** application that uses AI to analyze legal documents, extract insights, persist records in MongoDB, and provide interactive Q&A capabilities.

---

## ✨ Features

- **📄 PDF Upload & Processing**: Server-side and client-side PDF text parsing.
- **🤖 Server-side AI Analysis**: Comprehensive legal document analysis using Google Gemini AI with candidate model fallbacks.
- **💾 MongoDB Database Persistence**: Stores user accounts, uploaded documents, analysis reports, and chat conversation history in MongoDB.
- **🔐 JWT Authentication**: User registration and sign-in with hashed password security.
- **💬 Persistent Q&A Chat**: Ask specific questions about your documents with context saved to MongoDB.
- **🌙 Dark Theme UI**: Professional dark-themed UI built with React, TypeScript, and Material-UI v7.

---

## 📁 Repository Structure

```text
legal-doc-analyzer/
├── package.json                 # Monorepo scripts (concurrently dev runner)
├── .env.example                 # Environment variables template
├── client/                      # React + Vite + TypeScript Frontend App
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/          # Auth, PDFUpload, DocumentAnalysis, ChatInterface
│       ├── services/            # REST API Client & Gemini AI service
│       └── App.tsx
└── server/                      # Express + Node + Mongoose Backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── config/              # MongoDB connection (db.ts)
        ├── controllers/         # authController, docController, chatController
        ├── middleware/          # authMiddleware, uploadMiddleware
        ├── models/              # User, Document, Analysis, Chat schemas
        ├── routes/              # authRoutes, docRoutes, chatRoutes
        └── server.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.0.0 or higher)
- MongoDB instance (local `mongodb://127.0.0.1:27017/legaldoc` or MongoDB Atlas Cloud URI)
- Google Gemini API key from [Google AI Studio](https://ai.google.dev/)

---

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd legal-doc-analyzer
   ```

2. **Install All Monorepo Dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**

   Create `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/legaldoc
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Create `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start Development Servers (Client & Server Concurrently)**
   ```bash
   npm run dev
   ```

5. **Access Application**
   Open your browser at `http://localhost:5173`.

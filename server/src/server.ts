import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import docRoutes from './routes/docRoutes';
import chatRoutes from './routes/chatRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production set FRONTEND_URL=https://your-app.netlify.app on Render.
// Multiple origins can be comma-separated: "https://a.netlify.app,https://b.com"
const allowedOrigins: string[] = [];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((u) => allowedOrigins.push(u.trim()));
}

// Always allow localhost for local development
allowedOrigins.push('http://localhost:5173');
allowedOrigins.push('http://localhost:3000');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In non-production, allow all origins
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LegalDoc AI Express Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 LegalDoc AI Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`=================================`);
});

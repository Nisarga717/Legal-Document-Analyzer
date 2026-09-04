import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  extractedText: string;
  documentType?: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, required: true },
  originalFileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  extractedText: { type: String, required: true },
  documentType: { type: String, default: 'Legal Document' },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocument>('LegalDocument', DocumentSchema);

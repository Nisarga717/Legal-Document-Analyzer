import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyClause {
  title: string;
  content: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface IAnalysis extends Document {
  documentId: mongoose.Types.ObjectId;
  summary: string;
  riskScore: number; // 1-10
  keyClauses: IKeyClause[];
  redFlags: string[];
  recommendations: string[];
  partiesInvolved: string[];
  rawAnalysisText: string;
  createdAt: Date;
}

const KeyClauseSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' }
});

const AnalysisSchema: Schema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: 'LegalDocument', required: true },
  summary: { type: String, required: true },
  riskScore: { type: Number, default: 5 },
  keyClauses: [KeyClauseSchema],
  redFlags: [{ type: String }],
  recommendations: [{ type: String }],
  partiesInvolved: [{ type: String }],
  rawAnalysisText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);

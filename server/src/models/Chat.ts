import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IChat extends Document {
  documentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema: Schema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'LegalDocument', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);

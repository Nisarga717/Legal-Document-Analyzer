import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/legaldoc';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected to database "${conn.connection.name}" at host "${conn.connection.host}"`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Database connection failed: ${(error as Error).message}`);
    console.warn('[MongoDB Warning] Operating in fallback mode. Ensure MongoDB is running or configure MONGO_URI.');
  }
};

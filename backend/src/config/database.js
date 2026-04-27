import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
}

// MongoDB Connection
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Mock pool object for backward compatibility with existing server.js health check
export const pool = {
  query: async (text, params) => {
    // Basic connectivity check for health endpoint
    if (text === 'SELECT 1') {
      if (mongoose.connection.readyState === 1) {
        return { rows: [{ '1': 1 }], rowCount: 1 };
      }
      throw new Error('Database not connected');
    }
    console.warn('⚠️ SQL Query attempted on MongoDB-configured backend. This requires refactoring.');
    throw new Error('SQL queries are not supported on this MongoDB-native configuration.');
  }
};

// Mock query function for backward compatibility with routes
export const query = pool.query;

export default connectDB;


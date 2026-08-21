import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: process.env.PORT || 5000,
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321', // mock default
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

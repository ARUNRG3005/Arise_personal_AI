import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().default('arise-jwt-secret-change-in-production-make-it-long-and-random'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_PROVIDER: z.enum(['groq', 'openai', 'gemini', 'claude', 'ollama']).default('groq'),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  SINGLE_USER_MODE: z.coerce.boolean().default(true),
  DEFAULT_USER_EMAIL: z.string().email().default('user@arise.local'),
  DEFAULT_USER_NAME: z.string().default('User'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  // Don't crash immediately in dev mode, print errors and proceed with mock settings if necessary
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production',
      PORT: parseInt(process.env.PORT || '3001', 10),
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
      JWT_SECRET: process.env.JWT_SECRET || 'arise-jwt-secret-change-in-production-make-it-long-and-random',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      AI_PROVIDER: (process.env.AI_PROVIDER || 'groq') as 'groq' | 'openai' | 'gemini' | 'claude' | 'ollama',
      GROQ_API_KEY: process.env.GROQ_API_KEY || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      SINGLE_USER_MODE: process.env.SINGLE_USER_MODE !== 'false',
      DEFAULT_USER_EMAIL: process.env.DEFAULT_USER_EMAIL || 'user@arise.local',
      DEFAULT_USER_NAME: process.env.DEFAULT_USER_NAME || 'User',
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || '',
      TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
    };

// Critical security check for production environments
if (env.NODE_ENV === 'production' && (
  env.JWT_SECRET.includes('change-in-production') ||
  env.JWT_SECRET === 'arise-jwt-secret-change-in-production-make-it-long-and-random'
)) {
  console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET has not been changed from default in production. Exiting.');
  process.exit(1);
}

// Log warning if Tavily key is missing
if (!env.TAVILY_API_KEY) {
  console.warn('⚠️ WARNING: TAVILY_API_KEY is not defined. Live web search will not be available, falling back to LLM-only responses.');
}

import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes';

dotenv.config();

// Diagnostic logging upon server module load (visible in Vercel Runtime Logs)
const detectedMongo =
  process.env.MONGODB_URI ||
  process.env.mongodb_uri ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URL;

if (detectedMongo && detectedMongo.trim().length > 0) {
  const masked = detectedMongo.trim().replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  console.log(`[Express Startup] ✅ MONGODB_URI detectada en process.env (Longitud: ${detectedMongo.trim().length} chars, Destino: ${masked})`);
} else {
  console.warn('[Express Startup] ⚠️ MONGODB_URI NO detectada en process.env. El servidor usará almacenamiento en memoria (Modo Local).');
}

export const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server console logger to trace API calls in Vercel Runtime Logs
app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.includes('db') || req.url.includes('health') || req.url.includes('auth')) {
    console.log(`[Express API] ${req.method} ${req.url}`);
  }
  next();
});

// Mount on both '/api' and '/' for complete compatibility with all Vercel serverless configurations
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;

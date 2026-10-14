import app from '../server/app';

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Fatal Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error interno en la función serverless de Vercel',
        message: error?.message || String(error),
        stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined
      });
    }
  }
}

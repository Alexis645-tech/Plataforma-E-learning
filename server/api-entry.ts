import app from './app';

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error interno en la función serverless',
        message: err?.message || String(err),
      });
    }
  }
}

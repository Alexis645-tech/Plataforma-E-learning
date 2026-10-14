export default async function handler(req: any, res: any) {
  // CORS & quick diagnostics
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Diagnostic ping route to test basic function execution and environment variables
  if (req.url === '/api/ping' || req.url === '/ping') {
    const detectedMongo =
      process.env.MONGODB_URI ||
      process.env.mongodb_uri ||
      process.env.DATABASE_URL ||
      process.env.MONGO_URL;

    return res.status(200).json({
      pong: true,
      nodeVersion: process.version,
      hasMongoUri: Boolean(detectedMongo),
      mongoUriLength: detectedMongo ? detectedMongo.length : 0,
      envKeys: Object.keys(process.env).filter(
        (k) => !k.includes('KEY') && !k.includes('SECRET') && !k.includes('TOKEN') && !k.includes('PASS')
      ),
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { default: app } = await import('../server/app');
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Catch]:', error);
    return res.status(500).json({
      success: false,
      error: 'CRASH_IN_VERCEL_HANDLER',
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    });
  }
}

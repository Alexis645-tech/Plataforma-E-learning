import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { app } from './server/app';
import { getMongoClient } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3001;

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware could not be loaded directly:', err);
    }
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: any, res: any) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = PORT + 1;
      console.warn(`[Server] Puerto en uso, intentando en http://localhost:${nextPort}...`);
      server.listen(nextPort, () => {
        console.log(`EduSphere LMS server running on http://localhost:${nextPort}`);
        getMongoClient().catch(() => {});
      });
    } else {
      console.error('[Server Error]', err);
    }
  });

  server.listen(PORT, () => {
    console.log(`EduSphere LMS server with MongoDB API running on http://localhost:${PORT}`);
    getMongoClient().catch(() => {});
  });
}

startServer();

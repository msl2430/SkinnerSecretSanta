import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';
import { SEED_STATE } from './src/shared/seedData.js';
import { handleApiRequest } from './src/shared/apiRouter.js';

const DATA_FILE = path.resolve(process.cwd(), 'data/santa-state.json');

function localSantaApiPlugin(envVars) {
  return {
    name: 'local-santa-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;
        const method = (req.method || 'GET').toUpperCase();

        let body = {};
        if (method !== 'GET' && method !== 'HEAD') {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          try {
            body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            body = {};
          }
        }

        async function getState() {
          try {
            if (fs.existsSync(DATA_FILE)) {
              return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            }
          } catch (e) {
            console.error('Error reading local state file, falling back to seed:', e);
          }
          const seed = JSON.parse(JSON.stringify(SEED_STATE));
          fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
          fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
          return seed;
        }

        async function saveState(newState) {
          fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
          fs.writeFileSync(DATA_FILE, JSON.stringify(newState, null, 2), 'utf-8');
        }

        try {
          const result = await handleApiRequest({
            method,
            path: pathname,
            body,
            getState,
            saveState,
            env: envVars
          });
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.data));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Server error' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue(), localSantaApiPlugin(env)],
      server: {
          port: 5173,
          open: true,
          watch: {
              ignored: ['**/.vs/**', '**/data/**']
          }
      }
  };
});

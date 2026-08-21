import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Import Routes (will be created next)
import apiRoutes from './routes/index';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', apiRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(env.port, () => {
  console.log(`Cogniva Backend MVP running on port ${env.port}`);
});

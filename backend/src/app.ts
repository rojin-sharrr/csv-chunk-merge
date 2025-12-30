import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';

import csvRoutes from './routes/csvRoutes';

const app = express();
configDotenv();

// Middlewares(Cors & Body Parsing)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router Setup
app.use('/api', csvRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// generic fallback handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;


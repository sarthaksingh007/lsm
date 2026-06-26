import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import loanRoutes from './routes/loan.routes';
import paymentRoutes from './routes/payment.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { notFound, errorHandler } from './middleware/error';

const PORT = Number(process.env.PORT || 5100);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3100';

async function main() {
  await connectDB(MONGO_URI);

  const app = express();
  // Security headers. Allow cross-origin loading of uploaded files so the
  // frontend (different port) can render salary slips served from /uploads.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Throttle auth endpoints to blunt credential-stuffing / brute-force.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts — please try again later.' },
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});

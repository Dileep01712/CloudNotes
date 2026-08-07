const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const connectToMongo = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

connectToMongo();

app.set("trust proxy", true);
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please slow down.',
  skip: (req) => req.path === '/health',
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, try again after 15 minutes',
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/note', require('./routes/note'));
app.use('/api/folder', require('./routes/folder'));
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  console.error(err.stack);
  res.status(status).json({ message });
});

const server = app.listen(PORT, () => {
  const url = process.env.NODE_ENV === 'production'
    ? 'production on Render'
    : `http://localhost:${PORT}`;

  console.log(`CloudNotes Backend listening on: ${url}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  gracefulShutdown();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});
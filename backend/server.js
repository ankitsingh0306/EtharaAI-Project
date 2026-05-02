const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes    = require('./routes/tasks');
const userRoutes    = require('./routes/users');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/users',    userRoutes);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Connect + Listen ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB error:', err.message);
    process.exit(1);
  });

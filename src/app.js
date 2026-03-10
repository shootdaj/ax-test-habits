const express = require('express');
const cors = require('cors');
const path = require('path');

const habitsRouter = require('./routes/habits');
const checkinsRouter = require('./routes/checkins');
const statsRouter = require('./routes/stats');
const categoriesRouter = require('./routes/categories');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(habitsRouter);
app.use(checkinsRouter);
app.use(statsRouter);
app.use(categoriesRouter);

// Catch-all: serve index.html for any non-API route (SPA fallback)
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

module.exports = app;

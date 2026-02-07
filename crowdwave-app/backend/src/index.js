const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

// Import routes
const dataSourcesRouter = require('./routes/dataSources');
const segmentsRouter = require('./routes/segments');
const surveysRouter = require('./routes/surveys');
const simulationsRouter = require('./routes/simulations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/data-sources', dataSourcesRouter);
app.use('/api/segments', segmentsRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/simulate', simulationsRouter);
app.use('/api/results', simulationsRouter); // Same router handles both

// Serve uploaded files (for development)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 100MB)' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function start() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized.');
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║           Crowdwave Backend API Server                ║
╠═══════════════════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}                    ║
╠═══════════════════════════════════════════════════════╣
║  Endpoints:                                           ║
║    POST   /api/data-sources    Upload files           ║
║    GET    /api/data-sources    List data sources      ║
║    POST   /api/segments        Create segment         ║
║    GET    /api/segments        List segments          ║
║    POST   /api/surveys         Create survey          ║
║    GET    /api/surveys         List surveys           ║
║    POST   /api/simulate        Run simulation         ║
║    GET    /api/results/:id     Get results            ║
║    GET    /health              Health check           ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;

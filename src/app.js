// Express app configuration - registers routes and middleware

const express = require('express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Parse URL-encoded bodies (Twilio sends form data)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use(logger);

// Register routes
app.use('/api', routes);

// Health check endpoint (not through routes to keep it simple)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'municipal-call-center'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;

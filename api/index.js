// Vercel serverless function entry point
// This file wraps the Express app for Vercel deployment

// Set Vercel environment before importing
process.env.VERCEL = 'true';

// Import and export the Express app
// Wrap in try-catch to handle import errors gracefully
let app;

try {
  const serverModule = await import('../server/server.js');
  app = serverModule.default;
} catch (error) {
  console.error('Failed to import server:', error);
  // Create minimal error handler app
  const express = (await import('express')).default;
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
}

export default app;

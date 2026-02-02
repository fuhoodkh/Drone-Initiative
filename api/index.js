// Vercel serverless function entry point
// This file wraps the Express app for Vercel deployment

// Set Vercel environment before importing
process.env.VERCEL = 'true';

// Import and export the Express app
// Note: Top-level await is supported in ES modules
import app from '../server/server.js';

export default app;

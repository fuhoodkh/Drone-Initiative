// Simple health check endpoint that doesn't require database
// This helps diagnose Vercel deployment issues

export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Health check endpoint working',
    environment: process.env.NODE_ENV || 'development'
  });
}

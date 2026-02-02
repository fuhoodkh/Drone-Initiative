# How to Start the Server

## Quick Start
```bash
cd server
npm start
```

The server will start on `http://localhost:3000`

## Verify Server is Running
1. Open browser to `http://localhost:3000`
2. You should see the login page
3. Check server console for startup messages

## If Server Won't Start

### Check for Port Conflicts
```bash
netstat -ano | findstr :3000
```
If port 3000 is in use, either:
- Stop the process using port 3000
- Change PORT in server.js or use environment variable

### Install Dependencies
```bash
cd server
npm install
```

### Check for Errors
Look for error messages in the console when starting the server.

## Server Status
- **Port:** 3000 (default)
- **Health Check:** http://localhost:3000/api/health
- **Main App:** http://localhost:3000/

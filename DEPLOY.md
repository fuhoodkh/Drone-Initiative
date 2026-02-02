# Deployment Guide for Render

## Prerequisites
- Render account (free tier works)
- Git repository (GitHub/GitLab/Bitbucket)

## Deployment Steps

### 1. Push to Git Repository
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Name**: `drone-initiative-platform`
   - **Root Directory**: `server` (important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free/Starter

### 3. Environment Variables

Add these in Render dashboard → Environment:

- `NODE_ENV` = `production`
- `JWT_SECRET` = (Generate a strong random string, e.g., use `openssl rand -hex 32`)
- `PORT` = `3000` (Render sets this automatically, but good to have)

### 4. Health Check

Render will automatically use `/api/health` endpoint.

### 5. After Deployment

1. **Create Admin User**: 
   - The system creates a default admin on first run
   - Username: `admin`
   - Password: `admin123`
   - **CHANGE THIS IMMEDIATELY** after first login

2. **Access Your Platform**:
   - Your URL will be: `https://drone-initiative-platform.onrender.com`
   - Or your custom domain if configured

### 6. Database Persistence

- SQLite database is stored in `server/data/`
- On Render free tier, this persists between deployments
- For production, consider upgrading to a managed PostgreSQL database

## Troubleshooting

### Build Fails
- Check that `server/package.json` exists
- Verify Node.js version (should be 18+)

### App Won't Start
- Check logs in Render dashboard
- Verify `PORT` environment variable
- Check that database directory is writable

### 404 Errors
- Verify static files are being served from `platform/` directory
- Check that `server/server.js` has correct path to platform files

### Database Errors
- Ensure `data/` directory exists and is writable
- Check file permissions

## Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Test login functionality
- [ ] Test file upload/download
- [ ] Test section metadata updates
- [ ] Verify all sections render correctly
- [ ] Test role-based access (admin/editor/viewer)
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on Render)

## Notes

- Free tier on Render spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for always-on service
- Database is stored in ephemeral filesystem on free tier (backup regularly)

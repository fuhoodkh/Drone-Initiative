# Vercel Deployment Guide

## ✅ Configuration Files Created

1. **`vercel.json`** - Vercel deployment configuration
2. **`api/index.js`** - Serverless function entry point for Vercel

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `fuhood-Khas/Drone-Initiative`
4. Vercel will auto-detect the configuration
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## ⚙️ Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

- `NODE_ENV` = `production`
- `JWT_SECRET` = (generate a secure random string)
- `PORT` = (Vercel sets this automatically)

## 📝 Important Notes

### Database Storage
- **SQLite on Vercel**: The database file is stored in `/tmp/data/` which is **ephemeral**
- **Data will be lost** when the serverless function restarts
- **Recommendation**: For production, consider migrating to:
  - PostgreSQL (Vercel Postgres)
  - MongoDB Atlas
  - Supabase
  - Or another persistent database service

### File Uploads
- Uploaded files are stored in `/tmp/uploads/` which is also **ephemeral**
- Files will be lost on function restart
- **Recommendation**: Use cloud storage:
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary
  - Or another object storage service

### Current Limitations
1. **Ephemeral Storage**: Both database and uploads use temporary storage
2. **Cold Starts**: First request after inactivity may be slower
3. **Function Timeout**: Vercel free tier has execution time limits

## 🔧 Troubleshooting

### 404 Error
- Ensure `vercel.json` is in the root directory
- Check that `api/index.js` exists and exports the app correctly
- Verify routes in `vercel.json` are correct

### Database Errors
- Check that `/tmp/data` directory is being created
- Verify SQLite is working in serverless environment
- Consider using a managed database service

### Build Errors
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs in Vercel dashboard

## 📦 Project Structure for Vercel

```
.
├── api/
│   └── index.js          # Serverless function entry
├── server/
│   ├── server.js         # Express app (exports for Vercel)
│   ├── db.js
│   ├── routes/
│   └── ...
├── platform/             # Frontend static files
├── docs/                 # Static assets
├── vercel.json           # Vercel configuration
└── package.json
```

## 🎯 Next Steps

1. **Deploy to Vercel** using one of the methods above
2. **Set environment variables** in Vercel dashboard
3. **Test the deployment**:
   - Health check: `https://your-project.vercel.app/api/health`
   - Main app: `https://your-project.vercel.app/`
4. **Consider database migration** for persistent storage
5. **Set up file storage** for uploads

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

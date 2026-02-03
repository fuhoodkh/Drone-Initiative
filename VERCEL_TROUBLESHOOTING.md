# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. FUNCTION_INVOCATION_FAILED (500 Error)

**Possible Causes:**
- SQLite3 native bindings not compatible with Vercel's serverless environment
- Database initialization failing
- Missing dependencies

**Solutions:**

#### Option A: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for specific error messages
3. Check Runtime Logs for initialization errors

#### Option B: SQLite3 Alternative
SQLite3 uses native bindings that may not work on Vercel. Consider:
- Using `better-sqlite3` (if compatible)
- Migrating to a cloud database (PostgreSQL, MongoDB, etc.)

#### Option C: Add Error Handling
The current setup includes error handling, but you may need to:
- Check if `/tmp` directory is writable
- Verify database path is correct
- Ensure all dependencies are in `package.json`

### 2. Database Path Issues

**On Vercel:**
- Database: `/tmp/data/platform.db`
- Uploads: `/tmp/uploads/`

**Note:** `/tmp` is ephemeral - data is lost on function restart.

### 3. Missing Dependencies

Ensure all dependencies are in `server/package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.6"
  }
}
```

### 4. Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:
- `JWT_SECRET` - Required for authentication
- `NODE_ENV` - Set to `production`

### 5. Recommended: Use Cloud Database

For production, consider migrating from SQLite to:
- **Vercel Postgres** (recommended for Vercel)
- **MongoDB Atlas** (free tier available)
- **Supabase** (PostgreSQL with free tier)
- **PlanetScale** (MySQL with free tier)

### 6. Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the failed deployment
3. Check "Build Logs" for errors
4. Check "Runtime Logs" for runtime errors

### 7. Test Locally First

Before deploying to Vercel:
```bash
# Set Vercel environment
export VERCEL=true

# Run the server
cd server
npm start
```

### 8. Alternative: Use Render Instead

If Vercel continues to have issues with SQLite3:
- Render supports persistent storage better
- Already configured in `render.yaml`
- Better for traditional Node.js apps

## Quick Fix Checklist

- [ ] Check Vercel logs for specific error
- [ ] Verify all dependencies in `package.json`
- [ ] Set environment variables in Vercel
- [ ] Check if SQLite3 is the issue (native bindings)
- [ ] Consider migrating to cloud database
- [ ] Test health endpoint: `/api/health`
- [ ] Verify `vercel.json` configuration

## Next Steps

1. **Check Vercel Logs** - Most important step
2. **If SQLite3 is the issue** - Consider database migration
3. **If initialization fails** - Check `/tmp` directory permissions
4. **If still failing** - Consider using Render instead (already configured)

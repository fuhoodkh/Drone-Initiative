# Render Deployment Fix Instructions

## Current Issue
Render is auto-detecting `yarn` from root `package.json` instead of using `npm` from `server/` directory.

## Solution Applied
1. ✅ Set `rootDir: server` in `render.yaml`
2. ✅ Added `.npmrc` files to force npm
3. ✅ Simplified build/start commands (since rootDir is server)

## Manual Fix in Render Dashboard

If the automatic deployment still fails, you need to manually configure in Render Dashboard:

### Step 1: Go to Service Settings
1. Open your service in Render Dashboard
2. Go to **Settings** tab
3. Scroll to **Build & Deploy** section

### Step 2: Update Build Command
- **Build Command**: `npm install`
- Make sure it's `npm install` (not `yarn`)

### Step 3: Update Start Command  
- **Start Command**: `npm start`
- Make sure it's `npm start` (not `yarn start`)

### Step 4: Verify Root Directory
- **Root Directory**: `server`
- This ensures all commands run from the `server/` directory

### Step 5: Save and Redeploy
1. Click **Save Changes**
2. Go to **Manual Deploy** → **Deploy latest commit**

## Why This Happens
Render auto-detects package managers. If it finds a `package.json` in root, it may try to use `yarn` first. By setting `rootDir: server`, we tell Render to work from the server directory where the actual `package.json` with dependencies is located.

## Verification
After deployment, check logs for:
- ✅ `==> Running build command 'npm install'...` (not yarn)
- ✅ `==> Running 'npm start'` (not yarn start)
- ✅ Dependencies installed in `server/node_modules`
- ✅ Server starts successfully

## If Still Failing
1. Check Render logs for specific error
2. Verify `server/package.json` has all dependencies
3. Ensure `server/package-lock.json` exists (forces npm)
4. Contact Render support if issue persists

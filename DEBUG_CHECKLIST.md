# Debug Checklist

## If Nothing Shows in Console

1. **Check if script is loading**:
   - Open Network tab (F12 → Network)
   - Refresh page
   - Look for `app.js` - should show 200 status
   - If 404, server isn't serving files correctly

2. **Check for CORS errors**:
   - Look for red errors about CORS
   - Should not happen on same origin

3. **Check for module errors**:
   - Look for "Failed to load module" errors
   - Check if `api.js` is accessible

4. **Verify server is running**:
   - Terminal should show "✓ Server running on port 3000"
   - Try accessing http://localhost:3000/app.js directly

5. **Check browser console filter**:
   - Make sure "All levels" is selected
   - Not filtered to "Errors only"

## Quick Test

Open browser console and type:
```javascript
console.log('Test');
document.getElementById('sectionsGrid');
```

If first works but second returns null, DOM isn't ready.
If both work, script should be running.

## Common Issues

1. **Server not running**: Start with `cd server && npm start`
2. **Wrong port**: Check terminal for actual port
3. **Cached old version**: Hard refresh (Ctrl+Shift+R)
4. **Module import failing**: Check Network tab for api.js

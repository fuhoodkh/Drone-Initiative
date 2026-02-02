# Migration Notes - IndexedDB to Backend API

## What's Been Completed ✅

1. **Backend API Structure**
   - Node.js/Express server (`server/server.js`)
   - SQLite database with proper schema
   - Authentication system (JWT-based)
   - File upload/download endpoints
   - Section metadata management
   - Online links management
   - Audit logging

2. **Section Reorganization**
   - All sections now use phase-based codes (01_STRATEGY ... 08_CLOSURE)
   - Added missing critical sections:
     - Program Charter (01-STR-PROGRAM_CHARTER)
     - Regulatory & Compliance (03-COMP-REGULATORY)
     - Data & Privacy (06-DATA-PRIVACY)
     - Monitoring & Impact (07-MON-IMPACT)
     - Program Closure (08-CLOSE-CLOSURE)

3. **Deployment Configuration**
   - `render.yaml` for Render deployment
   - `DEPLOY.md` with deployment instructions
   - Environment variable setup

## What Needs to Be Completed ⚠️

### Frontend Migration (Critical)

The frontend (`platform/app.js`) still uses IndexedDB. To complete the migration:

1. **Replace IndexedDB Functions**
   - Remove all `idbSet`, `idbGet`, `idbDel` calls
   - Replace with API calls from `platform/api.js`

2. **Update Key Functions**
   - `getSectionMeta()` → Use `API.getSectionMeta()`
   - `setSectionFile()` → Use `API.uploadSectionFile()`
   - `downloadSection()` → Use `API.downloadSectionFile()`
   - `clearSection()` → Use `API.deleteSectionFile()`
   - Link management → Use `API.addSectionLink()`, `API.removeSectionLink()`

3. **Add Authentication UI**
   - Login modal/page
   - Token management
   - Auto-logout on token expiry
   - Role-based UI updates

4. **Update Metadata Management**
   - Replace local metadata editing with API calls
   - Use `API.updateSectionMeta()` for owner/approver/status updates

### Quick Migration Path

1. **Option A: Gradual Migration**
   - Keep IndexedDB as fallback
   - Add API calls alongside existing code
   - Migrate section by section

2. **Option B: Full Replacement** (Recommended)
   - Replace all storage functions at once
   - Test thoroughly
   - Remove IndexedDB code completely

### Example Migration Pattern

**Before (IndexedDB):**
```javascript
async function getSectionMeta(sectionCode) {
  return await idbGet(STORE_META, sectionCode);
}
```

**After (API):**
```javascript
async function getSectionMeta(sectionCode) {
  try {
    return await API.getSectionMeta(sectionCode);
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

## Testing Checklist

- [ ] Login/logout works
- [ ] File upload works
- [ ] File download works
- [ ] Metadata updates work
- [ ] Online links add/remove works
- [ ] Role-based permissions work (viewer can't edit)
- [ ] All sections load correctly
- [ ] Phase codes display correctly

## Next Steps

1. Complete frontend migration (see above)
2. Test locally with backend running
3. Deploy to Render
4. Create admin user
5. Test in production
6. Remove IndexedDB code completely

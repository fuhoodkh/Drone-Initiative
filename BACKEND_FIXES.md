# Backend Fixes and User Setup

## ✅ Issues Fixed

### 1. User Management
- Created user initialization script (`server/init-users.js`)
- Fixed default admin password hash to use proper bcrypt
- Added users:
  - **admin** / admin123 (admin role)
  - **hazaa** / admin123 (admin role)
  - **ghaida** / editor123 (editor role - access to all sections)
  - **Reham** / editor123 (editor role - access to all sections)

### 2. Share Access Functionality
- Enhanced error handling in share modal
- Added comprehensive logging for debugging
- Fixed API endpoint mapping (`/permissions/users/list`)
- Improved user feedback with bilingual error messages

### 3. Date Display Issue
- Fixed "Invalid Date" display by mapping database field `updated_at` to `updatedAt` in API response
- Added proper date validation and fallback handling

### 4. Database Initialization
- Removed placeholder password hash from `db.js`
- Users are now properly created with bcrypt hashed passwords

## 🚀 How to Use

### Initial Setup (First Time)
```bash
cd server
node init-users.js
```

This will:
- Initialize the database
- Create/update all users with proper password hashing
- Set up proper roles

### Running the Server
```bash
cd server
npm start
```

The server will run on `http://localhost:3000`

## 👥 User Accounts

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | admin123 | Admin | Full access to all sections |
| hazaa | admin123 | Admin | Full access to all sections |
| ghaida | editor123 | Editor | Access to all sections (can edit) |
| Reham | editor123 | Editor | Access to all sections (can edit) |

## 🔧 Share Access Feature

The share access feature allows admins and editors to:
1. Click the share button (🔗) on any section card
2. Select users to share the section with
3. Grant view or edit permissions
4. Revoke access when needed

**Note:** Editors have access to all sections by default. Sharing is primarily for viewers who need access to specific sections.

## 📝 Notes

- All passwords should be changed in production
- The JWT_SECRET should be set as an environment variable in production
- Database file is stored in `server/data/platform.db`
- Uploaded files are stored in `server/uploads/`

## 🐛 Troubleshooting

If share access is not working:
1. Check browser console for errors
2. Verify user is logged in as admin or editor
3. Check server logs for API errors
4. Ensure the user you're sharing with exists in the database

// DI Platform (backend API): section guides + upload/download per section.
// Storage: Backend API (files + metadata).
import * as API from './api.js';

// Remove all IndexedDB code and replace with API calls
// This is a simplified version - full migration would require updating all functions

const SECTIONS = []; // Will be populated from the original file

// Replace getSectionMeta
async function getSectionMeta(sectionCode) {
  try {
    return await API.getSectionMeta(sectionCode);
  } catch (error) {
    console.error('Error fetching section meta:', error);
    return null;
  }
}

// Replace setSectionFile
async function setSectionFile(sectionCode, file) {
  try {
    await API.uploadSectionFile(sectionCode, file);
    // Update metadata after upload
    const meta = await API.getSectionMeta(sectionCode);
    if (meta) {
      await API.updateSectionMeta(sectionCode, {
        ...meta,
        filename: file.name,
        filesize: file.size,
        mime_type: file.type,
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Replace downloadSection
async function downloadSection(sectionCode) {
  try {
    await API.downloadSectionFile(sectionCode);
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
}

// Replace clearSection
async function clearSection(sectionCode) {
  try {
    await API.deleteSectionFile(sectionCode);
  } catch (error) {
    console.error('Error clearing section:', error);
    throw error;
  }
}

// Check authentication on load
async function checkAuth() {
  const user = API.getCurrentUser();
  if (!user) {
    // Redirect to login or show login modal
    showLoginModal();
    return false;
  }
  return true;
}

function showLoginModal() {
  // Simple login modal - can be enhanced
  const username = prompt('Username:');
  const password = prompt('Password:');
  if (username && password) {
    API.login(username, password).then(() => {
      location.reload();
    }).catch(err => {
      alert('Login failed: ' + err.message);
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    // Continue with normal initialization
    // ... rest of the app code
  }
});

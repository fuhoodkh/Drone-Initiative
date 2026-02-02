// API client for backend communication
const API_BASE = window.location.origin + '/api';

let authToken = localStorage.getItem('di_auth_token') || null;
let currentUser = JSON.parse(localStorage.getItem('di_user') || 'null');

export function setAuthToken(token, user) {
  authToken = token;
  currentUser = user;
  if (token) {
    localStorage.setItem('di_auth_token', token);
    localStorage.setItem('di_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('di_auth_token');
    localStorage.removeItem('di_user');
  }
}

export function getAuthToken() {
  return authToken;
}

export function getCurrentUser() {
  return currentUser;
}

function apiRequest(method, endpoint, body = null) {
  const url = API_BASE + endpoint;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

// Auth
export async function login(username, password) {
  const result = await apiRequest('POST', '/auth/login', { username, password });
  setAuthToken(result.token, result.user);
  return result;
}

export async function register(username, password, role = 'viewer') {
  return apiRequest('POST', '/auth/register', { username, password, role });
}

// Sections
export async function getSectionMeta(sectionCode) {
  try {
    return await apiRequest('GET', `/sections/${sectionCode}`);
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}

export async function updateSectionMeta(sectionCode, meta) {
  return apiRequest('PUT', `/sections/${sectionCode}`, meta);
}

// Files
export async function uploadSectionFile(sectionCode, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = API_BASE + `/files/${sectionCode}`;
  const options = {
    method: 'POST',
    headers: {},
  };
  
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const res = await fetch(url, {
    ...options,
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export async function downloadSectionFile(sectionCode) {
  const url = API_BASE + `/files/${sectionCode}`;
  const options = {
    method: 'GET',
    headers: {},
  };
  
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const res = await fetch(url, options);
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('File not found');
    }
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  
  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition');
  const filename = contentDisposition 
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
    : `${sectionCode}.bin`;
  
  // Trigger download
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
  
  return { blob, filename };
}
  const options = {
    method: 'GET',
    headers: {},
  };
  
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const res = await fetch(url, options);
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  
  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition');
  let filename = `${sectionCode}.pdf`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/i);
    if (match) filename = match[1];
  }
  
  const urlObj = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlObj;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(urlObj), 500);
  
  return true;
}

export async function deleteSectionFile(sectionCode) {
  return apiRequest('DELETE', `/files/${sectionCode}`);
}

// Links
export async function addSectionLink(sectionCode, title, url) {
  return apiRequest('POST', `/sections/${sectionCode}/links`, { title, url });
}

export async function removeSectionLink(sectionCode, linkId) {
  return apiRequest('DELETE', `/sections/${sectionCode}/links/${linkId}`);
}

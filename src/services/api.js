const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { store } from '../store/index.js';

const getHeaders = () => {
  let token = localStorage.getItem('pawora_token');
  
  // Clean up legacy simulated tokens
  if (token && token.startsWith('token_')) {
    localStorage.removeItem('pawora_token');
    token = null;
  }

  if (!token && store) {
    const state = store.getState();
    if (state?.auth?.token && !state.auth.token.startsWith('token_')) {
      token = state.auth.token;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid or expired session tokens
        localStorage.removeItem('pawora_token');
      }
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error.message);
    throw error;
  }
};

export const apiUploadRequest = async (endpoint, formData, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('pawora_token');
  
  const headers = {
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
      ...options,
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Upload Error [${endpoint}]:`, error.message);
    throw error;
  }
};

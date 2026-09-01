const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { store } from '../store/index.js';

const getHeaders = () => {
  let token = localStorage.getItem('pawora_token');
  
  if (!token && store) {
    const state = store.getState();
    if (state && state.auth && state.auth.token) {
      token = state.auth.token;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error("API getHeaders: Token is completely missing from both localStorage and Redux store!");
  }

  // Pass user ID for backend mock auth simulation
  if (store) {
    const state = store.getState();
    if (state?.auth?.user?._id) {
      headers['x-mock-user-id'] = state.auth.user._id;
    }
  }

  return headers;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const config = {
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
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error.message, "Headers sent:", headers);
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

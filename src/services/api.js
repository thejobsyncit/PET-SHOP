const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pet-shop-server-ten.vercel.app/api' : 'http://localhost:5001/api');

// ⚡ Pre-warm production serverless backend on initial page load to eliminate cold start latency
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    const healthUrl = API_BASE_URL.replace(/\/api\/?$/, '') + '/health';
    fetch(healthUrl, { method: 'GET', keepalive: true }).catch(() => {});
  } catch {
    // Non-blocking pre-warm ping
  }
}

const getHeaders = () => {
  let token = localStorage.getItem('joshpetshub_token');

  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token && token !== 'undefined' && token !== 'null') {
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

  // Safe timeout (15s default) to prevent requests hanging indefinitely on cold network
  if (!config.signal && typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    config.signal = AbortSignal.timeout(options.timeout || 15000);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
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
  const token = localStorage.getItem('joshpetshub_token');
  
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

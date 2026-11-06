// Configure API base URL based on environment
const getApiUrl = () => {
  if (__DEV__) {
    // Development - use localhost for simulator or your Replit domain for physical device
    // For testing on physical device, replace with your Replit domain:
    // return 'https://your-repl-name.your-username.repl.co';
    return 'http://localhost:5000';
  }
  // Production - update this with your deployed backend URL
  return 'https://your-production-domain.com';
};

export const API_BASE_URL = getApiUrl();

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
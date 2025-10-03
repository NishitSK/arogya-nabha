// API utility with robust error handling
export class ApiError extends Error {
  constructor(public status: number, message: string, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Response text:', text);
          throw new ApiError(response.status, 'Invalid JSON response from server');
        }
      } else {
        console.warn('Empty response body for:', url);
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new ApiError(response.status, 'Server returned non-JSON response');
    }

    if (!response.ok) {
      const message = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
      throw new ApiError(response.status, message, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network errors, timeout, etc.
    console.error('Network/Fetch Error:', error);
    throw new ApiError(0, 'Network error: Unable to connect to server');
  }
};

// Authenticated API call
export const authenticatedApiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new ApiError(401, 'No authentication token found');
  }

  return apiCall(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};
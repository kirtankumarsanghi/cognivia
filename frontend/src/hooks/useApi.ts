import { useAuth } from './useAuth';

const API_BASE_URL = 'http://localhost:5000/api';

export function useApi() {
  const { user } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (user) {
      headers.set('x-user-id', user.id);
      headers.set('x-user-role', user.role);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API request failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  };
}

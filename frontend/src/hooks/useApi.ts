import React from 'react';
import { useAuth } from './useAuth';
import { authService } from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useApi() {
  const { user } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const token = await authService.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body
      });
      
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `API Error: ${res.status}`;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.message) errMsg = errJson.message;
        } catch(e) {}
        throw new Error(errMsg);
      }
      
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e: any) {
      console.error(`API request failed for ${endpoint}:`, e.message);
      throw e;
    }
  };

  const api = React.useMemo(() => ({
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  }), [user]);

  return api;
}

// frontend/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

// Tell TypeScript that window.Clerk exists (injected by @clerk/nextjs)
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
      load?: () => Promise<void>;
    };
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wait for Clerk to fully load before getting token
const getClerkToken = async (): Promise<string | null> => {
  // Not in browser e.g SSR, no token needed
  if (typeof window === 'undefined') return null;

  // Clerk already loaded and session is ready, use it immediately
  if (window.Clerk?.session) {
    return await window.Clerk.session.getToken();
  }

  // Clerk not ready yet, poll every 100ms until it loads (max 5 seconds)
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50;

    const interval = setInterval(async () => {
      attempts++;

      if (window.Clerk?.session) {
        // Clerk is ready, get token and stop polling
        clearInterval(interval);
        const token = await window.Clerk.session.getToken();
        resolve(token);
        return;
      }

      // Timed out, user may not be logged in, continue without token
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
};

// Attach Clerk JWT token to every outgoing request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getClerkToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Could not attach Clerk token:', err);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('API Error:', {
      status,
      data,
      message: data?.message || error.message || 'Something went wrong',
    });
    return Promise.reject(error);
  }
);

export default api;
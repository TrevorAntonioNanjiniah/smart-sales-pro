import axios, { InternalAxiosRequestConfig } from 'axios';

// Tell TypeScript that window.Clerk exists (injected by @clerk/nextjs)
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Clerk JWT token to every outgoing request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (typeof window !== 'undefined' && window.Clerk?.session) {
        const token = await window.Clerk.session.getToken();
        console.log("Clerk token:", token); // Debug token

        if (token) {
          // Set Authorization header directly
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('Could not attach Clerk token:', err);
    }
    return config;
  },
  (error) => {
    // Catch request setup errors
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
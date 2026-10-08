import axios from 'axios';

// Same-origin by default (nginx in Docker, Vite proxy in dev). The session lives in an
// HTTP-only cookie, so nothing sensitive is ever stored in JavaScript-accessible storage.
console.log("API_URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Check your connection and try again.';
  if (err?.message === 'Network Error') return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
};

export const fieldErrors = (err) => err?.response?.data?.errors || {};

export const assetUrl = (path) => (!path ? '' : /^https?:\/\//.test(path) ? path : `${import.meta.env.VITE_ASSET_URL || ''}${path}`);

export default api;

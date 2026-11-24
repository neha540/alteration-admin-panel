import { adminDataService } from './adminDataService';

const LIVE_RENDER_API = 'https://alterations-connect-backend.onrender.com/api';
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : LIVE_RENDER_API);

export const studioService = {
  async getStudios(params = {}) {
    return adminDataService.getStudios(params);
  },

  async getStudioById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/studios/${id}`);
      const data = await res.json();
      if (res.ok && data.success && data.studio) {
        return data.studio;
      }
      return null;
    } catch {
      return null;
    }
  },

  async registerStudio(payload) {
    return adminDataService.registerStudio(payload);
  },

  async getSettings() {
    return adminDataService.getSettings();
  }
};

import type { GamesResponse, Game, AnalyticsData, ScraperStatus, QueryFilters } from '../types';


const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Cache helper to store API responses in memory for performance-first loading
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30000; // 30 seconds

const fetchWithCache = async (url: string, bypassCache = false) => {
  const now = Date.now();
  if (!bypassCache && cache.has(url)) {
    const cached = cache.get(url)!;
    if (now < cached.expiry) {
      return cached.data;
    }
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API fetch error: ${response.statusText}`);
  }
  const data = await response.json();
  cache.set(url, { data, expiry: now + CACHE_TTL });
  return data;
};

export const api = {
  getGames: async (filters: QueryFilters = {}): Promise<GamesResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val.toString());
      }
    });
    const url = `${BASE_URL}/games?${params.toString()}`;
    return fetchWithCache(url);
  },

  getBestDeals: async (): Promise<Game[]> => {
    const url = `${BASE_URL}/best-deals`;
    return fetchWithCache(url);
  },

  getGenres: async (): Promise<string[]> => {
    const url = `${BASE_URL}/genres`;
    return fetchWithCache(url);
  },

  getStores: async (): Promise<string[]> => {
    const url = `${BASE_URL}/stores`;
    return fetchWithCache(url);
  },

  getAnalytics: async (bypassCache = false): Promise<AnalyticsData> => {
    const url = `${BASE_URL}/analytics`;
    return fetchWithCache(url, bypassCache);
  },

  getRecommendations: async (genres?: string): Promise<Game[]> => {
    const url = `${BASE_URL}/recommendations${genres ? `?genres=${encodeURIComponent(genres)}` : ''}`;
    return fetchWithCache(url);
  },

  runScraper: async (): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${BASE_URL}/scrape/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('Failed to trigger scraper');
    }
    return response.json();
  },

  getScraperStatus: async (): Promise<ScraperStatus> => {
    const response = await fetch(`${BASE_URL}/scrape/status`);
    if (!response.ok) {
      throw new Error('Failed to get scraper status');
    }
    return response.json();
  },

  exportUrl: (format: 'csv' | 'excel'): string => {
    return `${BASE_URL}/export?format=${format}`;
  }
};

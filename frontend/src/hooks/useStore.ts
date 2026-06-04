import { create } from 'zustand';
import type { Game, QueryFilters } from '../types';


interface StoreState {
  wishlist: Game[];
  compareList: Game[];
  theme: 'dark' | 'light';
  view: 'landing' | 'dashboard' | 'analytics' | 'admin';
  filters: QueryFilters;
  toggleWishlist: (game: Game) => void;
  addToCompare: (game: Game) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setView: (view: 'landing' | 'dashboard' | 'analytics' | 'admin') => void;
  setFilters: (filters: Partial<QueryFilters> | ((prev: QueryFilters) => QueryFilters)) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: QueryFilters = {
  search: '',
  genre: '',
  store: '',
  max_price: 10000,
  min_discount: 0,
  min_rating: 0,
  deal_tier: '',
  sort_by: 'deal_score',
  sort_order: 'DESC',
  limit: 12,
  offset: 0,
};

export const useStore = create<StoreState>((set) => {
  // Load initial state from LocalStorage safely
  const initialWishlist = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('wishlist') || '[]')
    : [];
    
  const initialTheme = typeof window !== 'undefined'
    ? (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    : 'dark';

  // Apply dark/light class on boot
  if (typeof window !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    wishlist: initialWishlist,
    compareList: [],
    theme: initialTheme,
    view: 'landing',
    filters: DEFAULT_FILTERS,

    toggleWishlist: (game) => set((state) => {
      const exists = state.wishlist.some((item) => item.id === game.id);
      let updated;
      if (exists) {
        updated = state.wishlist.filter((item) => item.id !== game.id);
      } else {
        updated = [...state.wishlist, game];
      }
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return { wishlist: updated };
    }),

    addToCompare: (game) => set((state) => {
      // Don't add duplicates
      if (state.compareList.some((item) => item.id === game.id)) {
        return {};
      }
      // Max 3 games to compare
      if (state.compareList.length >= 3) {
        return { compareList: [...state.compareList.slice(1), game] };
      }
      return { compareList: [...state.compareList, game] };
    }),

    removeFromCompare: (id) => set((state) => ({
      compareList: state.compareList.filter((item) => item.id !== id)
    })),

    clearCompare: () => set({ compareList: [] }),

    setTheme: (theme) => set(() => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme };
    }),

    setView: (view) => set({ view }),

    setFilters: (update) => set((state) => {
      const nextFilters = typeof update === 'function' ? update(state.filters) : { ...state.filters, ...update };
      return { filters: nextFilters };
    }),

    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  };
});

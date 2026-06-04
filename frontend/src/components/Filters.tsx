import React from 'react';
import { useStore } from '../hooks/useStore';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';

const GENRES = ['Action', 'RPG', 'Horror', 'Adventure', 'Racing', 'Sports', 'Strategy', 'Multiplayer'];
const STORES = ['Steam', 'Epic Games', 'GOG', 'Ubisoft', 'EA'];
const TIERS = ['S', 'A', 'B', 'C'];

export const Filters: React.FC = () => {
  const { filters, setFilters, resetFilters, theme } = useStore();
  const isDark = theme === 'dark';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, offset: 0 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ max_price: Number(e.target.value), offset: 0 });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ min_discount: Number(e.target.value), offset: 0 });
  };

  const handleGenreToggle = (genre: string) => {
    const activeGenres = filters.genre ? filters.genre.split(',').filter(Boolean) : [];
    const index = activeGenres.indexOf(genre);
    if (index > -1) {
      activeGenres.splice(index, 1);
    } else {
      activeGenres.push(genre);
    }
    setFilters({ genre: activeGenres.join(','), offset: 0 });
  };

  const handleStoreToggle = (store: string) => {
    const activeStores = filters.store ? filters.store.split(',').filter(Boolean) : [];
    const index = activeStores.indexOf(store);
    if (index > -1) {
      activeStores.splice(index, 1);
    } else {
      activeStores.push(store);
    }
    setFilters({ store: activeStores.join(','), offset: 0 });
  };

  const handleTierToggle = (tier: string) => {
    const activeTiers = filters.deal_tier ? filters.deal_tier.split(',').filter(Boolean) : [];
    const index = activeTiers.indexOf(tier);
    if (index > -1) {
      activeTiers.splice(index, 1);
    } else {
      activeTiers.push(tier);
    }
    setFilters({ deal_tier: activeTiers.join(','), offset: 0 });
  };

  const handleRatingChange = (rating: number) => {
    setFilters({ min_rating: filters.min_rating === rating ? 0 : rating, offset: 0 });
  };

  const activeGenres = filters.genre ? filters.genre.split(',').filter(Boolean) : [];
  const activeStores = filters.store ? filters.store.split(',').filter(Boolean) : [];
  const activeTiers = filters.deal_tier ? filters.deal_tier.split(',').filter(Boolean) : [];

  return (
    <div className={`p-5 rounded-lg border h-full select-none flex flex-col space-y-6 
      ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-gray-800/40">
        <h3 className="font-orbitron font-bold uppercase tracking-wider flex items-center gap-2 text-sm md:text-base">
          <SlidersHorizontal className="w-4.5 h-4.5 text-cyber-blue" />
          Filter Control
        </h3>
        <button
          onClick={resetFilters}
          title="Reset Filters"
          className={`p-1.5 rounded transition-colors hover:bg-gray-800/30 text-gray-400 hover:text-cyber-blue`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Search Catalogue</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search by title..."
            className={`w-full pl-9 pr-8 py-2 text-sm rounded border focus:outline-none transition-all
              ${isDark 
                ? 'bg-cyber-dark border-gray-850 text-white placeholder-gray-500 focus:border-cyber-blue/60 focus:shadow-neon-blue/20' 
                : 'bg-white border-gray-300 text-cyber-dark placeholder-gray-400 focus:border-cyber-purple/60'}`}
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Deal Score Tiers */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deal Quality Tier</label>
        <div className="grid grid-cols-4 gap-2">
          {TIERS.map((tier) => {
            const isActive = activeTiers.includes(tier);
            const tierColors: Record<string, string> = {
              S: 'bg-gradient-to-r from-red-650 to-orange-550 border-red-500 text-red-500 text-glow-pink',
              A: 'bg-orange-500/20 border-orange-500 text-orange-400',
              B: 'bg-purple-500/20 border-purple-500 text-purple-400',
              C: 'bg-blue-500/20 border-blue-500 text-blue-400'
            };
            return (
              <button
                key={tier}
                onClick={() => handleTierToggle(tier)}
                className={`py-1.5 rounded border text-xs font-bold font-orbitron transition-all tracking-wider
                  ${isActive 
                    ? (isDark ? tierColors[tier] : 'bg-cyber-purple text-white border-cyber-purple') 
                    : (isDark ? 'bg-cyber-dark/40 border-gray-800 text-gray-400 hover:border-gray-700' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-450')}`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span>Max Price</span>
          <span className={`font-mono text-sm ${isDark ? 'text-cyber-blue text-glow-blue' : 'text-cyber-purple'}`}>
            ₹{filters.max_price === 10000 ? '10,000+' : filters.max_price}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={filters.max_price || 10000}
          onChange={handlePriceChange}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyber-blue bg-gray-800`}
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>₹0</span>
          <span>₹5,000</span>
          <span>₹10,000+</span>
        </div>
      </div>

      {/* Discount Percentage */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span>Min Discount</span>
          <span className={`font-mono text-sm ${isDark ? 'text-cyber-pink text-glow-pink' : 'text-cyber-pink'}`}>
            {filters.min_discount || 0}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={filters.min_discount || 0}
          onChange={handleDiscountChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyber-pink bg-gray-800"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>0%</span>
          <span>45%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Store Badges */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gaming Store</label>
        <div className="flex flex-wrap gap-2">
          {STORES.map((store) => {
            const isActive = activeStores.includes(store);
            return (
              <button
                key={store}
                onClick={() => handleStoreToggle(store)}
                className={`px-3 py-1.5 text-xs rounded border transition-all font-semibold
                  ${isActive 
                    ? (isDark ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue text-glow-blue' : 'bg-cyber-purple/15 border-cyber-purple text-cyber-purple') 
                    : (isDark ? 'bg-cyber-dark/40 border-gray-800 text-gray-400 hover:border-gray-700' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400')}`}
              >
                {store}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Genre</label>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((genre) => {
            const isActive = activeGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`py-1.5 px-2 text-[11px] text-left rounded border transition-all truncate font-medium
                  ${isActive 
                    ? (isDark ? 'bg-cyber-pink/15 border-cyber-pink text-cyber-pink text-glow-pink' : 'bg-cyber-pink/15 border-cyber-pink text-cyber-pink') 
                    : (isDark ? 'bg-cyber-dark/40 border-gray-850 text-gray-400 hover:border-gray-750' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400')}`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Star Ratings */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Min Rating</label>
        <div className="flex gap-2">
          {[3, 4, 4.5].map((stars) => {
            const isActive = filters.min_rating === stars;
            return (
              <button
                key={stars}
                onClick={() => handleRatingChange(stars)}
                className={`flex-1 py-1.5 rounded border text-xs font-mono transition-all font-semibold text-center
                  ${isActive 
                    ? (isDark ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-yellow-500/10 border-yellow-600 text-yellow-750') 
                    : (isDark ? 'bg-cyber-dark/40 border-gray-800 text-gray-400 hover:border-gray-700' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400')}`}
              >
                {stars}★+
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
export default Filters;

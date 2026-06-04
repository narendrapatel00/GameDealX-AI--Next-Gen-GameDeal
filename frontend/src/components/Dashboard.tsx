import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useStore } from '../hooks/useStore';
import Filters from './Filters';
import GameCard from './GameCard';
import { 
  Gamepad2, Percent, IndianRupee, Trophy, Flame, 
  ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, X, ShieldAlert 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { filters, setFilters, compareList, removeFromCompare, clearCompare, theme } = useStore();
  const isDark = theme === 'dark';

  // Fetch games based on active filters
  const { data: gamesData, isLoading: isGamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', filters],
    queryFn: () => api.getGames(filters),
    placeholderData: (previousData) => previousData, // keep old page while fetching next
    staleTime: 10000 // 10s
  });

  // Fetch overall statistics
  const { data: analyticsData } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => api.getAnalytics(),
    staleTime: 30000
  });

  const stats = analyticsData?.stats || {
    total_games: 0,
    total_deals: 0,
    avg_price: 0,
    max_discount: 0,
    max_rating: 0,
    best_rated_game: 'N/A'
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const currentOffset = filters.offset || 0;
    const limit = filters.limit || 12;
    if (direction === 'prev' && currentOffset > 0) {
      setFilters({ offset: Math.max(0, currentOffset - limit) });
    } else if (direction === 'next' && gamesData && currentOffset + limit < gamesData.total) {
      setFilters({ offset: currentOffset + limit });
    }
  };

  const handleSortChange = (sortBy: string) => {
    const currentOrder = filters.sort_order || 'DESC';
    const nextOrder = filters.sort_by === sortBy && currentOrder === 'DESC' ? 'ASC' : 'DESC';
    setFilters({ sort_by: sortBy, sort_order: nextOrder, offset: 0 });
  };

  // Pagination stats
  const totalGames = gamesData?.total || 0;
  const currentOffset = filters.offset || 0;
  const limit = filters.limit || 12;
  const currentPage = Math.floor(currentOffset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(totalGames / limit));

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Statistics Metric Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Games */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Games</span>
            <h4 className="text-xl md:text-2xl font-black font-mono leading-none">{stats.total_games}</h4>
          </div>
          <div className="p-2.5 rounded bg-cyber-blue/10 text-cyber-blue">
            <Gamepad2 className="w-5 h-5 text-glow-blue" />
          </div>
        </div>

        {/* Total Deals */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Deals</span>
            <h4 className="text-xl md:text-2xl font-black font-mono leading-none">{stats.total_deals}</h4>
          </div>
          <div className="p-2.5 rounded bg-cyber-pink/10 text-cyber-pink">
            <Flame className="w-5 h-5 text-glow-pink" />
          </div>
        </div>

        {/* Avg Price */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Price</span>
            <h4 className="text-xl md:text-2xl font-black font-mono leading-none">₹{Math.round(stats.avg_price)}</h4>
          </div>
          <div className="p-2.5 rounded bg-cyber-purple/10 text-cyber-purple">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Biggest Discount */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Max Discount</span>
            <h4 className="text-xl md:text-2xl font-black font-mono leading-none">{Math.round(stats.max_discount)}%</h4>
          </div>
          <div className="p-2.5 rounded bg-emerald-500/10 text-emerald-450">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Best Rated Game */}
        <div className={`col-span-2 md:col-span-1 p-4 rounded-xl border flex items-center justify-between shadow-sm
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="space-y-1 w-4/5">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Top Rated Title</span>
            <h4 className="text-sm font-black font-orbitron leading-tight truncate uppercase" title={stats.best_rated_game}>
              {stats.best_rated_game}
            </h4>
          </div>
          <div className="p-2.5 rounded bg-amber-500/10 text-amber-450">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Filters and Products Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-3">
          <Filters />
        </div>

        {/* Game Grid and Sorting Controls */}
        <div className="lg:col-span-9 flex flex-col space-y-6">
          
          {/* Sorting / Meta Header Panel */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4
            ${isDark ? 'glass-panel' : 'glass-panel-light'}`}>
            
            {/* Matches Found */}
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-orbitron">
              {isGamesLoading ? 'SYNCING CATALOG...' : `${totalGames} game matches found`}
            </span>

            {/* Sort Toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort By:</span>
              {[
                { label: 'Deal Score', key: 'deal_score' },
                { label: 'Price', key: 'current_price' },
                { label: 'Discount', key: 'discount_percent' },
                { label: 'Rating', key: 'rating' }
              ].map((opt) => {
                const isActive = filters.sort_by === opt.key;
                const order = filters.sort_order === 'DESC' ? '↓' : '↑';
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSortChange(opt.key)}
                    className={`px-3 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 transition-all
                      ${isActive 
                        ? (isDark ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue text-glow-blue' : 'bg-cyber-purple/15 border-cyber-purple text-cyber-purple') 
                        : (isDark ? 'bg-cyber-dark/40 border-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400')}`}
                  >
                    {opt.label}
                    {isActive ? (
                      <span className="font-mono text-[10px] font-bold">{order}</span>
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Games list grid with skeleton loader */}
          {isGamesLoading && !gamesData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`rounded-xl border aspect-[3/4] ${isDark ? 'skeleton' : 'skeleton-light'}`} />
              ))}
            </div>
          ) : gamesError ? (
            <div className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center space-y-3
              ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
              <ShieldAlert className="w-10 h-10 text-rose-500 animate-bounce" />
              <h3 className="font-orbitron font-extrabold uppercase text-base text-rose-500">API Pipeline Disrupted</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Ensure backend API is hosted at `http://localhost:5000` and database contains seeded entries.
              </p>
            </div>
          ) : gamesData?.games.length === 0 ? (
            <div className={`p-12 rounded-xl border text-center flex flex-col items-center justify-center space-y-2
              ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
              <RefreshCw className="w-10 h-10 text-cyber-blue opacity-50 mb-2 animate-spin" />
              <h3 className="font-orbitron font-bold uppercase text-sm">No Offers Found</h3>
              <p className="text-xs text-gray-500">
                Try widening your price range, toggling other stores, or clear search queries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesData?.games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 pt-4">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1 || isGamesLoading}
                className={`p-2 rounded border transition-all flex items-center gap-1.5 text-xs font-semibold
                  ${currentPage === 1 
                    ? 'bg-gray-800/20 border-gray-850 text-gray-650 cursor-not-allowed'
                    : (isDark ? 'bg-cyber-dark border-gray-800 text-gray-300 hover:text-cyber-blue' : 'bg-white border-gray-250 text-gray-600 hover:text-cyber-purple')}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <span className="font-mono text-xs font-bold">
                PAGE {currentPage} OF {totalPages}
              </span>

              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages || isGamesLoading}
                className={`p-2 rounded border transition-all flex items-center gap-1.5 text-xs font-semibold
                  ${currentPage === totalPages 
                    ? 'bg-gray-800/20 border-gray-850 text-gray-650 cursor-not-allowed'
                    : (isDark ? 'bg-cyber-dark border-gray-800 text-gray-300 hover:text-cyber-blue' : 'bg-white border-gray-250 text-gray-600 hover:text-cyber-purple')}`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Comparison Deck Drawer Panel (Glow elements, side-by-side compare) */}
      {compareList.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 border-t shadow-2xl transition-transform duration-300
          ${isDark ? 'bg-cyber-dark border-cyber-blue/20' : 'bg-white border-cyber-purple/20'}`}>
          
          <div className="max-w-7xl mx-auto flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800/20 pb-2">
              <h3 className="font-orbitron font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-pink animate-pulse" />
                Comparison Deck ({compareList.length}/3 games)
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={clearCompare}
                  className="text-[11px] font-semibold text-gray-400 hover:text-cyber-pink transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={clearCompare}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Compared Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {compareList.map((g) => (
                <div 
                  key={g.id}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs
                    ${isDark ? 'bg-black/35 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={g.image_url} 
                      alt={g.title} 
                      className="w-12 h-12 object-cover rounded border border-gray-800" 
                    />
                    <div className="space-y-1">
                      <h4 className="font-orbitron font-black uppercase text-[11px] truncate max-w-[120px]">{g.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyber-blue">₹{Math.round(g.current_price)}</span>
                        <span className="text-[10px] text-gray-500">({Math.round(g.discount_percent)}% OFF)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-orbitron bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/20">
                      Score: {Math.round(g.deal_score)}
                    </span>
                    <button
                      onClick={() => removeFromCompare(g.id)}
                      className="text-gray-500 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {compareList.length < 3 && (
                <div className={`col-span-1 border-2 border-dashed rounded-lg flex items-center justify-center p-4 text-xs text-gray-550
                  ${isDark ? 'border-gray-850' : 'border-gray-200'}`}>
                  Add {3 - compareList.length} more to compare
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
export default Dashboard;

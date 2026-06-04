import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import GameCard from './GameCard';
import { useStore } from '../hooks/useStore';
import { BrainCircuit, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIRecommendations: React.FC = () => {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [index, setIndex] = useState(0);

  // Fetch recommendations from API based on selected genre
  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['recommendations', selectedGenre],
    queryFn: () => api.getRecommendations(selectedGenre),
    staleTime: 60000 // 1 minute cache
  });

  const nextSlide = () => {
    if (recommendations.length <= 3) return;
    setIndex((prev) => (prev + 1) % (recommendations.length - 2));
  };

  const prevSlide = () => {
    if (recommendations.length <= 3) return;
    setIndex((prev) => (prev - 1 + (recommendations.length - 2)) % (recommendations.length - 2));
  };

  // Reset index when genre changes
  useEffect(() => {
    setIndex(0);
  }, [selectedGenre]);

  const genres = ['Action', 'RPG', 'Horror', 'Adventure', 'Strategy', 'Multiplayer'];

  return (
    <div className={`p-6 rounded-xl border flex flex-col space-y-6 select-none
      ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 text-cyber-blue">
            <BrainCircuit className="w-6 h-6 text-glow-blue animate-pulse" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold uppercase tracking-wide flex items-center gap-2 text-base md:text-lg">
              AI Recommendation Engine
              <span className="text-[10px] bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/35 px-1.5 py-0.5 rounded font-mono font-bold tracking-normal">
                BETA
              </span>
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Scoring algorithms analyzing discount parameters, ratings, and market popularity.
            </p>
          </div>
        </div>

        {/* Genre Switcher */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-all
              ${selectedGenre === '' 
                ? (isDark ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue text-glow-blue' : 'bg-cyber-purple/15 border-cyber-purple text-cyber-purple') 
                : (isDark ? 'bg-cyber-dark/45 border-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400')}`}
          >
            All Recommended
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-all
                ${selectedGenre === g 
                  ? (isDark ? 'bg-cyber-pink/15 border-cyber-pink text-cyber-pink text-glow-pink' : 'bg-cyber-pink/15 border-cyber-pink text-cyber-pink') 
                  : (isDark ? 'bg-cyber-dark/45 border-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-450')}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[320px]">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`rounded-xl border h-full w-full ${isDark ? 'skeleton' : 'skeleton-light'}`} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-red-500 font-semibold font-orbitron">COULD NOT LOAD RECOMMENDATIONS</p>
          <p className="text-xs text-gray-500">Ensure the backend API is active and loaded.</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <Sparkles className="w-8 h-8 opacity-40 mb-2 animate-bounce" />
          <p className="font-semibold font-orbitron">NO HIGH VALUE OFFERS FOUND</p>
          <p className="text-xs">Try adjusting genre filters or triggering a new scrape run.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Controls */}
          {recommendations.length > 3 && (
            <div className="absolute -top-12 right-0 flex gap-2">
              <button
                onClick={prevSlide}
                className={`p-1.5 rounded border transition-all 
                  ${isDark ? 'bg-cyber-dark border-gray-800 text-gray-400 hover:text-white' : 'bg-white border-gray-250 text-gray-650 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className={`p-1.5 rounded border transition-all 
                  ${isDark ? 'bg-cyber-dark border-gray-800 text-gray-400 hover:text-white' : 'bg-white border-gray-250 text-gray-650 hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cards Grid/Carousel */}
          <div className="overflow-hidden">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {recommendations
                  .slice(index, index + 3)
                  .map((game) => (
                    <motion.div
                      key={game.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIRecommendations;

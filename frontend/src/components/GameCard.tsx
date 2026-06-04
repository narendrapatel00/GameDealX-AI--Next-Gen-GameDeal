import React from 'react';
import { motion } from 'framer-motion';
import type { Game } from '../types';
import { useStore } from '../hooks/useStore';

import { Star, Plus, Minus, ExternalLink, ShoppingCart } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { wishlist, toggleWishlist, compareList, addToCompare, removeFromCompare, theme } = useStore();
  const isDark = theme === 'dark';

  const isWishlisted = wishlist.some((item) => item.id === game.id);
  const isCompared = compareList.some((item) => item.id === game.id);

  // Set colors based on Deal Tier
  const tierConfig = {
    S: {
      color: 'from-rose-600 to-pink-500',
      badge: 'bg-rose-500/20 border-rose-500 text-rose-400',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      text: 'text-rose-400'
    },
    A: {
      color: 'from-amber-600 to-orange-500',
      badge: 'bg-amber-500/20 border-amber-500 text-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      text: 'text-amber-400'
    },
    B: {
      color: 'from-violet-650 to-indigo-500',
      badge: 'bg-violet-500/20 border-violet-500 text-violet-400',
      glow: 'shadow-[0_0_10px_rgba(139,92,246,0.15)]',
      text: 'text-violet-400'
    },
    C: {
      color: 'from-blue-650 to-cyan-500',
      badge: 'bg-blue-500/20 border-blue-500 text-blue-400',
      glow: 'shadow-none',
      text: 'text-blue-400'
    }
  }[game.deal_tier] || {
    color: 'from-gray-600 to-gray-500',
    badge: 'bg-gray-500/20 border-gray-500 text-gray-400',
    glow: 'shadow-none',
    text: 'text-gray-400'
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(game.id);
    } else {
      addToCompare(game);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className={`group relative rounded-xl border overflow-hidden flex flex-col h-full transition-all duration-300
        ${isDark 
          ? `bg-cyber-card/75 border-gray-800/80 hover:border-cyber-blue/30 ${tierConfig.glow}` 
          : `bg-cyber-lightCard border-gray-200/85 hover:border-cyber-purple/30 shadow-md`}`}
    >
      {/* Decorative hover gradient border sweep for S-Tier items */}
      {game.deal_tier === 'S' && (
        <div className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-rose-500 via-transparent to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        <img
          src={game.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Shading Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-darker via-transparent to-transparent opacity-80" />

        {/* Store Badge */}
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-orbitron font-bold uppercase tracking-wider border
          ${isDark 
            ? 'bg-black/75 border-gray-800 text-cyber-blue text-glow-blue' 
            : 'bg-white/85 border-gray-300 text-cyber-purple'}`}
        >
          {game.store}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(game)}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors backdrop-blur-md border shadow-md active:scale-90
            ${isWishlisted 
              ? 'bg-yellow-500/25 border-yellow-500 text-yellow-400' 
              : (isDark ? 'bg-black/60 border-gray-800 text-gray-400 hover:text-white' : 'bg-white/80 border-gray-200 text-gray-500 hover:text-cyber-purple')}`}
        >
          <Star className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        {game.discount_percent > 0 && (
          <span className={`absolute bottom-3 right-3 px-2.5 py-1 rounded font-orbitron font-extrabold text-sm text-white bg-gradient-to-r ${tierConfig.color} shadow-md`}>
            -{Math.round(game.discount_percent)}%
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Genre & Rating */}
        <div className="flex justify-between items-center text-xs">
          <span className={`font-semibold tracking-wide uppercase px-2 py-0.5 rounded
            ${isDark ? 'bg-gray-850 text-gray-400' : 'bg-gray-150 text-gray-600'}`}>
            {game.genre}
          </span>
          <div className="flex items-center text-yellow-500 gap-1 font-mono font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {game.rating.toFixed(1)}
          </div>
        </div>

        {/* Title */}
        <h4 className={`text-base font-bold font-orbitron line-clamp-1 flex-grow select-none
          ${isDark ? 'text-white group-hover:text-cyber-blue' : 'text-cyber-dark group-hover:text-cyber-purple'} transition-colors duration-250`}>
          {game.title}
        </h4>

        {/* Prices & Deal Score Tier */}
        <div className="flex items-end justify-between pt-1 border-t border-gray-800/20">
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-cyber-dark'}`}>
                ₹{Math.round(game.current_price)}
              </span>
              {game.discount_percent > 0 && (
                <span className="text-xs font-semibold font-mono text-gray-505 line-through">
                  ₹{Math.round(game.original_price)}
                </span>
              )}
            </div>
          </div>

          {/* Deal Score quality badge */}
          <div className="flex flex-col items-end">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-orbitron border ${tierConfig.badge} shadow-sm`}>
              {game.deal_tier} TIER ({Math.round(game.deal_score)})
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer Button Drawer */}
      <div className={`grid grid-cols-2 border-t p-2 gap-2 text-center
        ${isDark ? 'border-gray-800/60 bg-black/10' : 'border-gray-155 bg-gray-50/50'}`}>
        
        {/* Compare Button */}
        <button
          onClick={handleCompareToggle}
          className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors
            ${isCompared
              ? 'bg-cyber-pink/15 text-cyber-pink hover:bg-cyber-pink/25'
              : (isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800/35' : 'text-gray-600 hover:text-cyber-purple hover:bg-gray-100')}`}
        >
          {isCompared ? (
            <>
              <Minus className="w-3.5 h-3.5" />
              Remove
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Compare
            </>
          )}
        </button>

        {/* Redirect Button */}
        <a
          href={game.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider font-orbitron text-white shadow transition-all duration-200
            ${isDark 
              ? 'bg-gradient-to-r from-cyber-blue/90 to-cyber-purple/90 hover:from-cyber-blue hover:to-cyber-purple active:scale-95' 
              : 'bg-gradient-to-r from-cyber-purple to-cyber-pink hover:opacity-95 active:scale-95'}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Buy
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      </div>
    </motion.div>
  );
};
export default GameCard;

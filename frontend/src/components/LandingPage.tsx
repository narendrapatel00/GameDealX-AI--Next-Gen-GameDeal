import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../hooks/useStore';
import Controller3D from './Controller3D';
import { Sparkles, ShieldCheck, Flame, Trophy, Play } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const setView = useStore((state) => state.setView);
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };


  return (
    <div className={`relative min-h-[92vh] flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden ${isDark ? 'bg-cyber-grid bg-cyber-darker' : 'bg-cyber-grid-light bg-cyber-light'}`}>
      
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-20" />
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-12 md:py-20 z-10">
        
        {/* Left Side: Copywriting Content */}
        <motion.div 
          className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Slogan Badge */}
          <motion.div 
            variants={itemVariants}
            className={`inline-flex items-center self-center lg:self-start px-3 py-1.5 rounded-full border text-xs font-orbitron font-semibold uppercase tracking-wider
              ${isDark 
                ? 'bg-cyber-blue/10 border-cyber-blue/40 text-cyber-blue text-glow-blue' 
                : 'bg-cyber-purple/10 border-cyber-purple/40 text-cyber-purple'}`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" />
            AI-Powered Price Analytics
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron leading-tight select-none
              ${isDark ? 'text-white' : 'text-cyber-dark'}`}
          >
            DISCOVER THE BEST <br className="hidden md:inline" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-cyber-blue via-cyber-purple to-cyber-pink' : 'from-cyber-purple to-cyber-pink'}`}>
              GAMING DEALS
            </span> <br />
            ACROSS THE WEB.
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className={`text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed
              ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Track price drops, compare discount metrics, and never overpay for your favorite titles again. Powered by real-time catalog scrapers and Deal Score AI.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <button
              onClick={() => setView('dashboard')}
              className={`group relative px-8 py-4 rounded-md font-orbitron font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95
                ${isDark 
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-cyber-darker hover:shadow-neon-blue' 
                  : 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white hover:shadow-neon-purple'}`}
            >
              {/* Button inner glow overlay */}
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                Explore Deals 
                <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-8 py-4 rounded-md font-orbitron font-semibold uppercase tracking-wider border transition-all duration-300
                ${isDark 
                  ? 'border-gray-800 text-gray-400 hover:border-cyber-blue hover:text-cyber-blue' 
                  : 'border-gray-300 text-gray-700 hover:border-cyber-purple hover:text-cyber-purple'}`}
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: 3D Animated Controller Visual */}
        <motion.div 
          className="lg:col-span-5 relative flex justify-center items-center h-[350px] md:h-[450px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          {/* Decorative frame backing */}
          <div className={`absolute inset-4 rounded-xl border opacity-5 pointer-events-none 
            ${isDark ? 'border-cyber-blue bg-cyber-blue/5' : 'border-cyber-purple bg-cyber-purple/5'}`} 
          />
          <Controller3D />
        </motion.div>
      </div>

      {/* Features Overview Cards Section */}
      <div id="features-section" className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-gray-800/40 mt-12 z-10">
        <div className={`p-6 rounded-lg border flex flex-col space-y-3 ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="p-3 rounded bg-cyber-blue/10 w-fit text-cyber-blue">
            <Flame className="w-6 h-6 text-glow-blue" />
          </div>
          <h3 className="text-lg font-bold font-orbitron uppercase">Deal Score AI</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Algorithmic evaluations scoring discount percentages, star ratings, and store popularity values into S/A/B/C tier ratings.
          </p>
        </div>

        <div className={`p-6 rounded-lg border flex flex-col space-y-3 ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="p-3 rounded bg-cyber-pink/10 w-fit text-cyber-pink">
            <ShieldCheck className="w-6 h-6 text-glow-pink" />
          </div>
          <h3 className="text-lg font-bold font-orbitron uppercase">Anti-inflation Engine</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Calculates raw historical deals to verify if discounts are genuine, filtering out artificial store price inflation.
          </p>
        </div>

        <div className={`p-6 rounded-lg border flex flex-col space-y-3 ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="p-3 rounded bg-cyber-purple/10 w-fit text-cyber-purple">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-orbitron uppercase">Multi-Store Scrapes</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Live scraping aggregations across major distribution centers: GOG, Steam, Epic Games, EA, and Ubisoft stores.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;

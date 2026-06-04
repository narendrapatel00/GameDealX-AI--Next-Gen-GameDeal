import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './hooks/useStore';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AdminPanel from './components/AdminPanel';
import AIRecommendations from './components/AIRecommendations';
import { 
  Tv, Database, BarChart2, Star, Gamepad2, 
  Sun, Moon, LayoutDashboard 
} from 'lucide-react';


const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { view, setView, theme, setTheme, wishlist } = useStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen flex flex-col transition-colors duration-300
        ${isDark ? 'bg-cyber-darker text-gray-150' : 'bg-cyber-light text-cyber-dark'}`}>
        
        {/* Unified Navigation Header Bar */}
        <header className={`sticky top-0 z-40 border-b select-none backdrop-blur-md transition-all
          ${isDark ? 'bg-cyber-darker/80 border-gray-800/60' : 'bg-white/80 border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => setView('landing')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className={`p-1.5 rounded bg-gradient-to-br ${isDark ? 'from-cyber-blue to-cyber-purple' : 'from-cyber-purple to-cyber-pink'} text-white`}>
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className={`font-orbitron font-extrabold text-lg uppercase tracking-widest
                ${isDark ? 'text-white group-hover:text-cyber-blue' : 'text-cyber-dark group-hover:text-cyber-purple'} transition-colors`}>
                GameDeal<span className="text-cyber-pink">X</span>
              </span>
            </div>

            {/* Nav Menu Links */}
            <nav className="hidden md:flex items-center gap-6">
              {[
                { name: 'Home', icon: Tv, id: 'landing' },
                { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
                { name: 'Analytics', icon: BarChart2, id: 'analytics' },
                { name: 'Ops Console', icon: Database, id: 'admin' },
              ].map((item) => {
                const isActive = view === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider font-orbitron transition-all
                      ${isActive 
                        ? (isDark ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 text-glow-blue' : 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20') 
                        : (isDark ? 'text-gray-450 hover:text-white' : 'text-gray-600 hover:text-cyber-purple')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Actions: Wishlist Indicator + Theme Switcher */}
            <div className="flex items-center gap-4">
              {/* Wishlist count indicator pill */}
              {wishlist.length > 0 && (
                <button 
                  onClick={() => setView('dashboard')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-bold font-mono tracking-tight
                    ${isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-750'}`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {wishlist.length}
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className={`p-2 rounded border transition-colors
                  ${isDark ? 'bg-cyber-dark border-gray-800 text-gray-450 hover:text-white' : 'bg-gray-100 border-gray-250 text-gray-650 hover:bg-gray-200'}`}
              >
                {isDark ? <Sun className="w-4 h-4 text-cyber-blue" /> : <Moon className="w-4 h-4 text-cyber-purple" />}
              </button>

              {/* Mobile Menu (just cycles views on mobile click to save screen estate) */}
              <button
                onClick={() => {
                  const viewsOrder = ['landing', 'dashboard', 'analytics', 'admin'];
                  const currentIndex = viewsOrder.indexOf(view);
                  const nextIndex = (currentIndex + 1) % viewsOrder.length;
                  setView(viewsOrder[nextIndex] as any);
                }}
                className={`md:hidden p-2 rounded border font-orbitron font-extrabold text-xs uppercase tracking-wide
                  ${isDark ? 'bg-cyber-dark border-gray-850 text-cyber-blue' : 'bg-gray-100 border-gray-250 text-cyber-purple'}`}
              >
                CYCLE_NAV
              </button>
            </div>
          </div>
        </header>

        {/* Main Route Content Switcher Wrapper */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === 'landing' && <LandingPage />}
          
          {view === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <Dashboard />
              {/* Inject AI suggestions block inside the dashboard context for seamless experience */}
              <AIRecommendations />
            </div>
          )}
          
          {view === 'analytics' && <Analytics />}
          
          {view === 'admin' && <AdminPanel />}
        </main>

        {/* Unified Cyber Footer */}
        <footer className={`border-t py-8 text-center select-none text-[11px] font-semibold uppercase tracking-wider transition-all
          ${isDark ? 'bg-black/40 border-gray-900 text-gray-550' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-orbitron font-medium">
              &copy; {new Date().getFullYear()} GameDealX AI. Project Alpha operations.
            </span>
            <div className="flex gap-6 font-mono font-bold">
              <span>Status: <span className="text-emerald-400">SYNC_OK</span></span>
              <span>Host: <span className="text-cyber-blue">LOC_5000</span></span>
            </div>
          </div>
        </footer>

      </div>
    </QueryClientProvider>
  );
};

export default App;

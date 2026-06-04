import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useStore } from '../hooks/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Landmark, PieChart as PieIcon } from 'lucide-react';


const COLORS_CYBER = ['#00f0ff', '#ff007f', '#9d4edd', '#ffb703', '#2a9d8f', '#e63946', '#a2d2ff'];

export const Analytics: React.FC = () => {
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';

  const { data, isLoading, error } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: () => api.getAnalytics(true),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
          <div className={`rounded-xl border ${isDark ? 'skeleton' : 'skeleton-light'}`} />
          <div className={`rounded-xl border ${isDark ? 'skeleton' : 'skeleton-light'}`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
          <div className={`rounded-xl border ${isDark ? 'skeleton' : 'skeleton-light'}`} />
          <div className={`rounded-xl border ${isDark ? 'skeleton' : 'skeleton-light'}`} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500 font-semibold font-orbitron">FAILED TO LOAD ANALYTICS MODEL</p>
        <p className="text-xs text-gray-500">Ensure the Flask backend database manager is accessible.</p>
      </div>
    );
  }

  const { genres, stores, price_distribution, discount_distribution } = data;


  // Custom tooltips to fit cyberpunk aesthetics
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider shadow-lg
          ${isDark ? 'bg-cyber-dark border-cyber-blue text-white' : 'bg-white border-cyber-purple text-cyber-dark'}`}>
          <p className="mb-1 border-b border-gray-700/35 pb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color || '#00f0ff' }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Overview Analytics Header Banner */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6
        ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
        <div>
          <h2 className="text-xl md:text-2xl font-black font-orbitron uppercase tracking-wide">Gaming Market Intelligence</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Aggregated dashboard charting global store discount pricing trends and catalog metrics.
          </p>
        </div>
        <div className={`px-4 py-2 border rounded font-mono font-bold text-xs uppercase tracking-widest
          ${isDark ? 'border-cyber-blue/30 text-cyber-blue text-glow-blue' : 'border-cyber-purple/35 text-cyber-purple'}`}>
          DB Engine Version: SQLite 3.x
        </div>
      </div>

      {/* Grid containing charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. Price Distribution (Bar Chart) */}
        <div className={`lg:col-span-7 p-5 rounded-xl border flex flex-col space-y-4
          ${isDark ? 'glass-panel' : 'glass-panel-light'}`}>
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <BarChart3 className="w-5 h-5 text-cyber-blue" />
            <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">Price Bracket Distribution</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={price_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e5f0'} />
                <XAxis dataKey="range" stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <YAxis stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Game Count" fill="#00f0ff" radius={[4, 4, 0, 0]}>
                  {price_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f0ff' : '#ff007f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Genre Distribution (Pie Chart) */}
        <div className={`lg:col-span-5 p-5 rounded-xl border flex flex-col space-y-4
          ${isDark ? 'glass-panel' : 'glass-panel-light'}`}>
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <PieIcon className="w-5 h-5 text-cyber-pink" />
            <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">Genre Share</h3>
          </div>
          <div className="h-72 w-full flex flex-col md:flex-row items-center justify-center">
            <div className="h-full w-full md:w-3/5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genres}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="genre"
                  >
                    {genres.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CYBER[index % COLORS_CYBER.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap md:flex-col items-start gap-2.5 max-h-40 overflow-y-auto md:w-2/5 px-2 text-[11px] font-semibold text-gray-400">
              {genres.slice(0, 7).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_CYBER[idx % COLORS_CYBER.length] }} />
                  <span className="truncate max-w-[85px] uppercase font-orbitron">{entry.genre} ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Discount Distribution Trend (Area Chart) */}
        <div className={`lg:col-span-6 p-5 rounded-xl border flex flex-col space-y-4
          ${isDark ? 'glass-panel' : 'glass-panel-light'}`}>
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <TrendingUp className="w-5 h-5 text-cyber-purple" />
            <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">Discount Intensity Range</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={discount_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9d4edd" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#9d4edd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e5f0'} />
                <XAxis dataKey="range" stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <YAxis stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Game Count" stroke="#9d4edd" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Store Distribution & Performance (Bar Chart comparing discount averages) */}
        <div className={`lg:col-span-6 p-5 rounded-xl border flex flex-col space-y-4
          ${isDark ? 'glass-panel' : 'glass-panel-light'}`}>
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <Landmark className="w-5 h-5 text-cyber-blue" />
            <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">Store Value Matrix</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a2e' : '#e5e5f0'} />
                <XAxis dataKey="store" stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <YAxis stroke={isDark ? '#888899' : '#555566'} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_discount" name="Avg Discount (%)" fill="#ff007f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="count" name="Games Found" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Analytics;

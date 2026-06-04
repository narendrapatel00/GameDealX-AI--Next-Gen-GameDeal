import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import { useStore } from '../hooks/useStore';
import { Play, Download, Terminal, Database, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import type { ScraperStatus } from '../types';


export const AdminPanel: React.FC = () => {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<ScraperStatus>({
    status: 'IDLE',
    last_run: null,
    games_scraped: 0,
    error: null,
    logs: []
  });
  const [triggering, setTriggering] = useState(false);
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Function to pull scraper status
  const fetchStatus = async () => {
    try {
      const data = await api.getScraperStatus();
      setStatus(data);
    } catch (e) {
      console.error('Failed to retrieve scraper logs/status:', e);
    }
  };

  // Poll status when scraper is running
  useEffect(() => {
    fetchStatus();
    
    let interval: number | undefined;
    if (status.status === 'RUNNING') {
      interval = window.setInterval(() => {
        fetchStatus();
      }, 2500); // Poll every 2.5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.status]);

  // Scroll logs terminal to bottom on updates
  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status.logs]);

  const handleRunScraper = async () => {
    setTriggering(true);
    try {
      await api.runScraper();
      // Set status to running immediately to kick off polling
      setStatus((prev) => ({ ...prev, status: 'RUNNING', logs: [...prev.logs, 'Triggering scraper runner...'] }));
    } catch (e: any) {
      alert(`Scraper trigger error: ${e.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const url = api.exportUrl(format);
    // Simple window open to trigger browser file download attachment
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Overview Block */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6
        ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black font-orbitron uppercase tracking-wide">Control Operations Console</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Trigger scraping operations, monitor parser logs, and export catalog tables.
          </p>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 border rounded text-xs font-mono font-bold uppercase tracking-wider
          border-emerald-500/20 text-emerald-400 bg-emerald-500/10">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
          SYSTEM_ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Scraper Controls and Database Sync */}
        <div className={`lg:col-span-4 p-5 rounded-xl border flex flex-col space-y-5
          ${isDark ? 'glass-panel text-white' : 'glass-panel-light text-cyber-dark'}`}>
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <Database className="w-5 h-5 text-cyber-blue" />
            <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">System Operations</h3>
          </div>

          {/* Current Status Metric */}
          <div className={`p-4 rounded border flex items-center justify-between
            ${isDark ? 'bg-cyber-dark border-gray-850' : 'bg-gray-100 border-gray-250'}`}>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Scraper Status</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-orbitron font-black uppercase tracking-wider flex items-center gap-1.5
              ${status.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35 animate-pulse' : ''}
              ${status.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35' : ''}
              ${status.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/35' : ''}
              ${status.status === 'IDLE' ? 'bg-gray-800/40 text-gray-400 border border-gray-700' : ''}
            `}>
              {status.status === 'RUNNING' && <RefreshCw className="w-3 h-3 animate-spin" />}
              {status.status}
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-gray-800/20 pb-2">
              <span className="text-gray-400">GAMES_FOUND:</span>
              <span className="font-bold">{status.games_scraped || 0}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800/20 pb-2">
              <span className="text-gray-400">LAST_RUN_DATETIME:</span>
              <span className="font-bold">{status.last_run ? new Date(status.last_run).toLocaleTimeString() : 'NEVER'}</span>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleRunScraper}
            disabled={status.status === 'RUNNING' || triggering}
            className={`w-full py-3 rounded font-orbitron font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
              ${status.status === 'RUNNING' || triggering
                ? 'bg-gray-800/50 text-gray-500 border border-gray-850 cursor-not-allowed'
                : (isDark 
                  ? 'bg-gradient-to-r from-cyber-blue/95 to-cyber-purple/95 hover:from-cyber-blue hover:to-cyber-purple hover:shadow-neon-blue text-cyber-darker active:scale-[0.98]'
                  : 'bg-gradient-to-r from-cyber-purple to-cyber-pink hover:opacity-95 text-white active:scale-[0.98]')}`}
          >
            {status.status === 'RUNNING' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Scraper...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Initialize Scraping
              </>
            )}
          </button>

          {/* Data Export Options */}
          <div className="border-t border-gray-800/40 pt-4 space-y-3">
            <h4 className="font-orbitron font-semibold uppercase tracking-wider text-xs text-gray-400">Backup & Export</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('csv')}
                className={`py-2 rounded border text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors
                  ${isDark ? 'bg-cyber-dark border-gray-800 text-gray-300 hover:border-cyber-blue hover:text-cyber-blue' : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-cyber-purple'}`}
              >
                <FileText className="w-4 h-4" />
                CSV Format
              </button>
              <button
                onClick={() => handleExport('excel')}
                className={`py-2 rounded border text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors
                  ${isDark ? 'bg-cyber-dark border-gray-800 text-gray-300 hover:border-cyber-blue hover:text-cyber-blue' : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-cyber-purple'}`}
              >
                <Download className="w-4 h-4" />
                EXCEL Format
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Scrolling Logs Terminal */}
        <div className="lg:col-span-8 flex flex-col h-[400px] border rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal Title Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono font-bold
            ${isDark ? 'bg-cyber-gray border-gray-800 text-gray-450' : 'bg-gray-200 border-gray-300 text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-blue" />
              <span>TERMINAL_LOGGER://scraper.log</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Terminal Output Logs */}
          <div className={`p-4 font-mono text-xs overflow-y-auto flex-grow space-y-2
            ${isDark ? 'bg-black text-emerald-450' : 'bg-gray-950 text-emerald-400'}`}>
            {status.logs.length === 0 ? (
              <div className="text-gray-600 italic select-none">
                No logs loaded. Initialize scraper or fetch logs...
              </div>
            ) : (
              status.logs.map((log, idx) => {
                let textCol = 'text-emerald-400';
                if (log.includes('[ERROR]') || log.includes('failed')) textCol = 'text-rose-500';
                if (log.includes('[WARNING]')) textCol = 'text-amber-500';
                return (
                  <div key={idx} className={`${textCol} break-all select-text`}>
                    <span className="text-gray-600">[{idx.toString().padStart(3, '0')}]</span> {log}
                  </div>
                );
              })
            )}
            <div ref={logTerminalEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminPanel;

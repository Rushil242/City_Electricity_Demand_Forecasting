import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, DownloadCloud, AlertCircle, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react';
import './index.css';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ModelComparison from './pages/ModelComparison';
import HistoricalData from './pages/HistoricalData';
import LandingPage from './pages/LandingPage';
import { ForecastProvider } from './hooks/ForecastContext';

type Page = 'dashboard' | 'analytics' | 'comparison' | 'history';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

interface SystemStatus {
  status: string;
  message: string;
  modelsLoaded: boolean;
  dataLoaded: boolean;
  timestamp: string;
}

interface AlertType {
  id: string;
  level: 'info' | 'warning' | 'critical' | 'error';
  message: string;
  timestamp: string;
}

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for System Health
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  
  // FIX: Separate 'Initial Loading' from 'Background Validation'
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [showAlerts, setShowAlerts] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'comparison', label: 'Model Comparison', icon: '⚡' },
    { id: 'history', label: 'Historical Data', icon: '📅' },
  ];

  // --- 1. OPTIMIZED HEALTH CHECK FUNCTION ---
  // We use useCallback so this function doesn't get recreated on every render
  const checkSystemHealth = useCallback(async (isBackgroundCheck = false) => {
    try {
      // Only show the full-screen spinner if this is the FIRST load
      if (!isBackgroundCheck) {
        setIsInitialLoading(true);
      }

      const response = await fetch(`${API_BASE_URL}/forecast/hourly`);

      if (response.ok) {
        if (!isBackgroundCheck) console.log('[App] Backend connected successfully');
        setSystemStatus({
          status: 'online',
          message: 'All systems operational',
          modelsLoaded: true,
          dataLoaded: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('[App] Health check failed:', error);
      setSystemStatus({
        status: 'offline',
        message: `Unable to connect to backend at ${API_BASE_URL}`,
        modelsLoaded: false,
        dataLoaded: false,
        timestamp: new Date().toISOString(),
      });
      
      // Only add a new alert if we aren't already flooded with them
      setAlerts((prev) => {
        const lastAlert = prev[prev.length - 1];
        // Prevent duplicate consecutive error messages
        if (lastAlert?.id === 'backend-error') return prev; 
        
        return [
          ...prev,
          {
            id: 'backend-error',
            level: 'error',
            message: `Backend Connection Failed at ${API_BASE_URL}`,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } finally {
      // Always turn off the initial loader after the first attempt finishes
      setIsInitialLoading(false);
    }
  }, []);

  // --- 2. EFFECT FOR HEALTH CHECKS ---
  useEffect(() => {
    // Do not run health checks while on Landing Page
    if (showLanding) return;

    // 1. Run immediately on mount (First Load)
    checkSystemHealth(false);

    // 2. Set up interval for background updates (Silent Check)
    const interval = setInterval(() => {
      checkSystemHealth(true); // Pass 'true' to skip the spinner
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [showLanding, checkSystemHealth]);

  // --- 3. EFFECT FOR ALERTS ---
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/alerts/check`);
        if (response.ok) {
          const data = await response.json();
          setAlerts((prev) => {
             // Basic de-duplication: only add if ID doesn't exist in last 5 alerts
             const existingIds = new Set(prev.slice(-5).map(a => a.id));
             const newAlerts = (data.alerts || []).filter((a: AlertType) => !existingIds.has(a.id));
             return [...prev.slice(-10), ...newAlerts]; // Keep last 10 only to save memory
          });
        }
      } catch (error) {
        // Silent fail for alerts to avoid console spam
      }
    };

    if (systemStatus?.status === 'online' && !showLanding) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [systemStatus?.status, showLanding]);


  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
  };

  const handleExportReport = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/data/historical?start=2021-08-01&end=2021-08-17`);
        if (response.ok) {
          const data = await response.json();
          const headers = Object.keys(data[0] || {});
          const csv = [
            headers.join(','),
            ...data.map((row: Record<string, unknown>) =>
              headers.map((h) => {
                const value = row[h];
                return typeof value === 'string' ? `"${value}"` : value;
              }).join(',')
            ),
          ].join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `forecast_report_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export report');
      }
  };

  const renderPage = () => {
    // --- THIS IS THE CRITICAL FIX ---
    // Only show the full screen loader if it is the INITIAL load.
    // If we are just polling in the background (isInitialLoading is false), 
    // we show the Dashboard (even if systemStatus goes offline briefly).
    
    if (isInitialLoading) {
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Establishing secure connection...</p>
            </div>
          </div>
        );
    }

    // If backend dies AFTER initial load, we show an error banner inside the dashboard
    // rather than replacing the whole screen.
    if (systemStatus?.status === 'offline') {
       // We still render the dashboard, but maybe with an overlay or just let the top banner handle it
       // allowing the user to still see stale data if they want.
    }

    switch (currentPage) {
        case 'dashboard':
          return <Dashboard apiBaseUrl={API_BASE_URL} />;
        case 'analytics':
          return <Analytics apiBaseUrl={API_BASE_URL} />;
        case 'comparison':
          return <ModelComparison apiBaseUrl={API_BASE_URL} />;
        case 'history':
          return <HistoricalData apiBaseUrl={API_BASE_URL} />;
        default:
          return <Dashboard apiBaseUrl={API_BASE_URL} />;
      }
  };

  // --- RENDER ---
  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <ForecastProvider apiBaseUrl={API_BASE_URL}>
      <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
        
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl z-20 flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2 min-w-0">
              {sidebarOpen && <span className="text-lg font-bold truncate tracking-wide">⚡ BESCOM</span>}
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-slate-700/50 rounded-lg flex-shrink-0 transition-colors" aria-label="Toggle sidebar">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav className="mt-6 space-y-1 px-3 flex-1">
            {navigationItems.map((item) => (
              <button key={item.id} onClick={() => handleNavigation(item.id as Page)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${currentPage === item.id ? 'bg-cyan-600/90 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`} title={item.label} aria-label={item.label}>
                <span className={`text-xl flex-shrink-0 transition-transform group-hover:scale-110 ${currentPage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`}>{item.icon}</span>
                {sidebarOpen && <span className="truncate font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${systemStatus?.status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               <div className="relative flex-shrink-0">
                  {systemStatus?.status === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
                  {systemStatus?.status === 'online' && <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>}
               </div>
               {sidebarOpen && (
                 <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-wider">{systemStatus?.status === 'online' ? 'System Online' : 'Offline'}</span>
                   <span className="text-[10px] opacity-70">Latency: 12ms</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
          {/* Header */}
          <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {navigationItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowAlerts(!showAlerts)} className={`relative p-2 rounded-lg transition-colors ${alerts.length > 0 ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400'}`} aria-label="Show alerts">
                  <AlertCircle size={24} />
                  {alerts.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">{Math.min(alerts.length, 9)}</span>}
                </button>

                {showAlerts && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100 ring-1 ring-black ring-opacity-5">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-sm text-gray-700">System Notifications</h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{alerts.length}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No new alerts</div>
                      ) : (
                        alerts.map((alert, idx) => (
                          <div key={idx} className={`p-4 border-b border-gray-50 text-sm flex gap-3 ${alert.level === 'critical' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${alert.level === 'critical' ? 'bg-red-500' : alert.level === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                            <div>
                               <p className="text-gray-800 font-medium">{alert.message}</p>
                               <p className="text-gray-400 text-xs mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleExportReport} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-sm hover:shadow-md">
                <DownloadCloud size={16} />
                <span>Export Data</span>
              </button>
            </div>
          </header>

          {/* Connection Error Banner (Non-Intrusive) */}
          {systemStatus?.status === 'offline' && !isInitialLoading && (
            <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-fade-in">
                <WifiOff size={16} />
                <span>Connection lost. Attempting to reconnect...</span>
            </div>
          )}

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6 relative">
            {renderPage()}
          </main>
        </div>
      </div>
    </ForecastProvider>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { Menu, X, DownloadCloud, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import './index.css';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ModelComparison from './pages/ModelComparison';
import HistoricalData from './pages/HistoricalData';
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
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'comparison', label: 'Model Comparison', icon: '⚡' },
    { id: 'history', label: 'Historical Data', icon: '📅' },
  ];

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        setStatusLoading(true);
        const response = await fetch(`${API_BASE_URL}/forecast/hourly`);

        if (response.ok) {
          console.log('[App] Backend connected successfully');
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
        setAlerts((prev) => [
          ...prev,
          {
            id: 'backend-error',
            level: 'error',
            message: `Backend Connection Failed at ${API_BASE_URL}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setStatusLoading(false);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/alerts/check`);
        if (response.ok) {
          const data = await response.json();
          setAlerts((prev) => [...prev.slice(-5), ...(data.alerts || [])]);
        }
      } catch (error) {
        console.error('[App] Failed to fetch alerts:', error);
      }
    };

    if (systemStatus?.status === 'online') {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [systemStatus?.status]);

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
    if (statusLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Connecting to backend...</p>
          </div>
        </div>
      );
    }

    if (systemStatus?.status !== 'online') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="bg-red-50 border-l-4 border-red-600 p-8 rounded max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900">Backend Connection Error</h3>
            <p className="text-red-800 mt-2 text-sm">Could not connect to Flask at {API_BASE_URL}</p>
          </div>
        </div>
      );
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

  return (
    <ForecastProvider apiBaseUrl={API_BASE_URL}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-lg overflow-hidden`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 min-w-0">
              {sidebarOpen && <span className="text-lg font-bold truncate">⚡ BESCOM</span>}
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded flex-shrink-0" aria-label="Toggle sidebar">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav className="mt-8 space-y-2 px-4">
            {navigationItems.map((item) => (
              <button key={item.id} onClick={() => handleNavigation(item.id as Page)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentPage === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-slate-700'}`} title={item.label} aria-label={item.label}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className={`text-xs px-3 py-2 rounded-lg ${systemStatus?.status === 'online' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${systemStatus?.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                {sidebarOpen && <span className="truncate">{systemStatus?.status === 'online' ? 'System Online' : 'Offline'}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-md px-8 py-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">BESCOM: Electricity Demand Forecasting</h1>
              <p className="text-sm text-gray-600 mt-1">ML-Powered Real-time System | Backend: {systemStatus?.status === 'online' ? '✅ Online' : '❌ Offline'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowAlerts(!showAlerts)} className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition" aria-label="Show alerts">
                  <AlertCircle size={24} />
                  {alerts.length > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{Math.min(alerts.length, 9)}</span>}
                </button>

                {showAlerts && alerts.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">Alerts ({alerts.length})</h3>
                    </div>
                    <div className="space-y-2 p-4">
                      {alerts.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded text-sm ${alert.level === 'critical' ? 'bg-red-50 text-red-800 border-l-4 border-red-600' : alert.level === 'warning' ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-600' : 'bg-blue-50 text-blue-800 border-l-4 border-blue-600'}`}>
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleExportReport} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" aria-label="Export report">
                <DownloadCloud size={18} />
                Export Report
              </button>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${systemStatus?.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {systemStatus?.status === 'online' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="font-medium text-sm">{systemStatus?.status === 'online' ? 'System Online' : 'Offline'}</span>
              </div>
            </div>
          </header>

          {/* Alert Banner */}
          {alerts.length > 0 && alerts[alerts.length - 1]?.level === 'critical' && (
            <div className="bg-red-50 border-b-4 border-red-600 px-8 py-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">{alerts[alerts.length - 1]?.message}</p>
              </div>
            </div>
          )}

          {/* Content Area */}
          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </ForecastProvider>
  );
};

export default App;
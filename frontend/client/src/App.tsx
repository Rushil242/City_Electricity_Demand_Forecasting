import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Activity, BrainCircuit, CheckCircle, Loader2 } from 'lucide-react';

// Your Flask API is running on this address
const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

// Define a type for our performance data (for TypeScript)
interface PerformanceData {
  fusion_mape?: number;
  xgboost_mape?: number;
  lstm_mape?: number;
}

// Define a type for our forecast data
interface ForecastData {
  timestamp: string;
  predicted_power: number;
  time: string; // for the chart
  power: number; // for the chart
}

export default function App() {
  const [performance, setPerformance] = useState<PerformanceData>({});
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Fetch the KPI card data when the page first loads
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setApiError(null);
        const response = await axios.get(`${API_BASE_URL}/model/performance`);
        setPerformance(response.data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setApiError("Failed to connect to backend. Is app.py running on port 8080?");
      }
    };
    fetchPerformance();
  }, []);

  // 2. Function to call the "heavy" forecast API
  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setApiError(null);
    setForecast([]); // Clear old forecast
    try {
      const response = await axios.get(`${API_BASE_URL}/forecast/hourly`);
      // Reformat data for the chart
      const chartData = response.data.map((item: any) => ({
        ...item,
        // Get just the "Hour" from the timestamp for a cleaner chart
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        power: item.predicted_power
      }));
      setForecast(chartData);
    } catch (error) {
      console.error("Error fetching hourly forecast:", error);
      setApiError("Failed to fetch forecast. Check backend `app.py` terminal for errors.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400" size={32} />
            <h1 className="text-2xl font-bold">BESCOM: Demand Forecasting Command Center</h1>
          </div>
          <span className="text-sm font-medium text-green-400 flex items-center gap-2">
            <CheckCircle size={16} /> System Online
          </span>
        </header>

        {/* API Error Message */}
        {apiError && (
          <div className="mt-4 p-4 bg-red-800 border border-red-600 text-white rounded-lg">
            <strong>Connection Error:</strong> {apiError}
          </div>
        )}

        {/* Main Content */}
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Controls & KPIs */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-slate-300">Model Performance (1-Hour)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <KpiCard
                title="Hybrid Fusion (Final Model)"
                value={`${performance.fusion_mape?.toFixed(2) || '...'} %`}
                icon={<BrainCircuit className="text-green-400" />}
              />
              <KpiCard
                title="XGBoost (Base Model)"
                value={`${performance.xgboost_mape?.toFixed(2) || '...'} %`}
                icon={<Activity className="text-orange-400" />}
              />
              <KpiCard
                title="LSTM (Base Model)"
                value={`${performance.lstm_mape?.toFixed(2) || '...'} %`}
                icon={<Activity className="text-blue-400" />}
              />
            </div>
          </div>

          {/* Right Column: Forecast & Analysis */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Forecast Chart */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-slate-300">24-Hour Forecast</h2>
                <button
                  onClick={handleGenerateForecast}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-500 disabled:bg-slate-500"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Zap size={20} />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Forecast'}
                </button>
              </div>

              {/* Chart Area */}
              <div style={{ width: '100%', height: 400 }}>
                {isLoading && (
                  <div className="flex justify-center items-center h-full text-slate-400">
                    <Loader2 className="animate-spin mr-2" />
                    <span>Running hybrid model... this may take up to a minute.</span>
                  </div>
                )}
                {!isLoading && forecast.length === 0 && !apiError && (
                  <div className="flex justify-center items-center h-full text-slate-400">
                    <span>Click "Generate Forecast" to see results.</span>
                  </div>
                )}
                {forecast.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={['dataMin - 50', 'dataMax + 50']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="power" stroke="#38bdf8" strokeWidth={2} name="Predicted Power (Phase3_power)" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Model Proof Section */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold text-slate-300 mb-4">Model Performance Analysis</h2>
              <p className="text-slate-400 mb-4">
                This plot from our final report proves the hybrid fusion model (red) is more accurate and tracks the actual data (blue) better than the two base models (XGBoost/LSTM) alone.
              </p>
              <img
                src={`${API_BASE_URL}/static/plots/fusion_model_prediction.png`}
                alt="Fusion model performance"
                className="rounded-lg border border-slate-700"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// A simple reusable component for the KPI cards
function KpiCard({ title, value, icon }: {title: string, value: string, icon: React.ReactNode}) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="bg-slate-900 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
}

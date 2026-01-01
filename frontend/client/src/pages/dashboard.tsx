import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Zap, Clock, Loader } from 'lucide-react';
import { useForecast } from '../hooks/ForecastContext';

interface Props {
  apiBaseUrl: string;
}

const Dashboard: React.FC<Props> = ({ apiBaseUrl }) => {
  const { forecastData, modelPerformance, loading, error } = useForecast();
  const [forecastChartData, setForecastChartData] = useState<any[]>([]);
  const [modelStats, setModelStats] = useState<any>(null);

  useEffect(() => {
    // Transform forecast data for charts
    if (forecastData && forecastData.length > 0) {
      const transformed = forecastData.map((item, index) => ({
        hour: `${String(index).padStart(2, '0')}:00`,
        predicted: item.predicted_power || 0,
        timestamp: item.timestamp,
      }));
      setForecastChartData(transformed);
    }
  }, [forecastData]);

  useEffect(() => {
    // Set model statistics
    if (modelPerformance) {
      setModelStats(modelPerformance);
    }
  }, [modelPerformance]);

  const metrics = [
    {
      title: 'Current Demand',
      value: forecastData.length > 0 ? Math.round(forecastData[0]?.predicted_power || 0) : 'N/A',
      unit: 'kW',
      icon: <Zap className="w-6 h-6" />,
      trend: 5.2,
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Peak Forecast',
      value: forecastData.length > 0 ? Math.round(Math.max(...forecastData.map((d: any) => d.predicted_power || 0))) : 'N/A',
      unit: 'kW',
      icon: <TrendingUp className="w-6 h-6" />,
      trend: 2.8,
      bgColor: 'bg-orange-50 border-orange-200',
    },
    {
      title: 'Model Accuracy',
      value: modelStats?.['Hybrid Fusion']?.Accuracy?.toFixed(2) || 'N/A',
      unit: '%',
      icon: <AlertCircle className="w-6 h-6" />,
      trend: 1.5,
      bgColor: 'bg-green-50 border-green-200',
    },
    {
      title: 'Forecast Error (MAPE)',
      value: modelStats?.['Hybrid Fusion']?.MAPE?.toFixed(2) || 'N/A',
      unit: '%',
      icon: <Clock className="w-6 h-6" />,
      trend: -3.2,
      bgColor: 'bg-purple-50 border-purple-200',
    },
  ];

  const peakOffPeakData = [
    { name: 'Peak Hours (18-23)', value: 65, fill: '#ef4444' },
    { name: 'Off-Peak Hours (23-06)', value: 25, fill: '#3b82f6' },
    { name: 'Semi-Peak (06-18)', value: 10, fill: '#f59e0b' },
  ];

  const modelComparison = Object.entries(modelStats || {}).map(([name, stats]: [string, any]) => ({
    name,
    mape: stats.MAPE,
    mae: stats.MAE,
    rmse: stats.RMSE,
  }));

  if (loading && forecastData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <p className="text-sm text-red-800"><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`${metric.bgColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metric.value}
                  <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
                </p>
              </div>
              <div className="text-blue-600">{metric.icon}</div>
            </div>
            <div className={`mt-4 text-sm ${metric.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}% from previous
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Forecast Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">24-Hour Forecast</h2>
            <span className="text-xs text-gray-500">
              {forecastData.length > 0 ? `${forecastData.length} hours` : 'No data'}
            </span>
          </div>
          {forecastChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastChartData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="predicted" stroke="#10b981" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted Demand (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded">
              <p className="text-gray-500">No forecast data available</p>
            </div>
          )}
        </div>

        {/* Peak vs Off-Peak Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Demand Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={peakOffPeakData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {peakOffPeakData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Model Performance Metrics</h3>
        {modelComparison.length > 0 ? (
          <div className="space-y-4">
            {modelComparison.map((model, idx) => (
              <div key={idx} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{model.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    idx === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {idx === 0 ? 'BEST' : `#${idx + 1}`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">MAPE:</span>
                    <p className="font-bold text-gray-900">{model.mape.toFixed(2)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">MAE:</span>
                    <p className="font-bold text-gray-900">{model.mae.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">RMSE:</span>
                    <p className="font-bold text-gray-900">{model.rmse.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Loading model performance...</p>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-yellow-800">Forecast Alert</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Forecast data is being continuously updated. Peak demand prediction available in the next update cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

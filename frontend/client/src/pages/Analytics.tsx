import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';

interface Props {
  apiBaseUrl: string;
}

const Analytics: React.FC<Props> = ({ apiBaseUrl }) => {
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hourly pattern
        const hourlyRes = await fetch(`${apiBaseUrl}/analytics/hourly-pattern`);
        if (!hourlyRes.ok) throw new Error('Failed to fetch hourly pattern');
        const hourlyData = await hourlyRes.json();
        setHourlyData(hourlyData);

        // Fetch weekly trend
        const weeklyRes = await fetch(`${apiBaseUrl}/analytics/weekly-trend`);
        if (!weeklyRes.ok) throw new Error('Failed to fetch weekly trend');
        const weeklyData = await weeklyRes.json();
        setWeeklyData(weeklyData);

        // Fetch performance trend
        const perfRes = await fetch(`${apiBaseUrl}/analytics/performance-trend`);
        if (!perfRes.ok) throw new Error('Failed to fetch performance trend');
        const perfData = await perfRes.json();
        setPerformanceData(perfData);

        console.log('✓ Analytics data loaded');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(errorMsg);
        console.error('[Analytics] Error:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
        <p className="text-red-800"><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {/* Hourly Pattern */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Hourly Demand Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="average_demand" fill="#3b82f6" name="Avg Demand (kW)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Demand Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="average_demand" stroke="#10b981" name="Avg Demand (kW)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Model Performance Trend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceData.map((day, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <p className="text-sm font-bold text-gray-600 mb-3">{day.date}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Hybrid Fusion</span>
                  <p className="text-lg font-bold text-green-600">MAPE: {day.Hybrid.MAPE}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">XGBoost</span>
                  <p className="text-lg font-bold text-blue-600">MAPE: {day.XGBoost.MAPE}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">LSTM</span>
                  <p className="text-lg font-bold text-orange-600">MAPE: {day.LSTM.MAPE}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-blue-800">
          Analytics dashboard showing hourly patterns, weekly trends, and model performance metrics.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
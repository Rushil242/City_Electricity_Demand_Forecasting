import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface Props {
  apiBaseUrl: string;
}

interface ModelMetrics {
  MAPE: number;
  MAE: number;
  RMSE: number;
  Accuracy: number;
}

interface PerformanceData {
  [key: string]: ModelMetrics;
}

const ModelComparison: React.FC<Props> = ({ apiBaseUrl }) => {
  const [metrics, setMetrics] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBaseUrl}/forecast/metrics`);
        if (!response.ok) throw new Error('Failed to fetch model metrics');
        const data = await response.json();
        setMetrics(data);
        console.log('✓ Model metrics loaded');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load model metrics';
        setError(errorMsg);
        console.error('[ModelComparison] Error:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading model comparison...</p>
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

  if (!metrics) {
    return <div className="text-gray-500">No metrics available</div>;
  }

  const models = [
    { name: 'XGBoost', key: 'XGBoost', color: 'blue' },
    { name: 'LSTM', key: 'LSTM', color: 'orange' },
    { name: 'Hybrid Fusion', key: 'Hybrid Fusion', color: 'green', isBest: true },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Model Comparison</h2>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => {
          const modelMetrics = metrics[model.key];
          if (!modelMetrics) return null;

          const colorClasses = {
            blue: 'border-blue-500 bg-blue-50',
            orange: 'border-orange-500 bg-orange-50',
            green: 'border-green-500 bg-green-50',
          };

          return (
            <div
              key={model.key}
              className={`border-2 ${colorClasses[model.color as keyof typeof colorClasses]} rounded-lg p-6 shadow-md`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{model.name}</h3>
                {model.isBest && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    BEST
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">MAPE (Mean Absolute % Error)</p>
                  <p className="text-2xl font-bold text-gray-900">{modelMetrics.MAPE.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">Lower is better</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">MAE (Mean Absolute Error)</p>
                  <p className="text-2xl font-bold text-gray-900">{modelMetrics.MAE.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">RMSE (Root Mean Squared Error)</p>
                  <p className="text-2xl font-bold text-gray-900">{modelMetrics.RMSE.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{modelMetrics.Accuracy.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">Higher is better</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium text-gray-900">Best MAPE:</span>
            <span className="font-bold text-green-600">{Math.min(
              metrics['XGBoost']?.MAPE || Infinity,
              metrics['LSTM']?.MAPE || Infinity,
              metrics['Hybrid Fusion']?.MAPE || Infinity
            ).toFixed(2)}%</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium text-gray-900">Best Accuracy:</span>
            <span className="font-bold text-green-600">{Math.max(
              metrics['XGBoost']?.Accuracy || 0,
              metrics['LSTM']?.Accuracy || 0,
              metrics['Hybrid Fusion']?.Accuracy || 0
            ).toFixed(2)}%</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 rounded border-l-4 border-green-600">
            <span className="font-medium text-gray-900">Recommended Model:</span>
            <span className="font-bold text-green-600">Hybrid Fusion</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-blue-800">
          Hybrid Fusion model combines XGBoost and LSTM predictions for optimal forecasting accuracy.
        </p>
      </div>
    </div>
  );
};

export default ModelComparison;
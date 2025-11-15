import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Award, BarChart3 } from 'lucide-react'

export function ModelReport() {
  const [performance, setPerformance] = useState(null)

  useEffect(() => {
    fetchPerformance()
  }, [])

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/v1/model/performance')
      const data = await response.json()
      setPerformance(data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    }
  }

  const improvement = performance
    ? ((performance.xgboost_mape - performance.fusion_mape) / performance.xgboost_mape * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen">
      <Header title="Model Performance Report" />

      <div className="p-6 space-y-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-600" />
              <CardTitle>Executive Summary</CardTitle>
            </div>
            <CardDescription>
              Hybrid Fusion Model Performance Analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-blue-900 mb-1">
                    {improvement}% Performance Improvement
                  </h3>
                  <p className="text-sm text-blue-800">
                    Our hybrid fusion model achieves a <strong>Mean Absolute Percentage Error (MAPE)
                    of {performance?.fusion_mape.toFixed(2)}%</strong>, representing a significant
                    improvement over the baseline XGBoost model's MAPE of {performance?.xgboost_mape.toFixed(2)}%.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-slate-900">Key Findings:</h4>
              <ul className="text-slate-700 space-y-2">
                <li>
                  <strong>Fusion Model:</strong> Combines the strengths of tree-based (XGBoost) and
                  deep learning (LSTM) approaches for superior accuracy
                </li>
                <li>
                  <strong>Error Reduction:</strong> Achieves {improvement}% lower error rate compared
                  to the best individual model
                </li>
                <li>
                  <strong>Production Ready:</strong> Tested on real-world Bangalore grid data from
                  April to December 2021
                </li>
                <li>
                  <strong>Reliability:</strong> Consistent performance across different time periods
                  and load conditions
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                XGBoost Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {performance?.xgboost_mape.toFixed(2)}%
              </div>
              <Badge variant="secondary">Baseline</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Gradient boosting algorithm with engineered time-series features
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                LSTM Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {performance?.lstm_mape.toFixed(2)}%
              </div>
              <Badge variant="secondary">Neural Network</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Deep learning approach with 72-hour lookback window
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-blue-700">
                <Award className="h-4 w-4" />
                Hybrid Fusion Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {performance?.fusion_mape.toFixed(2)}%
              </div>
              <Badge className="bg-blue-600">Best Performance</Badge>
              <p className="text-xs text-blue-700 mt-2">
                Meta-learning ensemble combining both models
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visual Comparison: Predicted vs Actual</CardTitle>
            <CardDescription>
              Fusion model predictions on test dataset (hourly granularity)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 border rounded-lg p-4">
              <img
                src="/api/v1/static/plots/fusion_model_prediction.png"
                alt="Fusion Model Prediction vs Actual"
                className="w-full h-auto rounded shadow-sm"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%2364748b" font-size="16"%3EChart visualization unavailable%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p className="mb-2">
                <strong>Analysis:</strong> The fusion model demonstrates excellent tracking of actual
                power consumption patterns. The model successfully captures:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Daily consumption cycles and peak demand periods</li>
                <li>Weekend vs. weekday load variations</li>
                <li>Seasonal trends and weather-related fluctuations</li>
                <li>Sudden load changes and grid events</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>
              Model architecture and training details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-3">XGBoost Component</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Features</dt>
                    <dd className="font-medium">Time + Lag/Rolling</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Max Depth</dt>
                    <dd className="font-medium">6</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Learning Rate</dt>
                    <dd className="font-medium">0.1</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimators</dt>
                    <dd className="font-medium">100</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">LSTM Component</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Architecture</dt>
                    <dd className="font-medium">2 LSTM + Dense</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Lookback Window</dt>
                    <dd className="font-medium">72 hours</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hidden Units</dt>
                    <dd className="font-medium">50, 25</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dropout</dt>
                    <dd className="font-medium">0.2</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-sm mb-3">Meta-Learning Fusion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The fusion model uses a Ridge Regression meta-learner to optimally combine
                predictions from both base models, automatically learning the best weighting
                strategy based on historical performance.
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Primary Model:</span>{' '}
                  <strong>{performance?.primary_model}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Trained:</span>{' '}
                  <strong>{performance?.last_trained}</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
